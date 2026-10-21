import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Scene } from './components/Scene';
import { FallbackInvitation } from './components/FallbackInvitation';
import { Navigation } from './components/Navigation';
import { Scene1Overlay } from './components/PalaceEntrance';
import { Scene2Overlay } from './components/InvitationCard';
import { Scene3Overlay } from './components/CoupleReveal';
import { Scene4Overlay } from './components/EventCards';
import { Scene5Overlay } from './components/VenueRSVP';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useDeviceTier } from './hooks/usePerformance';
import { useMasterTimeline } from './hooks/useMasterTimeline';
import { royalAudio } from './utils/audio';

function checkWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export function App() {
  const [hasWebGL]          = useState<boolean>(() => checkWebGL());
  const [force2D, setForce2D] = useState(false);
  const [isPalaceDoorOpen, setIsPalaceDoorOpen]   = useState(false);
  const [areGatesFullyOpen, setAreGatesFullyOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying]       = useState(false);
  const [showMusicNudge, setShowMusicNudge]       = useState(false);

  const reducedMotion = useReducedMotion();
  const deviceTier    = useDeviceTier();

  // ── Palace door callbacks ──
  const openPalaceDoor       = useCallback(() => setIsPalaceDoorOpen(true), []);
  const handleGatesFullyOpen = useCallback(() => setAreGatesFullyOpen(true), []);
  const handleReplay         = useCallback(() => {
    setIsPalaceDoorOpen(false);
    setAreGatesFullyOpen(false);
  }, []);

  // ── Master auto-play timeline ──
  const { currentScene, isPlaying, progressPercent, pause, resume, replay, skipIntro, goToScene } =
    useMasterTimeline({
      reducedMotion,
      onSceneChange: useCallback((_s: number) => {}, []),
      onPalaceDoorOpen: openPalaceDoor,
      onReplay: handleReplay,
    });

  // ── Audio: attempt playback immediately on mount, show prompt if blocked by browser policy ──
  const audioStarted = useRef(false);
  useEffect(() => {
    if (audioStarted.current) return;
    audioStarted.current = true;
    (async () => {
      const ok = await royalAudio.tryAutoplay();
      setIsAudioPlaying(ok);
      if (!ok) {
        setShowMusicNudge(true);
      }
    })();
  }, []);

  const enableAudio = useCallback(async () => {
    setShowMusicNudge(false);
    if (!royalAudio.getIsPlaying()) {
      await royalAudio.start();
      setIsAudioPlaying(true);
    }
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToScene(currentScene + 1);
      else if (e.key === 'ArrowLeft') goToScene(Math.max(0, currentScene - 1));
      else if (e.key === ' ') {
        e.preventDefault();
        isPlaying ? pause() : resume();
      } else if (e.key === 'r' || e.key === 'R') {
        replay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentScene, isPlaying, pause, resume, goToScene, replay]);

  // ── Touch swipe navigation (active on scenes 0, 1, 2; disabled during scroll on 3 & 4) ──
  const tx = useRef<number | null>(null);
  const ty = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    tx.current = e.touches[0].clientX;
    ty.current = e.touches[0].clientY;
    // Any user touch unlocks audio if still blocked by browser policy
    if (!audioStarted.current || !royalAudio.getIsPlaying()) {
      enableAudio();
    }
  }, [enableAudio]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (tx.current === null || ty.current === null) return;
    // Do not trigger horizontal swipe on scrolling scenes 3 (Events) or 4 (Venue/RSVP)
    if (currentScene === 3 || currentScene === 4) {
      tx.current = null;
      ty.current = null;
      return;
    }
    const dx = tx.current - e.changedTouches[0].clientX;
    const dy = ty.current - e.changedTouches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 48) {
      if (dx > 0) {
        if (currentScene === 0 && !isPalaceDoorOpen) openPalaceDoor();
        else goToScene(currentScene + 1);
      } else {
        goToScene(Math.max(0, currentScene - 1));
      }
    }
    tx.current = null;
    ty.current = null;
  }, [currentScene, isPalaceDoorOpen, openPalaceDoor, goToScene]);

  // Unlock audio on any guest click
  const onTap = useCallback(() => {
    if (!royalAudio.getIsPlaying()) {
      enableAudio();
    }
  }, [enableAudio]);

  if (!hasWebGL || force2D) {
    return <FallbackInvitation hasWebGL={hasWebGL} onToggle3D={() => setForce2D(false)} />;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        background: '#160B10',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onTap}
    >
      {/* ── 3D Canvas Scene ── */}
      <Scene
        currentScene={currentScene}
        isPalaceDoorOpen={isPalaceDoorOpen}
        onOpenPalaceDoor={openPalaceDoor}
        onGatesFullyOpen={handleGatesFullyOpen}
        reducedMotion={reducedMotion}
        tier={deviceTier}
      />

      {/* ── Per-Scene HTML Overlays (Full-Screen, Mobile-Optimized) ── */}
      {currentScene === 0 && (
        <Scene1Overlay
          isOpen={isPalaceDoorOpen}
          areGatesFullyOpen={areGatesFullyOpen}
          onOpen={openPalaceDoor}
        />
      )}
      <Scene2Overlay visible={currentScene === 1} />
      <Scene3Overlay visible={currentScene === 2} />
      <Scene4Overlay
        visible={currentScene === 3}
        onPauseTimeline={pause}
        onResumeTimeline={resume}
      />
      <Scene5Overlay
        visible={currentScene === 4}
        onPauseTimeline={pause}
        onResumeTimeline={resume}
      />

      {/* ── Exactly Three Playback Controls (Previous, Pause/Play, Next) ── */}
      <Navigation
        currentScene={currentScene}
        totalScenes={5}
        isPlaying={isPlaying}
        progressPercent={progressPercent}
        onPrev={() => goToScene(Math.max(0, currentScene - 1))}
        onNext={() => goToScene(currentScene + 1)}
        onPause={pause}
        onResume={resume}
        onReplay={replay}
        onSelectScene={goToScene}
        onSkipIntro={skipIntro}
        isAudioPlaying={isAudioPlaying}
      />

      {/* ── Minimal One-Tap Action to Enable Wedding Music (if autoplay blocked by mobile browser) ── */}
      {showMusicNudge && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            enableAudio();
          }}
          style={{
            position: 'fixed',
            bottom: 'clamp(82px, 16vw, 104px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 55,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 22px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, rgba(87,13,32,0.92) 0%, rgba(22,11,16,0.96) 100%)',
            border: '1.5px solid rgba(242,220,168,0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.65), 0 0 16px rgba(212,175,101,0.3)',
            animation: 'softFloat 4s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: '20px' }}>🎵</span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.82rem, 2.5vw, 0.94rem)',
              color: '#FFF5E6',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            Tap to enable wedding music
          </span>
        </div>
      )}
    </div>
  );
}

export default App;

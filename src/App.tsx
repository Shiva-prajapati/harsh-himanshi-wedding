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

  // ── 3D Book Page Turn State ──
  const [activeScene, setActiveScene] = useState(0);
  const [pageTurn, setPageTurn] = useState<{
    outgoing: number;
    incoming: number;
    direction: 'next' | 'prev';
  } | null>(null);
  const isTurningRef = useRef(false);
  const turnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reducedMotion = useReducedMotion();
  const deviceTier    = useDeviceTier();

  // ── Palace door callbacks ──
  const openPalaceDoor       = useCallback(() => setIsPalaceDoorOpen(true), []);
  const handleGatesFullyOpen = useCallback(() => setAreGatesFullyOpen(true), []);
  const handleReplay         = useCallback(() => {
    setIsPalaceDoorOpen(false);
    setAreGatesFullyOpen(false);
    setActiveScene(0);
    setPageTurn(null);
    isTurningRef.current = false;
  }, []);

  // ── Master auto-play timeline ──
  const { currentScene, isPlaying, progressPercent, pause, resume, replay, skipIntro, goToScene } =
    useMasterTimeline({
      reducedMotion,
      onSceneChange: useCallback((_s: number) => {}, []),
      onPalaceDoorOpen: openPalaceDoor,
      onReplay: handleReplay,
    });

  // ── Book Page Turn Synchronization ──
  useEffect(() => {
    if (currentScene === activeScene) return;

    const direction: 'next' | 'prev' = currentScene > activeScene ? 'next' : 'prev';
    isTurningRef.current = true;
    setPageTurn({
      outgoing: activeScene,
      incoming: currentScene,
      direction,
    });

    // Elegant high chime upon turning book page
    try {
      royalAudio.playChime(direction === 'next' ? 1046.5 : 880);
    } catch {
      // Audio fallback
    }

    if (turnTimerRef.current) {
      clearTimeout(turnTimerRef.current);
    }

    turnTimerRef.current = setTimeout(() => {
      setActiveScene(currentScene);
      setPageTurn(null);
      isTurningRef.current = false;
      turnTimerRef.current = null;
    }, 680);
  }, [currentScene, activeScene]);

  useEffect(() => {
    return () => {
      if (turnTimerRef.current) {
        clearTimeout(turnTimerRef.current);
      }
    };
  }, []);

  // ── Protected Navigation Handlers (Guards Against Rapid Spam Clicking) ──
  const handleNext = useCallback(() => {
    if (isTurningRef.current) return;
    if (currentScene >= 4) return;
    if (currentScene === 0 && !isPalaceDoorOpen) {
      openPalaceDoor();
    }
    goToScene(currentScene + 1);
  }, [currentScene, isPalaceDoorOpen, openPalaceDoor, goToScene]);

  const handlePrev = useCallback(() => {
    if (isTurningRef.current) return;
    if (currentScene <= 0) return;
    goToScene(currentScene - 1);
  }, [currentScene, goToScene]);

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
      if (isTurningRef.current) return;
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === ' ') {
        e.preventDefault();
        isPlaying ? pause() : resume();
      } else if (e.key === 'r' || e.key === 'R') {
        replay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev, isPlaying, pause, resume, replay]);

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
    if (isTurningRef.current) {
      tx.current = null;
      ty.current = null;
      return;
    }
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
        handleNext();
      } else {
        handlePrev();
      }
    }
    tx.current = null;
    ty.current = null;
  }, [currentScene, handleNext, handlePrev]);

  // Unlock audio on any guest click
  const onTap = useCallback(() => {
    if (!royalAudio.getIsPlaying()) {
      enableAudio();
    }
  }, [enableAudio]);

  // ── Helper to render overlay content per page ──
  const renderOverlayContent = (sceneIndex: number) => {
    switch (sceneIndex) {
      case 0:
        return (
          <Scene1Overlay
            isOpen={isPalaceDoorOpen}
            areGatesFullyOpen={areGatesFullyOpen}
            onOpen={openPalaceDoor}
          />
        );
      case 1:
        return <Scene2Overlay visible={true} />;
      case 2:
        return <Scene3Overlay visible={true} />;
      case 3:
        return (
          <Scene4Overlay
            visible={true}
            onPauseTimeline={pause}
            onResumeTimeline={resume}
          />
        );
      case 4:
        return (
          <Scene5Overlay
            visible={true}
            onPauseTimeline={pause}
            onResumeTimeline={resume}
          />
        );
      default:
        return null;
    }
  };

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

      {/* ── 3D Book Page Turning Stage ── */}
      <div className="book-stage">
        {/* Subtle luxury spine shadow on left edge */}
        <div className="book-spine-accent" />

        {pageTurn ? (
          <>
            {/* Outgoing page rotating away */}
            <div
              key={`out-${pageTurn.outgoing}`}
              className={`book-page-layer ${
                pageTurn.direction === 'next' ? 'page-turn-forward-out' : 'page-turn-backward-out'
              }`}
            >
              {renderOverlayContent(pageTurn.outgoing)}
              <div className="book-sheen" />
            </div>

            {/* Incoming page turning into view */}
            <div
              key={`in-${pageTurn.incoming}`}
              className={`book-page-layer ${
                pageTurn.direction === 'next' ? 'page-turn-forward-in' : 'page-turn-backward-in'
              }`}
            >
              {renderOverlayContent(pageTurn.incoming)}
              <div className="book-sheen" />
            </div>
          </>
        ) : (
          /* Active page at rest (fully interactive) */
          <div
            key={`active-${activeScene}`}
            className="book-page-layer"
            style={{ pointerEvents: 'auto' }}
          >
            {renderOverlayContent(activeScene)}
          </div>
        )}
      </div>

      {/* ── Exactly Three Playback Controls (Previous, Pause/Play, Next) ── */}
      <Navigation
        currentScene={currentScene}
        totalScenes={5}
        isPlaying={isPlaying}
        progressPercent={progressPercent}
        onPrev={handlePrev}
        onNext={handleNext}
        onPause={pause}
        onResume={resume}
        onReplay={replay}
        onSelectScene={goToScene}
        onSkipIntro={skipIntro}
        isAudioPlaying={isAudioPlaying}
        isPageTurning={!!pageTurn}
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

/**
 * useMasterTimeline
 * Drives the auto-play cinematic sequence.
 * Each scene displays for a configurable duration, then advances automatically.
 * Exposes pause, resume, replay, skipIntro, and isPlaying.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import gsap from 'gsap';

// How long each scene stays visible (seconds)
const SCENE_DURATIONS = [
  13.0, // 0 – Palace entrance (doors open in ~2s, camera glides into grand hall 1.4-3.9s, 3D card rotating reveal, ~8.25s read time)
  5.5, // 1 – Sacred Invitation Card (~5-6s)
  6.5, // 2 – Couple & Family Lineage (~6-7s)
  8,   // 3 – Wedding Programme Events (auto-advances unless user scrolls/interacts)
  0,   // 4 – Venue & RSVP (grand finale – no auto-advance)
];

const TOTAL_SCENES = SCENE_DURATIONS.length;

interface MasterTimelineOptions {
  reducedMotion: boolean;
  onSceneChange: (scene: number) => void;
  onPalaceDoorOpen: () => void;
  onReplay?: () => void;
}

export interface TimelineControls {
  pause: () => void;
  resume: () => void;
  replay: () => void;
  skipIntro: () => void;
  goToScene: (index: number) => void;
  isPlaying: boolean;
  currentScene: number;
  progressPercent: number; // 0-100 for the current scene progress
}

export function useMasterTimeline({
  reducedMotion,
  onSceneChange,
  onPalaceDoorOpen,
  onReplay,
}: MasterTimelineOptions): TimelineControls {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Internal refs so callbacks don't go stale
  const sceneRef = useRef(0);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const progressStartRef = useRef(0);
  const progressDurationRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressTimerRef.current) {
      cancelAnimationFrame(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const goToSceneInternal = useCallback(
    (index: number, autoPlay = true) => {
      const safeIndex = Math.max(0, Math.min(index, TOTAL_SCENES - 1));
      sceneRef.current = safeIndex;
      setCurrentScene(safeIndex);
      onSceneChange(safeIndex);

      // Trigger palace door open on scene 0→1 transition or scene 1 direct
      if (safeIndex >= 1) {
        onPalaceDoorOpen();
      }

      clearTimers();
      progressRef.current = 0;
      setProgressPercent(0);

      if (!autoPlay) return;
      if (pausedRef.current) return;

      const duration = SCENE_DURATIONS[safeIndex];
      if (duration === 0) {
        // Finale – no auto-advance
        setProgressPercent(100);
        return;
      }

      if (reducedMotion) {
        // Skip animation, still advance
        timerRef.current = setTimeout(() => {
          goToSceneInternal(safeIndex + 1);
        }, duration * 1000);
        setProgressPercent(100);
        return;
      }

      // Animate progress bar
      progressStartRef.current = performance.now();
      progressDurationRef.current = duration * 1000;

      const tickProgress = (now: number) => {
        if (pausedRef.current) return;
        const elapsed = now - progressStartRef.current;
        const pct = Math.min((elapsed / progressDurationRef.current) * 100, 100);
        setProgressPercent(pct);
        if (pct < 100) {
          progressTimerRef.current = requestAnimationFrame(tickProgress);
        }
      };
      progressTimerRef.current = requestAnimationFrame(tickProgress);

      timerRef.current = setTimeout(() => {
        if (!pausedRef.current) {
          goToSceneInternal(safeIndex + 1);
        }
      }, duration * 1000);
    },
    [onSceneChange, onPalaceDoorOpen, clearTimers, reducedMotion]
  );

  // Start auto-play on mount (after a short initial delay)
  useEffect(() => {
    const startDelay = setTimeout(() => {
      pausedRef.current = false;
      setIsPlaying(true);
      goToSceneInternal(0);
    }, 600);

    return () => {
      clearTimeout(startDelay);
      clearTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    setIsPlaying(false);
    clearTimers();
    // Remember progress
    if (progressDurationRef.current > 0) {
      const elapsed = performance.now() - progressStartRef.current;
      progressRef.current = Math.min(elapsed / progressDurationRef.current, 1);
    }
  }, [clearTimers]);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    setIsPlaying(true);

    const scene = sceneRef.current;
    const duration = SCENE_DURATIONS[scene];
    if (duration === 0) return;

    // Resume from where we left off
    const remaining = (1 - progressRef.current) * duration * 1000;
    progressStartRef.current = performance.now() - progressRef.current * duration * 1000;
    progressDurationRef.current = duration * 1000;

    const tickProgress = (now: number) => {
      if (pausedRef.current) return;
      const elapsed = now - progressStartRef.current;
      const pct = Math.min((elapsed / progressDurationRef.current) * 100, 100);
      setProgressPercent(pct);
      if (pct < 100) {
        progressTimerRef.current = requestAnimationFrame(tickProgress);
      }
    };
    progressTimerRef.current = requestAnimationFrame(tickProgress);

    timerRef.current = setTimeout(() => {
      if (!pausedRef.current) {
        goToSceneInternal(scene + 1);
      }
    }, remaining);
  }, [goToSceneInternal]);

  const replay = useCallback(() => {
    clearTimers();
    pausedRef.current = false;
    setIsPlaying(true);
    gsap.globalTimeline.clear();
    onReplay?.();
    goToSceneInternal(0, true);
  }, [clearTimers, onReplay, goToSceneInternal]);

  const skipIntro = useCallback(() => {
    clearTimers();
    pausedRef.current = false;
    setIsPlaying(true);
    goToSceneInternal(3, true); // Jump to events scene
  }, [clearTimers, goToSceneInternal]);

  const goToScene = useCallback(
    (index: number) => {
      clearTimers();
      pausedRef.current = false;
      setIsPlaying(true);
      goToSceneInternal(index, true);
    },
    [clearTimers, goToSceneInternal]
  );

  return {
    pause,
    resume,
    replay,
    skipIntro,
    goToScene,
    isPlaying,
    currentScene,
    progressPercent,
  };
}

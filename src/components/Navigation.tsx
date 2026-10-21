import React from 'react';
import { Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationProps {
  currentScene: number;
  totalScenes: number;
  isPlaying: boolean;
  progressPercent?: number;
  onPrev: () => void;
  onNext: () => void;
  onPause: () => void;
  onResume: () => void;
  onReplay?: () => void;
  onSelectScene?: (i: number) => void;
  onSkipIntro?: () => void;
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
  onToggleFallback?: () => void;
  is3DMode?: boolean;
}

/**
 * Navigation Bar — Exactly Three Playback Controls:
 * 1. Previous arrow
 * 2. Pause / Play toggle
 * 3. Next arrow
 *
 * All settings, 2D view, separate music buttons, and dot bars removed as requested.
 * Minimum 48x48 CSS pixel touch targets for mobile accessibility.
 */
export const Navigation: React.FC<NavigationProps> = ({
  currentScene,
  totalScenes,
  isPlaying,
  onPrev,
  onNext,
  onPause,
  onResume,
}) => {
  return (
    <nav
      aria-label="Presentation controls"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))',
        paddingTop: '8px',
        pointerEvents: 'none',
      }}
    >
      {/* Centered Floating Control Capsule */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '16px',
          padding: '8px 22px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(87, 13, 32, 0.88) 0%, rgba(22, 11, 16, 0.94) 100%)',
          border: '1.5px solid rgba(212, 175, 101, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 175, 101, 0.25)',
          pointerEvents: 'auto',
        }}
      >
        {/* 1. PREVIOUS ARROW */}
        <button
          type="button"
          onClick={onPrev}
          disabled={currentScene === 0}
          aria-label="Previous scene"
          title="Previous Scene"
          style={{
            minWidth: '48px',
            minHeight: '48px',
            borderRadius: '50%',
            border: '1px solid rgba(212, 175, 101, 0.35)',
            background: 'rgba(87, 13, 32, 0.6)',
            color: currentScene === 0 ? 'rgba(242, 220, 168, 0.3)' : '#F2DCA8',
            cursor: currentScene === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            padding: 0,
          }}
        >
          <ChevronLeft size={24} />
        </button>

        {/* 2. PAUSE / PLAY TOGGLE */}
        <button
          type="button"
          onClick={() => {
            if (isPlaying) {
              onPause();
            } else {
              onResume();
            }
          }}
          aria-label={isPlaying ? 'Pause presentation' : 'Resume presentation'}
          title={isPlaying ? 'Pause presentation' : 'Resume presentation'}
          style={{
            minWidth: '52px',
            minHeight: '52px',
            borderRadius: '50%',
            border: '2px solid rgba(242, 220, 168, 0.75)',
            background: 'linear-gradient(135deg, #781B32 0%, #570D20 100%)',
            color: '#FFF5E6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(212, 175, 101, 0.35)',
            transition: 'all 0.2s ease',
            padding: 0,
          }}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
        </button>

        {/* 3. NEXT ARROW */}
        <button
          type="button"
          onClick={onNext}
          disabled={currentScene === totalScenes - 1}
          aria-label="Next scene"
          title="Next Scene"
          style={{
            minWidth: '48px',
            minHeight: '48px',
            borderRadius: '50%',
            border: '1px solid rgba(212, 175, 101, 0.35)',
            background: 'rgba(87, 13, 32, 0.6)',
            color: currentScene === totalScenes - 1 ? 'rgba(242, 220, 168, 0.3)' : '#F2DCA8',
            cursor: currentScene === totalScenes - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            padding: 0,
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </nav>
  );
};

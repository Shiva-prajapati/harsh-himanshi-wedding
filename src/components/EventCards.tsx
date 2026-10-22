import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { WEDDING_DATA } from '../data/weddingData';

interface EventCardsProps {
  reducedMotion?: boolean;
}

/* ── 3D decorative floating slabs in background ── */
export const EventCards: React.FC<EventCardsProps> = ({ reducedMotion = false }) => {
  const refs = useRef<(THREE.Group | null)[]>([]);

  useEffect(() => {
    const count = WEDDING_DATA.events.length;
    const centerOffset = (count - 1) / 2;
    const spacing = count <= 2 ? 2.2 : 1.6;

    refs.current.forEach((r, i) => {
      if (!r) return;
      r.position.set((i - centerOffset) * spacing, 0, i * 0.08);
      r.rotation.set(0, 0, (i - centerOffset) * -0.05);
      r.scale.set(1, 1, 1);
    });
  }, []);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    refs.current.forEach((r, i) => {
      if (r) r.position.y = Math.sin(t * 1.1 + i * 0.8) * 0.07;
    });
  });

  return (
    <group>
      {WEDDING_DATA.events.map((_, idx) => (
        <group key={idx} ref={(el) => (refs.current[idx] = el)}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.55, 2.6, 0.04]} />
            <meshStandardMaterial color="#FFF5E6" roughness={0.52} metalness={0.09} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <boxGeometry args={[1.48, 2.53, 0.01]} />
            <meshStandardMaterial color="#D4AF65" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   SCENE 4 OVERLAY — WEDDING PROGRAMME / EVENTS LIST
   STRICT REQUIREMENTS:
   - Natural, smooth vertical scrolling on mobile (Android & iPhone).
   - Pauses automatic scene playback while user is scrolling, resumes after idle.
   - Stop propagation so touch-scroll does NOT fight root swipe navigation.
   - Large, crystal-clear typography (headings 22–28px, details 17–20px).
   - High-contrast colors: ivory/gold on rich velvet maroon.
   ──────────────────────────────────────────────────────────────────── */
interface Scene4OverlayProps {
  visible: boolean;
  onPauseTimeline?: () => void;
  onResumeTimeline?: () => void;
}

export const Scene4Overlay: React.FC<Scene4OverlayProps> = ({
  visible,
  onPauseTimeline,
  onResumeTimeline,
}) => {
  const [activeCard, setActiveCard] = useState<number | null>(0);
  const scrollResumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pause timeline while user is interacting with scrollable content
  const handleUserScroll = useCallback(() => {
    if (onPauseTimeline) {
      onPauseTimeline();
    }
    if (scrollResumeTimer.current) {
      clearTimeout(scrollResumeTimer.current);
    }
    // Resume auto-advance 6 seconds after user stops scrolling
    scrollResumeTimer.current = setTimeout(() => {
      if (onResumeTimeline) {
        onResumeTimeline();
      }
    }, 6000);
  }, [onPauseTimeline, onResumeTimeline]);

  useEffect(() => {
    return () => {
      if (scrollResumeTimer.current) {
        clearTimeout(scrollResumeTimer.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        maxHeight: '100dvh',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        overscrollBehaviorY: 'contain',
        pointerEvents: visible ? 'auto' : 'none',
        opacity: visible ? 1 : 0,
        zIndex: 25,
        paddingTop: 'clamp(54px, 11vw, 80px)',
        paddingBottom: 'clamp(130px, 22vw, 170px)',
      }}
      onScroll={handleUserScroll}
      onTouchStart={(e) => {
        // Prevent swipe from accidentally changing scene while interacting with list
        e.stopPropagation();
        handleUserScroll();
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
        handleUserScroll();
      }}
    >
      <div
        style={{
          width: 'min(580px, 94vw)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <p
            className="t-label"
            style={{
              color: '#D4AF65',
              fontSize: 'clamp(0.82rem, 2.4vw, 0.95rem)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            ✦ Programme &amp; Auspicious Rituals ✦
          </p>
          <h2
            className="t-heading gold-shimmer"
            style={{
              fontSize: 'clamp(1.75rem, 6vw, 2.4rem)',
              marginTop: '4px',
              fontWeight: 700,
            }}
          >
            Wedding Events
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-script)',
              fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)',
              color: '#E8A0A0',
              marginTop: '4px',
            }}
          >
            Sacred celebrations of love and tradition
          </p>
        </div>

        {/* Vertical Stack of All 4 Events */}
        {WEDDING_DATA.events.map((evt, idx) => {
          const isSelected = activeCard === idx;

          return (
            <div
              key={evt.id}
              onClick={() => {
                setActiveCard(isSelected ? null : idx);
                handleUserScroll();
              }}
              style={{
                width: '100%',
                borderRadius: '18px',
                padding: 'clamp(18px, 4.5vw, 24px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: isSelected
                  ? 'linear-gradient(145deg, rgba(120, 27, 50, 0.96) 0%, rgba(58, 8, 18, 0.98) 100%)'
                  : 'linear-gradient(135deg, rgba(87, 13, 32, 0.88) 0%, rgba(22, 11, 16, 0.94) 100%)',
                border: isSelected
                  ? '2px solid #F2DCA8'
                  : '1.5px solid rgba(212, 175, 101, 0.38)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: isSelected
                  ? '0 12px 32px rgba(0,0,0,0.65), 0 0 20px rgba(212, 175, 101, 0.35)'
                  : '0 6px 20px rgba(0,0,0,0.45)',
              }}
            >
              {/* Badge & Day Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: 'clamp(1.6rem, 5vw, 2.1rem)' }}>{evt.icon}</span>
                <span
                  style={{
                    background: isSelected ? '#D4AF65' : 'rgba(212, 175, 101, 0.2)',
                    color: isSelected ? '#3A0812' : '#F2DCA8',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'clamp(0.72rem, 2.2vw, 0.84rem)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(212, 175, 101, 0.4)',
                  }}
                >
                  {evt.day}
                </span>
              </div>

              {/* Event Name */}
              <h3
                style={{
                  fontFamily: 'var(--font-royal)',
                  fontSize: 'clamp(1.4rem, 4.8vw, 1.85rem)',
                  color: isSelected ? '#FFF5E6' : '#F2DCA8',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  marginBottom: '6px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
              >
                {evt.title}
              </h3>

              {/* SubTitle */}
              {evt.subTitle && (
                <p
                  style={{
                    fontFamily: 'var(--font-script)',
                    fontSize: 'clamp(1.05rem, 3.2vw, 1.25rem)',
                    color: '#E8A0A0',
                    marginBottom: '12px',
                  }}
                >
                  {evt.subTitle}
                </p>
              )}

              {/* Date & Location Highlight Badge */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(212,175,101,0.25)',
                  }}
                >
                  <span style={{ color: '#D4AF65', fontSize: '14px' }}>📅</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 'clamp(0.92rem, 2.8vw, 1.05rem)',
                      color: '#FFF5E6',
                      fontWeight: 600,
                    }}
                  >
                    {evt.day}, {evt.date}
                  </span>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: evt.id === 'mandap' ? 'rgba(87,13,32,0.6)' : 'rgba(120,27,50,0.6)',
                    border: '1.5px solid rgba(242,220,168,0.45)',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{evt.id === 'mandap' ? '🏡' : '🏛️'}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 'clamp(0.82rem, 2.4vw, 0.92rem)',
                      color: '#F2DCA8',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {evt.id === 'mandap' ? 'Home Ceremony • Sadholi Kadeem' : 'Wedding Venue • Shiva Banquet Hall'}
                  </span>
                </div>
              </div>

              {/* Time & Venue Section */}
              <div
                style={{
                  borderTop: '1px solid rgba(212, 175, 101, 0.25)',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Time */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '17px', flexShrink: 0, marginTop: '2px' }}>⏰</span>
                  <div>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 'clamp(0.72rem, 2.2vw, 0.8rem)',
                        color: 'rgba(242, 220, 168, 0.7)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        display: 'block',
                      }}
                    >
                      Auspicious Time
                    </span>
                    <strong
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'clamp(1.08rem, 3.3vw, 1.25rem)',
                        color: '#FFF5E6',
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {evt.time}
                    </strong>
                  </div>
                </div>

                {/* Venue */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '17px', flexShrink: 0, marginTop: '2px' }}>📍</span>
                  <div>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 'clamp(0.72rem, 2.2vw, 0.8rem)',
                        color: 'rgba(242, 220, 168, 0.7)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        display: 'block',
                      }}
                    >
                      Ceremony Location
                    </span>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'clamp(1.06rem, 3.2vw, 1.22rem)',
                        color: '#F2DCA8',
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {evt.venue}
                    </p>
                    {evt.locationDetails && (
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'clamp(0.95rem, 2.8vw, 1.08rem)',
                          color: '#E8A0A0',
                          fontStyle: 'italic',
                          marginTop: '2px',
                        }}
                      >
                        {evt.locationDetails}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px dashed rgba(212, 175, 101, 0.2)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(1.0rem, 3vw, 1.15rem)',
                    color: 'rgba(255, 245, 230, 0.9)',
                    fontStyle: 'italic',
                    lineHeight: 1.55,
                  }}
                >
                  {evt.description}
                </p>
              </div>
            </div>
          );
        })}

        {/* Helpful scrolling note at bottom */}
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)',
            color: 'rgba(242, 220, 168, 0.65)',
            textAlign: 'center',
            marginTop: '8px',
            letterSpacing: '0.04em',
          }}
        >
          ↕ Scroll to view all wedding events • Tap any card for details
        </p>
      </div>
    </div>
  );
};

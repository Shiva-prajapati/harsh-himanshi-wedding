import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import confetti from 'canvas-confetti';
import { WEDDING_DATA } from '../data/weddingData';
import { royalAudio } from '../utils/audio';

interface VenueRSVPProps {
  reducedMotion?: boolean;
}

/* ── 3D starfield & palace silhouette (background) ── */
export const VenueRSVP: React.FC<VenueRSVPProps> = ({ reducedMotion = false }) => {
  const starsRef = useRef<THREE.Points>(null);
  const [starPositions] = useMemo(() => {
    const n = 280;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = Math.random() * 16 - 2;
      pos[i * 3 + 2] = -6 - Math.random() * 16;
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    if (reducedMotion || !starsRef.current) return;
    starsRef.current.rotation.y = clock.getElapsedTime() * 0.009;
  });

  return (
    <group>
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.11} color="#FFF5E6" transparent opacity={0.78} sizeAttenuation />
      </points>
      {/* Grand palace silhouette in distance */}
      <group position={[0, -2.8, -4.5]}>
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.85, 1.2, 1.7, 16]} />
          <meshBasicMaterial color="#070509" />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <coneGeometry args={[0.88, 1.15, 16]} />
          <meshBasicMaterial color="#070509" />
        </mesh>
        <mesh position={[-2.6, 0.9, 0]}>
          <cylinderGeometry args={[0.28, 0.38, 2.3, 12]} />
          <meshBasicMaterial color="#070509" />
        </mesh>
        <mesh position={[-2.6, 2.1, 0]}>
          <coneGeometry args={[0.38, 0.75, 12]} />
          <meshBasicMaterial color="#070509" />
        </mesh>
        <mesh position={[2.6, 0.9, 0]}>
          <cylinderGeometry args={[0.28, 0.38, 2.3, 12]} />
          <meshBasicMaterial color="#070509" />
        </mesh>
        <mesh position={[2.6, 2.1, 0]}>
          <coneGeometry args={[0.38, 0.75, 12]} />
          <meshBasicMaterial color="#070509" />
        </mesh>
        <mesh>
          <boxGeometry args={[9.5, 1.3, 0.5]} />
          <meshBasicMaterial color="#050307" />
        </mesh>
      </group>
    </group>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   SCENE 5 OVERLAY — VENUE, RSVP & BLESSINGS
   STRICT REQUIREMENTS:
   - Primary RSVP phone: 9720140734 (dynamic, formatted, clickable).
   - WhatsApp link configured with 9720140734.
   - Font size for phone number: at least 17–19px.
   - WKCS: only the 9 confirmed youth names; NO "All relatives & friends".
   - Full-screen scrollable layout on mobile, touch-safe.
   ──────────────────────────────────────────────────────────────────── */
interface Scene5OverlayProps {
  visible: boolean;
  onPauseTimeline?: () => void;
  onResumeTimeline?: () => void;
}

export const Scene5Overlay: React.FC<Scene5OverlayProps> = ({
  visible,
  onPauseTimeline,
  onResumeTimeline,
}) => {
  const [showBlessings, setShowBlessings] = useState(false);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const scrollResumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUserInteraction = useCallback(() => {
    if (onPauseTimeline) onPauseTimeline();
    if (scrollResumeTimer.current) clearTimeout(scrollResumeTimer.current);
    scrollResumeTimer.current = setTimeout(() => {
      if (onResumeTimeline) onResumeTimeline();
    }, 6000);
  }, [onPauseTimeline, onResumeTimeline]);

  useEffect(() => {
    return () => {
      if (scrollResumeTimer.current) clearTimeout(scrollResumeTimer.current);
    };
  }, []);

  const handleBless = (e: React.FormEvent) => {
    e.preventDefault();
    royalAudio.playChime(1318.51);
    try {
      confetti({
        particleCount: 90,
        spread: 72,
        origin: { y: 0.6 },
        colors: ['#F2DCA8', '#D4AF65', '#E8A0A0', '#FFF5E6', '#570D20'],
      });
    } catch {
      // Confetti fallback
    }
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMsg('');
      setShowBlessings(false);
    }, 4000);
  };

  // Derive WhatsApp phone cleanly from central configuration (9720140734 -> +919720140734)
  const rawPhone = WEDDING_DATA.rsvp.primaryContact.phone?.replace(/\D/g, '') || '9720140734';
  const waNumber = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Namaste! I confirm my presence for the royal wedding celebrations of Harsh & Himanshi Prajapati. 🪷'
  )}`;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Harsh & Himanshi Wedding Invitation',
          text: 'You are cordially invited to the royal wedding celebration of Harsh & Himanshi Prajapati.',
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert('Wedding invitation link copied to clipboard!');
    } catch {
      // Fallback
    }
  };

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
        transition: 'opacity 0.6s ease',
        zIndex: 25,
        paddingTop: 'clamp(54px, 11vw, 80px)',
        paddingBottom: 'clamp(120px, 20vw, 160px)',
      }}
      onScroll={handleUserInteraction}
      onTouchStart={(e) => {
        e.stopPropagation();
        handleUserInteraction();
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
        handleUserInteraction();
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
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
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
            ✦ Gracious Presence ✦
          </p>
          <h2
            className="t-heading gold-shimmer"
            style={{
              fontSize: 'clamp(1.75rem, 6vw, 2.4rem)',
              marginTop: '4px',
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            We Look Forward
            <br />
            To Your Presence
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-script)',
              fontSize: 'clamp(1.2rem, 3.6vw, 1.45rem)',
              color: '#E8A0A0',
              marginTop: '4px',
            }}
          >
            To shower your heartfelt blessings on the newlyweds
          </p>
        </div>

        {/* Venue Card */}
        <div
          style={{
            width: '100%',
            borderRadius: '18px',
            padding: 'clamp(18px, 4.5vw, 24px)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(87,13,32,0.92) 0%, rgba(22,11,16,0.96) 100%)',
            border: '1.5px solid rgba(212,175,101,0.42)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 16px rgba(212,175,101,0.2)',
          }}
        >
          <p
            className="t-label"
            style={{
              color: '#D4AF65',
              marginBottom: '6px',
              fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Celebration Venue
          </p>
          <h3
            className="gold-shimmer"
            style={{
              fontFamily: 'var(--font-royal)',
              fontSize: 'clamp(1.5rem, 5vw, 2.1rem)',
              fontWeight: 700,
              marginBottom: '6px',
            }}
          >
            {WEDDING_DATA.venue.name}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1.08rem, 3.2vw, 1.25rem)',
              color: '#FFF5E6',
              fontWeight: 500,
              lineHeight: 1.45,
              marginBottom: '8px',
            }}
          >
            {WEDDING_DATA.venue.fullAddress}
          </p>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(212,175,101,0.3)',
              margin: '8px 0 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(0.95rem, 2.8vw, 1.08rem)',
                color: '#FFF5E6',
                lineHeight: 1.45,
              }}
            >
              🏡 <strong style={{ color: '#F2DCA8' }}>Thursday, 19 Nov 2026:</strong> Mandap &amp; ceremonies at home in <span style={{ color: '#F2DCA8' }}>Sadholi Kadeem</span>
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(0.95rem, 2.8vw, 1.08rem)',
                color: '#FFF5E6',
                lineHeight: 1.45,
              }}
            >
              💍 <strong style={{ color: '#F2DCA8' }}>Friday, 20 Nov 2026:</strong> Barat departs at 5:00 PM from Sadholi Kadeem to <span style={{ color: '#F2DCA8' }}>Shiva Banquet Hall</span>
            </p>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              marginTop: '18px',
            }}
          >
            <a
              href={WEDDING_DATA.venue.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="royal-btn"
              style={{ minHeight: '48px', textDecoration: 'none' }}
            >
              📍 View Location
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="royal-btn"
              style={{ minHeight: '48px', textDecoration: 'none' }}
            >
              📞 Confirm Presence
            </a>
            <button
              type="button"
              onClick={() => {
                setShowBlessings((v) => !v);
                handleUserInteraction();
              }}
              className="royal-btn"
              style={{ minHeight: '48px' }}
            >
              🙏 Send Blessings
            </button>
            <button
              type="button"
              onClick={() => {
                handleShare();
                handleUserInteraction();
              }}
              className="royal-btn"
              style={{ minHeight: '48px' }}
            >
              🔗 Share Invitation
            </button>
          </div>
        </div>

        {/* Blessings Form (collapsible) */}
        {showBlessings && (
          <div
            style={{
              width: '100%',
              borderRadius: '18px',
              padding: 'clamp(16px, 4.5vw, 22px)',
              background: 'linear-gradient(135deg, rgba(87,13,32,0.95), rgba(22,11,16,0.98))',
              border: '1.5px solid rgba(212,175,101,0.55)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            {sent ? (
              <div style={{ textAlign: 'center', padding: '14px 0' }}>
                <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>🌸</div>
                <h4
                  style={{
                    fontFamily: 'var(--font-royal)',
                    fontSize: 'clamp(1.2rem, 3.6vw, 1.45rem)',
                    color: '#F2DCA8',
                    marginBottom: '4px',
                  }}
                >
                  Blessings Received with Gratitude!
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(1.0rem, 3vw, 1.15rem)',
                    color: '#FFF5E6',
                  }}
                >
                  The Prajapati family warmly thanks you for your heartfelt wishes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBless} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4
                  style={{
                    fontFamily: 'var(--font-royal)',
                    fontSize: 'clamp(1.15rem, 3.4vw, 1.35rem)',
                    color: '#F2DCA8',
                    textAlign: 'center',
                  }}
                >
                  Shower Blessings on Harsh &amp; Himanshi
                </h4>
                <textarea
                  rows={3}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Write your heartfelt wishes and blessings for the newlyweds..."
                  required
                  style={{
                    background: 'rgba(10, 4, 7, 0.75)',
                    border: '1.5px solid rgba(212,175,101,0.45)',
                    borderRadius: '12px',
                    padding: '14px',
                    color: '#FFF5E6',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(1.02rem, 3vw, 1.15rem)',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: 1.5,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowBlessings(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(242,220,168,0.7)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.95rem',
                      padding: '8px 14px',
                      minHeight: '44px',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="royal-btn"
                    style={{ borderRadius: '12px', minHeight: '44px' }}
                  >
                    Send With Love 🌸
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* RSVP Contact Details Card */}
        <div
          style={{
            width: '100%',
            borderRadius: '18px',
            padding: 'clamp(18px, 4.5vw, 24px)',
            background: 'linear-gradient(135deg, rgba(87,13,32,0.88), rgba(22,11,16,0.94))',
            border: '1.5px solid rgba(212,175,101,0.38)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-royal)',
                fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)',
                color: '#D4AF65',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              R. S. V. P.
            </span>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(0.75rem, 2.2vw, 0.85rem)',
                color: '#F2DCA8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Prajapati Family
            </span>
          </div>

          {/* Primary RSVP Contact Featured Row */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(212,175,101,0.35)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(1.1rem, 3.4vw, 1.3rem)',
                  color: '#FFF5E6',
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {WEDDING_DATA.rsvp.primaryContact.name}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'clamp(0.75rem, 2.2vw, 0.85rem)',
                  color: 'rgba(242,220,168,0.7)',
                }}
              >
                {WEDDING_DATA.rsvp.primaryContact.relation}
              </p>
            </div>

            {/* Clickable phone link with font size 18px (requirement: 17–19px) */}
            <a
              href={`tel:${WEDDING_DATA.rsvp.primaryContact.phone}`}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(1.12rem, 3.5vw, 1.25rem)', // 18–20px!
                color: '#F2DCA8',
                fontWeight: 700,
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(212,175,101,0.2)',
                border: '1.5px solid rgba(212,175,101,0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px',
              }}
            >
              <span>📞</span>
              <span>{WEDDING_DATA.rsvp.primaryContact.phone}</span>
            </a>
          </div>

          {/* All Family Contacts List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '180px',
              overflowY: 'auto',
              paddingRight: '6px',
            }}
          >
            {WEDDING_DATA.rsvp.allContacts.map((c, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '6px',
                  borderBottom: '1px solid rgba(212,175,101,0.15)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(1.05rem, 3vw, 1.2rem)',
                    color: '#FFF5E6',
                    fontWeight: 500,
                  }}
                >
                  {c.name}
                </p>
                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 'clamp(1.06rem, 3vw, 1.2rem)', // 17–19px
                      color: '#F2DCA8',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {c.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* W.K.C.S (Youth & Relatives) — strictly 9 confirmed names, NO "All relatives & friends" */}
        <div
          style={{
            width: '100%',
            borderRadius: '18px',
            padding: 'clamp(18px, 4.5vw, 24px)',
            background: 'linear-gradient(135deg, rgba(87,13,32,0.88), rgba(22,11,16,0.94))',
            border: '1.5px solid rgba(212,175,101,0.38)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-royal)',
                fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)',
                color: '#D4AF65',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              W. K. C. S.
            </span>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(0.75rem, 2.2vw, 0.85rem)',
                color: '#F2DCA8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              With Best Compliments
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {WEDDING_DATA.wkcs.map((name, i) => (
              <span
                key={i}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'rgba(87,13,32,0.65)',
                  border: '1px solid rgba(212,175,101,0.3)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(1.02rem, 2.9vw, 1.18rem)', // 16.5–19px!
                  color: '#FFF5E6',
                  fontWeight: 500,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Closing Quote from Card */}
        <div style={{ textAlign: 'center', padding: '8px 12px 14px' }}>
          <p
            style={{
              fontFamily: 'var(--font-script)',
              fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)',
              color: '#F2DCA8',
              lineHeight: 1.5,
              marginBottom: '6px',
            }}
          >
            &ldquo;Sweetest would be the moments when you join us to shower your blessings on the bride &amp; groom.&rdquo;
          </p>
          <p
            className="t-label"
            style={{
              color: 'rgba(242,220,168,0.7)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            — Prajapati Family &amp; All Relatives
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { WEDDING_DATA } from '../data/weddingData';

interface InvitationCardProps {
  reducedMotion?: boolean;
}

/* ── 3D Card geometry (thin ivory slab) ── */
export const InvitationCard: React.FC<InvitationCardProps> = ({ reducedMotion = false }) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
    groupRef.current.scale.set(1, 1, 1);
  }, []);

  useFrame(({ clock }) => {
    if (reducedMotion || !groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.07;
    groupRef.current.rotation.y = Math.sin(t * 0.55) * 0.035;
  });

  return (
    <group ref={groupRef}>
      {/* Ivory card slab */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.8, 4.2, 0.04]} />
        <meshStandardMaterial color="#FFF5E6" roughness={0.6} metalness={0.07} />
      </mesh>
      {/* Gold outer border */}
      <mesh position={[0, 0, 0.023]}>
        <boxGeometry args={[2.72, 4.12, 0.01]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} wireframe />
      </mesh>
      {/* Gold corner diamonds */}
      {[
        [-1.25, 1.9],
        [1.25, 1.9],
        [-1.25, -1.9],
        [1.25, -1.9],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.03]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.12, 0.12, 0.012]} />
          <meshStandardMaterial color="#F2DCA8" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   SCENE 2 OVERLAY — SACRED INVITATION CARD (FULL SCREEN)
   Ivory card aesthetics with deep maroon typography & gold accents.
   ──────────────────────────────────────────────────────────────────── */
export const Scene2Overlay: React.FC<{ visible: boolean }> = ({ visible }) => (
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
      zIndex: 25,
      padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 24px)',
    }}
  >
    <div
      style={{
        width: 'min(500px, 94vw)',
        padding: 'clamp(22px, 5.5vw, 38px)',
        textAlign: 'center',
        color: '#4A0817',
        borderRadius: '22px',
        background: 'linear-gradient(150deg, #FFFDF8 0%, #FFF5E6 60%, #F5E0C5 100%)',
        border: '2px solid rgba(212, 175, 101, 0.75)',
        boxShadow: 'inset 0 0 28px rgba(212, 175, 101, 0.2), 0 24px 50px rgba(0,0,0,0.65)',
        position: 'relative',
      }}
    >
      {/* Corner Ornaments */}
      <span style={{ position: 'absolute', top: '10px', left: '12px', color: '#D4AF65', fontSize: '18px' }}>❖</span>
      <span style={{ position: 'absolute', top: '10px', right: '12px', color: '#D4AF65', fontSize: '18px' }}>❖</span>
      <span style={{ position: 'absolute', bottom: '10px', left: '12px', color: '#D4AF65', fontSize: '18px' }}>❖</span>
      <span style={{ position: 'absolute', bottom: '10px', right: '12px', color: '#D4AF65', fontSize: '18px' }}>❖</span>

      {/* Ganesha Mantra */}
      <p
        className="t-hindi"
        style={{
          color: '#570D20',
          fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)',
          fontWeight: 700,
          marginBottom: '6px',
        }}
      >
        ✦ {WEDDING_DATA.ganeshaMantra} ✦
      </p>

      {/* Sanskrit Shloka */}
      <p
        className="t-hindi"
        style={{
          fontSize: 'clamp(0.92rem, 2.7vw, 1.08rem)',
          color: '#781B32',
          lineHeight: 1.55,
          marginBottom: '12px',
        }}
      >
        {WEDDING_DATA.shlokaSanskrit}
      </p>

      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #D4AF65, transparent)',
          margin: '10px auto',
          width: '75%',
        }}
      />

      {/* Opening Quote from Real Wedding Card */}
      <p
        style={{
          fontFamily: 'var(--font-script)',
          fontSize: 'clamp(1.15rem, 3.6vw, 1.45rem)',
          color: '#570D20',
          lineHeight: 1.5,
          margin: '12px 0',
          padding: '0 6px',
        }}
      >
        &ldquo;{WEDDING_DATA.invitationQuote}&rdquo;
      </p>

      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #D4AF65, transparent)',
          margin: '10px auto',
          width: '75%',
        }}
      />

      {/* Invitation Text */}
      <p
        className="t-label"
        style={{
          color: '#781B32',
          fontSize: 'clamp(0.82rem, 2.4vw, 0.94rem)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginTop: '10px',
          marginBottom: '6px',
        }}
      >
        You are cordially invited to celebrate the wedding of
      </p>

      {/* Couple Names */}
      <h2
        style={{
          fontFamily: 'var(--font-royal)',
          fontSize: 'clamp(1.9rem, 6.5vw, 2.7rem)',
          color: '#570D20',
          fontWeight: 800,
          lineHeight: 1.2,
          margin: '4px 0',
          textShadow: '0 1px 3px rgba(212,175,101,0.5)',
        }}
      >
        Harsh &amp; Himanshi
      </h2>

      <p
        style={{
          fontFamily: 'var(--font-royal)',
          fontSize: 'clamp(1.05rem, 3vw, 1.25rem)',
          color: '#781B32',
          fontWeight: 600,
          letterSpacing: '0.08em',
          marginBottom: '10px',
        }}
      >
        Prajapati
      </p>

      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'clamp(0.88rem, 2.6vw, 1.02rem)',
          color: '#A8883A',
          fontWeight: 600,
          letterSpacing: '0.06em',
        }}
      >
        Thursday, 19 &amp; Friday, 20 November 2026 &nbsp;•&nbsp; Saharanpur
      </p>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#C9A84C',
        }}
      >
        <span>❦</span>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#781B32',
            fontWeight: 700,
          }}
        >
          Royal Celebration
        </span>
        <span>❦</span>
      </div>
    </div>
  </div>
);

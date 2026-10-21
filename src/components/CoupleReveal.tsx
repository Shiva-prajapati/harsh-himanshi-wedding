import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { WEDDING_DATA } from '../data/weddingData';

interface CoupleRevealProps {
  reducedMotion?: boolean;
}

/* ── 3D decorative rings in background ── */
export const CoupleReveal: React.FC<CoupleRevealProps> = ({ reducedMotion = false }) => {
  const leftRef  = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const knotRef  = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;
    if (reducedMotion) {
      leftRef.current.position.set(-2, 0, 0);
      rightRef.current.position.set(2, 0, 0);
      return;
    }
    leftRef.current.position.set(-7, 0, -1);
    rightRef.current.position.set(7, 0, -1);
    if (knotRef.current) (knotRef.current.scale as THREE.Vector3).set(0, 0, 0);

    const tl = gsap.timeline();
    tl.to(leftRef.current.position,  { x: -2.2, y: 0, z: 0, duration: 1.5, ease: 'power3.out' }, 0)
      .to(rightRef.current.position, { x:  2.2, y: 0, z: 0, duration: 1.5, ease: 'power3.out' }, 0)
      .to(knotRef.current?.scale || {}, { x: 1, y: 1, z: 1, duration: 1.0, ease: 'elastic.out(1,0.5)' }, 0.7);
    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    if (leftRef.current) {
      leftRef.current.position.y = Math.sin(t * 0.75) * 0.07;
      leftRef.current.rotation.z = Math.sin(t * 0.5) * 0.04;
    }
    if (rightRef.current) {
      rightRef.current.position.y = -Math.sin(t * 0.75) * 0.07;
      rightRef.current.rotation.z = -Math.sin(t * 0.5) * 0.04;
    }
    if (knotRef.current) {
      knotRef.current.rotation.y = t * 0.22;
    }
  });

  const ringMat = { color: '#D4AF65', metalness: 0.92, roughness: 0.17 } as const;
  const beadCount = 14;

  const Ring = ({ side }: { side: 'left' | 'right' }) => (
    <group ref={side === 'left' ? leftRef : rightRef} position={[side === 'left' ? -2.2 : 2.2, 0, 0]}>
      <mesh>
        <torusGeometry args={[1.25, 0.07, 24, 64]} />
        <meshStandardMaterial {...ringMat} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.12, 0.03, 16, 48]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.95} roughness={0.2} />
      </mesh>
      {Array.from({ length: beadCount }).map((_, i) => {
        const a = (i / beadCount) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0.06]}>
            <sphereGeometry args={[0.038, 10, 10]} />
            <meshStandardMaterial color="#F2DCA8" metalness={0.95} roughness={0.14} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, -0.04]}>
        <circleGeometry args={[1.1, 48]} />
        <meshStandardMaterial color="#3A0812" roughness={0.8} />
      </mesh>
    </group>
  );

  return (
    <group>
      <Ring side="left" />
      <Ring side="right" />
      <group ref={knotRef} position={[0, 0, 0.12]}>
        <mesh>
          <torusGeometry args={[0.4, 0.05, 16, 32]} />
          <meshStandardMaterial color="#F2DCA8" metalness={0.95} roughness={0.14} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.33, 0.33, 0.04, 32]} />
          <meshStandardMaterial color="#570D20" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   SCENE 3 OVERLAY — GROOM & BRIDE FAMILY DETAILS
   Large, high-contrast typography (names 32–44px, details 18–20px).
   ──────────────────────────────────────────────────────────────────── */
export const Scene3Overlay: React.FC<{ visible: boolean }> = ({ visible }) => (
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
      paddingTop: 'clamp(52px, 10vw, 76px)',
      paddingBottom: 'clamp(110px, 18vw, 150px)',
    }}
  >
    <div
      style={{
        width: 'min(580px, 94vw)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {/* Auspicious Union Tagline */}
      <p
        className="t-label"
        style={{
          color: '#D4AF65',
          fontSize: 'clamp(0.84rem, 2.4vw, 0.96rem)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: '8px',
        }}
      >
        ✦ Auspicious Union &amp; Family Lineage ✦
      </p>

      {/* GROOM CARD */}
      <div
        style={{
          width: '100%',
          borderRadius: '18px',
          padding: 'clamp(18px, 4.5vw, 24px)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(87, 13, 32, 0.92) 0%, rgba(22, 11, 16, 0.96) 100%)',
          border: '1.5px solid rgba(212, 175, 101, 0.42)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 16px rgba(212,175,101,0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(0.75rem, 2.2vw, 0.85rem)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#D4AF65',
            fontWeight: 700,
            display: 'block',
            marginBottom: '4px',
          }}
        >
          Groom
        </span>

        {/* Groom Name: 32–42px */}
        <h2
          className="t-names gold-shimmer"
          style={{
            fontSize: 'clamp(2.0rem, 7vw, 2.9rem)',
            fontWeight: 800,
            lineHeight: 1.18,
            marginBottom: '8px',
            textShadow: '0 2px 14px rgba(212,175,101,0.4)',
          }}
        >
          {WEDDING_DATA.groom.name}
        </h2>

        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #D4AF65, transparent)',
            margin: '8px auto 12px',
            width: '65%',
          }}
        />

        {/* Parents: 17–20px */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.72rem, 2.2vw, 0.82rem)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(242, 220, 168, 0.75)',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            Son of
          </span>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1.12rem, 3.4vw, 1.3rem)',
              color: '#FFF5E6',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {WEDDING_DATA.groom.parents}
          </p>
        </div>

        {/* Grandparents */}
        <div style={{ marginBottom: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.72rem, 2.2vw, 0.82rem)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(242, 220, 168, 0.75)',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            Grandson of
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
            {WEDDING_DATA.groom.grandparents}
          </p>
        </div>

        {/* Residence */}
        {WEDDING_DATA.groom.residence && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.95rem, 2.8vw, 1.08rem)',
              color: '#E8A0A0',
              fontStyle: 'italic',
              marginTop: '4px',
            }}
          >
            {WEDDING_DATA.groom.residence}
          </p>
        )}
      </div>

      {/* Amperstand Separator */}
      <p
        style={{
          fontFamily: 'var(--font-script)',
          fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
          color: '#D4AF65',
          margin: '2px 0 4px',
          textShadow: '0 0 10px rgba(212,175,101,0.5)',
        }}
      >
        &amp;
      </p>

      {/* BRIDE CARD */}
      <div
        style={{
          width: '100%',
          borderRadius: '18px',
          padding: 'clamp(18px, 4.5vw, 24px)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(87, 13, 32, 0.92) 0%, rgba(22, 11, 16, 0.96) 100%)',
          border: '1.5px solid rgba(212, 175, 101, 0.42)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 16px rgba(212,175,101,0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(0.75rem, 2.2vw, 0.85rem)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#D4AF65',
            fontWeight: 700,
            display: 'block',
            marginBottom: '4px',
          }}
        >
          Bride
        </span>

        {/* Bride Name: 32–42px */}
        <h2
          className="t-names gold-shimmer"
          style={{
            fontSize: 'clamp(2.0rem, 7vw, 2.9rem)',
            fontWeight: 800,
            lineHeight: 1.18,
            marginBottom: '8px',
            textShadow: '0 2px 14px rgba(212,175,101,0.4)',
          }}
        >
          {WEDDING_DATA.bride.name}
        </h2>

        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #D4AF65, transparent)',
            margin: '8px auto 12px',
            width: '65%',
          }}
        />

        {/* Parents: 17–20px */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.72rem, 2.2vw, 0.82rem)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(242, 220, 168, 0.75)',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            Daughter of
          </span>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1.12rem, 3.4vw, 1.3rem)',
              color: '#FFF5E6',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {WEDDING_DATA.bride.parents}
          </p>
        </div>

        {/* Residence */}
        <div>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.72rem, 2.2vw, 0.82rem)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(242, 220, 168, 0.75)',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            Residence
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
            {WEDDING_DATA.bride.residence}
          </p>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.95rem, 2.8vw, 1.08rem)',
            color: '#E8A0A0',
            fontStyle: 'italic',
            marginTop: '8px',
          }}
        >
          With eternal love &amp; ancestral blessings
        </p>
      </div>
    </div>
  </div>
);

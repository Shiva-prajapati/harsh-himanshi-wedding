import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { WEDDING_DATA } from '../data/weddingData';
import { royalAudio } from '../utils/audio';

interface PalaceEntranceProps {
  onOpen: () => void;
  isOpen: boolean;
  onGatesFullyOpen?: () => void;
  reducedMotion?: boolean;
}

export const PalaceEntrance: React.FC<PalaceEntranceProps> = ({
  onOpen,
  isOpen,
  onGatesFullyOpen,
  reducedMotion = false,
}) => {
  const leftDoorRef  = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const glowRef      = useRef<THREE.PointLight>(null);
  const diya1Ref     = useRef<THREE.PointLight>(null);
  const diya2Ref     = useRef<THREE.PointLight>(null);
  const tlRef        = useRef<gsap.core.Timeline | null>(null);

  // Auto-open doors promptly upon loading (150ms to allow initial paint of closed gate)
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        onOpen();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isOpen, onOpen]);

  // GSAP door-open animation synchronized with isOpen state
  useEffect(() => {
    tlRef.current?.kill();

    if (!leftDoorRef.current || !rightDoorRef.current) return;

    if (!isOpen) {
      // Reset doors to closed on replay
      leftDoorRef.current.rotation.y = 0;
      rightDoorRef.current.rotation.y = 0;
      if (glowRef.current) glowRef.current.intensity = 1.2;
      return;
    }

    // Play auspicious temple bell chime upon gate opening
    try {
      royalAudio.playChime(1046.5);
    } catch {
      // Audio safety
    }

    if (reducedMotion) {
      leftDoorRef.current.rotation.y = -Math.PI * 0.62;
      rightDoorRef.current.rotation.y = Math.PI * 0.62;
      if (glowRef.current) glowRef.current.intensity = 4.5;
      onGatesFullyOpen?.();
      return;
    }

    // Timeline that opens gates and IMMEDIATELY triggers sequential text reveal on completion
    const tl = gsap.timeline({
      onComplete: () => {
        // Gates have reached fully open position: trigger sequential reveal immediately
        onGatesFullyOpen?.();
      },
    });
    tlRef.current = tl;

    // Smooth, realistic symmetrical swing outward
    tl.to(
      leftDoorRef.current.rotation,
      {
        y: -Math.PI * 0.62,
        duration: 2.0,
        ease: 'power2.inOut',
      },
      0
    )
      .to(
        rightDoorRef.current.rotation,
        {
          y: Math.PI * 0.62,
          duration: 2.0,
          ease: 'power2.inOut',
        },
        0
      );

    return () => {
      tl.kill();
    };
  }, [isOpen, reducedMotion, onGatesFullyOpen]);

  // Flickering diyas + dynamic warm glow behind doors
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (diya1Ref.current) {
      diya1Ref.current.intensity = 1.6 + Math.sin(t * 14) * 0.35 + Math.cos(t * 7) * 0.2;
    }
    if (diya2Ref.current) {
      diya2Ref.current.intensity = 1.6 + Math.cos(t * 11) * 0.35 + Math.sin(t * 9) * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.intensity = isOpen
        ? 4.5 + Math.sin(t * 2) * 0.5
        : 1.5 + Math.sin(t * 3) * 0.3;
    }
  });

  const handleClick = useCallback(() => {
    if (!isOpen) onOpen();
  }, [isOpen, onOpen]);

  return (
    <group position={[0, -0.2, 0]} onClick={handleClick}>
      {/* ── WARM GLOW behind doors (reveals magnificent light as doors open) ── */}
      <pointLight
        ref={glowRef}
        position={[0, 0.6, -1.2]}
        color="#FFD580"
        intensity={1.5}
        distance={14}
        decay={2}
      />

      {/* ── ARCH: Outer horizontal beam ── */}
      <mesh position={[0, 2.85, 0]} castShadow>
        <boxGeometry args={[3.8, 0.38, 0.45]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.88} roughness={0.22} />
      </mesh>

      {/* Arch: Semi-torus */}
      <mesh position={[0, 2.2, 0.06]}>
        <torusGeometry args={[1.42, 0.13, 16, 40, Math.PI]} />
        <meshStandardMaterial color="#D4AF65" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Arch: chhatri finial */}
      <group position={[0, 3.38, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.32, 0.62, 16]} />
          <meshStandardMaterial color="#F2DCA8" metalness={0.93} roughness={0.14} />
        </mesh>
        <mesh position={[0, -0.26, 0]}>
          <cylinderGeometry args={[0.44, 0.52, 0.16, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.88} roughness={0.25} />
        </mesh>
      </group>

      {/* ── LEFT PILLAR ── */}
      <group position={[-1.7, 0.85, 0]}>
        <mesh position={[0, -1.85, 0]} castShadow>
          <boxGeometry args={[0.5, 0.42, 0.5]} />
          <meshStandardMaterial color="#B8962E" metalness={0.82} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.22, 3.7, 24]} />
          <meshStandardMaterial color="#FFF5E6" roughness={0.32} metalness={0.08} />
        </mesh>
        {[1.2, -0.85].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.24, 0.04, 12, 24]} />
            <meshStandardMaterial color="#D4AF65" metalness={0.92} roughness={0.18} />
          </mesh>
        ))}
        <mesh position={[0, 1.9, 0]} castShadow>
          <boxGeometry args={[0.5, 0.36, 0.5]} />
          <meshStandardMaterial color="#B8962E" metalness={0.82} roughness={0.28} />
        </mesh>
      </group>

      {/* ── RIGHT PILLAR ── */}
      <group position={[1.7, 0.85, 0]}>
        <mesh position={[0, -1.85, 0]} castShadow>
          <boxGeometry args={[0.5, 0.42, 0.5]} />
          <meshStandardMaterial color="#B8962E" metalness={0.82} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.19, 0.22, 3.7, 24]} />
          <meshStandardMaterial color="#FFF5E6" roughness={0.32} metalness={0.08} />
        </mesh>
        {[1.2, -0.85].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.24, 0.04, 12, 24]} />
            <meshStandardMaterial color="#D4AF65" metalness={0.92} roughness={0.18} />
          </mesh>
        ))}
        <mesh position={[0, 1.9, 0]} castShadow>
          <boxGeometry args={[0.5, 0.36, 0.5]} />
          <meshStandardMaterial color="#B8962E" metalness={0.82} roughness={0.28} />
        </mesh>
      </group>

      {/* ── MARBLE STEPS ── */}
      <mesh position={[0, -1.12, 0.2]} receiveShadow>
        <boxGeometry args={[4.0, 0.18, 1.2]} />
        <meshStandardMaterial color="#F5E0C5" roughness={0.38} metalness={0.1} />
      </mesh>
      <mesh position={[0, -1.28, 0.45]} receiveShadow>
        <boxGeometry args={[4.4, 0.14, 1.5]} />
        <meshStandardMaterial color="#3A0812" roughness={0.5} />
      </mesh>

      {/* ── DIYA: Left ── */}
      <group position={[-1.7, -0.88, 0.45]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.05, 0.09, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
        <pointLight ref={diya1Ref} position={[0, 0.12, 0]} color="#FFA733" intensity={1.8} distance={4} />
      </group>

      {/* ── DIYA: Right ── */}
      <group position={[1.7, -0.88, 0.45]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.05, 0.09, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
        <pointLight ref={diya2Ref} position={[0, 0.12, 0]} color="#FFA733" intensity={1.8} distance={4} />
      </group>

      {/* ── LEFT DOOR ── */}
      <group position={[-1.38, 0.72, 0]} ref={leftDoorRef}>
        <group position={[0.69, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.38, 3.45, 0.09]} />
            <meshStandardMaterial color="#570D20" roughness={0.62} metalness={0.22} />
          </mesh>
          <mesh position={[0, 0, 0.048]}>
            <boxGeometry args={[1.28, 3.34, 0.02]} />
            <meshStandardMaterial color="#D4AF65" metalness={0.9} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <boxGeometry args={[1.16, 3.18, 0.018]} />
            <meshStandardMaterial color="#3A0812" roughness={0.7} metalness={0.1} />
          </mesh>
          <mesh position={[0.38, 0.2, 0.072]}>
            <torusGeometry args={[0.17, 0.026, 16, 24]} />
            <meshStandardMaterial color="#F2DCA8" metalness={0.95} roughness={0.14} />
          </mesh>
          <mesh position={[0.38, 0.2, 0.065]}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
            <meshStandardMaterial color="#C9A84C" metalness={0.92} roughness={0.18} />
          </mesh>
          <mesh position={[0.38, 1.1, 0.072]}>
            <torusGeometry args={[0.13, 0.022, 12, 20]} />
            <meshStandardMaterial color="#F2DCA8" metalness={0.95} roughness={0.14} />
          </mesh>
        </group>
      </group>

      {/* ── RIGHT DOOR ── */}
      <group position={[1.38, 0.72, 0]} ref={rightDoorRef}>
        <group position={[-0.69, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.38, 3.45, 0.09]} />
            <meshStandardMaterial color="#570D20" roughness={0.62} metalness={0.22} />
          </mesh>
          <mesh position={[0, 0, 0.048]}>
            <boxGeometry args={[1.28, 3.34, 0.02]} />
            <meshStandardMaterial color="#D4AF65" metalness={0.9} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <boxGeometry args={[1.16, 3.18, 0.018]} />
            <meshStandardMaterial color="#3A0812" roughness={0.7} metalness={0.1} />
          </mesh>
          <mesh position={[-0.38, 0.2, 0.072]}>
            <torusGeometry args={[0.17, 0.026, 16, 24]} />
            <meshStandardMaterial color="#F2DCA8" metalness={0.95} roughness={0.14} />
          </mesh>
          <mesh position={[-0.38, 0.2, 0.065]}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
            <meshStandardMaterial color="#C9A84C" metalness={0.92} roughness={0.18} />
          </mesh>
          <mesh position={[-0.38, 1.1, 0.072]}>
            <torusGeometry args={[0.13, 0.022, 12, 20]} />
            <meshStandardMaterial color="#F2DCA8" metalness={0.95} roughness={0.14} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   SCENE 1 HTML OVERLAY
   REQUIREMENTS:
   1. Initially, show closed gate with NO invitation text visible.
   2. Immediately when gates finish opening, begin sequential text reveal.
   3. Reveal elements ONE BY ONE in exact order:
      - ॥ श्री गणेशाय नमः ॥
      - YOU ARE CORDIALLY INVITED
      - TO THE WEDDING CELEBRATION OF
      - HARSH PRAJAPATI
      - &
      - HIMANSHI PRAJAPATI
      - Existing wedding date text
   4. Stagger: ~0.38s between elements (within 0.3–0.5s range).
   5. Smooth cinematic fade-in and subtle upward movement for each element.
   6. No conflicting timers or duplicate callbacks.
   ──────────────────────────────────────────────────────────────────── */
interface Scene1OverlayProps {
  isOpen: boolean;
  areGatesFullyOpen: boolean;
  onOpen: () => void;
}

export const Scene1Overlay: React.FC<Scene1OverlayProps> = ({
  isOpen,
  areGatesFullyOpen,
  onOpen,
}) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!areGatesFullyOpen) {
      // Gates closed or opening: keep all 7 elements completely hidden
      itemRefs.current.forEach((el) => {
        if (el) gsap.set(el, { opacity: 0, y: 16 });
      });
      return;
    }

    // Gates have reached fully open position:
    // Sequentially reveal each element one by one with GSAP stagger (0.38s)
    const tl = gsap.timeline();

    itemRefs.current.forEach((el, index) => {
      if (!el) return;
      tl.to(
        el,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
        },
        index * 0.38 // Stagger interval of 0.38s between elements
      );
    });

    return () => {
      tl.kill();
    };
  }, [areGatesFullyOpen]);

  return (
    <div
      className="scene-overlay"
      style={{
        pointerEvents: isOpen ? 'none' : 'auto',
      }}
      onClick={() => {
        if (!isOpen) onOpen();
      }}
    >
      {/* Subtle radial dark vignette that frames the palace gateway */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(13,6,9,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── INVITATION TEXT: Sequential One-By-One GSAP Reveal Inside Opened Gate ── */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(54px, 11vw, 92px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(440px, 92vw)',
          textAlign: 'center',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Sequence 1: ॥ श्री गणेशाय नमः ॥ */}
        <div ref={(el) => (itemRefs.current[0] = el)} style={{ opacity: 0, willChange: 'opacity, transform' }}>
          <p
            className="t-hindi"
            style={{
              color: '#F2DCA8',
              fontSize: 'clamp(1.15rem, 3.6vw, 1.4rem)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textShadow: '0 0 16px rgba(212,175,101,0.6)',
              marginBottom: '6px',
            }}
          >
            {WEDDING_DATA.ganeshaMantra}
          </p>

          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #D4AF65, transparent)',
              margin: '8px auto',
              width: '180px',
            }}
          />
        </div>

        {/* Sequence 2: YOU ARE CORDIALLY INVITED */}
        <div ref={(el) => (itemRefs.current[1] = el)} style={{ opacity: 0, willChange: 'opacity, transform' }}>
          <h1
            className="t-hero gold-shimmer"
            style={{
              fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
              letterSpacing: '0.08em',
              marginTop: '4px',
              marginBottom: '4px',
              fontWeight: 700,
            }}
          >
            YOU ARE CORDIALLY INVITED
          </h1>
        </div>

        {/* Sequence 3: TO THE WEDDING CELEBRATION OF */}
        <div ref={(el) => (itemRefs.current[2] = el)} style={{ opacity: 0, willChange: 'opacity, transform' }}>
          <p
            className="t-label"
            style={{
              color: '#F2DCA8',
              fontSize: 'clamp(0.85rem, 2.6vw, 1rem)',
              letterSpacing: '0.14em',
              fontWeight: 500,
              marginTop: '6px',
              marginBottom: '14px',
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            TO THE WEDDING CELEBRATION OF
          </p>
        </div>

        {/* Sequence 4: HARSH PRAJAPATI */}
        <div ref={(el) => (itemRefs.current[3] = el)} style={{ opacity: 0, willChange: 'opacity, transform' }}>
          <h2
            className="t-names gold-shimmer"
            style={{
              fontSize: 'clamp(2.1rem, 7.5vw, 3.1rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              textShadow: '0 2px 14px rgba(212,175,101,0.45)',
            }}
          >
            HARSH PRAJAPATI
          </h2>
        </div>

        {/* Sequence 5: & */}
        <div ref={(el) => (itemRefs.current[4] = el)} style={{ opacity: 0, willChange: 'opacity, transform' }}>
          <p
            style={{
              color: '#F2DCA8',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              fontFamily: 'var(--font-script)',
              margin: '2px 0',
              textShadow: '0 0 12px rgba(242,220,168,0.5)',
            }}
          >
            &amp;
          </p>
        </div>

        {/* Sequence 6: HIMANSHI PRAJAPATI */}
        <div ref={(el) => (itemRefs.current[5] = el)} style={{ opacity: 0, willChange: 'opacity, transform' }}>
          <h2
            className="t-names gold-shimmer"
            style={{
              fontSize: 'clamp(2.1rem, 7.5vw, 3.1rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              textShadow: '0 2px 14px rgba(212,175,101,0.45)',
            }}
          >
            HIMANSHI PRAJAPATI
          </h2>
        </div>

        {/* Sequence 7: Verified Wedding Date Information */}
        <div ref={(el) => (itemRefs.current[6] = el)} style={{ opacity: 0, willChange: 'opacity, transform' }}>
          <div
            style={{
              marginTop: '14px',
              padding: '8px 20px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(87,13,32,0.85) 0%, rgba(22,11,16,0.92) 100%)',
              border: '1.5px solid rgba(212,175,101,0.55)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.6), 0 0 16px rgba(212,175,101,0.25)',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-royal)',
                fontSize: 'clamp(0.85rem, 2.6vw, 1.05rem)',
                color: '#FFF5E6',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              Tuesday, 18 – Thursday, 20 November 2026
            </span>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(0.72rem, 2vw, 0.82rem)',
                color: '#D4AF65',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Shiva Banquet Hall • Saharanpur
            </span>
          </div>
        </div>
      </div>

      {/* ── Discreet tap hint (ONLY shown before doors open, then vanishes) ── */}
      {!isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(80px, 15vw, 110px)',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <div
            className="float"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1.5px solid rgba(212,175,101,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(87,13,32,0.55)',
                backdropFilter: 'blur(8px)',
                color: '#F2DCA8',
                fontSize: '20px',
              }}
            >
              ✦
            </div>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: 'rgba(242,220,168,0.7)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Royal Gate Opening...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    if (!areGatesFullyOpen) {
      gsap.set(cardRef.current, { opacity: 0, scale: 0.94, y: 16 });
      return;
    }

    // Reveal the invitation card immediately and smoothly when gates reach fully open
    gsap.to(cardRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.45,
      ease: 'power2.out',
    });
  }, [areGatesFullyOpen]);

  const invitationCardImg = `${import.meta.env.BASE_URL}images/wedding-invitation-card.jpg`;

  return (
    <div
      className="scene-overlay"
      style={{
        pointerEvents: isOpen ? 'none' : 'auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingTop: 'clamp(14px, 3.5vw, 24px)',
        paddingBottom: 'clamp(76px, 14vw, 100px)',
        paddingLeft: 'clamp(12px, 3vw, 20px)',
        paddingRight: 'clamp(12px, 3vw, 20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => {
        if (!isOpen) onOpen();
      }}
    >
      {/* Subtle radial dark vignette that frames the palace gateway */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(13,6,9,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── WEDDING INVITATION CARD: Revealed immediately when gates are fully open ── */}
      <div
        ref={cardRef}
        style={{
          position: 'relative',
          opacity: 0,
          willChange: 'opacity, transform',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 'min(92vw, 420px)',
          width: '100%',
          pointerEvents: areGatesFullyOpen ? 'auto' : 'none',
          zIndex: 10,
        }}
      >
        {/* Luxury Royal Card Frame with Gold Border & Ambient Shadow */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '2.5px solid rgba(212, 175, 101, 0.85)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.75), 0 0 32px rgba(212,175,101,0.3)',
            background: '#FFFDF8',
            lineHeight: 0,
          }}
        >
          {/* High-Resolution Wedding Invitation Design matching user reference */}
          <img
            src={invitationCardImg}
            alt="Harsh & Himanshi Wedding Invitation Card"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: 'clamp(440px, 68dvh, 600px)',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
            }}
            loading="eager"
          />
        </div>

        {/* Slender Royal Date & Location Capsule */}
        <div
          style={{
            marginTop: '10px',
            padding: '6px 18px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(87,13,32,0.92) 0%, rgba(22,11,16,0.96) 100%)',
            border: '1.5px solid rgba(212,175,101,0.6)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(212,175,101,0.25)',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-royal)',
              fontSize: 'clamp(0.82rem, 2.5vw, 0.98rem)',
              color: '#FFF5E6',
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}
          >
            Thursday, 19 – Friday, 20 November 2026
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.68rem, 2vw, 0.78rem)',
              color: '#D4AF65',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            19 Nov: Home, Sadholi Kadeem • 20 Nov: Shiva Banquet Hall
          </span>
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

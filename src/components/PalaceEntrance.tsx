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

// ─────────────────────────────────────────────────────────────────────
// WEDDING HALL AISLE (Storyboard Step 3: Walkway inside the palace)
// Features:
// - Velvet crimson runner carpet with dual gold-embroidered borders
// - Flanking ivory & gold royal columns with capital moulding
// - Flickering brass diya oil lamps casting warm light
// - Overhead floral garlands and crystal chandeliers
// - Distant glowing mandap archway with sacred backdrop illumination
// - Scattered rose petals on the polished marble aisle
// ─────────────────────────────────────────────────────────────────────
function WeddingHallAisle() {
  const chandelierRef = useRef<THREE.PointLight>(null);
  const aisleDiyas = useRef<(THREE.PointLight | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (chandelierRef.current) {
      chandelierRef.current.intensity = 2.4 + Math.sin(t * 3.5) * 0.25;
    }
    aisleDiyas.current.forEach((diya, idx) => {
      if (diya) {
        diya.intensity = 1.3 + Math.sin(t * (10 + idx * 2.3)) * 0.25 + Math.cos(t * (6 + idx)) * 0.15;
      }
    });
  });

  const pillarZs = [-1.8, -3.8, -5.8, -7.8];

  // Rose petals positions along the aisle floor
  const petals = [
    [-0.5, -0.98, -1.2, 0.4],
    [0.6, -0.98, -1.6, -0.3],
    [-0.7, -0.98, -2.4, 0.8],
    [0.45, -0.98, -3.1, -0.6],
    [-0.35, -0.98, -4.0, 0.2],
    [0.7, -0.98, -4.8, 1.1],
    [-0.6, -0.98, -5.6, -0.5],
    [0.5, -0.98, -6.5, 0.7],
    [-0.4, -0.98, -7.2, -0.9],
    [0.65, -0.98, -8.0, 0.3],
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* ── Polished Dark Marble Floor ── */}
      <mesh position={[0, -1.02, -5.2]} receiveShadow>
        <boxGeometry args={[7.2, 0.04, 11]} />
        <meshStandardMaterial color="#1E070F" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* ── Royal Velvet Red Runner Carpet ── */}
      <mesh position={[0, -0.99, -5.2]} receiveShadow>
        <boxGeometry args={[1.76, 0.02, 11]} />
        <meshStandardMaterial color="#730C20" roughness={0.75} metalness={0.12} />
      </mesh>

      {/* Carpet Gold Trim (Left) */}
      <mesh position={[-0.88, -0.985, -5.2]}>
        <boxGeometry args={[0.06, 0.025, 11]} />
        <meshStandardMaterial color="#D4AF65" metalness={0.92} roughness={0.2} />
      </mesh>

      {/* Carpet Gold Trim (Right) */}
      <mesh position={[0.88, -0.985, -5.2]}>
        <boxGeometry args={[0.06, 0.025, 11]} />
        <meshStandardMaterial color="#D4AF65" metalness={0.92} roughness={0.2} />
      </mesh>

      {/* ── Scattered Rose Petals on Floor ── */}
      {petals.map(([px, py, pz, rot], i) => (
        <mesh key={i} position={[px, py, pz]} rotation={[-Math.PI / 2, 0, rot]}>
          <planeGeometry args={[0.09, 0.06]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#D94E6A" : "#F27896"} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ── Flanking Royal Pillars & Diya Lamps ── */}
      {pillarZs.map((pz, idx) => (
        <group key={idx}>
          {/* Left Pillar */}
          <group position={[-1.65, 0.7, pz]}>
            {/* Square base plinth */}
            <mesh position={[0, -1.55, 0]} castShadow>
              <boxGeometry args={[0.42, 0.35, 0.42]} />
              <meshStandardMaterial color="#B8962E" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Fluted column shaft */}
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.18, 3.3, 16]} />
              <meshStandardMaterial color="#FFF7EE" roughness={0.3} metalness={0.08} />
            </mesh>
            {/* Gold decorative rings */}
            <mesh position={[0, -0.6, 0]}>
              <torusGeometry args={[0.2, 0.03, 12, 20]} />
              <meshStandardMaterial color="#D4AF65" metalness={0.92} roughness={0.18} />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <torusGeometry args={[0.2, 0.03, 12, 20]} />
              <meshStandardMaterial color="#D4AF65" metalness={0.92} roughness={0.18} />
            </mesh>
            {/* Ornate capital */}
            <mesh position={[0, 1.95, 0]} castShadow>
              <boxGeometry args={[0.44, 0.3, 0.44]} />
              <meshStandardMaterial color="#C9A84C" metalness={0.88} roughness={0.22} />
            </mesh>
            {/* Base Diya Lamp */}
            <group position={[0.28, -1.35, 0.2]}>
              <mesh>
                <cylinderGeometry args={[0.09, 0.04, 0.06, 12]} />
                <meshStandardMaterial color="#C9A84C" metalness={0.92} roughness={0.2} />
              </mesh>
              <pointLight
                ref={(el) => (aisleDiyas.current[idx * 2] = el)}
                position={[0, 0.1, 0]}
                color="#FFA433"
                intensity={1.3}
                distance={3.2}
                decay={2}
              />
            </group>
          </group>

          {/* Right Pillar */}
          <group position={[1.65, 0.7, pz]}>
            {/* Square base plinth */}
            <mesh position={[0, -1.55, 0]} castShadow>
              <boxGeometry args={[0.42, 0.35, 0.42]} />
              <meshStandardMaterial color="#B8962E" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Fluted column shaft */}
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.18, 3.3, 16]} />
              <meshStandardMaterial color="#FFF7EE" roughness={0.3} metalness={0.08} />
            </mesh>
            {/* Gold decorative rings */}
            <mesh position={[0, -0.6, 0]}>
              <torusGeometry args={[0.2, 0.03, 12, 20]} />
              <meshStandardMaterial color="#D4AF65" metalness={0.92} roughness={0.18} />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <torusGeometry args={[0.2, 0.03, 12, 20]} />
              <meshStandardMaterial color="#D4AF65" metalness={0.92} roughness={0.18} />
            </mesh>
            {/* Ornate capital */}
            <mesh position={[0, 1.95, 0]} castShadow>
              <boxGeometry args={[0.44, 0.3, 0.44]} />
              <meshStandardMaterial color="#C9A84C" metalness={0.88} roughness={0.22} />
            </mesh>
            {/* Base Diya Lamp */}
            <group position={[-0.28, -1.35, 0.2]}>
              <mesh>
                <cylinderGeometry args={[0.09, 0.04, 0.06, 12]} />
                <meshStandardMaterial color="#C9A84C" metalness={0.92} roughness={0.2} />
              </mesh>
              <pointLight
                ref={(el) => (aisleDiyas.current[idx * 2 + 1] = el)}
                position={[0, 0.1, 0]}
                color="#FFA433"
                intensity={1.3}
                distance={3.2}
                decay={2}
              />
            </group>
          </group>

          {/* Overhead Floral Garland Arch Spanning Pillars */}
          <group position={[0, 2.5, pz]}>
            <mesh>
              <torusGeometry args={[1.65, 0.04, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#E8A0A0" roughness={0.7} />
            </mesh>
            {/* Golden toran tassels */}
            {[-1.0, -0.5, 0, 0.5, 1.0].map((tx, ti) => (
              <mesh key={ti} position={[tx, -0.15, 0]}>
                <coneGeometry args={[0.035, 0.16, 8]} />
                <meshStandardMaterial color="#D4AF65" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* ── Center Overhead Royal Chandelier ── */}
      <group position={[0, 2.35, -4.5]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh castShadow>
          <octahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial color="#FFF1C2" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.32, 0.02, 8, 20]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
        <pointLight
          ref={chandelierRef}
          position={[0, -0.1, 0]}
          color="#FFE5A8"
          intensity={2.6}
          distance={8.5}
          decay={2}
        />
      </group>

      {/* ── Distant Glowing Royal Mandap Arch Backdrop ── */}
      <group position={[0, 0.8, -9.4]}>
        <mesh position={[0, 0.6, -0.2]}>
          <planeGeometry args={[7.2, 5.0]} />
          <meshStandardMaterial color="#2B050E" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <torusGeometry args={[2.0, 0.12, 16, 36, Math.PI]} />
          <meshStandardMaterial color="#F2DCA8" metalness={0.92} roughness={0.16} />
        </mesh>
        <pointLight position={[0, 0.9, 0.3]} color="#FF9933" intensity={3.8} distance={11} decay={2} />
      </group>
    </group>
  );
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

    // Timeline that opens gates and triggers card reveal upon camera glide arrival into wedding hall
    const tl = gsap.timeline();
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

    // Trigger card reveal at 3.9s when camera reaches the illuminated grand wedding hall aisle
    tl.call(() => {
      onGatesFullyOpen?.();
    }, undefined, 3.9);

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

      {/* ── WEDDING HALL AISLE (Storyboard Step 3: Walkway into illuminated grand wedding hall) ── */}
      <WeddingHallAisle />
    </group>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   SCENE 1 HTML OVERLAY
   REQUIREMENTS (Storyboard Steps 4 & 5):
   1. Initially, show closed gate with NO invitation text visible.
   2. After camera glides into the grand wedding hall, card triggers 3D
      rotating & folding reveal (rotateY: -32deg, rotateX: 6deg, scale: 0.72 -> 1.0).
   3. Uncropped, centered, responsive invitation card with slender date capsule.
   ──────────────────────────────────────────────────────────────────── */
interface Scene1OverlayProps {
  isOpen: boolean;
  areGatesFullyOpen: boolean;
  onOpen: () => void;
  reducedMotion?: boolean;
}

export const Scene1Overlay: React.FC<Scene1OverlayProps> = ({
  isOpen,
  areGatesFullyOpen,
  onOpen,
  reducedMotion = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    if (!areGatesFullyOpen) {
      gsap.set(cardRef.current, {
        opacity: 0,
        transform: 'perspective(1200px) rotateY(-32deg) rotateX(6deg) scale(0.72) translateY(24px)',
      });
      return;
    }

    // Play auspicious royal chime when card reveals
    try {
      royalAudio.playChime(1046.5);
    } catch {
      // Audio safety
    }

    if (reducedMotion) {
      gsap.set(cardRef.current, {
        opacity: 1,
        transform: 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1) translateY(0px)',
      });
      return;
    }

    // 3D rotating & folding reveal animation matching Storyboard Step 4
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        transform: 'perspective(1200px) rotateY(-32deg) rotateX(6deg) scale(0.72) translateY(24px)',
      },
      {
        opacity: 1,
        transform: 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1) translateY(0px)',
        duration: 0.85,
        ease: 'power3.out',
      }
    );
  }, [areGatesFullyOpen, reducedMotion]);

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
        perspective: '1200px',
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

      {/* ── WEDDING INVITATION CARD: Revealed with 3D rotation when camera enters the hall ── */}
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
          transformStyle: 'preserve-3d',
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
            19 Nov: Mandha at Home, Sadholi Kadeem • 20 Nov: Shiva Banquet Hall
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

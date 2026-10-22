import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { Lights } from './Lights';
import { Particles } from './Particles';
import { PalaceEntrance } from './PalaceEntrance';
import { InvitationCard } from './InvitationCard';
import { CoupleReveal } from './CoupleReveal';
import { EventCards } from './EventCards';
import { VenueRSVP } from './VenueRSVP';
import { DeviceTier } from '../hooks/usePerformance';

interface SceneProps {
  currentScene: number;
  isPalaceDoorOpen: boolean;
  onOpenPalaceDoor: () => void;
  onGatesFullyOpen?: () => void;
  reducedMotion?: boolean;
  tier?: DeviceTier;
}

// Subtle mouse-parallax and cinematic gateway-entrance camera rig
function CameraRig({
  reducedMotion = false,
  currentScene,
  isPalaceDoorOpen,
}: {
  reducedMotion?: boolean;
  currentScene: number;
  isPalaceDoorOpen: boolean;
}) {
  const targetZRef = useRef(5.2);
  const targetYRef = useRef(0.0);
  const lookAtZRef = useRef(0.0);
  const animTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    animTimelineRef.current?.kill();

    if (currentScene === 0) {
      if (!isPalaceDoorOpen) {
        targetZRef.current = 5.2;
        targetYRef.current = 0.0;
        lookAtZRef.current = 0.0;
        return;
      }

      if (reducedMotion) {
        targetZRef.current = 2.1;
        targetYRef.current = 0.08;
        lookAtZRef.current = -3.5;
        return;
      }

      // Smooth camera glide forward through opened gates into wedding hall aisle
      const tl = gsap.timeline();
      animTimelineRef.current = tl;

      tl.to(
        targetZRef,
        {
          current: 2.1,
          duration: 2.5,
          delay: 1.4,
          ease: 'power2.inOut',
        },
        0
      );

      tl.to(
        targetYRef,
        {
          current: 0.08,
          duration: 2.5,
          delay: 1.4,
          ease: 'power2.inOut',
        },
        0
      );

      tl.to(
        lookAtZRef,
        {
          current: -3.5,
          duration: 2.5,
          delay: 1.4,
          ease: 'power2.inOut',
        },
        0
      );

      return () => {
        tl.kill();
      };
    } else {
      // Scenes 1, 2, 3, 4: default camera position
      targetZRef.current = 5.2;
      targetYRef.current = 0.0;
      lookAtZRef.current = 0.0;
    }
  }, [currentScene, isPalaceDoorOpen, reducedMotion]);

  useFrame(({ camera, pointer }) => {
    const pX = reducedMotion ? 0 : pointer.x * 0.28;
    const pY = (reducedMotion ? 0 : pointer.y * 0.18) + targetYRef.current;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pY, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZRef.current, 0.06);

    camera.lookAt(0, 0.1, lookAtZRef.current);
  });

  return null;
}

// Minimal loading spinner inside canvas
function CanvasLoader() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 2.5; });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.45, 0]} />
      <meshStandardMaterial color="#D4AF65" wireframe />
    </mesh>
  );
}

export const Scene: React.FC<SceneProps> = ({
  currentScene,
  isPalaceDoorOpen,
  onOpenPalaceDoor,
  onGatesFullyOpen,
  reducedMotion = false,
  tier = 'mid',
}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: '#160B10',
      pointerEvents: currentScene === 0 ? 'auto' : 'none',
    }}
  >
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 55 }}
      shadows={tier !== 'low'}
      gl={{
        antialias: tier !== 'low',
        alpha: false,
        powerPreference: 'high-performance',
        // Lower precision on mobile = better performance
        precision: tier === 'low' ? 'lowp' : 'mediump',
      }}
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      // Disable continuous render when nothing moves (saves battery)
      frameloop="always"
    >
      <Suspense fallback={<CanvasLoader />}>
        <Lights sceneIndex={currentScene} />
        <Particles reducedMotion={reducedMotion} tier={tier} />
        <CameraRig
          reducedMotion={reducedMotion}
          currentScene={currentScene}
          isPalaceDoorOpen={isPalaceDoorOpen}
        />

        {currentScene === 0 && (
          <PalaceEntrance
            isOpen={isPalaceDoorOpen}
            onOpen={onOpenPalaceDoor}
            onGatesFullyOpen={onGatesFullyOpen}
            reducedMotion={reducedMotion}
          />
        )}
        {currentScene === 1 && <InvitationCard reducedMotion={reducedMotion} />}
        {currentScene === 2 && <CoupleReveal reducedMotion={reducedMotion} />}
        {currentScene === 3 && <EventCards reducedMotion={reducedMotion} />}
        {currentScene === 4 && <VenueRSVP reducedMotion={reducedMotion} />}
      </Suspense>
    </Canvas>
  </div>
);

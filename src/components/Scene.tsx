import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
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

// Subtle mouse-parallax camera rig
function CameraRig({ reducedMotion = false }: { reducedMotion?: boolean }) {
  useFrame(({ camera, pointer }) => {
    if (reducedMotion) return;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.35, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.25 + 0.1, 0.04);
    camera.lookAt(0, 0, 0);
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
        <CameraRig reducedMotion={reducedMotion} />

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

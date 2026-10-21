import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface LightsProps {
  sceneIndex?: number;
}

export const Lights: React.FC<LightsProps> = () => {
  const movingPointRef = useRef<THREE.PointLight>(null);
  const secondaryPointRef = useRef<THREE.PointLight>(null);

  // Subtle breathing light animation for royal cinematic ambiance
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (movingPointRef.current) {
      movingPointRef.current.position.x = Math.sin(t * 0.8) * 3;
      movingPointRef.current.position.y = 2 + Math.cos(t * 0.6) * 0.8;
      movingPointRef.current.intensity = 2.2 + Math.sin(t * 1.5) * 0.4;
    }
    if (secondaryPointRef.current) {
      secondaryPointRef.current.position.x = -Math.sin(t * 0.7) * 3;
      secondaryPointRef.current.position.y = -1 + Math.sin(t * 0.5) * 0.5;
      secondaryPointRef.current.intensity = 1.8 + Math.cos(t * 1.2) * 0.3;
    }
  });

  return (
    <group name="CinematicLighting">
      {/* Royal Ambient Light - Warm ivory & soft gold fill */}
      <ambientLight intensity={0.8} color="#FFF5E6" />

      {/* Main Royal Key Light - Simulates grand palace chandelier / golden spotlight */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.0}
        color="#FFE4A0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0001}
      />

      {/* Rim light from behind - creates majestic gold edges on 3D geometry */}
      <directionalLight
        position={[-4, 3, -4]}
        intensity={1.2}
        color="#C9A84C"
      />

      {/* Dynamic Candlelight Diya Glow Left */}
      <pointLight
        ref={movingPointRef}
        position={[-2.5, 2, 2.5]}
        intensity={2.0}
        distance={12}
        decay={2}
        color="#FFA733"
      />

      {/* Dynamic Candlelight Diya Glow Right */}
      <pointLight
        ref={secondaryPointRef}
        position={[2.5, -1, 2.5]}
        intensity={1.6}
        distance={10}
        decay={2}
        color="#FF8C42"
      />

      {/* Deep Atmosphere Hemisphere - Navy sky to Rich Maroon ground */}
      <hemisphereLight
        args={['#1D2A44', '#4A0E1C', 0.9]}
      />
    </group>
  );
};

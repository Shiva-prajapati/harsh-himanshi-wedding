import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { DeviceTier } from '../hooks/usePerformance';

interface ParticlesProps {
  reducedMotion?: boolean;
  tier?: DeviceTier;
}

// Generate circular soft particle textures programmatically
function createPetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    gradient.addColorStop(0, 'rgba(255, 180, 190, 0.95)');
    gradient.addColorStop(0.5, 'rgba(232, 160, 160, 0.8)');
    gradient.addColorStop(0.85, 'rgba(212, 122, 136, 0.4)');
    gradient.addColorStop(1, 'rgba(212, 122, 136, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(32, 32, 26, 18, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createGoldDustTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 15);
    gradient.addColorStop(0, 'rgba(255, 235, 150, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 215, 80, 0.85)');
    gradient.addColorStop(0.7, 'rgba(201, 168, 76, 0.4)');
    gradient.addColorStop(1, 'rgba(201, 168, 76, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const Particles: React.FC<ParticlesProps> = ({
  reducedMotion = false,
  tier = 'mid',
}) => {
  const petalsRef = useRef<THREE.Points>(null);
  const goldDustRef = useRef<THREE.Points>(null);

  // Scaled particle counts based on device tier
  const petalCount = useMemo(() => {
    if (tier === 'high') return 200;
    if (tier === 'mid') return 120;
    return 60;
  }, [tier]);

  const goldDustCount = useMemo(() => {
    if (tier === 'high') return 450;
    if (tier === 'mid') return 260;
    return 130;
  }, [tier]);

  // Petal textures
  const petalTexture = useMemo(() => createPetalTexture(), []);
  const goldTexture = useMemo(() => createGoldDustTexture(), []);

  // Dispose textures on unmount
  useEffect(() => {
    return () => {
      petalTexture.dispose();
      goldTexture.dispose();
    };
  }, [petalTexture, goldTexture]);

  // Rose Petals buffer setup
  const [petalPositions, petalSpeeds, petalPhases] = useMemo(() => {
    const positions = new Float32Array(petalCount * 3);
    const speeds = new Float32Array(petalCount * 3);
    const phases = new Float32Array(petalCount);

    for (let i = 0; i < petalCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 16;
      positions[i3 + 1] = Math.random() * 12 - 4;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      speeds[i3] = (Math.random() - 0.5) * 0.4; // Drift X
      speeds[i3 + 1] = 0.3 + Math.random() * 0.5; // Fall speed Y
      speeds[i3 + 2] = (Math.random() - 0.5) * 0.3; // Drift Z

      phases[i] = Math.random() * Math.PI * 2;
    }

    return [positions, speeds, phases];
  }, [petalCount]);

  // Gold Dust buffer setup
  const [goldPositions, goldSpeeds] = useMemo(() => {
    const positions = new Float32Array(goldDustCount * 3);
    const speeds = new Float32Array(goldDustCount);

    for (let i = 0; i < goldDustCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 18;
      positions[i3 + 1] = Math.random() * 14 - 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 12;

      speeds[i] = 0.15 + Math.random() * 0.35;
    }

    return [positions, speeds];
  }, [goldDustCount]);

  // Animation frame loop
  useFrame(({ clock }, delta) => {
    if (reducedMotion) return;

    const time = clock.getElapsedTime();

    // 1. Animate Rose Petals
    if (petalsRef.current) {
      const posAttr = petalsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < petalCount; i++) {
        const i3 = i * 3;
        // Fall down
        array[i3 + 1] -= petalSpeeds[i3 + 1] * delta;
        // Flutter side to side
        array[i3] += Math.sin(time * 1.2 + petalPhases[i]) * 0.008;
        array[i3 + 2] += Math.cos(time * 0.9 + petalPhases[i]) * 0.006;

        // Reset to top once below viewport
        if (array[i3 + 1] < -6) {
          array[i3 + 1] = 6 + Math.random() * 2;
          array[i3] = (Math.random() - 0.5) * 16;
          array[i3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Animate Gold Dust sparkles
    if (goldDustRef.current) {
      const posAttr = goldDustRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < goldDustCount; i++) {
        const i3 = i * 3;
        array[i3 + 1] -= goldSpeeds[i] * delta * 0.5;
        array[i3] += Math.cos(time * 0.8 + i) * 0.004;

        if (array[i3 + 1] < -6) {
          array[i3 + 1] = 7;
          array[i3] = (Math.random() - 0.5) * 18;
          array[i3 + 2] = (Math.random() - 0.5) * 12;
        }
      }
      posAttr.needsUpdate = true;

      // Gentle overall sparkle rotation
      goldDustRef.current.rotation.y = time * 0.03;
    }
  });

  return (
    <group name="RoyalAtmosphericParticles">
      {/* 1. Rose Petals */}
      <points ref={petalsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={petalPositions.length / 3}
            array={petalPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.42}
          map={petalTexture}
          transparent
          opacity={0.88}
          depthWrite={false}
          blending={THREE.NormalBlending}
          sizeAttenuation
        />
      </points>

      {/* 2. Gold Dust */}
      <points ref={goldDustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={goldPositions.length / 3}
            array={goldPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          map={goldTexture}
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

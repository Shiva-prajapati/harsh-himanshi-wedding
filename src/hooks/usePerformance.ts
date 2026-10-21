import { useState, useEffect } from 'react';

export type DeviceTier = 'high' | 'mid' | 'low';

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('mid');

  useEffect(() => {
    let score = 0;

    // CPU cores check
    const cores = navigator.hardwareConcurrency || 4;
    if (cores >= 8) score += 3;
    else if (cores >= 4) score += 2;
    else score += 1;

    // Device Memory check (Chrome/Edge supports navigator.deviceMemory in GB)
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (memory) {
      if (memory >= 8) score += 3;
      else if (memory >= 4) score += 2;
      else score += 1;
    } else {
      score += 2; // Default assumption
    }

    // GPU detection via WebGL unmasked renderer
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && gl instanceof WebGLRenderingContext) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)?.toLowerCase() || '';
          if (
            renderer.includes('rtx') ||
            renderer.includes('gtx') ||
            renderer.includes('radeon rx') ||
            renderer.includes('apple m1') ||
            renderer.includes('apple m2') ||
            renderer.includes('apple m3')
          ) {
            score += 3;
          } else if (renderer.includes('intel') || renderer.includes('mali') || renderer.includes('adreno')) {
            score += 1;
          } else {
            score += 2;
          }
        }
      }
    } catch {
      // Ignore WebGL context failure here
    }

    // Mobile / touch factor
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      score -= 1;
    }

    if (score >= 7) {
      setTier('high');
    } else if (score >= 4) {
      setTier('mid');
    } else {
      setTier('low');
    }
  }, []);

  return tier;
}

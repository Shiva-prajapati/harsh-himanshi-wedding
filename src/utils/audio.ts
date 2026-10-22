/**
 * RoyalWeddingAudio — Persistent Wedding Audio Engine
 *
 * Configured for requested track:
 * "Gallan Do" (from 00:50)
 * Path: public/audio/Gallan-Do-from-50-seconds.mp3
 *
 * Requirements:
 * - Single persistent HTMLAudioElement instance across entire website.
 * - Starts from the beginning of this trimmed file (0:00 corresponds to 00:50 of original song).
 * - Continuous playback across all scene transitions, gate openings, and page turns without restarting.
 * - Loops continuously (audio.loop = true + ended listener fallback).
 * - Comfortable listening volume (~0.55).
 * - Immediate autoplay attempt on website open with graceful fallback to user tap.
 * - Preserves subtle Web Audio chime overlays for auspicious temple bell sounds.
 */

type AudioListener = (isPlaying: boolean) => void;

class RoyalWeddingAudio {
  private audioElement: HTMLAudioElement | null = null;
  private isAudioFileAvailable: boolean | null = null;
  private isPlaying = false;
  private listeners: Set<AudioListener> = new Set();
  private userInteractionBound = false;

  // Web Audio context for gentle temple chime overlays only
  private ctx: AudioContext | null = null;
  private chimeGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initAudioElement());
      } else {
        this.initAudioElement();
      }
      this.bindUserInteractionUnlock();
    }
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.getIsPlaying());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const playing = this.getIsPlaying();
    this.isPlaying = playing;
    this.listeners.forEach((fn) => fn(playing));
  }

  /**
   * Universal user-gesture audio unlocker for mobile Safari & mobile Chrome.
   * Modern mobile browsers require a user gesture (touchstart, pointerdown, click).
   * Once triggered, it plays the audio and automatically cleans up global listeners.
   */
  public bindUserInteractionUnlock() {
    if (this.userInteractionBound || typeof window === 'undefined') return;
    this.userInteractionBound = true;

    const events = ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'] as const;
    const handler = () => {
      if (!this.isPlaying) {
        this.start().then((started) => {
          if (started) {
            events.forEach((evt) => window.removeEventListener(evt, handler, true));
          }
        }).catch(() => {});
      } else {
        events.forEach((evt) => window.removeEventListener(evt, handler, true));
      }
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handler, { capture: true, passive: true });
    });
  }

  public initAudioElement(): HTMLAudioElement | null {
    if (this.audioElement) return this.audioElement;
    if (typeof window === 'undefined') return null;

    try {
      // 1. First look for the pre-rendered audio element in index.html
      let audio = document.getElementById('wedding-audio') as HTMLAudioElement | null;

      if (!audio) {
        const base = import.meta.env.BASE_URL.endsWith('/')
          ? import.meta.env.BASE_URL
          : `${import.meta.env.BASE_URL}/`;
        const audioSrc = `${base}audio/Gallan-Do-from-50-seconds.mp3`;
        audio = new Audio(audioSrc);
        audio.id = 'wedding-audio';
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');
        document.body.appendChild(audio);
      }

      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0.55;

      audio.addEventListener('canplay', () => {
        this.isAudioFileAvailable = true;
      });

      audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify();
      });

      audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notify();
      });

      audio.addEventListener('ended', () => {
        // Continuous looping guarantee across browsers
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      });

      audio.addEventListener('error', (e) => {
        console.warn('[Wedding Audio] Error loading audio file at:', audio?.src || audio?.currentSrc, e);
        this.isAudioFileAvailable = false;
      });

      this.audioElement = audio;
      return audio;
    } catch (e) {
      console.warn('[Wedding Audio] Audio element initialization error:', e);
      return null;
    }
  }

  // ── Context for gentle auspicious temple bell / chime ─────────────
  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        this.ctx = new AC();
        this.chimeGain = this.ctx.createGain();
        this.chimeGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        this.chimeGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play auspicious temple bell chime (subtle 0.03 volume overlay)
  public playChime(freq = 1046.5) {
    try {
      this.initContext();
      if (!this.ctx || !this.chimeGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      g.gain.setValueAtTime(0.03, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);
      osc.connect(g);
      g.connect(this.chimeGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.5);
    } catch {
      // Audio safety
    }
  }

  // ── Start Audio Playback ──────────────────────────────────────────
  public async start(): Promise<boolean> {
    const audio = this.initAudioElement();
    if (!audio) return false;

    try {
      audio.volume = 0.55;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      this.isPlaying = true;
      this.isAudioFileAvailable = true;
      this.notify();
      return true;
    } catch (err) {
      // Autoplay restricted before user gesture
      this.isPlaying = false;
      this.notify();
      return false;
    }
  }

  // Attempt autoplay immediately on mount
  public async tryAutoplay(): Promise<boolean> {
    try {
      const ok = await this.start();
      return ok;
    } catch {
      return false;
    }
  }

  // Stop / pause music
  public stop() {
    this.isPlaying = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {
        // Safety
      }
    }
    this.notify();
  }

  // Mute / Unmute toggle
  public toggle(): boolean {
    if (this.audioElement && !this.audioElement.paused) {
      this.stop();
      return false;
    } else {
      this.start().catch(() => {});
      return true;
    }
  }

  public getIsPlaying(): boolean {
    if (this.audioElement) {
      return !this.audioElement.paused;
    }
    return this.isPlaying;
  }

  public getIsAudioFileAvailable(): boolean | null {
    return this.isAudioFileAvailable;
  }

  public setVolume(volume: number) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export const royalAudio = new RoyalWeddingAudio();

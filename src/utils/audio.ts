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

class RoyalWeddingAudio {
  private audioElement: HTMLAudioElement | null = null;
  private isAudioFileAvailable: boolean | null = null;
  private isPlaying = false;

  // Web Audio context for gentle temple chime overlays only
  private ctx: AudioContext | null = null;
  private chimeGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audioElement) return;

    try {
      const base = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
      const audioSrc = `${base}audio/Gallan-Do-from-50-seconds.mp3`;
      const audio = new Audio(audioSrc);
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0.55;

      audio.addEventListener('canplay', () => {
        this.isAudioFileAvailable = true;
      });

      audio.addEventListener('play', () => {
        this.isPlaying = true;
      });

      audio.addEventListener('pause', () => {
        this.isPlaying = false;
      });

      audio.addEventListener('ended', () => {
        // Continuous looping guarantee across browsers
        audio.currentTime = 0;
        audio.play().catch(() => {});
      });

      audio.addEventListener('error', (e) => {
        console.warn('[Wedding Audio] Error loading audio file at:', audioSrc, e);
        this.isAudioFileAvailable = false;
      });

      this.audioElement = audio;
    } catch (e) {
      console.warn('[Wedding Audio] Audio element initialization error:', e);
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
    if (!this.audioElement && typeof window !== 'undefined') {
      this.initAudioElement();
    }

    if (this.audioElement) {
      try {
        this.audioElement.volume = 0.55;
        await this.audioElement.play();
        this.isPlaying = true;
        this.isAudioFileAvailable = true;
        return true;
      } catch (err) {
        // Autoplay restricted before user gesture
        this.isPlaying = false;
        return false;
      }
    }

    return false;
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
  }

  // Mute / Unmute toggle
  public toggle(): boolean {
    if (this.audioElement && !this.audioElement.paused) {
      this.stop();
      return false;
    } else {
      this.start();
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

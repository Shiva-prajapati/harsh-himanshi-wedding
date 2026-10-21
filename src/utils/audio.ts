/**
 * RoyalWeddingAudio — Persistent Wedding Audio Engine
 *
 * Configured for requested track:
 * "Jashn-E-Bahaaraa — Instrumental"
 * Path: /audio/jashn-e-bahaaraa-instrumental.mp3
 *
 * Requirements:
 * - Initializes immediately on page load, independent of visual animations.
 * - Starts playback as early as permitted without waiting for gate or scene progression.
 * - Seeks to approximately 10 seconds into the recording (00:10).
 * - Continuous across all scene transitions without restarting.
 * - Audible starting volume with fast smooth fade-in to 0.65.
 * - Single persistent audio instance.
 * - Graceful fallback to acoustic royal Tanpura soundscape if MP3 is missing.
 */

class RoyalWeddingAudio {
  private audioElement: HTMLAudioElement | null = null;
  private isAudioFileAvailable: boolean | null = null;
  private isPlaying = false;
  private hasSeeked = false;

  // Web Audio procedural fallback
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private noteIdx = 0;

  // Raga Yaman notes in Hz (Base D = 146.83 Hz)
  private readonly notes = [
    146.83, 164.81, 185.0, 207.65, 220.0, 246.94, 277.18, 293.66, 329.63, 369.99, 415.3, 440.0,
  ];
  private readonly ragaSequence = [0, 2, 4, 3, 4, 7, 6, 7, 9, 7, 4, 2, 0];

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
      const audioSrc = `${base}audio/jashn-e-bahaaraa-instrumental.mp3`;
      const audio = new Audio(audioSrc);
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0.25; // Audible immediately upon start, smoothly ramps to 0.65

      const handleSeek = () => {
        if (!this.hasSeeked && audio.duration > 10) {
          try {
            audio.currentTime = 10;
            this.hasSeeked = true;
          } catch {
            // Some mobile browsers restrict seek until user interaction
          }
        }
      };

      audio.addEventListener('loadedmetadata', handleSeek);
      audio.addEventListener('canplay', handleSeek);

      audio.addEventListener('error', () => {
        this.isAudioFileAvailable = false;
        console.warn(
          '[Wedding Audio] Jashn-E-Bahaaraa file not found at /audio/jashn-e-bahaaraa-instrumental.mp3. ' +
          'Place the licensed MP3 in public/audio/jashn-e-bahaaraa-instrumental.mp3. ' +
          'Acoustic royal Tanpura ambience active as fallback.'
        );
      });

      this.audioElement = audio;
    } catch (e) {
      console.warn('[Wedding Audio] Audio element initialization error:', e);
    }
  }

  // ── Context for procedural fallback & chimes ─────────────────────
  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        this.ctx = new AC();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play auspicious temple bell / chime
  public playChime(freq = 1046.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      g.gain.setValueAtTime(0.04, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.8);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.8);
    } catch {
      // Audio safety
    }
  }

  // ── Start Audio Playback Immediately ─────────────────────────────
  public async start(): Promise<boolean> {
    if (this.isPlaying) return true;

    // Ensure audio element is initialized
    if (!this.audioElement && typeof window !== 'undefined') {
      this.initAudioElement();
    }

    // Try playing the requested Jashn-E-Bahaaraa instrumental MP3 first
    if (this.audioElement && this.isAudioFileAvailable !== false) {
      try {
        if (!this.hasSeeked && this.audioElement.duration > 10) {
          this.audioElement.currentTime = 10;
          this.hasSeeked = true;
        }

        await this.audioElement.play();
        this.isPlaying = true;
        this.isAudioFileAvailable = true;

        if (this.audioElement.currentTime < 9.5 && this.audioElement.duration > 10) {
          this.audioElement.currentTime = 10;
          this.hasSeeked = true;
        }

        // Fast, smooth volume fade-in from 0.25 to 0.65 within ~300ms
        let vol = 0.25;
        this.audioElement.volume = vol;
        const fadeInterval = setInterval(() => {
          if (!this.audioElement || !this.isPlaying) {
            clearInterval(fadeInterval);
            return;
          }
          vol = Math.min(vol + 0.08, 0.65);
          this.audioElement.volume = vol;
          if (vol >= 0.65) clearInterval(fadeInterval);
        }, 50);

        return true;
      } catch (err) {
        // Autoplay may be restricted by browser policy before user interaction
      }
    }

    // Fallback: procedural Tanpura drone + classical raga synthesizer
    this.startProceduralFallback();
    return this.isPlaying;
  }

  private startProceduralFallback() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    // Start at audible level immediately (0.12) and reach full ambient gain (0.22) in 300ms
    this.masterGain.gain.setValueAtTime(0.12, now);
    this.masterGain.gain.linearRampToValueAtTime(0.22, now + 0.3);

    // Tanpura Drones
    const droneFreqs = [146.83, 220.0, 293.66, 73.42];
    this.droneOscillators = [];
    droneFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + idx * 80, this.ctx.currentTime);
      g.gain.setValueAtTime(0.028 / (idx + 1), this.ctx.currentTime);
      osc.connect(filter);
      filter.connect(g);
      g.connect(this.masterGain);
      osc.start();
      this.droneOscillators.push(osc);
    });

    // Shehnai / Flute Melody Phrase
    const playMelodyNote = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const noteFreq = this.notes[this.ragaSequence[this.noteIdx % this.ragaSequence.length]];
      this.noteIdx++;

      const osc = this.ctx.createOscillator();
      const vibrato = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      const t = this.ctx.currentTime;
      const dur = 2.4;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(noteFreq, t);
      vibrato.frequency.setValueAtTime(4.8, t);
      vibGain.gain.setValueAtTime(2.2, t);
      vibrato.connect(osc.frequency);
      vibGain.connect(osc.frequency);
      vibrato.start();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, t);

      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(g);
      g.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + dur);
      vibrato.stop(t + dur);

      if (this.noteIdx % 4 === 0) this.playChime(1318.51);
    };

    // Play first note immediately on start!
    playMelodyNote();
    if (this.intervalId === null) {
      this.intervalId = window.setInterval(playMelodyNote, 2800);
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

  // Stop music
  public stop() {
    this.isPlaying = false;

    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {
        // Safety
      }
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      setTimeout(() => {
        this.droneOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Already stopped
          }
        });
        this.droneOscillators = [];
      }, 600);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsAudioFileAvailable(): boolean | null {
    return this.isAudioFileAvailable;
  }
}

export const royalAudio = new RoyalWeddingAudio();

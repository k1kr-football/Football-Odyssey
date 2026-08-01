/**
 * Football Odyssey — Procedural Sound Effects Engine (Web Audio API)
 * Zero latency, 0 external file dependency, customizable via sfxVolume settings.
 */

export type SfxType =
  | 'UI_CLICK'
  | 'UI_TAB'
  | 'INBOX_CHIME'
  | 'WHISTLE_START'
  | 'WHISTLE_HALF_TIME'
  | 'WHISTLE_FULL_TIME'
  | 'BALL_KICK'
  | 'GOAL_POST'
  | 'GOAL_CROWD'
  | 'CROWD_GROAN'
  | 'CARD_SHOWN'
  | 'MINIGAME_SUCCESS'
  | 'MINIGAME_FAIL';

class SfxEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterVolume: number = 80;
  private sfxVolume: number = 100;

  constructor() {
    // Lazy AudioContext initialization on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.updateGain();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(master: number, sfx: number) {
    this.masterVolume = master;
    this.sfxVolume = sfx;
    this.updateGain();
  }

  private updateGain() {
    if (this.masterGain && this.ctx) {
      const effective = (this.masterVolume / 100) * (this.sfxVolume / 100);
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, effective)), this.ctx.currentTime);
    }
  }

  public play(type: SfxType) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      if (this.masterVolume <= 0 || this.sfxVolume <= 0) return;

      const now = this.ctx.currentTime;

      switch (type) {
        case 'UI_CLICK': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.035);
          break;
        }

        case 'UI_TAB': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(660, now + 0.05);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'INBOX_CHIME': {
          const freqs = [880, 1046.5]; // A5 -> C6
          freqs.forEach((f, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.08;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, startTime);
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.45);
          });
          break;
        }

        case 'WHISTLE_START': {
          this.playWhistleBurst(now, 0.5);
          break;
        }

        case 'WHISTLE_HALF_TIME': {
          this.playWhistleBurst(now, 0.22);
          this.playWhistleBurst(now + 0.28, 0.35);
          break;
        }

        case 'WHISTLE_FULL_TIME': {
          this.playWhistleBurst(now, 0.2);
          this.playWhistleBurst(now + 0.25, 0.2);
          this.playWhistleBurst(now + 0.5, 0.6);
          break;
        }

        case 'BALL_KICK': {
          // Low-end punch sub oscillator + noise snap
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

          gain.gain.setValueAtTime(0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.14);

          // Transient noise snap
          this.playNoiseBurst(now, 0.04, 600, 0.3);
          break;
        }

        case 'GOAL_POST': {
          const freqs = [1200, 2400, 3600];
          freqs.forEach((f, i) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.3 / (i + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.75);
          });
          break;
        }

        case 'GOAL_CROWD': {
          // Bandpass noise stadium roar swell
          this.playNoiseSwell(now, 2.2, 800, 2500, 0.5);
          break;
        }

        case 'CROWD_GROAN': {
          this.playNoiseSwell(now, 1.2, 1200, 300, 0.35);
          break;
        }

        case 'CARD_SHOWN': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }

        case 'MINIGAME_SUCCESS': {
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.06;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.3);
          });
          break;
        }

        case 'MINIGAME_FAIL': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(185, now);
          osc.frequency.linearRampToValueAtTime(110, now + 0.35);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.38);
          break;
        }
      }
    } catch (err) {
      console.warn("SFX playback error:", err);
    }
  }

  private playWhistleBurst(startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    // Dual high frequency sine waves with slight beat frequency (2700Hz + 2950Hz) + LFO trill
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(2700, startTime);
    osc2.frequency.setValueAtTime(2950, startTime);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(32, startTime); // 32Hz trill
    lfoGain.gain.setValueAtTime(120, startTime);

    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
    gain.gain.setValueAtTime(0.35, startTime + duration - 0.04);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(startTime);
    osc1.start(startTime);
    osc2.start(startTime);

    lfo.stop(startTime + duration + 0.02);
    osc1.stop(startTime + duration + 0.02);
    osc2.stop(startTime + duration + 0.02);
  }

  private playNoiseBurst(startTime: number, duration: number, cutoff: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(startTime);
  }

  private playNoiseSwell(startTime: number, duration: number, startFreq: number, endFreq: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(startFreq, startTime);
    filter.frequency.linearRampToValueAtTime(endFreq, startTime + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(startFreq * 0.5, startTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + duration * 0.4);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(startTime);
  }
}

export const sfxEngine = new SfxEngine();

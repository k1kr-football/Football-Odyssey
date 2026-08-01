/**
 * Football Odyssey — Contextual Music & Crossfading Engine
 * Handles Lyria 3 audio playback + Web Audio Procedural Fallback + Smooth Crossfading
 */

import { LYRIA_MUSIC_PROMPTS } from '../data/lyriaMusicPrompts';

export type MusicMoodId =
  | 'MENU'
  | 'TRAINING'
  | 'PRE_MATCH'
  | 'MATCH_LOW_PRESSURE'
  | 'MATCH_HIGH_PRESSURE'
  | 'DERBY_DAY'
  | 'VICTORY'
  | 'DEFEAT'
  | 'STORY_CUTSCENE'
  | 'RETIREMENT';

interface ActiveTrackState {
  moodId: MusicMoodId;
  gainNode: GainNode;
  audioElement?: HTMLAudioElement;
  synthOscillators?: any[];
  intervalId?: any;
}

class MusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterVolume: number = 80;
  private musicVolume: number = 60;

  private currentMood: MusicMoodId | null = null;
  private currentTrackState: ActiveTrackState | null = null;

  private customAudioTracks: Record<string, string> = {}; // moodId -> blob URL / file URL
  private transitionTimer: any = null;

  constructor() {
    // Lazy initialization
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.updateMasterVolume();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(master: number, music: number) {
    this.masterVolume = master;
    this.musicVolume = music;
    this.updateMasterVolume();
  }

  private updateMasterVolume() {
    if (this.masterGain && this.ctx) {
      const effective = (this.masterVolume / 100) * (this.musicVolume / 100);
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, effective)), this.ctx.currentTime);
    }
  }

  public registerCustomTrack(moodId: MusicMoodId, url: string) {
    this.customAudioTracks[moodId] = url;
    if (this.currentMood === moodId) {
      this.playMood(moodId, true);
    }
  }

  public getCurrentMood(): MusicMoodId | null {
    return this.currentMood;
  }

  public playMood(moodId: MusicMoodId, forceRefresh = false) {
    if (this.currentMood === moodId && !forceRefresh) return;

    // Debounce rapid transitions (e.g. pressure meter flickering)
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }

    this.transitionTimer = setTimeout(() => {
      this.executeMoodTransition(moodId);
    }, 150);
  }

  private executeMoodTransition(newMood: MusicMoodId) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const previousTrack = this.currentTrackState;
    this.currentMood = newMood;

    const now = this.ctx.currentTime;
    const fadeDuration = 1.5; // 1.5s smooth crossfade

    // Fade out previous track
    if (previousTrack) {
      previousTrack.gainNode.gain.setValueAtTime(previousTrack.gainNode.gain.value, now);
      previousTrack.gainNode.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);

      setTimeout(() => {
        if (previousTrack.audioElement) {
          previousTrack.audioElement.pause();
          previousTrack.audioElement.src = '';
        }
        if (previousTrack.synthOscillators) {
          previousTrack.synthOscillators.forEach((osc) => {
            try { osc.stop(); } catch (_) {}
          });
        }
        if (previousTrack.intervalId) {
          clearInterval(previousTrack.intervalId);
        }
      }, fadeDuration * 1000 + 100);
    }

    // Create new gain node for incoming track
    const newGain = this.ctx.createGain();
    newGain.gain.setValueAtTime(0.0001, now);
    newGain.gain.linearRampToValueAtTime(1.0, now + fadeDuration);
    newGain.connect(this.masterGain);

    const customUrl = this.customAudioTracks[newMood];
    if (customUrl) {
      // Play Audio element (e.g. Lyria 3 generated track or pre-bundled WAV)
      const audio = new Audio();
      audio.src = customUrl;
      audio.loop = LYRIA_MUSIC_PROMPTS[newMood]?.isLoopable ?? true;
      audio.crossOrigin = 'anonymous';

      const source = this.ctx.createMediaElementSource(audio);
      source.connect(newGain);
      audio.play().catch(() => {});

      this.currentTrackState = {
        moodId: newMood,
        gainNode: newGain,
        audioElement: audio,
      };
    } else {
      // Procedural Synthesizer Fallback for each mood
      const synthData = this.startProceduralSynth(newMood, newGain);
      this.currentTrackState = {
        moodId: newMood,
        gainNode: newGain,
        synthOscillators: synthData.oscillators,
        intervalId: synthData.intervalId,
      };
    }
  }

  private startProceduralSynth(mood: MusicMoodId, targetGain: GainNode) {
    if (!this.ctx) return { oscillators: [], intervalId: null };
    const now = this.ctx.currentTime;
    const oscillators: any[] = [];
    let intervalId: any = null;

    switch (mood) {
      case 'MENU': {
        // D Major chord pads + ambient pulse (D3 - F#3 - A3 - D4)
        const notes = [146.83, 185.0, 220.0, 293.66];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.08, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'TRAINING': {
        // G Major upbeat pulse (G3 - B3 - D4 - G4)
        const notes = [196.0, 246.94, 293.66, 392.0];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.06, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'PRE_MATCH': {
        // Ominous A Minor sub drone (A1 - E2 - A2)
        const notes = [55.0, 82.41, 110.0];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.07, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'MATCH_LOW_PRESSURE': {
        // E Minor subdued pad (E2 - B2 - G3)
        const notes = [82.41, 123.47, 196.0];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.05, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'MATCH_HIGH_PRESSURE': {
        // Driving B Minor synth pulse (B1 - F#2 - B2 - D3)
        const notes = [61.74, 92.5, 123.47, 146.83];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.08, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'DERBY_DAY': {
        // Intense F# Minor heavy drone (F#1 - C#2 - F#2 - A2)
        const notes = [46.25, 69.3, 92.5, 110.0];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.1, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'VICTORY': {
        // C Major triumphant fanfare (C3 - E3 - G3 - C4)
        const notes = [130.81, 164.81, 196.0, 261.63];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.09, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'DEFEAT': {
        // Somber D Minor reflection (D2 - F2 - A2)
        const notes = [73.42, 87.31, 110.0];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.07, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'STORY_CUTSCENE': {
        // Reflective F Major warmth (F2 - C3 - A3)
        const notes = [87.31, 130.81, 220.0];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.06, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'RETIREMENT': {
        // Nostalgic G Major farewell (G2 - D3 - B3 - D4)
        const notes = [98.0, 146.83, 246.94, 293.66];
        notes.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          g.gain.setValueAtTime(0.07, now);
          osc.connect(g);
          g.connect(targetGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }
    }

    return { oscillators, intervalId };
  }
}

export const musicEngine = new MusicEngine();

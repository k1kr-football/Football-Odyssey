export interface LyriaTrackPrompt {
  id: string;
  moodName: string;
  contextDesc: string;
  recommendedModel: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  bpm: number;
  key: string;
  genre: string;
  prompt: string;
  synthIdWatermark: boolean;
  isLoopable: boolean;
}

export const LYRIA_MUSIC_PROMPTS: Record<string, LyriaTrackPrompt> = {
  MENU: {
    id: 'MENU',
    moodName: 'Main Menu & Career Hub',
    contextDesc: 'Confident, anthemic, moderate tempo. Sets the ambitious tone for a career-mode football title.',
    recommendedModel: 'lyria-3-pro-preview',
    bpm: 100,
    key: 'D Major',
    genre: 'Sports Drama / Cinematic Orchestral Electronic',
    prompt: 'Anthemic football career sports-drama main theme, 100 BPM, D Major, soaring string quartet, modern electronic bass synth, energetic brass swells, inspirational and aspirational triumph, clear arrangement, high production quality, no vocals',
    synthIdWatermark: true,
    isLoopable: true
  },
  TRAINING: {
    id: 'TRAINING',
    moodName: 'Training Center & Academy',
    contextDesc: 'Upbeat, motivational, mid-tempo. Loopable without fatigue for repeated training sessions.',
    recommendedModel: 'lyria-3-pro-preview',
    bpm: 118,
    key: 'G Major',
    genre: 'Upbeat Indie Pop / Acoustic Electronic Hybrid',
    prompt: 'Upbeat motivational football academy training loop, 118 BPM, G Major, rhythmic acoustic guitar strumming, light synth arpeggios, driving kick drum pulse, energetic and focused athletic vibe, optimistic workflow, no vocals',
    synthIdWatermark: true,
    isLoopable: true
  },
  PRE_MATCH: {
    id: 'PRE_MATCH',
    moodName: 'Pre-Match Tunnel & Strategy',
    contextDesc: 'Building, atmospheric, lower-key tension escalating toward kickoff.',
    recommendedModel: 'lyria-3-pro-preview',
    bpm: 85,
    key: 'A Minor',
    genre: 'Cinematic Tension / Dark Hybrid Orchestral',
    prompt: 'Atmospheric cinematic pre-match tunnel tension, 85 BPM, A Minor, heavy rhythmic sub-bass pulsing, ominous cello ostinato, tense snare roll build-ups, escalating arena stakes, subtle stadium reverb, no vocals',
    synthIdWatermark: true,
    isLoopable: true
  },
  MATCH_LOW_PRESSURE: {
    id: 'MATCH_LOW_PRESSURE',
    moodName: 'In-Match — Low Pressure',
    contextDesc: 'Subdued, understated backing for steady tactical gameplay and possession build-up.',
    recommendedModel: 'lyria-3-pro-preview',
    bpm: 95,
    key: 'E Minor',
    genre: 'Minimalist Electronic / Tactical Ambient',
    prompt: 'Subdued tactical football match background theme, 95 BPM, E Minor, light ambient synth pads, steady percussive tick, calm analytical pulse for calculated playmaking, minimal arrangement, unobtrusive, no vocals',
    synthIdWatermark: true,
    isLoopable: true
  },
  MATCH_HIGH_PRESSURE: {
    id: 'MATCH_HIGH_PRESSURE',
    moodName: 'In-Match — High Pressure',
    contextDesc: 'Tense, driving, higher tempo when Match Pressure meter reaches critical levels.',
    recommendedModel: 'lyria-3-pro-preview',
    bpm: 132,
    key: 'B Minor',
    genre: 'High-Octane Cinematic / Action Percussion',
    prompt: 'Driving high-intensity football match pressure theme, 132 BPM, B Minor, aggressive synth bassline, fast acoustic and electronic drum rolls, relentless stadium pulse, high urgency and fast-paced action, intense focus, no vocals',
    synthIdWatermark: true,
    isLoopable: true
  },
  DERBY_DAY: {
    id: 'DERBY_DAY',
    moodName: 'Derby Day / High Stakes Rivalry',
    contextDesc: 'Ferocious, high-stakes rivalry variant with maximum intensity and orchestral weight.',
    recommendedModel: 'lyria-3-pro-preview',
    bpm: 140,
    key: 'F# Minor',
    genre: 'Orchestral Heavy Rock / Epic Rivalry Anthem',
    prompt: 'Ferocious high-stakes derby day rivalry battle theme, 140 BPM, F# Minor, heavy distorted guitar riffs, thundering orchestral drums, intense choir chants, fiery rivalry atmosphere, high adrenaline, epic crescendo, no vocals',
    synthIdWatermark: true,
    isLoopable: true
  },
  VICTORY: {
    id: 'VICTORY',
    moodName: 'Match Victory & Trophy Celebration',
    contextDesc: 'Triumphant, short celebratory sting for post-match jubilation and silverware.',
    recommendedModel: 'lyria-3-clip-preview',
    bpm: 124,
    key: 'C Major',
    genre: 'Celebratory Brass Fanfare / Arena EDM',
    prompt: 'Triumphant football trophy victory sting, 124 BPM, C Major, explosive brass fanfare, energetic stadium snare drop, celebratory stadium euphoria, short triumphant crescendo, glitter fireworks energy, no vocals',
    synthIdWatermark: true,
    isLoopable: false
  },
  DEFEAT: {
    id: 'DEFEAT',
    moodName: 'Defeat / Critical Setback',
    contextDesc: 'Somber, brief, low-key reflection after a painful loss or injury blow.',
    recommendedModel: 'lyria-3-clip-preview',
    bpm: 72,
    key: 'D Minor',
    genre: 'Melancholic Piano / Chamber Strings',
    prompt: 'Somber emotional football defeat theme, 72 BPM, D Minor, solo piano melody with slow mournful string pad, reflective acoustic guitar, heartbreak and quiet resolve, gentle decay, no vocals',
    synthIdWatermark: true,
    isLoopable: false
  },
  STORY_CUTSCENE: {
    id: 'STORY_CUTSCENE',
    moodName: 'Story Cutscene & Narrative Moments',
    contextDesc: 'Reflective, emotionally rich backing for cinematic story cutscenes.',
    recommendedModel: 'lyria-3-pro-preview',
    bpm: 88,
    key: 'F Major',
    genre: 'Cinematic Narrative / Emotional Acoustic',
    prompt: 'Reflective cinematic drama theme for football story cutscenes, 88 BPM, F Major, emotional piano, warm cello solo, gentle ambient textures, intimate and narrative-driven, delicate storytelling feel, no vocals',
    synthIdWatermark: true,
    isLoopable: true
  },
  RETIREMENT: {
    id: 'RETIREMENT',
    moodName: 'Retirement & Legacy Farewell',
    contextDesc: 'Nostalgic, warm, epic farewell for Testimonial matches and Career Hall of Fame.',
    recommendedModel: 'lyria-3-pro-preview',
    bpm: 78,
    key: 'G Major',
    genre: 'Nostalgic Cinematic Symphony',
    prompt: 'Nostalgic warm orchestral farewell theme for legendary footballer retirement, 78 BPM, G Major, rich string section, acoustic piano chords, warm woodwinds, honor, gratitude, and lifetime achievements, emotional finale, no vocals',
    synthIdWatermark: true,
    isLoopable: true
  }
};

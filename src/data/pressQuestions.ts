import { GameState } from '../store/GameContext';

export type PressTone = 'deflect' | 'defend' | 'criticise' | 'combative' | 'praise';

export interface PressQuestionEffect {
  trust?: number;
  morale?: number;
  fans?: number;
  mediaPerception?: number;
  teammates?: number;
}

export interface PressQuestionOption {
  text: string;
  tone: PressTone;
  effects: PressQuestionEffect;
}

export interface PressQuestion {
  id: string;
  journalistType: 'Friendly Local' | 'Aggressive Tabloid' | 'Tactical Nerd';
  condition: (state: GameState) => boolean;
  textFn: (state: GameState) => string;
  options: PressQuestionOption[];
}

export const PRESS_QUESTIONS: PressQuestion[] = [];

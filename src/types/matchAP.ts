export interface PitchTacticalOption {
  id: string;
  title: string;
  triggerPhase: 'halftime' | 'touchline_event' | 'stoppage_time';
  apCost: number;
  description: string;
  effects: {
    xgModifier?: number;        // e.g. +0.15 team xG generation
    defensiveRating?: number;  // e.g. +0.20 defensive block / tackle success
    conditionCost?: number;    // Extra condition drain on player/squad
    squadMoraleDelta?: number;
    foulRiskModifier?: number; // Higher chance of yellow/red cards
  };
}

export interface MidMatchAPState {
  matchAPAvailable: number; // Carry-over or allocated matchday AP (max 3-4 AP)
  activeTactics: string[];  // Active tactical overrides for the rest of the match
}

export const HALFTIME_TACTICS: PitchTacticalOption[] = [
  {
    id: 'ht_high_press',
    title: 'High-Press Overload',
    triggerPhase: 'halftime',
    apCost: 2,
    description: '+15% Team xG / Scoring Chance, -10% Condition drain on squad',
    effects: {
      xgModifier: 0.15,
      conditionCost: 10,
      foulRiskModifier: 0.1,
    }
  },
  {
    id: 'ht_park_bus',
    title: 'Park the Bus',
    triggerPhase: 'halftime',
    apCost: 2,
    description: '+20% Defensive Block, -25% Opponent Scoring Chance',
    effects: {
      defensiveRating: 0.20,
      xgModifier: -0.10,
    }
  },
  {
    id: 'ht_counter_attack',
    title: 'Direct Counter-Attack',
    triggerPhase: 'halftime',
    apCost: 2,
    description: 'Boosts pace on breakaways; increases opponent foul risk',
    effects: {
      xgModifier: 0.10,
      foulRiskModifier: -0.05,
    }
  },
  {
    id: 'ht_team_talk',
    title: 'Inspiring Team Talk',
    triggerPhase: 'halftime',
    apCost: 1,
    description: 'Restores +5 Squad Morale & +5% Composure',
    effects: {
      squadMoraleDelta: 5,
      conditionCost: -5, // slight condition recovery
    }
  }
];

export const TOUCHLINE_SHOUTS: PitchTacticalOption[] = [
  {
    id: 'shout_demand_more',
    title: 'Demand More!',
    triggerPhase: 'touchline_event',
    apCost: 1,
    description: '+5% Win rate on 50/50 duels for 15 mins; +5% Foul Risk',
    effects: {
      xgModifier: 0.05,
      foulRiskModifier: 0.05
    }
  },
  {
    id: 'shout_play_safe',
    title: 'Play Safe',
    triggerPhase: 'touchline_event',
    apCost: 1,
    description: 'Reduces card risk by 40%; lowers passing risk',
    effects: {
      defensiveRating: 0.05,
      foulRiskModifier: -0.40
    }
  },
  {
    id: 'stoppage_hero',
    title: 'All-Out Attack Push',
    triggerPhase: 'stoppage_time',
    apCost: 1,
    description: '(85\'+ only) +25% Goal chance in stoppage time; leaves defense vulnerable',
    effects: {
      xgModifier: 0.25,
      defensiveRating: -0.20
    }
  }
];

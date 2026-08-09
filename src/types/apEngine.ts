export type APPhase = 'standard_day' | 'matchday' | 'off_season';

export interface StaffAutomation {
  nutritionist: boolean; // Auto-restores +10% Condition daily
  privatePhysio: boolean; // Reduces injury risk & recovers fatigue faster
  prManager: boolean;    // Auto-generates +2 Reputation weekly
}

export interface LifestyleUpgrades {
  recoveryChamber: boolean; // +15% recovery speed
  privateJet: boolean; // +1 max AP
  luxuryHousing: boolean; // +1 max AP
}

export interface DynamicCostModifiers {
  teamCrisisActive: boolean; // -1 AP cost for Tactical Drills, +1 AP for Media
  derbyWeekActive: boolean;  // High stakes modifier
  agentPerkDiscount: number; // Reduced costs for career actions
}

export interface APState {
  phase: APPhase;
  currentAP: number;
  maxAP: number;
  baseAP: number; // Scales with career tier (8 to 12 AP)
  strainZoneUsed: number; // Max 2 extra AP borrowed (into negative)
  dailyActionCounts: Record<string, number>; // For repetition penalties (+1 AP per repeat)
  staff: StaffAutomation;
  lifestyle: LifestyleUpgrades;
  modifiers: DynamicCostModifiers;
}

export interface APAction {
  id: string;
  title: string;
  category: 'training' | 'recovery' | 'career' | 'team' | 'off_season';
  baseCost: number | 'ALL';
  durationText?: string;
  description: string;
  effects: {
    conditionDelta?: number;
    staminaDelta?: number;
    attributeXP?: Record<string, number>;
    managerTrustDelta?: number;
    moraleDelta?: number;
    agentRelationshipDelta?: number;
    reputationDelta?: number;
    cashDelta?: number;
    squadChemistryDelta?: number;
    injuryRiskDelta?: number; 
  };
}

export const AP_ACTION_CATALOG: APAction[] = [
  {
    id: 'train_solo',
    title: 'Focused Solo Session',
    category: 'training',
    baseCost: 3,
    durationText: '45 MINS',
    description: 'Intense individual technical drills after hours.',
    effects: {
      attributeXP: { technical: 20 },
      conditionDelta: -10
    }
  },
  {
    id: 'train_tactical',
    title: 'Tactical Drill',
    category: 'training',
    baseCost: 3,
    durationText: '60 MINS',
    description: 'Master team shapes and positional awareness.',
    effects: {
      attributeXP: { tactical: 15 },
      managerTrustDelta: 5,
      conditionDelta: -8
    }
  },
  {
    id: 'train_gym',
    title: 'Gym & Conditioning',
    category: 'training',
    baseCost: 2,
    durationText: '45 MINS',
    description: 'Physical strength and injury prevention gym work.',
    effects: {
      staminaDelta: 1,
      conditionDelta: -15
    }
  },
  {
    id: 'rec_icebath',
    title: 'Ice Bath & Physio',
    category: 'recovery',
    baseCost: 2,
    durationText: '30 MINS',
    description: 'Hydrotherapy and muscular recovery protocol.',
    effects: {
      conditionDelta: 20
    }
  },
  {
    id: 'rec_restday',
    title: 'Full Rest Day',
    category: 'recovery',
    baseCost: 'ALL',
    durationText: 'FULL DAY',
    description: 'Complete physical and mental shutdown to clear strain.',
    effects: {
      conditionDelta: 60
    }
  },
  {
    id: 'career_agent',
    title: 'Agent Consult',
    category: 'career',
    baseCost: 2,
    durationText: '1 HOUR',
    description: 'Review endorsement opportunities and contract trajectory.',
    effects: {
      agentRelationshipDelta: 5,
      reputationDelta: 10
    }
  },
  {
    id: 'career_media',
    title: 'Press Interview',
    category: 'career',
    baseCost: 2,
    durationText: '30 MINS',
    description: 'Speak with club journalists to build public profile.',
    effects: {
      reputationDelta: 15,
      managerTrustDelta: -3
    }
  },
  {
    id: 'team_bonding',
    title: 'Team Locker Room',
    category: 'team',
    baseCost: 2,
    durationText: '1 HOUR',
    description: 'Socialize with teammates and build chemistry.',
    effects: {
      moraleDelta: 10,
      squadChemistryDelta: 5
    }
  },
  {
    id: 'off_bootcamp',
    title: 'Summer Bootcamp',
    category: 'off_season',
    baseCost: 5,
    durationText: '3 DAYS',
    description: 'Rigorous off-season conditioning camp.',
    effects: {
      attributeXP: { physical: 30, technical: 20 },
      conditionDelta: -25
    }
  },
  {
    id: 'off_brand',
    title: 'Global Brand Tour',
    category: 'off_season',
    baseCost: 4,
    durationText: '2 DAYS',
    description: 'Commercial sponsor obligations abroad.',
    effects: {
      reputationDelta: 500,
      cashDelta: 25000,
      conditionDelta: -10
    }
  },
  {
    id: 'off_charity',
    title: 'Charity Match',
    category: 'off_season',
    baseCost: 3,
    durationText: '1 DAY',
    description: 'Foundation work and charity match for a good cause.',
    effects: {
      managerTrustDelta: 15,
      reputationDelta: 200
    }
  },
  {
    id: 'off_rest',
    title: 'Mental Reset',
    category: 'off_season',
    baseCost: 3,
    durationText: 'FULL WEEK',
    description: 'Complete physical and mental shutdown to clear strain.',
    effects: {
      conditionDelta: 100 // Fully recovers fatigue
    }
  }
];

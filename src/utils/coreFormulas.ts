import { Attributes } from '../types';

export const CoreFormulas = {
  // OVR Calculation based on position
  calculateOVR: (attributes: Attributes, position: string): number => {
    let weightSum = 0;
    let score = 0;

    const addWeight = (attr: number, weight: number) => {
      score += attr * weight;
      weightSum += weight;
    };

    if (position === 'GK') {
      // Goalkeepers use a different set of attributes ideally, but using standard for now if not defined.
      // We will assume standard attributes. 
      addWeight(attributes.composure, 2);
      addWeight(attributes.decisionMaking, 3);
      addWeight(attributes.vision, 1);
      addWeight(attributes.positioning, 4);
    } else if (position === 'CB') {
      addWeight(attributes.tackling, 3);
      addWeight(attributes.strength, 2);
      addWeight(attributes.positioning, 2);
      addWeight(attributes.heading, 2);
      addWeight(attributes.decisionMaking, 1);
    } else if (position === 'FB' || position === 'WB') {
      addWeight(attributes.pace, 2);
      addWeight(attributes.stamina, 2);
      addWeight(attributes.crossing, 2);
      addWeight(attributes.tackling, 2);
      addWeight(attributes.positioning, 1);
    } else if (position === 'CDM') {
      addWeight(attributes.tackling, 2);
      addWeight(attributes.stamina, 2);
      addWeight(attributes.passing, 2);
      addWeight(attributes.positioning, 2);
      addWeight(attributes.strength, 1);
    } else if (position === 'CM' || position === 'CAM') {
      addWeight(attributes.passing, 3);
      addWeight(attributes.vision, 3);
      addWeight(attributes.dribbling, 2);
      addWeight(attributes.composure, 1);
      addWeight(attributes.stamina, 1);
    } else if (position === 'W' || position === 'LM' || position === 'RM') {
      addWeight(attributes.pace, 3);
      addWeight(attributes.dribbling, 3);
      addWeight(attributes.crossing, 2);
      addWeight(attributes.vision, 1);
      addWeight(attributes.stamina, 1);
    } else if (position === 'ST' || position === 'CF') {
      addWeight(attributes.finishing, 4);
      addWeight(attributes.pace, 2);
      addWeight(attributes.positioning, 2);
      addWeight(attributes.strength, 1);
      addWeight(attributes.composure, 1);
    } else {
      // Fallback generic
      Object.values(attributes).forEach(val => addWeight(val as number, 1));
    }

    if (weightSum === 0) return 50;
    return Math.round(score / weightSum);
  },

  // Attribute Check Success Probability
  // baselineDiff is usually the OVR of the opponent or the difficulty of the action
  calculateSuccessProbability: (
    playerAttrValue: number, 
    baselineDiff: number, 
    difficultyTier: 'CASUAL' | 'STANDARD' | 'REALISTIC',
    modifiers: {
      pressure?: 'HIGH' | 'LOW' | 'NORMAL';
      weather?: 'RAIN' | 'SNOW' | 'CLEAR';
      staminaPercent?: number; // 0-100
    } = {}
  ): number => {
    // If playerAttrValue == baselineDiff, base chance is 60%
    let baseChance = 0.6 + ((playerAttrValue - baselineDiff) * 0.02);

    // Difficulty multiplier
    if (difficultyTier === 'CASUAL') baseChance += 0.15;
    if (difficultyTier === 'REALISTIC') baseChance -= 0.15;

    // Stamina penalty
    if (modifiers.staminaPercent !== undefined && modifiers.staminaPercent < 30) {
      baseChance -= 0.1;
    }

    // Pressure
    if (modifiers.pressure === 'HIGH') baseChance -= 0.05;
    if (modifiers.pressure === 'LOW') baseChance += 0.05;

    // Weather
    if (modifiers.weather === 'RAIN') baseChance -= 0.05; // Slippery
    if (modifiers.weather === 'SNOW') baseChance -= 0.10; // Hard to play

    return Math.max(0.05, Math.min(0.95, baseChance));
  },

  // Training Gains
  calculateTrainingGain: (
    baseGain: number,
    currentStat: number,
    potential: number,
    age: number,
    difficultyTier: 'CASUAL' | 'STANDARD' | 'REALISTIC',
    weeklyStatCapHit: boolean = false
  ): number => {
    let multiplier = 1.0;

    // Age curve
    if (age < 20) multiplier *= 1.5;
    else if (age < 24) multiplier *= 1.2;
    else if (age > 30) multiplier *= 0.5;
    else if (age > 34) multiplier *= 0.2;

    // Difficulty
    if (difficultyTier === 'CASUAL') multiplier *= 1.5;
    if (difficultyTier === 'REALISTIC') multiplier *= 0.7;

    // Potential ceiling
    if (currentStat >= potential) return 0; // Hard cap
    if (potential - currentStat <= 3) multiplier *= 0.5; // Diminishing returns approaching potential

    // Weekly cap
    if (weeklyStatCapHit) multiplier *= 0.2; // Diminishing returns for spamming one stat

    return baseGain * multiplier;
  },

  // Reputation & Trust Deltas
  calculateTrustDelta: (matchRating: number): number => {
    if (matchRating >= 9.0) return 6;
    if (matchRating >= 8.0) return 4;
    if (matchRating >= 7.0) return 2;
    if (matchRating >= 6.0) return 0;
    if (matchRating >= 5.0) return -2;
    return -5;
  },

  calculateReputationDelta: (eventMagnitude: 'SMALL' | 'MEDIUM' | 'LARGE', isPositive: boolean): number => {
    const base = eventMagnitude === 'LARGE' ? 5 : eventMagnitude === 'MEDIUM' ? 2 : 1;
    return isPositive ? base : -base;
  },

  // Injury Probability
  calculateInjuryProbability: (
    fatigue: number, // 0-100 (high = tired)
    susceptibilityLevel: number, // 1-5 (5 = most injury prone)
    matchContextRisk: number, // 0-1 (e.g. 0.2 for normal match, 0.5 for rough match)
    difficultyTier: 'CASUAL' | 'STANDARD' | 'REALISTIC',
    age: number
  ): number => {
    let risk = 0.01; // Base 1% chance per event/match segment
    
    // Fatigue modifier
    risk += (fatigue / 100) * 0.05;

    // Susceptibility modifier
    risk += (susceptibilityLevel - 3) * 0.01;

    // Age
    if (age > 30) risk += 0.02;

    // Context
    risk += matchContextRisk * 0.05;

    // Difficulty
    if (difficultyTier === 'REALISTIC') risk *= 1.3;
    if (difficultyTier === 'CASUAL') risk *= 0.7;

    return Math.max(0.001, risk);
  },

  // Financial
  calculateWageOffer: (ovr: number, clubTier: 'ELITE' | 'TITLE_CONTENDER' | 'UPPER_MID_TABLE' | 'MID_TABLE' | 'RELEGATION_BATTLE' | 'LOWER_LEAGUE', reputation: number): number => {
    // Base weekly wage in £
    let base = 1000;
    if (ovr > 85) base = 100000;
    else if (ovr > 80) base = 60000;
    else if (ovr > 75) base = 30000;
    else if (ovr > 70) base = 15000;
    else if (ovr > 65) base = 5000;

    // Tier multiplier
    let tierMult = 1.0;
    if (clubTier === 'ELITE') tierMult = 2.0;
    else if (clubTier === 'TITLE_CONTENDER') tierMult = 1.5;
    else if (clubTier === 'LOWER_LEAGUE') tierMult = 0.5;

    // Reputation bonus
    const repBonus = 1 + (reputation / 100) * 0.5;

    return Math.round(base * tierMult * repBonus / 1000) * 1000; // Round to nearest 1000
  },

  calculateTransferFee: (ovr: number, age: number, yearsLeftOnContract: number, buyerTier: string): number => {
    // Value in millions £
    let baseVal = 1.0;
    if (ovr > 90) baseVal = 100;
    else if (ovr > 85) baseVal = 60;
    else if (ovr > 80) baseVal = 30;
    else if (ovr > 75) baseVal = 15;
    else if (ovr > 70) baseVal = 5;
    else if (ovr > 65) baseVal = 2;

    // Age curve
    if (age < 21) baseVal *= 1.5;
    else if (age > 29) baseVal *= 0.7;
    else if (age > 33) baseVal *= 0.3;

    // Contract length
    if (yearsLeftOnContract <= 1) baseVal *= 0.6;
    else if (yearsLeftOnContract >= 4) baseVal *= 1.2;

    // Buyer tier tax
    if (buyerTier === 'ELITE') baseVal *= 1.2;

    return Math.max(0.5, Math.round(baseVal * 10) / 10);
  }
};

import { Player } from '../types';

export interface RecoveryDetails {
  tier: 'BASIC' | 'STANDARD' | 'PRO' | 'ELITE';
  clearance: number; // Recovery Debt points cleared weekly
  injurySusceptibilityMod: number; // Percent reduction in injury risk (e.g. -20 for 20% lower risk)
  injurySusceptibilityBaseOffset: number; // Flat deduction
  description: string;
}

/**
 * Calculates recovery and physical details based on current Lifestyle investments.
 */
export function getRecoveryDetails(player: Player): RecoveryDetails {
  const housing = player.lifestyleTier?.housing || 'Digs';
  const training = player.lifestyleTier?.training || 'Basic';
  const nutrition = player.lifestyleTier?.nutrition || 'Club';

  let tier: 'BASIC' | 'STANDARD' | 'PRO' | 'ELITE' = 'BASIC';
  let clearance = 10;
  let injurySusceptibilityMod = 0;
  let injurySusceptibilityBaseOffset = 0;
  let description = 'Club standard recovery. Basic dorms and public training ground access.';

  // 1. Determine Tier based on high-level combinations
  if (housing === 'Mansion' && nutrition === 'Private Chef' && training === 'Elite') {
    tier = 'ELITE';
    clearance = 45;
    injurySusceptibilityMod = 0.35; // 35% reduction
    injurySusceptibilityBaseOffset = 15;
    description = 'Elite recovery. State-of-the-art Hyperbaric chamber, full-time private chef, and custom biomechanical tracking.';
  } else if (housing === 'Mansion' || nutrition === 'Private Chef' || training === 'Elite') {
    tier = 'PRO';
    clearance = 30;
    injurySusceptibilityMod = 0.20; // 20% reduction
    injurySusceptibilityBaseOffset = 8;
    description = 'Professional tier recovery. Dedicated personal physio support or a curated nutritional diet plan.';
  } else if (housing === 'Apartment') {
    tier = 'STANDARD';
    clearance = 18;
    injurySusceptibilityMod = 0.08; // 8% reduction
    injurySusceptibilityBaseOffset = 3;
    description = 'Standard professional recovery. Comfortable city pad with access to quality rest facilities.';
  } else {
    tier = 'BASIC';
    clearance = 10;
    injurySusceptibilityMod = 0;
    injurySusceptibilityBaseOffset = 0;
    description = 'Basic recovery. Shared digs and standard meal facilities.';
  }

  // 2. Incremental bonuses from specific active items
  if (training === 'Pro') {
    clearance += 4;
    injurySusceptibilityBaseOffset += 4;
  }
  if (training === 'Elite') {
    clearance += 8;
    injurySusceptibilityBaseOffset += 8;
  }
  if (nutrition === 'Private Chef') {
    clearance += 6;
  }

  return {
    tier,
    clearance,
    injurySusceptibilityMod,
    injurySusceptibilityBaseOffset,
    description
  };
}

/**
 * Simulates weekly physical progression, applying the recovery debt and fitness calculations.
 */
export function processWeeklyPhysicalUpdate(player: Player, wasBenchedThisWeek: boolean): Player {
  const recovery = getRecoveryDetails(player);
  
  // 1. Calculate weekly added strain
  // Full match play adds 32 strain; bench adds 12 strain; no action adds 5 strain.
  let addedStrain = wasBenchedThisWeek ? 12 : 32;
  
  // Add training strain: 4 strain per weekly session
  const sessions = player.training?.weeklySessions?.clubOrganized || 0;
  addedStrain += sessions * 4.5;

  // 2. Clear debt via clearance speed
  const currentDebt = player.physicalCondition?.recoveryDebt || 0;
  const nextDebt = Math.max(0, Math.min(100, Math.round(currentDebt + addedStrain - recovery.clearance)));

  // 3. Match Fitness progression: Benched drops match fitness, playing raises it
  const currentMF = player.physicalCondition?.matchFitness || 70;
  let mfChange = wasBenchedThisWeek ? -6 : 10;
  const nextMF = Math.max(40, Math.min(100, currentMF + mfChange));

  // 4. Aging curve calculation (older players accumulate debt faster and clear slower)
  const ageFactor = Math.max(0, (player.age - 21) * 1.8);
  const backstoryFactor = player.backstory === 'FALLEN_PRODIGY' ? 12 : 0; // Fallen prodigies are injury prone

  // 5. Calculate base injury susceptibility
  let baseIS = nextDebt * 0.75 + ageFactor + backstoryFactor;
  // Apply lifestyle modifier and offset
  baseIS = baseIS * (1 - recovery.injurySusceptibilityMod) - recovery.injurySusceptibilityBaseOffset;
  const nextIS = Math.max(2, Math.min(95, Math.round(baseIS)));

  // 6. Fatigue decay
  const ageDecay = Math.max(0, (player.stats.apps / 500) * 5);
  let fatigueRec = 12 - ageDecay;
  if (player.lifestyleTier?.housing === 'Apartment') fatigueRec += 4;
  if (player.lifestyleTier?.housing === 'Mansion') fatigueRec += 8;
  
  const nextFatigue = Math.max(0, Math.min(100, player.fatigue - Math.round(fatigueRec)));

  // 7. Update structures
  const physicalCondition = {
    value: Math.max(10, Math.min(100, Math.round(nextMF * 0.65 + (100 - nextDebt) * 0.35 - (nextFatigue * 0.2)))),
    tier: (nextFatigue > 65 ? 'EXHAUSTED' : nextFatigue > 45 ? 'FATIGUED' : nextFatigue > 25 ? 'TIRED' : nextDebt > 40 ? 'FIT' : 'PEAK') as any,
    effects: {
      statPenalty: Math.max(0, Math.floor(nextFatigue / 15) + Math.floor(nextDebt / 18)),
      injuryRisk: Math.round(nextIS)
    },
    matchFitness: nextMF,
    recoveryDebt: nextDebt,
    injurySusceptibility: nextIS
  };

  const recoveryProfile = {
    tier: recovery.tier as any,
    speed: recovery.clearance,
    daysToPeak: 0,
    activeBonuses: [
      player.lifestyleTier?.housing === 'Mansion' ? 'Luxury Housing' : '',
      player.lifestyleTier?.nutrition === 'Private Chef' ? 'Tailored Diet' : '',
      player.lifestyleTier?.training === 'Elite' ? 'Hyperbaric Chamber' : player.lifestyleTier?.training === 'Pro' ? 'Personal Physio' : ''
    ].filter(Boolean)
  };

  return {
    ...player,
    fatigue: nextFatigue,
    physicalCondition,
    recoveryProfile
  };
}

import { Attributes, Position, SquadHierarchyTier } from '../types';

export function calculateOVR(attributes: Attributes, position: Position): number {
  let sum = 0;
  const keys = Object.keys(attributes) as (keyof Attributes)[];
  if (keys.length === 0) return 50;

  for (const key of keys) {
    sum += attributes[key] || 50;
  }
  
  return Math.max(1, Math.min(99, Math.round(sum / keys.length)));
}

export function evaluateHierarchyTier(
  ovr: number, 
  clubOvr: number, 
  managerTrust: number, 
  managerDiscipline: number, 
  clubRep: number, 
  isInjured: boolean,
  currentTier?: SquadHierarchyTier,
  age?: number
): SquadHierarchyTier {
  // If injured heavily/missing many games, might drop, but currently basic check
  
  // Combine all factors into a "Standing Score" out of 100
  // ovrDiff could be -10 to +10 usually
  const ovrDiff = ovr - clubOvr; 
  // Map ovrDiff to a 0-100 scale where 0 diff = 50
  const ovrScore = Math.max(0, Math.min(100, 50 + (ovrDiff * 3)));
  
  const standingScore = (ovrScore * 0.4) + (managerTrust * 0.3) + (managerDiscipline * 0.15) + (clubRep * 0.15);
  
  // High club rep overrides normal dropping
  if (clubRep > 90 && standingScore > 60) return 'Club Legend';
  
  // Youth logic
  if (currentTier === 'Youth') {
    if (age && age > 18) {
      // Must graduate
      if (standingScore < 35) return 'Exile';
      if (standingScore < 50) return 'Backup';
      return 'Rotation';
    } else {
      // Still eligible for youth
      if (standingScore > 50) {
        return 'Backup'; // Call up to senior squad
      }
      return 'Youth'; // Stay in academy
    }
  }

  // If age <= 18 and very low standing, they can be demoted to youth
  if (age && age <= 18 && standingScore < 30 && currentTier === 'Exile') {
    return 'Youth';
  }
  
  if (standingScore < 20) return 'Exile';
  if (standingScore < 35) return 'Squad Player';
  if (standingScore < 50) return 'Backup';
  if (standingScore < 60) return 'Rotation';
  if (standingScore < 75) return 'First Teamer';
  if (standingScore < 90) return 'Key Player';
  return 'Star Player';
}

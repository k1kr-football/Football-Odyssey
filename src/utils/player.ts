import { Attributes, Position, SquadHierarchyTier } from '../types';

export function calculateOVR(attributes: Attributes, position: Position): number {
  // A technically excellent but physically weak centre-back should be valued differently from a physically dominant one.
  
  // Base weights for different positions
  let weights: Partial<Record<keyof Attributes, number>> = {};
  
  switch (position) {
    case 'GK':
      weights = {
        decisionMaking: 0.3,
        agility: 0.4,
        composure: 0.15,
        passing: 0.1,
        vision: 0.05
      };
      break;
    case 'CB':
      weights = {
        tackling: 0.3,
        strength: 0.2,
        decisionMaking: 0.2,
        tacticalAwareness: 0.1,
        pace: 0.1,
        composure: 0.1
      };
      break;
    case 'LB':
    case 'RB':
      weights = {
        pace: 0.25,
        tackling: 0.15,
        stamina: 0.2,
        passing: 0.15,
        dribbling: 0.1,
        decisionMaking: 0.1,
        tacticalAwareness: 0.05
      };
      break;
    case 'CM':
      weights = {
        passing: 0.2,
        vision: 0.2,
        stamina: 0.15,
        firstTouch: 0.15,
        composure: 0.1,
        tackling: 0.1,
        tacticalAwareness: 0.1
      };
      break;
    case 'LM':
    case 'RM':
    case 'AM':
      weights = {
        passing: 0.2,
        vision: 0.15,
        dribbling: 0.2,
        firstTouch: 0.15,
        pace: 0.15,
        finishing: 0.05,
        tacticalAwareness: 0.1
      };
      break;
    case 'LW':
    case 'RW':
      weights = {
        pace: 0.25,
        dribbling: 0.25,
        finishing: 0.15,
        passing: 0.15,
        firstTouch: 0.1,
        tacticalAwareness: 0.05,
        stamina: 0.05
      };
      break;
    case 'ST':
      weights = {
        finishing: 0.3,
        pace: 0.15,
        decisionMaking: 0.1,
        tacticalAwareness: 0.1,
        dribbling: 0.1,
        strength: 0.1,
        composure: 0.05,
        firstTouch: 0.1
      };
      break;
    default:
      // Fallback equal weights
      const allAttrs = Object.keys(attributes) as (keyof Attributes)[];
      allAttrs.forEach(a => weights[a] = 1 / allAttrs.length);
      break;
  }
  
  let ovr = 0;
  for (const [key, weight] of Object.entries(weights)) {
    ovr += (attributes[key as keyof Attributes] || 50) * (weight as number);
  }
  
  return Math.max(1, Math.min(99, Math.round(ovr)));
}

export function evaluateHierarchyTier(
  ovr: number, 
  clubOvr: number, 
  managerTrust: number, 
  managerDiscipline: number, 
  clubRep: number, 
  isInjured: boolean
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
  
  if (standingScore < 20) return 'Exile';
  if (standingScore < 35) return 'Squad Player';
  if (standingScore < 50) return 'Backup';
  if (standingScore < 60) return 'Rotation';
  if (standingScore < 75) return 'First Teamer';
  if (standingScore < 90) return 'Key Player';
  return 'Star Player';
}

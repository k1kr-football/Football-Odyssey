import { Player } from '../types';

export type ManagerPhilosophy = 'TACTICAL_RIGID' | 'FREE_FLOWING' | 'DEFENSIVE_SOLIDITY' | 'HIGH_PRESS' | 'DIRECT_PLAY';

export interface PhilosophyRecord {
  philosophy: ManagerPhilosophy;
  matchesPlayed: number;
  averageRating: number;
}

export function assignManagerPhilosophy(): ManagerPhilosophy {
  const philosophies: ManagerPhilosophy[] = [
    'TACTICAL_RIGID', 'FREE_FLOWING', 'DEFENSIVE_SOLIDITY', 'HIGH_PRESS', 'DIRECT_PLAY'
  ];
  return philosophies[Math.floor(Math.random() * philosophies.length)];
}

export function updateCareerIdentity(player: Player, currentPhilosophy: ManagerPhilosophy, matchRating: number): Player {
  const p = { ...player };
  if (!p.careerIdentity) {
    p.careerIdentity = [];
  }

  const existing = p.careerIdentity.find(i => i.philosophy === currentPhilosophy);
  if (existing) {
    const total = existing.matchesPlayed * existing.averageRating;
    existing.matchesPlayed += 1;
    existing.averageRating = (total + matchRating) / existing.matchesPlayed;
  } else {
    p.careerIdentity.push({
      philosophy: currentPhilosophy,
      matchesPlayed: 1,
      averageRating: matchRating
    });
  }
  
  return p;
}

export function getPhilosophyFitText(player: Player, philosophy: ManagerPhilosophy): string {
  if (!player.careerIdentity || player.careerIdentity.length === 0) return "Unknown fit with manager's style.";

  const record = player.careerIdentity.find(i => i.philosophy === philosophy);
  if (!record || record.matchesPlayed < 3) return "Unproven under this tactical philosophy.";

  if (record.averageRating >= 7.5) {
    return "Exceptional fit. You have historically thrived under this philosophy.";
  } else if (record.averageRating >= 6.8) {
    return "Solid fit. You adapt well to this manager's style.";
  } else {
    return "Questionable fit. You have struggled to find consistency in this system before.";
  }
}

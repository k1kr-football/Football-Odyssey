import { Club } from '../types';
import { ManagerPhilosophy } from './managerPhilosophy';

/**
 * Football Odyssey — Club Prestige, Stadium Capacity, Youth Academies & Tactical DNA
 */

/**
 * 1. Stadium Capacity Calculation
 * Returns real stadium capacity if curated, or derives capacity using:
 * estimatedCapacity = baseForLeagueTier * (averageSquadCA / leagueTierAverageCA)
 */
export function getClubStadiumCapacity(club: Club): number {
  if (club.stadiumCapacity && club.stadiumCapacity > 0) {
    return club.stadiumCapacity;
  }

  const league = (club.league || '').toLowerCase();
  let baseForLeagueTier = 10000;
  let leagueTierAverageCA = 60;

  if (
    league.includes('premier') ||
    league.includes('liga') ||
    league.includes('serie a') ||
    league.includes('bundesliga') ||
    league.includes('ligue 1') ||
    league.includes('série a')
  ) {
    baseForLeagueTier = 35000;
    leagueTierAverageCA = 76;
  } else if (
    league.includes('championship') ||
    league.includes('segunda') ||
    league.includes('serie b') ||
    league.includes('2.') ||
    league.includes('ligue 2') ||
    league.includes('série b')
  ) {
    baseForLeagueTier = 20000;
    leagueTierAverageCA = 68;
  } else if (league.includes('league one') || league.includes('one') || league.includes('3.')) {
    baseForLeagueTier = 8000;
    leagueTierAverageCA = 61;
  } else if (league.includes('league two') || league.includes('two') || league.includes('4.')) {
    baseForLeagueTier = 4000;
    leagueTierAverageCA = 54;
  } else {
    if (club.tier === 'Elite') { baseForLeagueTier = 45000; leagueTierAverageCA = 82; }
    else if (club.tier === 'Strong') { baseForLeagueTier = 30000; leagueTierAverageCA = 75; }
    else if (club.tier === 'Mid') { baseForLeagueTier = 18000; leagueTierAverageCA = 68; }
    else if (club.tier === 'Lower') { baseForLeagueTier = 8000; leagueTierAverageCA = 60; }
    else { baseForLeagueTier = 4000; leagueTierAverageCA = 52; }
  }

  const squadCA = club.ovr || leagueTierAverageCA;
  const caRatio = squadCA / Math.max(1, leagueTierAverageCA);
  const estimatedCapacity = Math.round(baseForLeagueTier * caRatio);

  return Math.max(2500, Math.min(100000, estimatedCapacity));
}

/**
 * 2. Club Prestige Score (0-100)
 * Reflects historical weight, trophy history, and global brand standing.
 * Returns curated prestigeScore if explicitly defined, otherwise derives via proxy formula.
 */
export function getClubPrestigeScore(club: Club): number {
  if (club.prestigeScore !== undefined && club.prestigeScore !== null && club.prestigeScore > 0) {
    return club.prestigeScore;
  }

  const ovr = club.ovr || 70;
  let basePrestige = 50;

  switch (club.tier) {
    case 'Elite':
      basePrestige = 80 + Math.round((ovr - 80) * 1.5);
      return Math.min(98, Math.max(75, basePrestige));
    case 'Strong':
      basePrestige = 65 + Math.round((ovr - 73) * 1.2);
      return Math.min(78, Math.max(55, basePrestige));
    case 'Mid':
      basePrestige = 45 + Math.round((ovr - 65) * 1.0);
      return Math.min(58, Math.max(35, basePrestige));
    case 'Lower':
      basePrestige = 28 + Math.round((ovr - 55) * 0.8);
      return Math.min(38, Math.max(20, basePrestige));
    case 'Foundation':
    default:
      basePrestige = 12 + Math.round((ovr - 45) * 0.5);
      return Math.min(22, Math.max(5, basePrestige));
  }
}

/**
 * Calculates World Reputation Boost when player joins or starts at a club.
 */
export function getClubWorldReputationBoost(club: Club): number {
  const prestige = getClubPrestigeScore(club);
  return Math.round((prestige / 100) * 15);
}

/**
 * 3. Youth Academy Rating (0-100)
 * Returns curated academyRating if explicitly defined, otherwise derives via proxy formula.
 */
export function getClubAcademyRating(club: Club): number {
  if (club.academyRating !== undefined && club.academyRating !== null && club.academyRating > 0) {
    return club.academyRating;
  }

  const prestige = getClubPrestigeScore(club);
  let tierBase = 50;
  if (club.tier === 'Elite') tierBase = 75;
  else if (club.tier === 'Strong') tierBase = 62;
  else if (club.tier === 'Mid') tierBase = 50;
  else if (club.tier === 'Lower') tierBase = 38;
  else tierBase = 25;

  const derived = Math.round((tierBase * 0.5) + (prestige * 0.5));
  return Math.min(99, Math.max(15, derived));
}

/**
 * Calculates potential bonus/penalty for a youth prospect generated at a club.
 */
export function calculateAcademyProspectPotentialBonus(club?: Club, ratingOverride?: number): number {
  const rating = ratingOverride ?? (club ? getClubAcademyRating(club) : 50);
  return Math.round(((rating - 50) / 50) * 8);
}

/**
 * 4. Tactical Identity Alignment
 * Resolves hiring tendency for Manager AI archetype & philosophy based on club tactical DNA.
 */
export function getManagerPhilosophyForClub(club?: Club | { tacticalIdentity?: ManagerPhilosophy }): ManagerPhilosophy {
  const philosophies: ManagerPhilosophy[] = [
    'TACTICAL_RIGID', 'FREE_FLOWING', 'DEFENSIVE_SOLIDITY', 'HIGH_PRESS', 'DIRECT_PLAY'
  ];

  if (club && club.tacticalIdentity) {
    // 70% chance to hire aligned with club tactical DNA, 30% against type
    if (Math.random() < 0.70) {
      return club.tacticalIdentity as ManagerPhilosophy;
    }
  }

  return philosophies[Math.floor(Math.random() * philosophies.length)];
}

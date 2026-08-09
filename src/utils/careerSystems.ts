import { UnifiedNPCEngine } from './npcEngine';
import { Club, DayOfWeek, Position, SubPosition, InboxMessage, ProgressionGate, PlayerProgression, SavedAgent, ActiveNegotiation, Player, StoryArc } from '../types';
import { CLUBS } from '../data/teams';
import { NATIONALITY_NAMES } from '../data/playerNames';
import { getClubSquad } from '../data/sheetSquads';
import { REAL_PLAYER_PROFILES } from '../data/realPlayerProfiles';
import { STORY_ARCS } from '../data/storyArcs';
import { getMentalFatigueLevel } from './wellbeingEngine';
import { seedClubRoster } from './realPlayerSeeding';

export function calculateDetailedMatchSelection(
  player: Player,
  competitionType: string
): { status: 'STARTER' | 'SUBSTITUTE' | 'UNUSED'; reason: string; score: number } {
  let score = 50;
  const reasons: string[] = [];

  // 1. Standing in Team / Role
  const status = player.contract?.status || 'Rotation';
  if (status === 'Star Player' || status === 'Key Player') {
    score += 32;
    reasons.push('Key Star Role');
  } else if (status === 'First Teamer') {
    score += 24;
    reasons.push('First-Team Regular');
  } else if (status === 'Rotation' || status === 'Squad Player') {
    score += 10;
    reasons.push('Rotation Option');
  } else if (status === 'Backup' as any) {
    score -= 10;
    reasons.push('Backup Status');
  } else if (status === 'Youth' || status === 'Fringe' || (status as string) === 'Prospect') {
    score -= 18;
    reasons.push('Young Prospect / Fringe Role');
  } else if (status === 'Exile') {
    score -= 55;
    reasons.push('Out of Manager Favor (Exiled)');
  }

  // 2. Manager Trust & Relationship
  const trust = typeof player.trust === 'number' ? player.trust : 50;
  const managerRel = player.relationships?.manager ?? trust;
  const combinedTrust = (trust + managerRel) / 2;

  if (combinedTrust >= 80) {
    score += 20;
    reasons.push('High Manager Trust (80%+)');
  } else if (combinedTrust >= 65) {
    score += 10;
    reasons.push('Good Manager Confidence');
  } else if (combinedTrust < 40) {
    score -= 20;
    reasons.push('Low Manager Trust');
  } else if (combinedTrust < 25) {
    score -= 35;
    reasons.push('Strained Manager Relationship');
  }

  // 3. OVR Rating relative to Team Standard
  const userClub = CLUBS.find(c => c.symbol === player.currentClubSymbol) || { ovr: 70 };
  const ovrDiff = player.ovr - userClub.ovr;
  if (ovrDiff >= 5) {
    score += 18;
    reasons.push(`Top Quality OVR (${player.ovr} vs ${userClub.ovr} team avg)`);
  } else if (ovrDiff >= 1) {
    score += 8;
  } else if (ovrDiff <= -5) {
    score -= 20;
    reasons.push(`OVR Below Team Standard (${player.ovr} vs ${userClub.ovr})`);
  } else if (ovrDiff <= -2) {
    score -= 10;
  }

  // 4. Training Attendance & Conduct
  const skippedTraining = !!player.stateFlags?.skippedTrainingThisWeek;
  if (skippedTraining) {
    score -= 45; // Severe penalty for skipping training!
    reasons.push('DROPPED/BENCHED: Skipped Mandatory Training Session');
  } else {
    score += 10; // Reward training attendance
  }

  if (player.stateFlags?.managerClash || player.stateFlags?.feudWithManager) {
    score -= 25;
    reasons.push('Disciplinary Friction with Manager');
  }

  // 5. Fatigue & Stamina Condition
  const fatigue = typeof player.fatigue === 'number' ? player.fatigue : 0;
  if (fatigue >= 80) {
    score -= 45;
    reasons.push(`RESTED: Critical Physical Fatigue (${fatigue}%)`);
  } else if (fatigue >= 65) {
    score -= 25;
    reasons.push(`RESTED: High Fatigue (${fatigue}%)`);
  } else if (fatigue >= 50) {
    score -= 12;
    reasons.push(`Elevated Fatigue (${fatigue}%)`);
  } else if (fatigue < 25) {
    score += 8;
    reasons.push('Peak Physical Fitness');
  }

  // 6. Recent Match Form & Morale
  const form = typeof player.form === 'number' ? player.form : 50;
  const morale = typeof player.morale === 'number' ? player.morale : 50;
  if (form >= 78) {
    score += 12;
    reasons.push(`In-Form Performance (${form})`);
  } else if (form < 40) {
    score -= 12;
    reasons.push(`Poor Recent Form (${form})`);
  }

  if (morale < 30) {
    score -= 8;
    reasons.push('Low Morale');
  }

  // 7. International / Friendly / Cup Specifics
  if (competitionType === 'INTERNATIONAL') {
    const intlStatus = player.stateFlags?.intlStatus || 'Youth';
    if (intlStatus === 'Senior Captain' || intlStatus === 'Senior Regular') {
      if (fatigue > 70) {
        return { status: 'SUBSTITUTE', reason: 'International regular rested due to fatigue', score };
      }
      return { status: 'STARTER', reason: 'National Team Starter & Core Leader', score };
    } else if (intlStatus === 'Youth' || intlStatus === 'Senior Fringe') {
      if (score > 40) return { status: 'SUBSTITUTE', reason: 'National Squad Bench Option', score };
      return { status: 'UNUSED', reason: 'Left out of international matchday squad', score };
    }
    return { status: 'UNUSED', reason: 'Not called up for international fixture', score };
  }

  if (competitionType === 'FRIENDLY' || competitionType === 'DOMESTIC_CUP') {
    if (status === 'Star Player' || status === 'Key Player') {
      if (fatigue > 40) {
        score -= 20;
        reasons.push('Rested for Cup/Friendly Rotation');
      }
    } else if (status === 'Youth' || status === 'Fringe' || (status as string) === 'Backup' || (status as string) === 'Prospect') {
      score += 18;
      reasons.push('Given Starting Opportunity in Cup/Friendly');
    }
  }

  // Determine final status
  let selectionStatus: 'STARTER' | 'SUBSTITUTE' | 'UNUSED';
  if (score >= 55) {
    selectionStatus = 'STARTER';
  } else if (score >= 32) {
    selectionStatus = 'SUBSTITUTE';
  } else {
    selectionStatus = 'UNUSED';
  }

  const mainReason = reasons.length > 0 ? reasons.slice(0, 2).join(' • ') : 'Tactical selection decision';

  return {
    status: selectionStatus,
    reason: mainReason,
    score
  };
}

export function calculateMatchSelection(player: Player, competitionType: string): 'STARTER' | 'SUBSTITUTE' | 'UNUSED' {
  return calculateDetailedMatchSelection(player, competitionType).status;
}

// ============================================================================
// SYSTEM 1: PROGRESSION SCALING OVERHAUL
// ============================================================================

/**
 * Returns scaled attribute growth based on the current OVR band of the player.
 */
export function getScaledAttributeGain(ovr: number, baseGain: number, isMatch: boolean, difficulty: 'CASUAL' | 'STANDARD' | 'REALISTIC' = 'STANDARD'): number {
  let scale = 1.0;
  if (ovr < 66) {
    scale = isMatch ? 0.15 : 0.3;
  } else if (ovr < 73) {
    scale = isMatch ? 0.10 : 0.2;
  } else if (ovr < 79) {
    scale = isMatch ? 0.07 : 0.15;
  } else if (ovr < 84) {
    scale = isMatch ? 0.04 : 0.08;
  } else if (ovr < 89) {
    scale = isMatch ? 0.02 : 0.04;
  } else {
    scale = isMatch ? 0.01 : 0.02;
  }

  // Apply base gain multiplier (e.g. if drill success was outstanding)
  let result = baseGain * scale;

  // Apply difficulty multipliers
  if (difficulty === 'CASUAL') {
    result *= 1.5;
  } else if (difficulty === 'REALISTIC') {
    result *= 0.7;
  }

  return Number(result.toFixed(3));
}

/**
 * Returns reputation gain or loss based on match performance rating.
 */
export function getReputationDelta(competitionType: 'LEAGUE' | 'DOMESTIC_CUP' | 'EUROPEAN' | 'INTERNATIONAL', isDerby: boolean, rating: number): number {
  if (rating < 6.0) return -1.0;
  if (rating < 7.0) return 0.0;

  switch (competitionType) {
    case 'INTERNATIONAL':
      return 4.0;
    case 'EUROPEAN':
      return 3.0;
    case 'DOMESTIC_CUP':
      return 1.5;
    case 'LEAGUE':
    default:
      return isDerby ? 2.0 : 0.5;
  }
}

/**
 * Checks if the player has unlocked a new progression gate and returns the updated progression object.
 */
export function updateProgressionState(
  current: PlayerProgression,
  ovr: number,
  apps: number,
  goals: number,
  assists: number,
  trophiesCount: number,
  avgRating: number
): { progression: PlayerProgression; gateUnlockedMessage?: string; newGate?: ProgressionGate } {
  const next = { ...current };
  next.matchesPlayed = apps;
  next.averageRating = avgRating;
  next.goalsAndAssists = goals + assists;

  let newGate: ProgressionGate | undefined;
  let gateUnlockedMessage: string | undefined;

  // Check from highest to lowest possible transitions
  if (next.gate === 'STAR' && ovr >= 89 && apps >= 300) {
    next.gate = 'LEGEND';
    newGate = 'LEGEND';
    gateUnlockedMessage = '🏆 PROGRESSION GATE UNLOCKED: LEGEND! You have achieved footballing immortality. The elite superclubs of the world will stop at nothing to sign you. You are on track for the Ballon d\'Or and the Hall of Fame.';
  } else if (next.gate === 'ESTABLISHED' && ovr >= 84 && apps >= 200 && trophiesCount >= 2) {
    next.gate = 'STAR';
    newGate = 'STAR';
    gateUnlockedMessage = '⭐ PROGRESSION GATE UNLOCKED: STAR! Your name is recognized globally. The absolute biggest clubs on earth are tracking your training sessions. The pressure is immense, but so is the glory.';
  } else if (next.gate === 'BREAKTHROUGH' && ovr >= 79 && apps >= 120 && trophiesCount >= 1) {
    next.gate = 'ESTABLISHED';
    newGate = 'ESTABLISHED';
    gateUnlockedMessage = '📈 PROGRESSION GATE UNLOCKED: ESTABLISHED! You are no longer just a hot prospect—you are a proven senior professional. You are a regular on the national scout sheets.';
  } else if (next.gate === 'RECOGNITION' && ovr >= 73 && apps >= 60 && (next.goalsAndAssists >= 10 || avgRating >= 7.1)) {
    next.gate = 'BREAKTHROUGH';
    newGate = 'BREAKTHROUGH';
    gateUnlockedMessage = '🚀 PROGRESSION GATE UNLOCKED: BREAKTHROUGH! The world is starting to realize what you can do. Mid-to-high tier clubs are actively scouting you, and first endorsement inquiries are arriving.';
  } else if (next.gate === 'COMPETENCY' && ovr >= 66 && apps >= 30 && avgRating >= 7.0) {
    next.gate = 'RECOGNITION';
    newGate = 'RECOGNITION';
    gateUnlockedMessage = '🔍 PROGRESSION GATE UNLOCKED: RECOGNITION! Mid-tier scouts are attending your matches. Your consistency in training and matches has paid off. Keep raising your game!';
  } else if (apps >= 15 && ovr >= 55) {
    // If somehow initialized at a baseline lower than COMPETENCY
    if (next.gate as any === 'INITIAL' || !next.gate) {
      next.gate = 'COMPETENCY';
      newGate = 'COMPETENCY';
      gateUnlockedMessage = '⚽ PROGRESSION GATE UNLOCKED: COMPETENCY! You have established yourself as a reliable first-team squad rotation option.';
    }
  }

  // Calculate percentage progress toward the NEXT gate
  let progress = 0;
  if (next.gate === 'COMPETENCY') {
    const ovrPct = Math.min(100, (ovr / 66) * 100);
    const appsPct = Math.min(100, (apps / 30) * 100);
    const ratingPct = Math.min(100, (avgRating / 7.0) * 100);
    progress = Math.round((ovrPct + appsPct + ratingPct) / 3);
  } else if (next.gate === 'RECOGNITION') {
    const ovrPct = Math.min(100, (ovr / 73) * 100);
    const appsPct = Math.min(100, (apps / 60) * 100);
    const gaPct = Math.min(100, Math.max((next.goalsAndAssists / 10) * 100, (avgRating / 7.1) * 100));
    progress = Math.round((ovrPct * 0.4) + (appsPct * 0.3) + (gaPct * 0.3));
  } else if (next.gate === 'BREAKTHROUGH') {
    const ovrPct = Math.min(100, (ovr / 79) * 100);
    const appsPct = Math.min(100, (apps / 120) * 100);
    const trophyPct = trophiesCount >= 1 ? 100 : 0;
    progress = Math.round((ovrPct * 0.5) + (appsPct * 0.3) + (trophyPct * 0.2));
  } else if (next.gate === 'ESTABLISHED') {
    const ovrPct = Math.min(100, (ovr / 84) * 100);
    const appsPct = Math.min(100, (apps / 200) * 100);
    const trophyPct = Math.min(100, (trophiesCount / 2) * 100);
    progress = Math.round((ovrPct * 0.4) + (appsPct * 0.4) + (trophyPct * 0.2));
  } else if (next.gate === 'STAR') {
    const ovrPct = Math.min(100, (ovr / 89) * 100);
    const appsPct = Math.min(100, (apps / 300) * 100);
    progress = Math.round((ovrPct * 0.5) + (appsPct * 0.5));
  } else {
    progress = 100;
  }

  next.gateProgress = Math.max(0, Math.min(100, progress));
  return { progression: next, gateUnlockedMessage, newGate };
}

export function checkStoryArcProgression(
  player: Player,
  apps: number
): { updatedArc: StoryArc; inboxMessage?: InboxMessage } {
  if (!player.storyArc) return { updatedArc: player.storyArc as StoryArc };
  
  const arc = { ...player.storyArc };
  let triggeredBeat = null;

  // Find the next untriggered beat based on appearances
  const nextBeatIdx = arc.beats.findIndex(b => !b.triggered);
  if (nextBeatIdx === -1) return { updatedArc: arc }; // All beats triggered

  const thresholds = [1, 10, 20, 50, 100, 200]; // Map to beats 1 through 6
  
  if (nextBeatIdx < thresholds.length && apps >= thresholds[nextBeatIdx]) {
    // Trigger this beat
    arc.beats[nextBeatIdx].triggered = true;
    arc.currentAct = arc.beats[nextBeatIdx].act;
    arc.currentBeat = arc.beats[nextBeatIdx].beat;
    arc.progress = Math.round(((nextBeatIdx + 1) / arc.beats.length) * 100);
    triggeredBeat = arc.beats[nextBeatIdx];
  }

  if (triggeredBeat) {
    const msg: InboxMessage = {
      id: `story_beat_${Date.now()}`,
      sender: 'NARRATIVE',
      subject: `Story Arc: ${triggeredBeat.name}`,
      content: triggeredBeat.narrative,
      read: false,
      type: 'NEWS',
      timestamp: 'N/A', // Will be set by game context
      choices: [
        { text: 'Embrace Your Arc', type: 'story_embrace' },
        { text: 'Reject Your Arc', type: 'story_reject' },
        { text: 'Question Your Arc', type: 'story_question' }
      ]
    };
    return { updatedArc: arc, inboxMessage: msg };
  }

  return { updatedArc: arc };
}

/**
 * Enforces realistic wages and club availability based on player's OVR band.
 */
export function getTransferWageBracket(ovr: number): { wageMin: number; wageMax: number; tierLimit: string } {
  if (ovr < 66) {
    return { wageMin: 500, wageMax: 2000, tierLimit: 'Lower League (EFL League Two/One)' };
  } else if (ovr < 73) {
    return { wageMin: 2000, wageMax: 8000, tierLimit: 'Mid-Tier Domestic (Championship)' };
  } else if (ovr < 79) {
    return { wageMin: 8000, wageMax: 20000, tierLimit: 'Top Domestic, Lower European' };
  } else if (ovr < 84) {
    return { wageMin: 20000, wageMax: 50000, tierLimit: 'Elite clubs' };
  } else if (ovr < 89) {
    return { wageMin: 50000, wageMax: 150000, tierLimit: 'Superclubs' };
  } else {
    return { wageMin: 150000, wageMax: 450000, tierLimit: 'Elite of the Elite (Any Superclub)' };
  }
}


// ============================================================================
// SYSTEM 2: BACKSTORY-DRIVEN CLUB ENTRY
// ============================================================================

export interface ContractOffer {
  clubSymbol: string;
  clubName: string;
  wage: number;
  length: number;
  trust: number;
  squadRole: string;
  description: string;
  ovrAdjustment: number;
}

/**
 * Pick an appropriate trial host club symbol based on player backstory origin.
 */
export function getTrialHostClubByOrigin(backstory: string): Club {
  let filtered = CLUBS;
  if (backstory === 'LATE_BLOOMER') {
    filtered = CLUBS.filter(c => ['Lower', 'Foundation'].includes(c.tier));
  } else if (backstory === 'FROM_SCRATCH' || backstory === 'THE_REFUGEE' || backstory === 'LATE_REPLACEMENT') {
    filtered = CLUBS.filter(c => c.tier === 'Foundation');
  } else if (backstory === 'STREET_PRODIGY' || backstory === 'SECOND_SPORT_CONVERT') {
    filtered = CLUBS.filter(c => ['Mid', 'Lower'].includes(c.tier));
  } else if (backstory === 'FALLEN_PRODIGY' || backstory === 'NEPOTISM_CASE') {
    filtered = CLUBS.filter(c => ['Mid', 'Strong'].includes(c.tier));
  } else if (backstory === 'EXILE' || backstory === 'ACADEMY_GRADUATE') {
    filtered = CLUBS.filter(c => ['Strong', 'Elite'].includes(c.tier));
  }

  if (filtered.length === 0) filtered = CLUBS;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Returns trial match narrative text depending on backstory.
 */
export function getTrialNarrativeIntro(backstory: string, hostClubName: string): string {
  switch (backstory) {
    case 'ACADEMY_GRADUATE':
      return `Welcome to the first-team academy showcase. You are playing in the final U21 pre-season intrasquad match for ${hostClubName}. The first-team manager, senior scouts, and directors are watching you from the main gantry with their arms crossed. You are 45 minutes away from senior promotion or being sent out on loan.`;
    case 'FALLEN_PRODIGY':
      return `A closed-door showcase trial has been arranged at ${hostClubName}. This is your first real match action in over 18 months following a career-threatening injury. The scouts are whispering about your physical decline—you must prove your technical brilliance and spatial awareness are intact to salvage your career.`;
    case 'LATE_BLOOMER':
      return `The Sunday League Cup Final in South London. Over 300 passionate locals are screaming, but more importantly, two professional scouts from lower-league teams (including ${hostClubName}) are standing by the corner flag writing in their notebooks. This is the 90 minutes you have spent your whole life waiting for.`;
    case 'STREET_PRODIGY':
      return `Your viral freestyle video clips got you invited to this 45-minute developmental showcase with ${hostClubName}. The coaches are highly skeptical—they know you have trick reels, but they want to see if you have match-ready tactical awareness, defensive discipline, and decision-making.`;
    case 'EXILE':
      return `Having walked away from the high wages of foreign leagues, you are back in Europe, fighting for contract relevance. You have been granted a trial showcase against ${hostClubName}'s reserves. The European scouts want to see if you still have the hunger and speed to survive at this level.`;
    case 'NEPOTISM_CASE':
      return `A closed-door showcase at ${hostClubName} has been arranged—everyone knows your uncle made the call. The coaches are watching with crossed arms, looking for any excuse to dismiss you as a pampered legacy pick. You must prove your technical ability is entirely your own.`;
    case 'THE_REFUGEE':
      return `You arrived in this country with nothing but resilience. Now, you stand on the training ground of ${hostClubName}. The local boys look at you sideways, but you've played on dust fields with higher stakes. The scouts want to see if your composure holds up on manicured grass.`;
    case 'LATE_REPLACEMENT':
      return `You weren't even supposed to be in this showcase for ${hostClubName}. A starter tweaked their hamstring in warmups, and the coach pointed at you. Expectations are rock bottom—you're just making up the numbers. But that means you have absolutely nothing to lose.`;
    case 'SECOND_SPORT_CONVERT':
      return `You shattered the athletic testing records this morning, but now it's time for the 11-a-side trial match for ${hostClubName}. The purists on the sideline are waiting to expose your lack of tactical awareness and raw first touch. You need to use your monstrous physical tools to mask your footballing gaps.`;
    case 'FROM_SCRATCH':
    default:
      return `You are one of 50 hopeful trialists at ${hostClubName}'s annual open scouting trial day. The odds are stacked heavily against you. This final 11-a-side training ground match is your single, fleeting opportunity to stand out from the pack and get offered a professional deal.`;
  }
}

/**
 * Generates trial match contract offers based on final match rating and player origin.
 */
export function generateTrialContractOffers(backstory: string, rating: number, hostClub: Club): ContractOffer[] {
  const ratingLabel = rating >= 9.0 ? 'SENSATIONAL' : rating >= 7.0 ? 'SOLID' : rating >= 6.0 ? 'MODERATE' : 'POOR';
  
  // Find other potential clubs for offer pool
  let otherPool = CLUBS.filter(c => c.symbol !== hostClub.symbol);
  if (backstory === 'LATE_BLOOMER' || backstory === 'FROM_SCRATCH' || backstory === 'THE_REFUGEE' || backstory === 'LATE_REPLACEMENT') {
    otherPool = otherPool.filter(c => ['Lower', 'Foundation'].includes(c.tier));
  } else if (backstory === 'STREET_PRODIGY' || backstory === 'SECOND_SPORT_CONVERT') {
    otherPool = otherPool.filter(c => ['Mid', 'Lower'].includes(c.tier));
  } else if (backstory === 'FALLEN_PRODIGY' || backstory === 'NEPOTISM_CASE') {
    otherPool = otherPool.filter(c => ['Mid', 'Strong'].includes(c.tier));
  } else {
    otherPool = otherPool.filter(c => ['Strong', 'Elite'].includes(c.tier));
  }
  if (otherPool.length < 2) otherPool = CLUBS.filter(c => c.symbol !== hostClub.symbol);
  
  const shuffledOther = [...otherPool].sort(() => 0.5 - Math.random());
  const club2 = shuffledOther[0] || hostClub;
  const club3 = shuffledOther[1] || hostClub;

  const offers: ContractOffer[] = [];

  // Offer 1: Host Club (always offer something, but parameters vary heavily on rating)
  if (rating >= 9.0) {
    offers.push({
      clubSymbol: hostClub.symbol,
      clubName: hostClub.name,
      wage: 1500,
      length: 3,
      trust: 65,
      squadRole: 'Rotation',
      description: `Your trial-host club is absolutely blown away by your sensational performance. The manager wants you directly in the senior rotation squad immediately.`,
      ovrAdjustment: 2
    });
  } else if (rating >= 7.0) {
    offers.push({
      clubSymbol: hostClub.symbol,
      clubName: hostClub.name,
      wage: 900,
      length: 2,
      trust: 50,
      squadRole: 'Backup',
      description: `A very solid display. The manager sees you as a promising development project and wants to secure you on a backup senior deal.`,
      ovrAdjustment: 0
    });
  } else if (rating >= 6.0) {
    offers.push({
      clubSymbol: hostClub.symbol,
      clubName: hostClub.name,
      wage: 600,
      length: 1,
      trust: 35,
      squadRole: 'Exile',
      description: `You did enough to show potential, but the coaching staff is cautious. They offer a short 1-year developmental deal with low initial trust.`,
      ovrAdjustment: -1
    });
  } else {
    // Poor performance
    offers.push({
      clubSymbol: hostClub.symbol,
      clubName: hostClub.name,
      wage: 350,
      length: 1,
      trust: 15,
      squadRole: 'Exile',
      description: `A struggling trial match. The club offers a absolute minimum-wage reserve squad deal, warning you that you are on thin ice.`,
      ovrAdjustment: -2
    });
  }

  // Offer 2 & 3: Other interested scouts
  if (rating >= 9.0) {
    // Club 2: Major step up or high-wage offer
    offers.push({
      clubSymbol: club2.symbol,
      clubName: club2.name,
      wage: 2000,
      length: 3,
      trust: 55,
      squadRole: 'Rotation',
      description: `Scouts from ${club2.name} are buzzing. They want to hijack your trial host and integrate you quickly into their attacking first team.`,
      ovrAdjustment: 3
    });
    // Club 3: Secure long-term deal
    offers.push({
      clubSymbol: club3.symbol,
      clubName: club3.name,
      wage: 1200,
      length: 5,
      trust: 60,
      squadRole: 'Rotation',
      description: `A highly lucrative, secure 5-year project offer from ${club3.name} with generous signing bonuses.`,
      ovrAdjustment: 1
    });
  } else if (rating >= 7.0) {
    offers.push({
      clubSymbol: club2.symbol,
      clubName: club2.name,
      wage: 850,
      length: 2,
      trust: 45,
      squadRole: 'Backup',
      description: `A respectable developmental contract offer to join their academy squad list.`,
      ovrAdjustment: 0
    });
    offers.push({
      clubSymbol: club3.symbol,
      clubName: club3.name,
      wage: 1000,
      length: 1,
      trust: 40,
      squadRole: 'Backup',
      description: `A shorter, slightly higher-paying deal. They want to assess your growth over 12 months.`,
      ovrAdjustment: 0
    });
  } else {
    // Low rating: only lower clubs show interest
    offers.push({
      clubSymbol: club2.symbol,
      clubName: club2.name,
      wage: 450,
      length: 1,
      trust: 25,
      squadRole: 'Exile',
      description: `A minor league scout liked your physical drive and offers a low-risk 1-year contract.`,
      ovrAdjustment: -1
    });
  }

  return offers;
}


// ============================================================================
// SYSTEM 3 & 5: DYNAMIC NPC & SQUAD ROSTER GENERATION
// ============================================================================

export interface GeneratedNPC {
  id: string;
  name: string;
  role: 'AGENT' | 'MANAGER' | 'ASSISTANT' | 'PHYSIO' | 'TEAMMEATE' | 'FAMILY_MEMBER' | 'JOURNALIST';
  nationality: string;
  archetype: 'FIERY' | 'CALM' | 'JOKER' | 'SHARK' | 'PROTECTOR' | 'INTENSE' | 'CHARISMATIC' | 'SKEPTICAL' | 'MENTOR' | 'ENIGMATIC';
  agenda: 'MONEY' | 'CAREER' | 'REPUTATION' | 'LOYALTY' | 'DRESSING_ROOM_HARMONY';
  commission?: number; // for agents only
  relationship: number; // 0-100
}

export interface GeneratedPlayer {
  id: string;
  name: string;
  position: Position;
  ovr: number;
  age: number;
  nationality: string;
  archetype: string;
  potential: number;
  isRealPlayerSeeded?: boolean;
  dataSourceTag?: 'CURATED_REAL_DATA' | 'REAL_PROFILE_SEEDED' | 'PROCEDURAL_PENDING_REAL_DATA' | 'PROCEDURAL';
}

export interface GeneratedClub {
  symbol: string;
  name: string;
  managerName: string;
  dataSourceTag?: 'CURATED_REAL_DATA' | 'REAL_PROFILE_SEEDED' | 'PROCEDURAL_PENDING_REAL_DATA' | 'PROCEDURAL';
  isProceduralPendingRealData?: boolean;
  squad: {
    starters: GeneratedPlayer[];
    substitutes: GeneratedPlayer[];
    reserves: GeneratedPlayer[];
    youthProspects: GeneratedPlayer[];
  };
  starPlayers: string[];
}

/**
 * Returns a fully random name based on a given nationality from the name pool.
 */
export function getRandomNameByNationality(nationality: string): string {
  const nat = nationality === 'England' || nationality === 'England' ? 'England' :
              nationality === 'Spain' ? 'Spain' :
              nationality === 'Italy' ? 'Italy' :
              nationality === 'Germany' ? 'Germany' :
              nationality === 'France' ? 'France' :
              nationality === 'Netherlands' ? 'Netherlands' :
              nationality === 'Belgium' ? 'Belgium' :
              nationality === 'Portugal' ? 'Portugal' :
              nationality === 'Brazil' ? 'Brazil' :
              nationality === 'Argentina' ? 'Argentina' :
              nationality === 'United States' || nationality === 'USA' ? 'United States' :
              nationality === 'Saudi Arabia' ? 'Saudi Arabia' :
              nationality === 'Japan' ? 'Japan' :
              nationality === 'Nigeria' ? 'Nigeria' :
              nationality === 'Ghana' ? 'Ghana' :
              nationality === 'Ivory Coast' ? 'Ivory Coast' :
              nationality === 'Norway' ? 'Norway' :
              nationality === 'Sweden' ? 'Sweden' :
              nationality === 'Poland' ? 'Poland' :
              nationality === 'Egypt' ? 'Egypt' :
              nationality === 'Morocco' ? 'Morocco' :
              nationality === 'South Korea' ? 'South Korea' :
              nationality === 'Senegal' ? 'Senegal' :
              nationality === 'Australia' ? 'Australia' : 'England';

  const pool = NATIONALITY_NAMES[nat] || NATIONALITY_NAMES['England'];
  const first = pool.first[Math.floor(Math.random() * pool.first.length)];
  const last = pool.last[Math.floor(Math.random() * pool.last.length)];
  return `${first} ${last}`;
}

/**
 * Generates persistent NPCs (Agents, Journalists, Family) for the save file.
 */
export function generateSaveNPCs(engine: UnifiedNPCEngine): { agents: GeneratedNPC[]; journalists: GeneratedNPC[]; family: GeneratedNPC[] } {
  const archetypes: GeneratedNPC['archetype'][] = ['FIERY', 'CALM', 'JOKER', 'SHARK', 'PROTECTOR', 'INTENSE', 'CHARISMATIC', 'SKEPTICAL', 'MENTOR', 'ENIGMATIC'];
  const agendas: GeneratedNPC['agenda'][] = ['MONEY', 'CAREER', 'REPUTATION', 'LOYALTY'];
  const nationalities = Object.keys(NATIONALITY_NAMES);

  // Generate 35 agents
  const agents: GeneratedNPC[] = [];
  for (let i = 0; i < 35; i++) {
    const nat = nationalities[Math.floor(Math.random() * nationalities.length)];
    const arch = archetypes[Math.floor(Math.random() * archetypes.length)];
    const comm = i < 5 ? 5 : i < 15 ? 10 : i < 25 ? 15 : i < 32 ? 20 : 25; // Rookie (5) -> Hungry (10) -> Shark (15) -> Super (20) -> Legend (25)
    agents.push({
      id: `agent_${i}_${Date.now()}`,
      name: getRandomNameByNationality(nat),
      role: 'AGENT',
      nationality: nat,
      archetype: arch,
      agenda: agendas[Math.floor(Math.random() * agendas.length)],
      commission: comm,
      relationship: 50
    });
  }

  // Generate 15 journalists
  const journalists: GeneratedNPC[] = [];
  for (let i = 0; i < 15; i++) {
    const nat = nationalities[Math.floor(Math.random() * nationalities.length)];
    journalists.push({
      id: `journal_${i}_${Date.now()}`,
      name: getRandomNameByNationality(nat),
      role: 'JOURNALIST',
      nationality: nat,
      archetype: archetypes[Math.floor(Math.random() * archetypes.length)],
      agenda: 'REPUTATION',
      relationship: 50
    });
  }

  // Generate Family
  const family: GeneratedNPC[] = [
    {
      id: `fam_parent_${Date.now()}`,
      name: getRandomNameByNationality('England'),
      role: 'FAMILY_MEMBER',
      nationality: 'England',
      archetype: 'PROTECTOR',
      agenda: 'LOYALTY',
      relationship: 90
    },
    {
      id: `fam_sibling_${Date.now()}`,
      name: getRandomNameByNationality('England'),
      role: 'FAMILY_MEMBER',
      nationality: 'England',
      archetype: 'JOKER',
      agenda: 'LOYALTY',
      relationship: 85
    }
  ];

  return { agents, journalists, family };
}

/**
 * Generates full realistic rosters for all CLUBS in the database.
 * Seeds real players from realPlayerProfiles and sheet data at save creation,
 * infers age from CA/PA gap, and procedurally generates Brazilian squads tagged for future swap.
 */
export function generateAllClubsRosters(engine?: UnifiedNPCEngine): Record<string, GeneratedClub> {
  const result: Record<string, GeneratedClub> = {};
  const e = engine || new UnifiedNPCEngine();
  
  for (const club of CLUBS) {
    result[club.symbol] = seedClubRoster(club, e);
  }

  return result;
}


// ============================================================================
// SYSTEM 4: AGENT ACQUISITION SYSTEM
// ============================================================================

/**
 * Checks if any agents approach the unrepresented player after a match.
 */
export function checkAgentOffers(
  apps: number,
  avgRating: number,
  agentsPool: GeneratedNPC[]
): SavedAgent[] {
  if (apps < 5) return [];

  // Determine eligible tiers
  let eligibleComm = [5, 10];
  if (apps >= 40 && avgRating >= 7.3) {
    eligibleComm = [15, 20];
  } else if (apps >= 20 && avgRating >= 7.0) {
    eligibleComm = [10, 15];
  }

  const matches = agentsPool.filter(a => eligibleComm.includes(a.commission || 5));
  if (matches.length === 0) return [];

  // Pick up to 2 random matched agents
  const shuffled = [...matches].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2).map(a => {
    let tier: SavedAgent['tier'] = 'Rookie';
    if (a.commission === 10) tier = 'Hungry';
    else if (a.commission === 15) tier = 'Shark';
    else if (a.commission === 20) tier = 'Super Agent';
    else if (a.commission === 25) tier = 'Legend';

    return {
      id: a.id,
      name: a.name,
      nationality: a.nationality,
      archetype: a.archetype as any,
      agenda: a.agenda as any,
      commission: a.commission || 10,
      tier,
      relationship: 50
    };
  });
}


// ============================================================================
// SYSTEM 6: REAL CALENDAR DATES MAPPING
// ============================================================================

/**
 * Maps a season week and day to a real world calendar date (starting 6 July 2026).
 */
export function getFormattedCalendarDate(week: number, day: DayOfWeek): string {
  const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayIdx = days.indexOf(day);
  
  // Real dates starts July 6th, 2026 (MON)
  const base = new Date('2026-07-06');
  base.setDate(base.getDate() + (week - 1) * 7 + dayIdx);

  return base.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}


// ============================================================================
// SYSTEM 7: NPC BEHAVIOR VARIETY
// ============================================================================

/**
 * Returns dynamic behavioral dialogue reaction from any NPC based on their archetype.
 */
export function getNPCArchetypeDialogue(
  archetype: string,
  eventTrigger: 'MATCH_WIN' | 'MATCH_LOSS' | 'POOR_PERFORMANCE' | 'GOOD_PERFORMANCE' | 'TRANSFER_DEMAND',
  npcName: string,
  npcRole: string
): string {
  switch (eventTrigger) {
    case 'MATCH_WIN':
      if (archetype === 'FIERY') {
        return `"${npcName} is shouting, grabbing your shoulders! 'SENSATIONAL WIN! That is what I am talking about! You gave absolutely everything out there. We celebrate tonight, but we double the training intensity tomorrow!'"`;
      } else if (archetype === 'CALM') {
        return `"${npcName} gives you a firm handshake and a reassuring nod. 'A highly efficient and tactical performance today. The data shows we held our lines perfectly. Let's analyze the video to see where we can optimize further.'"`;
      } else if (archetype === 'JOKER') {
        return `"${npcName} grabs a water bottle and sprays it over you. 'UNBELIEVABLE! I told you if we won I would buy the entire squad kebabs tonight. Get dressed, we are going to the local spot!'"`;
      } else {
        return `"${npcName} smiles broadly. 'Superb result. The fans are buzzing, the board is happy, and the team cohesion is excellent.'"`;
      }

    case 'MATCH_LOSS':
      if (archetype === 'FIERY') {
        return `"${npcName} slams his notebook onto the bench, pacing back and forth with a red face. 'SHAMBOLIC! You played like amateurs! If I see anyone smiling on the coach back, they are running 10km in the morning!'"`;
      } else if (archetype === 'CALM') {
        return `"${npcName} sits quietly next to you. 'Take a breath. It's a painful loss, but we cannot react emotionally. We got caught out on transition, and that is a tactical structural error, not a failure of character. We correct it together.'"`;
      } else if (archetype === 'JOKER') {
        return `"${npcName} sighs and shrugs. 'Ah well, we got absolutely battered, didn't we? Put it behind you lads, it's only a game. The sun still rises tomorrow.'"`;
      } else if (archetype === 'INTENSE') {
        return `"${npcName} stares at you. 'Completely unacceptable. We lacked work rate and tactical discipline. Expect a brutal session on Tuesday.'"`;
      } else {
        return `"${npcName} shakes his head in disappointment. 'That hurts our league standings badly. We must do better.'"`;
      }

    case 'POOR_PERFORMANCE':
      if (archetype === 'SKEPTICAL') {
        return `"${npcName} corners you in the lounge. 'Honestly? You looked completely lost out there. Your positioning was miles off, and you were pulling away from tackles. Professional football doesn't wait for passengers.'"`;
      } else if (archetype === 'MENTOR') {
        return `"${npcName} pulls you aside during warmdown. 'Hey, look at me. Everyone has bad games. I remember having a 5/10 match in front of 60,000 when I was your age. You recover, you hit the training pitch, and you prove them wrong next week.'"`;
      } else if (archetype === 'SHARK') {
        return `"${npcName} messages you. 'That performance is going to damage our contract valuation. You need to keep things simple and secure some G/A next week to rebuild your media leverage.'"`;
      } else {
        return `"${npcName} grimaces. 'Tough shift today. You seemed slightly off the pace. We need you focused.'"`;
      }

    case 'GOOD_PERFORMANCE':
      if (archetype === 'MENTOR') {
        return `"${npcName} claps your back. 'Immaculate display, kid. Your vision was sublime, and you played with real confidence. I am proud of your growth.'"`;
      } else if (archetype === 'SKEPTICAL') {
        return `"${npcName} nods slowly. 'A good performance today. But the real test is consistency. Do it three matches in a row, then I will be impressed.'"`;
      } else if (archetype === 'SHARK') {
        return `"${npcName} smiles, rubbing his hands together. 'Magnificent! I already have journalists preparing articles on you. We are going to put massive pressure on the club for an upgraded contract by Monday!'"`;
      } else {
        return `"${npcName} grins. 'Outstanding work rate today. You completely dominated your opponent.'"`;
      }

    case 'TRANSFER_DEMAND':
    default:
      if (archetype === 'SHARK') {
        return `"${npcName} says in a low voice: 'Leave the talking to me. I will go to the press and leak rumors that you are unhappy. We will force their hand and get you that big money move. Just stay quiet.'"`;
      } else if (archetype === 'PROTECTOR') {
        return `"${npcName} looks worried. 'Are you absolutely sure you want to force a transfer? Moving clubs is highly risky for a young player's development. I want to make sure your career is safe, not just chase high transfer fees.'"`;
      } else if (archetype === 'FIERY') {
        return `"${npcName} flares up! 'You want to leave?! You think you are too big for this club? Hand in a transfer request then, but don't expect any favors from me!'"`;
      } else {
        return `"${npcName} sighs. 'If you feel your future lies elsewhere, we will look into our options. But you must maintain your professionalism on the pitch.'"`;
      }
  }
}


// ============================================================================
// SYSTEM 9: CONTRACT NEGOTIATION DEPTH
// ============================================================================

/**
 * Calculates whether a contract counter-offer is acceptable to the club based on trade-offs.
 */
export function evaluateContractCounterOffer(
  negotiation: ActiveNegotiation,
  wage: number,
  length: number,
  bonus: number,
  releaseClause: number,
  loyaltyBonus: number,
  appearanceFee: number,
  agentTier: 'Rookie' | 'Hungry' | 'Shark' | 'Super Agent' | 'Legend' | 'None'
): { accepted: boolean; roundsRemaining: number; message: string; counterOffer?: Partial<ActiveNegotiation> } {
  
  let score = 100;
  
  // 1. Wage Trade-offs
  if (wage > negotiation.clubBudgetLimit) {
    return { accepted: false, roundsRemaining: negotiation.roundsRemaining - 1, message: "Declined. The demanded wage is completely outside our club's financial budget constraints." };
  }
  
  const wageDiffPct = (wage - negotiation.proposedWage) / negotiation.proposedWage;
  if (wageDiffPct > 0) {
    score -= wageDiffPct * 120; // heavier penalty for greedy demands
  } else {
    score += Math.abs(wageDiffPct) * 30; // reward for team-friendly compromises
  }

  // 2. Length Trade-offs
  // Clubs prefer mid-length (3-4 years). Extreme lengths are riskier.
  if (length === 5) score -= 15; // long commitment demands slightly lower wage
  if (length === 1) score -= 10; // club loses transfer leverage, wants lower wage or appearance penalties

  // 3. Signing Bonus Trade-off
  if (bonus > wage * 20) {
    score -= 25; // extremely high signing bonus requests are heavily penalized
  }

  // 4. Release Clause Trade-off (Club takes risk letting player have low release clause)
  if (releaseClause > 0) {
    const minReleaseVal = wage * 1000;
    if (releaseClause < minReleaseVal) {
      score -= 30; // extremely low release clause is a massive risk for club
    } else {
      score += 10; // high release clause protects club asset
    }
  }

  // 5. Loyalty & Appearance Fee impacts
  score -= (loyaltyBonus / 2000) * 10;
  score -= (appearanceFee / 500) * 15;

  // 6. Agent Influence
  let agentModifier = 0;
  if (agentTier === 'Legend') agentModifier = 18;
  else if (agentTier === 'Super Agent') agentModifier = 12;
  else if (agentTier === 'Shark') agentModifier = 8;
  else if (agentTier === 'Hungry') agentModifier = 4;
  else if (agentTier === 'Rookie') agentModifier = 0;
  else agentModifier = -10; // negotiating without an agent is harder!
  
  score += agentModifier;

  const roundsLeft = negotiation.roundsRemaining - 1;

  if (score >= 60) {
    return {
      accepted: true,
      roundsRemaining: roundsLeft,
      message: "Deal accepted! The club board has agreed to your counter-terms. We are excited to lock down your future."
    };
  } else if (roundsLeft <= 0) {
    return {
      accepted: false,
      roundsRemaining: 0,
      message: "Negotiations collapsed. The board has walked away from the negotiation table, refusing further counter-proposals."
    };
  } else {
    // Generate an intermediate counter offer
    const compromisedWage = Math.round(negotiation.proposedWage + (wage - negotiation.proposedWage) * 0.4);
    const compromisedBonus = Math.round(negotiation.proposedBonus + (bonus - negotiation.proposedBonus) * 0.5);
    const compromisedLoyalty = Math.round(loyaltyBonus * 0.4);
    
    return {
      accepted: false,
      roundsRemaining: roundsLeft,
      message: `The club has rejected your terms. However, they have submitted a compromised counter-proposal. You have ${roundsLeft} negotiation round(s) left.`,
      counterOffer: {
        proposedWage: Math.min(negotiation.clubBudgetLimit, compromisedWage),
        proposedBonus: compromisedBonus,
        proposedLoyaltyBonus: compromisedLoyalty,
        proposedLength: length,
        proposedReleaseClause: releaseClause
      }
    };
  }
}

/**
 * Initializes career progression and configuration values on the player object.
 */
export function initializePlayerCareer(
  player: Player,
  difficulty: 'CASUAL' | 'STANDARD' | 'REALISTIC' = 'STANDARD'
): Player {
  const trialHost = getTrialHostClubByOrigin(player.backstory);
  
  const baseArc = STORY_ARCS[player.backstory];
  const storyArc: StoryArc = {
    ...baseArc,
    drivingQuestion: player.backstoryDetails?.coreWound?.drivingQuestion || baseArc.drivingQuestion,
    currentAct: 1,
    currentBeat: 0, // 0 means no beats triggered yet
    progress: 0,
    resolution: null,
    beats: baseArc.beats.map(b => ({ ...b, triggered: false }))
  };

  const initialFamilyRel = player.backstoryDetails?.familySituation?.startingRelationship ?? player.relationships?.family ?? 75;

  return {
    ...player,
    relationships: {
      ...player.relationships,
      family: initialFamilyRel
    },
    mentalFatigue: 15,
    mentalFatigueDetails: getMentalFatigueLevel(15),
    difficulty,
    startingClubSymbol: trialHost.symbol,
    currentClubSymbol: trialHost.symbol,
    hometownClubSymbol: player.hometownClubSymbol || (() => {
      const potential = CLUBS.filter(c => c.symbol !== trialHost.symbol);
      const matched = potential.find(c => c.league === trialHost.league) || potential[0] || CLUBS[0];
      return matched.symbol;
    })(),
    storyArc,
    journalists: [
      {
        id: 'journo_alfie',
        name: 'Alfie Grealish',
        type: 'PROVOCATEUR',
        relationship: 25,
        tier: 'ENEMY',
        history: ['Asked an aggressive tabloid question before your debut.']
      },
      {
        id: 'journo_marcus',
        name: 'Marcus Sterling',
        type: 'INSIDER',
        relationship: 50,
        tier: 'NEUTRAL',
        history: ['Neutral profile reporter for Sky Sports.']
      },
      {
        id: 'journo_elena',
        name: 'Elena Rostova',
        type: 'FAN',
        relationship: 70,
        tier: 'FRIEND',
        history: ['Co-host of the local club fan channel.']
      }
    ],
    matchAnalysis: [],
    progression: {
      gate: 'COMPETENCY',
      gateProgress: 0,
      reputation: 0,
      reputationGrowthHistory: [],
      matchesPlayed: 0,
      averageRating: 6.0,
      totalRatingsSum: 0,
      goalsAndAssists: 0
    },
    stateFlags: {
      historyFlags: { isTrialOngoing: true },
      openThreads: {},
      eventCooldowns: {},
      preseasonEvaluation: {
        friendlyAppearances: 0,
        friendlyRatingsSum: 0,
        provisionalStatus: player.contract.status,
        originalStatus: player.contract.status,
        injuries: 0
      }
    },
    savedAgent: null,
    activeNegotiation: null
  };
}


export function generatePreseasonReportCard(player: Player): any {
    const avgRating = (player.progression?.averageRating || 6.0);
    const starts = player.stats?.apps || 0; // rough proxy for preseason
    let newStatus = player.contract?.status || 'Rotation';
    let trustDelta = 0;
    
    let evalText = "";
    if (avgRating >= 8.0) {
        newStatus = 'Key Player';
        trustDelta = 20;
        evalText = "You have been absolutely unplayable in preseason. The manager has torn up his original plans and is building the team around you.";
    } else if (avgRating >= 7.0) {
        newStatus = 'First Teamer';
        trustDelta = 10;
        evalText = "A strong showing in the friendlies. You've cemented your spot in the starting eleven for the league opener.";
    } else if (avgRating >= 6.0) {
        newStatus = 'Rotation';
        trustDelta = -5;
        evalText = "A mixed preseason. You'll get minutes, but you haven't done enough to demand a guaranteed start.";
    } else {
        newStatus = 'Backup';
        trustDelta = -15;
        evalText = "A very poor preseason campaign. The manager is unconvinced and you'll be starting the season on the bench.";
    }
    
    // If injured heavily during preseason
    if (player.isInjured) {
       newStatus = 'Backup';
       evalText += " However, your injury means you'll be sidelined as the season kicks off.";
    }

    return {
        inboxMessage: {
            id: `preseason_report_${Date.now()}`,
            sender: 'ASSISTANT MANAGER',
            subject: 'Preseason Report Card & Squad Status',
            content: `Preseason has concluded. Here is the coaching staff's assessment of your performances across the trial window:\n\n${evalText}\n\nStarting Squad Status: ${newStatus}`,
            read: false,
            type: 'BOARD',
            timestamp: 'MON 09:00',
            choices: [{ text: 'I understand.', type: 'ack' }]
        },
        newStatus,
        trustDelta
    };
}

export function applyPreseasonResults(player: Player, reportData: any): Player {
    if (!player.contract) return player;
    return {
        ...player,
        contract: { ...player.contract, status: reportData.newStatus },
        trust: Math.max(0, Math.min(100, (player.trust || 50) + reportData.trustDelta))
    };
}

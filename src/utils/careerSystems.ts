import { Player, Club, InboxMessage, StoryArc, SquadHierarchyTier, Position } from '../types';
import { CLUBS } from '../data/teams';
import { 
  getClubPrestigeScore, 
  getClubWorldReputationBoost, 
  getClubAcademyRating, 
  getManagerPhilosophyForClub, 
  getClubStadiumCapacity 
} from './clubPrestige';

export interface GeneratedPlayer {
  id: string;
  name: string;
  position: Position;
  ovr: number;
  age: number;
  role?: 'STARTER' | 'SUB' | 'RES' | 'YOUTH';
  wage?: number;
  nationality?: string;
  archetype?: string;
  potential?: number;
  isRealPlayerSeeded?: boolean;
  dataSourceTag?: string;
  personalityArchetype?: string;
}

export interface GeneratedClub {
  symbol: string;
  name: string;
  league: string;
  roster?: GeneratedPlayer[];
  managerName?: string;
  dataSourceTag?: string;
  isProceduralPendingRealData?: boolean;
  squad?: {
    starters: GeneratedPlayer[];
    substitutes: GeneratedPlayer[];
    reserves: GeneratedPlayer[];
    youthProspects: GeneratedPlayer[];
  };
  starPlayers?: string[];
}

export function getFormattedCalendarDate(week: number, day: string = 'MON'): string {
  const months = ['AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'];
  const safeWeek = Math.max(1, week || 1);
  const monthIdx = Math.min(11, Math.max(0, Math.floor((safeWeek - 1) / 4.3)));
  const monthName = months[monthIdx] || 'AUG';
  const dayNum = Math.min(28, ((safeWeek - 1) % 4) * 7 + (day === 'MON' ? 2 : day === 'WED' ? 4 : day === 'FRI' ? 6 : day === 'SAT' ? 7 : 1));
  return `${day} ${dayNum} ${monthName}`;
}

export function getTrialHostClubByOrigin(origin: string): Club {
  const defaultClub = CLUBS.find(c => c.league === 'EFL Championship') || CLUBS[0];
  return defaultClub;
}

export function generateTrialContractOffers(backstory: any, matchRating: number, trialHost: Club) {
  const primaryWage = Math.max(300, Math.round(matchRating * 150));
  return [
    {
      id: `offer_host_${Date.now()}`,
      clubSymbol: trialHost.symbol,
      clubName: trialHost.name,
      wage: primaryWage,
      length: 2,
      lengthYears: 2,
      squadRole: matchRating >= 7.5 ? 'Rotation' : 'Backup',
      trust: matchRating >= 7.0 ? 60 : 45,
      ovrAdjustment: matchRating >= 8.0 ? 1 : 0,
      description: 'Host Trial Club Offer'
    },
    {
      id: `offer_lower_${Date.now()}`,
      clubSymbol: 'PLY',
      clubName: 'Plymouth Argyle',
      wage: Math.round(primaryWage * 1.1),
      length: 3,
      lengthYears: 3,
      squadRole: 'Key Player',
      trust: 70,
      ovrAdjustment: 0,
      description: 'Championship Starting Role Offer'
    },
    {
      id: `offer_academy_${Date.now()}`,
      clubSymbol: 'SUN',
      clubName: 'Sunderland',
      wage: Math.round(primaryWage * 0.9),
      length: 2,
      lengthYears: 2,
      squadRole: 'Rotation',
      trust: 55,
      ovrAdjustment: 1,
      description: 'Development Project Offer'
    }
  ];
}

export function getTrialNarrativeIntro(backstory: any): string {
  return "Scouts and coaches line the touchline as you prepare for your make-or-break trial fixture.";
}

export function initializePlayerCareer(player: Player, difficulty: string): Player {
  const baseTrust = difficulty === 'REALISTIC' ? 35 : difficulty === 'STANDARD' ? 50 : 65;
  const clubObj = CLUBS.find(c => c.symbol.toUpperCase() === (player.currentClubSymbol || '').toUpperCase());

  let prestigeRepBoost = 5;
  let academyRating = 50;
  let managerPhilosophy = 'HIGH_PRESS';
  let stadiumCapacity = 15000;

  if (clubObj) {
    const prestigeScore = getClubPrestigeScore(clubObj);
    prestigeRepBoost = getClubWorldReputationBoost(clubObj);
    academyRating = getClubAcademyRating(clubObj);
    managerPhilosophy = getManagerPhilosophyForClub(clubObj);
    stadiumCapacity = getClubStadiumCapacity(clubObj);

    console.log(`[Club-Joining System] Initialized Career at ${clubObj.name} (${clubObj.symbol}):`);
    console.log(`  ✓ 1. World Reputation: Prestige Score ${prestigeScore}/100 -> World Rep Boost +${prestigeRepBoost}`);
    console.log(`  ✓ 2. Academy Rating: ${academyRating}/100 -> Development Facilities Linked`);
    console.log(`  ✓ 3. Manager Philosophy: ${managerPhilosophy} -> Tactical System set`);
    console.log(`  ✓ 4. Stadium Capacity: ${stadiumCapacity.toLocaleString()} seats -> Home Arena Environment initialized`);
  }

  const baseRep = player.reputation || {
    club: 50,
    league: 40,
    world: 20,
    peerRespect: 30,
    skill: 50,
    attitude: 50,
    media: 40,
    fans: 50,
    global: 30,
    legacy: 10
  };

  const finalWorldRep = Math.min(100, (baseRep.world || 20) + prestigeRepBoost);
  const finalGlobalRep = Math.min(100, (baseRep.global || 30) + prestigeRepBoost);

  console.log(`[Club-Joining Output] Player Reputation Updated: World Rep = ${finalWorldRep}, Global Rep = ${finalGlobalRep}`);

  return {
    ...player,
    trust: baseTrust,
    reputation: {
      ...baseRep,
      world: finalWorldRep,
      global: finalGlobalRep
    },
    stats: player.stats || { apps: 0, goals: 0, assists: 0, caps: 0 },
    storyArc: player.storyArc || {
      drivingQuestion: 'Can you rise from grassroots trial to footballing immortality?',
      currentAct: 1,
      currentBeat: 1,
      progress: 10,
      resolution: null,
      beats: [
        { act: 1, beat: 1, name: 'First Steps', description: 'Rookie Debut', triggered: true, narrative: 'Your professional journey kicks off on home turf.' },
        { act: 1, beat: 2, name: 'Sustained Merit', description: 'Earning Trust', triggered: false, narrative: 'Coaches begin trusting your tactical output.' },
        { act: 2, beat: 1, name: 'First Crisis', description: 'Dressing Room Test', triggered: false, narrative: 'High stakes pressure mounts after a difficult series of fixtures.' },
        { act: 2, beat: 2, name: 'Clutch Legacy', description: 'Trophy Push', triggered: false, narrative: 'Crucial matchday decisions determine silverware eligibility.' }
      ]
    }
  };
}

export function generateSaveNPCs(engine: any): { agents: any[]; journalists: any[]; family: any[] } {
  return { agents: [], journalists: [], family: [] };
}

export function generateAllClubsRosters(engine: any): Record<string, any> {
  return {};
}

export function calculateMatchSelection(player: Player): { status: SquadHierarchyTier; reason: string } {
  const trust = player.trust || 50;
  if (trust >= 75) return { status: 'First Teamer', reason: 'Consistently high manager trust and strong form.' };
  if (trust >= 50) return { status: 'Rotation', reason: 'Solid squad presence; tactical rotation in effect.' };
  if (trust >= 30) return { status: 'Backup', reason: 'Earning trust on the bench; awaits substitute opportunity.' };
  return { status: 'Exile', reason: 'Manager demands higher tactical discipline and training effort.' };
}

export function calculateDetailedMatchSelection(player: Player, competitionType?: string) {
  const sel = calculateMatchSelection(player);
  let mappedStatus: 'STARTER' | 'SUBSTITUTE' | 'UNUSED' = 'UNUSED';
  
  const isYouthMatch = competitionType === 'YOUTH_LEAGUE' || competitionType === 'YOUTH_CUP' || competitionType === 'YOUTH_EUROPEAN' || competitionType === 'U18 Friendly';
  const isYouthPlayer = player.contract.status === 'Youth';

  if (isYouthMatch && !isYouthPlayer) {
    return { status: 'UNUSED', reason: 'Over-age player not registered for academy fixtures.', expectedMinutes: 0 };
  }
  
  if (!isYouthMatch && isYouthPlayer) {
    return { status: 'UNUSED', reason: 'Academy player not selected for senior matchday squad.', expectedMinutes: 0 };
  }

  if (isYouthMatch && isYouthPlayer) {
    const trust = player.trust || 50;
    if (trust >= 40) mappedStatus = 'STARTER';
    else if (trust >= 20) mappedStatus = 'SUBSTITUTE';
    else mappedStatus = 'UNUSED';
    return {
      status: mappedStatus,
      reason: mappedStatus === 'UNUSED' ? 'Dropped from academy squad.' : 'Selected for academy match.',
      expectedMinutes: mappedStatus === 'STARTER' ? 90 : mappedStatus === 'SUBSTITUTE' ? 30 : 0
    };
  }

  if (sel.status === 'First Teamer' || sel.status === 'Key Player' || sel.status === 'Star Player' || sel.status === 'Club Legend') {
    mappedStatus = 'STARTER';
  } else if (sel.status === 'Rotation' || sel.status === 'Backup' || sel.status === 'Squad Player') {
    mappedStatus = 'SUBSTITUTE';
  }
  return {
    status: mappedStatus,
    reason: sel.reason,
    expectedMinutes: mappedStatus === 'STARTER' ? 90 : mappedStatus === 'SUBSTITUTE' ? 30 : 0
  };
}

export function generatePreseasonReportCard(player: Player) {
  const msg: InboxMessage = {
    id: `preseason_report_${Date.now()}`,
    sender: 'Coaching Staff & Fitness Analytics',
    subject: '📋 PRE-SEASON REPORT CARD & FITNESS DIAGNOSTIC',
    content: `Pre-season preparations have concluded. Your baseline sharpness is set at ${player.attributes?.stamina || 70} OVR. The manager expects high tactical discipline in the opening domestic fixtures.`,
    read: false,
    type: 'NEWS',
    timestamp: 'MON 09:00',
    choices: [{ text: 'Acknowledge Pre-Season Mandate', type: 'ack' }]
  };
  return {
    inboxMessage: msg,
    trustBonus: 5,
    sharpnessBoost: 10
  };
}

export function applyPreseasonResults(player: Player, report: any): Player {
  return {
    ...player,
    trust: Math.min(100, (player.trust || 50) + (report.trustBonus || 5))
  };
}

export function updateProgressionState(
  currentProg: any,
  ovr: number,
  apps: number,
  goals: number,
  assists: number,
  cleanSheets: number = 0,
  avgRating: number = 7.0
) {
  const updatedProg = {
    ...currentProg,
    matchesPlayed: apps,
    averageRating: avgRating,
    goalsAndAssists: goals + assists
  };
  return {
    progression: updatedProg,
    isTierUnlocked: false
  };
}

export function checkStoryArcProgression(
  player: Player,
  apps: number
): { updatedArc: StoryArc; inboxMessage?: InboxMessage } {
  if (!player.storyArc) return { updatedArc: player.storyArc as any };

  let arc = { ...player.storyArc, beats: player.storyArc.beats ? [...player.storyArc.beats] : [] };
  let latestTriggeredBeat: any = null;
  const thresholds = [1, 10, 20, 50, 100, 200];

  while (true) {
    const nextBeatIdx = arc.beats.findIndex(b => !b.triggered);
    if (nextBeatIdx === -1 || nextBeatIdx >= thresholds.length) break;

    if (apps >= thresholds[nextBeatIdx]) {
      arc.beats = arc.beats.map((b, idx) =>
        idx === nextBeatIdx ? { ...b, triggered: true } : b
      );
      arc.currentAct = arc.beats[nextBeatIdx].act;
      arc.currentBeat = arc.beats[nextBeatIdx].beat;
      arc.progress = Math.round(((nextBeatIdx + 1) / arc.beats.length) * 100);
      latestTriggeredBeat = arc.beats[nextBeatIdx];
    } else {
      break;
    }
  }

  if (latestTriggeredBeat) {
    const msg: InboxMessage = {
      id: `story_beat_${Date.now()}_${latestTriggeredBeat.act}_${latestTriggeredBeat.beat}`,
      sender: 'NARRATIVE DIRECTIVE',
      subject: `📖 STORY ARC BEAT: ${latestTriggeredBeat.name}`,
      content: latestTriggeredBeat.narrative,
      read: false,
      type: 'NEWS',
      timestamp: 'MON 09:00',
      choices: [
        { text: 'Embrace Your Arc Mandate', type: 'story_embrace' },
        { text: 'Challenge Board Narrative', type: 'story_reject' }
      ]
    };
    return { updatedArc: arc, inboxMessage: msg };
  }

  return { updatedArc: arc };
}

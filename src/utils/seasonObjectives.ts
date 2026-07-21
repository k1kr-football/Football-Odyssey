import { CoreFormulas } from "./coreFormulas";
import { Club, Player, TimelineEvent } from '../types';
import { CLUBS } from '../data/teams';

export interface SeasonObjective {
  type: 'avoid_relegation' | 'mid_table' | 'top_half' | 'promotion' | 'playoffs' | 'europe' | 'silverware';
  title: string;
  targetText: string;
  targetPos: number; // e.g. 17 or higher
  metric: 'position';
  status: 'ACTIVE' | 'MET' | 'EXCEEDED' | 'MISSED';
  ambition: 'LOW' | 'MEDIUM' | 'HIGH';
  pointsOffset: number;
  midSeasonCheckpointPassed?: boolean;
  thirdSeasonCheckpointPassed?: boolean;
}

export interface ManagerInfo {
  name: string;
  assessmentWeeksLeft: number;
  pressure: number; // 0-100, at 100 they get sacked
  personality?: 'Demanding' | 'Nurturing' | 'Tactical' | 'Pragmatic';
  tacticalSystem?: 'Gegenpress' | 'Tiki-Taka' | 'Low Block' | 'Direct Counter';
  valuedAttributes?: string[];
  attitudeText?: string;
}

export interface NewManagerBounce {
  active: boolean;
  matchesLeft: number;
  trustMultiplier: number;
  performanceBonus: number;
  originalTrust: number;
}

export interface ObjectiveProgress {
  currentPosition: number;
  gamesPlayed: number;
  isOnTrack: boolean;
  targetZoneText: string;
}

// Get league rules (replicated from Schedule.tsx to ensure perfect sync)
export function getLeagueRules(leagueName: string) {
  let rules = {
    maxGames: 38,
    tiebreaker: 'Goal Difference',
    zones: [] as { start: number; end: number; label: string; color: string }[]
  };

  if (leagueName.includes('Premier League')) {
    rules.maxGames = 38;
    rules.tiebreaker = 'Goal Difference';
    rules.zones = [
      { start: 1, end: 4, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
      { start: 5, end: 5, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
      { start: 6, end: 6, label: 'Conf League / Cup Cascade', color: 'bg-green-500/20 border-l-2 border-green-500' },
      { start: 18, end: 20, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
    ];
  } else if (leagueName.includes('EFL Championship') || leagueName.includes('League One')) {
    rules.maxGames = 46;
    rules.tiebreaker = 'Goal Difference';
    rules.zones = [
      { start: 1, end: 2, label: 'Automatic Promotion', color: 'bg-emerald-500/20 border-l-2 border-emerald-500' },
      { start: 3, end: 6, label: 'Play-offs', color: 'bg-yellow-500/20 border-l-2 border-yellow-500' },
      { start: 22, end: 24, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
    ];
  } else if (leagueName.includes('League Two')) {
    rules.maxGames = 46;
    rules.tiebreaker = 'Goal Difference';
    rules.zones = [
      { start: 1, end: 3, label: 'Automatic Promotion', color: 'bg-emerald-500/20 border-l-2 border-emerald-500' },
      { start: 4, end: 7, label: 'Play-offs', color: 'bg-yellow-500/20 border-l-2 border-yellow-500' },
      { start: 23, end: 24, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
    ];
  } else if (leagueName.includes('La Liga')) {
    rules.maxGames = 38;
    rules.tiebreaker = 'Head-to-Head';
    rules.zones = [
      { start: 1, end: 4, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
      { start: 5, end: 5, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
      { start: 6, end: 6, label: 'Conf League / Coefficient Spot', color: 'bg-green-500/20 border-l-2 border-green-500' },
      { start: 18, end: 20, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
    ];
  } else if (leagueName.includes('Serie A')) {
    rules.maxGames = 38;
    rules.tiebreaker = 'Head-to-Head';
    rules.zones = [
      { start: 1, end: 4, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
      { start: 5, end: 6, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
      { start: 7, end: 7, label: 'Conf League / Cup Cascade', color: 'bg-green-500/20 border-l-2 border-green-500' },
      { start: 18, end: 20, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
    ];
  } else if (leagueName.includes('Bundesliga')) {
    rules.maxGames = 34;
    rules.tiebreaker = 'Goal Difference';
    rules.zones = [
      { start: 1, end: 4, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
      { start: 5, end: 6, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
      { start: 7, end: 7, label: 'Conf League / Cup Cascade', color: 'bg-green-500/20 border-l-2 border-green-500' },
      { start: 16, end: 16, label: 'Relegation Play-off', color: 'bg-amber-600/20 border-l-2 border-amber-600' },
      { start: 17, end: 18, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
    ];
  } else if (leagueName.includes('Ligue 1')) {
    rules.maxGames = 34;
    rules.tiebreaker = 'Goal Difference';
    rules.zones = [
      { start: 1, end: 3, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
      { start: 4, end: 4, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
      { start: 5, end: 5, label: 'Conf League / Coefficient Spot', color: 'bg-green-500/20 border-l-2 border-green-500' },
      { start: 16, end: 16, label: 'Relegation Play-off', color: 'bg-amber-600/20 border-l-2 border-amber-600' },
      { start: 17, end: 18, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
    ];
  } else {
    // default
    rules.zones = [
      { start: 1, end: 3, label: 'Continental Promotion', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
      { start: 18, end: 20, label: 'Relegation Zone', color: 'bg-red-500/10 border-l-2 border-red-500' }
    ];
  }

  return rules;
}

// Compute deterministic standings for all clubs in the league
export function getClubStandings(
  leagueName: string,
  currentWeek: number,
  playerClubSymbol: string,
  pointsOffset: number = 0,
  worldState?: any
) {
  const leagueClubs = CLUBS.filter((c) => c.league === leagueName);
  const rules = getLeagueRules(leagueName);

  // We want games played to scale up to rules.maxGames across the season (approx 40 weeks of play)
  const seasonProgress = Math.max(0, currentWeek - 4) / 39;
  const gamesPlayed = Math.min(rules.maxGames, Math.floor(seasonProgress * rules.maxGames));

  const generated = leagueClubs.map((club) => {
    const isPlayer = playerClubSymbol === club.symbol;

    if (worldState && worldState.clubs && worldState.clubs[club.symbol]) {
        // Use World Simulation data!
        const wClub = worldState.clubs[club.symbol];
        let wPts = wClub.pts;
        if (isPlayer) {
           wPts = Math.max(0, Math.round(wPts + pointsOffset)); // Apply offset for player since player's real matches don't update worldState points directly yet
        }
        return {
           ...club,
           p: wClub.p,
           w: wClub.w,
           d: wClub.d,
           l: wClub.l,
           gd: wClub.gf - wClub.ga,
           pts: wPts,
           isPlayer,
           form: wClub.form
        };
    }

    // Fallback to deterministic logic if no world simulation state exists
    const ovrRank = leagueClubs.findIndex((c) => c.symbol === club.symbol) + 1;
    const seed = club.symbol.charCodeAt(0) + club.symbol.charCodeAt(1) + currentWeek;
    const variance = (seed % 15) - 7;

    const basePtsPerGame = (club.ovr / 100) * 2.2;
    let pts = Math.floor(gamesPlayed * basePtsPerGame) + Math.floor(variance * (gamesPlayed / rules.maxGames));
    pts = Math.max(0, pts);
    if (gamesPlayed === 0) pts = 0;

    if (isPlayer) {
      pts = Math.max(0, pts + Math.round(pointsOffset));
    }

    let baseGd = Math.floor(((club.ovr - 65) / 2) * (gamesPlayed / 10)) + Math.floor(variance / 2);
    if (gamesPlayed === 0) baseGd = 0;

    return {
      ...club,
      p: gamesPlayed,
      w: Math.floor(pts / 3),
      d: pts % 3,
      l: Math.max(0, gamesPlayed - Math.floor(pts / 3) - (pts % 3)),
      gd: baseGd,
      pts,
      isPlayer,
      form: []
    };
  });

  generated.sort((a, b) => {
    if (a.pts !== b.pts) return b.pts - a.pts;
    if (a.gd !== b.gd) return b.gd - a.gd;
    return a.name.localeCompare(b.name);
  });

  return generated.map((t, i) => ({ ...t, pos: i + 1 }));
}

// Get player club's standings and objective progress
export function getObjectiveProgress(
  playerClubSymbol: string,
  leagueName: string,
  currentWeek: number,
  objective: SeasonObjective,
  worldState?: any
): ObjectiveProgress {
  const standings = getClubStandings(leagueName, currentWeek, playerClubSymbol, objective.pointsOffset, worldState);
  const clubRecord = standings.find((c) => c.symbol === playerClubSymbol);
  const currentPosition = clubRecord ? clubRecord.pos : 10;
  const rules = getLeagueRules(leagueName);
  const seasonProgress = Math.max(0, currentWeek - 4) / 39;
  const gamesPlayed = Math.min(rules.maxGames, Math.floor(seasonProgress * rules.maxGames));

  const targetPos = objective.targetPos;
  const isOnTrack = currentPosition <= targetPos;

  let targetZoneText = `Finish ${targetPos}th or higher`;
  if (objective.type === 'avoid_relegation') {
    targetZoneText = `Avoid Relegation (Finish ${targetPos}th or higher)`;
  } else if (objective.type === 'mid_table') {
    targetZoneText = `Mid-Table Security (Finish ${targetPos}th or higher)`;
  } else if (objective.type === 'top_half') {
    targetZoneText = `Top-Half Finish (Finish ${targetPos}th or higher)`;
  } else if (objective.type === 'playoffs') {
    targetZoneText = `Secure Play-offs (Finish ${targetPos}th or higher)`;
  } else if (objective.type === 'promotion') {
    targetZoneText = `Secure Promotion (Finish ${targetPos}th or higher)`;
  } else if (objective.type === 'europe') {
    targetZoneText = `Qualify for Europe (Finish ${targetPos}th or higher)`;
  } else if (objective.type === 'silverware') {
    targetZoneText = `Win Silverware (Finish 1st)`;
  }

  return {
    currentPosition,
    gamesPlayed,
    isOnTrack,
    targetZoneText
  };
}

// Generate a brand new season objective appropriate to the club's rating and division rules
export function generateSeasonObjective(club: Club, playerOvr: number): SeasonObjective {
  const leagueName = club.league;
  const leagueClubs = CLUBS.filter((c) => c.league === leagueName);

  // calculate league stats
  const sumOvr = leagueClubs.reduce((acc, c) => acc + c.ovr, 0);
  const averageOvr = sumOvr / leagueClubs.length;

  let ambition: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  if (club.ovr > averageOvr + 4) ambition = 'HIGH';
  else if (club.ovr < averageOvr - 4) ambition = 'LOW';

  const isLowerTier = leagueName.includes('Championship') || leagueName.includes('League One') || leagueName.includes('League Two');
  const size = leagueClubs.length || 20;

  let type: SeasonObjective['type'] = 'mid_table';
  let title = 'Stable Mid-Table Finish';
  let targetText = 'Finish 12th or higher';
  let targetPos = 12;

  if (isLowerTier) {
    if (ambition === 'HIGH') {
      type = 'promotion';
      title = 'Secure Automatic Promotion';
      targetText = leagueName.includes('League Two') ? 'Finish 3rd or higher' : 'Finish 2nd or higher';
      targetPos = leagueName.includes('League Two') ? 3 : 2;
    } else if (ambition === 'MEDIUM') {
      type = 'playoffs';
      title = 'Secure Play-offs Spot';
      targetText = leagueName.includes('League Two') ? 'Finish 7th or higher' : 'Finish 6th or higher';
      targetPos = leagueName.includes('League Two') ? 7 : 6;
    } else {
      type = 'avoid_relegation';
      title = 'Avoid Relegation';
      targetText = `Finish ${size - 3}th or higher`;
      targetPos = size - 3;
    }
  } else {
    // Top-tier division
    if (ambition === 'HIGH') {
      if (club.ovr >= 90) {
        type = 'silverware';
        title = 'Title Challenge & Silverware';
        targetText = 'Finish 1st';
        targetPos = 1;
      } else {
        type = 'europe';
        title = 'Qualify for European Football';
        targetText = 'Finish 4th or higher (Champions League)';
        targetPos = 4;
      }
    } else if (ambition === 'MEDIUM') {
      const isUpperMedium = club.ovr > averageOvr;
      if (isUpperMedium) {
        type = 'europe';
        title = 'Qualify for European Football';
        targetText = 'Finish 6th or higher';
        targetPos = 6;
      } else {
        type = 'top_half';
        title = 'Top-Half Finish';
        targetText = 'Finish 10th or higher';
        targetPos = 10;
      }
    } else {
      type = 'avoid_relegation';
      title = 'Avoid Relegation';
      targetText = `Finish ${size - 3}th or higher`;
      targetPos = size - 3;
    }
  }

  return {
    type,
    title,
    targetText,
    targetPos,
    metric: 'position',
    status: 'ACTIVE',
    ambition,
    pointsOffset: 0
  };
}

// Generate a random brand new manager with unique personality and preferences
export function generateRandomNewManager(currentClubSymbol: string): ManagerInfo {
  const firstNames = ['Marco', 'Roberto', 'Jurgen', 'Hansi', 'Graham', 'Shaun', 'Brendan', 'Carlo', 'Mauricio', 'Thomas', 'Ruben', 'Jose'];
  const lastNames = ['Maloney', 'Silva', 'Clement', 'Postecoglou', 'Dyche', 'Cooper', 'Mckenna', 'Edwards', 'Carrick', 'Kovac', 'Rose'];

  const chosenName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

  const personalities: ('Demanding' | 'Nurturing' | 'Tactical' | 'Pragmatic')[] = ['Demanding', 'Nurturing', 'Tactical', 'Pragmatic'];
  const personality = personalities[Math.floor(Math.random() * personalities.length)];

  const tactics = ['Gegenpress', 'Tiki-Taka', 'Low Block', 'Direct Counter'];
  const tacticalSystem = tactics[Math.floor(Math.random() * tactics.length)] as any;

  let valuedAttributes: string[] = [];
  let attitudeText = '';

  if (personality === 'Demanding') {
    valuedAttributes = ['stamina', 'strength', 'pace'];
    attitudeText = 'Attitude: Demanding & Skeptical';
  } else if (personality === 'Nurturing') {
    valuedAttributes = ['passing', 'firstTouch', 'vision'];
    attitudeText = 'Attitude: Nurturing & Supportive';
  } else if (personality === 'Tactical') {
    valuedAttributes = ['tacticalAwareness', 'decisionMaking', 'positioning'];
    attitudeText = 'Attitude: Tactical & Analytic';
  } else {
    valuedAttributes = ['composure', 'tackling', 'strength'];
    attitudeText = 'Attitude: Pragmatic & Disciplined';
  }

  return {
    name: chosenName,
    assessmentWeeksLeft: 4,
    pressure: 0,
    personality,
    tacticalSystem,
    valuedAttributes,
    attitudeText
  };
}

export function checkMidSeasonObjective(
  player: Player,
  position: number,
  currentWeek: number
): { warningTriggered: boolean; message: string; trustDecrease: number; pressureIncrease: number } | null {
  const objective = player.seasonObjective;
  if (!objective) return null;

  // Mid-season evaluations happen around week 17 (1/3 point) and week 26 (1/2 point)
  const isOneThird = currentWeek === 17 && !objective.thirdSeasonCheckpointPassed;
  const isMidWay = currentWeek === 26 && !objective.midSeasonCheckpointPassed;

  if (!isOneThird && !isMidWay) return null;

  const isFailing = position > objective.targetPos;
  if (!isFailing) return null;

  const placesOff = position - objective.targetPos;
  let severity = 'MILD';
  if (placesOff > 4) severity = 'CRITICAL';
  else if (placesOff > 2) severity = 'MODERATE';

  let trustDecrease = 0;
  let pressureIncrease = 0;
  let message = '';

  if (severity === 'CRITICAL') {
    trustDecrease = 15;
    pressureIncrease = 30;
    message = `CRITICAL WARNING: The board is extremely displeased with our current position of ${position}th. We are far below our stated objective of "${objective.title}" (${objective.targetText}). Immediate improvements are required, or the manager's job and your squad status will be placed at risk!`;
  } else if (severity === 'MODERATE') {
    trustDecrease = 10;
    pressureIncrease = 15;
    message = `OFF-PACE WARNING: The manager notes that our standing of ${position}th is currently falling short of our objective: "${objective.title}" (${objective.targetText}). You need to elevate your level on the pitch to help steady the ship.`;
  } else {
    trustDecrease = 5;
    pressureIncrease = 8;
    message = `BOARD UPDATE: The board is closely monitoring our league progress. Standing ${position}th is slightly off-pace from our target of "${objective.title}". Let's buckle down in training and matchdays to secure points.`;
  }

  return {
    warningTriggered: true,
    message,
    trustDecrease,
    pressureIncrease
  };
}

export function evaluateEndofSeasonObjective(
  player: Player,
  finalPosition: number
): {
  status: 'MET' | 'EXCEEDED' | 'MISSED';
  title: string;
  text: string;
  trustDelta: number;
  repDelta: number;
} {
  const objective = player.seasonObjective;
  if (!objective) {
    return {
      status: 'MET',
      title: 'Season Completed',
      text: 'You finished the season with your current club.',
      trustDelta: 5,
      repDelta: 2
    };
  }

  const targetPos = objective.targetPos;
  let status: 'MET' | 'EXCEEDED' | 'MISSED' = 'MET';
  
  if (finalPosition < targetPos - 2 || (targetPos === 1 && finalPosition === 1)) {
    status = 'EXCEEDED';
  } else if (finalPosition <= targetPos) {
    status = 'MET';
  } else {
    status = 'MISSED';
  }

  let title = '';
  let text = '';
  let trustDelta = 0;
  let repDelta = 0;

  if (status === 'EXCEEDED') {
    title = '🏆 Season Objective Exceeded!';
    trustDelta = CoreFormulas.calculateTrustDelta(9.0) * 4; // +24
    repDelta = CoreFormulas.calculateReputationDelta('LARGE', true) * 2; // +10
    text = `Phenomenal achievement! You and the squad completely surpassed the board's objective of "${objective.title}" by finishing ${finalPosition}th in the league. The board is absolutely ecstatic. (+${trustDelta} Manager Trust, +${repDelta} Reputation)`;
  } else if (status === 'MET') {
    title = '✅ Season Objective Met';
    trustDelta = CoreFormulas.calculateTrustDelta(8.0) * 3; // +12
    repDelta = CoreFormulas.calculateReputationDelta('MEDIUM', true) * 2; // +4
    text = `Target achieved. The board's objective was "${objective.title}" (${objective.targetText}), and you delivered a solid ${finalPosition}th place finish. This cements your position inside the squad. (+${trustDelta} Manager Trust, +${repDelta} Reputation)`;
  } else {
    title = '❌ Season Objective Missed';
    trustDelta = CoreFormulas.calculateTrustDelta(4.0) * 4; // -20
    repDelta = CoreFormulas.calculateReputationDelta('LARGE', false) * 2; // -10
    text = `A disappointing campaign. The club finished ${finalPosition}th, failing to meet the board's stated objective of "${objective.title}" (${objective.targetText}). The fans are restless and the manager's position is under intense scrutiny. (${trustDelta} Manager Trust, ${repDelta} Reputation)`;
  }

  return {
    status,
    title,
    text,
    trustDelta,
    repDelta
  };
}

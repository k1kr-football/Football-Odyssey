import { CLUBS } from '../data/teams';
import { getClubSquad } from '../data/sheetSquads';
import { getPositionGroup, PositionGroup } from './positionMatchDecisions';
import { Player, InboxMessage, Trophy, Milestone } from '../types';

export interface TOTWPlayer {
  name: string;
  clubSymbol: string;
  clubName: string;
  positionGroup: PositionGroup;
  exactPosition: string;
  matchRating: number;
  goals: number;
  assists: number;
  tackles: number;
  saves: number;
  cleanSheet: boolean;
  isUserPlayer: boolean;
}

export interface TeamOfTheWeek {
  id: string;
  week: number;
  season: number;
  league: string;
  squad: TOTWPlayer[];
  userSelected: boolean;
  userPlayerDetails?: TOTWPlayer;
}

export interface PlayerOfTheMonth {
  id: string;
  month: number;
  week: number;
  season: number;
  league: string;
  winner: TOTWPlayer;
  isUserPlayer: boolean;
  runnerUps: TOTWPlayer[];
}

export interface SeasonAwardsSummary {
  id: string;
  season: number;
  league: string;
  goldenBoot: { name: string; clubSymbol: string; clubName: string; goals: number; isUserPlayer: boolean };
  playerOfSeason: { name: string; clubSymbol: string; clubName: string; avgRating: number; goals: number; assists: number; isUserPlayer: boolean };
  teamOfSeason: TOTWPlayer[];
  goldenGlove: { name: string; clubSymbol: string; clubName: string; cleanSheets: number; isUserPlayer: boolean };
  userAwardsWon: string[];
}

export interface UserMatchPerf {
  rating: number;
  goals: number;
  assists: number;
  tackles: number;
  saves: number;
  cleanSheet: boolean;
}

// 4-3-3 Tactical Formation Slots for TOTW
const FORMATION_SLOTS: { slotIndex: number; exactPos: string; group: PositionGroup }[] = [
  { slotIndex: 0, exactPos: 'GK', group: 'GK' },
  { slotIndex: 1, exactPos: 'LB', group: 'DEFENDER' },
  { slotIndex: 2, exactPos: 'CB', group: 'DEFENDER' },
  { slotIndex: 3, exactPos: 'CB', group: 'DEFENDER' },
  { slotIndex: 4, exactPos: 'RB', group: 'DEFENDER' },
  { slotIndex: 5, exactPos: 'CDM', group: 'MIDFIELDER' },
  { slotIndex: 6, exactPos: 'CM', group: 'MIDFIELDER' },
  { slotIndex: 7, exactPos: 'CAM', group: 'ATTACKING_MID_WING' },
  { slotIndex: 8, exactPos: 'LW', group: 'ATTACKING_MID_WING' },
  { slotIndex: 9, exactPos: 'ST', group: 'STRIKER' },
  { slotIndex: 10, exactPos: 'RW', group: 'ATTACKING_MID_WING' },
];

/**
 * Generate Team of the Week for a given week and league
 */
export function generateWeeklyTOTW(
  worldState: any,
  player: Player,
  week: number,
  season: number,
  userPerf?: UserMatchPerf
): TeamOfTheWeek {
  const userClub = CLUBS.find(c => c.symbol === player.currentClubSymbol) || CLUBS[0];
  const leagueName = userClub.league;
  const leagueClubs = CLUBS.filter(c => c.league === leagueName);

  const userGroup = getPositionGroup(player.position);
  let userQualifies = false;
  let userDetails: TOTWPlayer | undefined = undefined;

  // Evaluate user qualification
  if (userPerf && userPerf.rating >= 7.5) {
    const minRatingNeeded = userPerf.goals > 0 || userPerf.assists > 0 || userPerf.cleanSheet ? 7.6 : 8.0;
    if (userPerf.rating >= minRatingNeeded) {
      userQualifies = true;
      userDetails = {
        name: `${player.firstName} ${player.lastName}`,
        clubSymbol: player.currentClubSymbol,
        clubName: userClub.name,
        positionGroup: userGroup,
        exactPosition: player.position || 'ST',
        matchRating: userPerf.rating,
        goals: userPerf.goals,
        assists: userPerf.assists,
        tackles: userPerf.tackles,
        saves: userPerf.saves,
        cleanSheet: userPerf.cleanSheet,
        isUserPlayer: true
      };
    }
  }

  const selectedSquad: TOTWPlayer[] = [];

  // Generate candidates for each 4-3-3 slot
  FORMATION_SLOTS.forEach(slot => {
    // If user qualifies and matches this slot's position group, place user!
    if (userQualifies && userDetails && !selectedSquad.some(p => p.isUserPlayer)) {
      if (
        (slot.group === userGroup) ||
        (userGroup === 'STRIKER' && slot.exactPos === 'ST') ||
        (userGroup === 'ATTACKING_MID_WING' && (slot.exactPos === 'LW' || slot.exactPos === 'RW' || slot.exactPos === 'CAM')) ||
        (userGroup === 'MIDFIELDER' && (slot.exactPos === 'CM' || slot.exactPos === 'CDM')) ||
        (userGroup === 'DEFENDER' && (slot.exactPos === 'CB' || slot.exactPos === 'LB' || slot.exactPos === 'RB')) ||
        (userGroup === 'GK' && slot.exactPos === 'GK')
      ) {
        selectedSquad.push({
          ...userDetails,
          exactPosition: slot.exactPos
        });
        return;
      }
    }

    // Pick a candidate club from league
    const candClub = leagueClubs[Math.floor(Math.random() * leagueClubs.length)];
    const squad = getClubSquad(candClub.name);
    const candPlayerName = squad.players[Math.floor(Math.random() * squad.players.length)]?.name || `${candClub.symbol} Star`;

    // Generate realistic stats based on position group
    const rating = Number((7.8 + Math.random() * 1.6).toFixed(1)); // 7.8 to 9.4
    let goals = 0;
    let assists = 0;
    let tackles = 0;
    let saves = 0;
    let cleanSheet = false;

    if (slot.group === 'STRIKER' || slot.group === 'ATTACKING_MID_WING') {
      goals = Math.random() > 0.4 ? (Math.random() > 0.7 ? 2 : 1) : 0;
      assists = goals === 0 ? (Math.random() > 0.5 ? 1 : 0) : (Math.random() > 0.8 ? 1 : 0);
    } else if (slot.group === 'MIDFIELDER') {
      assists = Math.random() > 0.5 ? 1 : 0;
      goals = Math.random() > 0.8 ? 1 : 0;
      tackles = Math.floor(Math.random() * 4) + 2;
    } else if (slot.group === 'DEFENDER') {
      cleanSheet = Math.random() > 0.4;
      tackles = Math.floor(Math.random() * 5) + 3;
      if (Math.random() > 0.85) goals = 1;
    } else if (slot.group === 'GK') {
      cleanSheet = Math.random() > 0.3;
      saves = Math.floor(Math.random() * 6) + 3;
    }

    selectedSquad.push({
      name: candPlayerName,
      clubSymbol: candClub.symbol,
      clubName: candClub.name,
      positionGroup: slot.group,
      exactPosition: slot.exactPos,
      matchRating: rating,
      goals,
      assists,
      tackles,
      saves,
      cleanSheet,
      isUserPlayer: false
    });
  });

  const userIncluded = selectedSquad.some(p => p.isUserPlayer);

  return {
    id: `totw_s${season}_w${week}`,
    week,
    season,
    league: leagueName,
    squad: selectedSquad,
    userSelected: userIncluded,
    userPlayerDetails: userIncluded ? selectedSquad.find(p => p.isUserPlayer) : undefined
  };
}

/**
 * Generate Player of the Month
 */
export function generateMonthlyPOTM(
  worldState: any,
  player: Player,
  monthNum: number,
  week: number,
  season: number,
  recentTOTWs: TeamOfTheWeek[]
): PlayerOfTheMonth {
  const userClub = CLUBS.find(c => c.symbol === player.currentClubSymbol) || CLUBS[0];
  const leagueName = userClub.league;

  // Count user TOTW appearances in recent month
  const userTOTWCount = recentTOTWs.filter(t => t.userSelected).length;
  const userAvgRating = player.progression?.averageRating || 7.5;
  const userGoals = player.stats.goals;

  // Determine if user wins POTM
  let isUserWinner = false;
  if (userTOTWCount >= 2 || (userTOTWCount >= 1 && userAvgRating >= 8.0) || userGoals >= 5) {
    isUserWinner = true;
  }

  let winner: TOTWPlayer;
  const runnerUps: TOTWPlayer[] = [];

  if (isUserWinner) {
    winner = {
      name: `${player.firstName} ${player.lastName}`,
      clubSymbol: player.currentClubSymbol,
      clubName: userClub.name,
      positionGroup: getPositionGroup(player.position),
      exactPosition: player.position || 'ST',
      matchRating: Number(userAvgRating.toFixed(1)),
      goals: Math.min(6, Math.floor(Math.random() * 3) + 3),
      assists: Math.floor(Math.random() * 3),
      tackles: 8,
      saves: 0,
      cleanSheet: true,
      isUserPlayer: true
    };
  } else {
    // Pick top NPC candidate from recent TOTW or league
    const candClub = CLUBS.find(c => c.league === leagueName && c.symbol !== player.currentClubSymbol) || CLUBS[0];
    const squad = getClubSquad(candClub.name);
    const starName = squad.players[0]?.name || `${candClub.symbol} Ace`;

    winner = {
      name: starName,
      clubSymbol: candClub.symbol,
      clubName: candClub.name,
      positionGroup: 'STRIKER',
      exactPosition: 'ST',
      matchRating: Number((8.4 + Math.random() * 0.8).toFixed(1)),
      goals: Math.floor(Math.random() * 3) + 4,
      assists: Math.floor(Math.random() * 3) + 1,
      tackles: 2,
      saves: 0,
      cleanSheet: false,
      isUserPlayer: false
    };
  }

  // Generate 2 runner ups
  const leagueClubs = CLUBS.filter(c => c.league === leagueName);
  for (let i = 0; i < 2; i++) {
    const rc = leagueClubs[(i + 1) % leagueClubs.length];
    const rSquad = getClubSquad(rc.name);
    runnerUps.push({
      name: rSquad.players[i + 1]?.name || `${rc.symbol} Player`,
      clubSymbol: rc.symbol,
      clubName: rc.name,
      positionGroup: i === 0 ? 'ATTACKING_MID_WING' : 'MIDFIELDER',
      exactPosition: i === 0 ? 'LW' : 'CM',
      matchRating: Number((8.1 + Math.random() * 0.4).toFixed(1)),
      goals: Math.floor(Math.random() * 3) + 2,
      assists: Math.floor(Math.random() * 3) + 2,
      tackles: 5,
      saves: 0,
      cleanSheet: false,
      isUserPlayer: false
    });
  }

  return {
    id: `potm_s${season}_m${monthNum}`,
    month: monthNum,
    week,
    season,
    league: leagueName,
    winner,
    isUserPlayer: winner.isUserPlayer,
    runnerUps
  };
}

/**
 * Generate End-of-Season Awards
 */
export function generateEndofSeasonAwards(
  worldState: any,
  player: Player,
  season: number,
  seasonTOTWs: TeamOfTheWeek[]
): SeasonAwardsSummary {
  const userClub = CLUBS.find(c => c.symbol === player.currentClubSymbol) || CLUBS[0];
  const leagueName = userClub.league;
  const leagueClubs = CLUBS.filter(c => c.league === leagueName);

  const userGoals = player.stats.goals || 0;
  const userAssists = player.stats.assists || 0;
  const userAvgRating = player.progression?.averageRating || 7.2;
  const userCleanSheets = player.stats.cleanSheets || 0;
  const userApps = player.stats.apps || 0;

  // Simulated benchmarks
  const topSimGoals = Math.floor(Math.random() * 6) + 18; // 18-23 goals
  const topSimAvgRating = 7.82;
  const topSimCleanSheets = 14;

  const userWinsGoldenBoot = userGoals >= topSimGoals;
  const userWinsPlayerOfSeason = userAvgRating >= topSimAvgRating && userApps >= 15;
  const userWinsGoldenGlove = getPositionGroup(player.position) === 'GK' && userCleanSheets >= topSimCleanSheets;

  const userAwardsWon: string[] = [];
  if (userWinsGoldenBoot) userAwardsWon.push('Golden Boot');
  if (userWinsPlayerOfSeason) userAwardsWon.push('Player of the Season');
  if (userWinsGoldenGlove) userAwardsWon.push('Golden Glove');

  // Golden Boot
  const gbClub = userWinsGoldenBoot ? userClub : leagueClubs[0];
  const gbWinner = userWinsGoldenBoot
    ? { name: `${player.firstName} ${player.lastName}`, clubSymbol: player.currentClubSymbol, clubName: userClub.name, goals: userGoals, isUserPlayer: true }
    : { name: getClubSquad(gbClub.name).players[2]?.name || `${gbClub.symbol} Striker`, clubSymbol: gbClub.symbol, clubName: gbClub.name, goals: topSimGoals, isUserPlayer: false };

  // Player of the Season
  const posClub = userWinsPlayerOfSeason ? userClub : (leagueClubs[1] || leagueClubs[0]);
  const posWinner = userWinsPlayerOfSeason
    ? { name: `${player.firstName} ${player.lastName}`, clubSymbol: player.currentClubSymbol, clubName: userClub.name, avgRating: userAvgRating, goals: userGoals, assists: userAssists, isUserPlayer: true }
    : { name: getClubSquad(posClub.name).players[1]?.name || `${posClub.symbol} Playmaker`, clubSymbol: posClub.symbol, clubName: posClub.name, avgRating: topSimAvgRating, goals: 12, assists: 14, isUserPlayer: false };

  // Golden Glove
  const ggClub = userWinsGoldenGlove ? userClub : (leagueClubs[2] || leagueClubs[0]);
  const ggWinner = userWinsGoldenGlove
    ? { name: `${player.firstName} ${player.lastName}`, clubSymbol: player.currentClubSymbol, clubName: userClub.name, cleanSheets: userCleanSheets, isUserPlayer: true }
    : { name: getClubSquad(ggClub.name).players[7]?.name || `${ggClub.symbol} Keeper`, clubSymbol: ggClub.symbol, clubName: ggClub.name, cleanSheets: topSimCleanSheets, isUserPlayer: false };

  // Team of the Season (TOTS)
  const totsSquad: TOTWPlayer[] = [];
  const userTOTWCount = seasonTOTWs.filter(t => t.userSelected).length;
  const userInTOTS = userTOTWCount >= 2 || userWinsGoldenBoot || userWinsPlayerOfSeason;

  if (userInTOTS) userAwardsWon.push('Team of the Season');

  FORMATION_SLOTS.forEach(slot => {
    if (userInTOTS && !totsSquad.some(p => p.isUserPlayer)) {
      const userGroup = getPositionGroup(player.position);
      if (slot.group === userGroup) {
        totsSquad.push({
          name: `${player.firstName} ${player.lastName}`,
          clubSymbol: player.currentClubSymbol,
          clubName: userClub.name,
          positionGroup: userGroup,
          exactPosition: player.position || 'ST',
          matchRating: Number(userAvgRating.toFixed(1)),
          goals: userGoals,
          assists: userAssists,
          tackles: 12,
          saves: 0,
          cleanSheet: userCleanSheets > 0,
          isUserPlayer: true
        });
        return;
      }
    }

    const cClub = leagueClubs[Math.floor(Math.random() * leagueClubs.length)];
    const squad = getClubSquad(cClub.name);
    totsSquad.push({
      name: squad.players[Math.floor(Math.random() * squad.players.length)]?.name || `${cClub.symbol} Star`,
      clubSymbol: cClub.symbol,
      clubName: cClub.name,
      positionGroup: slot.group,
      exactPosition: slot.exactPos,
      matchRating: Number((7.9 + Math.random() * 0.8).toFixed(1)),
      goals: slot.group === 'STRIKER' ? 14 : 4,
      assists: slot.group === 'ATTACKING_MID_WING' ? 10 : 3,
      tackles: 20,
      saves: slot.group === 'GK' ? 65 : 0,
      cleanSheet: true,
      isUserPlayer: false
    });
  });

  return {
    id: `season_awards_s${season}`,
    season,
    league: leagueName,
    goldenBoot: gbWinner,
    playerOfSeason: posWinner,
    teamOfSeason: totsSquad,
    goldenGlove: ggWinner,
    userAwardsWon
  };
}

/**
 * Apply TOTW rewards to player state
 */
export function applyTOTWRewards(player: Player, totw: TeamOfTheWeek): { updatedPlayer: Player; inboxMsg: InboxMessage } {
  let p = { ...player };

  // Calculate TOTW selection count
  const totwCount = (p.stateFlags?.totwSelections || 0) + 1;
  p.stateFlags = { ...p.stateFlags, totwSelections: totwCount };

  // Boost media perception and fans
  const currentMedia = p.mediaPerception || 50;
  p.mediaPerception = Math.min(100, currentMedia + 6);
  p.fans = Math.min(100, (p.fans || 0) + 4);

  // Check reputation tags
  if (totwCount >= 3) {
    const tags = p.reputationTags || [];
    if (!tags.includes('Big Game Player')) {
      p.reputationTags = [...tags, 'Big Game Player'];
    }
  }

  // Create Milestone
  const milestoneTitle = totwCount === 1 ? 'First Team of the Week Selection' : `${totwCount}x Team of the Week Selection`;
  const newMilestone: Milestone = {
    id: `milestone_totw_${Date.now()}`,
    type: 'TOTW',
    date: `Week ${totw.week}, Season ${totw.season}`,
    description: `Selected in the official ${totw.league} Team of the Week following stellar match rating of ${totw.userPlayerDetails?.matchRating || 8.2}.`,
    reward: '+6 Media Perception, +4 Fans',
    completed: true
  };

  p.milestones = [newMilestone, ...(p.milestones || [])];

  const inboxMsg: InboxMessage = {
    id: `totw_inbox_${Date.now()}`,
    sender: 'LEAGUE HEADQUARTERS',
    subject: `⭐ TEAM OF THE WEEK SELECTION (Week ${totw.week})`,
    content: `Congratulations ${p.firstName}! Your standout performance (Match Rating: ${totw.userPlayerDetails?.matchRating || 8.2}) in Week ${totw.week} has earned you a place in the official ${totw.league} Team of the Week!\n\nYour profile in national media is surging as pundits praise your clinical impact on the pitch.`,
    read: false,
    type: 'SPORTING',
    timestamp: 'MON 09:00',
    priority: 'IMPORTANT',
    choices: [{ text: 'Celebrate with Supporters', type: 'ack' }]
  };

  return { updatedPlayer: p, inboxMsg };
}

/**
 * Apply POTM rewards to player state
 */
export function applyPOTMRewards(player: Player, potm: PlayerOfTheMonth): { updatedPlayer: Player; inboxMsg: InboxMessage } {
  let p = { ...player };

  const potmCount = (p.stateFlags?.potmAwards || 0) + 1;
  p.stateFlags = { ...p.stateFlags, potmAwards: potmCount };

  p.mediaPerception = Math.min(100, (p.mediaPerception || 50) + 15);
  p.fans = Math.min(100, (p.fans || 0) + 10);
  p.reputation = { ...p.reputation, world: Math.min(100, (p.reputation?.world || 30) + 8) };

  const newMilestone: Milestone = {
    id: `milestone_potm_${Date.now()}`,
    type: 'POTM',
    date: `Month ${potm.month}, Season ${potm.season}`,
    description: `Voted official ${potm.league} Player of the Month for sensational form across Month ${potm.month}!`,
    reward: '+15 Media Perception, +10 Fans',
    completed: true
  };

  p.milestones = [newMilestone, ...(p.milestones || [])];

  // Add Trophy
  const trophy: Trophy = {
    id: `trophy_potm_${potm.month}_s${potm.season}`,
    name: `Player of the Month (Month ${potm.month})`,
    competition: potm.league,
    year: 2026 + potm.season - 1,
    story: `Crowned Player of the Month for ${potm.league} after delivering dominant performances and match-winning goal contributions.`
  };
  p.trophies = [trophy, ...(p.trophies || [])];

  const inboxMsg: InboxMessage = {
    id: `potm_inbox_${Date.now()}`,
    sender: 'LEAGUE HEADQUARTERS',
    subject: `🏆 PLAYER OF THE MONTH AWARD — MONTH ${potm.month}`,
    content: `HISTORIC RECOGNITION: ${p.firstName} ${p.lastName} has been named the official ${potm.league} Player of the Month for Month ${potm.month}!\n\nJournalists, coaches, and fans across the division voted overwhelmingly in your favor following an unblemished run of dominant performances.`,
    read: false,
    type: 'SPORTING',
    timestamp: 'MON 09:00',
    priority: 'CRITICAL',
    choices: [{ text: 'Accept Award & Thank Teammates', type: 'ack' }]
  };

  return { updatedPlayer: p, inboxMsg };
}

/**
 * Apply End-of-Season Awards rewards to player state
 */
export function applySeasonAwardsRewards(
  player: Player,
  awards: SeasonAwardsSummary
): { updatedPlayer: Player; inboxMsgs: InboxMessage[] } {
  let p = { ...player };
  const msgs: InboxMessage[] = [];

  if (!awards.userAwardsWon || awards.userAwardsWon.length === 0) {
    return { updatedPlayer: p, inboxMsgs: msgs };
  }

  p.mediaPerception = Math.min(100, (p.mediaPerception || 50) + 20);
  p.fans = Math.min(100, (p.fans || 0) + 15);
  p.reputation = {
    ...p.reputation,
    world: Math.min(100, (p.reputation?.world || 30) + 15),
    peerRespect: Math.min(100, (p.reputation?.peerRespect || 30) + 15),
    media: Math.min(100, (p.reputation?.media || 30) + 20)
  };

  awards.userAwardsWon.forEach(awardName => {
    const trophyId = `trophy_season_${awardName.toLowerCase().replace(/\s+/g, '_')}_s${awards.season}`;
    const trophy: Trophy = {
      id: trophyId,
      name: `${awards.league} ${awardName}`,
      competition: awards.league,
      year: 2026 + awards.season - 1,
      story: `Awarded the prestigious ${awardName} award at the official Season ${awards.season} League Gala Ceremony.`
    };
    if (!p.trophies?.some(t => t.id === trophyId)) {
      p.trophies = [trophy, ...(p.trophies || [])];
    }

    const milestone: Milestone = {
      id: `milestone_award_${Date.now()}_${awardName}`,
      type: 'SEASON_AWARD',
      date: `Season ${awards.season}`,
      description: `Won the prestigious ${awards.league} ${awardName} award!`,
      reward: '+20 Media Perception, +15 Reputation',
      completed: true
    };
    p.milestones = [milestone, ...(p.milestones || [])];

    msgs.push({
      id: `award_inbox_${Date.now()}_${awardName}`,
      sender: 'LEAGUE AWARDS GALA',
      subject: `🏆 SEASON AWARD WINNER: ${awardName.toUpperCase()}`,
      content: `DISTINGUISHED HONOUR: You were officially crowned the ${awards.league} ${awardName} winner at the end-of-season gala presentation!\n\nThis capstone achievement solidifies your status as one of the premier talents in world football.`,
      read: false,
      type: 'SPORTING',
      timestamp: 'MON 10:00',
      priority: 'CRITICAL',
      choices: [{ text: 'Celebrate Victory', type: 'ack' }]
    });
  });

  return { updatedPlayer: p, inboxMsgs: msgs };
}

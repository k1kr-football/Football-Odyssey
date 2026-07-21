import { Player, InboxMessage, Trophy, TimelineEvent } from '../types';

export type IntlTier = 'Uncapped' | 'Youth' | 'Senior Fringe' | 'Senior Regular' | 'Senior Captain' | 'Retired';

export function getIntlEligibility(player: Player): IntlTier {
  if (player.stateFlags?.intlStatus === 'Retired') return 'Retired';

  const baseRep = player.reputation?.world || 30;
  const form = player.form || 60;
  const ovr = player.ovr || 65;
  const intlTrust = player.relationships?.intlManager || 50;
  const leadership = player.attributes?.leadership || 50;

  if (baseRep >= 78 || ovr >= 82) {
    if (leadership >= 70 && intlTrust >= 70) {
      return 'Senior Captain';
    }
    return 'Senior Regular';
  }

  if (baseRep >= 65 || ovr >= 76) {
    return 'Senior Regular';
  }

  if ((baseRep >= 50 || ovr >= 70) && form >= 60) {
    return 'Senior Fringe';
  }

  if (player.age <= 21 && (baseRep >= 35 || ovr >= 65)) {
    return 'Youth';
  }

  return 'Uncapped';
}

export function generateIntlCallUp(player: Player, currentWeek: number): InboxMessage | null {
  if (player.stateFlags?.intlStatus === 'Retired') return null;

  const tier = getIntlEligibility(player);
  if (tier === 'Uncapped') return null;

  const isQualifiers = [10, 11, 14, 15, 18, 19, 36, 37].includes(currentWeek);
  const isTournament = [49, 50].includes(currentWeek);

  if (!isQualifiers && !isTournament) return null;

  let campaignType = isTournament ? 'Major International Tournament' : 'International Qualifiers';
  const squadName = tier === 'Youth' ? 'U21 National Team' : 'Senior National Team';

  return {
    id: `intl_callup_${currentWeek}_${Date.now()}`,
    sender: `${player.nationality.toUpperCase()} FA (${player.nationality} National Coach)`,
    subject: `OFFICIAL CALL-UP: ${player.nationality} ${squadName}`,
    content: `You have been selected for the ${player.nationality} ${squadName} for the upcoming ${campaignType}. Your recent form (${player.form}/100) and reputation have earned you a spot in the squad. Report to the national training camp.`,
    read: false,
    type: 'DM',
    timestamp: 'MON 09:00',
    choices: [
      { text: 'Accept Call-Up & Report to Camp', type: 'INTL_ACCEPT' },
      { text: 'Withdraw (Cite Physical Fatigue/Club Priority)', type: 'INTL_DECLINE' },
      { text: 'Retire from International Football', type: 'INTL_RETIRE' }
    ]
  };
}

export interface IntlMatchResult {
  updatedPlayer: Player;
  rating: number;
  goals: number;
  assists: number;
  result: 'WIN' | 'DRAW' | 'LOSS';
  opponent: string;
  inboxMessages: InboxMessage[];
  timelineEvents: TimelineEvent[];
  trophyWon?: Trophy;
}

export function processIntlMatch(player: Player, isTournament: boolean = false): IntlMatchResult {
  const currentCaps = player.stats.caps || 0;
  const currentIntlGoals = player.stats.intlGoals || 0;
  const intlTrust = player.relationships?.intlManager || 50;

  // Calculate performance
  const baseRating = Math.min(10, Math.max(5, (player.ovr * 0.08) + (player.form * 0.02) + (Math.random() * 1.5 - 0.75)));
  const rating = parseFloat(baseRating.toFixed(1));

  let goals = 0;
  let assists = 0;
  const isAttacker = ['ST', 'CF', 'LW', 'RW', 'CAM', 'SS'].includes(player.position);

  if (rating >= 7.5 && isAttacker && Math.random() < 0.6) goals = Math.random() < 0.25 ? 2 : 1;
  if (rating >= 7.0 && Math.random() < 0.4) assists = 1;

  const resultRoll = Math.random();
  const result: 'WIN' | 'DRAW' | 'LOSS' = resultRoll > 0.4 ? 'WIN' : resultRoll > 0.15 ? 'DRAW' : 'LOSS';

  const opponents = ['Germany', 'Brazil', 'France', 'Spain', 'Argentina', 'Italy', 'Netherlands', 'Portugal', 'England', 'Uruguay'];
  const opponent = opponents[Math.floor(Math.random() * opponents.length)];

  // Caps & goals
  const newCaps = currentCaps + 1;
  const newIntlGoals = currentIntlGoals + goals;

  // Fatigue impact
  const newFatigue = Math.min(100, player.fatigue + 12);
  const newMentalFatigue = Math.min(100, (player.mentalFatigue || 15) + 8);
  const newWorldRep = Math.min(100, player.reputation.world + (result === 'WIN' ? 2 : 1));
  const newFans = Math.min(100, player.fans + 3);
  const newIntlTrust = Math.min(100, intlTrust + (result === 'WIN' ? 4 : 1));

  let trophyWon: Trophy | undefined = undefined;
  const inboxMessages: InboxMessage[] = [];
  const timelineEvents: TimelineEvent[] = [];

  if (isTournament && result === 'WIN' && Math.random() < 0.4) {
    const trophyName = player.nationality === 'England' || player.nationality === 'France' || player.nationality === 'Germany' || player.nationality === 'Spain' || player.nationality === 'Italy' || player.nationality === 'Portugal' ? 'European Championship' : 'International Continental Cup';
    trophyWon = {
      id: `intl_trophy_${Date.now()}`,
      name: trophyName,
      competition: `${player.nationality} Senior International`,
      year: 2026 + Math.floor((player.stats.apps || 0) / 40),
      story: `Lifted major international silverware with ${player.nationality} after a heroic tournament campaign.`
    };

    inboxMessages.push({
      id: `intl_trophy_msg_${Date.now()}`,
      sender: `${player.nationality.toUpperCase()} FA`,
      subject: `🏆 INTERNATIONAL CHAMPIONS!`,
      content: `Incredible achievement! You have won the ${trophyName} with ${player.nationality}! Your ${newIntlGoals} international goals and outstanding contributions will go down in national football history.`,
      read: false,
      type: 'SPORTING',
      timestamp: 'SUN 20:00',
      choices: [{ text: 'Celebrate National Glory', type: 'ack' }]
    });

    timelineEvents.push({
      id: `timeline_intl_trophy_${Date.now()}`,
      week: 50,
      day: 'SUN',
      type: 'MILESTONE',
      title: `Won ${trophyName}`,
      description: `Crowned international champion with ${player.nationality}. Total Caps: ${newCaps}.`
    });
  }

  // Milestone check for caps
  if ([1, 10, 25, 50, 75, 100].includes(newCaps)) {
    inboxMessages.push({
      id: `intl_caps_milestone_${Date.now()}`,
      sender: `${player.nationality.toUpperCase()} FA`,
      subject: `🎖️ MILESTONE: ${newCaps} Caps for ${player.nationality}`,
      content: `Congratulations on reaching ${newCaps} official caps for ${player.nationality}! You are etching your name alongside the nation's all-time greats.`,
      read: false,
      type: 'SPORTING',
      timestamp: 'SUN 18:00',
      choices: [{ text: 'Proud Moment', type: 'ack' }]
    });

    timelineEvents.push({
      id: `timeline_intl_cap_${Date.now()}`,
      week: 36,
      day: 'SAT',
      type: 'MILESTONE',
      title: `${newCaps} Caps for ${player.nationality}`,
      description: `Reached ${newCaps} senior international appearances for country.`
    });
  }

  const updatedPlayer: Player = {
    ...player,
    fatigue: newFatigue,
    mentalFatigue: newMentalFatigue,
    fans: newFans,
    reputation: {
      ...player.reputation,
      world: newWorldRep
    },
    relationships: {
      ...player.relationships,
      intlManager: newIntlTrust
    },
    stats: {
      ...player.stats,
      caps: newCaps,
      intlGoals: newIntlGoals
    },
    trophies: trophyWon ? [...(player.trophies || []), trophyWon] : player.trophies,
    timeline: [...timelineEvents, ...(player.timeline || [])]
  };

  return {
    updatedPlayer,
    rating,
    goals,
    assists,
    result,
    opponent,
    inboxMessages,
    timelineEvents,
    trophyWon
  };
}

import { Player, InboxMessage, TimelineEvent } from '../types';

export interface StadiumMilestoneStatus {
  hasNamedStand: boolean;
  hasBronzeStatue: boolean;
  hasHallOfFame: boolean;
  standName?: string;
  statueLocation?: string;
  hallOfFameYear?: number;
}

export function evaluateStadiumMilestones(player: Player): {
  updatedPlayer: Player;
  newMilestonesUnlocked: string[];
  inboxMessages: InboxMessage[];
  timelineEvents: TimelineEvent[];
} {
  const apps = player.stats?.apps || 0;
  const goals = player.stats?.goals || 0;
  const assists = player.stats?.assists || 0;
  const totalContributions = goals + assists;
  const trophiesCount = player.trophies?.length || 0;

  const currentMilestones: StadiumMilestoneStatus = {
    hasNamedStand: player.stateFlags?.stadiumMilestones?.hasNamedStand ?? false,
    hasBronzeStatue: player.stateFlags?.stadiumMilestones?.hasBronzeStatue ?? false,
    hasHallOfFame: player.stateFlags?.stadiumMilestones?.hasHallOfFame ?? false,
    standName: player.stateFlags?.stadiumMilestones?.standName,
    statueLocation: player.stateFlags?.stadiumMilestones?.statueLocation,
    hallOfFameYear: player.stateFlags?.stadiumMilestones?.hallOfFameYear
  };

  const newMilestonesUnlocked: string[] = [];
  const inboxMessages: InboxMessage[] = [];
  const timelineEvents: TimelineEvent[] = [];

  let updatedStatus = { ...currentMilestones };
  let newFans = player.fans || 50;
  let newLegacy = player.reputation?.legacy || 50;

  // 1. NAMED STAND
  if (!updatedStatus.hasNamedStand && (apps >= 200 || totalContributions >= 100)) {
    updatedStatus.hasNamedStand = true;
    updatedStatus.standName = `The ${player.lastName} Stand`;
    newMilestonesUnlocked.push('NAMED_STAND');
    newFans = Math.min(100, newFans + 15);
    newLegacy += 25;

    inboxMessages.push({
      id: `named_stand_${Date.now()}`,
      sender: `${player.currentClubSymbol} Board of Directors`,
      subject: `🏟️ STADIUM HONOR: "The ${player.lastName} Stand" Unveiled!`,
      content: `In recognition of your ${apps} appearances and ${totalContributions} goal contributions, the Board of Directors has formally renamed the North Stand at the stadium as "The ${player.lastName} Stand". Fans chanted your name as the plaque was unveiled.`,
      read: false,
      type: 'SPORTING',
      timestamp: 'SUN 12:00',
      choices: [{ text: 'An Immortal Honor', type: 'ack' }]
    });

    timelineEvents.push({
      id: `timeline_stand_${Date.now()}`,
      week: player.stateFlags?.currentWeek || 1,
      day: 'SUN',
      type: 'MILESTONE',
      title: `Stadium Stand Renamed`,
      description: `Official stadium stand renamed "The ${player.lastName} Stand" in tribute to ${apps} appearances.`
    });
  }

  // 2. BRONZE STATUE
  if (!updatedStatus.hasBronzeStatue && (apps >= 350 || totalContributions >= 200)) {
    updatedStatus.hasBronzeStatue = true;
    updatedStatus.statueLocation = `Stadium West Plaza`;
    newMilestonesUnlocked.push('BRONZE_STATUE');
    newFans = Math.min(100, newFans + 25);
    newLegacy += 40;

    inboxMessages.push({
      id: `bronze_statue_${Date.now()}`,
      sender: `${player.currentClubSymbol} Supporters Trust`,
      subject: `🗿 IMMORTAL STATUE ERECTED: Bronze Tribute Outside Stadium`,
      content: `A historic moment! A 10-foot bronze statue depicting your iconic goal celebration has been erected outside the stadium west plaza. Supporters gathered in their thousands to witness the unveiling alongside club legends.`,
      read: false,
      type: 'SPORTING',
      timestamp: 'SUN 15:00',
      choices: [{ text: 'Etched in Bronze Forever', type: 'ack' }]
    });

    timelineEvents.push({
      id: `timeline_statue_${Date.now()}`,
      week: player.stateFlags?.currentWeek || 1,
      day: 'SUN',
      type: 'MILESTONE',
      title: `Bronze Statue Unveiled`,
      description: `Bronze statue erected outside stadium honoring legendary milestone of ${totalContributions} goal contributions.`
    });
  }

  // 3. HALL OF FAME INDUCTION
  if (!updatedStatus.hasHallOfFame && (apps >= 500 || totalContributions >= 300 || trophiesCount >= 3)) {
    updatedStatus.hasHallOfFame = true;
    updatedStatus.hallOfFameYear = 2026 + Math.floor(apps / 40);
    newMilestonesUnlocked.push('HALL_OF_FAME');
    newFans = 100;
    newLegacy += 60;

    inboxMessages.push({
      id: `hall_of_fame_${Date.now()}`,
      sender: `National & Club Football Heritage Commission`,
      subject: `🏛️ HALL OF FAME INDUCTION: Formal Laureate Ceremony`,
      content: `You have officially been inducted into the ${player.currentClubSymbol} & National Football Hall of Fame! Your legacy is secured among the absolute immortal icons of the sport.`,
      read: false,
      type: 'SPORTING',
      timestamp: 'SUN 20:00',
      choices: [{ text: 'Enter Football Immortality', type: 'ack' }]
    });

    timelineEvents.push({
      id: `timeline_hof_${Date.now()}`,
      week: player.stateFlags?.currentWeek || 1,
      day: 'SUN',
      type: 'MILESTONE',
      title: `Hall of Fame Induction`,
      description: `Formally inducted into the official Football Hall of Fame.`
    });
  }

  const updatedPlayer: Player = {
    ...player,
    fans: newFans,
    reputation: {
      ...player.reputation,
      legacy: newLegacy
    },
    stateFlags: {
      ...player.stateFlags,
      stadiumMilestones: updatedStatus
    },
    timeline: [...timelineEvents, ...(player.timeline || [])]
  };

  return {
    updatedPlayer,
    newMilestonesUnlocked,
    inboxMessages,
    timelineEvents
  };
}

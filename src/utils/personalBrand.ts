import { Player, InboxMessage, TimelineEvent } from '../types';

export interface MediaDeal {
  id: string;
  title: string;
  category: 'DOCUMENTARY' | 'BOOT_LINE' | 'TV_PUNDIT' | 'CHARITY_AMBASSADOR';
  costMentalFatigue: number;
  incomePayout: number;
  mediaProfileGain: number;
  fanAdorationGain: number;
  worldRepGain: number;
  description: string;
}

export const MEDIA_BRAND_ACTIVITIES: MediaDeal[] = [
  {
    id: 'docu_feature',
    title: 'Behind-The-Scenes Streaming Series',
    category: 'DOCUMENTARY',
    costMentalFatigue: 15,
    incomePayout: 40000,
    mediaProfileGain: 18,
    fanAdorationGain: 12,
    worldRepGain: 8,
    description: 'Allow film crews inside your home & locker room for a multi-episode global documentary.'
  },
  {
    id: 'signature_boot',
    title: 'Custom Signature Boot Line Launch',
    category: 'BOOT_LINE',
    costMentalFatigue: 8,
    incomePayout: 65000,
    mediaProfileGain: 14,
    fanAdorationGain: 10,
    worldRepGain: 12,
    description: 'Collaborate with top sportswear designers to engineer an exclusive signature boot model.'
  },
  {
    id: 'pundit_guest',
    title: 'BBC / Sky Sports Guest Analyst Panel',
    category: 'TV_PUNDIT',
    costMentalFatigue: 10,
    incomePayout: 18000,
    mediaProfileGain: 10,
    fanAdorationGain: 5,
    worldRepGain: 4,
    description: 'Provide live tactical commentary on European matches, building your broadcasting rapport.'
  },
  {
    id: 'charity_ambassador',
    title: 'UNICEF / Youth Foundation Ambassador',
    category: 'CHARITY_AMBASSADOR',
    costMentalFatigue: 5,
    incomePayout: 10000,
    mediaProfileGain: 12,
    fanAdorationGain: 15,
    worldRepGain: 6,
    description: 'Host global fundraising galas and youth football workshops for underprivileged communities.'
  }
];

export function executeMediaBrandActivity(
  player: Player,
  activityId: string
): { updatedPlayer: Player; inboxMessage: InboxMessage; timelineEvent: TimelineEvent } {
  const activity = MEDIA_BRAND_ACTIVITIES.find(a => a.id === activityId) || MEDIA_BRAND_ACTIVITIES[0];

  const currentMediaProfile = player.stateFlags?.mediaProfile || player.reputation?.media || 30;
  const newMediaProfile = Math.min(100, currentMediaProfile + activity.mediaProfileGain);

  const newMentalFatigue = Math.min(100, (player.mentalFatigue || 15) + activity.costMentalFatigue);
  const newBalance = (player.finances?.balance || 0) + activity.incomePayout;
  const newFans = Math.min(100, (player.fans || 50) + activity.fanAdorationGain);
  const newWorldRep = Math.min(100, player.reputation.world + activity.worldRepGain);

  const inboxMessage: InboxMessage = {
    id: `media_brand_${Date.now()}`,
    sender: `Global Media & PR Agency`,
    subject: `📺 BRAND LAUNCH: ${activity.title}`,
    content: `Your media venture "${activity.title}" was an overwhelming commercial and public success! Your global Media Profile rose to ${newMediaProfile}/100.\n\nFinancial Payout: +£${activity.incomePayout.toLocaleString()}\nMental Strain: +${activity.costMentalFatigue} Fatigue`,
    read: false,
    type: 'CONTRACT',
    timestamp: 'SAT 18:00',
    choices: [{ text: 'Expand Personal Brand', type: 'ack' }]
  };

  const timelineEvent: TimelineEvent = {
    id: `timeline_media_${Date.now()}`,
    week: player.stateFlags?.currentWeek || 1,
    day: 'SAT',
    type: 'MILESTONE',
    title: `Launched ${activity.title}`,
    description: `Expanded media empire with ${activity.title}. Media Profile now ${newMediaProfile}/100.`
  };

  const completedActivities = player.stateFlags?.completedMediaActivities || [];

  const updatedPlayer: Player = {
    ...player,
    mentalFatigue: newMentalFatigue,
    fans: newFans,
    finances: {
      ...player.finances,
      balance: newBalance
    },
    reputation: {
      ...player.reputation,
      media: newMediaProfile,
      world: newWorldRep
    },
    stateFlags: {
      ...player.stateFlags,
      mediaProfile: newMediaProfile,
      completedMediaActivities: [...completedActivities, activity.id]
    },
    timeline: [timelineEvent, ...(player.timeline || [])]
  };

  return {
    updatedPlayer,
    inboxMessage,
    timelineEvent
  };
}

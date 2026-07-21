import { Player, InboxMessage, TimelineEvent } from '../types';

export function checkTestimonialEligibility(player: Player): boolean {
  const clubApps = player.stats?.apps || 0;
  const isLateCareer = player.age >= 33 || Boolean(player.stateFlags?.retired) || player.contract.yearsLeft <= 1;
  const hasLongTenure = clubApps >= 250;
  const alreadyHosted = Boolean(player.stateFlags?.testimonialHosted);

  return hasLongTenure && isLateCareer && !alreadyHosted;
}

export function generateTestimonialProposal(player: Player): InboxMessage | null {
  if (!checkTestimonialEligibility(player)) return null;

  return {
    id: `testimonial_proposal_${Date.now()}`,
    sender: `${player.currentClubSymbol} Board & Supporters Trust`,
    subject: `⭐ CLUB TESTIMONIAL MATCH & FAREWELL TOUR PROPOSAL`,
    content: `In recognition of your exceptional service, ${player.stats.apps} appearances, and legendary dedication to ${player.currentClubSymbol}, the Supporters Trust and Board wish to organize an official Testimonial Exhibition Match against the Club Legends XI. Proceeds will be gifted to your personal foundation and career ledger.`,
    read: false,
    type: 'CONTRACT',
    timestamp: 'MON 09:00',
    choices: [
      { text: 'Accept Testimonial Match & Farewell Celebration', type: 'TESTIMONIAL_ACCEPT' },
      { text: 'Decline Politely (Stay Focused Purely on League)', type: 'TESTIMONIAL_DECLINE' }
    ]
  };
}

export function executeTestimonialMatch(
  player: Player,
  speechStyle: 'HUMBLE_GRATITUDE' | 'PASS_THE_TORCH' | 'DEFIANT_LEGEND'
): { updatedPlayer: Player; gateRevenue: number; inboxMessage: InboxMessage; timelineEvent: TimelineEvent } {
  const gateRevenue = 150000 + Math.floor(Math.random() * 100000);
  const legacyBoost = 50;
  const fanBoost = 20;

  let speechOutcome = '';
  if (speechStyle === 'HUMBLE_GRATITUDE') {
    speechOutcome = `"I owe everything to this badge, these supporters, and my teammates who bled for every victory." - Stand ovation from 50,000 supporters.`;
  } else if (speechStyle === 'PASS_THE_TORCH') {
    speechOutcome = `"The future of this club is in good hands. Support the young boys coming through the academy as you supported me."`;
  } else {
    speechOutcome = `"We proved the critics wrong at every single step. Thank you for standing shoulder-to-shoulder with me."`;
  }

  const newBalance = (player.finances?.balance || 0) + gateRevenue;
  const newLegacy = (player.reputation?.legacy || 50) + legacyBoost;
  const newFans = Math.min(100, (player.fans || 50) + fanBoost);

  const inboxMessage: InboxMessage = {
    id: `testimonial_complete_${Date.now()}`,
    sender: `${player.currentClubSymbol} President & Fans`,
    subject: `👑 TESTIMONIAL MATCH SUCCESS: £${(gateRevenue / 1000).toFixed(0)}k Gate Payout`,
    content: `A magnificent evening at the stadium! The Testimonial Exhibition against the Legends XI ended in a thrilling 4-3 celebration. Your farewell speech was broadcast nationwide.\n\nSpeech: ${speechOutcome}\n\nFinancial Ledger Payout: +£${gateRevenue.toLocaleString()}`,
    read: false,
    type: 'SPORTING',
    timestamp: 'SUN 22:00',
    choices: [{ text: 'Inscribe in Club History', type: 'ack' }]
  };

  const timelineEvent: TimelineEvent = {
    id: `timeline_testimonial_${Date.now()}`,
    week: player.stateFlags?.currentWeek || 1,
    day: 'SUN',
    type: 'MILESTONE',
    title: `Hosted Official Club Testimonial Match`,
    description: `Honored at ${player.currentClubSymbol} with a sold-out testimonial match against Club Legends XI.`
  };

  const updatedPlayer: Player = {
    ...player,
    fans: newFans,
    reputation: {
      ...player.reputation,
      legacy: newLegacy
    },
    finances: {
      ...player.finances,
      balance: newBalance
    },
    stateFlags: {
      ...player.stateFlags,
      testimonialHosted: true
    },
    timeline: [timelineEvent, ...(player.timeline || [])]
  };

  return {
    updatedPlayer,
    gateRevenue,
    inboxMessage,
    timelineEvent
  };
}

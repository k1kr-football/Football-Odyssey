import { Player, InboxMessage, TimelineEvent } from '../types';

export interface AcademyProspect {
  id: string;
  name: string;
  position: string;
  age: number;
  ovr: number;
  potential: number;
  guidanceType?: 'TECHNICAL' | 'MENTALITY' | 'ADVOCACY';
  breakthroughMade: boolean;
  goalsScored: number;
  appsMade: number;
  legacyPoints: number;
  quote?: string;
}

export function isEligibleForAcademyInvolvement(player: Player): boolean {
  const ageEligible = player.age >= 29;
  const appsEligible = (player.stats?.apps || 0) >= 200;
  const hierarchyEligible = ['First Teamer', 'Key Player', 'Star Player', 'Club Legend'].includes(player.contract?.status || '');
  return ageEligible || appsEligible || hierarchyEligible;
}

export function generateAcademyProspects(player: Player): AcademyProspect[] {
  const positions = ['ST', 'CAM', 'CM', 'CB', 'LW', 'RW'];
  const names = [
    { name: 'Lucas Vance', pos: 'CAM' },
    { name: 'Mateo Silva', pos: 'ST' },
    { name: 'Finley Cooper', pos: 'CM' },
    { name: 'Samir Hadad', pos: 'CB' },
    { name: 'Leo Sterling', pos: 'LW' }
  ];

  return names.map((p, idx) => ({
    id: `prospect_${idx}_${Date.now()}`,
    name: p.name,
    position: p.pos,
    age: 17,
    ovr: 64 + Math.floor(Math.random() * 5),
    potential: 82 + Math.floor(Math.random() * 8),
    breakthroughMade: false,
    goalsScored: 0,
    appsMade: 0,
    legacyPoints: 0,
    quote: `Looking up to ${player.lastName}'s standard in training every single day.`
  }));
}

export function guideAcademyProspect(
  player: Player,
  prospect: AcademyProspect,
  guidanceType: 'TECHNICAL' | 'MENTALITY' | 'ADVOCACY'
): { updatedPlayer: Player; updatedProspect: AcademyProspect; inboxMessage: InboxMessage } {
  let ovrGain = 0;
  let legacyPointGain = 0;
  let summaryText = '';

  if (guidanceType === 'TECHNICAL') {
    ovrGain = 4;
    legacyPointGain = 15;
    summaryText = `Spent extra hours after training running technical drills with ${prospect.name}. His ball control and composure under pressure improved visibly.`;
  } else if (guidanceType === 'MENTALITY') {
    ovrGain = 3;
    legacyPointGain = 20;
    summaryText = `Shared career advice and tactical discipline lessons with ${prospect.name}. His leadership traits and resilience grew.`;
  } else {
    ovrGain = 2;
    legacyPointGain = 25;
    summaryText = `Publicly advocated in the press and to Manager ${player.managerInfo?.name || 'Clement'} for ${prospect.name} to receive first-team minutes.`;
  }

  const newOvr = Math.min(prospect.potential, prospect.ovr + ovrGain);
  const breakthroughChance = newOvr >= 70 || guidanceType === 'ADVOCACY';
  const breakthroughNow = !prospect.breakthroughMade && breakthroughChance;

  const updatedProspect: AcademyProspect = {
    ...prospect,
    ovr: newOvr,
    guidanceType,
    breakthroughMade: prospect.breakthroughMade || breakthroughNow,
    appsMade: prospect.appsMade + (breakthroughNow ? 3 : 1),
    goalsScored: prospect.goalsScored + (breakthroughNow && ['ST', 'CAM', 'LW', 'RW'].includes(prospect.position) ? 1 : 0),
    legacyPoints: prospect.legacyPoints + legacyPointGain + (breakthroughNow ? 30 : 0)
  };

  const existingProspects: AcademyProspect[] = player.stateFlags?.academyProspects || [];
  const filtered = existingProspects.filter(p => p.id !== prospect.id);
  const newProspectsList = [...filtered, updatedProspect];

  const currentAcademyScore = player.stateFlags?.academyLegacyScore || 0;
  const newAcademyScore = currentAcademyScore + legacyPointGain + (breakthroughNow ? 30 : 0);

  const inboxMessage: InboxMessage = {
    id: `academy_update_${Date.now()}`,
    sender: `Youth Academy Director`,
    subject: `🎓 ACADEMY PROGRESS: ${prospect.name}`,
    content: `${summaryText}\n\n${breakthroughNow ? `🌟 BREAKTHROUGH! Thanks to your mentorship, ${prospect.name} made his senior team debut!` : `${prospect.name}'s OVR increased to ${newOvr}.`}`,
    read: false,
    type: 'SPORTING',
    timestamp: 'MON 10:00',
    choices: [{ text: 'Proud Senior Leadership', type: 'ack' }]
  };

  const decisionEntry = {
    id: `academy_guidance_${Date.now()}`,
    week: player.stateFlags?.currentWeek || 1,
    choiceType: `ACADEMY_MENTOR_${guidanceType}`,
    choiceText: `Mentored ${prospect.name} (${guidanceType})`,
    description: `Provided senior guidance to youth prospect ${prospect.name}.`,
    timestamp: Date.now()
  };

  const updatedPlayer: Player = {
    ...player,
    stateFlags: {
      ...player.stateFlags,
      academyProspects: newProspectsList,
      academyLegacyScore: newAcademyScore,
      decisionMemory: [...(player.stateFlags?.decisionMemory || []), decisionEntry]
    }
  };

  return {
    updatedPlayer,
    updatedProspect,
    inboxMessage
  };
}

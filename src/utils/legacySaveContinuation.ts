import { Player, StoryArc } from '../types';
import { GameState } from '../store/GameContext';

export interface RetiredLegendRecord {
  firstName: string;
  lastName: string;
  ageAtRetirement: number;
  finalClub: string;
  stats: {
    apps: number;
    goals: number;
    assists: number;
    caps: number;
    intlGoals: number;
  };
  trophies: any[];
  legacyScore: number;
  stadiumMilestones?: any;
  hallOfFame: boolean;
  retiredYear: number;
}

export function createLegacyContinuation(
  gameState: GameState,
  selectedProspectId?: string
): GameState {
  const currentLegend = gameState.player;
  if (!currentLegend) return gameState;

  // 1. Archive the current player into retired legends
  const legendRecord: RetiredLegendRecord = {
    firstName: currentLegend.firstName,
    lastName: currentLegend.lastName,
    ageAtRetirement: currentLegend.age,
    finalClub: currentLegend.currentClubSymbol,
    stats: {
      apps: currentLegend.stats.apps || 0,
      goals: currentLegend.stats.goals || 0,
      assists: currentLegend.stats.assists || 0,
      caps: currentLegend.stats.caps || 0,
      intlGoals: currentLegend.stats.intlGoals || 0
    },
    trophies: currentLegend.trophies || [],
    legacyScore: currentLegend.reputation?.legacy || 85,
    stadiumMilestones: currentLegend.stateFlags?.stadiumMilestones,
    hallOfFame: Boolean(currentLegend.stateFlags?.stadiumMilestones?.hasHallOfFame || currentLegend.reputation?.legacy > 70),
    retiredYear: 2026 + gameState.season
  };

  // 2. Determine the new character
  const prospects = currentLegend.stateFlags?.academyProspects || [];
  const chosenProspect = prospects.find((p: any) => p.id === selectedProspectId) || prospects[0];

  const newFirstName = chosenProspect ? chosenProspect.name.split(' ')[0] : 'Leo';
  const newLastName = chosenProspect ? chosenProspect.name.split(' ')[1] || 'Vance' : 'Vance';
  const newPosition = chosenProspect ? chosenProspect.position : 'CAM';

  // Tag previous decision memories
  const oldMemories = (currentLegend.stateFlags?.decisionMemory || []).map((m: any) => ({
    ...m,
    description: `[Previous Career - Legend ${currentLegend.lastName}]: ${m.description}`
  }));

  // Story Arc for stepping out of shadow
  const shadowStoryArc: StoryArc = {
    drivingQuestion: `Stepping Out of the Shadow of Legend ${currentLegend.firstName} ${currentLegend.lastName}`,
    currentAct: 1,
    currentBeat: 0,
    progress: 10,
    beats: [
      {
        act: 1,
        beat: 1,
        name: 'The Weight of the Jersey',
        description: `Fans and media compare your every touch to ${currentLegend.lastName}.`,
        triggered: false,
        narrative: `Taking the pitch at ${currentLegend.currentClubSymbol} knowing ${currentLegend.firstName} ${currentLegend.lastName}'s statue stands outside the turnstiles.`
      },
      {
        act: 2,
        beat: 1,
        name: 'First Senior Goal',
        description: `Carve your own name into club history with a breakthrough strike.`,
        triggered: false,
        narrative: `The stadium erupts as you score, creating a identity distinct from your mentor.`
      }
    ],
    resolution: null
  };

  const newPlayer: Player = {
    firstName: newFirstName,
    lastName: newLastName,
    nationality: currentLegend.nationality,
    backstory: 'ACADEMY_PRODIGY',
    position: newPosition,
    subPosition: 'Ball-Playing CB' as any,
    dominantFoot: 'Right',
    weakFoot: 4,
    startingClubSymbol: currentLegend.currentClubSymbol,
    currentClubSymbol: currentLegend.currentClubSymbol,
    ovr: chosenProspect ? chosenProspect.ovr : 66,
    ceiling: 88,
    age: 17,
    form: 75,
    sharpness: 80,
    tacticalFamiliarity: 70,
    trust: 60,
    fatigue: 10,
    morale: 85,
    fans: 65, // Inherits initial predecessor halo
    mediaPerception: 60,
    storyArc: shadowStoryArc,
    reputation: {
      club: 45,
      league: 30,
      world: 20,
      peerRespect: 40,
      skill: 65,
      attitude: 80,
      media: 50,
      fans: 65,
      global: 25,
      legacy: 0
    },
    contract: {
      wage: 3500,
      expires: 'June 2029',
      yearsLeft: 3,
      status: 'Youth',
      bonuses: 500
    },
    agentTier: 'Rookie',
    transferOffers: [],
    relationships: {
      manager: 65,
      manager_discipline: 70,
      teammates: 75,
      agent: 60,
      family: 90,
      intlManager: 40
    },
    managerInfo: {
      ...currentLegend.managerInfo,
      attitudeText: `Expecting you to earn your spot, not just ride on ${currentLegend.lastName}'s coattails.`
    },
    socialMedia: {
      followers: 12000,
      cancelRisk: 5
    },
    attributes: {
      pace: 74,
      strength: 65,
      stamina: 70,
      agility: 76,
      finishing: 68,
      passing: 72,
      dribbling: 75,
      firstTouch: 74,
      tackling: 55,
      composure: 70,
      vision: 75,
      positioning: 68,
      decisionMaking: 70,
      tacticalAwareness: 68,
      leadership: 62,
      determination: 82
    },
    stats: {
      apps: 0,
      goals: 0,
      assists: 0,
      caps: 0,
      intlGoals: 0
    },
    finances: {
      balance: 15000,
      expenses: { housing: 500, training: 200, lifestyle: 300, family: 200 }
    },
    lifestyleTier: {
      housing: 'Digs',
      training: 'Pro',
      nutrition: 'Club',
      image: 'Standard'
    },
    sponsors: 1,
    playstyleIdentity: 'Technician',
    characterType: 'AMBITIOUS_PRODIGY',
    personality: 'Ambitious',
    traits: ['Mentored Prodigy', 'High Ceiling'],
    timeline: [
      {
        id: `timeline_legacy_start_${Date.now()}`,
        week: gameState.currentWeek,
        day: gameState.currentDay,
        type: 'MILESTONE',
        title: `Signed Senior Contract as Legacy Prospect`,
        description: `Promoted from youth academy following the retirement of legend ${currentLegend.firstName} ${currentLegend.lastName}.`
      }
    ],
    mentalFatigue: 10,
    isInjured: false,
    promises: [],
    mentoring: null,
    squadDynamics: {
      cohesion: 70,
      dominantClique: 'Academy Graduates',
      dressingRoomLeaders: [currentLegend.managerInfo?.name || 'Senior Captain'],
      unity: 75,
      faultLines: []
    },
    stateFlags: {
      decisionMemory: oldMemories,
      predecessorLegend: {
        name: `${currentLegend.firstName} ${currentLegend.lastName}`,
        apps: currentLegend.stats.apps,
        goals: currentLegend.stats.goals,
        legacyScore: currentLegend.reputation?.legacy || 85
      },
      intlStatus: 'Uncapped'
    },
    trophies: [],
    partnerships: { striker: 50, midfield: 50, winger: 50 }
  };

  const existingRetired = (gameState.storyFlags?.retiredLegends || []) as RetiredLegendRecord[];

  return {
    ...gameState,
    player: newPlayer,
    screen: 'HUB',
    storyFlags: {
      ...gameState.storyFlags,
      retiredLegends: [...existingRetired, legendRecord]
    },
    inbox: [
      {
        id: `legacy_welcome_${Date.now()}`,
        sender: `${newPlayer.currentClubSymbol} Academy Director & Manager`,
        subject: `🌟 NEW ERA: Stepping Out of ${currentLegend.lastName}'s Shadow`,
        content: `Welcome to the senior squad, ${newFirstName}! Following the legendary retirement of ${currentLegend.firstName} ${currentLegend.lastName}, all eyes are on you. You have inherited the #10 squad shirt and the trust of the academy. Make this career your own!`,
        read: false,
        type: 'SPORTING',
        timestamp: 'MON 09:00',
        choices: [{ text: 'Write My Own History', type: 'ack' }]
      },
      ...gameState.inbox
    ]
  };
}

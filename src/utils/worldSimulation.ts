import { CLUBS } from '../data/teams';
import { Player } from '../types';
import { ClubFinancesMap, initializeAllClubFinances } from './clubFinances';
import { generateRandomNewManager } from './seasonObjectives';

export type ManagerArchetype = 'Demanding' | 'Nurturing' | 'Tactical' | 'Pragmatic' | 'LOYALIST' | 'PRAGMATIST' | 'PROJECT_BUILDER' | 'VOLATILE' | string;

export interface WorldNewsItem {
  type: 'MANAGER' | 'TRANSFER' | 'GENERAL';
  text: string;
}

export interface WorldClubState {
  symbol: string;
  name: string;
  manager: {
    name: string;
    pressure?: number;
    personality?: string;
    tacticalSystem?: string;
    tactics?: string;
    archetype?: ManagerArchetype;
    philosophy?: string;
    patience?: number;
    trust?: number;
    jobSecurity?: number | string;
    tenureWeeks?: number;
  };
  roster?: any[];
  form?: (string | number)[];
}

export interface WorldState {
  clubs: Record<string, WorldClubState>;
  clubFinances?: ClubFinancesMap;
  newsItems?: WorldNewsItem[];
  totwHistory?: Record<string, any>;
  potmHistory?: Record<string, any>;
}

export function initializeWorldState(rosters?: Record<string, any[]>): WorldState {
  const clubsState: Record<string, WorldClubState> = {};

  CLUBS.forEach((club) => {
    const mgrInfo = generateRandomNewManager(club.symbol);
    clubsState[club.symbol] = {
      symbol: club.symbol,
      name: club.name,
      manager: {
        name: mgrInfo.name,
        pressure: mgrInfo.pressure,
        personality: mgrInfo.personality,
        tacticalSystem: mgrInfo.tacticalSystem,
        tactics: mgrInfo.tacticalSystem,
        archetype: mgrInfo.personality,
        philosophy: mgrInfo.tacticalSystem,
        patience: 50
      },
      roster: rosters?.[club.symbol] || [],
      form: ['W', 'D', 'W', 'L', 'W']
    };
  });

  return {
    clubs: clubsState,
    clubFinances: initializeAllClubFinances(),
    newsItems: [],
    totwHistory: {},
    potmHistory: {}
  };
}

export function simulateWorldWeek(
  worldState: WorldState,
  playerClubSymbol: string,
  week: number,
  isTransferWindow: boolean,
  player: Player
): WorldState {
  const updatedWorld: WorldState = {
    ...worldState,
    clubs: { ...worldState.clubs },
    newsItems: []
  };

  if (Math.random() < 0.25) {
    const randomClub = CLUBS[Math.floor(Math.random() * CLUBS.length)];
    if (randomClub && randomClub.symbol !== playerClubSymbol) {
      if (Math.random() < 0.3) {
        const newMgr = generateRandomNewManager(randomClub.symbol, updatedWorld);
        if (updatedWorld.clubs[randomClub.symbol]) {
          updatedWorld.clubs[randomClub.symbol].manager = {
            name: newMgr.name,
            pressure: 0,
            personality: newMgr.personality,
            tacticalSystem: newMgr.tacticalSystem,
            tactics: newMgr.tacticalSystem,
            archetype: newMgr.personality,
            philosophy: newMgr.tacticalSystem,
            patience: 50
          };
        }
        updatedWorld.newsItems?.push({
          type: 'MANAGER',
          text: `${randomClub.name} have appointed ${newMgr.name} as their new first-team manager.`
        });
      } else if (isTransferWindow) {
        updatedWorld.newsItems?.push({
          type: 'TRANSFER',
          text: `Rumors link ${randomClub.name} with a marquee midfield signing in the current transfer window.`
        });
      }
    }
  }

  return updatedWorld;
}

import { Attributes, PlayerRoleSpecialization, Player } from '../types';
import { REAL_PLAYER_PROFILES } from '../data/realPlayerProfiles';
import { CLUBS } from '../data/teams';
import { calculateAcademyProspectPotentialBonus } from './clubPrestige';

export type NPCType = 'TEAMMATE' | 'RIVAL' | 'OPPOSITION' | 'AGENT' | 'JOURNALIST' | 'MANAGER' | 'YOUTH';
export type NPCPersonalityArchetype = 'DEMANDING' | 'SUPPORTIVE' | 'CALCULATING' | 'VOLATILE' | 'PROFESSIONAL' | 'CHARISMATIC' | 'SKEPTICAL' | 'MENTOR' | 'ENIGMATIC' | 'JOKER';

export interface BaseNPC {
  id: string;
  type: NPCType;
  firstName: string;
  lastName: string;
  nationality: string;
  personality: NPCPersonalityArchetype;
}

export interface PlayerNPC extends BaseNPC {
  type: 'TEAMMATE' | 'RIVAL' | 'OPPOSITION' | 'YOUTH';
  position: string;
  ovr: number;
  potential: number;
  age: number;
  attributes: Attributes;
  clubSymbol?: string;
  roleSpecialization?: PlayerRoleSpecialization;
}

export interface AgentNPC extends BaseNPC {
  type: 'AGENT';
  agenda: 'MONEY' | 'CAREER' | 'REPUTATION' | 'LOYALTY';
  tier: 'Rookie' | 'Hungry' | 'Shark' | 'Super Agent' | 'Legend';
  commission: number;
}

export interface JournalistNPC extends BaseNPC {
  type: 'JOURNALIST';
  style: 'FAN' | 'CRITIC' | 'PROVOCATEUR' | 'INSIDER';
  publication: string;
}

export interface ManagerNPC extends BaseNPC {
  type: 'MANAGER';
  clubSymbol: string;
  tacticalStyle: string;
  pressure: number;
}

export interface NPCRegistry {
  players: PlayerNPC[];
  agents: AgentNPC[];
  journalists: JournalistNPC[];
  managers: ManagerNPC[];
}

const REGIONS: Record<string, { firstNames: string[], lastNames: string[] }> = {
  'England': {
    firstNames: ['Jack', 'Harry', 'Oliver', 'Charlie', 'Thomas', 'William', 'James', 'George', 'Alfie', 'Joshua'],
    lastNames: ['Smith', 'Jones', 'Taylor', 'Williams', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts']
  },
  'Spain': {
    firstNames: ['Alejandro', 'Daniel', 'Pablo', 'David', 'Adrian', 'Hugo', 'Alvaro', 'Mario', 'Diego', 'Javier'],
    lastNames: ['Garcia', 'Gonzalez', 'Rodriguez', 'Fernandez', 'Lopez', 'Martinez', 'Sanchez', 'Perez', 'Gomez', 'Martin']
  },
  'Brazil': {
    firstNames: ['Gabriel', 'Lucas', 'Matheus', 'Pedro', 'Arthur', 'Gustavo', 'Felipe', 'Joao', 'Thiago', 'Rafael'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes']
  },
  'Nigeria': {
    firstNames: ['Emmanuel', 'Samuel', 'Victor', 'Daniel', 'David', 'John', 'Peter', 'Sunday', 'Michael', 'Chinedu'],
    lastNames: ['Okafor', 'Ibrahim', 'Abubakar', 'Musa', 'Sani', 'Ali', 'Oluwaseun', 'Adebayo', 'Onyeka', 'Nnamdi']
  },
  'Germany': {
    firstNames: ['Maximilian', 'Leon', 'Lukas', 'Paul', 'Jonas', 'Finn', 'Felix', 'Elias', 'Luis', 'Noah'],
    lastNames: ['Muller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann']
  },
  'France': {
    firstNames: ['Hugo', 'Lucas', 'Leo', 'Mathis', 'Enzo', 'Nathan', 'Louis', 'Arthur', 'Gabin', 'Raphael'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau']
  },
  'Italy': {
    firstNames: ['Leonardo', 'Francesco', 'Alessandro', 'Lorenzo', 'Mattia', 'Andrea', 'Gabriele', 'Riccardo', 'Tommaso', 'Edoardo'],
    lastNames: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco']
  },
  'Generic': {
    firstNames: ['John', 'David', 'Michael', 'James', 'Alex', 'Chris', 'Daniel', 'Mark', 'Tom', 'Sam'],
    lastNames: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor']
  }
};

export class UnifiedNPCEngine {
  private registry: NPCRegistry;

  constructor(existingRegistry?: NPCRegistry) {
    this.registry = existingRegistry || {
      players: [],
      agents: [],
      journalists: [],
      managers: []
    };
  }

  getRegistry(): NPCRegistry {
    return this.registry;
  }

  private generateUniqueName(nationality: string): { firstName: string, lastName: string } {
    const regionNames = REGIONS[nationality] || REGIONS['Generic'];
    let attempts = 0;
    
    while (attempts < 100) {
      const firstName = regionNames.firstNames[Math.floor(Math.random() * regionNames.firstNames.length)];
      const lastName = regionNames.lastNames[Math.floor(Math.random() * regionNames.lastNames.length)];
      
      const isUnique = !this.registry.players.some(p => p.firstName === firstName && p.lastName === lastName) &&
                       !this.registry.agents.some(a => a.firstName === firstName && a.lastName === lastName) &&
                       !this.registry.journalists.some(j => j.firstName === firstName && j.lastName === lastName) &&
                       !this.registry.managers.some(m => m.firstName === firstName && m.lastName === lastName);

      if (isUnique) return { firstName, lastName };
      attempts++;
    }

    // Fallback if we run out of names
    const fallbackFirsts = ['Arthur', 'Benjamin', 'Charles', 'Dominic', 'Edward', 'Frank', 'George', 'Harrison'];
    const fallbackLasts = ['Sterling', 'Mount', 'Foden', 'Rice', 'Grealish', 'Saka', 'Rashford', 'Bellingham'];
    return {
      firstName: fallbackFirsts[Math.floor(Math.random() * fallbackFirsts.length)],
      lastName: fallbackLasts[Math.floor(Math.random() * fallbackLasts.length)]
    };
  }

  generatePlayer(type: 'TEAMMATE' | 'RIVAL' | 'OPPOSITION' | 'YOUTH', nationality: string, targetOVR: number, age: number, position: string, clubSymbol?: string, explicitName?: { firstName: string, lastName: string }): PlayerNPC {
    let firstName: string;
    let lastName: string;

    if (explicitName) {
      firstName = explicitName.firstName;
      lastName = explicitName.lastName;
    } else {
      const generated = this.generateUniqueName(nationality);
      firstName = generated.firstName;
      lastName = generated.lastName;
    }

    const fullName = `${firstName} ${lastName}`;
    const realProfile = REAL_PLAYER_PROFILES.find(p => p.name.toLowerCase() === fullName.toLowerCase());

    const finalOVR = realProfile ? realProfile.ovr : targetOVR;
    const clubObj = clubSymbol ? CLUBS.find(c => c.symbol === clubSymbol) : undefined;
    const academyBonus = calculateAcademyProspectPotentialBonus(clubObj);
    const basePotential = realProfile ? realProfile.potential : Math.min(99, finalOVR + 4 + Math.floor(Math.random() * 12));
    const finalPotential = Math.min(99, Math.max(finalOVR + 2, basePotential + (type === 'YOUTH' ? academyBonus : Math.round(academyBonus * 0.5))));
    const finalPosition = realProfile ? realProfile.position : position;
    
    const personalities: NPCPersonalityArchetype[] = ['PROFESSIONAL', 'VOLATILE', 'SUPPORTIVE', 'DEMANDING', 'CHARISMATIC'];
    const personality = personalities[Math.floor(Math.random() * personalities.length)];

    const attrBase = Math.max(10, Math.min(99, finalOVR - 10 + Math.floor(Math.random() * 15)));
    const attributes: Attributes = {
      pace: attrBase, passing: attrBase, dribbling: attrBase,
      finishing: attrBase, heading: attrBase, shortPassing: attrBase, longPassing: attrBase, ballControl: attrBase,
      tackling: attrBase, positioning: attrBase, vision: attrBase, crossing: attrBase, strength: attrBase, stamina: attrBase,
      agility: attrBase, balance: attrBase, jumping: attrBase, composure: attrBase, decisionMaking: attrBase,
      tacticalAwareness: attrBase, leadership: attrBase, firstTouch: attrBase, determination: attrBase
    };

    const npc: PlayerNPC = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      firstName,
      lastName,
      nationality,
      personality,
      position: finalPosition,
      ovr: finalOVR,
      potential: finalPotential,
      age,
      attributes,
      clubSymbol
    };

    this.registry.players.push(npc);
    return npc;
  }

  generateAgent(nationality: string, tier: 'Rookie' | 'Hungry' | 'Shark' | 'Super Agent' | 'Legend'): AgentNPC {
    const { firstName, lastName } = this.generateUniqueName(nationality);
    
    const personalities: NPCPersonalityArchetype[] = ['SHARK' as any, 'PROTECTOR' as any, 'CHARISMATIC', 'CALCULATING'];
    const personality = personalities[Math.floor(Math.random() * personalities.length)];

    const agendas: ('MONEY' | 'CAREER' | 'REPUTATION' | 'LOYALTY')[] = ['MONEY', 'CAREER', 'REPUTATION', 'LOYALTY'];

    const npc: AgentNPC = {
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'AGENT',
      firstName,
      lastName,
      nationality,
      personality,
      agenda: agendas[Math.floor(Math.random() * agendas.length)],
      tier,
      commission: tier === 'Legend' ? 15 : tier === 'Shark' ? 20 : tier === 'Rookie' ? 5 : 10
    };

    this.registry.agents.push(npc);
    return npc;
  }

  generateJournalist(nationality: string): JournalistNPC {
     const { firstName, lastName } = this.generateUniqueName(nationality);
     
     const styles: ('FAN' | 'CRITIC' | 'PROVOCATEUR' | 'INSIDER')[] = ['FAN', 'CRITIC', 'PROVOCATEUR', 'INSIDER'];

     const npc: JournalistNPC = {
      id: `journo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'JOURNALIST',
      firstName,
      lastName,
      nationality,
      personality: 'SKEPTICAL',
      style: styles[Math.floor(Math.random() * styles.length)],
      publication: `${nationality} Daily`
     };
     this.registry.journalists.push(npc);
     return npc;
  }

  generateManager(nationality: string, clubSymbol: string): ManagerNPC {
    const { firstName, lastName } = this.generateUniqueName(nationality);
    
    const npc: ManagerNPC = {
      id: `mgr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'MANAGER',
      firstName,
      lastName,
      nationality,
      personality: 'DEMANDING',
      clubSymbol,
      tacticalStyle: 'Gegenpress',
      pressure: Math.floor(Math.random() * 50)
    };
    this.registry.managers.push(npc);
    return npc;
  }
}

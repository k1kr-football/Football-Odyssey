import { GameState } from '../store/GameContext';
import { UnifiedNPCEngine, JournalistNPC } from './npcEngine';
import { queryDecisionMemory, DecisionEntry } from './decisionMemory';

export interface ClubStaffMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string; // e.g. "Dr. Marcus Vance", "Dave Thomas"
  displayRole: string; // e.g. "Chief Physio", "Head of Fitness", "Assistant Manager", "Chief Scout"
  nationality: string;
  relationship: number; // 0-100
}

export interface ClubStaffRoster {
  physio: ClubStaffMember;
  fitnessCoach: ClubStaffMember;
  assistantManager: ClubStaffMember;
  chiefScout: ClubStaffMember;
  journalists: JournalistNPC[];
}

/**
 * Ensures the save has a persistent, per-save staff roster and journalist pool.
 * Generates unique identities via UnifiedNPCEngine if not already present.
 */
export function getClubStaff(state?: GameState | any): ClubStaffRoster {
  // Check if staff already exists on state
  if (state?.clubStaff && state.clubStaff.physio && state.clubStaff.journalists && state.clubStaff.journalists.length > 0) {
    return state.clubStaff;
  }
  if (state?.player?.stateFlags?.clubStaff && state.player.stateFlags.clubStaff.physio) {
    return state.player.stateFlags.clubStaff;
  }

  const nationality = state?.player?.nationality || 'England';
  const engine = new UnifiedNPCEngine(state?.npcRegistry);

  // 1. Chief Physio (Replaces hardcoded Dr. Sarah Jenkins)
  const physioNPC = engine.generatePlayer('TEAMMATE', nationality, 75, 42, 'Physio');
  const physio: ClubStaffMember = {
    id: `physio_${physioNPC.id}`,
    firstName: physioNPC.firstName,
    lastName: physioNPC.lastName,
    fullName: `Dr. ${physioNPC.firstName} ${physioNPC.lastName}`,
    title: `Dr. ${physioNPC.lastName}`,
    displayRole: 'Chief Physio',
    nationality: physioNPC.nationality,
    relationship: 60
  };

  // 2. Head of Fitness & Performance
  const fitnessNPC = engine.generatePlayer('TEAMMATE', nationality, 78, 38, 'Fitness');
  const fitnessCoach: ClubStaffMember = {
    id: `fitness_${fitnessNPC.id}`,
    firstName: fitnessNPC.firstName,
    lastName: fitnessNPC.lastName,
    fullName: `${fitnessNPC.firstName} ${fitnessNPC.lastName}`,
    title: `${fitnessNPC.firstName} ${fitnessNPC.lastName}`,
    displayRole: 'Head of Performance',
    nationality: fitnessNPC.nationality,
    relationship: 60
  };

  // 3. Assistant Manager
  const assistantNPC = engine.generatePlayer('TEAMMATE', nationality, 80, 48, 'Assistant');
  const assistantManager: ClubStaffMember = {
    id: `assistant_${assistantNPC.id}`,
    firstName: assistantNPC.firstName,
    lastName: assistantNPC.lastName,
    fullName: `${assistantNPC.firstName} ${assistantNPC.lastName}`,
    title: `${assistantNPC.firstName} ${assistantNPC.lastName}`,
    displayRole: 'Assistant Manager',
    nationality: assistantNPC.nationality,
    relationship: 65
  };

  // 4. Chief Scout
  const scoutNPC = engine.generatePlayer('TEAMMATE', nationality, 82, 52, 'Scout');
  const chiefScout: ClubStaffMember = {
    id: `scout_${scoutNPC.id}`,
    firstName: scoutNPC.firstName,
    lastName: scoutNPC.lastName,
    fullName: `${scoutNPC.firstName} ${scoutNPC.lastName}`,
    title: `${scoutNPC.firstName} ${scoutNPC.lastName}`,
    displayRole: 'Chief Scout',
    nationality: scoutNPC.nationality,
    relationship: 60
  };

  // 5. Generate 4 Named Journalists via generateJournalist() in npcEngine
  const journalists: JournalistNPC[] = [
    engine.generateJournalist(nationality),
    engine.generateJournalist(nationality),
    engine.generateJournalist(nationality),
    engine.generateJournalist(nationality)
  ];

  const roster: ClubStaffRoster = {
    physio,
    fitnessCoach,
    assistantManager,
    chiefScout,
    journalists
  };

  if (state) {
    if (!state.clubStaff) state.clubStaff = roster;
    if (state.player) {
      if (!state.player.stateFlags) state.player.stateFlags = {};
      state.player.stateFlags.clubStaff = roster;
    }
  }

  return roster;
}

/**
 * Returns a specific named journalist for press/rumor/media communications.
 */
export function getPrimaryJournalist(state: GameState, index: number = 0): JournalistNPC {
  const staff = getClubStaff(state);
  return staff.journalists[index % staff.journalists.length];
}

/**
 * Formats canonical sender headers to replace disjointed title duplicates.
 */
export function getCanonicalSender(
  state: GameState,
  category: 'PHYSIO' | 'FITNESS' | 'ASSISTANT' | 'SCOUT' | 'JOURNALIST' | 'BOARD',
  journalistIndex: number = 0
): string {
  const staff = getClubStaff(state);
  switch (category) {
    case 'PHYSIO':
      return `${staff.physio.fullName.toUpperCase()} (CHIEF PHYSIO)`;
    case 'FITNESS':
      return `${staff.fitnessCoach.fullName.toUpperCase()} (HEAD OF FITNESS)`;
    case 'ASSISTANT':
      return `${staff.assistantManager.fullName.toUpperCase()} (ASSISTANT MANAGER)`;
    case 'SCOUT':
      return `${staff.chiefScout.fullName.toUpperCase()} (CHIEF SCOUT)`;
    case 'JOURNALIST': {
      const journo = getPrimaryJournalist(state, journalistIndex);
      return `${journo.firstName.toUpperCase()} ${journo.lastName.toUpperCase()} (${journo.publication.toUpperCase()})`;
    }
    case 'BOARD':
      return 'CLUB BOARDROOM';
  }
}

/**
 * Queries decision memory and crafts a narrative reference to past player choices
 * for physio, journalist, scout, or assistant manager inbox messages.
 */
export function buildMemoryThreadText(state: GameState, context: 'PHYSIO' | 'JOURNALIST' | 'SCOUT' | 'ASSISTANT'): string {
  if (!state || !state.player) return '';

  const log: DecisionEntry[] = queryDecisionMemory(state, { onlyHot: true });
  if (log.length === 0) return '';

  if (context === 'PHYSIO') {
    const physioPast = log.find(d => 
      d.choiceText.toLowerCase().includes('rehab') || 
      d.choiceText.toLowerCase().includes('push') || 
      d.choiceText.toLowerCase().includes('cautious') ||
      d.system.toLowerCase().includes('medical') ||
      d.system.toLowerCase().includes('physical')
    );
    if (physioPast) {
      return `\n\n📌 Memory Note (${getClubStaff(state).physio.title}): "I remember your choice to '${physioPast.choiceText}' back in Week ${physioPast.week}. We are taking that history into account for your recovery load."`;
    }
  }

  if (context === 'JOURNALIST') {
    const pressPast = log.find(d => 
      d.system.toLowerCase().includes('press') || 
      d.system.toLowerCase().includes('media') || 
      d.choiceText.toLowerCase().includes('angry') ||
      d.choiceText.toLowerCase().includes('praise') ||
      d.choiceText.toLowerCase().includes('ignore')
    );
    if (pressPast) {
      const journo = getPrimaryJournalist(state);
      return `\n\n📌 Press Dossier (${journo.firstName} ${journo.lastName}): "Following your previous response ('${pressPast.choiceText}') in Week ${pressPast.week}, the media stance on your leadership has adjusted."`;
    }
  }

  if (context === 'SCOUT') {
    const scoutPast = log.find(d => 
      d.system.toLowerCase().includes('transfer') || 
      d.system.toLowerCase().includes('scout') || 
      d.system.toLowerCase().includes('contract')
    );
    if (scoutPast) {
      return `\n\n📌 Recruitment Note (${getClubStaff(state).chiefScout.fullName}): "Building on your choice to '${scoutPast.choiceText}' in Week ${scoutPast.week}, our scouting network has filtered upcoming targets accordingly."`;
    }
  }

  if (context === 'ASSISTANT') {
    const tacticalPast = log.find(d => 
      d.system.toLowerCase().includes('training') || 
      d.system.toLowerCase().includes('discipline') || 
      d.system.toLowerCase().includes('calendar')
    );
    if (tacticalPast) {
      return `\n\n📌 Staff Assessment (${getClubStaff(state).assistantManager.fullName}): "The coaching staff noted your decision to '${tacticalPast.choiceText}' in Week ${tacticalPast.week} when preparing today's session."`;
    }
  }

  return '';
}

/**
 * Resolves any raw or generic sender string into a named, persistent per-save identity.
 * Replaces hardcoded names like "Dr. Sarah Jenkins" or titles like "CHIEF PHYSIO"
 * with the player's save-specific staff roster and journalist pool.
 */
export function resolveSenderIdentity(state: any, rawSender: string, msgId?: string): string {
  if (!rawSender) return 'CLUB CORRESPONDENCE';
  const senderUpper = rawSender.toUpperCase();

  // If already formatted with parentheses containing a specific title or publication, check for legacy hardcoded names
  if (senderUpper.includes('SARAH JENKINS') || senderUpper.includes('CLEMENT')) {
    const staff = getClubStaff(state);
    if (senderUpper.includes('SARAH JENKINS')) {
      return `${staff.physio.fullName.toUpperCase()} (CHIEF PHYSIO)`;
    }
    if (senderUpper.includes('CLEMENT')) {
      return `${staff.assistantManager.fullName.toUpperCase()} (ASSISTANT MANAGER)`;
    }
  }

  // If already has named format like "DR. MARCUS VANCE (CHIEF PHYSIO)" or "ARTHUR PENN (DAILY TELEGRAPH)", keep it
  if (senderUpper.includes('(') && senderUpper.includes(')')) {
    return rawSender;
  }

  const staff = getClubStaff(state);

  if (senderUpper.includes('PHYSIO') || senderUpper.includes('MEDICAL') || senderUpper.includes('DOCTOR')) {
    return `${staff.physio.fullName.toUpperCase()} (CHIEF PHYSIO)`;
  }
  if (senderUpper.includes('FITNESS') || senderUpper.includes('PERFORMANCE') || senderUpper.includes('CONDITIONING')) {
    return `${staff.fitnessCoach.fullName.toUpperCase()} (HEAD OF FITNESS)`;
  }
  if (senderUpper.includes('ASSISTANT') || senderUpper.includes('DEPUTY MANAGER') || senderUpper.includes('COACH')) {
    return `${staff.assistantManager.fullName.toUpperCase()} (ASSISTANT MANAGER)`;
  }
  if (senderUpper.includes('SCOUT') || senderUpper.includes('RECRUITMENT')) {
    return `${staff.chiefScout.fullName.toUpperCase()} (CHIEF SCOUT)`;
  }
  if (senderUpper.includes('MEDIA') || senderUpper.includes('JOURNALIST') || senderUpper.includes('PRESS') || senderUpper.includes('REPORTER') || senderUpper.includes('NEWS') || senderUpper.includes('GAZETTE') || senderUpper.includes('TELEGRAPH') || senderUpper.includes('HERALD') || senderUpper.includes('TIMES')) {
    const charCode = msgId ? msgId.charCodeAt(msgId.length - 1) : 0;
    const journo = getPrimaryJournalist(state, charCode % 4);
    return `${journo.firstName.toUpperCase()} ${journo.lastName.toUpperCase()} (${journo.publication.toUpperCase()})`;
  }
  if (senderUpper.includes('AGENT')) {
    const agentName = state?.player?.agentName || `${staff.assistantManager.lastName} (AGENT)`;
    return `${agentName.toUpperCase()} (LICENSED AGENT)`;
  }
  if (senderUpper.includes('MANAGER') || senderUpper.includes('HEAD COACH') || senderUpper.includes('GAFFER')) {
    const mgrName = state?.player?.managerName || state?.currentManager?.name || 'Gaffer';
    return `GAFFER ${mgrName.toUpperCase()} (HEAD COACH)`;
  }

  return rawSender;
}

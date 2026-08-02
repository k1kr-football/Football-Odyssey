import { NPCRegistry, UnifiedNPCEngine } from "../utils/npcEngine";
import { assignManagerPhilosophy } from "../utils/managerPhilosophy";
import { CUTSCENES } from '../data/cutscenes';
import { decayReputationAndPerception, updateReputationAndPerception } from '../utils/reputation';
import { saveGameStateAsync, loadGameStateAsync, deleteGameStateAsync } from '../utils/storageEngine';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getRandomTrainingDramaEvent, TRAINING_DRAMA_EVENTS } from '../data/events/trainingDramas';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Player, DayOfWeek, RoutineSlot, InboxMessage, EventChoice, DailyEvent, CalendarEntry, AppSettings } from '../types';
import { CLUBS, RIVALRIES } from '../data/teams';
import { evaluateHierarchyTier, calculateOVR } from '../utils/player';
import { ALL_EVENTS } from '../data/events';
import { useEventManager } from '../hooks/useEventManager';
import { getClubSquad } from '../data/sheetSquads';
import { generateConsequenceScenario } from '../utils/dialogue';
import { generateTransferOffers, getClubTier, getGatingStatus } from '../utils/transfers';
import { generateSeasonCalendar } from '../utils/calendar';
import { checkAndTriggerPlayerCouncil, checkCaptaincyProgression } from '../utils/playerCouncil';
import { generateMonthlyScoutReport, checkAndTriggerDressingRoomRumble, progressRivals, checkAndLogTrophies, processFinancialEmpireWeekly } from '../utils/gameRefinements';
import { initializePlayerCareer, generateSaveNPCs, generateAllClubsRosters, calculateMatchSelection, calculateDetailedMatchSelection, generatePreseasonReportCard, applyPreseasonResults } from '../utils/careerSystems';
import { getClubStandings, checkMidSeasonObjective, evaluateEndofSeasonObjective, generateSeasonObjective, generateRandomNewManager } from '../utils/seasonObjectives';
import { generateIntlCallUp } from '../utils/international';
import { generateTestimonialProposal } from '../utils/testimonialMatch';
import { evaluateStadiumMilestones } from '../utils/stadiumMilestones';
import { createLegacyContinuation } from '../utils/legacySaveContinuation';
import { initializeWorldState, simulateWorldWeek, WorldState } from '../utils/worldSimulation';
import { initializeAllClubFinances, simulateClubFinancesWeekly } from '../utils/clubFinances';
import { addDecision } from '../utils/decisionMemory';
import { migrateSaveData } from '../utils/saveMigration';
import { tagInboxMessagePriority, isDecisionRequired } from '../utils/notifications';
import { checkFinancialTierUp } from '../utils/financialProgression';
import { processWeeklyPhysicalUpdate, getRecoveryDetails } from '../utils/recoveryTiers';
import { processWeeklyMentalFatigue, getMentalFatigueLevel, initializeActiveRehab, processWeeklyRehabStep, applyLifestyleMentalFatigueRecovery } from '../utils/wellbeingEngine';
import { checkAndTriggerDynamicEvent, DYNAMIC_EVENT_POOL } from '../utils/dynamicEvents';
import { getClubStaff, getCanonicalSender, getPrimaryJournalist, buildMemoryThreadText } from '../utils/clubStaff';
import {
  generateWeeklyTOTW,
  generateMonthlyPOTM,
  generateEndofSeasonAwards,
  applyTOTWRewards,
  applyPOTMRewards,
  applySeasonAwardsRewards,
  TeamOfTheWeek,
  PlayerOfTheMonth,
  SeasonAwardsSummary
} from '../utils/leagueAwards';

export type Screen = 'MAIN_MENU' | 'CREATION' | 'TRIAL_MATCH' | 'HUB' | 'PROFILE' | 'INBOX' | 'TRAINING' | 'TEAM' | 'SCHEDULE' | 'CAREER' | 'MATCH' | 'PRESS' | 'MEDIA_MINIGAME' | 'REHAB_MINIGAME' | 'LIFESTYLE' | 'SOCIAL' | 'TRANSFERS' | 'FINANCES' | 'GLOSSARY' | 'AGENT' | 'AWARDS_CEREMONY' | 'CLUB' | 'MESSAGES';

export interface GameState {
  screen: Screen;
  player: Player | null;
  season: number;
  currentWeek: number;
  currentDay: DayOfWeek;
  activeEvent: DailyEvent | null;
  inbox: InboxMessage[];
  seasonCalendar: CalendarEntry[];
  worldState?: WorldState;
  nextMatch?: {
    opponentSymbol: string;
    isHome?: boolean;
    isBigMatch: boolean;
    matchType: 'DERBY' | 'FINAL' | 'RELEGATION' | 'REGULAR' | 'FRIENDLY' | 'GRUDGE';
    pressure: number; // 1-10
    competitionType?: 'LEAGUE' | 'DOMESTIC_CUP' | 'EUROPEAN' | 'INTERNATIONAL' | 'FRIENDLY';
    rivalryName?: string;
    playerStatus?: 'STARTER' | 'SUBSTITUTE' | 'UNUSED';
    squadList?: {
      startingXI: string[];
      substitutes: string[];
      unused: string[];
    };
    kickoffTime?: string;
    venue?: string;
    scoutReportStudied?: boolean;
    selectedStrategy?: 'BALANCED' | 'EXPOSE_HIGH_LINE' | 'TARGET_FLANKS' | 'HIGH_PRESS';
    selectionReason?: string;
  };
  npcRegistry?: NPCRegistry;
  npcGeneration?: {
    agents: any[];
    journalists: any[];
    family: any[];
  };
  generatedClubs?: Record<string, any>;
  clubStaff?: any;
  difficulty?: 'CASUAL' | 'STANDARD' | 'REALISTIC';
  activeCutscene: string | null;
  unlockedCutscenes: any[];
  storyFlags: Record<string, any>;
  saveSlot?: number;
  totwHistory?: TeamOfTheWeek[];
  potmHistory?: PlayerOfTheMonth[];
  seasonAwardsHistory?: SeasonAwardsSummary[];
  pendingAwardsCeremony?: SeasonAwardsSummary | null;
}

interface GameContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetData: () => void;
  state: GameState;
  setScreen: (screen: Screen, force?: boolean) => void;
  setPlayer: (player: Player) => void;
  startCareer: (player: Player, difficulty: 'CASUAL' | 'STANDARD' | 'REALISTIC') => void;
  advanceDay: (force?: boolean) => void;
  resolveCutscene: (choiceIndex: number) => void;
  checkCutscenes: () => void;
  resolveEvent: (choiceType: string) => void;
  updateRelationship: (entity: keyof Player['relationships'], amount: number) => void;
  setInbox: (inbox: InboxMessage[]) => void;
  loadSavedGame: (slot: number) => Promise<boolean>;
  newGame: (slot: number) => void;
  saveAndQuit: () => Promise<void>;
  updateCalendar: (entries: CalendarEntry[]) => void;
  updateNextMatch: (fields: any) => void;
  advanceRehabPacing: (pacingChoice: 'PUSH_HARD' | 'RECOMMENDED' | 'CAUTIOUS') => void;
  reduceMentalFatigue: (amount: number, activityName: string) => void;
  startLegacyContinuation: (prospectId?: string) => void;
}

const initialState: GameState = {
  screen: 'MAIN_MENU',
  player: null,
  season: 1,
  currentWeek: 1,
  currentDay: 'MON',
  activeCutscene: null,
  unlockedCutscenes: [],
  storyFlags: {},
  activeEvent: null,
  inbox: [],
  seasonCalendar: [],
  nextMatch: undefined
};


const defaultSettings: AppSettings = {
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 100,
  fullscreen: false,
  animations: true,
  matchEngineSpeed: 'Normal',
  autoSave: true
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('rtg_settings');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return defaultSettings;
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('rtg_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetData = async () => {
    try {
      localStorage.clear();
      await deleteGameStateAsync('rtg_careersave_1');
      await deleteGameStateAsync('rtg_careersave_2');
      await deleteGameStateAsync('rtg_careersave_3');
    } catch (_) {}
    window.location.reload();
  };

  const [state, setState] = useState<GameState>(initialState);
  const { generateEvent } = useEventManager();

  const setScreen = (screen: Screen, force?: boolean) => setState(s => {
    if (!force && (s.screen === 'MATCH' || s.screen === 'TRIAL_MATCH') && screen !== s.screen && screen !== 'MATCH' && screen !== 'TRIAL_MATCH') {
      return s; // Lock-in: Cannot navigate away while match is running
    }
    return { ...s, screen };
  });
  
  const updateNextMatch = (fields: any) => setState(s => ({
    ...s,
    nextMatch: s.nextMatch ? { ...s.nextMatch, ...fields } : undefined
  }));
  
  const setPlayer = (player: Player) => setState(s => {
    let finalPlayer = { ...player };
    // Intercept trust gains under New Manager Bounce
    if (s.player && player.trust > s.player.trust) {
      if (player.newManagerBounce?.active) {
        const gain = player.trust - s.player.trust;
        const multipliedGain = Math.round(gain * 1.5);
        finalPlayer.trust = Math.min(100, s.player.trust + multipliedGain);
      }
    }
    return {
      ...s,
      player: finalPlayer
    };
  });

  const startCareer = (player: Player, difficulty: 'CASUAL' | 'STANDARD' | 'REALISTIC') => {
    const initializedPlayer = initializePlayerCareer(player, difficulty);
    const engine = new UnifiedNPCEngine();
    const npcs = generateSaveNPCs(engine);
    const rosters = generateAllClubsRosters(engine);
    const world = initializeWorldState(rosters);
    
    // Sync player managerInfo with unified WorldState manager
    if (initializedPlayer.currentClubSymbol && world.clubs[initializedPlayer.currentClubSymbol]?.manager?.name) {
      initializedPlayer.managerInfo = {
        ...initializedPlayer.managerInfo,
        name: world.clubs[initializedPlayer.currentClubSymbol].manager.name
      };
    }

    // Find host club calendar
    const hostClub = CLUBS.find(c => c.symbol.toUpperCase() === initializedPlayer.startingClubSymbol.toUpperCase()) || CLUBS[0];
    const seasonCalendar = generateSeasonCalendar(hostClub);

    setState(s => ({
      ...s,
      player: initializedPlayer,
      npcRegistry: engine.getRegistry(),
      npcGeneration: npcs,
      generatedClubs: rosters,
      seasonCalendar: seasonCalendar,
      worldState: world,
      screen: 'TRIAL_MATCH'
    }));
  };



  const checkCutscenes = () => {
    setState(s => {
      if (s.activeCutscene || !s.player) return s;
      for (const c of CUTSCENES) {
        if (c.checkTrigger(s)) {
          return { ...s, activeCutscene: c.id };
        }
      }
      return s;
    });
  };

  const resolveCutscene = (choiceIndex: number) => {
    setState(s => {
      if (!s.activeCutscene) return s;
      const cutscene = CUTSCENES.find(c => c.id === s.activeCutscene);
      if (!cutscene) return { ...s, activeCutscene: null };

      let updatedPlayer = { ...s.player! };
      const newFlags = { ...s.storyFlags };

      const updatePlayer = (updates: any) => {
        updatedPlayer = { ...updatedPlayer, ...updates };
      };

      const setFlag = (key: string, val: any) => {
        newFlags[key] = val;
      };

      if (cutscene.getChoices && choiceIndex >= 0) {
        const choices = cutscene.getChoices(s);
        if (choices[choiceIndex]) {
          choices[choiceIndex].onSelect(updatePlayer, setFlag);
        }
      }

      // Populate personal journey tracker & career timeline
      if (updatedPlayer.storyArc && (cutscene.category === 'ORIGIN' || cutscene.category === 'ARC')) {
        const arc = { ...updatedPlayer.storyArc };
        const nextBeatIdx = arc.beats.findIndex(b => !b.triggered);
        if (nextBeatIdx !== -1) {
          arc.beats[nextBeatIdx].triggered = true;
          arc.currentAct = arc.beats[nextBeatIdx].act;
          arc.currentBeat = arc.beats[nextBeatIdx].beat;
          arc.progress = Math.round(((nextBeatIdx + 1) / arc.beats.length) * 100);
          
          updatedPlayer.storyArc = arc;
          
          // Append to Timeline
          const chosenText = (cutscene.getChoices && choiceIndex >= 0) ? cutscene.getChoices(s)[choiceIndex]?.text : '';
          updatedPlayer.timeline = [
            {
              id: `story_beat_${cutscene.id}_${Date.now()}`,
              week: s.currentWeek,
              day: s.currentDay,
              type: 'MILESTONE',
              title: `🎬 Story Chapter: ${cutscene.title}`,
              description: `Resolved story milestone: "${arc.beats[nextBeatIdx].name}". Selected: "${chosenText || 'Acknowledged'}"`,
              clubSymbol: updatedPlayer.currentClubSymbol
            },
            ...(updatedPlayer.timeline || [])
          ];
        }
      } else if (cutscene.category === 'MILESTONE') {
        // Milestone cutscenes append to timeline too!
        const chosenText = (cutscene.getChoices && choiceIndex >= 0) ? cutscene.getChoices(s)[choiceIndex]?.text : '';
        updatedPlayer.timeline = [
          {
            id: `milestone_cutscene_${cutscene.id}_${Date.now()}`,
            week: s.currentWeek,
            day: s.currentDay,
            type: 'MILESTONE',
            title: `🏆 Milestone: ${cutscene.title}`,
            description: `Triggered career milestone. Choice selected: "${chosenText || 'Acknowledged'}"`,
            clubSymbol: updatedPlayer.currentClubSymbol
          },
          ...(updatedPlayer.timeline || [])
        ];
      }

      let savedLines: any[] = [];
      try {
        savedLines = cutscene.getLines(s);
      } catch(e) {}

      // Log Cutscene choice in Player Decision Memory Log
      const choices = cutscene.getChoices ? cutscene.getChoices(s) : [];
      const choice = choices[choiceIndex];
      const chosenText = choice ? choice.text : 'Acknowledged';
      const significance = cutscene.category === 'ORIGIN' || cutscene.category === 'MILESTONE' ? 'MAJOR' : 'MODERATE';
      
      let npcsInvolved: string[] = [];
      let entitiesInvolved: string[] = [updatedPlayer.currentClubSymbol];
      
      if (cutscene.id.includes('agent')) npcsInvolved.push('Agent');
      if (cutscene.id.includes('manager')) npcsInvolved.push('Manager');
      if (cutscene.id.includes('journalist')) npcsInvolved.push('Journalist X');
      if (cutscene.id.includes('rival')) npcsInvolved.push('Alex Sterling');
      
      const descriptionText = `Resolved story milestone "${cutscene.title}" by choosing: "${chosenText}".`;

      let nextState = {
        ...s,
        player: updatedPlayer,
        storyFlags: newFlags,
        unlockedCutscenes: [...s.unlockedCutscenes, {
            id: cutscene.id,
            title: cutscene.title,
            date: `Week ${s.currentWeek}, ${s.season}`,
            lines: savedLines,
            choiceText: chosenText
        }],
        activeCutscene: null
      };

      nextState = addDecision(
        nextState,
        chosenText,
        'Cutscene',
        significance,
        npcsInvolved,
        entitiesInvolved,
        descriptionText,
        ''
      );

      return nextState;

    });
  };

  const resolveEvent = (choiceType: string) => {
    setState(s => {
      if (!s.player) return s;
      
      if (choiceType.startsWith('ENGINE_CHOICE_TRAINING_DRAMA_')) {
        const match = choiceType.match(/^ENGINE_CHOICE_TRAINING_DRAMA_(.+)_(\d+)$/);
        if (match) {
          const dramaId = match[1];
          const choiceIndex = parseInt(match[2], 10);
          const dramaDef = TRAINING_DRAMA_EVENTS.find(e => e.id === dramaId);
          if (dramaDef && dramaDef.choices[choiceIndex]) {
            const stateChanges = dramaDef.choices[choiceIndex].effect(s);
            return { ...s, activeEvent: null, ...stateChanges };
          }
        }
      }

      if (choiceType.startsWith('ENGINE_CHOICE_')) {
        const match = choiceType.match(/^ENGINE_CHOICE_(.+)_(.+)$/);
        if (match && match[1] !== 'CLUB' && match[1] !== 'CLUB_TRAINING') { // Handle dynamic events
           const eventId = match[1];
           const choiceIndex = parseInt(match[2]);
           const eventDef = ALL_EVENTS.find(e => e.id === eventId);
           if (eventDef) {
               const choiceDef = eventDef.choices[choiceIndex];
               if (typeof choiceDef.effect === 'function') {
                  const newStateChanges = choiceDef.effect(s);
                  return { ...s, activeEvent: null, ...newStateChanges };
               } else if (typeof choiceDef.effect === 'object') {
                  // apply numeric mods
                  const p = { ...s.player };
                  for (let key in choiceDef.effect) {
                     if (key in p) (p as any)[key] += choiceDef.effect[key];
                  }
                  return { ...s, activeEvent: null, player: p };
               }
           }
        }

        if (choiceType === 'ENGINE_CHOICE_CLUB_TRAINING_ATTEND_FULL') {
           // Roll for Training Ground Drama incident (65% chance when attending training)
           if (Math.random() < 0.65) {
             const dramaEvent = getRandomTrainingDramaEvent(s);
             if (dramaEvent) {
               return { ...s, activeEvent: dramaEvent };
             }
           }

           const p = { ...s.player };
           p.fatigue = Math.min(100, p.fatigue + 10);
           p.trust = Math.min(100, p.trust + 5);
           p.relationships = {
              ...p.relationships,
              manager: Math.min(100, p.relationships.manager + 3)
           };
           
            // Randomly upgrade one player attribute!
            const attributes: (keyof typeof p.attributes)[] = ["finishing", "passing", "dribbling", "tackling", "pace", "strength"];
            const randomAttr = attributes[Math.floor(Math.random() * attributes.length)];
            const currentVal = Number(p.attributes[randomAttr]) || 50;
            let ageMulti = 1.0;
            if (p.age < 21) ageMulti = 1.5;
            else if (p.age < 28) ageMulti = 1.0;
            else if (p.age < 32) ageMulti = 0.4;
            else {
              let lifestyleBoost = 0;
              if (p.lifestyleTier?.training === "Elite") lifestyleBoost += 0.05;
              if (p.lifestyleTier?.housing === "Mansion") lifestyleBoost += 0.05;
              if (p.lifestyleTier?.nutrition === "Private Chef") lifestyleBoost += 0.05;
              ageMulti = 0.1 + lifestyleBoost;
            }
            const ceiling = p.ceiling || 80;
            let taperMulti = 1.0;
            if (currentVal >= ceiling) taperMulti = 0.0;
            else if (currentVal >= ceiling - 5) taperMulti = (ceiling - currentVal) / 5.0;
            const finalGain = parseFloat((1.0 * ageMulti * taperMulti).toFixed(2));
            if (finalGain > 0) {
              p.attributes = {
                 ...p.attributes,
                 [randomAttr]: parseFloat(Math.min(99, currentVal + finalGain).toFixed(2))
              };
            }
           
           const coachComments: Record<string, string[]> = {
             'ST': [
               "Your movement off the ball in the final third was top class today. Excellent finishing!",
               "Brilliant composure in 1v1 drills. You are ready for Saturday.",
               "Coaches loved your clinical instincts in the shooting segment."
             ],
             'LW': [
               "Electric pace on the overlap. Your crossing was finding every head.",
               "Superb 1v1 dribbling today. You left the full-backs in the dust.",
               "Excellent work rate tracking back on defense during transition drills."
             ],
             'RW': [
               "Electric pace on the overlap. Your crossing was finding every head.",
               "Superb 1v1 dribbling today. You left the full-backs in the dust.",
               "Excellent work rate tracking back on defense during transition drills."
             ],
             'CM': [
               "Unbelievable tempo control in the rondo. Your vision is exactly what we need.",
               "Your transitional passing today was sublime. Kept the play ticking perfectly.",
               "Fantastic pressing intensity. You won three clean interceptions in midfield."
             ],
             'CAM': [
               "Unbelievable tempo control in the rondo. Your vision is exactly what we need.",
               "Your transitional passing today was sublime. Kept the play ticking perfectly.",
               "Fantastic pressing intensity. You won three clean interceptions in midfield."
             ],
             'CDM': [
               "Fantastic pressing intensity. You won three clean interceptions in midfield.",
               "Exceptional structural discipline today. You shielded the backline perfectly.",
               "Your tackling was clean and aggressive. Excellent recovery play."
             ],
             'CB': [
               "Unbelievable defensive anticipation today. Nothing got past you.",
               "Superb low-block organization. Your communication with the keeper was outstanding.",
               "Aggressive and dominant in the air during set-piece simulations."
             ],
             'LB': [
               "Electric pace on the overlap. Your crossing was finding every head.",
               "Excellent positional discipline keeping their wingers quiet.",
               "Great recovery pace and defensive tracking."
             ],
             'RB': [
               "Electric pace on the overlap. Your crossing was finding every head.",
               "Excellent positional discipline keeping their wingers quiet.",
               "Great recovery pace and defensive tracking."
             ],
             'GK': [
               "Sensational reflex saves today. You are making it extremely hard for the strikers.",
               "Brilliant distribution. Your long throws sparked two rapid counter-attacks.",
               "Commanded your area with massive presence during cross-defense drills."
             ]
           };

           const posGroup = p.position || 'ST';
           const comments = coachComments[posGroup] || [
             "Superb application in today's training drills.",
             "Fantastic energy and intensity during the tactical session.",
             "Coaching team was thoroughly impressed with your tactical discipline today."
           ];
           const comment = comments[Math.floor(Math.random() * comments.length)];

           const newInbox = [...s.inbox];
           newInbox.push({
             id: `club_training_attended_${Date.now()}`,
             sender: 'COACHING STAFF',
             subject: 'Training Report & Feedback 📈',
             content: `Solid work in today's organized club training session! The manager and coaches watched the session closely. Feedback from the tactical board: "${comment}" Your ${String(randomAttr).toUpperCase()} increased by +1 as a result of your dedication!`,
             read: false,
             type: 'DM',
             timestamp: `${s.currentDay} 16:00`,
             choices: [{ text: 'Understood, keep working.', type: 'ack' }]
           });

           return { ...s, activeEvent: null, player: p, inbox: newInbox };
        }

        if (choiceType === 'ENGINE_CHOICE_CLUB_TRAINING_SKIP') {
           const p = { ...s.player };
           p.trust = Math.max(0, p.trust - 15);
           p.relationships = {
              ...p.relationships,
              manager: Math.max(0, p.relationships.manager - 10),
              teammates: Math.max(0, p.relationships.teammates - 5)
           };
           p.morale = Math.max(0, p.morale - 5);
           
           // Mark that they skipped training this week for down-the-line squad list punishment!
           p.stateFlags = {
             ...p.stateFlags,
             skippedTrainingThisWeek: true
           };

           const newInbox = [...s.inbox];
           newInbox.push({
             id: `club_training_skipped_${Date.now()}`,
             sender: 'COACHING STAFF (URGENT)',
             subject: 'Unexcused Absence from Club Training 😡',
             content: `You failed to attend today's scheduled club organized training session without any medical excuse or permission. The coaching team is extremely disappointed. The Manager is furious and has noted this lack of professional discipline. Do not expect to walk straight into the team on Saturday.`,
             read: false,
             type: 'DM',
             timestamp: `${s.currentDay} 14:00`,
             choices: [{ text: 'Apologize and accept the fine.', type: 'ack' }]
           });

           return { ...s, activeEvent: null, player: p, inbox: newInbox };
        }

        const parts = choiceType.split('_');
        const choiceIndex = parseInt(parts.pop() || '0', 10);
        const eventId = parts.slice(2).join('_'); // Reconstruct id
        
        const eventDef = ALL_EVENTS.find(e => e.id === eventId);
        if (eventDef) {
          const choiceDef = eventDef.choices[choiceIndex];
          if (choiceDef && choiceDef.effect) {
             let stateDiff: Partial<GameState> = {};
             if (typeof choiceDef.effect === 'function') {
               stateDiff = choiceDef.effect(s);
             } else if (typeof choiceDef.effect === 'object') {
               const p = { ...s.player! };
               const eff = choiceDef.effect as any;
               
               if (eff.trust !== undefined) {
                 p.trust = Math.max(0, Math.min(100, p.trust + eff.trust));
                 p.relationships = {
                   ...p.relationships,
                   manager: Math.max(0, Math.min(100, (p.relationships?.manager || 50) + eff.trust))
                 };
               }
               if (eff.morale !== undefined) {
                 p.morale = Math.max(0, Math.min(100, p.morale + eff.morale));
               }
               if (eff.fans !== undefined) {
                 p.fans = Math.max(0, p.fans + eff.fans);
               }
               if (eff.fatigue !== undefined) {
                 p.fatigue = Math.max(0, Math.min(100, p.fatigue + eff.fatigue));
               }
               if (eff.reputation !== undefined) {
                 p.reputation = {
                   ...p.reputation,
                   world: Math.max(0, Math.min(100, p.reputation.world + eff.reputation)),
                   club: Math.max(0, Math.min(100, p.reputation.club + eff.reputation))
                 };
               }
               if (eff.teammates !== undefined) {
                 p.relationships = {
                   ...p.relationships,
                   teammates: Math.max(0, Math.min(100, p.relationships.teammates + eff.teammates))
                 };
               }
               if (eff.wage !== undefined) {
                 p.finances = {
                   ...p.finances,
                   balance: p.finances.balance + eff.wage
                 };
               }
               stateDiff = { player: p };
             }
             return { ...s, activeEvent: null, ...stateDiff, player: stateDiff.player || s.player };
          }
        }
        return { ...s, activeEvent: null };
      }

      const p = { ...s.player };
      const oldMorale = p.morale;
      
      if (choiceType.startsWith('RUMBLE_CHOICE_')) {
        const parts = choiceType.split('_');
        const rIdx = parseInt(parts[2], 10);
        const cIdx = parseInt(parts[3], 10);
        
        if (rIdx === 0) { // The Clash
          if (cIdx === 0) { // Back Marcus
             p.relationships.teammates = Math.max(0, p.relationships.teammates - 5);
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 10);
             p.relationships.manager = Math.min(100, p.relationships.manager + 5);
             p.personality = 'Ambitious';
          } else if (cIdx === 1) { // Defend Mason
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 10);
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 5);
             p.relationships.manager = Math.max(0, p.relationships.manager - 5);
             p.personality = 'Loyal';
          } else if (cIdx === 2) { // Mediate
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 5);
             p.squadDynamics.cohesion = Math.min(100, p.squadDynamics.cohesion + 15);
          } else { // Ignore
             p.relationships.teammates = Math.max(0, p.relationships.teammates - 5);
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 15);
          }
        } else if (rIdx === 1) { // The Leak
          if (cIdx === 1) { // Accuse Reserves
             p.relationships.teammates = Math.max(0, p.relationships.teammates - 10);
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 15);
             p.relationships.manager = Math.max(0, p.relationships.manager - 5);
          } else if (cIdx === 2) { // Own Up
             p.relationships.manager = Math.min(100, p.relationships.manager + 15);
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 10);
             p.squadDynamics.cohesion = Math.min(100, p.squadDynamics.cohesion + 10);
             p.mediaPerception = Math.max(0, p.mediaPerception - 5);
          } else if (cIdx === 3) { // Demand Search
             p.relationships.teammates = Math.max(0, p.relationships.teammates - 5);
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 5);
             p.relationships.manager = Math.min(100, p.relationships.manager + 5);
          }
        } else if (rIdx === 2) { // The Argument
          if (cIdx === 0) { // Support Manager
             p.relationships.manager = Math.min(100, p.relationships.manager + 12);
             p.relationships.teammates = Math.max(0, p.relationships.teammates - 8);
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 10);
          } else if (cIdx === 1) { // Side with Rebels
             p.relationships.manager = Math.max(0, p.relationships.manager - 15);
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 12);
             p.squadDynamics.cohesion = Math.min(100, p.squadDynamics.cohesion + 5);
          } else if (cIdx === 2) { // Tactical Compromise
             p.relationships.manager = Math.min(100, p.relationships.manager + 5);
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 5);
             p.squadDynamics.cohesion = Math.min(100, p.squadDynamics.cohesion + 10);
          }
        } else if (rIdx === 3) { // The Scapegoat
          if (cIdx === 0) { // Defend Tomas
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 5);
             p.squadDynamics.cohesion = Math.min(100, p.squadDynamics.cohesion + 15);
          } else if (cIdx === 1) { // Join Criticism
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 5);
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 10);
          } else if (cIdx === 2) { // Say Nothing
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 5);
          } else { // Change Subject
             p.squadDynamics.cohesion = Math.min(100, p.squadDynamics.cohesion + 2);
          }
        } else if (rIdx === 4) { // The Party
          if (cIdx === 0) { // Go Party
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 15);
             p.morale = Math.min(100, p.morale + 10);
             p.fatigue = Math.min(100, p.fatigue + 15);
             p.relationships.manager = Math.max(0, p.relationships.manager - 12);
          } else if (cIdx === 1) { // Stay Home
             p.fatigue = Math.max(0, p.fatigue - 10);
             p.relationships.teammates = Math.max(0, p.relationships.teammates - 5);
             p.relationships.manager = Math.min(100, p.relationships.manager + 5);
          } else if (cIdx === 2) { // Go briefly
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 5);
             p.fatigue = Math.min(100, p.fatigue + 5);
          } else { // Snitch
             p.relationships.manager = Math.min(100, p.relationships.manager + 20);
             p.relationships.teammates = Math.max(0, p.relationships.teammates - 25);
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 20);
          }
        } else if (rIdx === 5) { // The Transfer
          if (cIdx === 0) { // Encourage
             p.relationships.teammates = Math.min(100, p.relationships.teammates + 10);
          } else if (cIdx === 1) { // Convince
             p.squadDynamics.cohesion = Math.min(100, p.squadDynamics.cohesion + 5);
          } else if (cIdx === 2) { // Report
             p.relationships.manager = Math.min(100, p.relationships.manager + 15);
             p.relationships.teammates = Math.max(0, p.relationships.teammates - 20);
             p.squadDynamics.cohesion = Math.max(0, p.squadDynamics.cohesion - 10);
          }
        }
      }

      // Process Dynamic Calendar Events choices
      if (choiceType.startsWith('DYNEVT_')) {
         const matches = choiceType.match(/^DYNEVT_(.+)_(.+)$/);
         if (matches) {
            const eventId = matches[1];
            const choiceIndex = parseInt(matches[2], 10);
            const eventDef = DYNAMIC_EVENT_POOL.find(e => e.id === eventId);
            if (eventDef) {
               const choiceDef = eventDef.choices[choiceIndex];
               if (choiceDef) {
                  const impact = choiceDef.impact;
                  if (impact.fatigue) p.fatigue = Math.max(0, Math.min(100, p.fatigue + impact.fatigue));
                  if (impact.morale) p.morale = Math.max(0, Math.min(100, p.morale + impact.morale));
                  if (impact.trust) p.trust = Math.max(0, Math.min(100, p.trust + impact.trust));
                  if (impact.fans) p.fans = Math.max(0, Math.min(100, p.fans + impact.fans));
                  if (impact.mediaPerception) p.mediaPerception = Math.max(0, Math.min(100, p.mediaPerception + impact.mediaPerception));
                  if (impact.cash && p.finances) p.finances.balance = (p.finances.balance || 0) + impact.cash;
                  
                  if (impact.relationships) {
                     if (impact.relationships.manager) p.relationships.manager = Math.max(0, Math.min(100, p.relationships.manager + impact.relationships.manager));
                     if (impact.relationships.teammates) p.relationships.teammates = Math.max(0, Math.min(100, p.relationships.teammates + impact.relationships.teammates));
                     if (impact.relationships.agent) p.relationships.agent = Math.max(0, Math.min(100, (p.relationships.agent || 50) + impact.relationships.agent));
                     if (impact.relationships.family) p.relationships.family = Math.max(0, Math.min(100, p.relationships.family + impact.relationships.family));
                  }

                  if (impact.attributes) {
                     for (let attrKey in impact.attributes) {
                        if (typeof p.attributes[attrKey] === 'number') {
                           p.attributes[attrKey] = Math.max(1, Math.min(99, p.attributes[attrKey] + (impact.attributes as any)[attrKey]));
                        }
                     }
                  }

                  if (impact.timelineEntry) {
                     p.timeline = [
                        {
                           id: `timeline_dynevt_${Date.now()}`,
                           week: s.currentWeek,
                           day: s.currentDay,
                           ...impact.timelineEntry
                        },
                        ...(p.timeline || [])
                     ];
                  }

                  // Log to Player Decision Memory!
                  p.decisionMemory = [
                     {
                        id: `memory_dynevt_${Date.now()}`,
                        week: s.currentWeek,
                        choiceType: choiceType,
                        choiceText: choiceDef.text,
                        description: `Decision: "${choiceDef.text}" for event: "${eventDef.title}". Consequence: ${choiceDef.consequencesText}`,
                        timestamp: Date.now()
                     },
                     ...(p.decisionMemory || [])
                  ];
               }
            }
         }
      }

      switch (choiceType) {
        case 'manager_greet_safe':
          p.relationships.manager = Math.min(100, p.relationships.manager + 10);
          p.relationships.teammates = Math.min(100, p.relationships.teammates + 10);
          p.morale = Math.min(100, p.morale + 10);
          break;
        case 'manager_greet_arrogant':
          p.relationships.manager = Math.max(0, p.relationships.manager - 15);
          p.fans = Math.min(100, p.fans + 15);
          p.mediaPerception = Math.min(100, p.mediaPerception + 5);
          break;
        case 'manager_greet_doubt':
          p.relationships.manager = Math.max(0, p.relationships.manager - 5);
          if (p.attributes && typeof p.attributes.tacticalAwareness === 'number') {
            p.attributes.tacticalAwareness = Math.min(99, p.attributes.tacticalAwareness + 2);
          }
          p.morale = Math.max(0, p.morale - 5);
          break;
        case 'PRESS_SAFE':
          p.mediaPerception = Math.min(100, p.mediaPerception + 5);
          p.relationships.manager = Math.min(100, p.relationships.manager + 2);
          break;
        case 'PRESS_CONTROVERSIAL':
          p.mediaPerception = Math.max(0, p.mediaPerception - 10);
          p.fans = Math.min(100, p.fans + 5);
          p.relationships.manager = Math.max(0, p.relationships.manager - 10);
          p.morale = Math.max(0, p.morale - 10); // adding morale drop
          break;
        case 'TEAMMATE_ACCEPT':
          p.relationships.teammates = Math.min(100, p.relationships.teammates + 10);
          p.fatigue = Math.min(100, p.fatigue + 15);
          p.morale = Math.min(100, p.morale + 5);
          break;
        case 'TEAMMATE_DECLINE':
          p.fatigue = Math.max(0, p.fatigue - 5);
          break;
        case 'MANAGER_AGREE':
          p.relationships.manager = Math.min(100, p.relationships.manager + 5);
          p.morale = Math.max(0, p.morale - 2);
          break;
        case 'MANAGER_ARGUE':
          p.relationships.manager = Math.max(0, p.relationships.manager - 15);
          p.morale = Math.min(100, p.morale + 5);
          break;
        case 'AGENT_LOYAL':
          p.relationships.manager = Math.min(100, p.relationships.manager + 5);
          p.relationships.agent = Math.max(0, (p.relationships.agent || 50) - 5);
          break;
        case 'AGENT_LOOKING':
          p.relationships.agent = Math.min(100, (p.relationships.agent || 50) + 5);
          break;
        case 'SPONSOR_ATTEND':
          p.finances.balance += 2000;
          p.reputation.world = Math.min(100, p.reputation.world + 1);
          p.fatigue = Math.min(100, p.fatigue + 10);
          break;
        case 'SPONSOR_SKIP':
          p.finances.balance -= 5000;
          p.relationships.agent = Math.max(0, (p.relationships.agent || 50) - 10);
          break;
        case 'PHYSIO_REST':
          p.fatigue = Math.max(0, p.fatigue - 20);
          break;
        case 'PHYSIO_IGNORE':
          p.fatigue = Math.min(100, p.fatigue + 10);
          if (Math.random() > 0.5) p.isInjured = true;
          break;
        case 'FANS_ENGAGE':
          p.fans = Math.min(100, p.fans + 10);
          p.fatigue = Math.min(100, p.fatigue + 5);
          p.morale = Math.min(100, p.morale + 5);
          break;
        case 'FANS_QUICK':
          p.fans = Math.min(100, p.fans + 2);
          break;
        case 'TRAINING_JOIN':
          p.relationships.manager = Math.min(100, p.relationships.manager + 5);
          if (typeof p.attributes.decisionMaking === 'number') {
            p.attributes.decisionMaking = Math.min(99, p.attributes.decisionMaking + 1);
          }
          p.fatigue = Math.min(100, p.fatigue + 10);
          break;
        case 'mentor_accept':
          p.mentoring = {
            isMentor: false,
            partnerName: choiceType.startsWith('mentor_accept_') ? choiceType.replace('mentor_accept_', '') : 'Senior Player',
            weeksRemaining: 12,
            focusAttribute: 'composure' // default fallback, ideally passed in dynamically if possible, but let's hardcode for simplicity of event resolution if we don't use payload
          };
          break;
        case 'mentor_reject':
          p.relationships.manager = Math.max(0, p.relationships.manager - 5);
          break;
        case 'rumor_react_angry':
          p.mediaPerception = Math.max(0, p.mediaPerception - 5);
          p.fans = Math.min(100, p.fans + 2);
          break;
        case 'rumor_react_ignore':
          break;
        case 'IGNORE':
        default:
          break;
      }
      
      if (p.morale < oldMorale && p.fans >= 80) {
         const diff = oldMorale - p.morale;
         p.morale = oldMorale - Math.floor(diff * 0.5);
      }
      
      // Record standard choice in Decision Memory Log
      let significance: 'MINOR' | 'MODERATE' | 'MAJOR' | 'DEFINING' = 'MINOR';
      let system = 'Calendar Event';
      let npcsInvolved: string[] = [];
      let entitiesInvolved: string[] = [p.currentClubSymbol];
      let description = '';

      if (choiceType === 'PRESS_SAFE') {
        significance = 'MINOR';
        description = 'Gave a cautious, media-trained answer to the journalists.';
        npcsInvolved = ['Journalists'];
      } else if (choiceType === 'PRESS_CONTROVERSIAL') {
        significance = 'MODERATE';
        description = 'Aired out strong, controversial opinions in front of the press.';
        npcsInvolved = ['Journalists'];
      } else if (choiceType === 'TEAMMATE_SUPPORT') {
        significance = 'MINOR';
        description = 'Chose to support teammate Alex Sterling in their current dispute.';
        npcsInvolved = ['Alex Sterling'];
      } else if (choiceType === 'MANAGER_ARGUE') {
        significance = 'MODERATE';
        description = 'Argued fiercely with the manager regarding tactical directives.';
        npcsInvolved = ['Manager'];
      } else if (choiceType === 'SPONSOR_SKIP') {
        significance = 'MINOR';
        description = 'Skipped a contractual sponsor photoshoot to focus on personal rest.';
        entitiesInvolved.push('Sponsor');
      } else if (choiceType === 'rumor_react_angry') {
        significance = 'MODERATE';
        description = 'Slammed recent press speculation in an angry public response.';
        npcsInvolved = ['Press'];
      } else if (choiceType.startsWith('RUMBLE_CHOICE_')) {
        significance = 'MODERATE';
        system = 'Player Council';
        description = `Made a tactical intervention in the dressing room conflict (Action: ${choiceType}).`;
        npcsInvolved = ['Teammates'];
      } else if (choiceType === 'transfer_accept' || choiceType === 'transfer_reject') {
        significance = 'MAJOR';
        system = 'Transfer Request';
        description = choiceType === 'transfer_accept' ? `Formally accepted a high-profile transfer.` : `Rejected transfer approach to remain at the club.`;
      } else if (choiceType === 'mentor_accept') {
        significance = 'MODERATE';
        system = 'Player Council';
        description = 'Accepted professional mentorship with a veteran squad member.';
        npcsInvolved = ['Senior Player'];
      } else if (choiceType === 'mentor_reject') {
        significance = 'MINOR';
        system = 'Player Council';
        description = 'Declined mentorship program to focus on independent development.';
        npcsInvolved = ['Senior Player'];
      }

      let nextState = { ...s, player: p, activeEvent: null };
      if (description) {
        nextState = addDecision(
          nextState,
          choiceType,
          system,
          significance,
          npcsInvolved,
          entitiesInvolved,
          description,
          ''
        );
      }
      return nextState;
    });
  };

  const advanceDay = (force: boolean = false) => {
    // Basic day advancement logic
    const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    setState(s => {
      // Don't advance if there is an active event waiting to be resolved
      if (s.activeEvent) return s;
      
      const hasPendingDecision = s.inbox.some(msg => isDecisionRequired(msg));
      if (hasPendingDecision && !force) return s;

      const idx = days.indexOf(s.currentDay);
      
      let nextDay = s.currentDay;
      let nextWeek = s.currentWeek;

      if (idx < days.length - 1) {
        nextDay = days[idx + 1];
      } else {
        nextDay = 'MON';
        nextWeek = s.currentWeek >= 52 ? 1 : s.currentWeek + 1;
      }

      // Check if we are in the transfer window (Weeks 1-4 = July pre-season/transfer, Weeks 26-29 = Jan Winter Transfer)
      const isTransferWindow = nextWeek <= 9 || (nextWeek >= 27 && nextWeek <= 30);
      
      const todaysCalendarEntry = s.seasonCalendar?.find(e => e.week === nextWeek && e.day === nextDay);
      const isMatchDay = todaysCalendarEntry?.type === 'MATCH';

      // Declare tomorrow calculation early so it's available for both orchestrator and squad listing
      const nextDayIdxForTomorrow = days.indexOf(nextDay);
      let dayAfterNext = nextDay;
      let weekAfterNext = nextWeek;
      if (nextDayIdxForTomorrow < days.length - 1) {
         dayAfterNext = days[nextDayIdxForTomorrow + 1];
      } else {
         dayAfterNext = 'MON';
         weekAfterNext = nextWeek >= 52 ? 1 : nextWeek + 1;
      }
      
      const tomorrowCalendarEntry = s.seasonCalendar?.find(e => e.week === weekAfterNext && e.day === dayAfterNext);
      const isTomorrowMatchDay = tomorrowCalendarEntry?.type === 'MATCH';
      
      let nextMatch = s.nextMatch;
      if (isMatchDay && todaysCalendarEntry.match) {
         let matchType: 'DERBY' | 'FINAL' | 'RELEGATION' | 'REGULAR' | 'FRIENDLY' | 'GRUDGE' = 'REGULAR';
         let pressure = 5;
         
         const cm = todaysCalendarEntry.match;
         if (cm.round === 'Final') {
             matchType = 'FINAL';
             pressure = 10;
         } else if (cm.round === 'Semi-Final' || (cm.competitionType === 'EUROPEAN' && cm.round?.includes('Quarter'))) {
             matchType = 'REGULAR';
             pressure = 8;
         } else if (cm.competitionType === 'DOMESTIC_CUP' || cm.competitionType === 'EUROPEAN') {
             pressure = 7;
         }
         
         if (s.seasonCalendar.length === 0 || nextWeek <= 4) { // Pre-season fallback
             matchType = 'FRIENDLY';
             pressure = 1;
         }

         let rivalryName: string | undefined = undefined;
         const currentClub = s.player?.currentClubSymbol;
         
         if (currentClub) {
            // RIVALRIES imported globally
            const clubRivals = RIVALRIES[currentClub];
            
            if (clubRivals) {
               const rival = clubRivals.find((r: any) => r.opponent === cm.opponentSymbol);
               if (rival) {
                  matchType = 'DERBY';
                  pressure = Math.max(pressure, 9);
                  rivalryName = rival.name;
               }
            }
            
            // Check for Grudge Match (if player has a history with the club)
            const previousClubs = s.player?.timeline?.filter(t => t.type === 'TRANSFER').map(t => t.clubSymbol) || [];
            if (matchType !== 'DERBY' && previousClubs.includes(cm.opponentSymbol)) {
               matchType = 'GRUDGE';
               pressure = Math.max(pressure, 8);
               rivalryName = "Grudge Match";
            }
         }

         let finalStatus = s.nextMatch?.opponentSymbol === cm.opponentSymbol ? s.nextMatch?.playerStatus : undefined;
         let finalSquadList = s.nextMatch?.opponentSymbol === cm.opponentSymbol ? s.nextMatch?.squadList : undefined;
         let finalKickoffTime = s.nextMatch?.opponentSymbol === cm.opponentSymbol ? s.nextMatch?.kickoffTime : undefined;
         let finalVenue = s.nextMatch?.opponentSymbol === cm.opponentSymbol ? s.nextMatch?.venue : undefined;
         let selectionReason: string | undefined = undefined;

         if (!finalStatus && s.player) {
            finalVenue = cm.isHome ? 'Home' : 'Away';
            finalKickoffTime = cm.competitionType === 'DOMESTIC_CUP' || cm.competitionType === 'EUROPEAN' ? '19:45 BST' : '15:00 BST';
            
             const selRes = calculateDetailedMatchSelection(s.player, cm.competitionType);
             finalStatus = selRes.status;
             selectionReason = selRes.reason;

            const currentClubName = CLUBS.find(c => c.symbol === s.player!.currentClubSymbol)?.name || 'Birmingham';
            // getClubSquad imported globally
            const clubSquadObj = getClubSquad(currentClubName);
            let rawPlayers = clubSquadObj.players.map(p => p.name);
            const userFullName = `${s.player.firstName} ${s.player.lastName}`;
            rawPlayers = rawPlayers.filter(p => p.toLowerCase() !== userFullName.toLowerCase());
            
            const genericTeammates = [
               "Alex Hunter", "Tom Sterling", "James Ward", "Danny Williams", "Marcus Vance"
            ];
            while (rawPlayers.length < 25) {
               const extra = genericTeammates[rawPlayers.length % genericTeammates.length] + " " + Math.floor(Math.random() * 100);
               if (!rawPlayers.includes(extra)) rawPlayers.push(extra);
            }

            const startingXI: string[] = [];
            if (finalStatus === 'STARTER') startingXI.push(userFullName);
            while (startingXI.length < 11) {
               const p = rawPlayers.shift();
               if (p) startingXI.push(p);
            }

            const substitutes: string[] = [];
            if (finalStatus === 'SUBSTITUTE') substitutes.push(userFullName);
            while (substitutes.length < 7) {
               const p = rawPlayers.shift();
               if (p) substitutes.push(p);
            }

            const unused: string[] = [];
            if (finalStatus === 'UNUSED') unused.push(userFullName);
            while (unused.length < 5 && rawPlayers.length > 0) {
               const p = rawPlayers.shift();
               if (p) unused.push(p);
            }

            finalSquadList = { startingXI, substitutes, unused };
         }

         nextMatch = {
           opponentSymbol: cm.opponentSymbol,
           isBigMatch: pressure >= 8,
           matchType: matchType,
           competitionType: cm.competitionType,
           pressure,
           rivalryName,
           playerStatus: finalStatus,
           selectionReason: selectionReason,
           squadList: finalSquadList,
           kickoffTime: finalKickoffTime,
           venue: finalVenue
         };
      }

      let newEvent = s.player ? generateEvent(s, isTransferWindow) : null;
      if (isMatchDay) newEvent = null; // No events on matchday

      const isNextDayTraining = (nextDay === 'TUE' || nextDay === 'THU') && 
                                !isMatchDay && 
                                !isTomorrowMatchDay && 
                                (todaysCalendarEntry?.type !== 'INTERNATIONAL_BREAK') && 
                                (tomorrowCalendarEntry?.type !== 'INTERNATIONAL_BREAK');

      if (isNextDayTraining && s.player) {
         newEvent = {
            id: 'CLUB_TRAINING_ORCHESTRATOR',
            title: 'Club Organized Training 📋',
            description: `Today is a scheduled Club Organized Training session. The coaching staff expects full attendance. What will you do?`,
            category: 'TRAINING',
            choices: [
               {
                  text: 'Attend training session',
                  actionType: 'ENGINE_CHOICE_CLUB_TRAINING_ATTEND_FULL'
               },
               {
                  text: 'Skip training session',
                  actionType: 'ENGINE_CHOICE_CLUB_TRAINING_SKIP'
               }
            ]
         };
      }
      
      let updatedPlayerTemp = s.player;
      let newInboxTemp = [...s.inbox];
      let totwAndPotmUpdates: { totwHistory?: TeamOfTheWeek[]; potmHistory?: PlayerOfTheMonth[] } | null = null;
      let awardsUpdates: { seasonAwardsHistory?: SeasonAwardsSummary[]; pendingAwardsCeremony?: SeasonAwardsSummary | null; screen?: Screen } | null = null;

      // Release squad list 1 day before the matchday

      let squadList: any = null;
      let playerStatus: 'STARTER' | 'SUBSTITUTE' | 'UNUSED' | undefined = undefined;
      let kickoffTime = '15:00 BST';
      let venue = 'Home';

      if (isTomorrowMatchDay && tomorrowCalendarEntry?.match && updatedPlayerTemp) {
         venue = tomorrowCalendarEntry.match.isHome ? 'Home' : 'Away';
         kickoffTime = tomorrowCalendarEntry.match.competitionType === 'DOMESTIC_CUP' || tomorrowCalendarEntry.match.competitionType === 'EUROPEAN' ? '19:45 BST' : (Math.random() > 0.5 ? '15:00 BST' : '12:30 BST');
         
         const detailedSel = calculateDetailedMatchSelection(updatedPlayerTemp, tomorrowCalendarEntry.match.competitionType);
         playerStatus = detailedSel.status;
         const selectionReason = detailedSel.reason;

         const hasSkippedTraining = updatedPlayerTemp.stateFlags?.skippedTrainingThisWeek;
         if (hasSkippedTraining) {
            playerStatus = Math.random() > 0.5 ? 'SUBSTITUTE' : 'UNUSED';
         }
         
         const currentClubName = CLUBS.find(c => c.symbol === updatedPlayerTemp!.currentClubSymbol)?.name || 'Birmingham';
         // getClubSquad imported globally
         const clubSquadObj = getClubSquad(currentClubName);
         let rawPlayers = clubSquadObj.players.map(p => p.name);
         
         const userFullName = `${updatedPlayerTemp.firstName} ${updatedPlayerTemp.lastName}`;
         rawPlayers = rawPlayers.filter(p => p.toLowerCase() !== userFullName.toLowerCase());
         
         const genericTeammates = [
            "Alex Hunter", "Tom Sterling", "James Ward", "Danny Williams", "Marcus Vance",
            "Liam Brooks", "Oliver Kane", "Ethan Shaw", "Mason Mount", "Connor Gallagher",
            "Harvey Barnes", "Jacob Ramsey", "Morgan Gibbs", "Lewis Hall", "Billy Gilmour"
         ];
         while (rawPlayers.length < 25) {
            const extra = genericTeammates[rawPlayers.length % genericTeammates.length] + " " + Math.floor(Math.random() * 100);
            if (!rawPlayers.includes(extra)) rawPlayers.push(extra);
         }
         
         const startingXI: string[] = [];
         if (playerStatus === 'STARTER') {
            startingXI.push(userFullName);
         }
         while (startingXI.length < 11) {
            const p = rawPlayers.shift();
            if (p) startingXI.push(p);
         }
         
         const substitutes: string[] = [];
         if (playerStatus === 'SUBSTITUTE') {
            substitutes.push(userFullName);
         }
         while (substitutes.length < 7) {
            const p = rawPlayers.shift();
            if (p) substitutes.push(p);
         }
         
         const unused: string[] = [];
         if (playerStatus === 'UNUSED') {
            unused.push(userFullName);
         }
         while (unused.length < 5 && rawPlayers.length > 0) {
            const p = rawPlayers.shift();
            if (p) unused.push(p);
         }
         
         squadList = { startingXI, substitutes, unused };
         
         const managerName = s.worldState?.clubs?.[s.player.currentClubSymbol]?.manager?.name || clubSquadObj.manager || "The Boss";
         let selectionDialogue = `You have been selected to start tomorrow against ${tomorrowCalendarEntry.match.opponentSymbol} (${selectionReason}). Your training performance and form have earned you this spot. I need 100% focus and intensity out there.`;
         
         if (playerStatus === 'SUBSTITUTE') {
            selectionDialogue = `You will start on the bench tomorrow against ${tomorrowCalendarEntry.match.opponentSymbol} (${selectionReason}). We need you fresh to make an impact in the second half. Stay warm, watch the game, and be ready when your name is called.`;
         } else if (playerStatus === 'UNUSED') {
            selectionDialogue = `I have decided to leave you out of the matchday squad for tomorrow's match against ${tomorrowCalendarEntry.match.opponentSymbol} (${selectionReason}). You need to increase your training intensity and prove you are ready to represent this club. Use the matchday to train hard.`;
         }

         if (hasSkippedTraining && updatedPlayerTemp) {
            if (playerStatus === 'SUBSTITUTE') {
               selectionDialogue = `Due to your unexcused absence from club training earlier this week, I am dropping you to the bench for tomorrow's match against ${tomorrowCalendarEntry.match.opponentSymbol}. Your teammates worked their tails off, and I will not award complacency. Stay ready to impact from the bench.`;
            } else {
               selectionDialogue = `I have completely dropped you from the matchday squad to face ${tomorrowCalendarEntry.match.opponentSymbol} because you skipped our mandatory organized training sessions. Take this weekend to reflect on your lack of discipline.`;
            }
            // Clear the flag
            updatedPlayerTemp.stateFlags = {
               ...updatedPlayerTemp.stateFlags,
               skippedTrainingThisWeek: false
            };
         }
         
         newInboxTemp.push({
            id: `squad_list_release_${Date.now()}`,
            sender: `${managerName.toUpperCase()} (MANAGER)`,
            subject: `Squad Announcement: vs ${tomorrowCalendarEntry.match.opponentSymbol} 📋`,
            content: selectionDialogue,
            read: false,
            type: 'DM',
            timestamp: `${nextDay} 09:00`,
            choices: [{ text: 'Understood, Boss.', type: 'ack' }]
         });
         
         if (nextMatch) {
            nextMatch = {
               ...nextMatch,
               playerStatus,
               selectionReason,
               squadList,
               kickoffTime,
               venue
            };
         } else {
            nextMatch = {
               opponentSymbol: tomorrowCalendarEntry.match.opponentSymbol,
               competitionType: tomorrowCalendarEntry.match.competitionType,
               isBigMatch: false,
               matchType: 'REGULAR',
               pressure: 5,
               playerStatus,
               selectionReason,
               squadList,
               kickoffTime,
               venue
            };
         }
      }

      // Process delayed effects
      if (updatedPlayerTemp) {
         let updatedPlayer = { ...updatedPlayerTemp };
         let newInbox = [...newInboxTemp];
         let delayedEffects: any[] = updatedPlayer.stateFlags?.openThreads?.delayedEffects || [];
         const currentDayStr = nextDay;
         const currentWeekNum = nextWeek;
         
         const effectsToTrigger = delayedEffects.filter(e => e.effectDay === currentDayStr && e.effectWeek === currentWeekNum);
         const remainingEffects = delayedEffects.filter(e => !(e.effectDay === currentDayStr && e.effectWeek === currentWeekNum));
         
         effectsToTrigger.forEach(effect => {
            if (effect.type === 'SPONSOR_FATIGUE') {
               updatedPlayer.fatigue = Math.min(100, updatedPlayer.fatigue + 20);
               updatedPlayer.trust = Math.max(0, updatedPlayer.trust - 12);
               updatedPlayer.relationships.teammates = Math.max(0, updatedPlayer.relationships.teammates - 10);
               
               newInbox.push({
                  id: `delayed_effect_${Date.now()}_${Math.random()}`,
                  sender: 'MANAGER',
                  subject: 'Unacceptable Absence 😡',
                  content: `I've received word that you skipped our critical tactical session to attend that watch gala. Football must always be your first, second, and third priority here. Your manager trust has dropped.`,
                  read: false,
                  type: 'DM',
                  timestamp: `${currentDayStr} 09:00`,
                  choices: [{ text: 'I apologize.', type: 'ack' }]
                });
             }
             else if (effect.type === 'SPONSOR_CHARITY_THANK') {
                updatedPlayer.socialMedia.followers += 2000;
                updatedPlayer.fans = Math.min(100, updatedPlayer.fans + 5);
                
                newInbox.push({
                   id: `delayed_effect_${Date.now()}_${Math.random()}`,
                   sender: 'SARAH STERLING (AGENT)',
                   subject: 'Brilliant PR Response 📈',
                   content: `The sustainable clothing brand is ecstatic! Photos of you with the junior academy kids are trending on Twitter. Your fan support is growing organic roots. Perfect work.`,
                   read: false,
                   type: 'DM',
                   timestamp: `${currentDayStr} 10:00`,
                   choices: [{ text: 'Great to hear!', type: 'ack' }]
                });
             }
             else if (effect.type === 'LEAK_BACKLASH') {
                updatedPlayer.trust = Math.max(0, updatedPlayer.trust - 15);
                updatedPlayer.relationships.teammates = Math.max(0, updatedPlayer.relationships.teammates - 5);
                
                newInbox.push({
                   id: `delayed_effect_${Date.now()}_${Math.random()}`,
                   sender: 'ASSISTANT',
                   subject: 'Press Leak Backlash ⚠️',
                   content: `Journalists just confirmed to our media officer that your agent was the source of the lineup leak. You lied to us. The manager is absolutely furious, and the lads in the dressing room are losing faith in you.`,
                   read: false,
                   type: 'DM',
                   timestamp: `${currentDayStr} 08:30`,
                   choices: [{ text: 'Accept the blame.', type: 'ack' }]
                });
             }
             else if (effect.type === 'LEAK_FORGIVEN') {
                updatedPlayer.trust = Math.min(100, updatedPlayer.trust + 10);
                updatedPlayer.relationships.teammates = Math.min(100, updatedPlayer.relationships.teammates + 5);
                
                newInbox.push({
                   id: `delayed_effect_${Date.now()}_${Math.random()}`,
                   sender: 'MANAGER',
                   subject: 'Dressing Room Trust Restored 🤝',
                   content: `I appreciate your honesty in confessing about your agent's loose tongue. We have suspended his clearance, but because you came forward, the squad respects you. Let's focus on Saturday's match.`,
                   read: false,
                   type: 'DM',
                   timestamp: `${currentDayStr} 08:30`,
                   choices: [{ text: "Let's focus.", type: 'ack' }]
                });
             }
             else if (effect.type === 'MENTOR_GROWTH') {
                updatedPlayer.trust = Math.min(100, updatedPlayer.trust + 10);
                
                newInbox.push({
                   id: `delayed_effect_${Date.now()}_${Math.random()}`,
                   sender: 'ASSISTANT',
                   subject: 'Prospect Progress Report 📊',
                   content: `The youngster has been outstanding in today's drills. His first touch is visibly sharper. The manager is thrilled to see you taking leadership seriously. Keep mentoring him!`,
                   read: false,
                   type: 'DM',
                   timestamp: `${currentDayStr} 11:00`,
                   choices: [{ text: 'Proud of the kid.', type: 'ack' }]
                });
             }
             else if (effect.type === 'MENTOR_FALLOUT') {
                updatedPlayer.relationships.teammates = Math.max(0, updatedPlayer.relationships.teammates - 10);
                
                newInbox.push({
                   id: `delayed_effect_${Date.now()}_${Math.random()}`,
                   sender: 'CAPTAIN',
                   subject: 'Young Player Gutted 😔',
                   content: `Hey, the young prospect was really gutted you blew him off after training. He looks up to you, mate. Let's not let the team morale drop because of senior arrogance.`,
                   read: false,
                   type: 'DM',
                   timestamp: `${currentDayStr} 12:00`,
                   choices: [{ text: "I'll talk to him.", type: 'ack' }]
                });
             }
          });
          
          updatedPlayer.stateFlags = {
             ...updatedPlayer.stateFlags,
             openThreads: {
                ...updatedPlayer.stateFlags.openThreads,
                delayedEffects: remainingEffects
             }
          };
          
          updatedPlayerTemp = updatedPlayer;
          newInboxTemp = newInbox;
       }

       // Trigger random choice scenario (20% chance on any non-matchday)
       if (!isMatchDay && !isTomorrowMatchDay && updatedPlayerTemp && Math.random() < 0.20) {
          // generateConsequenceScenario imported globally
          const scenarioMsg = generateConsequenceScenario(updatedPlayerTemp, nextDay, nextWeek);
          if (scenarioMsg) {
             newInboxTemp.push(scenarioMsg);
          }
       }

      // Transfer window logic: randomly generate offers
      if (isTransferWindow && updatedPlayerTemp && !isMatchDay) {
         let baseChance = 0.15;
         
         const isLateWindow = nextWeek === 4 || nextWeek === 28;
         const isDeadlineDay = isLateWindow && nextDay === 'SUN';

         if (isLateWindow) {
             baseChance = 0.3; // Double chance late in the window
             if (isDeadlineDay) {
                 baseChance = 0.8; // Huge chance on deadline day
             }
         } else if (nextWeek === 1 || nextWeek === 25) {
             baseChance = 0.05; // Very slow early
         }
         
         // DEADLINE DAY CHAOS LOGIC for existing offers
         if (isDeadlineDay && updatedPlayerTemp.transferOffers && updatedPlayerTemp.transferOffers.length > 0) {
             updatedPlayerTemp.transferOffers = updatedPlayerTemp.transferOffers.filter(offer => {
                 // Only affect pending offers
                 if (offer.status !== 'PENDING') return true;
                 
                 const r = Math.random();
                 if (r < 0.15) {
                     // Deal falls through
                     newInboxTemp.push({
                        id: `transfer_collapse_${Date.now()}_${offer.clubSymbol}`,
                        sender: 'AGENT',
                        subject: `🚨 DEAL COLLAPSED: ${offer.clubSymbol}`,
                        content: `${offer.clubSymbol} have just pulled out of the deal. They signed another target at the last minute and the funds are gone.`,
                        read: false,
                        type: 'NEWS',
                        timestamp: `${nextDay} 14:00`,
                        choices: [{ text: 'Unbelievable.', type: 'ack' }]
                     });
                     return false; // Remove offer
                 } else if (r < 0.35) {
                     // Deal improved
                     offer.wage = Math.round(offer.wage * 1.25);
                     newInboxTemp.push({
                        id: `transfer_improved_${Date.now()}_${offer.clubSymbol}`,
                        sender: 'AGENT',
                        subject: `🚨 IMPROVED BID: ${offer.clubSymbol}`,
                        content: `${offer.clubSymbol} are desperate to get this done before the deadline. They've just improved their wage offer to £${offer.wage.toLocaleString()}/w. Time to decide!`,
                        read: false,
                        type: 'NEWS',
                        timestamp: `${nextDay} 16:00`,
                        choices: []
                     });
                 }
                 return true;
             });
         }
         
         // DEADLINE DAY AGENT CHECK IN (No offers)
         if (isDeadlineDay && updatedPlayerTemp.transferListed && (!updatedPlayerTemp.transferOffers || updatedPlayerTemp.transferOffers.length === 0)) {
             if (!updatedPlayerTemp.stateFlags.historyFlags) updatedPlayerTemp.stateFlags.historyFlags = {};
             
             if (!updatedPlayerTemp.stateFlags.historyFlags['deadline_day_push']) {
                 updatedPlayerTemp.stateFlags.historyFlags['deadline_day_push'] = true;
                 
                 const isWellConnected = ['Shark', 'Super Agent', 'Legend'].includes(updatedPlayerTemp.agentTier);
                 
                 newInboxTemp.push({
                    id: `deadline_day_push_${Date.now()}`,
                    sender: 'AGENT',
                    subject: `🚨 DEADLINE DAY: Push for a move?`,
                    content: `We're out of time. You're on the transfer list but we have no concrete offers on the table. Do you want me to aggressively shop you around to anyone who will listen? ${isWellConnected ? "I've got the contacts to make a panic buy happen, but you might have to accept lower wages." : "I'll try my best, but my network isn't great. We might just annoy your current manager."}`,
                    read: false,
                    type: 'DM',
                    timestamp: `${nextDay} 08:00`,
                    choices: [
                       { text: 'Yes, force a move! (Lower wages, upset manager)', type: 'deadline_force_move' },
                       { text: 'No, let it be. We stay.', type: 'deadline_stay' }
                    ]
                 });
             }
         }
         
         if (Math.random() < baseChance) {
             // generateTransferOffers imported globally
             const newOffers = generateTransferOffers(updatedPlayerTemp, nextWeek, nextDay);
             if (newOffers.length > 0) {
                updatedPlayerTemp = {
                   ...updatedPlayerTemp,
                   transferOffers: [...(updatedPlayerTemp.transferOffers || []), ...newOffers]
                };
                
                newInboxTemp.push({
                   id: `transfer_offer_${Date.now()}`,
                   sender: 'AGENT',
                   subject: isDeadlineDay ? `🚨 DEADLINE DAY: Bid Received!` : `Transfer Offer${newOffers.length > 1 ? 's' : ''} Received!`,
                   content: isDeadlineDay 
                    ? `Deadline day madness! We've just received ${newOffers.length} last-minute bid${newOffers.length > 1 ? 's' : ''}. The clock is ticking, check your Career Hub and make a decision fast!`
                    : `We've received ${newOffers.length} new transfer offer${newOffers.length > 1 ? 's' : ''}. Check your Career Hub for details.`,
                   read: false,
                   type: 'NEWS',
                   timestamp: `${nextDay} 10:00`,
                   choices: []
                });
             }
         }
      }
      
      if (idx < days.length - 1) {
        return {
          ...s,
          player: updatedPlayerTemp,
          inbox: newInboxTemp,
          currentDay: nextDay,
          currentWeek: nextWeek,
          activeEvent: newEvent,
          nextMatch
        };
      } else {
        // Week ends, accumulate wages and weekly decay
        
        let newInbox = [...newInboxTemp];
        let newSeasonCalendar = s.seasonCalendar;
        let newSeason = s.season || 1;
        let newWorldState = s.worldState;

        // Run World Simulation
        if (newWorldState && updatedPlayerTemp) {
            // Lazy initialization of clubFinances for older saves or backup safety
            if (!newWorldState.clubFinances) {
                newWorldState.clubFinances = initializeAllClubFinances();
            }

            // Run Club Finances Weekly Simulation
            const isHomeMatchThisWeek = s.seasonCalendar.find(entry => entry.week === s.currentWeek && entry.type === 'MATCH')?.match?.isHome || false;
            const financeResult = simulateClubFinancesWeekly(
                newWorldState.clubFinances,
                updatedPlayerTemp.currentClubSymbol,
                s.currentWeek,
                updatedPlayerTemp.contract.wage,
                isHomeMatchThisWeek,
                s.season
            );
            newWorldState.clubFinances = financeResult.updatedFinances;

            // Append alerts to inbox news
            financeResult.alerts.forEach((alertText, aIdx) => {
                newInbox.push({
                   id: `finance_alert_${Date.now()}_${aIdx}`,
                   sender: 'CLUB BOARDROOM',
                   subject: 'Club Finance Bulletin',
                   content: alertText,
                   read: false,
                   type: 'NEWS',
                   timestamp: 'MON 09:30',
                   choices: []
                });
            });

            newWorldState = simulateWorldWeek(newWorldState, updatedPlayerTemp.currentClubSymbol, s.currentWeek, isTransferWindow, updatedPlayerTemp);

            if (newWorldState && newWorldState.newsItems && newWorldState.newsItems.length > 0) {
                newWorldState.newsItems.forEach(item => {
                    newInboxTemp.push({
                        id: `world_news_${Date.now()}_${Math.random()}`,
                        sender: 'WORLD FOOTBALL NEWS',
                        subject: item.type === 'MANAGER' ? 'Managerial Change' : 'Transfer Rumor',
                        content: item.text,
                        read: false,
                        type: 'RUMOR',
                        timestamp: 'MON 08:00',
                        choices: [{ text: 'Interesting.', type: 'ack' }]
                    });
                });
                newWorldState.newsItems = []; // clear after reading
            }

            // Phase 7 Legacy Systems weekly checks
            if (updatedPlayerTemp) {
                // 1. INTL Call-Up Check
                const intlCallUp = generateIntlCallUp(updatedPlayerTemp, nextWeek);
                if (intlCallUp) {
                    newInbox.push(intlCallUp);
                }

                // 2. Testimonial Proposal Check
                const testimonialMsg = generateTestimonialProposal(updatedPlayerTemp);
                if (testimonialMsg) {
                    newInbox.push(testimonialMsg);
                }

                // 3. Stadium / Statue / Hall of Fame Milestones Check
                const milestoneRes = evaluateStadiumMilestones(updatedPlayerTemp);
                if (milestoneRes.newMilestonesUnlocked.length > 0) {
                    updatedPlayerTemp = milestoneRes.updatedPlayer;
                    newInbox.push(...milestoneRes.inboxMessages);
                }

                // 4. Team of the Week (TOTW) Generation
                const userLastPerf = updatedPlayerTemp.stateFlags?.lastMatchPerformance;
                const newTOTW = generateWeeklyTOTW(newWorldState, updatedPlayerTemp, s.currentWeek, s.season, userLastPerf);
                const prevTOTWHistory = totwAndPotmUpdates?.totwHistory || s.totwHistory || [];
                const updatedTOTWHistory = [...prevTOTWHistory, newTOTW];

                if (newTOTW.userSelected) {
                    const totwRes = applyTOTWRewards(updatedPlayerTemp, newTOTW);
                    updatedPlayerTemp = totwRes.updatedPlayer;
                    newInbox.push(totwRes.inboxMsg);
                }

                let updatedPOTMHistory = totwAndPotmUpdates?.potmHistory || s.potmHistory || [];
                // 5. Monthly Player of the Month (POTM) check (every 4 weeks)
                if (s.currentWeek >= 4 && s.currentWeek % 4 === 0) {
                    const monthNum = Math.floor(s.currentWeek / 4);
                    const recentTOTWs = updatedTOTWHistory.slice(-4);
                    const newPOTM = generateMonthlyPOTM(newWorldState, updatedPlayerTemp, monthNum, s.currentWeek, s.season, recentTOTWs);
                    updatedPOTMHistory = [...updatedPOTMHistory, newPOTM];

                    if (newPOTM.isUserPlayer) {
                        const potmRes = applyPOTMRewards(updatedPlayerTemp, newPOTM);
                        updatedPlayerTemp = potmRes.updatedPlayer;
                        newInbox.push(potmRes.inboxMsg);
                    }
                }

                totwAndPotmUpdates = {
                    totwHistory: updatedTOTWHistory,
                    potmHistory: updatedPOTMHistory
                };
            }

            
            

            
        }

        const wasTransferWindow = [1,2,3,4,25,26,27,28].includes(s.currentWeek);
        const isTransferWindowNow = [1,2,3,4,25,26,27,28].includes(nextWeek);
        
        if (wasTransferWindow && !isTransferWindowNow) {
            if (updatedPlayerTemp && updatedPlayerTemp.stateFlags.historyFlags) {
                updatedPlayerTemp.stateFlags.historyFlags['deadline_day_push'] = false;
            }
            if (updatedPlayerTemp?.transferOffers?.length) {
                updatedPlayerTemp.transferOffers = [];
                newInbox.push({
                    id: `transfer_window_closed_${Date.now()}`,
                    sender: 'AGENT',
                    subject: `Transfer Window Closed`,
                    content: `The transfer window has officially closed. All pending offers have expired. We'll have to revisit interest in the next window.`,
                    read: false,
                    type: 'NEWS',
                    timestamp: 'MON 08:00',
                    choices: [{ text: 'Understood.', type: 'ack' }]
                });
            }
        }

        if (nextWeek === 1) {
             // Season reset
             newSeason += 1;
             
             let endSeasonMsgSubject = `End of Season Review`;
             let endSeasonMsgContent = `The season has come to an end. We'll be taking a break and evaluating our squad for the upcoming campaign. Get some rest.`;
             
             if (updatedPlayerTemp) {
                 const currentClub = CLUBS.find(c => c.symbol === updatedPlayerTemp.currentClubSymbol) || CLUBS[0];
                 const standings = getClubStandings(currentClub.league, 52, updatedPlayerTemp.currentClubSymbol, updatedPlayerTemp.seasonObjective?.pointsOffset, newWorldState);
                 const finalRecord = standings.find(c => c.symbol === updatedPlayerTemp.currentClubSymbol);
                 const finalPosition = finalRecord ? finalRecord.pos : 10;
                 
                 const review = evaluateEndofSeasonObjective(updatedPlayerTemp, finalPosition);
                 
                 // Update the player values
                 updatedPlayerTemp.relationships.manager = Math.max(0, Math.min(100, updatedPlayerTemp.relationships.manager + review.trustDelta));
                 updatedPlayerTemp.reputation.world = Math.max(0, Math.min(100, updatedPlayerTemp.reputation.world + review.repDelta));
                 updatedPlayerTemp.fans = Math.max(0, Math.min(100, updatedPlayerTemp.fans + (review.status === 'EXCEEDED' ? 10 : review.status === 'MET' ? 5 : -5)));
                 
                 // Append timeline
                 updatedPlayerTemp.timeline = [
                   {
                     id: `season_review_${Date.now()}`,
                     week: 52,
                     day: 'SUN',
                     type: 'MILESTONE',
                     title: `🏁 Season ${newSeason - 1} Review: Finished ${finalPosition}th`,
                     description: `${review.title}. Stated objective was "${updatedPlayerTemp.seasonObjective?.title}". Actual finish: ${finalPosition}th.`,
                     clubSymbol: updatedPlayerTemp.currentClubSymbol
                   },
                   ...updatedPlayerTemp.timeline
                 ];
                 
                 // Generate a brand new season objective for the next season!
                 updatedPlayerTemp.seasonObjective = generateSeasonObjective(currentClub, updatedPlayerTemp.ovr);
                 
                 endSeasonMsgSubject = review.title;
                 endSeasonMsgContent = review.text + `\n\nFor the upcoming Season ${newSeason}, the board has drawn up a new blueprint:\n\nNew Objective: "${updatedPlayerTemp.seasonObjective.title}"\nTarget: ${updatedPlayerTemp.seasonObjective.targetText}. Let's make this season even better!`;

                 // End of Season Awards Ceremony
                 const seasonTOTWs = ((totwAndPotmUpdates?.totwHistory) || s.totwHistory || []).filter(t => t.season === (newSeason - 1));
                 const seasonAwards = generateEndofSeasonAwards(newWorldState, updatedPlayerTemp, (newSeason - 1), seasonTOTWs);
                 const awardRes = applySeasonAwardsRewards(updatedPlayerTemp, seasonAwards);
                 updatedPlayerTemp = awardRes.updatedPlayer;
                 newInbox.push(...awardRes.inboxMsgs);

                 awardsUpdates = {
                     seasonAwardsHistory: [...(s.seasonAwardsHistory || []), seasonAwards],
                     pendingAwardsCeremony: seasonAwards,
                     screen: 'AWARDS_CEREMONY' as Screen
                 };
             }
             
             newInbox.push({
               id: `season_end_${Date.now()}`,
               sender: 'CLUB CHAIRMAN',
               subject: endSeasonMsgSubject,
               content: endSeasonMsgContent,
               read: false,
               type: 'NEWS',
               timestamp: 'MON 09:00',
               choices: []
             });
             
             if (updatedPlayerTemp) {
                 updatedPlayerTemp.fans = Math.min(100, updatedPlayerTemp.fans + 5);
             }


             if (s.player) {
                const club = CLUBS.find(c => c.symbol === s.player!.currentClubSymbol);
                if (club) {
                   // generateSeasonCalendar imported globally
                   newSeasonCalendar = generateSeasonCalendar(club);
                }
                
                updatedPlayerTemp.stateFlags = {
                   ...updatedPlayerTemp.stateFlags,
                   preseasonEvaluation: {
                     friendlyAppearances: 0,
                     friendlyRatingsSum: 0,
                     provisionalStatus: updatedPlayerTemp.contract.status,
                     originalStatus: updatedPlayerTemp.contract.status,
                     injuries: 0
                   }
                };
             }
        }
        
        if (s.currentWeek === 4 && nextWeek === 5 && updatedPlayerTemp?.stateFlags?.preseasonEvaluation) {
            const evaluation = updatedPlayerTemp.stateFlags.preseasonEvaluation;
            let avgRating = evaluation.friendlyAppearances > 0 ? (evaluation.friendlyRatingsSum / evaluation.friendlyAppearances) : 0;
            
            let statusShift = 0;
            if (avgRating >= 8.0) statusShift = 2;
            else if (avgRating >= 7.0) statusShift = 1;
            else if (avgRating < 6.0 && evaluation.friendlyAppearances > 0) statusShift = -1;
            else if (updatedPlayerTemp.isInjured) statusShift = -1;
            
            const tiers: import('../types').SquadHierarchyTier[] = ['Exile', 'Squad Player', 'Backup', 'Rotation', 'First Teamer', 'Key Player', 'Star Player', 'Club Legend'];
            let currentIdx = tiers.indexOf(evaluation.originalStatus);
            if (currentIdx === -1) currentIdx = 3;
            
            let newIdx = Math.max(0, Math.min(tiers.length - 1, currentIdx + statusShift));
            
            // Cannot become club legend from friendlies
            if (newIdx === tiers.length - 1 && currentIdx < tiers.length - 1) newIdx = tiers.length - 2;
            
            const finalStatus = tiers[newIdx];
            
            updatedPlayerTemp.contract = {
                ...updatedPlayerTemp.contract,
                status: finalStatus
            };
            
            let messageContent = `Preseason is over. You made ${evaluation.friendlyAppearances} appearances. `;
            if (avgRating > 0) {
                messageContent += `Your average rating was ${avgRating.toFixed(1)}. `;
            }
            if (statusShift > 0) {
                messageContent += `I was very impressed with your application and output. You have improved your standing in the squad from ${evaluation.originalStatus} to ${finalStatus}. Keep it up.`;
                updatedPlayerTemp.trust = Math.min(100, updatedPlayerTemp.trust + 15);
            } else if (statusShift < 0) {
                messageContent += `Frankly, you haven't shown me enough. Your status has dropped to ${finalStatus}. You need to work much harder if you want minutes this season.`;
                updatedPlayerTemp.trust = Math.max(0, updatedPlayerTemp.trust - 10);
            } else {
                messageContent += `Your performances were adequate. You will begin the season as a ${finalStatus}, just as you started. The real work begins now.`;
            }
            
            newInbox.push({
                id: `preseason_report_${Date.now()}`,
                sender: 'MANAGER',
                subject: 'Preseason Report Card & Squad Status',
                content: messageContent,
                read: false,
                type: 'DM',
                timestamp: 'MON 08:00',
                choices: [{ text: 'Understood, Boss.', type: 'ack' }]
            });
            
            // Clear the evaluation flag
            delete updatedPlayerTemp.stateFlags.preseasonEvaluation;
        }

        let newAgentRel = (s.player?.relationships?.agent || 50);
        let newTeammateRel = (s.player?.relationships?.teammates || 50);
        let newManagerRel = (s.player?.relationships?.manager || 50);
        
        s.inbox.forEach(m => {
          if (!m.read) {
            if (m.sender === 'AGENT') newAgentRel -= 5;
            else if (m.sender === 'CLUB CAPTAIN' || m.sender === 'TEAMMATES') newTeammateRel -= 5;
            else if (m.sender === 'MANAGER' || m.sender === 'ASSISTANT MANAGER') newManagerRel -= 5;
          }
        });

        let newFamilyRel = (s.player?.relationships?.family || 60);

        let updatedPlayer: Player | null = null;
        let updatedNpcRegistry = s.npcRegistry;

        if (updatedPlayerTemp) {
           // Family relationship naturally decays unless maintained. Reduced decay if high family expense.
           const familyUpkeep = updatedPlayerTemp.finances?.expenses?.family || 0;
           const decayAmt = familyUpkeep > 5000 ? 0 : (familyUpkeep > 1000 ? 1 : 3);
           newFamilyRel = Math.max(0, newFamilyRel - decayAmt);
           
           const club = CLUBS.find(c => c.symbol === updatedPlayerTemp!.currentClubSymbol);
           const clubOvr = club ? club.ovr : 65;
           
           const newTier = evaluateHierarchyTier(
             updatedPlayerTemp.ovr, 
             clubOvr, 
             newManagerRel, 
             updatedPlayerTemp.relationships?.manager_discipline ?? 50, 
             updatedPlayerTemp.reputation?.club ?? 50,
             updatedPlayerTemp.isInjured
           );

           // Custom Sponsors & Investment Passive Income
           const openThreads = updatedPlayerTemp.stateFlags?.openThreads || {};
           const signedSponsors = openThreads.sponsors || [];
           const teamSignedSponsors = openThreads.signed_sponsors || [];
           const activeInvestments = openThreads.investments || { properties: [], startups: [], shibaFc: { tokens: 0, avgPrice: 0 } };
           
           const sponsorDealsDb = [
             { id: 'three_stripes', name: 'ThreeStripes Brand Ambassador', payout: 3000 },
             { id: 'victory_swoosh', name: 'VictorySwoosh Elite Athlete', payout: 10000 },
             { id: 'giga_cougar', name: 'GigaCougar Global Face', payout: 30000 },
             { id: 'luxo_chrono', name: 'LuxoChrono Signature Series', payout: 75000 },
             { id: 'apex_hypercars', name: 'ApexHypercars Track Ambassador', payout: 150000 },
           ];

           const teamSponsorDealsDb = [
             { id: 'puma', payout: 450 },
             { id: 'nike', payout: 1200 },
             { id: 'adidas', payout: 2500 },
             { id: 'redbull', payout: 5000 },
           ];

            let customSponsorIncome = 0;
            signedSponsors.forEach((sId: string) => {
              const deal = sponsorDealsDb.find(d => d.id === sId);
              if (deal) customSponsorIncome += deal.payout;
            });

            teamSignedSponsors.forEach((sId: string) => {
              const deal = teamSponsorDealsDb.find(d => d.id === sId);
              if (deal) customSponsorIncome += deal.payout;
            });

            const activeSponsor = updatedPlayerTemp.stateFlags?.activeSponsorship;
            if (activeSponsor) {
              customSponsorIncome += activeSponsor.wage;
            }
           // Property yields
           let propertyRentalYield = 0;
           if (activeInvestments.properties) {
             activeInvestments.properties.forEach((prop: any) => {
               propertyRentalYield += prop.yield || 0;
             });
           }

           // Startup changes
           let updatedStartups = [];
           if (activeInvestments.startups) {
             updatedStartups = activeInvestments.startups.map((startup: any) => {
               const changeRoll = Math.random();
               let multiplier = 1.0;
               let stage = startup.stage;
               if (changeRoll > 0.85) {
                 multiplier = 1.4 + Math.random() * 0.4;
                 stage = 'Series A / Scale-up';
               } else if (changeRoll < 0.15) {
                 multiplier = 0.6 + Math.random() * 0.3;
                 stage = 'Pivoting / Precarious';
               } else {
                 multiplier = 0.95 + Math.random() * 0.15;
               }
               const newVal = Math.floor(startup.val * multiplier);
               return { ...startup, val: newVal, stage };
             });
           }

           // ShibaFC Cryptocurrency Volatility
           const lastCryptoPrice = openThreads.shibaFcPrice || 1.25;
           const cryptoChange = 0.75 + Math.random() * 0.55; // -25% to +30% volatility
           const nextCryptoPrice = parseFloat((lastCryptoPrice * cryptoChange).toFixed(2));
           openThreads.shibaFcPrice = nextCryptoPrice;

           // Save updated investments
           openThreads.investments = {
             ...activeInvestments,
             properties: activeInvestments.properties || [],
             startups: updatedStartups,
             shibaFc: activeInvestments.shibaFc || { tokens: 0, avgPrice: 0 }
           };
           openThreads.sponsors = signedSponsors;

           const sponsorIncome = ((updatedPlayerTemp.reputation?.world || 50) * 1500) || 0;
           const income = (updatedPlayerTemp.contract?.wage || 0) + sponsorIncome + customSponsorIncome + propertyRentalYield;
           const expenses = (updatedPlayerTemp.finances?.expenses?.housing || 0) + (updatedPlayerTemp.finances?.expenses?.training || 0) + (updatedPlayerTemp.finances?.expenses?.lifestyle || 0) + (updatedPlayerTemp.finances?.expenses?.family || 0);
           const netWeekly = income - expenses;
           
           let newBalance = (updatedPlayerTemp.finances?.balance || 0) + netWeekly;
           
           // Financial Empire Payout (System 6)
           if (updatedPlayerTemp.financialEmpire) {
              const empResult = processFinancialEmpireWeekly(updatedPlayerTemp, nextWeek);
              updatedPlayerTemp = empResult.player;
              newBalance = updatedPlayerTemp.finances.balance; // Sync balance with Financial Empire
              
              empResult.payoutLog.forEach((logStr, lIdx) => {
                newInbox.push({
                  id: `financial_payout_${Date.now()}_${lIdx}`,
                  sender: 'FINANCIAL EMPIRE',
                  subject: 'Weekly Wealth Payout',
                  content: logStr,
                  read: false,
                  type: 'NEWS',
                  timestamp: 'MON 08:00',
                  choices: []
                });
              });
           }

           // Rivals Weekly Progression (System 4)
           const rivalResult = progressRivals(updatedPlayerTemp, nextWeek, updatedNpcRegistry);
           updatedPlayerTemp = rivalResult.player;
           if (rivalResult.registry) {
             updatedNpcRegistry = rivalResult.registry;
           }
           if (rivalResult.rivalMessage) {
              newInbox.push({
                 id: `rival_alert_${Date.now()}`,
                 sender: 'THE PRESS',
                 subject: 'New Positional Rivalry',
                 content: rivalResult.rivalMessage,
                 read: false,
                 type: 'NEWS',
                 timestamp: 'MON 09:00',
                 choices: []
              });
           }

           // Monthly Scout Report (System 1 & 0.2)
           const isScoutReportDue = [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49].includes(nextWeek);
           if (isScoutReportDue) {
              const newReport = generateMonthlyScoutReport(updatedPlayerTemp, nextWeek, newSeason);
              if (!updatedPlayerTemp.scoutReports) updatedPlayerTemp.scoutReports = [];
              updatedPlayerTemp.scoutReports = [newReport, ...updatedPlayerTemp.scoutReports];
              
              newInbox.push({
                 id: `scout_report_${Date.now()}`,
                 sender: 'CHIEF SCOUT',
                 subject: `Monthly Scout Analysis: ${newReport.potentialRating.reputationTierAtTimeOfReport}`,
                 content: `Here is your detailed Monthly Scout Report, evaluating your current form, tactical ceiling, and market value:\n\n` +
                          `Potential: ${"★".repeat(newReport.potentialRating.displayedStars)}${"☆".repeat(5 - newReport.potentialRating.displayedStars)}\n` +
                          `Estimated Value: ${newReport.transferValue}\n` +
                          `Strengths: ${newReport.strengths.join(', ')}\n` +
                          `Weaknesses: ${newReport.weaknesses.join(', ')}\n` +
                          `Comparison: ${newReport.comparison}\n\n` +
                          `Check your Transfers tab to read the full breakdown and see your progression trend.`,
                 read: false,
                 type: 'OFFER',
                 timestamp: 'MON 10:00',
                 choices: []
              });
           }

           // Dressing Room Rumble (System 2)
           const rumbleResult = checkAndTriggerDressingRoomRumble(updatedPlayerTemp, nextWeek);
           if (rumbleResult.event) {
              const rEv = rumbleResult.event;
              if (!updatedPlayerTemp.dressingRoomEvents) updatedPlayerTemp.dressingRoomEvents = [];
              updatedPlayerTemp.dressingRoomEvents = [rEv, ...updatedPlayerTemp.dressingRoomEvents];
              
              if (!updatedPlayerTemp.stateFlags.eventCooldowns) {
                updatedPlayerTemp.stateFlags.eventCooldowns = {};
              }
              updatedPlayerTemp.stateFlags.eventCooldowns.dressingRoomRumble = 4; // 4 weeks cooldown

              // Map scenario name to index
              const rIdx = ['The Clash', 'The Leak', 'The Argument', 'The Scapegoat', 'The Party', 'The Transfer'].indexOf(rEv.type);
              const msgChoices = rEv.choices.map((text, cIdx) => ({
                text,
                type: `RUMBLE_CHOICE_${rIdx}_${cIdx}`
              }));
              
              newInbox.push({
                 id: `rumble_${Date.now()}`,
                 sender: 'DRESSING ROOM',
                 subject: `Rumble: ${rEv.type}`,
                 content: rEv.description,
                 read: false,
                 type: 'DM',
                 timestamp: 'TUE 11:00',
                 choices: msgChoices
              });
           } else {
              if (!updatedPlayerTemp.stateFlags.eventCooldowns) {
                updatedPlayerTemp.stateFlags.eventCooldowns = {};
              }
              const currentCd = updatedPlayerTemp.stateFlags.eventCooldowns.dressingRoomRumble || 0;
              updatedPlayerTemp.stateFlags.eventCooldowns.dressingRoomRumble = Math.max(0, currentCd - 1);
           }

           // --- SYSTEM 2: DYNAMIC CALENDAR EVENTS ---
           if (updatedPlayerTemp) {
              const dynEventResult = checkAndTriggerDynamicEvent(updatedPlayerTemp, nextWeek);
              if (dynEventResult && dynEventResult.event) {
                 const dynEvent = dynEventResult.event;
                 const msgChoices = dynEvent.choices.map((choice, cIdx) => ({
                    text: choice.text,
                    type: `DYNEVT_${dynEvent.id}_${cIdx}`
                 }));
                 
                 newInbox.push({
                    id: `dynevt_${dynEvent.id}_${Date.now()}`,
                    sender: dynEvent.category === 'PERSONAL' ? 'AGENT' : dynEvent.category === 'CLUB' ? 'CLUB MANAGEMENT' : 'THE PRESS',
                    subject: `⚠️ CONTEXT EVENT: ${dynEvent.title}`,
                    content: dynEvent.description,
                    read: false,
                    type: 'DM',
                    timestamp: 'TUE 10:00',
                    choices: msgChoices
                 });
              }
           }

           // Trophy Cabinet Checks at Domestic Campaign End (System 5)
           if (nextWeek === 40 && updatedPlayerTemp) {
              // Rank our club based on simple OVR standings logic
              const ourClub = CLUBS.find(c => c.symbol === updatedPlayerTemp!.currentClubSymbol);
              const ourLeague = ourClub ? ourClub.league : 'Championship';
              const leagueClubs = CLUBS.filter(c => c.league === ourLeague);
              const sortedByOvr = [...leagueClubs].sort((a, b) => b.ovr - a.ovr);
              const ourIndex = sortedByOvr.findIndex(c => c.symbol === updatedPlayerTemp!.currentClubSymbol);
              
              let finalPosition = ourIndex + 1;
              if (ourClub && ourClub.ovr >= 72 && Math.random() < 0.6) {
                finalPosition = 1; // Win title!
              }
              
              const trophyRes = checkAndLogTrophies(updatedPlayerTemp, nextWeek, newSeason, finalPosition);
              updatedPlayerTemp = trophyRes.player;
              if (trophyRes.trophyMessage) {
                 newInbox.push({
                    id: `trophy_congrats_${Date.now()}`,
                    sender: 'CHAIRMAN',
                    subject: 'CONGRATULATIONS CHAMPION!',
                    content: trophyRes.trophyMessage,
                    read: false,
                    type: 'NEWS',
                    timestamp: 'MON 08:00',
                    choices: []
                 });
              }
           }
           let currentMorale = updatedPlayerTemp.morale;
           let currentSharpness = updatedPlayerTemp.sharpness;

           // Financial pressure
           if (newBalance < 0 || expenses > income * 1.5) {
              currentMorale = Math.max(0, currentMorale - 5);
              currentSharpness = Math.max(0, currentSharpness - 5);
              if (Math.random() < 0.3) {
                 newInbox.push({
                    id: `finance_warn_${Date.now()}`,
                    sender: 'FINANCIAL ADVISOR',
                    subject: 'Urgent: Cashflow Issues',
                    content: `Your lifestyle is unsustainable. We are burning more cash than you earn. Unless you secure a new contract or downgrade your lifestyle immediately, it's going to affect your head on the pitch.`,
                    read: false,
                    type: 'DM',
                    timestamp: 'FRI 12:00',
                    choices: [{ text: 'I understand.', type: 'ack' }]
                 });
              }
           }

           // --- SYSTEM 3: PHYSICAL CONDITION & RECOVERY TIERS ---
           const wasBenchedThisWeek = updatedPlayerTemp?.stateFlags?.openThreads?.wasBenched || false;
           if (updatedPlayerTemp) {
             updatedPlayerTemp = processWeeklyPhysicalUpdate(updatedPlayerTemp, wasBenchedThisWeek);
           }

           // --- PHASE 6: WELLBEING - MENTAL FATIGUE & REHAB ---
           if (updatedPlayerTemp && nextDay === 'MON') {
             // 1. Process Mental Fatigue
             const matchesThisWeek = s.seasonCalendar?.filter(e => e.week === s.currentWeek && e.type === 'MATCH').length || 1;
             const hasPR = Boolean(updatedPlayerTemp.stateFlags?.openThreads?.highPRWeek);
             updatedPlayerTemp = processWeeklyMentalFatigue(updatedPlayerTemp, {
               matchesThisWeek,
               pressCountThisWeek: 1,
               hasPRWeek: hasPR
             });

             // 2. Process Active Rehab if Injured
             if (updatedPlayerTemp.isInjured) {
               if (!updatedPlayerTemp.rehabProcess) {
                 updatedPlayerTemp.rehabProcess = initializeActiveRehab(
                   updatedPlayerTemp.injuryName || 'Muscle Strain',
                   updatedPlayerTemp.injuryWeeksLeft || 2
                 );
               }
               const rehabRes = processWeeklyRehabStep(updatedPlayerTemp, 'RECOMMENDED', s);
               updatedPlayerTemp = rehabRes.updatedPlayer;
               if (rehabRes.inboxMessages.length > 0) {
                 newInboxTemp.push(...rehabRes.inboxMessages);
               }
               if (rehabRes.timelineEvents.length > 0) {
                 updatedPlayerTemp.timeline = [
                   ...rehabRes.timelineEvents,
                   ...(updatedPlayerTemp.timeline || [])
                 ];
               }
             }
           }

           let playerTraining = s.player.training ? { ...s.player.training } : {
             weeklySessions: { clubOrganized: 0, individual: 0, recovery: 0, trainingMatch: 0 },
             sessionHistory: [],
             trainingMatchHistory: []
           };

           if (nextDay === 'MON') {
             if (updatedPlayerTemp) {
               const decayRes = decayReputationAndPerception(updatedPlayerTemp, nextWeek);
               updatedPlayerTemp = decayRes.player;
             }

             // PRESEASON EVALUATION
             if (s.currentWeek === 4 && nextWeek === 5) {
                 const report = generatePreseasonReportCard(updatedPlayerTemp);
                 newInboxTemp.push(report.inboxMessage);
                 updatedPlayerTemp = applyPreseasonResults(updatedPlayerTemp, report);
             }

             playerTraining.weeklySessions = {
               clubOrganized: 0,
               individual: 0,
               recovery: 0,
               trainingMatch: 0
             };

             // --- AGE-BASED PHYSICAL DECAY ENGINE (Age 30+) ---
             if (s.player.age >= 30) {
               // Decay physical attributes: pace, strength, stamina, agility
               let mitigationFactor = 1.0;
               
               // 1. High match sharpness combats decay (up to 50%)
               if (s.player.sharpness >= 80) mitigationFactor -= 0.5;
               else if (s.player.sharpness >= 50) mitigationFactor -= 0.25;

               // 2. Advanced lifestyle tiers combat physical decay
               if (s.player.lifestyleTier.training === 'Elite') mitigationFactor -= 0.2;
               if (s.player.lifestyleTier.housing === 'Mansion') mitigationFactor -= 0.2;
               if (s.player.lifestyleTier.nutrition === 'Private Chef') mitigationFactor -= 0.25;

               mitigationFactor = Math.max(0.1, mitigationFactor); // can mitigate up to 90%

               // 3. Neglect increases decay (high fatigue or injury doubles it)
               let severityMultiplier = 1.0;
               if (s.player.fatigue >= 80 || s.player.isInjured) {
                 severityMultiplier = 2.0;
               }

               // Calculate decay amount (0.05 to 0.15 base per physical attribute)
               const baseDecay = (Math.random() * 0.1) + 0.05;
               const finalDecay = parseFloat((baseDecay * mitigationFactor * severityMultiplier).toFixed(3));

               // Apply decay to physical attributes
               const physicalKeys: (keyof typeof s.player.attributes)[] = ['pace', 'strength', 'stamina', 'agility'];
               let decayLog: string[] = [];

               physicalKeys.forEach(key => {
                 const currentVal = s.player.attributes[key] as number;
                 if (currentVal > 30) { // don't decay past 30
                   const newVal = Math.max(30, currentVal - finalDecay);
                   updatedPlayerTemp.attributes[key] = parseFloat(newVal.toFixed(2));
                   decayLog.push(`${(key as string).toUpperCase()} (-${finalDecay.toFixed(2)})`);
                 }
               });

               // Periodic coaching notification of aging / decay to keep the player informed!
               if (Math.random() < 0.1 && decayLog.length > 0) {
                 let alertMessage = `The medical team has completed your weekly physical assessment.\n\nAt age ${s.player.age}, maintaining peak physical attributes requires intense work. We have noted minor age-related fatigue and physical decay across your physical metrics:\n` +
                   decayLog.map(log => `• ${log}`).join('\n');
                 
                 newInbox.push({
                   id: `aging_report_${Date.now()}`,
                   sender: getCanonicalSender(s, 'PHYSIO'),
                   subject: 'Weekly Physical Assessment',
                   content: alertMessage,
                   read: false,
                   type: 'SPORTING',
                   timestamp: 'MON 08:00',
                   choices: [{ text: 'I will work harder.', type: 'ack' }]
                 });
               }
             }
           }

           const wasWeekday = ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(s.currentDay);
           if (wasWeekday) {
             playerTraining.weeklySessions = {
               ...playerTraining.weeklySessions,
               clubOrganized: Math.min(5, playerTraining.weeklySessions.clubOrganized + 1)
             };
           }
           
           // Lifestyle Tier image boosts
           if (s.player.lifestyleTier.image === 'Designer') {
             s.player.mediaPerception = Math.min(100, s.player.mediaPerception + 1);
           } else if (s.player.lifestyleTier.image === 'Iconic') {
             s.player.mediaPerception = Math.min(100, s.player.mediaPerception + 2);
             s.player.fans = Math.min(100, s.player.fans + 1);
           }

           if (newTier !== s.player.contract.status) {
              const promoted = ['Star Player', 'Key Player', 'First Teamer', 'Rotation', 'Backup', 'Squad Player', 'Exile'].indexOf(newTier) < 
                               ['Star Player', 'Key Player', 'First Teamer', 'Rotation', 'Backup', 'Squad Player', 'Exile'].indexOf(s.player.contract.status);
              
              newInbox.push({
                id: `hierarchy_${Date.now()}`,
                sender: 'MANAGER',
                subject: promoted ? 'Your place in the squad' : 'Your recent standing',
                content: promoted 
                  ? `I've been impressed. You're now considered a ${newTier} here. Keep it up and don't let the standards drop.` 
                  : `Your standing has dropped. You are now viewed as a ${newTier}. I need to see more from you, both in training and when given a chance.`,
                read: false,
                type: 'DM',
                timestamp: 'MON 08:30',
                choices: [{ text: 'Understood.', type: 'ack' }]
              });
           }
           
           // National Team Callup Logic
           // This week might be an INTL week? Actually, the callup should happen on Monday of the INTL week.
           // In GameContext, nextWeek is processed on the transition.
           // INTL weeks: [10, 11, 14, 15, 18, 19, 36, 37, 49, 50]
           const intlWeeks = [10, 11, 14, 15, 18, 19, 36, 37, 49, 50];
           if (intlWeeks.includes(nextWeek)) {
               // Generate call up
               const callUpMsg = generateIntlCallUp(updatedPlayerTemp, nextWeek);
               if (callUpMsg) {
                   newInbox.push(callUpMsg);
               }
           }

           // Transfer Market Offers
           let baseTransferChance = 0.3;
           if ((s.player.relationships?.agent ?? 50) < 30) baseTransferChance = 0.1;
           else if ((s.player.relationships?.agent ?? 50) > 80) baseTransferChance = 0.5;

           if ((s.player.transferListed && Math.random() < baseTransferChance) || (isTransferWindow && s.player.contract?.releaseClause && Math.random() < 0.05)) {
              
              const isReleaseClauseTriggered = !s.player.transferListed && s.player.contract?.releaseClause;
              
              const wageModifier = ((s.player.relationships?.agent ?? 50) / 100); 
              const offerWage = Math.floor((s.player.contract?.wage || 1000) * (1 + (Math.random() * 0.5 * wageModifier) + (isReleaseClauseTriggered ? 0.3 : 0)));
              const targetClub = ['RMD', 'FCB', 'MUN', 'CHE', 'ARS', 'TOT', 'JUV', 'BAY', 'PSG'][Math.floor(Math.random() * 9)];
              
              let mailSubject = `Formal Bid from ${targetClub}`;
              let mailContent = `We've got a bite. ${targetClub} have agreed a fee with our board, and they are offering a contract worth £${offerWage.toLocaleString()} p/w. Do you want to make the jump?`;
              let msgChoices = [
                   { text: 'Accept Transfer', type: 'transfer_accept', clubSymbol: targetClub, clubName: targetClub, wage: offerWage, bonus: 1.5 },
                   { text: 'Reject Offer', type: 'transfer_reject' }
              ];
                 
              if (isReleaseClauseTriggered) {
                 mailSubject = `RELEASE CLAUSE TRIGGERED: ${targetClub}`;
                 mailContent = `${targetClub} just met your £${s.player.contract.releaseClause?.toLocaleString()} release clause! The board has no say, and the club has already accepted. You are moving. They are offering £${offerWage.toLocaleString()} p/w. Time to pack your bags.`;
                 msgChoices = [
                    { text: 'Reluctantly Accept (Forced)', type: 'transfer_accept', clubSymbol: targetClub, clubName: targetClub, wage: offerWage, bonus: 3.0 }
                 ];
              }

              newInbox.push({
                 id: `offer_${Date.now()}`,
                 sender: 'AGENT',
                 subject: mailSubject,
                 content: mailContent,
                 read: false,
                 type: 'OFFER',
                 timestamp: 'WED 15:00',
                 choices: msgChoices
              });
           }
           
           // Loan Offers
           if (isTransferWindow && s.player.contract.status === 'Backup' && Math.random() < 0.2 && !s.player.loanInfo) {
              const loanClub = ['SND', 'LEE', 'PLY', 'WIG', 'QPR'][Math.floor(Math.random() * 5)];
              const wagePerc = Math.random() > 0.5 ? 50 : 100;
              newInbox.push({
                 id: `loan_offer_${Date.now()}`,
                 sender: 'SPORTING DIRECTOR',
                 subject: `Loan Offer: ${loanClub}`,
                 content: `We have received a loan approach from ${loanClub}. It could be good for your development to get some first team minutes. They are willing to pay ${wagePerc}% of your wage. The manager here thinks it's a good idea.`,
                 read: false,
                 type: 'TRANSFER',
                 timestamp: 'THU 12:00',
                 choices: [
                   { text: 'Accept Loan Move', type: 'loan_accept', clubSymbol: loanClub, wagePerc: wagePerc },
                   { text: 'Reject and Fight for Place', type: 'loan_reject' }
                 ]
              });
           }

           // Loan Progress Report
           if (s.player.loanInfo && s.currentWeek % 4 === 0) {
              const hostForm = s.player.form;
              const reportTone = hostForm > 7 ? 'GLOWING' : hostForm < 5 ? 'CONCERNING' : 'AVERAGE';
              
              const reportContent = reportTone === 'GLOWING' 
                  ? `The staff at ${s.player.loanInfo.hostClub} are thrilled with your progress. You are developing exactly as we hoped.`
                  : reportTone === 'CONCERNING'
                  ? `We've received a concerning report from ${s.player.loanInfo.hostClub}. You aren't forcing your way into their plans. We might consider a recall.`
                  : `Steady progress at ${s.player.loanInfo.hostClub}. Keep grinding.`;
                  
              if (reportTone === 'CONCERNING' && s.player.loanInfo.recallClause && isTransferWindow) {
                 newInbox.push({
                   id: `loan_recall_${Date.now()}`,
                   sender: 'SPORTING DIRECTOR',
                   subject: 'Loan Recall Activated',
                   content: `We've seen enough. Your loan at ${s.player.loanInfo.hostClub} isn't working out. We are activating the recall clause. You're returning to ${s.player.contract.parentClub}.`,
                   read: false,
                   type: 'TRANSFER',
                   timestamp: 'MON 09:00',
                   choices: [{ text: 'Return to parent club', type: 'loan_recall_accept' }]
                 });
              } else {
                 newInbox.push({
                   id: `loan_report_${Date.now()}`,
                   sender: 'AGENT',
                   subject: 'Parent Club Loan Report',
                   content: `I've got eyes on the report sent back to ${s.player.contract.parentClub}:\n\n"${reportContent}"`,
                   read: false,
                   type: 'NEWS',
                   timestamp: 'WED 16:00',
                   choices: [{ text: 'Noted.', type: 'ack' }]
                 });
              }
           }

           // Sponsor Negotiation
           if (s.player.reputation.world > (s.player.sponsors + 1) * 20 && Math.random() < 0.2) {
              const sponsorName = ['Nike', 'Adidas', 'Puma', 'EA Sports', 'Gatorade', 'Samsung'][Math.floor(Math.random() * 6)];
              newInbox.push({
                 id: `sponsor_offer_${Date.now()}`,
                 sender: 'AGENT',
                 subject: `${sponsorName} Endorsement Deal`,
                 content: `I've got ${sponsorName} at the table. They want you as a face for their next campaign. The deal will add £1,500/w to your consistent sponsor income, but it's great for your brand.`,
                 read: false,
                 type: 'OFFER',
                 timestamp: 'THU 10:00',
                 choices: [
                   { text: 'Sign the Deal', type: 'sponsor_accept', bonus: 1500 },
                   { text: 'Wait for something better', type: 'sponsor_reject' }
                 ]
              });
           }

           // Contract Extensions
           if (!isTransferWindow && Math.random() < 0.05 && (s.player.relationships?.manager ?? 50) > 60 && !s.player.transferListed && !s.player.loanInfo) {
              const offerWage = Math.floor((s.player.contract?.wage || 1000) * 1.5);
              const offerBonus = Math.floor((s.player.contract?.bonuses || 500) * 1.5);
              
              newInbox.push({
                 id: `extension_${Date.now()}`,
                 sender: 'SPORTING DIRECTOR',
                 subject: `Contract Extension Offer`,
                 content: `Given your performances, we'd like to extend your stay. We are offering £${offerWage.toLocaleString()}/w, with improved loyalty bonuses. Do we have a deal?`,
                 read: false,
                 type: 'CONTRACT',
                 timestamp: 'MON 14:00',
                 choices: [
                   { text: 'Sign Extension', type: 'extension_accept', wage: offerWage, bonus: offerBonus },
                   { text: 'Reject (Hold out)', type: 'extension_reject' }
                 ]
              });
           }
           
           // Social Media Engine
           let newFollowers = s.player.socialMedia?.followers || 0;
           let newCancelRisk = s.player.socialMedia?.cancelRisk || 0;
           
           // Organic baseline growth based on reputation
           newFollowers += Math.floor(Math.random() * ((s.player.reputation?.world ?? 50) * 100));

           if (Math.random() < 0.3) {
             const isJournalist = Math.random() > 0.5;
             const handle = isJournalist ? `@${getPrimaryJournalist(s, 0).lastName}Media (${getPrimaryJournalist(s, 0).publication})` : '@FanBanterFC';
             const content = isJournalist 
                ? `Hearing murmurs about your client behind the scenes. Interesting developments ahead?` 
                : `Mate, what is going on with you lately? Looks like you're running in mud out there 😭`;
                
             newInbox.push({
               id: `social_mention_${Date.now()}`,
               sender: 'SOCIAL FEED',
               subject: `Mentioned by ${handle}`,
               content: `You were tagged in a post. Do you want to reply?`,
               read: false,
               type: 'SOCIAL',
               timestamp: 'FRI 20:00',
               socialPost: {
                 authorHandle: handle,
                 likes: Math.floor(Math.random() * 50000),
                 retweets: Math.floor(Math.random() * 5000)
               },
               choices: [
                 { text: 'Ignore', type: 'social_ignore' },
                 { text: 'Reply Humbley (Safe)', type: 'social_humble' },
                 { text: 'Reply Reactive (Risky)', type: 'social_reactive' },
               ]
             });
           }
           
           // Cool down cancel risk
           newCancelRisk = Math.max(0, newCancelRisk - 5);
           
           // Rumor Mill
           if (Math.random() < 0.15) {
               // Generate dynamic rumor
               const isTransferWindowSoon = nextWeek === 50 || nextWeek === 24 || isTransferWindow;
               const unhappy = currentMorale < 40 || (s.player.relationships?.manager ?? 50) < 40;
               let rumorSubject = 'Training Incident?';
               let rumorText = `${getPrimaryJournalist(s, 1).firstName} ${getPrimaryJournalist(s, 1).lastName} (${getPrimaryJournalist(s, 1).publication}): "Reports suggest a bust-up in training involving you. Care to comment?"${buildMemoryThreadText(s, 'JOURNALIST')}`;
               
               if (isTransferWindowSoon && (unhappy || s.player.transferListed)) {
                   rumorSubject = 'Transfer Request Incoming?';
                   rumorText = `Sources close to the player suggest you are looking for a way out of ${s.player.currentClubSymbol}.`;
               } else if (s.player.form > 8) {
                   const currentClub = CLUBS.find(c => c.symbol === s.player!.currentClubSymbol);
                   const currentTier = currentClub ? getClubTier(currentClub) : 5;
                   const scopeLabel = currentTier <= 2 ? 'elite clubs' : currentTier === 3 ? 'top-flight clubs' : 'higher tier clubs';
                   rumorSubject = 'Scouting Interest?';
                   rumorText = `Scouts from ${scopeLabel} have been spotted watching your recent stellar performances.`;
               }
               
               newInbox.push({
                   id: `rumor_${Date.now()}`,
                   sender: getCanonicalSender(s, 'JOURNALIST', 1),
                   subject: rumorSubject,
                   content: rumorText,
                   read: false,
                   type: 'RUMOR',
                   timestamp: 'WED 18:00',
                   choices: [
                       { text: 'Ignore', type: 'rumor_react_ignore' },
                       { text: 'Slam the press (Angry)', type: 'rumor_react_angry' }
                   ]
               });
           }
           
           // ----------------------------------------
           // MENTORING PROSPECTS PROGRESSION (At Week End)
           // ----------------------------------------
           let mentees = openThreads.mentees || [
             {
               id: "david_pereira",
               name: "David Pereira Da Costa",
               age: 19,
               ovr: 63,
               position: "AM",
               relationship: 60,
               isMentored: false,
               growthProgress: 0,
             },
             {
               id: "mason_saka",
               name: "Mason Saka",
               age: 18,
               ovr: 58,
               position: "RW",
               relationship: 45,
               isMentored: false,
               growthProgress: 0,
             }
           ];

           let activeMenteesCount = mentees.filter((m: any) => m.isMentored).length;

           mentees = mentees.map((m: any) => {
             if (m.isMentored) {
               const baseGrowth = 5;
               const multiplier = 2.0;
               const progressGain = Math.floor(baseGrowth * multiplier);
               let nextProgress = m.growthProgress + progressGain;
               let nextOvr = m.ovr;

               if (nextProgress >= 100) {
                 nextOvr = Math.min(99, nextOvr + 1);
                 nextProgress = nextProgress % 100;

                 if (nextOvr >= 80 && !m.hasGivenCredit) {
                   m.hasGivenCredit = true;
                   if (updatedPlayerTemp) {
                     updatedPlayerTemp.reputation.world = Math.min(100, updatedPlayerTemp.reputation.world + 5);
                     updatedPlayerTemp.mediaPerception = Math.min(100, updatedPlayerTemp.mediaPerception + 15);
                   }

                   newInbox.push({
                     id: `mentor_star_${Date.now()}_${m.id}`,
                     sender: m.name.toUpperCase(),
                     subject: `I've hit 80 OVR! Thank you, Boss!`,
                     content: `I just wanted to say thank you. Reaching 80 OVR wouldn't have been possible without your guidance. I made sure to mention your mentorship in my latest press conference!`,
                     read: false,
                     type: 'NEWS',
                     timestamp: 'MON 09:30',
                     choices: [{ text: "Proud of you, kid.", type: 'ack' }]
                   });
                 }
               }

               return {
                 ...m,
                 relationship: Math.min(100, m.relationship + 10),
                 ovr: nextOvr,
                 growthProgress: nextProgress,
               };
             } else {
               const progressGain = 3;
               let nextProgress = m.growthProgress + progressGain;
               let nextOvr = m.ovr;
               if (nextProgress >= 100) {
                 nextOvr = Math.min(99, nextOvr + 1);
                 nextProgress = nextProgress % 100;
               }
               return {
                 ...m,
                 ovr: nextOvr,
                 growthProgress: nextProgress
               };
             }
           });

           openThreads.mentees = mentees;

           if (activeMenteesCount > 0 && updatedPlayerTemp) {
             updatedPlayerTemp.trust = Math.min(100, updatedPlayerTemp.trust + 5);
             updatedPlayerTemp.reputation.club = Math.min(100, updatedPlayerTemp.reputation.club + 2);
             updatedPlayerTemp.reputation.world = Math.min(100, updatedPlayerTemp.reputation.world + 1);

             // Narrative Events
             if (Math.random() < 0.25) {
               const rollVal = Math.random();
               if (rollVal < 0.33) {
                 newInbox.push({
                   id: `mentor_event_david_${Date.now()}`,
                   sender: 'DAVID PEREIRA DA COSTA',
                   subject: 'Learning from the best',
                   content: `David approaches you after training. 'I've been watching you. How do you stay calm under pressure?' You spend an extra 30 minutes with him discussing composure on the pitch.`,
                   read: false,
                   type: 'DM',
                   timestamp: 'THU 17:00',
                   choices: [{ text: 'Teach him.', type: 'ack' }]
                 });
               } else if (rollVal < 0.66) {
                 newInbox.push({
                   id: `mentor_event_manager_${Date.now()}`,
                   sender: 'MANAGER',
                   subject: 'Leadership Qualities',
                   content: `The manager pulls you aside: 'I've noticed you helping the young lads. That's leadership. I like it.' Keep setting a good example.`,
                   read: false,
                   type: 'DM',
                   timestamp: 'FRI 11:30',
                   choices: [{ text: 'Always, boss.', type: 'ack' }]
                 });
               } else {
                 const david = mentees.find((m: any) => m.id === 'david_pereira');
                 if (david && david.isMentored) {
                   newInbox.push({
                     id: `mentor_event_goal_${Date.now()}`,
                     sender: 'CLUB NEWS',
                     subject: 'Breakout Performance!',
                     content: `David Pereira Da Costa scores his first goal of the season. After the ball hits the back of the net, he runs over and points directly at you on the bench. The world sees what you've built.`,
                     read: false,
                     type: 'NEWS',
                     timestamp: 'SUN 19:00',
                     choices: [{ text: 'Celebrate with him.', type: 'ack' }]
                   });
                 }
               }
             }
           }

           // Mentoring Progression
           let updatedMentoring = s.player.mentoring;
           if (updatedMentoring && updatedMentoring.weeksRemaining > 0) {
               updatedMentoring.weeksRemaining -= 1;
               
               // Accelerate attribute growth
               if (Math.random() > 0.5) {
                   const attrKey = updatedMentoring.focusAttribute as keyof typeof s.player.attributes;
                   if (typeof s.player.attributes[attrKey] === 'number') {
                       // We'll safely update this in updatedPlayer below.
                       updatedMentoring = { ...updatedMentoring, _gained: true } as any; 
                   }
               }
               
               if (updatedMentoring.weeksRemaining === 0) {
                   newInbox.push({
                       id: `mentor_done_${Date.now()}`,
                       sender: updatedMentoring.partnerName.toUpperCase(),
                       subject: 'Mentorship Concluded',
                       content: `We've done all we can do together. You've grown a lot as a player. Keep applying what we worked on.`,
                       read: false,
                       type: 'DM',
                       timestamp: 'FRI 09:00',
                       choices: [{ text: 'Thank you.', type: 'ack' }]
                   });
                   updatedMentoring = undefined;
               }
           } else if (!updatedMentoring && s.player.age <= 21 && s.player.contract.status !== 'Star Player' && Math.random() < 0.05) {
               // Propose a mentor
               const mentorName = 'The Club Captain';
               newInbox.push({
                 id: `mentor_offer_${Date.now()}`,
                 sender: 'MANAGER',
                 subject: `Mentorship: ${mentorName}`,
                 content: `I want ${mentorName} to take you under his wing for the next 12 weeks to work on your composure. It'll be extra work but it will accelerate your development.`,
                 read: false,
                 type: 'SPORTING',
                 timestamp: 'TUE 10:00',
                 choices: [
                   { text: 'Accept (High Growth)', type: 'mentor_accept' },
                   { text: 'Decline', type: 'mentor_reject' }
                 ]
               });
           }

           // Check board mid-season checkpoints
           let updatedObjectiveObj = s.player.seasonObjective ? { ...s.player.seasonObjective } : undefined;
           let checkPlayer = { ...s.player, seasonObjective: updatedObjectiveObj };
           
           const currentClubObj = CLUBS.find(c => c.symbol === s.player.currentClubSymbol) || CLUBS[0];
           const weeklyStandings = getClubStandings(currentClubObj.league, s.currentWeek, s.player.currentClubSymbol, s.player.seasonObjective?.pointsOffset, s.worldState);
           const weeklyClubStanding = weeklyStandings.find(c => c.symbol === s.player.currentClubSymbol);
           const currentClubPos = weeklyClubStanding ? weeklyClubStanding.pos : 10;

           // Manager Turnover Engine
           let newManagerInfo = { ...s.player.managerInfo };
           
           // If under assessment, decrement
           if (newManagerInfo.assessmentWeeksLeft > 0) {
              newManagerInfo.assessmentWeeksLeft--;
           }
           
           // Simulating club form using player form + randomness
           const clubForm = (s.player.form * 0.5) + (Math.random() * 5); // 0 to 10
           if (clubForm < 4.0) {
              newManagerInfo.pressure += Math.floor(Math.random() * 15);
           } else if (clubForm > 6.0) {
              newManagerInfo.pressure = Math.max(0, newManagerInfo.pressure - 10);
           }

           const warning = checkMidSeasonObjective(checkPlayer, currentClubPos, s.currentWeek);
           if (warning) {
              newManagerInfo.pressure = Math.min(100, newManagerInfo.pressure + warning.pressureIncrease);
              newInbox.push({
                 id: `board_warning_${Date.now()}`,
                 sender: 'CLUB CHAIRMAN',
                 subject: 'Board Expectations Update',
                 content: warning.message,
                 read: false,
                 type: 'SPORTING',
                 timestamp: 'MON 08:00',
                 choices: [{ text: 'I understand.', type: 'ack' }]
              });
              
              if (s.currentWeek === 17 && updatedObjectiveObj) {
                 updatedObjectiveObj.thirdSeasonCheckpointPassed = true;
              } else if (s.currentWeek === 26 && updatedObjectiveObj) {
                 updatedObjectiveObj.midSeasonCheckpointPassed = true;
              }
           }
           
           let isNewManager = false;
           let initializedBounce = s.player.newManagerBounce;
           let nextManagerTrust = s.player.trust;
           let nextContractStatus = s.player.contract.status;

           if (newManagerInfo.pressure >= 100) {
              // Sack manager - Generate a completely random manager with personality/preferences!
              newManagerInfo = generateRandomNewManager(s.player.currentClubSymbol, s.worldState);
              isNewManager = true;

              if (newWorldState?.clubs?.[s.player.currentClubSymbol]) {
                const archetypes: import('../utils/worldSimulation').ManagerArchetype[] = ['LOYALIST', 'PRAGMATIST', 'PROJECT_BUILDER', 'VOLATILE'];
                newWorldState.clubs[s.player.currentClubSymbol].manager = {
                  name: newManagerInfo.name,
                  archetype: archetypes[Math.floor(Math.random() * archetypes.length)],
                  philosophy: assignManagerPhilosophy(),
                  trust: 50,
                  jobSecurity: 100,
                  tenureWeeks: 0
                };
              }
              
              // Reset player's standing and trust to neutral starting point
              nextManagerTrust = 45; // reset trust to neutral
              if (nextContractStatus === 'Star Player' || nextContractStatus === 'First Teamer') {
                 nextContractStatus = 'Rotation'; // lowered status
              }
              
              // Activate New Manager Bounce
              initializedBounce = {
                active: true,
                matchesLeft: 4,
                trustMultiplier: 1.5,
                performanceBonus: 0,
                originalTrust: 45
              };

              // Customized inbox messages reflecting manager personality and tactics!
              let introGreeting = '';
              if (newManagerInfo.personality === 'Demanding') {
                introGreeting = `I demand physical intensity. The old boss let things slide, but under me, training intensity will double. Prove your stamina and work rate, or you won't touch the pitch.`;
              } else if (newManagerInfo.personality === 'Nurturing') {
                introGreeting = `I want to help you develop your talent. My focus is on player growth, técnica, and mentorship. Show me your willingness to learn and improve, and you will have a bright future here.`;
              } else if (newManagerInfo.personality === 'Tactical') {
                introGreeting = `Football is a game of space and intelligence. My ${newManagerInfo.tacticalSystem} system requires high tactical awareness. You must prove to me that you understand your transitions and positioning.`;
              } else {
                introGreeting = `This club needs stability and results. No fancy tricks—just robust, pragmatic football. Keep your head down, play for the badge, and make zero mistakes.`;
              }

              newInbox.push({
                 id: `sack_${Date.now()}`,
                 sender: 'CLUB CHAIRMAN',
                 subject: 'Managerial Change',
                 content: `Due to recent disappointing results and mounting pressure from the board, we have parted ways with the manager. ${newManagerInfo.name} will be taking over immediately to steady the ship.`,
                 read: false,
                 type: 'NEWS',
                 timestamp: 'MON 08:00',
                 choices: [{ text: 'Understood.', type: 'ack' }]
              });
              
              newInbox.push({
                 id: `new_manager_${Date.now()}`,
                 sender: 'MANAGER',
                 subject: `New Era: ${newManagerInfo.name} takes charge`,
                 content: `I'm sweeping the slate clean. I don't care what you did under the old boss. The next 4 matches are an assessment period. ${introGreeting} Make a good impression.`,
                 read: false,
                 type: 'DM',
                 timestamp: 'MON 10:00',
                 choices: [
                   { text: 'I am ready to work for my place. (Safe)', type: 'manager_greet_safe' },
                   { text: 'I am the star here. Build around me. (Arrogant)', type: 'manager_greet_arrogant' },
                   { text: 'I am not sure I fit your system... (Doubtful)', type: 'manager_greet_doubt' }
                 ]
              });
           } else if (initializedBounce && initializedBounce.active) {
              if (initializedBounce.matchesLeft > 0) {
                initializedBounce.matchesLeft--;
                if (initializedBounce.matchesLeft === 0) {
                   initializedBounce.active = false;
                   
                   // Give a review DM from the manager evaluating the bounce period!
                   let finalStandingReview = '';
                   let statusAdjustment = nextContractStatus;
                   let trustChange = 0;
                   
                   if (nextManagerTrust >= 70) {
                      finalStandingReview = `Excellent work during my assessment window. You have proven yourself to be a core part of my plans. I'm upgrading your squad status and building around you.`;
                      statusAdjustment = 'First Teamer';
                      trustChange = 10;
                   } else if (nextManagerTrust >= 45) {
                      finalStandingReview = `A decent start. You've shown enough in training and matches to remain a valuable squad option. Continue working hard to earn a starting spot.`;
                      statusAdjustment = 'Rotation';
                   } else {
                      finalStandingReview = `I am not impressed by your attitude or work rate. You are falling short of my standards, and you will find your game time severely limited unless things change.`;
                      statusAdjustment = 'Backup';
                      trustChange = -10;
                   }
                   
                   newInbox.push({
                     id: `bounce_eval_${Date.now()}`,
                     sender: 'MANAGER',
                     subject: 'Assessment Period Conclusion',
                     content: `My initial 4-week assessment of the squad is complete. Here is my verdict on you:\n\n"${finalStandingReview}"\n\nSquad Status is now set to: ${statusAdjustment}.`,
                     read: false,
                     type: 'DM',
                     timestamp: 'FRI 09:00',
                     choices: [{ text: 'Understood.', type: 'ack' }]
                   });
                   
                   nextContractStatus = statusAdjustment as any;
                   nextManagerTrust = Math.max(0, Math.min(100, nextManagerTrust + trustChange));
                }
              }
           }

           const safeAttributes = { ...s.player.attributes };
           if (updatedMentoring && (updatedMentoring as any)._gained) {
               const attrKey = updatedMentoring.focusAttribute as keyof typeof safeAttributes;
               if (typeof safeAttributes[attrKey] === 'number') {
                   safeAttributes[attrKey] = Math.min(99, Number(safeAttributes[attrKey]) + 1);
               }
               delete (updatedMentoring as any)._gained;
           }

           updatedPlayer = {
             stateFlags: {
               ...updatedPlayerTemp.stateFlags,
               openThreads: {
                 ...openThreads,
                 mentees: mentees
               }
             },
             ...updatedPlayerTemp,
             attributes: safeAttributes,
             fatigue: updatedPlayerTemp.fatigue,
             morale: currentMorale,
             sharpness: currentSharpness,
             managerInfo: newManagerInfo,
             mentoring: updatedMentoring,
             training: playerTraining,
             trust: nextManagerTrust,
             relationships: {
               ...updatedPlayerTemp.relationships,
               manager: isNewManager ? 50 : Math.max(0, newManagerRel),
               family: Math.max(0, newFamilyRel),
               agent: Math.max(0, newAgentRel),
               teammates: Math.max(0, newTeammateRel)
             },
             contract: {
               ...updatedPlayerTemp.contract,
               status: (nextContractStatus || newTier) as any
             },
             seasonObjective: updatedObjectiveObj,
             newManagerBounce: initializedBounce,
             socialMedia: {
               followers: newFollowers,
               cancelRisk: newCancelRisk
             },
             finances: {
               ...updatedPlayerTemp.finances,
               balance: newBalance
             }
           };
        }

         // End of season checking
         if (updatedPlayer) {
            if (nextWeek === 52) {
               updatedPlayer.age += 1;
               updatedPlayer.timeline = [
                  {
                    id: `season_end_${Date.now()}`,
                    week: 52,
                    day: 'SUN',
                    type: 'MILESTONE',
                    title: `End of Season (Turned ${updatedPlayer.age})`,
                    description: `Completed another grueling season.`,
                    clubSymbol: updatedPlayer.currentClubSymbol
                  },
                  ...updatedPlayer.timeline
               ];

               // Ageing Decline (Category-Based with Facilities and Mentality Compensation)
               if (updatedPlayer.age > 31) {
                  // Calculate lifestyle mitigation
                  let mitigation = 0;
                  if (updatedPlayer.lifestyleTier?.training === 'Elite') mitigation += 1;
                  if (updatedPlayer.lifestyleTier?.housing === 'Mansion') mitigation += 1;
                  if (updatedPlayer.lifestyleTier?.nutrition === 'Private Chef') mitigation += 1;

                  // 1. Physical attributes decay
                  const paceDecay = Math.max(1, 4 - mitigation);
                  const staminaDecay = Math.max(1, 3 - mitigation);
                  const strengthDecay = Math.max(1, 3 - mitigation);

                  updatedPlayer.attributes.pace = Math.max(20, updatedPlayer.attributes.pace - paceDecay);
                  updatedPlayer.attributes.stamina = Math.max(20, updatedPlayer.attributes.stamina - staminaDecay);
                  updatedPlayer.attributes.strength = Math.max(20, updatedPlayer.attributes.strength - strengthDecay);

                  // 2. Technical attributes slight decay
                  const techDecay = Math.max(0, 1 - (mitigation >= 2 ? 1 : 0));
                  if (techDecay > 0) {
                     updatedPlayer.attributes.passing = Math.max(30, updatedPlayer.attributes.passing - techDecay);
                     updatedPlayer.attributes.dribbling = Math.max(30, updatedPlayer.attributes.dribbling - techDecay);
                     updatedPlayer.attributes.finishing = Math.max(30, updatedPlayer.attributes.finishing - techDecay);
                     updatedPlayer.attributes.tackling = Math.max(30, updatedPlayer.attributes.tackling - techDecay);
                  }

                  // 3. Mental attributes Wisdom Boost (gain experience!)
                  updatedPlayer.attributes.composure = Math.min(99, updatedPlayer.attributes.composure + 2);
                  updatedPlayer.attributes.vision = Math.min(99, updatedPlayer.attributes.vision + 1);

                  // Recalculate OVR
                  updatedPlayer.ovr = calculateOVR(updatedPlayer.attributes, updatedPlayer.position);

                  // Construct dynamic descriptive inbox item
                  const lifestyleAids = [];
                  if (updatedPlayer.lifestyleTier?.training === 'Elite') lifestyleAids.push("Elite Facilities");
                  if (updatedPlayer.lifestyleTier?.housing === 'Mansion') lifestyleAids.push("Mansion recovery pool");
                  if (updatedPlayer.lifestyleTier?.nutrition === 'Private Chef') lifestyleAids.push("Private Chef diet");
                  const activeAidDesc = lifestyleAids.length > 0 
                     ? ` Your investments in ${lifestyleAids.join(', ')} helped cushion the decay.` 
                     : " Basic facilities offered no protection against athletic decay.";

                  newInbox.push({
                     id: `decline_${Date.now()}`,
                     sender: 'PHYSIO',
                     subject: 'End of Season Physical Review',
                     content: `Annual medical assessment is ready. At age ${updatedPlayer.age}, we are observing biological decay in physical metrics (Pace -${paceDecay}, Stamina -${staminaDecay}).${activeAidDesc} Crucially, your match intelligence and game reading have grown (Composure +2, Vision +1). Our advice: shift from raw physical exploits to smart positioning.`,
                     read: false,
                     type: 'SPORTING',
                     timestamp: 'MON 09:00',
                     choices: [{ text: 'I understand. Will adjust my style.', type: 'ack' }]
                  });
               }

               // Retirement Pathway
               if (updatedPlayer.age >= 33 && !updatedPlayer.stateFlags?.retired) {
                   newInbox.push({
                        id: `retirement_${Date.now()}`,
                        sender: 'AGENT',
                        subject: 'Retirement Thoughts?',
                        content: `You've had an incredible career. You are ${updatedPlayer.age} now, and the physical grind is demanding more than ever. Have you thought about hanging up the boots at the end of next season, or will you stay to pursue remaining records?`,
                        read: false,
                        type: 'NEWS',
                        timestamp: 'MON 10:00',
                        choices: [
                           { text: 'Retire Gracefully', type: 'retire_graceful' },
                           { text: 'Seek Coaching Role', type: 'retire_coach' },
                           { text: 'Stay to Pursue Records', type: 'retire_pursue_records' }
                        ]
                   });
               }
            }
         }

         // System 8: Loan Move trigger and Sponsorship proposal trigger
         if (updatedPlayer) {
           const finalPlayer_tmp = updatedPlayer;
           if (finalPlayer_tmp.currentClubSymbol !== 'FA') {
             const wasBenched = finalPlayer_tmp.stateFlags?.openThreads?.wasBenched || false;
             const isTransferListed = finalPlayer_tmp.transferListed || false;
             
             if ((wasBenched || isTransferListed) && Math.random() > 0.4) {
               const currentClub = finalPlayer_tmp.currentClubSymbol;
               const possibleHostClubs = CLUBS.filter(c => c.symbol !== currentClub && c.symbol !== 'FA');
               const chosenClub = possibleHostClubs[Math.floor(Math.random() * possibleHostClubs.length)];
               
               if (chosenClub) {
                 newInbox.push({
                   id: `loan_offer_${Date.now()}`,
                   sender: 'SPORTING DIRECTOR',
                   subject: `LOAN OFFER: ${chosenClub.name} Interest`,
                   content: `We see you are not getting the playing minutes you deserve at ${currentClub}. We want to sign you on a loan deal until the end of the season. We guarantee playing time, and we'll split your wage payments. Let's discuss terms!`,
                   read: false,
                   type: 'CONTRACT',
                   timestamp: 'MON 08:30',
                   choices: [
                     { 
                       text: `Negotiate Loan with ${chosenClub.symbol}`, 
                       type: 'loan_accept_negotiate', 
                       clubSymbol: chosenClub.symbol, 
                       wage: Math.floor(finalPlayer_tmp.contract.wage * 0.9)
                     },
                     { text: 'Reject Offer', type: 'ack' }
                   ]
                 });
               }
             }
           }

           // Sponsorship Proposal Trigger
           const hasSponsor = !!finalPlayer_tmp.stateFlags?.activeSponsorship;
           if (!hasSponsor && finalPlayer_tmp.reputation?.world > 25 && Math.random() > 0.4) {
             const sponsorBrands = ["Nike", "Adidas", "Puma", "Red Bull", "Under Armour"];
             const chosenSponsor = sponsorBrands[Math.floor(Math.random() * sponsorBrands.length)];
             
             newInbox.push({
               id: `sponsor_offer_${Date.now()}`,
               sender: 'COMMERCIAL AGENT',
               subject: `BUSINESS: Endorsement Deal from ${chosenSponsor}`,
               content: `A marketing executive from ${chosenSponsor} reached out to us! They've been monitoring your rise in global football reputation and want you to be the face of their next campaign. Let's get to the bargaining table!`,
               read: false,
               type: 'CONTRACT',
               timestamp: 'MON 09:15',
               choices: [
                 { 
                   text: `Negotiate Partnership with ${chosenSponsor}`, 
                   type: 'sponsorship_negotiate', 
                   sponsorName: chosenSponsor 
                 },
                 { text: 'Decline Proposal', type: 'ack' }
               ]
             });
           }
         }

         let finalPlayer = updatedPlayer;
        if (finalPlayer) {
          const tierResult = checkFinancialTierUp(finalPlayer);
          if (tierResult.upgraded) {
            finalPlayer = {
              ...finalPlayer,
              stateFlags: {
                ...finalPlayer.stateFlags,
                highestFinancialTier: tierResult.nextTier
              }
            };
            newInbox.push({
              id: `financial_tier_up_${Date.now()}`,
              sender: 'FINANCIAL ADVISOR',
              subject: `TIER UNLOCKED: ${tierResult.nextTier.toUpperCase()}`,
              content: tierResult.message || '',
              read: false,
              type: 'NEWS',
              timestamp: 'MON 08:00',
              choices: [{ text: 'Great, thank you.', type: 'ack' }]
            });
          }
        }

        return {
          ...s,
          currentDay: nextDay,
          currentWeek: nextWeek,
          activeEvent: newEvent,
          player: finalPlayer,
          inbox: newInbox.map(tagInboxMessagePriority),
          nextMatch: nextMatch,
          seasonCalendar: newSeasonCalendar,
          season: newSeason,
          worldState: newWorldState,
          npcRegistry: updatedNpcRegistry,
          totwHistory: totwAndPotmUpdates ? totwAndPotmUpdates.totwHistory : s.totwHistory,
          potmHistory: totwAndPotmUpdates ? totwAndPotmUpdates.potmHistory : s.potmHistory,
          seasonAwardsHistory: awardsUpdates ? awardsUpdates.seasonAwardsHistory : s.seasonAwardsHistory,
          pendingAwardsCeremony: awardsUpdates ? awardsUpdates.pendingAwardsCeremony : s.pendingAwardsCeremony,
          screen: awardsUpdates?.screen || s.screen
        };
      }
    });
  };

  const updateRelationship = (entity: keyof Player['relationships'], amount: number) => {
    setState(s => {
      if (!s.player) return s;
      const current = s.player.relationships[entity];
      return {
        ...s,
        player: {
          ...s.player,
          relationships: {
            ...s.player.relationships,
            [entity]: Math.min(100, Math.max(0, current + amount))
          }
        }
      };
    });
  };

  const setInbox = (inbox: InboxMessage[]) => setState(s => ({ ...s, inbox: inbox.map(tagInboxMessagePriority) }));
  const updateCalendar = (entries: CalendarEntry[]) => setState(s => ({ ...s, seasonCalendar: entries }));

  React.useEffect(() => {
    if (state.player && settings.autoSave) {
      const slotKey = state.saveSlot ? `rtg_careersave_${state.saveSlot}` : 'rtg_careersave_1';
      saveGameStateAsync(slotKey, state).catch(e => {
        console.error("Auto-save failed", e);
      });
    }
  }, [state, settings.autoSave]);

  const loadSavedGame = async (slot: number): Promise<boolean> => {
    try {
      let parsed = await loadGameStateAsync(`rtg_careersave_${slot}`);
      if (parsed && parsed.player) {
          // Apply Save Migration & Versioning Engine
          parsed = migrateSaveData(parsed);

          if (parsed.inbox) {
            parsed.inbox = parsed.inbox.map(tagInboxMessagePriority);
          }

          // Defensive initialization of new properties
          if (parsed.player.ceiling === undefined) {
            parsed.player.ceiling = Math.min(99, parsed.player.ovr + 15);
          }
          if (!parsed.player.scoutReports) {
            parsed.player.scoutReports = [];
          }
          if (!parsed.player.physicalCondition) {
            parsed.player.physicalCondition = {
              value: 100,
              tier: 'PEAK',
              effects: { statPenalty: 0, injuryRisk: 0 },
              matchFitness: 75,
              recoveryDebt: 0,
              injurySusceptibility: 5
            };
          } else {
            if (parsed.player.physicalCondition.matchFitness === undefined) {
              parsed.player.physicalCondition.matchFitness = 75;
            }
            if (parsed.player.physicalCondition.recoveryDebt === undefined) {
              parsed.player.physicalCondition.recoveryDebt = 0;
            }
            if (parsed.player.physicalCondition.injurySusceptibility === undefined) {
              parsed.player.physicalCondition.injurySusceptibility = 5;
            }
          }
          if (!parsed.player.recoveryProfile || parsed.player.recoveryProfile.activeBonuses === undefined) {
            parsed.player.recoveryProfile = {
              tier: 'BASIC',
              speed: 15,
              daysToPeak: 0,
              activeBonuses: []
            };
          }
          if (!parsed.player.journalists) {
            parsed.player.journalists = [
              {
                id: 'journo_alfie',
                name: 'Alfie Grealish',
                type: 'PROVOCATEUR',
                relationship: 25,
                tier: 'ENEMY',
                history: ['Asked an aggressive tabloid question before your debut.']
              },
              {
                id: 'journo_marcus',
                name: 'Marcus Sterling',
                type: 'INSIDER',
                relationship: 50,
                tier: 'NEUTRAL',
                history: ['Neutral profile reporter for Sky Sports.']
              },
              {
                id: 'journo_elena',
                name: 'Elena Rostova',
                type: 'FAN',
                relationship: 70,
                tier: 'FRIEND',
                history: ['Co-host of the local club fan channel.']
              }
            ];
          }
          if (!parsed.player.matchAnalysis) {
            parsed.player.matchAnalysis = [];
          }
          if (!parsed.player.dressingRoomEvents) {
            parsed.player.dressingRoomEvents = [];
          }
          if (!parsed.player.rivals) {
            parsed.player.rivals = [];
          }
          if (!parsed.player.trophies) {
            parsed.player.trophies = [];
          }
          if (!parsed.player.agentType) {
            parsed.player.agentType = 'NEGOTIATOR';
          }
          if (!parsed.player.financialEmpire) {
            parsed.player.financialEmpire = {
              netWorth: 0,
              cashBalance: 0,
              investments: [],
              businesses: [],
              stocks: { value: 0, annualReturnRate: 0.06 },
              crypto: {
                value: 0,
                currentPrice: 1.25,
                coinsHeld: 0,
                rollingFourWeekDrawdown: 0.0
              },
              stage: 'ROOKIE',
              lastPayoutDate: ''
            };
          }
          if (parsed.player.mentalFatigue === undefined) {
            parsed.player.mentalFatigue = 15;
            parsed.player.mentalFatigueDetails = getMentalFatigueLevel(15);
          }
          if (parsed.player.isInjured && !parsed.player.rehabProcess) {
            parsed.player.rehabProcess = initializeActiveRehab(
              parsed.player.injuryName || 'Muscle Strain',
              parsed.player.injuryWeeksLeft || 2
            );
          }
          setState({
            ...parsed,
            saveSlot: slot,
            screen: 'HUB'
          });
          return true;
        }
    } catch (e) {
      console.error("Failed to load save", e);
    }
    return false;
  };

  const newGame = (slot: number) => {
    setState({
      screen: 'CREATION',
      player: null,
      season: 1,
      currentWeek: 1,
      currentDay: 'MON',
  activeCutscene: null,
  unlockedCutscenes: [],
  storyFlags: {},
      activeEvent: null,
      inbox: [],
      seasonCalendar: [],
      nextMatch: undefined,
      saveSlot: slot
    });
  };

  const advanceRehabPacing = (pacingChoice: 'PUSH_HARD' | 'RECOMMENDED' | 'CAUTIOUS') => {
    setState(s => {
      if (!s.player || !s.player.isInjured) return s;
      const { updatedPlayer, inboxMessages, timelineEvents } = processWeeklyRehabStep(s.player, pacingChoice);
      const newInbox = [...s.inbox, ...inboxMessages];
      const newTimeline = [...(updatedPlayer.timeline || []), ...timelineEvents];
      return {
        ...s,
        player: {
          ...updatedPlayer,
          timeline: newTimeline
        },
        inbox: newInbox
      };
    });
  };

  const reduceMentalFatigue = (amount: number, activityName: string) => {
    setState(s => {
      if (!s.player) return s;
      const updatedPlayer = applyLifestyleMentalFatigueRecovery(s.player, amount, activityName);
      return {
        ...s,
        player: updatedPlayer
      };
    });
  };

  const startLegacyContinuation = (prospectId?: string) => {
    setState(s => createLegacyContinuation(s, prospectId));
  };

  const saveAndQuit = async () => {
    const slotKey = state.saveSlot ? `rtg_careersave_${state.saveSlot}` : 'rtg_careersave_1';
    await saveGameStateAsync(slotKey, state);
    setState(s => ({ ...s, screen: 'MAIN_MENU' }));
  };

  return (
    <GameContext.Provider value={{ settings, updateSettings, resetData, state, setScreen, setPlayer, startCareer, advanceDay, checkCutscenes, resolveCutscene, resolveEvent, updateRelationship, setInbox, loadSavedGame, newGame, saveAndQuit, updateCalendar, updateNextMatch, advanceRehabPacing, reduceMentalFatigue, startLegacyContinuation }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}

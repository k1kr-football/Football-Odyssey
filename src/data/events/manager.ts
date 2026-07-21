import { Player, DailyEvent } from '../../types';
import { GameState } from '../../store/GameContext';

export interface EventDefinition {
  id: string;
  title: string;
  description: (state: GameState) => string;
  category: string;
  isEligible: (state: GameState) => boolean;
  choices: EventChoiceDef[];
}

export interface EventChoiceDef {
  text: string;
  effect: ((state: GameState) => Partial<GameState>) | Record<string, number>; // Return diff or modifiers
}

export const managerEvents: EventDefinition[] = [
  {
    id: "mgr_tactical_debrief",
    title: "Tactical Debrief",
    category: "MANAGER",
    description: (s) => "The gaffer calls you in following your Man of the Match performance. \"Brilliant out there. You read the system perfectly.\"",
    isEligible: (s) => !!s.player && (s.player.form > 85) && (s.player.relationships.manager >= 60) && (!s.player.stateFlags.eventCooldowns['mgr_tactical_debrief']),
    choices: [
      {
        text: "Credit the system and teammates.",
        effect: (s) => {
          if (!s.player) return {};
          return {
            player: { ...s.player, relationships: { ...s.player.relationships, manager: s.player.relationships.manager + 5, teammates: s.player.relationships.teammates + 5 }, stateFlags: { ...s.player.stateFlags, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'mgr_tactical_debrief': s.currentWeek + 10 } } }
          };
        }
      },
      {
        text: "Credit personal preparation.",
        effect: (s) => {
          if (!s.player) return {};
          return {
            player: { ...s.player, relationships: { ...s.player.relationships, manager: s.player.relationships.manager + 5 }, stateFlags: { ...s.player.stateFlags, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'mgr_tactical_debrief': s.currentWeek + 10 } } }
          };
        }
      },
      {
        text: "Ask for more creative freedom.",
        effect: (s) => {
          if (!s.player) return {};
          return {
            player: { ...s.player, stateFlags: { ...s.player.stateFlags, openThreads: { ...s.player.stateFlags.openThreads, 'tactical_tweak_requested': s.currentWeek }, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'mgr_tactical_debrief': s.currentWeek + 10 } } }
          };
        }
      }
    ]
  },
  {
    id: "mgr_missed_session",
    title: "Missed Session Fallout",
    category: "MANAGER",
    description: (s) => "You missed a mandatory team meeting. The manager is waiting in his office, looking extremely disappointed.",
    isEligible: (s) => !!s.player && s.player.stateFlags.historyFlags['missed_training_flag'] && !s.player.stateFlags.historyFlags['missed_training_resolved'],
    choices: [
      {
        text: "Apologize, cite a genuine reason.",
        effect: (s) => {
          if (!s.player) return {};
          return {
            player: { ...s.player, relationships: { ...s.player.relationships, manager_discipline: s.player.relationships.manager_discipline - 5 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'missed_training_resolved': true, 'missed_training_flag': false } } }
          };
        }
      },
      {
        text: "Push back on the session necessity.",
        effect: (s) => {
          if (!s.player) return {};
          return {
            player: { ...s.player, relationships: { ...s.player.relationships, manager_discipline: s.player.relationships.manager_discipline - 15 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'attitude_flag': true, 'missed_training_resolved': true, 'missed_training_flag': false } } }
          };
        }
      },
      {
        text: "Stay silent, accept fine.",
        effect: (s) => {
          if (!s.player) return {};
          return {
            player: { ...s.player, finances: { ...s.player.finances, balance: s.player.finances.balance - 1000 }, relationships: { ...s.player.relationships, manager_discipline: s.player.relationships.manager_discipline - 10 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'missed_training_resolved': true, 'missed_training_flag': false } } }
          };
        }
      }
    ]
  },
  {
    id: "mgr_where_do_i_stand",
    title: "Where Do I Stand?",
    category: "MANAGER",
    description: (s) => "Your perceived standing in the squad has recently dropped. The uncertainty is bothering you.",
    isEligible: (s) => !!s.player && s.player.stateFlags.historyFlags['hierarchy_dropped_recently'] && !s.player.stateFlags.eventCooldowns['mgr_where_do_i_stand'],
    choices: [
      {
        text: "Request a direct explanation.",
        effect: (s) => {
          if (!s.player) return {};
          return {
            player: { ...s.player, relationships: { ...s.player.relationships, manager: s.player.relationships.manager + 2 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'hierarchy_dropped_recently': false }, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'mgr_where_do_i_stand': s.currentWeek + 10 } } }
          };
        }
      },
      {
        text: "Accept silently and let form speak.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'hierarchy_dropped_recently': false }, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'mgr_where_do_i_stand': s.currentWeek + 10 } } }
          };
        }
      },
      {
        text: "Express frustration.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, relationships: { ...s.player.relationships, manager: s.player.relationships.manager - 5 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'frustrated_flag': true, 'hierarchy_dropped_recently': false }, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'mgr_where_do_i_stand': s.currentWeek + 10 } } }
          };
        }
      }
    ]
  },
  {
    id: "mgr_captaincy_approach",
    title: "Captaincy Approach",
    category: "MANAGER",
    description: (s) => "\"I want you to take the armband,\" the manager says, sliding it across the desk.",
    isEligible: (s) => !!s.player && (s.player.contract.status === 'Key Player' || s.player.contract.status === 'Star Player' || s.player.contract.status === 'Club Legend') && s.player.relationships.manager_discipline >= 75 && !s.player.stateFlags.historyFlags['captaincy_offered'],
    choices: [
      {
        text: "Accept enthusiastically.",
        effect: (s) => {
          if (!s.player) return {};
          return {
            player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'is_captain': true, 'captaincy_offered': true }, openThreads: { ...s.player.stateFlags.openThreads, 'captaincy_test': s.currentWeek + 4 } } }
          };
        }
      },
      {
        text: "Decline, citing focus on performance.",
        effect: (s) => {
          if (!s.player) return {};
          return {
            player: { ...s.player, relationships: { ...s.player.relationships, manager: s.player.relationships.manager + 5 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'captaincy_offered': true } } }
          };
        }
      }
    ]
  }
];

import { EventDefinition } from './manager';

export const teammateEvents: EventDefinition[] = [
  {
    id: "tm_welcome",
    title: "The Welcome",
    category: "TEAMMATE",
    description: (s) => "A senior professional in the squad pulls you aside after training. \"Here's how things work around here.\"",
    isEligible: (s) => !!s.player && s.currentWeek < 4 && !s.player.stateFlags.historyFlags['welcome_done'] && s.player.relationships.teammates > 30,
    choices: [
      {
        text: "Accept guidance openly.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, relationships: { ...s.player.relationships, teammates: s.player.relationships.teammates + 10 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'welcome_done': true }, openThreads: { ...s.player.stateFlags.openThreads, 'mentoring_opportunity': s.currentWeek + 2 } } }
          };
        }
      },
      {
        text: "Keep distance, prove yourself first.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'welcome_done': true } } }
          };
        }
      },
      {
        text: "Ask direct questions about squad politics.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'welcome_done': true, 'politics_revealed': true } } }
          };
        }
      }
    ]
  },
  {
    id: "tm_clique_invitation",
    title: "Clique Invitation",
    category: "TEAMMATE",
    description: (s) => "You're invited to a private dinner by one specific group in the dressing room. You know this might alienate the others.",
    isEligible: (s) => !!s.player && s.player.stateFlags.historyFlags['politics_revealed'] && !s.player.stateFlags.historyFlags['clique_choice_made'],
    choices: [
      {
        text: "Join this group.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, relationships: { ...s.player.relationships, teammates: s.player.relationships.teammates + 5 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'clique_choice_made': true, 'alienated_rivals': true } } }
          };
        }
      },
      {
        text: "Decline, stay neutral.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'clique_choice_made': true } } }
          };
        }
      },
      {
        text: "Try to bridge both sides.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, relationships: { ...s.player.relationships, teammates: s.player.relationships.teammates + 2 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'clique_choice_made': true, 'bridge_builder': true } } }
          };
        }
      }
    ]
  },
  {
    id: "tm_falling_out",
    title: "Falling Out",
    category: "TEAMMATE",
    description: (s) => "Tensions boiled over after a recent mistake. A teammate is actively blanking you.",
    isEligible: (s) => !!s.player && s.player.stateFlags.historyFlags['dressing_room_tension'] && !s.player.stateFlags.openThreads['reconciliation'],
    choices: [
      {
        text: "Address it directly, privately.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'dressing_room_tension': false }, openThreads: { ...s.player.stateFlags.openThreads, 'reconciliation': s.currentWeek + 2 } } }
          };
        }
      },
      {
        text: "Let it pass.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, relationships: { ...s.player.relationships, teammates: s.player.relationships.teammates - 10 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'dressing_room_tension': false } } }
          };
        }
      },
      {
        text: "Escalate to the manager.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, relationships: { ...s.player.relationships, teammates: s.player.relationships.teammates - 15 }, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'dressing_room_tension': false, 'manager_aware_of_conflict': true } } }
          };
        }
      }
    ]
  }
];

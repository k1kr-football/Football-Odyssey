import { EventDefinition } from './manager';

export const agentEvents: EventDefinition[] = [
  {
    id: "ag_renewal_approach",
    title: "Renewal Approach",
    category: "AGENT",
    description: (s) => "Your agent calls. \"Your form is great. We need to talk about your contract before the window opens.\"",
    isEligible: (s) => !!s.player && s.player.form > 80 && !s.player.stateFlags.openThreads['contract_renewal'],
    choices: [
      {
        text: "Express interest in staying, ask for fair terms.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, openThreads: { ...s.player.stateFlags.openThreads, 'contract_renewal': s.currentWeek + 2 } } }
          };
        }
      },
      {
        text: "Push hard for star wages.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'pushed_for_star_wages': true }, openThreads: { ...s.player.stateFlags.openThreads, 'contract_renewal': s.currentWeek + 3 } } }
          };
        }
      },
      {
        text: "Stay quiet, let it ride.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'contract_stalling': true } } }
          };
        }
      }
    ]
  },
  {
    id: "ag_rumor_relay",
    title: "Rumor Relay",
    category: "AGENT",
    description: (s) => "I'm hearing whispers a big club is preparing a bid. How do you want to handle this?",
    isEligible: (s) => !!s.player && s.player.stateFlags.historyFlags['transfer_rumor_active'] && !s.player.stateFlags.eventCooldowns['ag_rumor_relay'],
    choices: [
      {
        text: "Ask agent to explore it.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'exploring_transfer': true }, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'ag_rumor_relay': s.currentWeek + 10 } } }
          };
        }
      },
      {
        text: "Tell agent to shut it down publicly.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, fans: s.player.fans + 10, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'transfer_rumor_active': false }, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'ag_rumor_relay': s.currentWeek + 10 } } }
          };
        }
      },
      {
        text: "Ignore and stay focused.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'ag_rumor_relay': s.currentWeek + 8 } } }
          };
        }
      }
    ]
  }
];

import { EventDefinition } from './manager';

export const mediaEvents: EventDefinition[] = [
  {
    id: "med_milestone_watch",
    title: "Milestone Watch",
    category: "PRESS",
    description: (s) => "You're nearing a major statistically milestone. The press are asking how much it weighs on your mind.",
    isEligible: (s) => !!s.player && !!s.player.stateFlags?.historyFlags?.['nearing_milestone'] && !s.player.stateFlags?.eventCooldowns?.['med_milestone_watch'],
    choices: [
      {
        text: "Engage warmly with the milestone talk.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, fans: s.player.fans + 5, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'milestone_pressure': true }, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'med_milestone_watch': s.currentWeek + 10 } } }
          };
        }
      },
      {
        text: "Deflect, deflate the pressure.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'milestone_pressure': false }, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'med_milestone_watch': s.currentWeek + 10 } } }
          };
        }
      },
      {
        text: "Set a personal target publicly.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, fans: s.player.fans + 10, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'milestone_pressure_extreme': true }, eventCooldowns: { ...s.player.stateFlags.eventCooldowns, 'med_milestone_watch': s.currentWeek + 10 } } }
          };
        }
      }
    ]
  },
  {
    id: "bs_fallen_prodigy_1",
    title: "The Old Headlines",
    category: "PRESS",
    description: (s) => "A long-form journalist implies you're just a shadow of your pre-injury youthful self. This touches on your history.",
    isEligible: (s) => !!s.player && s.player.backstory === 'FALLEN_PRODIGY' && s.currentWeek >= 8 && !s.player.stateFlags?.historyFlags?.['redemption_arc_started'],
    choices: [
      {
        text: "Address the past directly.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'redemption_arc_started': true }, openThreads: { ...s.player.stateFlags.openThreads, 'redemption_arc_followup': s.currentWeek + 8 } } }
          };
        }
      },
      {
        text: "Refuse to discuss it.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'redemption_arc_started': true, 'press_feud_started': true } } }
          };
        }
      },
      {
        text: "Let actions on the pitch do the talking.",
        effect: (s) => {
          if (!s.player) return {};
          return {
             player: { ...s.player, stateFlags: { ...s.player.stateFlags, historyFlags: { ...s.player.stateFlags.historyFlags, 'redemption_arc_started': true } } }
          };
        }
      }
    ]
  }
];

import { GameState } from '../../store/GameContext';
import { EventDefinition } from './manager';

export const dynamicEvents: EventDefinition[] = [
  {
    id: 'MEDIA_DAY',
    title: 'Pre-Match Media Day 🎙️',
    description: (state: GameState) => `The press room is packed. Journalists are eager to hear your thoughts on the upcoming fixtures and your personal form.`,
    category: 'MEDIA',
    isEligible: (state: GameState) => Math.random() < 0.15 && state.currentWeek > 2,
    choices: [
      { text: 'Praise the team and manager (+5 Trust, -2 Rep)', effect: (s) => ({ player: { ...s.player, trust: Math.min(100, s.player.trust + 5), reputation: { ...s.player.reputation, world: Math.max(0, s.player.reputation.world - 2) } } }) },
      { text: 'Give a bold, confident statement (+5 Rep, -2 Trust)', effect: (s) => ({ player: { ...s.player, trust: Math.max(0, s.player.trust - 2), reputation: { ...s.player.reputation, world: Math.min(100, s.player.reputation.world + 5) } } }) },
      { text: 'Give generic answers (No effect)', effect: (s) => ({}) }
    ]
  },
  {
    id: 'FAN_EVENT',
    title: 'Supporters Club Meet & Greet ✍️',
    description: (state: GameState) => `The club has scheduled you for a fan signing session downtown. Hundreds of supporters have queued up.`,
    category: 'MEDIA',
    isEligible: (state: GameState) => Math.random() < 0.10 && state.player!.fans > 100,
    choices: [
      { text: 'Stay late to sign everything (+15 Fans, -5 Fatigue)', effect: (s) => ({ player: { ...s.player, fans: Math.min(100, s.player.fans + 15), fatigue: Math.min(100, s.player.fatigue + 5) } }) },
      { text: 'Do the minimum required time (+5 Fans)', effect: (s) => ({ player: { ...s.player, fans: Math.min(100, s.player.fans + 5) } }) }
    ]
  },
  {
    id: 'CHARITY_EVENT',
    title: 'Club Foundation Gala 🎗️',
    description: (state: GameState) => `You've been invited to attend the annual club charity gala to raise funds for local hospitals.`,
    category: 'MEDIA',
    isEligible: (state: GameState) => Math.random() < 0.05 && state.currentWeek === 15,
    choices: [
      { text: 'Attend and donate generously (+10 Rep, +10 Morale, -Wages)', effect: (s) => ({ player: { ...s.player, morale: Math.min(100, s.player.morale + 10), reputation: { ...s.player.reputation, world: Math.min(100, s.player.reputation.world + 10) }, finances: { ...s.player.finances, balance: s.player.finances.balance - 1000 } } }) },
      { text: 'Send a polite video message (+2 Rep)', effect: (s) => ({ player: { ...s.player, reputation: { ...s.player.reputation, world: Math.min(100, s.player.reputation.world + 2) } } }) }
    ]
  },
  {
    id: 'TEAM_BONDING',
    title: 'Team Bonding Dinner 🍕',
    description: (state: GameState) => `The captain has organized a team dinner at a local Italian restaurant to boost squad morale.`,
    category: 'TEAM',
    isEligible: (state: GameState) => Math.random() < 0.10 && state.player!.relationships.teammates < 60,
    choices: [
      { text: 'Go and pay the bill for everyone (+15 Teammates, -Wages)', effect: (s) => ({ player: { ...s.player, relationships: { ...s.player.relationships, teammates: Math.min(100, s.player.relationships.teammates + 15) }, finances: { ...s.player.finances, balance: s.player.finances.balance - 2000 } } }) },
      { text: 'Go and mingle (+5 Teammates)', effect: (s) => ({ player: { ...s.player, relationships: { ...s.player.relationships, teammates: Math.min(100, s.player.relationships.teammates + 5) } } }) },
      { text: 'Politely decline to focus on recovery (-5 Teammates, -5 Fatigue)', effect: (s) => ({ player: { ...s.player, relationships: { ...s.player.relationships, teammates: Math.max(0, s.player.relationships.teammates - 5) }, fatigue: Math.max(0, s.player.fatigue - 5) } }) }
    ]
  },
  {
    id: 'AD_SHOOT',
    title: 'Sponsor Ad Shoot 📸',
    description: (state: GameState) => `Your agent has booked a lucrative commercial shoot for a new boot sponsor on your day off.`,
    category: 'AGENT',
    isEligible: (state: GameState) => Math.random() < 0.08 && state.player!.reputation.world > 50,
    choices: [
      { text: 'Do the shoot (+Money, +10 Fatigue)', effect: (s) => ({ player: { ...s.player, fatigue: Math.min(100, s.player.fatigue + 10), finances: { ...s.player.finances, balance: s.player.finances.balance + 5000 } } }) },
      { text: 'Cancel it. Football comes first. (-2 Rep, -5 Fatigue)', effect: (s) => ({ player: { ...s.player, fatigue: Math.max(0, s.player.fatigue - 5), reputation: { ...s.player.reputation, world: Math.max(0, s.player.reputation.world - 2) } } }) }
    ]
  },
  {
    id: 'NIGHT_OUT',
    title: 'Late Night Out 🌃',
    description: (state: GameState) => `A few teammates are heading to a VIP club in the city. They want you to come along.`,
    category: 'TEAM',
    isEligible: (state: GameState) => Math.random() < 0.12 && state.currentDay === 'SAT', // usually after a match
    choices: [
      { text: 'Go out and party hard (+15 Morale, +20 Fatigue, -5 Trust)', effect: (s) => ({ player: { ...s.player, morale: Math.min(100, s.player.morale + 15), fatigue: Math.min(100, s.player.fatigue + 20), trust: Math.max(0, s.player.trust - 5) } }) },
      { text: 'Just one drink (+5 Morale, +5 Fatigue)', effect: (s) => ({ player: { ...s.player, morale: Math.min(100, s.player.morale + 5), fatigue: Math.min(100, s.player.fatigue + 5) } }) },
      { text: 'Stay home and rest (-10 Fatigue)', effect: (s) => ({ player: { ...s.player, fatigue: Math.max(0, s.player.fatigue - 10) } }) }
    ]
  },
  {
    id: 'TACTICAL_WORKSHOP',
    title: 'Tactical Workshop 🧠',
    description: (state: GameState) => `The manager has called you in for a one-on-one video analysis session to go over your recent positioning.`,
    category: 'MANAGER',
    isEligible: (state: GameState) => Math.random() < 0.10 && state.player!.form < 60,
    choices: [
      { text: 'Pay close attention (+5 Trust)', effect: (s) => ({ player: { ...s.player, trust: Math.min(100, s.player.trust + 5) } }) }, // Ideally gives tactical awareness, but trust is good
      { text: 'Nod along but zone out (No effect)', effect: (s) => ({}) }
    ]
  }
];

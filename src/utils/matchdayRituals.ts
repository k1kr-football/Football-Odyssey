import { Player } from '../types';

export const RITUALS = [
  { id: 'left_boot_first', name: 'Left Boot First', description: 'Always tie the left boot first. Small composure boost pre-match.', effect: '+5 Composure' },
  { id: 'last_out_tunnel', name: 'Last Out the Tunnel', description: 'Make sure you are the last player out. Small morale boost pre-match.', effect: '+5 Morale' },
  { id: 'touch_crossbar', name: 'Touch the Crossbar', description: 'Jump and touch the crossbar before kickoff. Small stamina boost.', effect: '+5 Stamina' },
];

export function applyMatchdayRitual(player: Player): Player {
  const p = { ...player };
  if (!p.matchdayRitual || !p.matchdayRitual.active) return p;

  if (Math.random() < 0.1) {
    // Ritual disrupted
    p.morale = Math.max(0, p.morale - 5);
    p.stateFlags = {
      ...p.stateFlags,
      openThreads: {
        ...(p.stateFlags?.openThreads || {}),
        ritualDisrupted: true
      }
    };
  } else {
    // Ritual successful
    if (p.matchdayRitual.name === 'Left Boot First') {
      p.attributes = { ...p.attributes, composure: Math.min(100, p.attributes.composure + 5) };
    } else if (p.matchdayRitual.name === 'Last Out the Tunnel') {
      p.morale = Math.min(100, p.morale + 5);
    } else if (p.matchdayRitual.name === 'Touch the Crossbar') {
      p.attributes = { ...p.attributes, stamina: Math.min(100, p.attributes.stamina + 5) };
    }
  }

  return p;
}

import { GameState } from '../store/GameContext';
import { DailyObjective, Attributes } from '../types';

const OBJECTIVE_POOL: Omit<DailyObjective, 'id' | 'completed' | 'dateAssigned'>[] = [
  {
    title: 'Perform 20 extra drills',
    description: 'Stay late on the pitch to drill high-intensity finishing and ball control repetitions.',
    category: 'DRILLS',
    durationText: '25 mins',
    timeLimited: true,
    statBoost: {
      attribute: 'finishing',
      amount: 1,
      sharpness: 3,
      fatigue: 4,
    },
  },
  {
    title: 'Spend 30 mins reading tactical books',
    description: 'Study opposition pressing triggers and positional spacing in the manager analysis suite.',
    category: 'TACTICAL',
    durationText: '30 mins',
    timeLimited: true,
    statBoost: {
      attribute: 'tacticalAwareness',
      amount: 1,
      trust: 2,
    },
  },
  {
    title: 'Hydrate & 20 min Ice Bath session',
    description: 'Immerse in cold therapy to clear muscle lactic acid and accelerate recovery.',
    category: 'RECOVERY',
    durationText: '20 mins',
    timeLimited: true,
    statBoost: {
      fatigue: -12,
      morale: 3,
    },
  },
  {
    title: 'Study opponent match footage',
    description: 'Break down tape of your direct opponent defender to spot positional tendencies.',
    category: 'TACTICAL',
    durationText: '20 mins',
    timeLimited: true,
    statBoost: {
      attribute: 'vision',
      amount: 1,
      sharpness: 2,
    },
  },
  {
    title: 'Practice 50 dead-ball set pieces',
    description: 'Calibrate free kicks and corner deliveries from various angles around the box.',
    category: 'DRILLS',
    durationText: '25 mins',
    timeLimited: true,
    statBoost: {
      attribute: 'composure',
      amount: 1,
      sharpness: 4,
    },
  },
  {
    title: 'Squad table tennis & lounge bonding',
    description: 'Organize an informal tournament in the player lounge to build dressing room morale.',
    category: 'BONDING',
    durationText: '35 mins',
    timeLimited: true,
    statBoost: {
      morale: 6,
      trust: 2,
    },
  },
  {
    title: 'Core & mobility routine',
    description: 'Work with the physical trainer on hip flexibility, core stability, and agility ladders.',
    category: 'FITNESS',
    durationText: '25 mins',
    timeLimited: true,
    statBoost: {
      attribute: 'agility',
      amount: 1,
      fatigue: 3,
    },
  },
];

export function generateDailyObjectives(currentDateStr: string): DailyObjective[] {
  // Shuffle pool and pick 3 distinct items
  const shuffled = [...OBJECTIVE_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  return selected.map((obj, idx) => ({
    id: `daily_quest_${Date.now()}_${idx}`,
    title: obj.title,
    description: obj.description,
    category: obj.category,
    durationText: obj.durationText,
    timeLimited: true,
    statBoost: obj.statBoost,
    completed: false,
    dateAssigned: currentDateStr,
  }));
}

export function ensurePlayerDailyObjectives(state: GameState): DailyObjective[] {
  if (!state.player) return [];
  const currentDateStr = `Year ${state.season} - Week ${state.currentWeek} - Day ${state.currentDay}`;

  if (
    !state.player.dailyObjectives ||
    state.player.dailyObjectives.length === 0 ||
    state.player.lastDailyObjectiveDate !== currentDateStr
  ) {
    const fresh = generateDailyObjectives(currentDateStr);
    state.player.dailyObjectives = fresh;
    state.player.lastDailyObjectiveDate = currentDateStr;
    return fresh;
  }

  return state.player.dailyObjectives;
}

export function completeDailyObjective(
  state: GameState,
  objectiveId: string
): { success: boolean; message: string; questTitle: string } {
  if (!state.player || !state.player.dailyObjectives) {
    return { success: false, message: 'No active daily objectives.', questTitle: '' };
  }

  const obj = state.player.dailyObjectives.find((o) => o.id === objectiveId);
  if (!obj) {
    return { success: false, message: 'Objective not found.', questTitle: '' };
  }

  if (obj.completed) {
    return { success: false, message: 'Objective already completed today.', questTitle: obj.title };
  }

  // Mark completed
  obj.completed = true;

  // Apply stat boosts
  const p = state.player;
  const boost = obj.statBoost;
  const boostSummary: string[] = [];

  if (boost.attribute && p.attributes) {
    const attrName = boost.attribute;
    const currentVal = p.attributes[attrName] ?? 60;
    p.attributes[attrName] = Math.min(99, currentVal + (boost.amount || 1));
    boostSummary.push(`+${boost.amount || 1} ${attrName.toUpperCase()}`);
  }

  if (boost.sharpness) {
    p.sharpness = Math.min(100, (p.sharpness || 70) + boost.sharpness);
    boostSummary.push(`+${boost.sharpness} Sharpness`);
  }

  if (boost.morale) {
    p.morale = Math.min(100, (p.morale || 70) + boost.morale);
    boostSummary.push(`+${boost.morale} Morale`);
  }

  if (boost.trust) {
    p.trust = Math.min(100, (p.trust || 70) + boost.trust);
    boostSummary.push(`+${boost.trust} Manager Trust`);
  }

  if (boost.fatigue) {
    p.fatigue = Math.max(0, Math.min(100, (p.fatigue || 20) + boost.fatigue));
    if (boost.fatigue < 0) {
      boostSummary.push(`${boost.fatigue} Fatigue (Recovered)`);
    } else {
      boostSummary.push(`+${boost.fatigue} Fatigue`);
    }
  }

  const resultMsg = `Objective Completed! Rewards: ${boostSummary.join(', ')}`;
  return {
    success: true,
    message: resultMsg,
    questTitle: obj.title,
  };
}

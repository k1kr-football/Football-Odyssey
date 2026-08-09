import { Player, CalendarEntry, DayOfWeek } from '../types';
import { getRecoveryDetails } from './recoveryTiers';
import { getMentalFatigueLevel } from './wellbeingEngine';

export type DailyActionType = 'TRAINING' | 'SOCIAL' | 'CONDITIONING' | 'REST';

export interface DailyActionOption {
  id: DailyActionType;
  name: string;
  icon: string;
  category: string;
  description: string;
  benefits: string[];
  costs: string[];
  themeColor: 'emerald' | 'cyan' | 'blue' | 'purple';
}

export interface WeeklyActionLog {
  week: number;
  choices: Partial<Record<DayOfWeek, DailyActionType | 'MANDATORY'>>;
}

export const DAILY_ACTION_OPTIONS: DailyActionOption[] = [
  {
    id: 'TRAINING',
    name: 'Individual Training Focus',
    icon: '🏋️',
    category: 'Development',
    description: 'Drill down on individual attribute slots to accelerate technical & physical growth.',
    benefits: ['+3 Sharpness', 'Attribute Progress', '+1 Manager Trust'],
    costs: ['+4 Physical Fatigue', '+3.5 Recovery Debt', '+1 Mental Strain'],
    themeColor: 'emerald'
  },
  {
    id: 'SOCIAL',
    name: 'PR & Social Media Focus',
    icon: '📱',
    category: 'Brand & Chemistry',
    description: 'Engage with supporters, sponsor photo shoots, and bond with teammates.',
    benefits: ['+2 Squad Chemistry', '+2 Media Perception', '+150 Fans'],
    costs: ['-1 Sharpness', 'No Recovery Bonus'],
    themeColor: 'cyan'
  },
  {
    id: 'CONDITIONING',
    name: 'Conditioning & Recovery',
    icon: '🧊',
    category: 'Physical Recovery',
    description: 'Dedicated cryotherapy, massage, and physio session to wipe out recovery debt.',
    benefits: ['-12 Recovery Debt', '-10 Physical Fatigue', '-5% Injury Risk'],
    costs: ['No Attribute Gains', '-1 Sharpness'],
    themeColor: 'blue'
  },
  {
    id: 'REST',
    name: 'Rest & Mental Reset',
    icon: '🛋️',
    category: 'Wellbeing',
    description: 'Minimal activity, off-pitch downtime to clear mental burnout and stress.',
    benefits: ['-6 Mental Fatigue', '-5 Physical Fatigue', '-5 Recovery Debt'],
    costs: ['No Attribute Gains', '-2 Sharpness'],
    themeColor: 'purple'
  }
];

export function isDayMandatory(entry?: CalendarEntry): boolean {
  if (!entry) return false;
  if (entry.type === 'MATCH') return true;
  if (entry.type === 'INTERNATIONAL_BREAK') return true;
  if (entry.type === 'EVENT') return true;
  if (entry.type === 'TRAINING' && (entry as any).isMandatory) return true;
  return false;
}

export function getWeeklyActionTracker(player: Player, week: number): WeeklyActionLog {
  const tracker = player.stateFlags?.weeklyActionTracker;
  if (tracker && tracker.week === week) {
    return tracker;
  }
  return {
    week,
    choices: {}
  };
}

export function recordDailyChoice(
  player: Player,
  week: number,
  day: DayOfWeek,
  action: DailyActionType | 'MANDATORY'
): Player {
  const currentTracker = getWeeklyActionTracker(player, week);
  const updatedChoices = {
    ...currentTracker.choices,
    [day]: action
  };

  return {
    ...player,
    stateFlags: {
      ...player.stateFlags,
      weeklyActionTracker: {
        week,
        choices: updatedChoices
      }
    }
  };
}

export function applyDailyActionEffects(
  player: Player,
  action: DailyActionType,
  week: number,
  day: DayOfWeek
): { updatedPlayer: Player; summaryMsg: string } {
  let p = recordDailyChoice(player, week, day, action);
  const recoveryDetails = getRecoveryDetails(p);
  let summaryMsg = '';

  const currentFatigue = p.fatigue ?? 20;
  const currentMF = p.mentalFatigue ?? 15;
  const currentSharpness = p.sharpness ?? 60;
  const currentDebt = p.physicalCondition?.recoveryDebt ?? 10;
  const currentIS = p.physicalCondition?.injurySusceptibility ?? 10;
  const currentTrust = p.trust ?? 50;
  const currentTeammates = p.relationships?.teammates ?? 50;
  const currentMedia = p.mediaPerception ?? 50;
  const currentFans = p.fans ?? 500;

  switch (action) {
    case 'TRAINING': {
      const nextFatigue = Math.min(100, currentFatigue + 4);
      const nextDebt = Math.min(100, currentDebt + 4);
      const nextMF = Math.min(100, currentMF + 1);
      const nextSharpness = Math.min(100, currentSharpness + 3);
      const nextTrust = Math.min(100, currentTrust + 1);

      p = {
        ...p,
        fatigue: nextFatigue,
        mentalFatigue: nextMF,
        sharpness: nextSharpness,
        trust: nextTrust,
        physicalCondition: {
          ...p.physicalCondition,
          recoveryDebt: nextDebt,
          value: Math.max(10, Math.min(100, Math.round(nextSharpness * 0.65 + (100 - nextDebt) * 0.35)))
        } as any
      };
      summaryMsg = "Spent day on Individual Training (+3 Sharpness, +1 Manager Trust, +4 Strain).";
      break;
    }
    case 'SOCIAL': {
      const nextTeammates = Math.min(100, currentTeammates + 2);
      const nextMedia = Math.min(100, currentMedia + 2);
      const nextFans = currentFans + 150;
      const nextSharpness = Math.max(0, currentSharpness - 1);

      p = {
        ...p,
        sharpness: nextSharpness,
        mediaPerception: nextMedia,
        fans: nextFans,
        relationships: {
          ...p.relationships,
          teammates: nextTeammates
        } as any
      };
      summaryMsg = "Spent day on PR & Social Media (+2 Chemistry, +2 Media Perception, +150 Fans).";
      break;
    }
    case 'CONDITIONING': {
      // Recovery day bonus scales with recovery clearance tier
      const debtReduction = Math.round(12 + recoveryDetails.clearance * 0.25);
      const fatigueReduction = 10;
      const nextDebt = Math.max(0, currentDebt - debtReduction);
      const nextFatigue = Math.max(0, currentFatigue - fatigueReduction);
      const nextIS = Math.max(2, currentIS - 5);
      const nextMF = Math.max(0, currentMF - 2);

      p = {
        ...p,
        fatigue: nextFatigue,
        mentalFatigue: nextMF,
        physicalCondition: {
          ...p.physicalCondition,
          recoveryDebt: nextDebt,
          injurySusceptibility: nextIS,
          value: Math.max(10, Math.min(100, Math.round(currentSharpness * 0.65 + (100 - nextDebt) * 0.35)))
        } as any
      };
      summaryMsg = `Spent day on Dedicated Conditioning & Therapy (-${debtReduction} Debt, -${fatigueReduction} Fatigue).`;
      break;
    }
    case 'REST': {
      const nextMF = Math.max(0, currentMF - 6);
      const nextFatigue = Math.max(0, currentFatigue - 5);
      const nextDebt = Math.max(0, currentDebt - 5);
      const nextSharpness = Math.max(0, currentSharpness - 2);

      p = {
        ...p,
        fatigue: nextFatigue,
        mentalFatigue: nextMF,
        sharpness: nextSharpness,
        physicalCondition: {
          ...p.physicalCondition,
          recoveryDebt: nextDebt,
          value: Math.max(10, Math.min(100, Math.round(nextSharpness * 0.65 + (100 - nextDebt) * 0.35)))
        } as any
      };
      summaryMsg = "Spent day on Rest & Mental Reset (-6 Mental Fatigue, -5 Physical Stress).";
      break;
    }
  }

  return { updatedPlayer: p, summaryMsg };
}

export function getWeeklyActionCounts(player: Player, week: number): Record<DailyActionType | 'MANDATORY', number> {
  const tracker = getWeeklyActionTracker(player, week);
  const counts: Record<DailyActionType | 'MANDATORY', number> = {
    TRAINING: 0,
    SOCIAL: 0,
    CONDITIONING: 0,
    REST: 0,
    MANDATORY: 0
  };

  const daysList: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  daysList.forEach(day => {
    const act = tracker.choices[day];
    if (act) {
      if (act === 'MANDATORY') counts.MANDATORY++;
      else counts[act]++;
    }
  });

  return counts;
}

export function applyWeeklyActionConsequences(
  player: Player,
  week: number
): { updatedPlayer: Player; warnings: string[] } {
  const counts = getWeeklyActionCounts(player, week);
  let p = { ...player };
  const warnings: string[] = [];

  const trainingCount = counts.TRAINING;
  const socialCount = counts.SOCIAL;
  const conditioningCount = counts.CONDITIONING;
  const restCount = counts.REST;

  // 1. Overtraining Penalty (4+ training days & zero recovery/rest)
  if (trainingCount >= 4 && conditioningCount === 0 && restCount === 0) {
    const nextMF = Math.min(100, (p.mentalFatigue ?? 15) + 15);
    const currentDebt = p.physicalCondition?.recoveryDebt ?? 10;
    const nextDebt = Math.min(100, currentDebt + 15);

    p = {
      ...p,
      mentalFatigue: nextMF,
      physicalCondition: {
        ...p.physicalCondition,
        recoveryDebt: nextDebt
      } as any
    };
    warnings.push("⚠️ Overtraining Burnout: 4+ Training days with 0 Rest/Conditioning severely spiked your Mental Fatigue (+15) and Recovery Debt (+15).");
  }

  // 2. Zero Social / PR Penalty
  if (socialCount === 0) {
    const currentTeammates = p.relationships?.teammates ?? 50;
    const currentMedia = p.mediaPerception ?? 50;
    const nextTeammates = Math.max(0, currentTeammates - 3);
    const nextMedia = Math.max(0, currentMedia - 3);

    p = {
      ...p,
      mediaPerception: nextMedia,
      relationships: {
        ...p.relationships,
        teammates: nextTeammates
      } as any
    };
    warnings.push("⚠️ Social Isolation: Spending zero days on PR & teammate bonding dropped Squad Chemistry (-3) and Media Perception (-3).");
  }

  // 3. High Conditioning Reward
  if (conditioningCount >= 2) {
    const currentDebt = p.physicalCondition?.recoveryDebt ?? 10;
    const nextDebt = Math.max(0, currentDebt - 15);
    const currentIS = p.physicalCondition?.injurySusceptibility ?? 10;
    const nextIS = Math.max(2, currentIS - 10);

    p = {
      ...p,
      physicalCondition: {
        ...p.physicalCondition,
        recoveryDebt: nextDebt,
        injurySusceptibility: nextIS
      } as any
    };
    warnings.push("✅ Recovery Mastery: 2+ Conditioning days reduced your Recovery Debt by an extra 15 pts and lowered Injury Risk.");
  }

  // 4. High Rest Reward
  if (restCount >= 2) {
    const nextMF = Math.max(0, (p.mentalFatigue ?? 15) - 8);
    p = {
      ...p,
      mentalFatigue: nextMF
    };
    warnings.push("✅ Mental Reset: 2+ Rest days cleared an extra 8 points of Mental Fatigue.");
  }

  return { updatedPlayer: p, warnings };
}

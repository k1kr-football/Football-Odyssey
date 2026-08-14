import React from 'react';
import { Player, DayOfWeek } from '../types';
import { getWeeklyActionTracker, getWeeklyActionCounts, DAILY_ACTION_OPTIONS, isDayMandatory } from '../utils/dailyActionEngine';
import { Activity, ShieldAlert, CheckCircle2, Flame, HeartPulse, Sparkles, Zap } from 'lucide-react';

interface WeeklyBalanceIndicatorProps {
  player: Player;
  currentWeek: number;
  currentDay: DayOfWeek;
  seasonCalendar?: any[];
  onOpenDayModal?: (day: DayOfWeek) => void;
}

export function WeeklyBalanceIndicator({
  player,
  currentWeek,
  currentDay,
  seasonCalendar,
  onOpenDayModal
}: WeeklyBalanceIndicatorProps) {
  const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const tracker = getWeeklyActionTracker(player, currentWeek);
  const counts = getWeeklyActionCounts(player, currentWeek);

  const trainingCount = counts.TRAINING;
  const socialCount = counts.SOCIAL;
  const conditioningCount = counts.CONDITIONING;
  const restCount = counts.REST;
  const mandatoryCount = counts.MANDATORY;

  const isImbalancedOvertraining = trainingCount >= 4 && conditioningCount === 0 && restCount === 0;
  const isZeroSocial = socialCount === 0 && days.indexOf(currentDay) >= 4;

  const getActionBadge = (actionType?: string) => {
    switch (actionType) {
      case 'TRAINING':
        return { icon: '🏋️', label: 'Train', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
      case 'SOCIAL':
        return { icon: '📱', label: 'Social', bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' };
      case 'CONDITIONING':
        return { icon: '🧊', label: 'Recover', bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400' };
      case 'REST':
        return { icon: '🛋️', label: 'Rest', bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400' };
      case 'MANDATORY':
        return { icon: '⚽', label: 'Mandatory', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
      default:
        return { icon: '•', label: 'Pending', bg: 'bg-white/5 border-[#222] text-white/40' };
    }
  };

  return (
    <div className="bg-[#050505] border border-white/15 sm:p-2.5 sm:p-4 mb-3 sm:mb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-2 pb-2 mb-2 sm:mb-3 border-b border-[#222]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Activity size={16} className="text-[#00FF88]" />
          <div>
            <h4 className="text-white text-[11px] sm:text-xs font-black uppercase tracking-wider">
              Weekly Allocation & Workload Balance
            </h4>
            <p className="text-[9px] sm:text-[10px] text-white/50 font-mono">
              Week {currentWeek} Action Ledger
            </p>
          </div>
        </div>

        {/* Counts summary chips */}
        <div className="flex flex-wrap items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold">
          <span className="px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            🏋️ {trainingCount} Train
          </span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            📱 {socialCount} Social
          </span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            🧊 {conditioningCount} Recover
          </span>
          <span className="px-1.5 sm:px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            🛋️ {restCount} Rest
          </span>
        </div>
      </div>

      {/* 7-Day Visual Allocation Strip */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 sm:mb-3">
        {days.map((d) => {
          const entry = seasonCalendar?.find((e: any) => e.week === currentWeek && e.day === d);
          const isMand = isDayMandatory(entry);
          const recordedAction = tracker.choices[d] || (isMand ? 'MANDATORY' : undefined);
          const badge = getActionBadge(recordedAction);
          const isCurrent = d === currentDay;

          return (
            <button
              key={d}
              onClick={() => onOpenDayModal && onOpenDayModal(d)}
              className={`p-1 sm:p-2 sm:border flex flex-col items-center text-center transition-all cursor-pointer ${badge.bg} ${
                isCurrent ? 'ring-2 ring-[#00FF88] shadow-[#00FF88]/10 scale-102' : 'hover:scale-[1.02] hover:border-white/30'
              }`}
              title={isMand ? `${d}: Mandatory Obligation` : `${d}: Click to select Focus Activity (${recordedAction || 'Pending'})`}
            >
              <span className="text-[9px] font-mono font-bold uppercase text-white/50 mb-0.5">
                {d} {isCurrent && '📍'}
              </span>
              <span className="text-sm my-0.5">{badge.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-tight truncate w-full">
                {badge.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Warnings & Active Status Indicators */}
      {isImbalancedOvertraining && (
        <div className="bg-red-500/10 border border-red-500/30 p-2.5 flex items-center gap-2 text-red-400 text-xs font-mono mt-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>
            <strong>Overtraining Warning:</strong> 4+ Training days with 0 Recovery/Rest will incur an extra +15 Mental Fatigue & Recovery Debt penalty at week end.
          </span>
        </div>
      )}

      {isZeroSocial && !isImbalancedOvertraining && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 flex items-center gap-2 text-amber-400 text-xs font-mono mt-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>
            <strong>Social Drift Warning:</strong> Zero Social/PR days this week will cause Squad Chemistry & Media Perception decay (-3).
          </span>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Player, DayOfWeek, CalendarEntry } from '../types';
import {
  DailyActionType,
  DAILY_ACTION_OPTIONS,
  isDayMandatory,
  getWeeklyActionTracker,
  applyDailyActionEffects
} from '../utils/dailyActionEngine';
import { Sparkles, CheckCircle2, Lock, Zap, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

interface DailyActionWidgetProps {
  player: Player;
  currentWeek: number;
  currentDay: DayOfWeek;
  todaysCalendarEntry?: CalendarEntry;
  onSelectAction: (action: DailyActionType) => void;
}

export function DailyActionWidget({
  player,
  currentWeek,
  currentDay,
  todaysCalendarEntry,
  onSelectAction
}: DailyActionWidgetProps) {
  const isMandatory = isDayMandatory(todaysCalendarEntry);
  const tracker = getWeeklyActionTracker(player, currentWeek);
  const currentChoice = tracker.choices[currentDay];

  if (isMandatory) {
    let mandatoryLabel = "Mandatory Club Obligation";
    let mandatoryDesc = "This day is occupied by official club or external duties (Matchday, International Duty, or Mandatory Event).";
    if (todaysCalendarEntry?.type === 'MATCH') {
      mandatoryLabel = "Matchday Obligation ⚽";
      mandatoryDesc = `Official match scheduled against ${todaysCalendarEntry.match?.opponentSymbol || 'Opponent'}. Tactical preparation and team duties required.`;
    } else if (todaysCalendarEntry?.type === 'INTERNATIONAL_BREAK') {
      mandatoryLabel = "International Duty 🌍";
      mandatoryDesc = "National team call-up and international fixture commitments.";
    } else if (todaysCalendarEntry?.type === 'EVENT') {
      mandatoryLabel = `Special Event: ${todaysCalendarEntry.specialEvent?.type?.replace('_', ' ') || 'Club Event'} 📸`;
      mandatoryDesc = todaysCalendarEntry.specialEvent?.description || "Mandated club media or commercial commitment.";
    }

    return (
      <div className="bg-[#121212]/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Lock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Mandatory Schedule Day
              </span>
              <h3 className="text-white text-sm font-black uppercase tracking-wider">
                {mandatoryLabel}
              </h3>
            </div>
            <p className="text-white/60 text-xs font-mono mt-1">
              {mandatoryDesc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212]/90 border border-white/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md mb-3 sm:mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 mb-3 border-b border-white/10 gap-1.5">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="bg-[#00FF88]/20 text-[#00FF88] text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded border border-[#00FF88]/30 font-mono">
              Personal Time
            </span>
            <h3 className="text-white text-xs sm:text-base font-black uppercase tracking-wider">
              Daily Action Focus — {currentDay}
            </h3>
          </div>
          <p className="text-white/50 text-[10px] sm:text-xs font-mono mt-0.5">
            Daily focus affects recovery &amp; fatigue.
          </p>
        </div>

        {currentChoice && currentChoice !== 'MANDATORY' && (
          <span className="text-[10px] sm:text-xs font-mono font-bold text-[#00FF88] bg-[#00FF88]/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-[#00FF88]/30 flex items-center gap-1">
            <CheckCircle2 size={12} /> Focus Set: {currentChoice}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {DAILY_ACTION_OPTIONS.map((option) => {
          const isSelected = currentChoice === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onSelectAction(option.id)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all relative cursor-pointer ${
                isSelected
                  ? 'bg-[#00FF88]/15 border-[#00FF88] text-white shadow-lg shadow-[#00FF88]/10 ring-1 ring-[#00FF88]'
                  : 'bg-black/40 border-white/10 hover:border-white/30 text-white/90 hover:bg-black/60'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-[9px] font-mono font-bold uppercase text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {option.category}
                  </span>
                </div>

                <h4 className="font-black text-xs uppercase tracking-wide text-white mb-1">
                  {option.name}
                </h4>
                <p className="text-[10px] font-mono text-white/60 leading-relaxed mb-3">
                  {option.description}
                </p>

                {/* Benefits */}
                <div className="space-y-1 mb-3">
                  {option.benefits.map((b, idx) => (
                    <div key={idx} className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span>✓</span> {b}
                    </div>
                  ))}
                </div>

                {/* Costs */}
                <div className="space-y-1 mb-3 border-t border-white/10 pt-2">
                  {option.costs.map((c, idx) => (
                    <div key={idx} className="text-[10px] font-mono text-white/40 flex items-center gap-1">
                      <span>•</span> {c}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-[#00FF88]' : 'text-white/40'}`}>
                  {isSelected ? 'Selected Active Focus' : 'Select Focus'}
                </span>
                {isSelected && <CheckCircle2 size={14} className="text-[#00FF88]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

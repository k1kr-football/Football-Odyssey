import React, { useState } from 'react';
import { DayOfWeek } from '../types';
import {
  DailyActionType,
  DAILY_ACTION_OPTIONS,
  isDayMandatory
} from '../utils/dailyActionEngine';
import { X, Calendar, Sparkles, CheckCircle2, Activity, ShieldAlert, Dumbbell, Users, HeartPulse, Moon } from 'lucide-react';

interface ScheduleActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayOfWeek;
  week: number;
  currentChoice?: DailyActionType | 'MANDATORY';
  onSelectActivity: (activity: DailyActionType, day: DayOfWeek) => void;
  todaysCalendarEntry?: any;
}

export function ScheduleActivityModal({
  isOpen,
  onClose,
  day,
  week,
  currentChoice,
  onSelectActivity,
  todaysCalendarEntry
}: ScheduleActivityModalProps) {
  if (!isOpen) return null;

  const isMandatory = isDayMandatory(todaysCalendarEntry);
  const [selected, setSelected] = useState<DailyActionType>(
    currentChoice && currentChoice !== 'MANDATORY' ? currentChoice : 'TRAINING'
  );

  const dayFullName: Record<DayOfWeek, string> = {
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
    SUN: 'Sunday'
  };

  const getActivityIcon = (id: DailyActionType) => {
    switch (id) {
      case 'TRAINING':
        return <Dumbbell className="text-emerald-400" size={24} />;
      case 'SOCIAL':
        return <Users className="text-cyan-400" size={24} />;
      case 'CONDITIONING':
        return <HeartPulse className="text-blue-400" size={24} />;
      case 'REST':
        return <Moon className="text-purple-400" size={24} />;
    }
  };

  const handleConfirm = () => {
    if (isMandatory) return;
    onSelectActivity(selected, day);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 animate-fadeIn">
      <div 
        className="bg-[#121418] border border-white/15 sm:max-w-2xl w-full overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-[#222] flex items-center justify-between from-white/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-3 sm:bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20">
              <Calendar size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30">
                  Week {week} &bull; {dayFullName[day]} Focus
                </span>
                {isMandatory && (
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Mandatory Obligation
                  </span>
                )}
              </div>
              <h2 className="text-white text-sm sm:text-lg font-black uppercase tracking-wider mt-0.5">
                Schedule Activity Focus
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
          {isMandatory ? (
            <div className="bg-amber-500/10 border border-amber-500/30 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-white font-bold text-base uppercase tracking-wide">
                Mandatory Club Schedule Day
              </h3>
              <p className="text-white/60 text-xs font-mono mt-2 max-w-md mx-auto leading-relaxed">
                This day is occupied by official duties (Matchday, International Duty, or Mandatory Club Event). Personal non-mandatory activities cannot be scheduled on this day.
              </p>
            </div>
          ) : (
            <>
              <p className="text-white/60 text-xs font-mono leading-relaxed">
                Select one of the four non-mandatory focus activities for <span className="text-[#00FF88] font-bold">{dayFullName[day]}</span>. Your selection will be stored in this week's schedule state and impacts your recovery debt, mental fatigue, and sharpness.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {DAILY_ACTION_OPTIONS.map((option) => {
                  const isSelected = selected === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => setSelected(option.id)}
                      className={`p-4 border cursor-pointer transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#00FF88]/10 border-[#00FF88] text-white shadow-[#00FF88]/10 ring-1 ring-[#00FF88]'
                          : 'bg-black/40 border-[#222] hover:border-white/30 text-white/80 hover:bg-black/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            {getActivityIcon(option.id)}
                            <h4 className="font-black text-sm uppercase tracking-wide text-white">
                              {option.name}
                            </h4>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={18} className="text-[#00FF88] shrink-0" />
                          )}
                        </div>

                        <span className="inline-block text-[9px] font-mono font-bold uppercase text-white/50 bg-white/5 px-2 py-0.5 rounded border border-[#222] mb-2">
                          {option.category}
                        </span>

                        <p className="text-[11px] font-mono text-white/60 leading-relaxed mb-3">
                          {option.description}
                        </p>

                        {/* Benefits */}
                        <div className="space-y-1 mb-2">
                          {option.benefits.map((b, idx) => (
                            <div key={idx} className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                              <span>✓</span> {b}
                            </div>
                          ))}
                        </div>

                        {/* Costs */}
                        <div className="space-y-1 pt-2 border-t border-[#222]">
                          {option.costs.map((c, idx) => (
                            <div key={idx} className="text-[10px] font-mono text-white/40 flex items-center gap-1.5">
                              <span>•</span> {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#222] bg-[#0d0f12] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/15 text-white/70 hover:text-white hover:bg-white/5 text-xs font-mono font-bold transition-colors"
          >
            Close
          </button>

          {!isMandatory && (
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-[#00FF88] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00FF88]/90 transition-all flex items-center gap-2 shadow-[#00FF88]/20 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              Confirm {selected} Focus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

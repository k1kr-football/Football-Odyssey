import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { ensurePlayerDailyObjectives, completeDailyObjective } from '../utils/dailyQuests';
import { DailyObjective } from '../types';
import { Target, CheckCircle2, Clock, Zap, Sparkles, Award, Dumbbell, BookOpen, HeartPulse, Flame, Users } from 'lucide-react';

export const DailyQuestsWidget: React.FC = () => {
  const { state, setPlayer } = useGame();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!state.player) return null;

  // Ensure daily quests exist for today
  const dailyObjectives = ensurePlayerDailyObjectives(state);
  const completedCount = dailyObjectives.filter((o) => o.completed).length;

  const handleComplete = (obj: DailyObjective) => {
    if (obj.completed) return;

    const result = completeDailyObjective(state, obj.id);
    if (result.success) {
      setToastMessage(result.message);
      // Trigger player context update to persist boosted stats
      setPlayer({ ...state.player! });

      setTimeout(() => {
        setToastMessage(null);
      }, 4500);
    }
  };

  const getCategoryIcon = (category: DailyObjective['category']) => {
    switch (category) {
      case 'DRILLS':
        return <Dumbbell size={16} className="text-teal-400" />;
      case 'TACTICAL':
        return <BookOpen size={16} className="text-cyan-400" />;
      case 'RECOVERY':
        return <HeartPulse size={16} className="text-[#00FF88]" />;
      case 'FITNESS':
        return <Flame size={16} className="text-amber-400" />;
      case 'BONDING':
        return <Users size={16} className="text-purple-400" />;
      default:
        return <Target size={16} className="text-teal-400" />;
    }
  };

  return (
    <div className="bg-[#121318] border border-white/10 rounded-2xl p-5 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
            <Target size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
              DAILY OBJECTIVES STUDIO
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                3 OBJECTIVES TODAY
              </span>
            </h3>
            <p className="text-[11px] text-white/50">
              Complete time-limited daily tasks to boost attributes, sharpness & morale
            </p>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="text-right shrink-0">
          <div className="text-xs font-black text-teal-400 mb-1">
            {completedCount} / 3 COMPLETED
          </div>
          <div className="w-24 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Toast Reward Banner */}
      {toastMessage && (
        <div className="mb-4 p-3 bg-gradient-to-r from-teal-900/80 to-emerald-950/80 border border-teal-500/50 rounded-xl text-teal-300 text-xs flex items-center gap-2 animate-in fade-in zoom-in-95 shadow-lg">
          <Sparkles size={16} className="text-teal-400 shrink-0 animate-spin" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Quest Items List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {dailyObjectives.map((obj) => {
          const boostText: string[] = [];
          if (obj.statBoost.attribute) {
            boostText.push(`+${obj.statBoost.amount || 1} ${obj.statBoost.attribute.toUpperCase()}`);
          }
          if (obj.statBoost.sharpness) boostText.push(`+${obj.statBoost.sharpness} Sharpness`);
          if (obj.statBoost.morale) boostText.push(`+${obj.statBoost.morale} Morale`);
          if (obj.statBoost.trust) boostText.push(`+${obj.statBoost.trust} Trust`);
          if (obj.statBoost.fatigue) {
            if (obj.statBoost.fatigue < 0) {
              boostText.push(`${obj.statBoost.fatigue} Fatigue`);
            } else {
              boostText.push(`+${obj.statBoost.fatigue} Fatigue`);
            }
          }

          return (
            <div
              key={obj.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                obj.completed
                  ? 'bg-teal-950/20 border-teal-500/40 text-white/60'
                  : 'bg-[#181920] border-white/5 hover:border-white/20 text-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(obj.category)}
                    <span className="text-[10px] font-bold text-white/60 uppercase">
                      {obj.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-teal-400 font-mono font-bold flex items-center gap-1">
                    <Clock size={12} /> {obj.durationText}
                  </span>
                </div>

                <h4 className="text-xs font-bold font-display uppercase mb-1.5 text-white">
                  {obj.title}
                </h4>

                <p className="text-[11px] text-white/60 leading-relaxed mb-3">
                  {obj.description}
                </p>
              </div>

              <div>
                {/* Rewards Preview */}
                <div className="bg-black/40 p-2 rounded-lg border border-white/5 mb-3 text-[10px] font-bold text-teal-300">
                  ⚡ Rewards: {boostText.join(', ')}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleComplete(obj)}
                  disabled={obj.completed}
                  className={`w-full py-2 px-3 text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-display ${
                    obj.completed
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 opacity-80 cursor-default'
                      : 'bg-teal-500 hover:bg-teal-400 text-black shadow-md'
                  }`}
                >
                  {obj.completed ? (
                    <>
                      <CheckCircle2 size={15} /> COMPLETED TODAY
                    </>
                  ) : (
                    <>
                      <Zap size={15} /> PERFORM OBJECTIVE
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

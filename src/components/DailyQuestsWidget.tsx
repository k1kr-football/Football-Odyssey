import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { useAPEngine } from '../hooks/useAPEngine';
import { APHeaderWidget } from './APHeaderWidget';
import { AP_ACTION_CATALOG, APAction } from '../types/apEngine';
import { Zap, Sparkles, AlertTriangle, Dumbbell, BookOpen, HeartPulse, Flame, Users, CheckCircle2, Shield } from 'lucide-react';

export const DailyQuestsWidget: React.FC = () => {
  const { state, setPlayer } = useGame();
  const { apState, getActionCost, performAction, toggleStaff } = useAPEngine();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!state.player) return null;

  const handlePerform = (action: APAction) => {
    const res = performAction(action.id);
    if (res.success) {
      setToastMessage(res.message || `Performed ${action.title}!`);
      setPlayer({ ...state.player! });
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage(res.message || 'Unable to perform action.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const getCategoryIcon = (category: APAction['category']) => {
    switch (category) {
      case 'training':
        return <Dumbbell size={16} className="text-teal-400" />;
      case 'recovery':
        return <HeartPulse size={16} className="text-emerald-400" />;
      case 'career':
        return <BookOpen size={16} className="text-cyan-400" />;
      case 'team':
        return <Users size={16} className="text-purple-400" />;
      case 'off_season':
        return <Flame size={16} className="text-amber-400" />;
      default:
        return <Zap size={16} className="text-teal-400" />;
    }
  };

  // Filter actions based on phase
  const visibleActions = AP_ACTION_CATALOG.filter(action => {
    if (apState.phase === 'off_season') {
      return action.category === 'off_season';
    }
    if (apState.phase === 'matchday') {
      return action.category === 'recovery' || action.id === 'career_agent';
    }
    return action.category !== 'off_season';
  });

  return (
    <div className="space-y-4 font-mono">
      {/* Header & AP Widget */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0a0a0a] border border-[#222] p-4 ">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
            ACTION POINT ENGINE · {apState.phase.replace('_', ' ').toUpperCase()}
          </span>
          <h3 className="text-sm font-bold text-white">Daily Actions & Tactical Trade-Offs</h3>
        </div>
        <APHeaderWidget apState={apState} />
      </div>

      {/* Staff Automation Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          onClick={() => toggleStaff('nutritionist')}
          className={`p-3 border cursor-pointer transition-all flex items-center justify-between ${
            apState.staff.nutritionist ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-[#0a0a0a] border-[#111] text-white/50 hover:border-[#333]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span className="text-xs font-bold uppercase">Nutritionist</span>
          </div>
          <span className="text-[10px] font-mono">{apState.staff.nutritionist ? 'ACTIVE (+10% Cond)' : 'OFF'}</span>
        </div>

        <div 
          onClick={() => toggleStaff('privatePhysio')}
          className={`p-3 border cursor-pointer transition-all flex items-center justify-between ${
            apState.staff.privatePhysio ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-[#0a0a0a] border-[#111] text-white/50 hover:border-[#333]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span className="text-xs font-bold uppercase">Private Physio</span>
          </div>
          <span className="text-[10px] font-mono">{apState.staff.privatePhysio ? 'ACTIVE (-20% Fatigue)' : 'OFF'}</span>
        </div>

        <div 
          onClick={() => toggleStaff('prManager')}
          className={`p-3 border cursor-pointer transition-all flex items-center justify-between ${
            apState.staff.prManager ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-[#0a0a0a] border-[#111] text-white/50 hover:border-[#333]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span className="text-xs font-bold uppercase">PR Manager</span>
          </div>
          <span className="text-[10px] font-mono">{apState.staff.prManager ? 'ACTIVE (+Reputation)' : 'OFF'}</span>
        </div>
      </div>

      {/* Toast Reward Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in ">
          <Sparkles size={16} className="text-emerald-400 shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleActions.map((action) => {
          const cost = getActionCost(action);
          const numericCost = cost === 'ALL' ? apState.currentAP : (cost as number);
          const hasEnoughAP = apState.currentAP >= numericCost;
          const canUseStrain = !hasEnoughAP && apState.currentAP + (2 - apState.strainZoneUsed) >= numericCost;
          const isExhausted = !hasEnoughAP && !canUseStrain;

          return (
            <div
              key={action.id}
              className="border border-[#222] bg-[#0a0a0a] p-4 flex flex-col justify-between space-y-3 "
            >
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    {getCategoryIcon(action.category)} {action.category}
                  </span>
                  <span className="text-neutral-400 font-mono flex items-center gap-1">
                    ⚡ {cost === 'ALL' ? 'ALL AP' : `${cost} AP`}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{action.title}</h3>
                <p className="text-[11px] text-neutral-400 mt-1">{action.description}</p>
              </div>

              <button
                onClick={() => handlePerform(action)}
                disabled={isExhausted}
                className={`w-full py-2.5 text-xs font-bold transition-all min-h-[44px] cursor-pointer flex items-center justify-center gap-2 ${
                  isExhausted
                    ? 'bg-neutral-800/50 text-neutral-500 border border-[#111] cursor-not-allowed'
                    : !hasEnoughAP
                    ? 'bg-amber-500/20 hover:bg-amber-500 hover:text-neutral-950 text-amber-400 border border-amber-500/40 animate-pulse'
                    : 'bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-white border border-[#222]'
                }`}
              >
                {!hasEnoughAP && canUseStrain ? (
                  <>
                    <AlertTriangle size={15} /> PUSH LIMITS (-{numericCost} AP ⚠️)
                  </>
                ) : isExhausted ? (
                  'EXHAUSTED'
                ) : (
                  <>
                    <Zap size={15} /> PERFORM ACTION
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { TurningPointEvent } from '../types';
import { Activity, Zap, Target, AlertTriangle, Shield, Flag, ChevronRight, Filter } from 'lucide-react';

interface TurningPointsReviewProps {
  turningPoints: TurningPointEvent[];
  playerClubName?: string;
  opponentClubName?: string;
  title?: string;
}

export const TurningPointsReview: React.FC<TurningPointsReviewProps> = ({
  turningPoints,
  playerClubName = 'Your Club',
  opponentClubName = 'Opponent',
  title = 'KEY MATCH TURNING POINTS LOG'
}) => {
  const [filter, setFilter] = useState<'ALL' | 'GOALS' | 'DECISIONS' | 'CRITICAL'>('ALL');

  const filteredPoints = turningPoints.filter((tp) => {
    if (filter === 'GOALS') return tp.impact === 'GOAL';
    if (filter === 'DECISIONS') return tp.impact === 'CRITICAL' || tp.title.includes('Decision');
    if (filter === 'CRITICAL') return tp.impact === 'CRITICAL' || tp.impact === 'RED_CARD';
    return true;
  });

  const getImpactBadge = (impact: TurningPointEvent['impact']) => {
    switch (impact) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[10px] font-black rounded bg-red-500/20 text-red-400 border border-red-500/40">CRITICAL</span>;
      case 'GOAL':
        return <span className="px-2 py-0.5 text-[10px] font-black rounded bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40">GOAL</span>;
      case 'RED_CARD':
        return <span className="px-2 py-0.5 text-[10px] font-black rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">INJURY / CARD</span>;
      case 'TACTICAL':
        return <span className="px-2 py-0.5 text-[10px] font-black rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">TACTICAL</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-black rounded bg-white/10 text-white/70 border border-white/20">MAJOR</span>;
    }
  };

  return (
    <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 shadow-xl font-mono">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            <p className="text-[11px] text-white/50">Post-match chronological timeline review & momentum triggers</p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'All Events' },
            { key: 'GOALS', label: 'Goals' },
            { key: 'DECISIONS', label: 'Key Decisions' },
            { key: 'CRITICAL', label: 'Critical' }
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key as any)}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                filter === btn.key
                  ? 'bg-teal-500 text-black border-teal-400'
                  : 'bg-black/40 text-white/60 border-white/10 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filteredPoints.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/40">No turning point events found for this filter.</div>
        ) : (
          filteredPoints.map((tp, idx) => (
            <div
              key={tp.id || idx}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                tp.impact === 'GOAL'
                  ? 'bg-[#00FF88]/5 border-[#00FF88]/30'
                  : tp.impact === 'CRITICAL' || tp.impact === 'RED_CARD'
                  ? 'bg-red-500/5 border-red-500/30'
                  : 'bg-black/40 border-white/5'
              }`}
            >
              {/* Minute Stamp Circle */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                  tp.team === 'PLAYER'
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                    : tp.team === 'OPPOSITION'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-white/10 text-white/70 border border-white/20'
                }`}
              >
                {tp.minute}'
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-white uppercase truncate flex items-center gap-2">
                    {tp.title}
                  </span>
                  {getImpactBadge(tp.impact)}
                </div>

                <p className="text-xs text-white/70 leading-relaxed font-sans mb-1.5">
                  {tp.description}
                </p>

                {tp.playerInvolved && (
                  <div className="text-[10px] text-teal-400 font-bold flex items-center gap-1">
                    <Target size={12} /> Key Player Involved: {tp.playerInvolved}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

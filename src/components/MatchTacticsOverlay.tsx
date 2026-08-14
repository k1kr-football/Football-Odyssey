import React from 'react';
import { PitchTacticalOption, HALFTIME_TACTICS, TOUCHLINE_SHOUTS } from '../types/matchAP';
import { Shield, Flame, Zap, MessageSquare, Play, AlertTriangle } from 'lucide-react';

interface MatchTacticsOverlayProps {
  mode: 'HALFTIME' | 'TOUCHLINE';
  matchAPAvailable: number;
  activeTactics: string[];
  userScore: number;
  oppScore: number;
  userClubName: string;
  oppClubName: string;
  minute?: number;
  stats?: {
    userXg: number;
    oppXg: number;
    possession: number;
  };
  onSelectTactic: (option: PitchTacticalOption) => void;
  onResumeMatch?: () => void;
}

export function MatchTacticsOverlay({
  mode,
  matchAPAvailable,
  activeTactics,
  userScore,
  oppScore,
  userClubName,
  oppClubName,
  minute = 45,
  stats = { userXg: 1.2, oppXg: 0.8, possession: 52 },
  onSelectTactic,
  onResumeMatch
}: MatchTacticsOverlayProps) {
  if (mode === 'HALFTIME') {
    return (
      <div className="bg-[#050505] border border-white/15 p-6 mb-6">
        {/* Score & Tactical Status Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center pb-4 mb-4 border-b border-[#222] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/30">
                Half Time
              </span>
              <h3 className="text-white text-lg font-black uppercase tracking-wider">Tactical Board</h3>
            </div>
            <p className="text-white/40 text-xs font-mono mt-0.5">
              Make halftime adjustments or deliver a team talk using your matchday AP.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/60 px-4 py-2 border border-[#222]">
            <span className="text-sm font-bold text-white/70">
              {userClubName} <span className="text-white font-black">{userScore} - {oppScore}</span> {oppClubName}
            </span>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1.5 text-[#00FF88] font-black text-xs font-mono">
              <Zap size={14} className="fill-[#00FF88]" />
              <span>MATCH AP: {matchAPAvailable} / 3</span>
            </div>
          </div>
        </div>

        {/* Pitch Visualization & Live Telemetry Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Tactical Pitch Canvas Mock */}
          <div className="md:col-span-1 border border-emerald-500/20 p-4 flex flex-col justify-between relative overflow-hidden h-44">
            <div className="absolute inset-0 bg-[radial-gradient(#00FF88_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
            <div className="flex justify-between items-center z-10 text-[10px] font-mono text-emerald-400 font-bold uppercase">
              <span>Formation: 4-3-3</span>
              <span>Shape: {activeTactics.length > 0 ? activeTactics.join(', ') : 'Standard'}</span>
            </div>
            
            <div className="my-auto z-10 flex flex-col items-center justify-center space-y-2">
              <div className="w-full flex justify-around">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-sm shadow-[#00FF88]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-sm shadow-[#00FF88]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-sm shadow-[#00FF88]" />
              </div>
              <div className="w-3/4 flex justify-around">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-sm shadow-[#00FF88]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-sm shadow-[#00FF88]" />
              </div>
              <div className="w-full flex justify-around">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-sm shadow-[#00FF88]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-sm shadow-[#00FF88]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-sm shadow-[#00FF88]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] shadow-sm shadow-[#00FF88]" />
              </div>
            </div>

            <div className="flex justify-between text-[9px] font-mono text-white/50 z-10">
              <span>xG: {stats.userXg.toFixed(2)}</span>
              <span>Poss: {stats.possession}%</span>
              <span>Opp xG: {stats.oppXg.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HALFTIME_TACTICS.map((tactic) => {
              const isActive = activeTactics.includes(tactic.id);
              const canAfford = matchAPAvailable >= tactic.apCost;

              return (
                <button
                  key={tactic.id}
                  disabled={isActive || !canAfford}
                  onClick={() => onSelectTactic(tactic)}
                  className={`p-3.5 border text-left flex flex-col justify-between transition-all relative ${
                    isActive
                      ? 'bg-[#00FF88]/15 border-[#00FF88] text-white shadow-[#00FF88]/10'
                      : canAfford
                      ? 'bg-black/40 border-[#222] hover:border-[#00FF88]/50 text-white/90 hover:bg-black/60 cursor-pointer'
                      : 'bg-black/20 border-[#111] text-white/30 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-xs uppercase tracking-wide flex items-center gap-1.5">
                        {tactic.id === 'ht_high_press' && <Flame size={14} className="text-amber-400" />}
                        {tactic.id === 'ht_park_bus' && <Shield size={14} className="text-blue-400" />}
                        {tactic.id === 'ht_team_talk' && <MessageSquare size={14} className="text-emerald-400" />}
                        {tactic.title}
                      </span>
                      <span className="text-[10px] font-bold text-[#00FF88] bg-[#00FF88]/10 px-1.5 py-0.5 rounded border border-[#00FF88]/20 font-mono">
                        {tactic.apCost} AP
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-white/60 leading-relaxed mb-2">
                      {tactic.description}
                    </p>
                  </div>

                  <span className={`text-[9px] font-bold uppercase block mt-1 ${isActive ? 'text-[#00FF88]' : 'text-white/40'}`}>
                    {isActive ? '✓ Active Override' : canAfford ? 'Select Action' : 'Insufficient AP'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {onResumeMatch && (
          <button
            onClick={onResumeMatch}
            className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-black py-3.5 font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[#00FF88]/20 transition-all active:scale-98"
          >
            RESUME SECOND HALF <Play size={18} className="fill-black" />
          </button>
        )}
      </div>
    );
  }

  // Live Touchline Popup Bar
  return (
    <div className="bg-[#050505] border border-white/15 p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-[#00FF88] animate-pulse" />
        <div>
          <span className="text-[10px] text-white/50 font-bold uppercase block leading-none">Touchline AP</span>
          <span className="text-xs font-black text-white font-mono">{matchAPAvailable} AP Remaining</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        {TOUCHLINE_SHOUTS.map((shout) => {
          const isStoppageOnly = shout.triggerPhase === 'stoppage_time';
          if (isStoppageOnly && minute < 85) return null;

          const isActive = activeTactics.includes(shout.id);
          const canAfford = matchAPAvailable >= shout.apCost;

          return (
            <button
              key={shout.id}
              disabled={isActive || !canAfford}
              onClick={() => onSelectTactic(shout)}
              className={`px-3 py-2 border text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500/20 border-amber-500 text-white'
                  : canAfford
                  ? 'bg-black/60 border-white/15 text-white hover:border-[#00FF88] hover:bg-black'
                  : 'bg-black/20 border-[#111] text-white/30 cursor-not-allowed'
              }`}
            >
              {isStoppageOnly && <AlertTriangle size={12} className="text-red-400" />}
              <span>{shout.title}</span>
              <span className="text-[#00FF88] font-mono">({shout.apCost} AP)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

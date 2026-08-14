import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { Target, Zap, Shield, Flame, Users, Globe, Award, TrendingUp, CheckCircle, ChevronRight, Lock, Activity } from 'lucide-react';
import { CLUBS } from '../data/teams';

export function CareerDepthWidget() {
  const { state, setScreen, setPlayer } = useGame();
  const player = state.player;

  const [activeTab, setActiveTab] = useState<'OBJECTIVES' | 'TACTICS' | 'PLAYSTYLES' | 'NATIONAL'>('OBJECTIVES');

  if (!player) return null;

  const currentClub = CLUBS.find(c => c.symbol === player.currentClubSymbol) || CLUBS[0];
  const position = player.position || 'CM';
  const ovr = player.ovr || 70;
  const trust = player.trust || 50;

  // EA FC Style PlayStyles List
  const allPlayStyles = [
    { id: 'finesse', name: 'Finesse Shot', icon: '⚽', desc: 'Increases finesse shot curve and accuracy', cat: 'Scoring', requiredOvr: 68 },
    { id: 'relentless', name: 'Relentless', icon: '⚡', desc: 'Reduces fatigue depletion during second half', cat: 'Physical', requiredOvr: 70 },
    { id: 'deadball', name: 'Dead Ball', icon: '🎯', desc: 'Enhanced trajectory & precision on free kicks', cat: 'Passing', requiredOvr: 72 },
    { id: 'tikitaka', name: 'Tiki-Taka', icon: '🔄', desc: 'High-speed, first-time passing accuracy', cat: 'Passing', requiredOvr: 74 },
    { id: 'trivela', name: 'Trivela', icon: '💫', desc: 'Executes outside-foot passes and shots naturally', cat: 'Skill', requiredOvr: 75 },
    { id: 'rapid', name: 'Rapid Sprint', icon: '🚀', desc: 'Higher sprint speed acceleration with ball', cat: 'Pace', requiredOvr: 78 },
    { id: 'pressproven', name: 'Press Proven', icon: '🛡️', desc: 'Resists physical pressure when shielding ball', cat: 'Physical', requiredOvr: 80 },
    { id: 'finesse_plus', name: 'Finesse Shot+', icon: '🔥', desc: 'Ultimate finesse curve with maximum speed', cat: 'Scoring', requiredOvr: 85 }
  ];

  // Manager Objectives for current week/match
  const matchObjectives = [
    {
      id: 'obj_1',
      title: 'Match Rating Target',
      target: 'Achieve 7.2+ Match Rating',
      reward: '+3 Manager Trust • 150 EXP',
      status: (player.stats?.apps || 0) > 0 ? 'COMPLETED' : 'IN_PROGRESS',
      icon: Award
    },
    {
      id: 'obj_2',
      title: 'Tactical Execution',
      target: position === 'ST' || position === 'LW' || position === 'RW' ? 'Score or Assist 1 Goal' : 'Maintain 80%+ Pass Accuracy',
      reward: '+2 Manager Trust • 100 EXP',
      status: 'IN_PROGRESS',
      icon: Target
    },
    {
      id: 'obj_3',
      title: 'Defensive Work Rate',
      target: 'Complete 2 Successful Interceptions or Tackles',
      reward: '+2 Sharpness • 75 EXP',
      status: 'IN_PROGRESS',
      icon: Shield
    }
  ];

  // Manager Tactical System & Role
  const tacticalStyles = [
    'Gegenpress High Intensity',
    'Tiki-Taka Control',
    'Fast Counter-Attack',
    'Direct Route One',
    'Wing Overload'
  ];
  const currentTacticalStyle = tacticalStyles[(currentClub.name.length) % tacticalStyles.length];
  const roleFamiliarity = Math.min(100, Math.max(50, 60 + Math.round((player.form || 50) * 0.4)));

  // National Team Status
  const nationality = player.nationality || 'England';
  const apps = player.stats?.apps || 0;
  const intlStatus = ovr >= 82 && apps >= 30 ? 'Senior Regular' : ovr >= 75 && apps >= 15 ? 'U21 Captain' : ovr >= 70 ? 'On National Scout Radar' : 'Uncapped Prospect';

  // Toggle PlayStyle unlock
  const equippedPlayStyles = ((player.stateFlags as any)?.equippedPlayStyles as string[]) || ['finesse', 'relentless'];

  const togglePlayStyle = (id: string, requiredOvr: number) => {
    if (ovr < requiredOvr) return;
    const current = [...equippedPlayStyles];
    let updated: string[];
    if (current.includes(id)) {
      updated = current.filter(item => item !== id);
    } else {
      if (current.length >= 3) {
        updated = [...current.slice(1), id];
      } else {
        updated = [...current, id];
      }
    }

    setPlayer({
      ...player,
      stateFlags: {
        ...player.stateFlags,
        equippedPlayStyles: updated
      } as any
    });
  };

  return (
    <div className="bg-[#101211] border border-[#222] p-5 font-mono space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-pulse"></span>
            <h3 className="text-white font-black text-sm uppercase tracking-wider font-display">
              Pro Football Manager & Career Depth Center
            </h3>
          </div>
          <p className="text-[10px] text-white/50 mt-0.5">
            Manager Directives, EA FC PlayStyles, Squad Chemistry & National Scouting
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-black/60 p-1 border border-[#111] text-[10px]">
          <button
            onClick={() => setActiveTab('OBJECTIVES')}
            className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
              activeTab === 'OBJECTIVES' ? 'bg-[#00FF88] text-black shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Manager Targets
          </button>
          <button
            onClick={() => setActiveTab('TACTICS')}
            className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
              activeTab === 'TACTICS' ? 'bg-[#00FF88] text-black shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Tactics & Role
          </button>
          <button
            onClick={() => setActiveTab('PLAYSTYLES')}
            className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
              activeTab === 'PLAYSTYLES' ? 'bg-[#00FF88] text-black shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            PlayStyles
          </button>
          <button
            onClick={() => setActiveTab('NATIONAL')}
            className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
              activeTab === 'NATIONAL' ? 'bg-[#00FF88] text-black shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Int'l Duty
          </button>
        </div>
      </div>

      {/* TAB 1: MANAGER OBJECTIVES */}
      {activeTab === 'OBJECTIVES' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white/70">
            <span>Weekly & Matchday Expectations</span>
            <span className="text-[#00FF88] text-[10px]">Manager Trust: {trust}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {matchObjectives.map((obj) => {
              const Icon = obj.icon;
              const isDone = obj.status === 'COMPLETED';
              return (
                <div
                  key={obj.id}
                  className={`p-4 border transition-all ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#151716] border-[#222] hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Icon size={16} className={isDone ? 'text-emerald-400' : 'text-[#00FF88]'} />
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {isDone ? 'ACHIEVED' : 'ACTIVE'}
                    </span>
                  </div>
                  <h4 className="text-white text-xs font-bold font-sans mb-1">{obj.title}</h4>
                  <p className="text-[11px] text-white/70 leading-tight mb-2">{obj.target}</p>
                  <div className="text-[9px] text-[#00FF88] font-bold border-t border-[#111] pt-2">
                    Reward: {obj.reward}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TACTICS & ROLE FAMILIARITY */}
      {activeTab === 'TACTICS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tactical Style Box */}
            <div className="bg-[#151716] border border-[#222] p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase text-white/50 font-bold">Club Tactical System</span>
                <span className="text-xs text-[#00FF88] font-bold">{currentClub.name}</span>
              </div>
              <div className="text-sm font-bold text-white uppercase font-display flex items-center gap-2">
                <Zap size={16} className="text-[#00FF88]" />
                {currentTacticalStyle}
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">
                The manager demands high pressing transitions, intense off-the-ball runs, and quick vertical passing.
              </p>
            </div>

            {/* Role Familiarity Bar */}
            <div className="bg-[#151716] border border-[#222] p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase text-white/50 font-bold">Tactical Role Familiarity</span>
                <span className="text-xs text-[#00FF88] font-bold">{roleFamiliarity}%</span>
              </div>

              <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-[#222]">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${roleFamiliarity}%` }}
                ></div>
              </div>

              <p className="text-[10px] text-white/60">
                Position: <strong className="text-white uppercase">{position}</strong> &middot; Rating Boost Multiplier: <strong className="text-[#00FF88]">+1.15x</strong>
              </p>
            </div>
          </div>

          {/* Pitch Partnership Synergies */}
          <div className="bg-[#151716] border border-[#222] p-4 space-y-2">
            <div className="text-[10px] uppercase text-white/50 font-bold flex items-center gap-1.5">
              <Users size={12} className="text-[#00FF88]" /> Pitch Partnership Chemistry
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-black/40 p-2.5 rounded border border-[#111] flex justify-between items-center text-xs">
                <div>
                  <div className="text-white font-bold">Striker & Wing Synergy</div>
                  <div className="text-[9px] text-white/50">Combination Attack Rating</div>
                </div>
                <span className="text-[#00FF88] font-bold">88% (Deadly Duo)</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded border border-[#111] flex justify-between items-center text-xs">
                <div>
                  <div className="text-white font-bold">Midfield Engine Pivot</div>
                  <div className="text-[9px] text-white/50">Pass Understanding</div>
                </div>
                <span className="text-cyan-400 font-bold">76% (Developing)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EA FC PLAYSTYLES */}
      {activeTab === 'PLAYSTYLES' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/70 font-bold">Equipped Signature PlayStyles ({equippedPlayStyles.length}/3)</span>
            <span className="text-[10px] text-[#00FF88]">OVR Requirement Check</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {allPlayStyles.map((ps) => {
              const isUnlocked = ovr >= ps.requiredOvr;
              const isEquipped = equippedPlayStyles.includes(ps.id);

              return (
                <div
                  key={ps.id}
                  onClick={() => togglePlayStyle(ps.id, ps.requiredOvr)}
                  className={`p-3 border cursor-pointer transition-all ${
                    isEquipped
                      ? 'bg-[#00FF88]/10 border-[#00FF88] text-white '
                      : isUnlocked
                      ? 'bg-[#151716] border-[#222] hover:border-white/30 text-white/80'
                      : 'bg-black/40 border-[#111] text-white/30 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-base">{ps.icon}</span>
                    {isEquipped ? (
                      <span className="text-[8px] bg-[#00FF88] text-black font-black uppercase px-1 rounded">EQUIPPED</span>
                    ) : isUnlocked ? (
                      <span className="text-[8px] text-[#00FF88] uppercase">UNLOCK</span>
                    ) : (
                      <span className="text-[8px] text-white/40 flex items-center gap-0.5"><Lock size={8} /> {ps.requiredOvr} OVR</span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-white line-clamp-1">{ps.name}</h5>
                  <p className="text-[9px] text-white/50 line-clamp-2 mt-1 leading-tight">{ps.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: INTERNATIONAL DUTY */}
      {activeTab === 'NATIONAL' && (
        <div className="bg-[#151716] border border-[#222] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase font-display">{nationality} National Federation</h4>
                <p className="text-[10px] text-white/50">Senior & U21 International Scouting Network</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              {intlStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-black/40 p-3 rounded border border-[#111]">
              <div className="text-white/50 text-[9px] uppercase font-bold mb-1">Senior Caps</div>
              <div className="text-white font-black text-base">{player.stats?.caps || 0} Caps</div>
            </div>
            <div className="bg-black/40 p-3 rounded border border-[#111]">
              <div className="text-white/50 text-[9px] uppercase font-bold mb-1">International Goals</div>
              <div className="text-emerald-400 font-black text-base">{player.stats?.intlGoals || 0} Goals</div>
            </div>
            <div className="bg-black/40 p-3 rounded border border-[#111]">
              <div className="text-white/50 text-[9px] uppercase font-bold mb-1">Scout Recommendation</div>
              <div className="text-[#00FF88] font-bold text-xs">
                {ovr >= 80 ? 'Recommended for Senior Squad' : 'Under Observation in Domestic League'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

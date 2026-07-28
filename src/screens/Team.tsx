import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { Users, Crown, Star, Target, Shield, AlertTriangle, ArrowUpRight, Sparkles, MessageSquare } from 'lucide-react';
import { TeamLogo } from '../components/TeamLogo';
import { CLUBS } from '../data/teams';
import { getClubSquad } from '../data/sheetSquads';
import { GlossaryTooltip } from '../components/GlossaryTooltip';
import { calculateSquadChemistry } from '../utils/reputation';

export function Team() {
 const { state, setPlayer } = useGame();
 const [bondingMsg, setBondingMsg] = useState<string | null>(null);
 
 const playerClubSymbol = state.player?.currentClubSymbol || 'BIR';
 const club = CLUBS.find(c => c.symbol.toUpperCase() === playerClubSymbol.toUpperCase()) || {
 name: "Birmingham City",
 symbol: playerClubSymbol,
 league: "Championship",
 country: "England",
 tier: "Lower" as const,
 ovr: 50,
 primaryColor: "#0052CC",
 secondaryColor: "#FFFFFF"
 };

 const squad = getClubSquad(club.name);
 const clubSymbol = state.player?.currentClubSymbol || club.symbol;
 const worldClub = state.worldState?.clubs?.[clubSymbol];
 const managerName = worldClub?.manager?.name || state.player?.managerInfo?.name || squad.manager || "The Manager";
 
 // Squad Dynamics values
 const squadChemistry = state.player ? calculateSquadChemistry(state.player) : 50;
 const playerRole = state.player?.hierarchyRole || 'Fringe';
 const teammateRelation = state.player?.relationships?.teammates || 50;
 const playerForm = state.player?.form || 50;
 const mentees = (state.player?.stateFlags as any)?.openThreads?.mentees || [];
 const activeMenteesCount = mentees.filter((m: any) => m.isMentored).length;

 const handleCallTeamMeeting = () => {
  if (!state.player) return;
  const currentTeammates = state.player.relationships?.teammates || 50;
  const updatedTeammates = Math.min(100, currentTeammates + 6);
  const updatedPlayer = {
   ...state.player,
   relationships: {
    ...state.player.relationships,
    teammates: updatedTeammates
   }
  };
  setPlayer(updatedPlayer);
  setBondingMsg("💬 Players meeting held! Squad morale and peer respect improved (+6%).");
  setTimeout(() => setBondingMsg(null), 4000);
 };

 
 return (
 <div className="min-h-screen bg-black text-white p-6 pb-24 overflow-y-auto" style={{
  backgroundImage: `linear-gradient(to bottom, ${club.primaryColor}22, black 40%)`
 }}>
  <div className="max-w-5xl mx-auto space-y-6">
  
  {/* Header */}
  <div className="flex items-center gap-6 mb-8">
   <TeamLogo symbol={club.symbol} size={80} />
   <div>
    <h1 className="text-3xl font-black italic tracking-tighter uppercase">{club.name}</h1>
    <p className="text-white/60 font-medium">Manager: {managerName}</p>
   </div>
  </div>

  {/* Squad Dynamics Overview */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   
   {/* Squad Chemistry */}
   <div className="premium-card p-6 border-l-4 border-l-emerald-500 space-y-4">
    <div className="flex items-center gap-3 mb-4">
     <Users className="text-emerald-400 w-6 h-6" />
     <div className="text-xl font-bold tracking-tight"><GlossaryTooltip term="Squad Chemistry">Squad Chemistry</GlossaryTooltip></div>
    </div>
    
    <div className="space-y-4">
     <div className="flex items-end justify-between">
      <span className="text-4xl font-black">{squadChemistry}<span className="text-xl text-white/40">/100</span></span>
      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
       squadChemistry > 80 ? 'text-emerald-400 bg-emerald-500/10' :
       squadChemistry > 60 ? 'text-cyan-400 bg-cyan-500/10' :
       squadChemistry > 40 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
      }`}>
       {squadChemistry > 80 ? 'Excellent' : squadChemistry > 60 ? 'Good' : squadChemistry > 40 ? 'Average' : 'Poor'}
      </span>
     </div>
     
     <ProgressBar value={squadChemistry} showValue={false} colorMode="trust" height="h-2" />
     
     <p className="text-xs text-white/60">
      {squadChemistry > 70 
       ? "The squad is united. Players anticipate each other's movements, providing a passive bonus to Passing, Vision, and overall match performance."
       : squadChemistry > 40 
       ? "Standard cohesion. The squad functions adequately but lacks telepathic understanding on the pitch."
       : "Friction in the locker room. Misplaced passes and lack of defensive cover are prevalent."}
     </p>

     {/* Breakdown */}
     <div className="bg-white/5 p-3 rounded space-y-1.5 text-xs font-mono border border-white/5">
      <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Fluctuation Factors</div>
      <div className="flex justify-between">
       <span className="text-white/60">Teammate Peer Respect:</span>
       <span className="font-bold text-white">{teammateRelation}%</span>
      </div>
      <div className="flex justify-between">
       <span className="text-white/60">Active Mentorships:</span>
       <span className="font-bold text-emerald-400">+{activeMenteesCount * 8}%</span>
      </div>
      <div className="flex justify-between">
       <span className="text-white/60">Form Consistency:</span>
       <span className="font-bold text-white">{playerForm}%</span>
      </div>
     </div>

     {/* Team Meeting Button */}
     <div className="pt-2">
      <button
       onClick={handleCallTeamMeeting}
       className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider rounded text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
      >
       <MessageSquare size={14} className="text-[#00FF88]" />
       Call Players Meeting / Bonding Session
      </button>
      {bondingMsg && (
       <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded text-center mt-2 animate-fade-in">
        {bondingMsg}
       </div>
      )}
     </div>
    </div>
   </div>

   {/* Player's Role in Hierarchy */}
   <div className="premium-card p-6 border-l-4 flex flex-col gap-5" style={{ borderLeftColor: club.primaryColor }}>
    <div>
     <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
       <Crown className="w-6 h-6" style={{ color: club.primaryColor }} />
       <h2 className="text-xl font-bold tracking-tight">Dressing Room Hierarchy</h2>
      </div>
      <div className="bg-white/5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white/50">
       Status: <span className="text-white" style={{ color: club.primaryColor }}>{playerRole}</span>
      </div>
     </div>
     <p className="text-white/60 text-xs leading-relaxed">
      Your standing in the dressing room dictates your leadership authority, tactical chemistry buffs, and matchday composure multipliers. Earn peer respect and coach trust to ascend the hierarchy.
     </p>
    </div>
    
    <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-lg">
     <div>
      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Your Role</p>
      <p className="text-xl font-black flex items-center gap-1.5" style={{ color: club.primaryColor }}>
       {playerRole === 'Captain' && <Crown className="w-4 h-4 text-yellow-500 shrink-0" />}
       {playerRole === 'Vice-Captain' && <Star className="w-4 h-4 text-blue-400 shrink-0" />}
       {playerRole === 'Core' && <Users className="w-4 h-4 text-emerald-400 shrink-0" />}
       {playerRole === 'Fringe' && <Target className="w-4 h-4 text-zinc-400 shrink-0" />}
       {playerRole}
      </p>
     </div>
     <div className="text-right border-l border-white/10 pl-4">
      <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1"><GlossaryTooltip term="Peer Respect">Peer Respect</GlossaryTooltip></div>
      <p className="text-xl font-black">{teammateRelation}%</p>
     </div>
    </div>

    {/* Hierarchy Progression Track */}
    {playerRole !== 'Captain' && (
     <div className="border-t border-white/10 pt-4">
      <div className="flex justify-between items-center mb-2">
       <span className="text-xs font-bold text-white/70">Progression to {playerRole === 'Fringe' ? 'Core Player' : playerRole === 'Core' ? 'Vice-Captain' : 'Club Captain'}</span>
       <span className="text-[10px] font-mono text-white/40 uppercase">Requirements Track</span>
      </div>
      
      <div className="space-y-2 mb-4 bg-black/40 p-3 rounded border border-white/5">
       <div className="flex items-center justify-between text-xs">
        <span className="text-white/55">Peer Respect:</span>
        <span className={`font-mono font-bold ${teammateRelation >= (playerRole === 'Fringe' ? 60 : playerRole === 'Core' ? 75 : 85) ? 'text-emerald-400' : 'text-red-400'}`}>
         {teammateRelation} / {playerRole === 'Fringe' ? 60 : playerRole === 'Core' ? 75 : 85}% {teammateRelation >= (playerRole === 'Fringe' ? 60 : playerRole === 'Core' ? 75 : 85) ? '✓' : '✗'}
        </span>
       </div>
       <div className="flex items-center justify-between text-xs">
        <span className="text-white/55">Manager Trust:</span>
        <span className={`font-mono font-bold ${(state.player?.trust || 50) >= (playerRole === 'Fringe' ? 60 : playerRole === 'Core' ? 75 : 85) ? 'text-emerald-400' : 'text-red-400'}`}>
         {(state.player?.trust || 50)} / {playerRole === 'Fringe' ? 60 : playerRole === 'Core' ? 75 : 85}% {(state.player?.trust || 50) >= (playerRole === 'Fringe' ? 60 : playerRole === 'Core' ? 75 : 85) ? '✓' : '✗'}
        </span>
       </div>
       <div className="flex items-center justify-between text-xs">
        <span className="text-white/55">Appearances:</span>
        <span className={`font-mono font-bold ${(state.player?.stats?.apps || 0) >= (playerRole === 'Fringe' ? 5 : playerRole === 'Core' ? 15 : 25) ? 'text-emerald-400' : 'text-red-400'}`}>
         {(state.player?.stats?.apps || 0)} / {playerRole === 'Fringe' ? 5 : playerRole === 'Core' ? 15 : 25} {(state.player?.stats?.apps || 0) >= (playerRole === 'Fringe' ? 5 : playerRole === 'Core' ? 15 : 25) ? '✓' : '✗'}
        </span>
       </div>
       {playerRole === 'Vice-Captain' && (
        <div className="text-[10px] text-white/40 italic leading-snug border-t border-white/5 pt-1.5 mt-1">
         *After fulfilling conditions, transition to Club Captain occurs dynamically upon leadership vacancy (20% weekly chance on week advances).
        </div>
       )}
      </div>
     </div>
    )}

    {/* Hierarchy Roles & Active Standing Benefits */}
    <div className="space-y-2.5 text-xs text-white/70 border-t border-white/10 pt-4">
     <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Locker Room Power Dynamics</div>
     
     <div className={`p-2.5 rounded border transition-all ${playerRole === 'Captain' ? 'bg-yellow-500/10 border-yellow-500/35' : 'bg-white/5 border-white/5'}`}>
      <div className="flex items-center justify-between mb-1">
       <span className="flex items-center gap-1.5 font-bold text-yellow-400"><Crown className="w-3.5 h-3.5"/> Club Captain</span>
       {playerRole === 'Captain' && <span className="text-[9px] bg-yellow-500/20 text-yellow-300 font-bold px-1.5 py-0.5 rounded uppercase">Your Status</span>}
      </div>
      <p className="text-white/50 text-[10px] leading-relaxed">
       <strong>Unlocks:</strong> Team Armband. Direct Consultative Player Council authority. passive +10% base chance success on close-match composure checks for all teammates during matches.
      </p>
     </div>

     <div className={`p-2.5 rounded border transition-all ${playerRole === 'Vice-Captain' ? 'bg-blue-500/10 border-blue-500/35' : 'bg-white/5 border-white/5'}`}>
      <div className="flex items-center justify-between mb-1">
       <span className="flex items-center gap-1.5 font-bold text-blue-400"><Star className="w-3.5 h-3.5"/> Vice-Captain</span>
       {playerRole === 'Vice-Captain' && <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded uppercase">Your Status</span>}
      </div>
      <p className="text-white/50 text-[10px] leading-relaxed">
       <strong>Unlocks:</strong> Match leadership fallback. Direct access to player council consults. passive +5% composure check buff.
      </p>
     </div>

     <div className={`p-2.5 rounded border transition-all ${playerRole === 'Core' ? 'bg-emerald-500/10 border-emerald-500/35' : 'bg-white/5 border-white/5'}`}>
      <div className="flex items-center justify-between mb-1">
       <span className="flex items-center gap-1.5 font-bold text-emerald-400"><Users className="w-3.5 h-3.5"/> Core Player</span>
       {playerRole === 'Core' && <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded uppercase">Your Status</span>}
      </div>
      <p className="text-white/50 text-[10px] leading-relaxed">
       <strong>Unlocks:</strong> High squad stability. Passive +5% teammate chemistry gain during organized training drills.
      </p>
     </div>

     <div className={`p-2.5 rounded border transition-all ${playerRole === 'Fringe' ? 'bg-zinc-500/15 border-zinc-500/30' : 'bg-white/5 border-white/5'}`}>
      <div className="flex items-center justify-between mb-1">
       <span className="flex items-center gap-1.5 font-bold text-zinc-400"><Target className="w-3.5 h-3.5"/> Fringe Player</span>
       {playerRole === 'Fringe' && <span className="text-[9px] bg-zinc-500/30 text-zinc-300 font-bold px-1.5 py-0.5 rounded uppercase">Your Status</span>}
      </div>
      <p className="text-white/50 text-[10px] leading-relaxed">
       Rotational player. Minimum authority in the locker room. Standard contract evaluation standing.
      </p>
     </div>
    </div>
   </div>

  </div>

  {/* Roster Overview */}
  <div className="premium-card p-6">
   <h2 className="text-xl font-bold tracking-tight mb-4">First Team Squad</h2>
   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
    {squad.players.slice(0, 18).map((p, i) => (
     <div key={i} className="glass-panel p-3 flex items-center justify-between">
      <div>
       <p className="font-bold text-sm">{p.name}</p>
       <p className="text-xs text-white/50">{(p as any).position || (i === 0 ? 'GK' : i < 5 ? 'DF' : i < 12 ? 'MF' : 'FW')}</p>
      </div>
      <div className="text-right">
       <p className="text-sm font-black">{p.ovr}</p>
      </div>
     </div>
    ))}
   </div>
  </div>

  </div>
 </div>
 );
}

import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { Users, MessageSquare, CheckCircle2 } from 'lucide-react';
import { CLUBS } from '../data/teams';
import { getClubSquad } from '../data/sheetSquads';
import { calculateSquadChemistry } from '../utils/reputation';
import { ManagerMeetingModal } from '../components/ManagerMeetingModal';

export function Team() {
 const { state } = useGame();
 const [isMeetingModalOpen, setIsMeetingModalOpen] = useState<boolean>(false);
 const [tacticsSavedToast, setTacticsSavedToast] = useState<string | null>(null);
 
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
 const squadChemistry = state.player ? calculateSquadChemistry(state.player) : 50;
 const playerRole = state.player?.hierarchyRole || 'Fringe';
 const teammateRelation = state.player?.relationships?.teammates || 50;

 const handleSaveTactics = () => {
  setTacticsSavedToast('Tactics & Starting XI Saved Successfully');
  setTimeout(() => setTacticsSavedToast(null), 3000);
 };

 return (
  <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-6 pb-24 space-y-6 max-w-5xl mx-auto font-mono select-none">
   
   {/* Header & Eyebrow */}
   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
    <div>
     <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
      {club.league} · {club.name}
     </span>
     <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">Squad & Tactics</h1>
    </div>

    <div className="flex items-center gap-2">
     <button
       onClick={() => setIsMeetingModalOpen(true)}
       className="px-4 py-2.5 bg-neutral-900 border border-white/10 hover:border-emerald-400 text-emerald-400 font-bold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 min-h-[44px] cursor-pointer"
     >
       <MessageSquare size={16} /> Manager Meeting
     </button>
    </div>
   </div>

   {tacticsSavedToast && (
    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in shadow-lg">
     <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
     <span className="font-bold">{tacticsSavedToast}</span>
    </div>
   )}

   {/* Squad Chemistry & Role Overview */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md space-y-3">
     <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Squad Chemistry</span>
      <span className="text-sm font-black text-emerald-400">{squadChemistry} / 100</span>
     </div>
     <ProgressBar value={squadChemistry} showValue={false} colorMode="trust" height="h-2" />
     <p className="text-xs text-neutral-400">
      {squadChemistry > 70 ? "The squad is united and fluid in tactical execution." : "Cohesion is average. Maintain high form and team involvement."}
     </p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md flex flex-col justify-between">
     <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Locker Room Standing</span>
      <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded bg-white/5 border border-white/10">{playerRole}</span>
     </div>
     <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
      <span>Peer Respect: <strong className="text-white">{teammateRelation}%</strong></span>
      <span>Manager Trust: <strong className="text-emerald-400">{state.player?.trust || 50}%</strong></span>
     </div>
    </div>
   </div>

   {/* Simplified Pitch & Formation Overview */}
   <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md space-y-4">
    <div className="flex items-center justify-between border-b border-white/5 pb-3">
     <div className="flex items-center gap-2">
      <Users size={16} className="text-emerald-400" />
      <span className="text-xs font-bold uppercase tracking-wider text-white">Formation: 4-3-3 Attacking</span>
     </div>
     <span className="text-[10px] font-mono text-neutral-400">STARTING XI</span>
    </div>

    {/* Pitch Graphic Preview */}
    <div className="relative w-full h-72 bg-[#113820] border border-white/10 rounded-xl overflow-hidden p-4 flex flex-col justify-between items-center shadow-inner">
     <div className="absolute inset-0 opacity-15 pointer-events-none">
      <div className="w-full h-full border border-white" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 -mt-12 -ml-12 border border-white rounded-full" />
     </div>

     {/* Forward Row */}
     <div className="flex justify-around w-full z-10">
      {squad.players.slice(0, 3).map((p, idx) => (
       <div key={idx} className="bg-neutral-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-center shadow">
        <span className="block text-[10px] font-bold text-white truncate max-w-[90px]">{p.name}</span>
        <span className="text-[9px] font-mono text-emerald-400">{p.ovr} OVR</span>
       </div>
      ))}
     </div>

     {/* Midfield Row */}
     <div className="flex justify-around w-full z-10">
      {squad.players.slice(3, 6).map((p, idx) => (
       <div key={idx} className="bg-neutral-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-center shadow">
        <span className="block text-[10px] font-bold text-white truncate max-w-[90px]">{p.name}</span>
        <span className="text-[9px] font-mono text-emerald-400">{p.ovr} OVR</span>
       </div>
      ))}
     </div>

     {/* Defensive Row */}
     <div className="flex justify-around w-full z-10">
      {squad.players.slice(6, 10).map((p, idx) => (
       <div key={idx} className="bg-neutral-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-center shadow">
        <span className="block text-[10px] font-bold text-white truncate max-w-[90px]">{p.name}</span>
        <span className="text-[9px] font-mono text-emerald-400">{p.ovr} OVR</span>
       </div>
      ))}
     </div>

     {/* Goalkeeper */}
     <div className="z-10">
      <div className="bg-neutral-900/90 border border-amber-500/40 px-3 py-1.5 rounded-lg text-center shadow">
       <span className="block text-[10px] font-bold text-white truncate max-w-[90px]">{squad.players[10]?.name || 'Goalkeeper'}</span>
       <span className="text-[9px] font-mono text-amber-400">{squad.players[10]?.ovr || 75} OVR</span>
      </div>
     </div>
    </div>
   </div>

   {/* Single Primary CTA */}
   <div>
    <button
     onClick={handleSaveTactics}
     className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 min-h-[44px] cursor-pointer"
    >
     SAVE TACTICS & STARTING XI →
    </button>
   </div>

   <ManagerMeetingModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} />
  </div>
 );
}

import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { Users, MessageSquare, CheckCircle2, ShieldAlert, Users2, Zap } from 'lucide-react';
import { CLUBS } from '../data/teams';
import { getClubSquad } from '../data/sheetSquads';
import { calculateSquadChemistry } from '../utils/reputation';
import { ManagerMeetingModal } from '../components/ManagerMeetingModal';
import { getDeterministicPersonality, getNPCRelationshipLabel } from '../utils/npcEngine';
import { getSquadHarmony, getCliqueDetails, RUMBLE_SCENARIOS } from '../utils/gameRefinements';

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
 const isYouthSquad = state.player?.contract.status === 'Youth';
 
 // Filter players based on squad level
 let displayPlayers = squad.players || [];
 if (isYouthSquad) {
   displayPlayers = displayPlayers.filter((p: any) => p.isYouth);
 } else {
   displayPlayers = displayPlayers.filter((p: any) => !p.isYouth);
 }
 // Sort by OVR to ensure best players are on the pitch
 displayPlayers = [...displayPlayers].sort((a: any, b: any) => b.ovr - a.ovr);

 const squadChemistry = state.player ? calculateSquadChemistry(state.player) : 50;
 const squadHarmony = state.player ? getSquadHarmony(state.player) : 50;
 const cliqueInfo = state.player ? getCliqueDetails(state.player) : {
  dominantClique: 'Core Standard',
  description: 'Typical professional atmosphere. Sub-groups exist based on nationality and age.',
  cliques: [
   { name: 'Core Standard', size: 10, rapport: 65, alignment: 'Neutral' },
   { name: 'Foreign Contingent', size: 6, rapport: 58, alignment: 'Neutral' },
   { name: 'Academy Prospects', size: 4, rapport: 60, alignment: 'Eager' }
  ]
 };
 const playerRole = state.player?.hierarchyRole || 'Fringe';
 const teammateRelation = state.player?.relationships?.teammates || 50;
 const npcRelations = state.player?.relationships?.npc || {};

 const handleSaveTactics = () => {
  setTacticsSavedToast('Tactics & Starting XI Saved Successfully');
  setTimeout(() => setTacticsSavedToast(null), 3000);
 };

 const renderPlayerCard = (p: any, isGk: boolean = false) => {
   if (!p) return null;
   const relationshipScore = npcRelations[p.name] || 50;
   const label = getNPCRelationshipLabel(relationshipScore);
   const personality = getDeterministicPersonality(p.name);
   
   return (
     <div className={`bg-[#0a0a0a] border ${isGk ? 'border-amber-500/40' : 'border-emerald-500/40'} px-3 py-1.5 text-center shadow group relative hover:z-20 transition-all`}>
       <span className="block text-[10px] font-bold text-white truncate max-w-[90px]">{p.name}</span>
       <span className={`text-[9px] font-mono ${isGk ? 'text-amber-400' : 'text-emerald-400'}`}>{p.ovr} OVR</span>
       
       {/* Hover tooltip for relationships */}
       <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-[#333] -top-16 left-1/2 -translate-x-1/2 w-48 p-2 rounded pointer-events-none z-50 text-left">
         <div className="text-[10px] text-white/70 uppercase tracking-widest border-b border-[#222] pb-1 mb-1">{personality}</div>
         <div className="flex justify-between items-center text-xs">
           <span className="text-white">Relationship:</span>
           <span className={`font-bold ${relationshipScore >= 80 ? 'text-emerald-400' : relationshipScore <= 40 ? 'text-red-400' : 'text-white/80'}`}>{label}</span>
         </div>
       </div>
     </div>
   );
 };

 return (
  <div className="min-h-screen bg-black text-white p-4 sm:p-6 pb-24 space-y-6 max-w-5xl mx-auto font-mono select-none">
   
   {/* Header & Eyebrow */}
   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#222] pb-4">
    <div>
     <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
      {club.league} · {club.name}
     </span>
     <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">Squad & Tactics</h1>
    </div>

    <div className="flex items-center gap-2">
     <button
       onClick={() => setIsMeetingModalOpen(true)}
       className="px-4 py-2.5 bg-[#0a0a0a] border border-[#222] hover:border-emerald-400 text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 min-h-[44px] cursor-pointer"
     >
       <MessageSquare size={16} /> Manager Meeting
     </button>
    </div>
   </div>

   {tacticsSavedToast && (
    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in ">
     <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
     <span className="font-bold">{tacticsSavedToast}</span>
    </div>
   )}

   {/* Squad Chemistry & Role Overview */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="border border-[#222] bg-[#0a0a0a] p-5 space-y-3">
     <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Squad Chemistry</span>
      <span className="text-sm font-black text-emerald-400">{squadChemistry} / 100</span>
     </div>
     <ProgressBar value={squadChemistry} showValue={false} colorMode="trust" height="h-2" />
     <p className="text-xs text-neutral-400">
      {squadChemistry > 70 ? "The squad is united and fluid in tactical execution." : "Cohesion is average. Maintain high form and team involvement."}
     </p>
    </div>

    <div className="border border-[#222] bg-[#0a0a0a] p-5 space-y-3">
     <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Squad Harmony (Synthesis)</span>
      <span className="text-sm font-black text-emerald-400">{squadHarmony} / 100</span>
     </div>
     <ProgressBar value={squadHarmony} showValue={false} colorMode="trust" height="h-2" />
     <p className="text-xs text-neutral-400">
      Synthesis of peer respect (50%), squad cohesion (30%), and manager trust (20%).
     </p>
    </div>

    <div className="border border-[#222] bg-[#0a0a0a] p-5 flex flex-col justify-between">
     <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Locker Room Standing</span>
      <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded bg-white/5 border border-[#222]">{playerRole}</span>
     </div>
     <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-[#111]">
      <span>Peer Respect: <strong className="text-white">{teammateRelation}%</strong></span>
      <span>Manager Trust: <strong className="text-emerald-400">{state.player?.trust || 50}%</strong></span>
     </div>
    </div>
   </div>

   {/* Squad Cliques & Locker Room Dynamics */}
   <div className="border border-[#222] bg-[#0a0a0a] p-5 space-y-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#111] pb-3">
     <div className="flex items-center gap-2">
      <Users2 size={18} className="text-emerald-400" />
      <span className="text-xs font-bold uppercase tracking-wider text-white">Locker Room Cliques & Subgroup Dynamics</span>
     </div>
     <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border ${
      cliqueInfo.dominantClique === 'United Front' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' :
      cliqueInfo.dominantClique === 'Fractured Front' ? 'border-red-500/40 text-red-400 bg-red-500/10' :
      'border-amber-500/40 text-amber-400 bg-amber-500/10'
     }`}>
      {cliqueInfo.dominantClique}
     </span>
    </div>

    <p className="text-xs text-neutral-300 leading-relaxed">
     {cliqueInfo.description}
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
     {cliqueInfo.cliques.map((clique: any, idx: number) => (
      <div key={idx} className="bg-black border border-[#222] p-3 space-y-2">
       <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white">{clique.name}</span>
        <span className="text-[10px] text-neutral-400 font-mono">{clique.size} players</span>
       </div>
       <div className="flex items-center justify-between text-[11px]">
        <span className="text-neutral-400">Rapport:</span>
        <span className="font-bold text-emerald-400">{clique.rapport}%</span>
       </div>
       <div className="text-[10px] uppercase font-bold text-right text-neutral-400">
        Status: <span className="text-white">{clique.alignment}</span>
       </div>
      </div>
     ))}
    </div>
   </div>

   {/* Dressing Room Friction & Potential Rumbles */}
   <div className="border border-[#222] bg-[#0a0a0a] p-5 space-y-4">
    <div className="flex items-center gap-2 border-b border-[#111] pb-3">
     <ShieldAlert size={18} className="text-amber-400" />
     <span className="text-xs font-bold uppercase tracking-wider text-white">Dressing Room Conflict Scenarios (Rumbles)</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
     {RUMBLE_SCENARIOS.map((sc, idx) => (
      <div key={idx} className="bg-black border border-[#111] p-3 space-y-1.5">
       <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
         <Zap size={12} /> {sc.type}
        </span>
        <span className="text-[9px] font-mono uppercase text-neutral-500">Scenario {idx + 1}</span>
       </div>
       <p className="text-[11px] text-neutral-400 line-clamp-2">{sc.description}</p>
       <p className="text-[9px] text-neutral-500 italic pt-1 border-t border-[#111]">{sc.preconditionDesc}</p>
      </div>
     ))}
    </div>
   </div>

   {/* Simplified Pitch & Formation Overview */}
   <div className="border border-[#222] bg-[#0a0a0a] p-5 space-y-4">
    <div className="flex items-center justify-between border-b border-[#111] pb-3">
     <div className="flex items-center gap-2">
      <Users size={16} className="text-emerald-400" />
      <span className="text-xs font-bold uppercase tracking-wider text-white">Formation: 4-3-3 Attacking</span>
     </div>
     <span className="text-[10px] font-mono text-neutral-400">STARTING XI</span>
    </div>

    {/* Pitch Graphic Preview */}
    <div className="relative w-full h-72 bg-[#113820] border border-[#222] overflow-hidden p-4 flex flex-col justify-between items-center shadow-inner">
     <div className="absolute inset-0 opacity-15 pointer-events-none">
      <div className="w-full h-full border border-white" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 -mt-12 -ml-12 border border-white rounded-full" />
     </div>

     {/* Forward Row */}
     <div className="flex justify-around w-full z-10">
      {displayPlayers.slice(0, 3).map((p, idx) => (
       <React.Fragment key={idx}>{renderPlayerCard(p)}</React.Fragment>
      ))}
     </div>

     {/* Midfield Row */}
     <div className="flex justify-around w-full z-10">
      {displayPlayers.slice(3, 6).map((p, idx) => (
       <React.Fragment key={idx}>{renderPlayerCard(p)}</React.Fragment>
      ))}
     </div>

     {/* Defensive Row */}
     <div className="flex justify-around w-full z-10">
      {displayPlayers.slice(6, 10).map((p, idx) => (
       <React.Fragment key={idx}>{renderPlayerCard(p)}</React.Fragment>
      ))}
     </div>

     {/* Goalkeeper */}
     <div className="z-10">
      {renderPlayerCard(displayPlayers[10], true)}
     </div>
    </div>
   </div>

   {/* Single Primary CTA */}
   <div>
    <button
     onClick={handleSaveTactics}
     className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] min-h-[44px] cursor-pointer"
    >
     SAVE TACTICS & STARTING XI →
    </button>
   </div>

   <ManagerMeetingModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} />
  </div>
 );
}

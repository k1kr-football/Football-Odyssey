import { useEffect, useState } from 'react';
import { StoryOverlay } from './StoryOverlay';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './Sidebar';
import { useGame } from '../store/GameContext';
import { useAPEngine } from '../hooks/useAPEngine';
import { APHeaderWidget } from './APHeaderWidget';
import { getTeamColors } from '../utils/teamColors';
import { getFormattedCalendarDate } from '../utils/careerSystems';
import { Calendar as CalendarIcon, Award, Coins, ChevronDown, ChevronUp, RefreshCw, Star, Info, Landmark } from 'lucide-react';

export function MainLayout({ children }: { children: React.ReactNode }) {
 const { state, setScreen } = useGame();
 const { checkCutscenes } = useGame();
 const { apState } = useAPEngine();
 
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);

 useEffect(() => {
  checkCutscenes();
 }, [state.currentDay, state.player?.stats, state.screen, state.activeEvent]);

 if (state.screen === 'CREATION' || state.screen === 'TRIAL_MATCH') {
  return <div className="h-full bg-[#0E0E0E] text-white flex flex-col font-mono">{children}</div>;
 }

 if (!state.player) {
  return (
   <div className="h-screen w-screen flex bg-[#080A09] text-white font-mono items-center justify-center p-6 select-none">
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
     <div className="w-16 h-16 rounded-full bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 flex items-center justify-center mx-auto text-2xl font-black">
      ⚽
     </div>
     <h2 className="text-2xl font-black uppercase tracking-tight text-white">No Active Career</h2>
     <p className="text-xs text-white/60 leading-relaxed">
      No player career session is currently loaded. Return to the main menu to begin a new pro career or restore your save state.
     </p>
     <button
      onClick={() => setScreen('MAIN_MENU')}
      className="w-full py-3.5 bg-[#00FF88] hover:bg-white text-black font-black uppercase text-xs rounded-xl tracking-widest transition-all cursor-pointer shadow-lg shadow-[#00FF88]/10 active:scale-98"
     >
      Return to Main Menu
     </button>
    </div>
   </div>
  );
 }

 const balance = state.player?.finances.balance || 0;
 const weeklySponsor = (state.player?.reputation.world || 0) * 1500;
 const isTransferWindow = [1,2,3,4,25,26,27,28].includes(state.currentWeek);

 return (
  <div className="h-full w-full flex bg-[#0E0E0E] text-[#cccccc] font-mono overflow-hidden select-none">
   <Sidebar />
   
   <main className="flex-1 flex flex-col h-full bg-[#0E0E0E] relative stadium-glow-overlay min-w-0 overflow-hidden">
    
    {/* Landscape Compact Status Bar */}
    <header className="h-12 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30">
     
     {/* App and Campaign Phase */}
     <div className="flex items-center gap-2">
      <span className="text-white font-black uppercase tracking-wider text-[11px] font-display">
       Football Odyssey
      </span>
      <span className="hidden sm:inline text-white/30 text-[9px] font-bold">&middot;</span>
      <span className="hidden sm:inline text-[#00FF88] text-[9px] font-bold uppercase tracking-wider">
       {state.currentWeek >= 1 && state.currentWeek <= 4 && "Pre-Season"}
       {state.currentWeek >= 5 && state.currentWeek <= 40 && "Domestic Campaign"}
       {state.currentWeek >= 41 && state.currentWeek <= 52 && "Off-Season"}
      </span>
     </div>

     {/* Compact Touch-Friendly Info Pills */}
     <div className="flex items-center gap-1.5 sm:gap-3">
      
      {/* Date Pill */}
      <button 
       onClick={() => setIsDrawerOpen(!isDrawerOpen)}
       className="h-8 px-2 sm:px-3 rounded-lg border border-white/5 bg-[#121212] hover:border-white/20 active:scale-95 transition-all flex items-center gap-1.5 text-left cursor-pointer"
      >
       <CalendarIcon size={12} className="text-[#00FF88] shrink-0" />
       <span className="text-white font-bold text-[10px] uppercase font-mono tracking-wider">
        {getFormattedCalendarDate(state.currentWeek, state.currentDay)}
       </span>
      </button>

      {/* OVR / Condition Pill */}
      <button 
       onClick={() => setIsDrawerOpen(!isDrawerOpen)}
       className="h-8 px-2 sm:px-3 rounded-lg border border-white/5 bg-[#121212] hover:border-white/20 active:scale-95 transition-all flex items-center gap-1.5 text-left cursor-pointer"
      >
       <Award size={12} className="text-[#00FF88] shrink-0" />
       <span className="text-white font-bold text-[10px] uppercase font-mono tracking-wider whitespace-nowrap">
        {state.player?.ovr} OVR &middot; {Math.max(0, 100 - (state.player?.fatigue || 20))}% COND
       </span>
      </button>

      {/* AP Header Widget */}
      <div className="hidden sm:block">
       <APHeaderWidget apState={apState} />
      </div>

      {/* Financial Pill */}
      <button 
       onClick={() => setIsDrawerOpen(!isDrawerOpen)}
       className="h-8 px-2 sm:px-3 rounded-lg border border-white/5 bg-[#121212] hover:border-white/20 active:scale-95 transition-all flex items-center gap-1.5 text-left cursor-pointer"
      >
       <Coins size={12} className="text-emerald-500 shrink-0" />
       <span className="text-white font-bold text-[10px] uppercase font-mono tracking-wider">
        £{balance.toLocaleString()}
       </span>
      </button>

      {/* Expand/Collapse Toggle */}
      <button 
       onClick={() => setIsDrawerOpen(!isDrawerOpen)}
       className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 bg-[#121212] hover:text-white transition-all cursor-pointer ${
        isDrawerOpen ? 'border-[#00FF88] text-[#00FF88]' : 'text-white/40'
       }`}
       title="Toggle Career Drawer"
      >
       {isDrawerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

     </div>
    </header>

    {/* Expandable Career Detail Drawer */}
    {isDrawerOpen && (
     <div className="absolute top-12 left-0 right-0 z-20 bg-[#0a0a0a]/98 border-b border-white/10 shadow-2xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-top duration-200 select-none font-mono">
      
      {/* Calendar Detail Panel */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 flex flex-col justify-between">
       <div>
        <div className="text-[9px] uppercase tracking-widest text-[#00FF88] font-black mb-1 flex items-center gap-1">
         <CalendarIcon size={10} /> Calendar Ledger
        </div>
        <div className="text-white font-bold text-sm uppercase">
         {getFormattedCalendarDate(state.currentWeek, state.currentDay)}
        </div>
        <div className="text-[10px] text-white/50 mt-1 leading-relaxed">
         Current Status: {state.currentWeek >= 1 && state.currentWeek <= 4 ? 'Pre-Season preparation matches.' : state.currentWeek <= 40 ? 'Main championship domestic campaign.' : 'Rest and recovery off-season.'}
        </div>
       </div>
       <div className="text-[9px] text-white/40 mt-3 border-t border-white/5 pt-2 flex items-center gap-1.5">
        <Info size={10} /> Transfer Window: {isTransferWindow ? 'OPEN 🟢' : 'CLOSED 🔴'}
       </div>
      </div>

      {/* Performance Stats Panel */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 flex flex-col justify-between">
       <div>
        <div className="text-[9px] uppercase tracking-widest text-[#00FF88] font-black mb-1 flex items-center gap-1">
         <Award size={10} /> Biometrics & Standing
        </div>
        <div className="text-white font-bold text-sm uppercase">
         {state.player?.firstName} {state.player?.lastName}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
         <div className="text-white/50">Position: <strong className="text-white uppercase">{state.player?.position}</strong></div>
         <div className="text-white/50">Morale: <strong className="text-white">{state.player?.morale}%</strong></div>
         <div className="text-white/50">Reputation: <strong className="text-white">{Math.round(state.player?.reputation?.world || 0)}%</strong></div>
         <div className="text-white/50">Sharpness: <strong className="text-white">{state.player?.sharpness}%</strong></div>
        </div>
       </div>
       <div className="text-[9px] text-white/40 mt-3 border-t border-white/5 pt-2 flex items-center gap-1.5">
        <Star size={10} /> Standard Squad Standing: {state.player?.roleSpecialization?.selectedRoleId || 'None'}
       </div>
      </div>

      {/* Finance Panel */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 flex flex-col justify-between">
       <div>
        <div className="text-[9px] uppercase tracking-widest text-emerald-500 font-black mb-1 flex items-center gap-1">
         <Landmark size={10} /> Financial Ledger
        </div>
        <div className="text-white font-bold text-sm uppercase">
         £{balance.toLocaleString()}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
         <div className="text-white/50">Sponsor: <strong className="text-emerald-400">+£{weeklySponsor.toLocaleString()}/w</strong></div>
         <div className="text-white/50">Weekly Wage: <strong className="text-emerald-400">£{(state.player?.contract?.wage || 0).toLocaleString()}/w</strong></div>
         <div className="text-white/50">Net Assets: <strong className="text-white">£{((((state.player as any)?.stateFlags?.openThreads?.investments?.properties?.length || 0) * 120000) + balance).toLocaleString()}</strong></div>
         <div className="text-white/50">Properties: <strong className="text-white">{((state.player as any)?.stateFlags?.openThreads?.investments?.properties?.length || 0)} owned</strong></div>
        </div>
       </div>
       <button
        onClick={() => setIsDrawerOpen(false)}
        className="w-full mt-3 py-1 bg-[#151515] hover:bg-[#202020] border border-white/5 hover:border-white/10 rounded text-[9px] text-white uppercase font-bold tracking-widest transition-all"
       >
        Close Ledger
       </button>
      </div>

     </div>
    )}

    {/* Scrollable Content Area with comfortable padding */}
    <div className="flex-1 overflow-y-auto px-2 py-2 sm:px-4 sm:py-4 md:px-6 md:py-6 relative flex flex-col min-h-0 w-full" onClick={() => isDrawerOpen && setIsDrawerOpen(false)}>
     <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col min-h-0">
      {children}
     </div>
    </div>
    
    {state.activeCutscene && <StoryOverlay />}

   </main>
  </div>
 );
}

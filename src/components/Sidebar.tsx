import React from 'react';
import { useGame } from '../store/GameContext';
import { Screen } from '../store/GameContext';
import { User, Mail, Dumbbell, Users, Calendar, Trophy, LogOut, Home, LineChart, Heart, ArrowLeftRight, Coins, BookOpen } from 'lucide-react';
import { TeamLogo } from './TeamLogo';
import { CLUBS } from '../data/teams';

const navItems: { id: Screen; label: string; icon: React.ReactNode; requiresPattern?: 'matchday' }[] = [
 { id: 'HUB', label: 'HOME', icon: <Home size={18} /> },
 { id: 'INBOX', label: 'INBOX', icon: <Mail size={18} /> },
 { id: 'TEAM', label: 'SQUAD', icon: <Users size={18} /> },
 { id: 'TRAINING', label: 'TRAINING', icon: <Dumbbell size={18} /> },
 { id: 'SOCIAL', label: 'SOCIAL', icon: <Heart size={18} /> },
 { id: 'TRANSFERS', label: 'TRANSFERS', icon: <ArrowLeftRight size={18} /> },
 { id: 'FINANCES', label: 'FINANCES', icon: <Coins size={18} /> },
 { id: 'LIFESTYLE', label: 'LIFESTYLE', icon: <LineChart size={18} /> },
 { id: 'SCHEDULE', label: 'SCHEDULE', icon: <Calendar size={18} /> },
 { id: 'CAREER', label: 'CAREER', icon: <User size={18} /> },
 { id: 'GLOSSARY', label: 'GLOSSARY', icon: <BookOpen size={18} /> }
];

export function Sidebar() {
 const { state, setScreen, saveAndQuit } = useGame();
 
 if (state.screen === 'CREATION') return null;

 const unreadCount = state.inbox ? state.inbox.filter((m: any) => !m.read).length : 0;
 const isMatchday = state.currentDay === 'SAT';

 return (
  <aside className="w-16 sm:w-20 premium-card border-r border-white/10 flex flex-col items-center h-full font-mono shrink-0 bg-[#070707] py-4 select-none">
   {/* Player Identity (Mini Team Crest) */}
   <div className="mb-6 flex flex-col items-center shrink-0">
    {(() => {
     const club = CLUBS.find(c => c.symbol.toUpperCase() === state.player?.currentClubSymbol?.toUpperCase());
     return club ? (
      <button 
       onClick={() => setScreen('PROFILE')} 
       className="p-1 rounded-full border border-white/10 bg-[#0e0e0e] hover:border-[#00FF88] hover:scale-105 active:scale-95 transition-all w-12 h-12 flex items-center justify-center cursor-pointer"
       title="View Profile"
      >
       <TeamLogo
        symbol={club.symbol}
        name={club.name}
        primaryColor={club.primaryColor}
        secondaryColor={club.secondaryColor}
        size={32}
       />
      </button>
     ) : null;
    })()}
    <div className="text-[8px] text-white/40 font-bold mt-1 uppercase tracking-wider">{state.player?.currentClubSymbol}</div>
   </div>

   {/* Navigation Items (Scrollable Column) */}
   <div className="flex-1 w-full overflow-y-auto hide-scrollbar flex flex-col items-center gap-3 px-2">
    {navItems.map((item) => {
     const isActive = state.screen === item.id;
     const isDisabled = item.requiresPattern === 'matchday' && !isMatchday;
     
     return (
      <button
       key={item.id}
       onClick={() => {
        if (!isDisabled) setScreen(item.id);
       }}
       disabled={isDisabled}
       title={item.label}
       className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 border
       ${isDisabled 
        ? 'opacity-20 cursor-not-allowed border-transparent text-white/30' 
        : isActive 
        ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88] shadow-lg shadow-[#00FF88]/5 scale-105' 
        : 'border-transparent text-white/50 hover:text-white hover:bg-white/5 hover:border-white/10 active:scale-95'
       }`}
      >
       {/* Icon wrapper to ensure 20px size */}
       <div className="transform transition-transform scale-110">
        {React.cloneElement(item.icon as React.ReactElement, { size: 20 } as any)}
       </div>

       {/* Unread count badge */}
       {item.id === 'INBOX' && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-black animate-pulse">
         {unreadCount}
        </span>
       )}
      </button>
     );
    })}
   </div>

   {/* Save & Exit Option at bottom */}
   <div className="mt-auto pt-4 border-t border-white/5 w-full flex justify-center shrink-0">
    <button 
     onClick={saveAndQuit}
     title="SAVE & EXIT"
     className="w-12 h-12 rounded-xl flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 active:scale-95 border border-transparent transition-all cursor-pointer"
    >
     <LogOut size={20} />
    </button>
   </div>
  </aside>
 );
}

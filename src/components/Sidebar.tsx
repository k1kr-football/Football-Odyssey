import React from 'react';
import { useGame } from '../store/GameContext';
import { Screen } from '../store/GameContext';
import { User, Mail, MessageSquare, Dumbbell, Users, Calendar, Trophy, LogOut, Home, LineChart, Heart, ArrowLeftRight, Coins, BookOpen, Briefcase, ShieldAlert } from 'lucide-react';
import { TeamLogo } from './TeamLogo';
import { CLUBS } from '../data/teams';
import { isDecisionRequired } from '../utils/notifications';

const navItems: { id: Screen; label: string; icon: React.ReactNode; requiresPattern?: 'matchday' }[] = [
 { id: 'HUB', label: 'HOME', icon: <Home size={18} /> },
 { id: 'MATCH', label: 'MATCHDAY FIXTURE', icon: <Trophy size={18} />, requiresPattern: 'matchday' },
 { id: 'INBOX', label: 'INBOX', icon: <Mail size={18} /> },
 { id: 'MESSAGES', label: 'CHATS', icon: <MessageSquare size={18} /> },
 { id: 'TEAM', label: 'SQUAD', icon: <Users size={18} /> },
 { id: 'CLUB', label: 'CLUB', icon: <ShieldAlert size={18} /> },
 { id: 'TRAINING', label: 'DAILY FOCUS', icon: <Dumbbell size={18} /> },
 { id: 'SOCIAL', label: 'SOCIAL', icon: <Heart size={18} /> },
 { id: 'TRANSFERS', label: 'TRANSFERS', icon: <ArrowLeftRight size={18} /> },
 { id: 'FINANCES', label: 'FINANCES', icon: <Coins size={18} /> },
 { id: 'AGENT', label: 'AGENCY', icon: <Briefcase size={18} /> },
 { id: 'LIFESTYLE', label: 'LIFESTYLE', icon: <LineChart size={18} /> },
 { id: 'SCHEDULE', label: 'SCHEDULE', icon: <Calendar size={18} /> },
 { id: 'CAREER', label: 'CAREER', icon: <User size={18} /> },
 { id: 'GLOSSARY', label: 'GLOSSARY', icon: <BookOpen size={18} /> }
];

export function Sidebar() {
 const { state, setScreen, saveAndQuit } = useGame();
 
 if (state.screen === 'CREATION') return null;

 const isMatchLocked = state.screen === 'MATCH' || state.screen === 'TRIAL_MATCH';
 const unreadCount = state.inbox ? state.inbox.filter((m: any) => !m.read).length : 0;
 const hasPendingDecision = state.inbox ? state.inbox.some((m: any) => isDecisionRequired(m)) : false;
 const isAdvanceBlocked = hasPendingDecision;

 const todaysCalendarEntry = state.seasonCalendar?.find(
  e => e.week === state.currentWeek && e.day === state.currentDay
 );
 const isMatchday = todaysCalendarEntry?.type === 'MATCH' || Boolean(state.nextMatch && state.currentDay === 'SAT');

 const mobileNavIds: Screen[] = ['HUB', 'MATCH', 'INBOX', 'TEAM', 'AGENT'];

 const visibleNavItems = navItems.filter(item => {
  if (item.requiresPattern === 'matchday') {
   return isMatchday;
  }
  return true;
 });

 const mobileNavItems = visibleNavItems.filter(item => mobileNavIds.includes(item.id));

 return (
  <>
   {/* Vertical Sidebar (Desktop & Landscape Mobile) */}
   <aside className="hidden md:flex landscape:flex w-14 md:w-20 premium-card border-r border-[#222] flex-col items-center h-full font-mono shrink-0 bg-[#070707] py-2 md:py-4 select-none z-30">
    {/* Player Identity (Mini Team Crest) */}
    <div className="mb-6 flex flex-col items-center shrink-0">
     {(() => {
      const club = CLUBS.find(c => c.symbol.toUpperCase() === state.player?.currentClubSymbol?.toUpperCase());
      return club ? (
       <button 
        onClick={() => { if (!isMatchLocked) setScreen('PROFILE'); }} 
        className={`p-1 rounded-full border border-[#222] bg-[#0e0e0e] hover:border-[#00FF88] hover:scale-105 active:scale-95 transition-all w-12 h-12 flex items-center justify-center ${isMatchLocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
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
     {visibleNavItems.map((item) => {
      const isActive = state.screen === item.id;
      const isMatchItem = item.id === 'MATCH';
      const isInboxItem = item.id === 'INBOX';
      const isDisabled = (item.requiresPattern === 'matchday' && !isMatchday) || (isMatchLocked && !isMatchItem && state.screen !== item.id);
      
      const isInboxBlocked = isInboxItem && isAdvanceBlocked;

      let customStyle = 'border-transparent text-white/50 hover:text-white hover:bg-white/5 hover:border-[#222] active:scale-95';
      if (isDisabled) {
       customStyle = 'opacity-25 cursor-not-allowed border-transparent text-white/20';
      } else if (isActive) {
       if (isInboxBlocked) {
        customStyle = 'bg-red-500/10 border-red-500 text-red-500 scale-105';
       } else {
        customStyle = 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88] shadow-[#00FF88]/5 scale-105';
       }
      } else if (isInboxBlocked) {
       customStyle = 'bg-red-500/20 border-red-500/80 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse scale-105 cursor-pointer';
      } else if (isMatchItem && isMatchday) {
       customStyle = 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.3)] animate-pulse scale-105 cursor-pointer';
      }

      return (
       <button
        key={item.id}
        onClick={() => {
         if (!isDisabled) {
          if (isInboxItem) {
           setScreen('INBOX', true);
          } else {
           setScreen(item.id);
          }
         }
        }}
        disabled={isDisabled}
        title={isMatchLocked ? 'MATCH ENGINE LOCKED IN' : isMatchItem ? (isMatchday ? 'PLAY MATCHDAY FIXTURE' : 'MATCHDAY (SAT ONLY)') : isInboxBlocked ? 'INBOX (ACTION REQUIRED - DAY ADVANCE BLOCKED)' : item.label}
        className={`relative w-12 h-12 flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 border ${customStyle}`}
       >
        <div className={`transform transition-transform scale-110 ${isInboxBlocked ? 'text-red-500' : ''}`}>
         {React.cloneElement(item.icon as React.ReactElement, { size: 20 } as any)}
        </div>



        {isMatchItem && isMatchday && !isMatchLocked && (
         <span className="absolute -top-1 -right-1 bg-[#00FF88] text-black text-[7px] font-black px-1 rounded-full uppercase tracking-tighter border border-black animate-pulse shadow">
          LIVE
         </span>
        )}
       </button>
      );
     })}
    </div>

    {/* Save & Exit Option at bottom */}
    <div className="mt-auto pt-4 border-t border-[#111] w-full flex justify-center shrink-0">
     <button 
      onClick={() => { if (!isMatchLocked) saveAndQuit(); }}
      disabled={isMatchLocked}
      title={isMatchLocked ? 'MATCH ENGINE LOCKED IN' : 'SAVE & EXIT'}
      className={`w-12 h-12 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 active:scale-95 border border-transparent transition-all ${isMatchLocked ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`}
     >
      <LogOut size={20} />
     </button>
    </div>
   </aside>

   {/* Mobile Sticky Bottom Navigation Dock (Portrait Only) */}
   <nav className="md:hidden landscape:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#070707] border-t border-[#222] z-50 flex items-center justify-around px-2 select-none ">
    {mobileNavItems.map((item) => {
     const isActive = state.screen === item.id;
     const isMatchItem = item.id === 'MATCH';
     const isInboxItem = item.id === 'INBOX';
     const isDisabled = (item.requiresPattern === 'matchday' && !isMatchday) || (isMatchLocked && !isMatchItem && state.screen !== item.id);
     const isInboxBlocked = isInboxItem && isAdvanceBlocked;

     let customStyle = 'text-white/50 hover:text-white';
     if (isDisabled) {
      customStyle = 'opacity-25 cursor-not-allowed text-white/20';
     } else if (isActive) {
      customStyle = 'text-[#00FF88]';
     } else if (isInboxBlocked) {
      customStyle = 'text-red-500 animate-pulse';
     } else if (isMatchItem && isMatchday) {
      customStyle = 'text-[#00FF88] animate-pulse';
     }

     return (
      <button
       key={item.id}
       onClick={() => {
        if (!isDisabled) {
         if (isInboxItem) {
          setScreen('INBOX', true);
         } else {
          setScreen(item.id);
         }
        }
       }}
       disabled={isDisabled}
       className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 py-1 transition-all ${customStyle}`}
      >
       <div className="relative">
        {React.cloneElement(item.icon as React.ReactElement, { size: 20 } as any)}

       </div>
       <span className="text-[9px] font-bold uppercase tracking-tighter mt-1">{item.label.split(' ')[0]}</span>
      </button>
     );
    })}
   </nav>
  </>
 );
}

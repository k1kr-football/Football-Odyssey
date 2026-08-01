import React, { useState } from 'react';
import { useGame, Screen } from '../store/GameContext';
import { 
  Mail, Calendar, ArrowRight, AlertTriangle, CheckCircle2, Clock, 
  Flame, FileText, Briefcase, Trophy, ChevronRight, UserCheck, ShieldAlert,
  Sparkles, Stethoscope, RefreshCw, Dumbbell, ClipboardList, Newspaper,
  DollarSign, Heart, ExternalLink, Zap
} from 'lucide-react';
import { getFormattedCalendarDate } from '../utils/careerSystems';
import { isDecisionRequired } from '../utils/notifications';
import { resolveSenderIdentity } from '../utils/clubStaff';
import { DayOfWeek } from '../types';
import { CLUBS } from '../data/teams';
import { TeamLogo } from './TeamLogo';

interface DirectActionSpec {
  label: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  styleClass: string;
  badgeText?: string;
}

/**
 * Determines the direct screen action for a given inbox message based on
 * sender, subject, body, or priority.
 */
export function getDirectAction(
  msg: any, 
  setScreen: (s: Screen, animate?: boolean) => void,
  onOpenFullInbox?: () => void
): DirectActionSpec {
  const isDecision = isDecisionRequired(msg);
  const text = `${msg.subject || ''} ${msg.sender || ''} ${msg.body || ''} ${msg.category || ''} ${msg.type || ''}`.toLowerCase();

  // 1. Critical decision / choices required
  if (isDecision) {
    return {
      label: 'Respond Now',
      icon: <AlertTriangle size={12} />,
      onClick: (e) => {
        e.stopPropagation();
        setScreen('INBOX', true);
        if (onOpenFullInbox) onOpenFullInbox();
      },
      styleClass: 'bg-red-500 hover:bg-red-600 text-white font-black shadow-md shadow-red-500/20 border border-red-400',
      badgeText: 'ACTION REQUIRED'
    };
  }

  // 2. Training / Attributes / Drills / Fitness
  if (
    text.includes('training') || 
    text.includes('coach') || 
    text.includes('drill') || 
    text.includes('fitness') ||
    text.includes('gym') ||
    text.includes('attribute') ||
    text.includes('workout') ||
    text.includes('session')
  ) {
    return {
      label: 'Go to Training',
      icon: <Dumbbell size={12} />,
      onClick: (e) => {
        e.stopPropagation();
        setScreen('TRAINING', true);
      },
      styleClass: 'bg-[#00FF88]/20 hover:bg-[#00FF88]/30 text-[#00FF88] border border-[#00FF88]/40 font-bold',
      badgeText: 'TRAINING'
    };
  }

  // 3. Contract / Agent / Wage / Extension / Renewal
  if (
    text.includes('contract') || 
    text.includes('agent') || 
    text.includes('wage') || 
    text.includes('renewal') || 
    text.includes('extension') || 
    text.includes('release clause') ||
    text.includes('dispute')
  ) {
    return {
      label: 'Go to Agent',
      icon: <Briefcase size={12} />,
      onClick: (e) => {
        e.stopPropagation();
        setScreen('AGENT', true);
      },
      styleClass: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold',
      badgeText: 'AGENT'
    };
  }

  // 4. Transfers / Bids / Scouting / Offers
  if (
    text.includes('transfer') || 
    text.includes('bid') || 
    text.includes('scout') || 
    text.includes('interest') || 
    text.includes('market') ||
    text.includes('loan')
  ) {
    return {
      label: 'Transfers Hub',
      icon: <UserCheck size={12} />,
      onClick: (e) => {
        e.stopPropagation();
        setScreen('TRANSFERS', true);
      },
      styleClass: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-bold',
      badgeText: 'TRANSFERS'
    };
  }

  // 5. Medical / Injury / Rehab / Physio
  if (
    text.includes('injury') || 
    text.includes('physio') || 
    text.includes('medical') || 
    text.includes('rehab') || 
    text.includes('doctor') || 
    text.includes('recovery') ||
    text.includes('burnout')
  ) {
    return {
      label: 'Rehab Center',
      icon: <Stethoscope size={12} />,
      onClick: (e) => {
        e.stopPropagation();
        setScreen('REHAB_MINIGAME', true);
      },
      styleClass: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold',
      badgeText: 'MEDICAL'
    };
  }

  // 6. Match / Tactics / Lineup / Scouting Opponent
  if (
    text.includes('match') || 
    text.includes('tactics') || 
    text.includes('lineup') || 
    text.includes('formation') || 
    text.includes('opponent') || 
    text.includes('fixture') ||
    text.includes('squad')
  ) {
    return {
      label: 'Tactics & Squad',
      icon: <ClipboardList size={12} />,
      onClick: (e) => {
        e.stopPropagation();
        setScreen('TEAM', true);
      },
      styleClass: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/40 font-bold',
      badgeText: 'TACTICS'
    };
  }

  // 7. Press / Media / Interview
  if (
    text.includes('press') || 
    text.includes('interview') || 
    text.includes('journalist') || 
    text.includes('media') || 
    text.includes('reporter') || 
    text.includes('headline')
  ) {
    return {
      label: 'Press Room',
      icon: <Newspaper size={12} />,
      onClick: (e) => {
        e.stopPropagation();
        setScreen('PRESS', true);
      },
      styleClass: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/40 font-bold',
      badgeText: 'PRESS'
    };
  }

  // 8. Finances / Sponsorships / Money
  if (
    text.includes('finance') || 
    text.includes('sponsor') || 
    text.includes('commercial') || 
    text.includes('bonus') || 
    text.includes('bank')
  ) {
    return {
      label: 'View Finances',
      icon: <DollarSign size={12} />,
      onClick: (e) => {
        e.stopPropagation();
        setScreen('FINANCES', true);
      },
      styleClass: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold',
      badgeText: 'FINANCES'
    };
  }

  // 9. Lifestyle / Social / Followers
  if (
    text.includes('lifestyle') || 
    text.includes('social') || 
    text.includes('fans') || 
    text.includes('follower') || 
    text.includes('brand')
  ) {
    return {
      label: 'Lifestyle Hub',
      icon: <Heart size={12} />,
      onClick: (e) => {
        e.stopPropagation();
        setScreen('LIFESTYLE', true);
      },
      styleClass: 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/40 font-bold',
      badgeText: 'LIFESTYLE'
    };
  }

  // 10. Fallback -> Read Message in Full Inbox
  return {
    label: 'Open Mail',
    icon: <Mail size={12} />,
    onClick: (e) => {
      e.stopPropagation();
      setScreen('INBOX', true);
      if (onOpenFullInbox) onOpenFullInbox();
    },
    styleClass: 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/10 font-medium',
    badgeText: 'MAIL'
  };
}

interface DirectActionButtonProps {
  msg: any;
  onOpenFullInbox?: () => void;
  compact?: boolean;
}

export function DirectActionButton({ msg, onOpenFullInbox, compact = false }: DirectActionButtonProps) {
  const { setScreen } = useGame();
  
  const action = getDirectAction(msg, setScreen, onOpenFullInbox);

  return (
    <button
      onClick={action.onClick}
      title={`Direct Action: Jump to ${action.label}`}
      className={`inline-flex items-center gap-1.5 rounded-lg text-[10px] font-mono transition-all duration-200 shrink-0 cursor-pointer ${
        compact 
          ? 'px-2 py-1 text-[9px]' 
          : 'px-2.5 py-1.5 text-[10px]'
      } ${action.styleClass}`}
    >
      {action.icon}
      <span className="uppercase tracking-wider font-extrabold">{action.label}</span>
    </button>
  );
}

interface InboxDigestProps {
  onOpenFullInbox?: () => void;
  onAdvanceDay?: () => void;
  className?: string;
}

export function InboxDigest({ onOpenFullInbox, onAdvanceDay, className = '' }: InboxDigestProps) {
  const { state, setScreen, advanceDay } = useGame();
  const [activeTab, setActiveTab] = useState<'ALL' | 'SCHEDULE' | 'MAIL' | 'DECISIONS'>('ALL');

  const inbox = state.inbox || [];
  const unreadItems = inbox.filter((m: any) => !m.read);
  const pendingDecisions = inbox.filter((m: any) => isDecisionRequired(m));
  const isAdvanceBlocked = pendingDecisions.length > 0;

  // Check for high priority unread mail or pending story event
  const hasHighPriorityUnread = unreadItems.some((m: any) => 
    m.priority === 'CRITICAL' || m.priority === 'HIGH' || m.priority === 'IMPORTANT'
  );

  const hasPendingStoryEvent = inbox.some((m: any) => 
    (!m.read || isDecisionRequired(m)) && (
      m.category === 'STORY' || 
      m.type === 'STORY' || 
      m.isStoryPrompt || 
      m.isStoryEvent || 
      (m.choices && m.choices.length > 0)
    )
  ) || Boolean((state as any).activeStoryEvent || (state as any).pendingStoryPrompt || (state as any).activeEvent);

  const shouldPulseAdvance = isAdvanceBlocked || hasHighPriorityUnread || hasPendingStoryEvent;

  // Calendar info
  const currentWeek = state.currentWeek;
  const currentDay = state.currentDay;
  const dateStr = getFormattedCalendarDate(currentWeek, currentDay);

  // Next calendar day
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const curIdx = daysOfWeek.indexOf(currentDay);
  const nextDay = curIdx === 6 ? 'MON' : daysOfWeek[curIdx + 1];
  const nextWeek = curIdx === 6 ? currentWeek + 1 : currentWeek;
  const nextDateStr = getFormattedCalendarDate(nextWeek, nextDay as DayOfWeek);

  // Upcoming Matchday event
  const todaysFixture = state.seasonCalendar?.find(
    e => e.week === currentWeek && e.day === currentDay && e.type === 'MATCH'
  );

  const isMatchday = Boolean(todaysFixture);

  // Upcoming 3 calendar entries
  const upcomingSchedule = (state.seasonCalendar || [])
    .filter(e => (e.week > currentWeek) || (e.week === currentWeek && daysOfWeek.indexOf(e.day) >= curIdx))
    .slice(0, 3);

  // Contract & Agent / Transfer specific messages
  const contractMail = inbox.filter((m: any) => 
    m.subject?.toLowerCase().includes('contract') || 
    m.subject?.toLowerCase().includes('offer') ||
    m.subject?.toLowerCase().includes('wage') ||
    m.sender?.toLowerCase().includes('agent') ||
    m.category === 'CONTRACT'
  );

  // Match preparation mail / medical mail
  const matchPrepMail = inbox.filter((m: any) =>
    m.subject?.toLowerCase().includes('match') ||
    m.subject?.toLowerCase().includes('tactics') ||
    m.subject?.toLowerCase().includes('scout') ||
    m.subject?.toLowerCase().includes('injury') ||
    m.category === 'MATCH' || m.category === 'MEDICAL'
  );

  const handleAdvance = () => {
    if (isAdvanceBlocked) {
      setActiveTab('DECISIONS');
      if (onOpenFullInbox) onOpenFullInbox();
    } else if (onAdvanceDay) {
      onAdvanceDay();
    } else {
      advanceDay();
    }
  };

  return (
    <div className={`premium-card rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-white/10 bg-[#0f0f12] ${className}`}>
      {/* Decorative background glow */}
      <div className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
        isAdvanceBlocked ? 'bg-red-500/10' : 'bg-[#00FF88]/10'
      }`} />

      {/* HEADER: Title, Date, Status Badge & Tab Filter Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-white/10 pb-4 mb-5 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
            isAdvanceBlocked 
              ? 'bg-red-500/15 border-red-500/40 text-red-400' 
              : 'bg-[#00FF88]/15 border-[#00FF88]/40 text-[#00FF88]'
          }`}>
            <Sparkles size={20} className={isAdvanceBlocked ? 'animate-bounce' : 'animate-pulse'} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-black text-sm uppercase tracking-wider font-mono">
                Inbox & Schedule Digest
              </h3>

              {isAdvanceBlocked ? (
                <span className="bg-red-500/20 text-red-400 border border-red-500/50 text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase tracking-widest animate-pulse flex items-center gap-1">
                  <AlertTriangle size={11} /> Decision Blocking Advance
                </span>
              ) : (
                <span className="bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40 text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 size={11} /> Day Advance Clear
                </span>
              )}
            </div>

            <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-0.5 flex items-center gap-2">
              <span>{currentDay}, Week {currentWeek} &bull; {dateStr}</span>
              {unreadItems.length > 0 && (
                <span className="text-[#00FF88] font-bold">&bull; {unreadItems.length} Unread</span>
              )}
            </p>
          </div>
        </div>

        {/* Unified Tab Selector */}
        <div className="flex items-center bg-[#18181c] p-1 rounded-xl border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-[#00FF88] text-black font-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={12} /> Overview
          </button>

          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'SCHEDULE'
                ? 'bg-[#00FF88] text-black font-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar size={12} /> Schedule ({upcomingSchedule.length})
          </button>

          <button
            onClick={() => setActiveTab('MAIL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer relative whitespace-nowrap ${
              activeTab === 'MAIL'
                ? 'bg-[#00FF88] text-black font-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail size={12} /> Inbox ({inbox.length})
            {unreadItems.length > 0 && (
              <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full ${
                activeTab === 'MAIL' ? 'bg-black text-[#00FF88]' : 'bg-[#00FF88] text-black'
              }`}>
                {unreadItems.length}
              </span>
            )}
          </button>

          {pendingDecisions.length > 0 && (
            <button
              onClick={() => setActiveTab('DECISIONS')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer animate-pulse whitespace-nowrap ${
                activeTab === 'DECISIONS'
                  ? 'bg-red-500 text-white font-black shadow-lg shadow-red-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
              }`}
            >
              <AlertTriangle size={12} /> Decisions ({pendingDecisions.length})
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: OVERVIEW (Combined Schedule + Contracts + Inbox Digest with Direct Actions) */}
      {activeTab === 'ALL' && (
        <div className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Today's Schedule & Fixture Preparation */}
            <div className="bg-[#141418] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#00FF88] text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={12} /> Match & Agenda
                  </span>
                  <span className="text-[9px] font-mono text-white/40 uppercase">{currentDay}</span>
                </div>

                {isMatchday && todaysFixture ? (
                  <div className="bg-[#1a1a20] border border-[#00FF88]/30 rounded-lg p-3 my-1">
                    <div className="text-[10px] text-[#00FF88] font-mono font-bold uppercase mb-1">
                      ⚽ MATCHDAY FIXTURE READY
                    </div>
                    <div className="text-white text-xs font-black uppercase tracking-wide">
                      vs {(todaysFixture as any).opponent || (todaysFixture as any).opponentName || 'Opponent'}
                    </div>
                    <div className="text-white/50 text-[10px] font-mono mt-1 flex items-center justify-between">
                      <span>{(todaysFixture as any).isHome ? 'Home Stadium' : 'Away Fixture'}</span>
                      <button 
                        onClick={() => setScreen('TEAM', true)}
                        className="text-[#00FF88] hover:underline text-[9px] font-bold"
                      >
                        Tactics &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="my-1 space-y-1.5">
                    <h4 className="text-white text-xs font-bold uppercase font-mono">
                      Non-Match Progression Day
                    </h4>
                    <p className="text-white/60 text-[11px] font-mono leading-relaxed line-clamp-2">
                      Squad training underway. Check messages for fitness, agent, or coaching updates.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40">Next: <strong className="text-white">{nextDay}, {nextDateStr}</strong></span>
                <button
                  onClick={() => setActiveTab('SCHEDULE')}
                  className="text-[#00FF88] hover:underline font-bold cursor-pointer"
                >
                  Schedule &rarr;
                </button>
              </div>
            </div>

            {/* Card 2: Contract & Agent Updates with Direct Action */}
            <div className="bg-[#141418] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-1">
                    <Briefcase size={12} /> Contract & Career Updates
                  </span>
                  <span className="text-[9px] font-mono text-amber-400/80 font-bold uppercase">
                    {contractMail.length} Items
                  </span>
                </div>

                {contractMail.length > 0 ? (
                  <div className="space-y-2 my-1">
                    {contractMail.slice(0, 2).map((msg: any) => (
                      <div 
                        key={msg.id}
                        onClick={() => setScreen('INBOX', true)}
                        className="p-2.5 rounded-lg bg-[#1c1c22] border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between gap-2 group"
                      >
                        <div className="truncate flex-1 min-w-0">
                          <div className="text-[9px] text-amber-400 font-mono font-bold uppercase truncate">{resolveSenderIdentity(state, msg.sender, msg.id)}</div>
                          <div className="text-white text-xs font-bold truncate group-hover:text-amber-300 transition-colors">{msg.subject}</div>
                        </div>
                        <DirectActionButton msg={msg} onOpenFullInbox={onOpenFullInbox} compact />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="my-2 space-y-1">
                    <div className="text-white text-xs font-bold uppercase font-mono">Contract Status Stable</div>
                    <p className="text-white/50 text-[11px] font-mono leading-relaxed">
                      No urgent wage or contract negotiations requiring immediate signatures.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/40">Agent Desk</span>
                <button
                  onClick={() => setScreen('AGENT', true)}
                  className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Open Agent Hub &rarr;
                </button>
              </div>
            </div>

            {/* Card 3: Unread Mail & Decision Status with Direct Action */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
              isAdvanceBlocked 
                ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                : 'bg-[#141418] border-white/10 text-white'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-1 ${
                    isAdvanceBlocked ? 'text-red-400' : 'text-white/50'
                  }`}>
                    <Mail size={12} /> Inbox & Direct Actions
                  </span>
                  {unreadItems.length > 0 && (
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                      isAdvanceBlocked ? 'bg-red-500 text-white' : 'bg-[#00FF88] text-black'
                    }`}>
                      {unreadItems.length} New
                    </span>
                  )}
                </div>

                {isAdvanceBlocked ? (
                  <div className="space-y-2 my-1">
                    <div className="text-red-400 font-black text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <AlertTriangle size={14} className="shrink-0 animate-bounce" /> {pendingDecisions.length} Decision(s) Required
                    </div>
                    <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-between gap-2">
                      <div className="truncate flex-1 min-w-0">
                        <div className="text-white text-xs font-bold truncate">{pendingDecisions[0]?.subject}</div>
                        <div className="text-red-300 text-[9px] font-mono truncate">{resolveSenderIdentity(state, pendingDecisions[0]?.sender, pendingDecisions[0]?.id)}</div>
                      </div>
                      <DirectActionButton msg={pendingDecisions[0]} onOpenFullInbox={onOpenFullInbox} compact />
                    </div>
                  </div>
                ) : unreadItems.length > 0 ? (
                  <div className="space-y-2 my-1">
                    <div className="text-[#00FF88] font-black text-xs uppercase tracking-wide">
                      ⚡ Latest Unread Mail
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1a1a20] border border-white/10 flex items-center justify-between gap-2">
                      <div className="truncate flex-1 min-w-0">
                        <div className="text-white text-xs font-bold truncate">{unreadItems[0]?.subject}</div>
                        <div className="text-[#00FF88] text-[9px] font-mono truncate">{resolveSenderIdentity(state, unreadItems[0]?.sender, unreadItems[0]?.id)}</div>
                      </div>
                      <DirectActionButton msg={unreadItems[0]} onOpenFullInbox={onOpenFullInbox} compact />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 my-1">
                    <div className="text-emerald-400 font-bold text-xs uppercase tracking-wide flex items-center gap-1">
                      <CheckCircle2 size={13} /> Mailbox Clear
                    </div>
                    <p className="text-white/40 text-[10px] font-mono">
                      All messages read. No pending choices blocking calendar flow.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                {isAdvanceBlocked ? (
                  <button
                    onClick={() => setActiveTab('DECISIONS')}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-black uppercase tracking-widest w-full transition-all cursor-pointer shadow-md shadow-red-500/20 text-center"
                  >
                    View All Decisions &rarr;
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('MAIL')}
                    className="text-[#00FF88] hover:underline font-bold cursor-pointer w-full text-right"
                  >
                    View Mail Stream &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Inbox Feed Section */}
          <div className="bg-[#141418] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <span className="text-white text-xs font-black uppercase font-mono tracking-wider flex items-center gap-2">
                <Zap size={14} className="text-[#00FF88]" /> Direct Action Mail Stream
              </span>
              <button 
                onClick={() => setActiveTab('MAIL')}
                className="text-[#00FF88] text-[10px] font-mono uppercase hover:underline font-bold"
              >
                View All ({inbox.length}) &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {inbox.slice(0, 4).map((msg: any) => {
                const isPending = isDecisionRequired(msg);
                return (
                  <div 
                    key={msg.id}
                    onClick={() => setScreen('INBOX', true)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                      isPending 
                        ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20' 
                        : !msg.read 
                        ? 'bg-[#181820] border-[#00FF88]/40 hover:border-[#00FF88] text-white' 
                        : 'bg-[#121216] border-white/5 hover:border-white/20 text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isPending ? 'bg-red-500 animate-ping' : !msg.read ? 'bg-[#00FF88]' : 'bg-white/20'
                      }`} />
                      <div className="truncate min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-white/50">{resolveSenderIdentity(state, msg.sender, msg.id)}</span>
                          {msg.priority === 'CRITICAL' && (
                            <span className="bg-red-500/20 text-red-400 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">Critical</span>
                          )}
                        </div>
                        <div className="text-xs font-bold font-mono truncate text-white group-hover:text-[#00FF88] transition-colors">{msg.subject}</div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                      <DirectActionButton msg={msg} onOpenFullInbox={onOpenFullInbox} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED SCHEDULE & MATCH PREPARATION */}
      {activeTab === 'SCHEDULE' && (
        <div className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {upcomingSchedule.map((item: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  item.week === currentWeek && item.day === currentDay
                    ? 'bg-[#00FF88]/10 border-[#00FF88]/50 text-white'
                    : 'bg-[#141418] border-white/10 text-white/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-black uppercase text-[#00FF88]">
                      {item.day}, Week {item.week}
                    </span>
                    <span className="text-[9px] font-mono text-white/40 uppercase">
                      {item.type || 'CALENDAR'}
                    </span>
                  </div>
                  <h5 className="text-white text-xs font-bold uppercase font-mono mb-1">
                    {item.label || item.opponent || 'Regular Training Day'}
                  </h5>
                  <p className="text-white/50 text-[10px] font-mono">
                    {item.isHome !== undefined ? (item.isHome ? 'Home Fixture' : 'Away Match') : 'Club Training Facility'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 text-[9px] font-mono text-white/40">
                  {item.week === currentWeek && item.day === currentDay ? 'CURRENT DAY' : 'UPCOMING'}
                </div>
              </div>
            ))}
          </div>

          {/* Match Preparations & Scouting Mail Integration with Direct Actions */}
          <div className="bg-[#141418] border border-white/10 rounded-xl p-4">
            <h4 className="text-white text-xs font-black uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
              <Stethoscope size={14} className="text-[#00FF88]" /> Match Preparation & Scouting Feed
            </h4>

            {matchPrepMail.length > 0 ? (
              <div className="space-y-2">
                {matchPrepMail.slice(0, 4).map((msg: any) => (
                  <div 
                    key={msg.id}
                    onClick={() => setScreen('INBOX', true)}
                    className="p-3 rounded-lg bg-[#1a1a20] border border-white/5 hover:border-[#00FF88]/40 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="truncate min-w-0 flex-1">
                      <div className="text-[9px] font-mono text-[#00FF88] uppercase font-bold">{resolveSenderIdentity(state, msg.sender, msg.id)}</div>
                      <div className="text-white text-xs font-bold font-mono truncate group-hover:text-[#00FF88] transition-colors">{msg.subject}</div>
                    </div>
                    <DirectActionButton msg={msg} onOpenFullInbox={onOpenFullInbox} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-[11px] font-mono">
                No specific match preparation reports or medical bulletins currently flagged in your inbox.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INBOX COMMUNICATIONS WITH DIRECT ACTIONS */}
      {activeTab === 'MAIL' && (
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-white/50 border-b border-white/5 pb-2">
            <span>Mail Stream ({inbox.length} Messages total, {unreadItems.length} unread)</span>
            <button 
              onClick={() => setScreen('INBOX', true)}
              className="text-[#00FF88] hover:underline font-bold cursor-pointer"
            >
              Open Full Mailbox Screen &rarr;
            </button>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {inbox.map((msg: any) => {
              const isPending = isDecisionRequired(msg);
              return (
                <div 
                  key={msg.id}
                  onClick={() => setScreen('INBOX', true)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                    isPending 
                      ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20' 
                      : !msg.read 
                      ? 'bg-[#181820] border-[#00FF88]/40 hover:border-[#00FF88] text-white' 
                      : 'bg-[#121216] border-white/5 hover:border-white/20 text-white/60'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isPending ? 'bg-red-500 animate-ping' : !msg.read ? 'bg-[#00FF88]' : 'bg-white/20'
                    }`} />
                    <div className="truncate min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-black uppercase tracking-widest text-white/50">{msg.sender}</span>
                        {msg.priority === 'CRITICAL' && (
                          <span className="bg-red-500/20 text-red-400 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">Critical</span>
                        )}
                      </div>
                      <div className="text-xs font-bold font-mono truncate text-white group-hover:text-[#00FF88] transition-colors">{msg.subject}</div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <DirectActionButton msg={msg} onOpenFullInbox={onOpenFullInbox} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DECISION REQUIRED */}
      {activeTab === 'DECISIONS' && (
        <div className="space-y-3 relative z-10">
          <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-3 text-red-400 text-xs font-mono font-bold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 animate-bounce" />
            <span>The following critical decision items require your input before the day can advance:</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {pendingDecisions.map((msg: any) => (
              <div key={msg.id} className="bg-[#181820] border-2 border-red-500/60 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-red-400 text-[9px] font-mono font-black uppercase tracking-widest">
                    🚨 {resolveSenderIdentity(state, msg.sender, msg.id).toUpperCase()} &bull; {msg.priority || 'CRITICAL'}
                  </span>
                  <span className="text-white/40 text-[9px] font-mono">Action Required</span>
                </div>

                <div>
                  <h5 className="text-white text-xs font-black uppercase font-mono mb-1">{msg.subject}</h5>
                  <p className="text-white/70 text-[11px] font-mono leading-relaxed line-clamp-3">{msg.body}</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 flex-wrap">
                  <DirectActionButton msg={msg} onOpenFullInbox={onOpenFullInbox} />

                  <button
                    onClick={() => setScreen('INBOX', true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-[10px] font-mono font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-red-500/20"
                  >
                    Resolve In Full Inbox <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER: ADVANCE DAY MASTER BAR */}
      <div className="mt-5 pt-4 border-t border-white/10 relative z-10 flex flex-col items-center">
        <button
          onClick={handleAdvance}
          className={`w-full py-4 px-8 rounded-xl font-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-1 transition-all duration-300 shadow-2xl cursor-pointer ${
            isAdvanceBlocked
              ? 'bg-gradient-to-r from-red-600/30 via-red-500/20 to-red-600/30 border-2 border-red-500 text-red-400 hover:bg-red-500/30 hover:border-red-400 shadow-red-500/20 animate-pulse ring-2 ring-red-500/40'
              : shouldPulseAdvance
              ? 'bg-gradient-to-r from-[#00FF88]/25 via-[#00FF88]/15 to-[#00FF88]/25 border-2 border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88]/35 shadow-[0_0_30px_rgba(0,255,136,0.4)] animate-pulse ring-2 ring-[#00FF88]/40'
              : 'bg-gradient-to-r from-[#00FF88]/20 via-[#00FF88]/10 to-[#00FF88]/20 border-2 border-[#00FF88]/70 text-[#00FF88] hover:bg-[#00FF88]/30 hover:shadow-[0_0_25px_rgba(0,255,136,0.35)]'
          }`}
        >
          <div className="flex items-center gap-3 text-sm">
            {isAdvanceBlocked ? (
              <>
                <AlertTriangle size={16} className="text-red-400 animate-bounce" />
                <span>ACTION REQUIRED &bull; RESOLVE DECISION TO ADVANCE</span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span>ADVANCE CALENDAR</span>
                <ArrowRight size={16} />
                {(hasPendingStoryEvent || hasHighPriorityUnread) && (
                  <span className="ml-2 bg-[#00FF88]/20 text-[#00FF88] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#00FF88]/40 flex items-center gap-1 animate-pulse">
                    {hasPendingStoryEvent ? (
                      <Flame size={10} className="text-amber-400 animate-bounce" />
                    ) : (
                      <Sparkles size={10} className="text-[#00FF88] animate-spin" />
                    )}
                    {hasPendingStoryEvent ? 'Story Prompt Ready' : 'High Priority Mail'}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className={`text-[10px] font-mono ${isAdvanceBlocked ? 'text-red-400/90 font-bold' : 'text-[#00FF88]/80'}`}>
            {isAdvanceBlocked 
              ? `${pendingDecisions.length} Critical Decision${pendingDecisions.length > 1 ? 's' : ''} Pending`
              : `Next Target: ${nextDay}, ${nextDateStr}`
            }
          </div>
        </button>
      </div>
    </div>
  );
}

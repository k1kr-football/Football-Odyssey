import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { Mail, ArrowRight, ShieldAlert, User, Calendar, Stethoscope, AlertTriangle, Flame, Briefcase, Award, TrendingUp, Activity, Clock, CheckCircle2, Camera, Globe } from 'lucide-react';
import { CLUBS } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { AvatarGeneratorModal } from '../components/AvatarGeneratorModal';
import { DailyQuestsWidget } from '../components/DailyQuestsWidget';
import { CareerDepthWidget } from '../components/CareerDepthWidget';
import { RealWorldNewsWidget } from '../components/RealWorldNewsWidget';
import { InboxDigest } from '../components/InboxDigest';
import { getClubSquad } from '../data/sheetSquads';
import { GlossaryTooltip, FirstEncounterCallout } from '../components/GlossaryTooltip';
import { getRoleById, getManagerTacticalFit } from '../data/roles';
import { DayOfWeek } from "../types";
import { getFormattedCalendarDate } from "../utils/careerSystems";
import { getTransferWindowPacingState, getClubTier, getGatingStatus } from '../utils/transfers';
import { isDecisionRequired } from '../utils/notifications';
import { getClubStaff, getCanonicalSender, resolveSenderIdentity } from '../utils/clubStaff';

export function Hub() {
 const { state, setScreen, advanceDay, resolveEvent, setPlayer, setInbox, updateNextMatch, advanceRehabPacing } = useGame();
 const [activeFeedTab, setActiveFeedTab] = useState<'MANAGER' | 'SPECULATION' | 'SCOUTING' | 'WORLD_NEWS'>('MANAGER');
 const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
 const currentDayIdx = days.indexOf(state.currentDay);
 let nextDay = state.currentDay;
 let nextWeek = state.currentWeek;

 if (currentDayIdx < days.length - 1) {
   nextDay = days[currentDayIdx + 1];
 } else {
   nextDay = 'MON';
   nextWeek = state.currentWeek >= 52 ? 1 : state.currentWeek + 1;
 }
 const nextDateStr = getFormattedCalendarDate(nextWeek, nextDay);

 const pendingDecisionItems = state.inbox ? state.inbox.filter((msg: any) => isDecisionRequired(msg)) : [];
 const unreadItems = state.inbox ? state.inbox.filter((msg: any) => !msg.read) : [];
 const isAdvanceBlocked = pendingDecisionItems.length > 0;
 const criticalCount = pendingDecisionItems.length > 0 ? pendingDecisionItems.length : unreadItems.filter((msg: any) => msg.priority === 'CRITICAL').length;

 const [deadlineSeconds, setDeadlineSeconds] = useState(43200); // 12 hours mock countdown
 const [scheduleTab, setScheduleTab] = useState<'FLOW' | 'INBOX' | 'ACTIONS'>('FLOW');

 useEffect(() => {
   if (pendingDecisionItems.length > 0 && scheduleTab === 'FLOW') {
     setScheduleTab('ACTIONS');
   }
 }, [pendingDecisionItems.length]);

 useEffect(() => {
     let interval: any;
     const pacing = getTransferWindowPacingState(state.currentWeek, state.currentDay);
     if (pacing === 'DEADLINE_DAY') {
         interval = setInterval(() => {
             setDeadlineSeconds(prev => Math.max(0, prev - 1));
         }, 1000);
     }
     return () => clearInterval(interval);
 }, [state.currentWeek, state.currentDay]);

 if (!state.player) return null;
 const player = state.player;
 
 const pacing = getTransferWindowPacingState(state.currentWeek, state.currentDay);
 const isDeadlineDay = pacing === 'DEADLINE_DAY';
 
 const formatTime = (totalSeconds: number) => {
     const h = Math.floor(totalSeconds / 3600);
     const m = Math.floor((totalSeconds % 3600) / 60);
     const s = totalSeconds % 60;
     return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
 };

 const getManagerVerdict = (trust: number, isInjured: boolean) => {
 if (isInjured) {
  return {
  attitude: "Concerned & Protective",
  quote: `"Focus strictly on your recovery and medical protocols. The team is missing your quality, but we cannot afford to risk long-term structural muscle tears."`,
  ratingColor: "text-amber-500",
  actionRequired: "Complete physical therapy and clear Rehab minigame."
  };
 }
 if (trust >= 80) {
  return {
  attitude: "Adoring & Elite Support",
  quote: `"You are currently the absolute heartbeat of our starting eleven. Your execution on the pitch is masterclass. Continue working like this, and we will lift silverware soon."`,
  ratingColor: "text-emerald-400",
  actionRequired: "Maintain sharpness in training and lead match operations."
  };
 }
 if (trust >= 60) {
  return {
  attitude: "Pleased & Expectant",
  quote: `"Steady work. You've proven your quality, but in football, reputations must be defended every single matchday. Keep the intensity high in our training blocks."`,
  ratingColor: "text-cyan-400",
  actionRequired: "Train consistently to keep your starting role secure."
  };
 }
 if (trust >= 40) {
  return {
  attitude: "Demanding & Skeptical",
  quote: `"You're sitting on the margins. I've seen moments of capability, but I demand absolute discipline and performance. If you don't fight for the badge, someone else will."`,
  ratingColor: "text-[#c9a84c]",
  actionRequired: "Improve relations in training; avoid controversial press interactions."
  };
 }
 return {
  attitude: "Frustrated & Distant",
  quote: `"I am completely unconvinced by your commitment to this club's tactical vision. You've been relegated to the backup pool. I strongly suggest you look for loan opportunities."`,
  ratingColor: "text-red-500",
  actionRequired: "Request a transfer / loan via Career, or work tirelessly to regain trust."
 };
 };

 const apps = player.stats?.apps || 0;
 const ratingSum = player.matchAnalysis?.reduce((sum, m) => sum + m.rating, 0) || 0;
 const avgRating = player.matchAnalysis && player.matchAnalysis.length > 0 ? ratingSum / player.matchAnalysis.length : 6.5;
 const agentTier = player.agentTier || 'Rookie';
 const worldRep = player.reputation?.world || 0;
 const managerTrust = player.trust || 0;
 const form = player.form || 50;

 // Calculate Scouting Activity (0-100)
 const baseAppsScore = Math.min(40, apps * 5); // caps at 40 points (8 apps)
 const ratingBonus = Math.max(0, (avgRating - 6.0) * 15); // e.g., 7.0 rating adds 15 points
 const repBonus = Math.min(30, worldRep * 1.5);
 const scoutingActivity = Math.min(100, Math.round(baseAppsScore + ratingBonus + repBonus));

 const getActiveRumourText = () => {
  const lastName = player.lastName || 'Player';
  const currentClub = CLUBS.find(c => c.symbol === player.currentClubSymbol);
  const currentTier = currentClub ? getClubTier(currentClub) : 5;
  
  if (player.stats.apps < 5) {
   if (currentTier === 5) {
    return `@EFL_Watch reports League Two clubs are observing ${lastName}'s early development.`;
   } else if (currentTier === 4) {
    return `@EFL_Watch reports League One clubs are tracking ${lastName}'s adaptation.`;
   } else {
    return `@EFL_Watch reports scouts are monitoring ${lastName}'s integration into the first team.`;
   }
  }
  
  const possibleClubs = CLUBS.filter(c => {
   if (c.symbol === player.currentClubSymbol) return false;
   return getGatingStatus(player, c) === null;
  });
  
  if (possibleClubs.length === 0) {
   return `Local reporters suggest ${lastName} is focusing entirely on their current role at ${currentClub?.name || 'club'}.`;
  }
  
  const eligibleTiers = possibleClubs.map(c => getClubTier(c));
  const highestEligibleTier = Math.min(...eligibleTiers);
  
  if (highestEligibleTier === 1) {
   return `Insider @RomanoHere reports European elite clubs are actively monitoring ${lastName}'s phenomenal rise.`;
  } else if (highestEligibleTier === 2) {
   return `Insider @SkySportsNews reports Premier League clubs are sending representatives to scout ${lastName}.`;
  } else if (highestEligibleTier === 3) {
   return `@Championship_Watch reports Championship sides are highly interested in ${lastName}'s steady progress.`;
  } else if (highestEligibleTier === 4) {
   return `@EFL_Watch reports League One scouts have highlighted ${lastName} as a potential target.`;
  } else {
   return `@EFL_Watch reports League Two clubs are keeping tabs on ${lastName}'s consistent form.`;
  }
 };

  const generateParodyRumors = () => {
   const lastName = player.lastName || 'Player';
   const wage = (player.contract.wage || 12000).toLocaleString();
   const ovr = player.ovr;
   const currentLeague = club?.league || 'EFL League One';
   const nextLeagueUp = currentLeague === 'EFL League Two' ? 'EFL League One' : currentLeague === 'EFL League One' ? 'EFL Championship' : 'Premier League';
   
   if (apps < 5) {
    return [
     {
     handle: "@EFL_Watch",
     verified: true,
     time: "1h ago",
     text: `📝 NEW FACE: Fan discussions are high regarding ${lastName}'s recent arrival. With only ${apps} appearances, supporters are waiting to see if the youngster can handle the manager's tactical demands.`,
     likes: "450",
     retweets: "22"
     },
     {
     handle: "@TacticalWiz_FC",
     verified: false,
     time: "5h ago",
     text: `📊 Scout Report: Analyzing ${lastName}'s profile at OVR ${ovr}. Raw potential is clear, but they need to gain regular game time and raise Manager Trust (${managerTrust}%) to unlock consistency.`,
     likes: "120",
     retweets: "14"
     },
     {
     handle: "@FanBanterFC",
     verified: false,
     time: "12h ago",
     text: `Honestly, it's way too early for transfer talk. ${lastName} just got here. Let's see them get a solid run of games in ${currentLeague} before we start speculating about the ${nextLeagueUp}. 🤫`,
     likes: "1.8K",
     retweets: "89"
     }
    ];
   } else if (apps < 12) {
    const formText = form >= 70 ? "on stellar form" : "finding their feet";
    const ratingText = avgRating >= 7.0 ? `impressive average rating of ${avgRating.toFixed(1)}` : "average performances";
    return [
     {
     handle: "@EFL_Watch",
     verified: true,
     time: "3h ago",
     text: `👀 Monitoring: Several regional scouts are tracking ${lastName} in ${currentLeague}. The youngster is ${formText} with an ${ratingText}. No official bids yet, but interest is building slowly. #EFL`,
     likes: "4.2K",
     retweets: "310"
     },
     {
     handle: "@SkySportsNews",
     verified: true,
     time: "8h ago",
     text: `RUMOR: Local scouts have flagged ${lastName} as a player of interest. Reports suggest lower ${nextLeagueUp} teams are keeping tabs on their progress, though their current representation restricts high-profile pitches.`,
     likes: "1.9K",
     retweets: "180"
     },
     {
     handle: "@FanBanterFC",
     verified: false,
     time: "1d ago",
     text: `Can we talk about ${lastName}'s current contract? £${wage}/week feels like a bargain considering the potential. If they keep performing, current club must offer a renewal before interest spikes! 😤`,
     likes: "3.2K",
     retweets: "210"
     }
    ];
   } else {
    // 12+ appearances: Full Speculation/Active rumors
    if (agentTier === 'Rookie' || (agentTier === 'Hungry' && currentLeague !== 'Premier League')) {
     const nextLevel = agentTier === 'Rookie' ? nextLeagueUp : 'Premier League';
     return [
      {
      handle: "@RomanoHere",
      verified: true,
      time: "1h ago",
      text: `🚨 EXCL: ${nextLevel} clubs are keen on ${lastName} after ${apps} solid appearances. However, player's ${agentTier} agent tier caps high-profile pitches. Upgrade in representation or higher reputation needed to unlock elite talks. #EFL`,
      likes: "12.4K",
      retweets: "1.8K"
      },
      {
      handle: "@SkySportsNews",
      verified: true,
      time: "4h ago",
      text: `TRANSFER UPDATE: Gating limits are holding back major top-flight interest for ${lastName} despite consistent displays. ${nextLevel} scouts remain in attendance, but formal offers are pending.`,
      likes: "8.5K",
      retweets: "1.1K"
      },
      {
      handle: "@TacticalWiz_FC",
      verified: false,
      time: "12h ago",
      text: `📊 Tactical Breakdown: At OVR ${ovr}, ${lastName} is outgrowing ${currentLeague}. Average match rating of ${avgRating.toFixed(1)} makes them prime ${nextLevel} material. Time for a big career move?`,
      likes: "2.4K",
      retweets: "340"
      }
     ];
    } else {
     // High rep and high agent (Shark+ or Premier League player): Elite Premier League rumors
     const targetClubs = ["Aston Villa", "Newcastle", "Everton", "West Ham", "Sunderland"];
     const clubText = targetClubs[Math.floor((apps + worldRep) % targetClubs.length)];
     return [
      {
      handle: "@RomanoHere",
      verified: true,
      time: "2h ago",
      text: `🚨 HERE WE GO? Speculation mounting around ${lastName}. Elite scouts from clubs like ${clubText} have requested full data packets. Player is open to the next step as World Reputation hits ${worldRep}%.`,
      likes: "38.4K",
      retweets: "5.2K"
      },
      {
      handle: "@SkySportsNews",
      verified: true,
      time: "5h ago",
      text: `BREAKING: ${clubText} are reportedly preparing a formal approach for ${lastName} ahead of the next window. Personal terms are not expected to be an issue. Negotiations ongoing.`,
      likes: "22.1K",
      retweets: "3.4K"
      },
      {
      handle: "@FanBanterFC",
      verified: false,
      time: "1d ago",
      text: `Absolutely massive news! OVR ${ovr} ${lastName} is officially on the radar of ${clubText}. From ${currentLeague} to top-tier gossip, the trajectory is crazy! 📈🔥`,
      likes: "15.9K",
      retweets: "2.8K"
      }
     ];
    }
   }
  };
 
 const todaysCalendarEntry = state.seasonCalendar?.find(e => e.week === state.currentWeek && e.day === state.currentDay);
 const isMatchDay = todaysCalendarEntry?.type === 'MATCH';
 const isTransferWindow = state.currentWeek <= 4 || (state.currentWeek >= 26 && state.currentWeek <= 29);
 
 const upcomingMatchesIn7Days = state.seasonCalendar?.filter(e => {
 if (e.type !== 'MATCH') return false;
 const diffWeeks = e.week - state.currentWeek;
 if (diffWeeks < 0 || diffWeeks > 1) return false;
 const daysArr = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
 const currentIdx = daysArr.indexOf(state.currentDay);
 const targetIdx = daysArr.indexOf(e.day);
 const totalDaysDiff = (diffWeeks * 7) + (targetIdx - currentIdx);
 return totalDaysDiff >= 0 && totalDaysDiff <= 7;
 }) || [];
 
 const fixtureCongestion = upcomingMatchesIn7Days.length >= 3;
 
 // Find current club details
 const clubSymbol = player.currentClubSymbol || 'BIR';
 const club = CLUBS.find(c => c.symbol.toUpperCase() === clubSymbol.toUpperCase()) || {
 name: "Birmingham City",
 symbol: clubSymbol,
 league: "Championship",
 country: "England",
 tier: "Lower" as const,
 ovr: 50,
 primaryColor: "#0052CC",
 secondaryColor: "#FFFFFF"
 };

 const squad = getClubSquad(club.name);
 const worldClub = state.worldState?.clubs?.[clubSymbol];
 const managerName = worldClub?.manager?.name || player.managerInfo?.name || squad.manager || "The Manager";

 const unreadMessages = state.inbox.filter(m => !m.read);

 const getFanTier = (fans: number) => {
  if (fans >= 95) return { title: 'Legend 👑', progress: 100, min: 95, max: 100 };
  if (fans >= 80) return { title: 'Icon ⭐', progress: ((fans - 80) / 15) * 100, min: 80, max: 95 };
  if (fans >= 60) return { title: 'Cult Hero 🏆', progress: ((fans - 60) / 20) * 100, min: 60, max: 80 };
  if (fans >= 40) return { title: 'Fan Favourite ❤️', progress: ((fans - 40) / 20) * 100, min: 40, max: 60 };
  if (fans >= 20) return { title: 'Squaddie 🤝', progress: ((fans - 20) / 20) * 100, min: 20, max: 40 };
  return { title: 'Stranger 👻', progress: (fans / 20) * 100, min: 0, max: 20 };
 };

 const fanTier = getFanTier(player.fans);
 const formHistory = player.stateFlags?.openThreads?.formHistory || ['W', 'W', 'D', 'L', 'W'];

 const [showInjuryModal, setShowInjuryModal] = useState(false);
 const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

 useEffect(() => {
   if (player?.isInjured && player?.rehabProcess && !player.rehabProcess.treatmentSelected) {
     setShowInjuryModal(true);
   } else {
     setShowInjuryModal(false);
   }
 }, [player?.isInjured, player?.rehabProcess?.treatmentSelected]);

 const handleSelectTreatment = (type: 'SURGERY' | 'CONSERVATIVE' | 'INJECTION') => {
   if (!player || !player.rehabProcess) return;

   let updatedPlayer = { ...player };
   updatedPlayer.rehabProcess = { ...updatedPlayer.rehabProcess, treatmentSelected: true, treatmentType: type };
   
   if (type === 'SURGERY') {
     updatedPlayer.rehabProcess.totalWeeksEstimated = Math.max(1, Math.floor(updatedPlayer.rehabProcess.totalWeeksEstimated * 0.6));
     updatedPlayer.attributes = {
       ...updatedPlayer.attributes,
       pace: Math.max(1, updatedPlayer.attributes.pace - 2),
       agility: Math.max(1, updatedPlayer.attributes.agility - 2)
     };
     updatedPlayer.rehabProcess.reInjuryRisk = 2;
   } else if (type === 'CONSERVATIVE') {
     updatedPlayer.rehabProcess.totalWeeksEstimated = Math.ceil(updatedPlayer.rehabProcess.totalWeeksEstimated * 1.5);
     updatedPlayer.rehabProcess.reInjuryRisk = 5;
   } else if (type === 'INJECTION') {
     updatedPlayer.rehabProcess.totalWeeksEstimated = Math.max(1, Math.floor(updatedPlayer.rehabProcess.totalWeeksEstimated * 0.4));
     updatedPlayer.rehabProcess.reInjuryRisk = 30;
   }
   
   updatedPlayer.timeline = [
     {
       id: `treatment_${Date.now()}`,
       week: state.currentWeek,
       day: state.currentDay,
       type: 'INJURY',
       title: `Selected ${type.charAt(0) + type.slice(1).toLowerCase()} Treatment`,
       description: `Opted for the ${type.toLowerCase()} recovery path for ${updatedPlayer.rehabProcess.injuryName}.`
     },
     ...(updatedPlayer.timeline || [])
   ];

   setPlayer(updatedPlayer);
   setShowInjuryModal(false);
 };

 return (
 <div className="flex flex-col gap-6 w-full font-sans text-sm pb-12">
  {showInjuryModal && player?.rehabProcess && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-red-500/30 rounded-xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="text-red-400 w-8 h-8" />
            <h2 className="text-red-400 font-black uppercase tracking-tight text-3xl">Injury Management</h2>
          </div>
          <p className="text-white/70 mb-6 leading-relaxed">
            You have sustained a <strong>{player.rehabProcess.injuryName}</strong>. The club's medical staff requires you to select a recovery path. This choice will affect your downtime and your long-term athletic profile.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button onClick={() => handleSelectTreatment('SURGERY')} className="group flex flex-col p-4 bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-white/10 rounded-lg text-left transition-all">
              <span className="text-red-400 font-bold uppercase tracking-wider text-sm mb-1">Specialized Surgery</span>
              <span className="text-white/60 text-xs mb-3 flex-1">Invasive repair for the fastest structural fix.</span>
              <div className="text-[10px] uppercase font-mono tracking-wider space-y-1">
                <div className="text-emerald-400">⚡ Fast Recovery (-40% time)</div>
                <div className="text-red-400">⚠ Stat Penalty (-2 Pace/Agility)</div>
                <div className="text-emerald-400">🛡️ Minimal Relapse Risk</div>
              </div>
            </button>

            <button onClick={() => handleSelectTreatment('CONSERVATIVE')} className="group flex flex-col p-4 bg-white/5 border border-white/10 hover:border-[#38bdf8]/50 hover:bg-white/10 rounded-lg text-left transition-all">
              <span className="text-[#38bdf8] font-bold uppercase tracking-wider text-sm mb-1">Conservative Rehab</span>
              <span className="text-white/60 text-xs mb-3 flex-1">Natural healing process with physical therapy.</span>
              <div className="text-[10px] uppercase font-mono tracking-wider space-y-1">
                <div className="text-amber-400">⏳ Slow Recovery (+50% time)</div>
                <div className="text-emerald-400">✨ No Stat Penalties</div>
                <div className="text-emerald-400">🛡️ Low Relapse Risk</div>
              </div>
            </button>

            <button onClick={() => handleSelectTreatment('INJECTION')} className="group flex flex-col p-4 bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-white/10 rounded-lg text-left transition-all">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-sm mb-1">Experimental Injections</span>
              <span className="text-white/60 text-xs mb-3 flex-1">Pain-blocking and rapid inflammation reduction.</span>
              <div className="text-[10px] uppercase font-mono tracking-wider space-y-1">
                <div className="text-emerald-400">⚡ Very Fast (-60% time)</div>
                <div className="text-emerald-400">✨ No Immediate Stat Penalty</div>
                <div className="text-red-400">⚠ High Relapse Risk (30%)</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
  {isDeadlineDay && (
     <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
           <h2 className="text-red-400 font-black tracking-widest uppercase text-xl flex items-center gap-2 mb-1">
              <Clock size={20} className="animate-pulse" />
              Transfer Deadline Day
           </h2>
           <p className="text-white/80 text-xs">The window closes at midnight tonight. Make your final decisions now.</p>
        </div>
        <div className="relative z-10 bg-black/40 px-6 py-3 rounded-lg border border-red-500/30 text-center flex-shrink-0">
           <div className="text-red-400 font-mono font-bold text-3xl tabular-nums tracking-tighter">
              {formatTime(deadlineSeconds)}
           </div>
           <div className="text-white/50 text-[9px] font-bold tracking-widest uppercase mt-1">Remaining</div>
        </div>
     </div>
  )}

  {/* 1. Brand Header / Club Info Banner */}
  <div className="relative overflow-hidden bg-gradient-to-r from-[#111111] to-[#161616] rounded-xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative">
  {/* Dynamic color accent bar top */}
  <div className="absolute top-0 left-0 right-0 h-1 bg-[#00FF88]"></div>
  {/* Secondary subtle background glow */}
  <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#00FF88]/5 rounded-full blur-3xl pointer-events-none"></div>

  <div className="flex items-center gap-5 relative z-10">
   {/* Player Profile Avatar with Studio Edit Button */}
   <div className="relative group cursor-pointer shrink-0" onClick={() => setIsAvatarModalOpen(true)}>
    <CharacterPortrait
     type="player"
     name={`${player.firstName} ${player.lastName}`}
     nationality={player.nationality}
     size={68}
     showBorder={true}
    />
    <div className="absolute -bottom-1 -right-1 bg-teal-500 text-black p-1.5 rounded-full border border-black shadow-lg group-hover:scale-110 transition-transform">
     <Camera size={12} />
    </div>
   </div>

   <TeamLogo
   symbol={club.symbol}
   name={club.name}
   primaryColor={club.primaryColor}
   secondaryColor={club.secondaryColor}
   size={68}
   className="flex-shrink-0"
   />
   <div>
   <div className="flex items-center gap-3 mb-2">
    <span className="text-[10px] font-black uppercase tracking-widest bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] px-2.5 py-1 rounded-md">
    {club.league}
    </span>
    {player.loanInfo && (
    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2.5 py-1 rounded-md">
     ON LOAN ({player.startingClubSymbol})
    </span>
    )}
   </div>
   
   <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight mb-1">
    {player.firstName} {player.lastName} &bull; <span className="text-white/60">{club.name}</span>
   </h1>
   <p className="text-white/50 text-xs font-mono uppercase tracking-widest">
    {player.position} &middot; OVR: {player.ovr} &middot; {club.country} &middot; Tier: {club.tier}
   </p>
   </div>
  </div>

  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 relative z-10 w-full md:w-auto">
   <button
     onClick={() => setIsAvatarModalOpen(true)}
     className="bg-teal-500/20 border border-teal-500/40 hover:bg-teal-500 hover:text-black text-teal-300 px-4 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
   >
     <Camera size={14} /> AVATAR STUDIO
   </button>
   <div className="flex flex-col gap-1 w-full md:w-48 glass-panel px-4 py-3 rounded-lg justify-center">
    <div className="text-[9px] font-bold text-white/50 uppercase tracking-widest flex justify-between">
    <span>Fan Status: {fanTier.title}</span>
    <span className="text-white">{Math.floor(player.fans || 0)}/100</span>
    </div>
    <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
    <div className="h-full bg-[#00FF88] transition-all" style={{ width: `${fanTier.progress}%` }} />
    </div>
   </div>
   
   <div className="flex items-center gap-4 glass-panel px-6 py-4 rounded-lg self-stretch md:self-auto justify-between md:justify-start">
   <div className="flex flex-col">
    <span className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Weekly Salary</span>
    <span className="text-white font-mono font-bold text-lg">
    £{(player.contract.wage || 0).toLocaleString()}
    </span>
   </div>
   <div className="w-px h-8 bg-[#333333]"></div>
   <div className="flex flex-col">
    <span className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Net Worth</span>
    <span className="text-[#00FF88] font-mono font-bold text-lg">
    £{(player.finances.balance || 0).toLocaleString()}
    </span>
   </div>
   <button 
    onClick={() => setScreen('CAREER')}
    className="ml-4 bg-[#00FF88]/10 border border-[#00FF88]/30 hover:bg-[#00FF88] hover:text-black text-[#00FF88] px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest transition-colors z-20"
   >
    Career Stats
   </button>
   </div>
  </div>
  </div>

  {/* Dynamic Tutorial / Onboarding First-Encounter Alerts */}
  <div className="flex flex-col gap-3">
    <FirstEncounterCallout term="Manager Trust" />
    <FirstEncounterCallout term="Match Sharpness" />
    <FirstEncounterCallout term="Squad Chemistry" />
  </div>

  {/* Daily Objectives & Quests System */}
  <DailyQuestsWidget />

  {/* Pro Football Manager & Career Depth Center */}
  <CareerDepthWidget />

  {/* Active Critical Alert Banners */}
  {(() => {
    const criticalMessages = (state.inbox || []).filter(msg => isDecisionRequired(msg));
    if (criticalMessages.length === 0) return null;
    
    return (
      <div id="active_critical_alerts" className="flex flex-col gap-3">
        {criticalMessages.map((msg) => (
          <div key={msg.id} className="bg-red-500/15 border border-red-500/40 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚨</span>
              <div>
                <span className="text-red-400 text-[9px] font-mono font-black uppercase tracking-widest block">
                  ACTION REQUIRED &bull; {resolveSenderIdentity(state, msg.sender, msg.id).toUpperCase()}
                </span>
                <p className="text-white text-xs font-mono mt-0.5 font-bold uppercase tracking-wide">
                  {msg.subject}
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setScreen('INBOX', true);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded font-mono text-[10px] font-black uppercase tracking-widest transition-all shrink-0 shadow-lg shadow-red-500/20 cursor-pointer"
            >
              Resolve Now
            </button>
          </div>
        ))}
      </div>
    );
  })()}



  {/* 2. Bento Grid Dashboard */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  
  {/* Left Widget: Action Center and Schedule */}
  <div className="md:col-span-2 flex flex-col gap-6">

   {/* Action Center - Event / Match / Training triggers */}
   <div className="flex-1 flex min-h-[300px]">
   {state.activeEvent ? (
    <div className="premium-card border border-[#00FF88] rounded-xl flex-1 flex flex-col justify-center p-8 relative overflow-hidden shadow-2xl">
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-2xl pointer-events-none"></div>
    <div className="max-w-xl w-full mx-auto text-left relative z-10">
     <div className="text-[#00FF88] text-[9px] font-black uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Unexpected Incident / Choice Required</div>
     <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-3">{state.activeEvent.title}</h3>
     <p className="text-[#aaaaaa] text-xs leading-relaxed mb-6 font-mono">{state.activeEvent.description}</p>
     
     <div className="flex flex-col gap-2.5">
      {state.activeEvent.choices.map((choice, i) => (
      <button 
       key={i}
       onClick={() => resolveEvent(choice.actionType)}
       className="bg-[#181818] border border-[#2f2f2f] hover:border-[#00FF88] hover:bg-[#00FF88] hover:text-black text-white p-3.5 text-xs font-bold uppercase tracking-widest transition-all flex justify-between items-center rounded-lg group"
      >
       <span>{choice.text}</span>
       <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      ))}
     </div>
    </div>
    </div>
    ) : player.isInjured ? (
     <div className="bg-gradient-to-br from-[#111] to-[#121921] border border-[#38bdf8]/40 rounded-xl flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden shadow-xl w-full">
      <Activity size={90} className="text-[#38bdf8] opacity-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <span className="text-[#38bdf8] text-[9px] font-black uppercase tracking-widest border border-[#38bdf8]/20 px-3 py-1 rounded bg-[#38bdf8]/5 mb-4 relative z-10 animate-pulse">MEDICAL PROTOCOL</span>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6 relative z-10 w-full text-left">
       <div>
        <div className="flex items-center gap-2 mb-1">
         <span className="text-[#38bdf8] text-[9px] font-black uppercase tracking-widest border border-[#38bdf8]/30 px-2.5 py-0.5 rounded bg-[#38bdf8]/10 animate-pulse">
          ACTIVE MEDICAL REHABILITATION
         </span>
         <span className="text-white/40 text-[10px] font-mono font-bold uppercase">
          {player.rehabProcess?.severity || 'INJURED'} &middot; ~{player.injuryWeeksLeft || 1} wks left
         </span>
        </div>
        <h2 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight">
         {player.injuryName || 'Muscle Strain Recovery'}
        </h2>
       </div>
       <button 
        onClick={() => setScreen('REHAB_MINIGAME')}
        className="bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#38bdf8] px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2"
       >
        <span>Launch Physio Minigame</span> <ArrowRight size={14} />
       </button>
      </div>

      {/* Multi-Stage Progress Tracker */}
      <div className="mb-6 bg-[#080d12]/80 border border-white/5 rounded-xl p-4 sm:p-5 relative z-10 w-full">
       <div className="flex justify-between items-center mb-3">
        <span className="text-white/60 text-[10px] font-mono uppercase tracking-widest font-bold">Rehab Stages Roadmap</span>
        <span className="text-[#38bdf8] text-[10px] font-mono font-bold uppercase">
         Stage: {player.rehabProcess?.currentStage?.replace('_', ' ') || 'REST'}
        </span>
       </div>

       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {(player.rehabProcess?.stages || [
         { id: 'REST', name: 'Stage 1: Rest', description: 'Inflammation control' },
         { id: 'LIGHT_REHAB', name: 'Stage 2: Light Gym', description: 'Mobility & Hydrotherapy' },
         { id: 'FULL_TRAINING', name: 'Stage 3: Full Drills', description: 'Pitch agility' },
         { id: 'MATCH_FITNESS', name: 'Stage 4: Match Readiness', description: 'Sub & contact' }
        ]).map((stg, idx) => {
         const isCurrent = player.rehabProcess?.currentStage === stg.id;
         const isCompleted = (player.rehabProcess?.weeksElapsed || 0) >= (stg.completedWeeks || 0);
         return (
          <div key={stg.id} className={`p-3 rounded-lg border text-left transition-all ${
           isCurrent ? 'bg-[#38bdf8]/15 border-[#38bdf8] shadow-lg shadow-[#38bdf8]/10' :
           isCompleted ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-[#080808] border-white/5 text-white/40'
          }`}>
           <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/50 mb-1">
            0{idx + 1}. {stg.id.replace('_', ' ')}
           </div>
           <div className="text-xs font-bold text-white uppercase truncate mb-0.5">{stg.name}</div>
           <div className="text-[9px] text-white/40 line-clamp-1">{stg.description}</div>
          </div>
         );
        })}
       </div>
      </div>

      {/* Medical Staff Advice & Re-Injury Risk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10 w-full text-left">
       <div className="md:col-span-2 bg-[#080d12]/90 border-l-4 border-[#38bdf8] p-4 rounded-r-xl font-mono text-xs text-[#d0f0ff] leading-relaxed">
        <div className="text-[#38bdf8] text-[9px] font-bold uppercase tracking-widest mb-1 font-sans flex items-center gap-2">
         <Activity size={12} /> Lead Physio Assessment ({getClubStaff(state).physio.fullName})
        </div>
        <p className="italic">"{player.rehabProcess?.medicalAdvice || "Focus on controlled physical therapy and avoid sudden explosive load."}"</p>
       </div>

       <div className="bg-[#080d12]/90 border border-white/5 p-4 rounded-xl flex flex-col justify-center">
        <div className="text-white/40 text-[9px] font-mono uppercase tracking-widest font-bold mb-1">Re-Injury Risk Coefficient</div>
        <div className="text-2xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
         <span className={(player.rehabProcess?.reInjuryRisk || 5) > 20 ? 'text-red-400' : 'text-emerald-400'}>
          {player.rehabProcess?.reInjuryRisk || 5}%
         </span>
         <span className="text-[10px] text-white/40 font-normal">relapse risk</span>
        </div>
        <div className="text-[9px] text-white/40 mt-1">
         Relapses: {player.rehabProcess?.relapseCount || 0} suffered
        </div>
       </div>
      </div>

      {/* Weekly Rehab Pacing Choices */}
      <div className="relative z-10 bg-[#070b0f] border border-white/10 rounded-xl p-4 sm:p-5 w-full text-left">
       <div className="text-white text-xs font-black uppercase tracking-wider mb-3 font-sans">
        Select Weekly Rehab Recovery Intensity
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
         onClick={() => advanceRehabPacing('PUSH_HARD')}
         className="p-3.5 rounded-lg border border-amber-500/30 hover:border-amber-400 bg-amber-950/20 text-left transition-all group"
        >
         <div className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-between mb-1">
          <span>⚡ Fast-Track / Push Hard</span>
          <span className="text-[9px] font-mono text-red-400">+35% Risk</span>
         </div>
         <p className="text-white/60 text-[10px] leading-snug">
          Accelerates return speed (+1.6 wks progress). High risk of muscular relapse (-15 Sharpness).
         </p>
        </button>

        <button
         onClick={() => advanceRehabPacing('RECOMMENDED')}
         className="p-3.5 rounded-lg border border-[#38bdf8]/40 hover:border-[#38bdf8] bg-[#38bdf8]/10 text-left transition-all group"
        >
         <div className="text-[#38bdf8] font-bold text-xs uppercase tracking-wider flex items-center justify-between mb-1">
          <span>⚕️ Standard Protocol</span>
          <span className="text-[9px] font-mono text-emerald-400">Low Risk</span>
         </div>
         <p className="text-white/60 text-[10px] leading-snug">
          Follow medical team guidelines (+1.0 wk progress). Balanced recovery and muscle restoration.
         </p>
        </button>

        <button
         onClick={() => advanceRehabPacing('CAUTIOUS')}
         className="p-3.5 rounded-lg border border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20 text-left transition-all group"
        >
         <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-between mb-1">
          <span>🛡️ Extra Cautious</span>
          <span className="text-[9px] font-mono text-emerald-400">Min Risk</span>
         </div>
         <p className="text-white/60 text-[10px] leading-snug">
          Extra tissue recovery (+0.85 wk progress). Near-zero re-injury risk (+8 Match Sharpness).
         </p>
        </button>
       </div>
      </div>
     </div>
    ) : player.currentClubSymbol === 'FA' ? (
     <div className="bg-gradient-to-br from-[#111] to-[#1a1c1d] border border-zinc-800 rounded-xl flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden shadow-xl w-full">
      <Briefcase size={90} className="text-zinc-600 opacity-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <span className="text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-zinc-800 px-3 py-1 rounded bg-zinc-900/40 mb-4 relative z-10">UNEMPLOYED REGIME</span>
      <h2 className="text-white text-3xl font-black uppercase tracking-tighter mb-2 relative z-10">FREE AGENT TRIALIST</h2>
      <p className="text-white/50 font-bold mb-4 uppercase tracking-widest text-xs relative z-10 max-w-md font-mono">
       Awaiting Emergency Contract or Club Invitations
      </p>
      <p className="text-zinc-400 font-sans text-xs mb-8 max-w-sm relative z-10 leading-relaxed">
       You are currently without a club. Put in solo physical workouts to maintain your core physical attributes and pitch your credentials directly to interested clubs.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
       <button 
        onClick={() => {
         if (state.player) {
          const updatedPlayer = {
           ...state.player,
           sharpness: Math.min(100, state.player.sharpness + 10),
           attributes: {
            ...state.player.attributes,
            stamina: Math.min(100, state.player.attributes.stamina + 10)
           }
          };
          setPlayer(updatedPlayer);
         }
         const notification = {
           id: `solo_workout_${Date.now()}`,
           sender: "AGENT",
           subject: "Solo Workout Complete",
           content: "You put in a grueling solo session at the local training park. Sharpness and stamina both increased. Keep it up, we need to stay match-fit for trial scouts.",
           read: false,
           type: 'DM' as const,
           timestamp: "Week " + state.currentWeek,
           choices: []
          };
          setInbox([notification, ...state.inbox]);
         advanceDay(true);
        }}
        className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-xs"
       >
        Solo Workout Session <ArrowRight size={14} />
       </button>
       <button 
        onClick={() => setScreen('TRANSFERS')} 
        className="bg-[#00FF88] hover:bg-white text-black px-8 py-3 rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-xs shadow-lg shadow-[#00FF88]/10"
       >
        Apply to Clubs <Briefcase size={14} />
       </button>
      </div>
     </div>
    ) : isMatchDay ? (
    state.nextMatch?.playerStatus === 'UNUSED' ? (
    <div className="bg-gradient-to-br from-[#111] to-[#1a1313] border border-red-900/40 rounded-xl flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden shadow-xl">
     <ShieldAlert size={90} className="text-red-500 opacity-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
     <span className="text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/20 px-3 py-1 rounded bg-red-500/5 mb-4 relative z-10 animate-pulse">OMITTED FROM SQUAD</span>
     <h2 className="text-white text-4xl font-black uppercase tracking-tighter mb-2 relative z-10">SQUAD OMISSION</h2>
     <p className="text-white/50 font-bold mb-4 uppercase tracking-widest text-xs relative z-10 max-w-md font-mono">
      ROUND VS {state.nextMatch?.opponentSymbol || 'OPPONENT'}
     </p>
     <p className="text-red-400 font-sans text-xs mb-8 max-w-sm relative z-10 leading-relaxed">
      {state.nextMatch?.selectionReason
        ? `Manager Decision: ${state.nextMatch.selectionReason}. You were omitted from the matchday squad.`
        : `You were not selected for the matchday squad. Instead of traveling with the team, you are ordered to undergo intense training at the club's facility to improve your fitness and regain trust.`}
     </p>
     <button 
     onClick={() => {
      if (state.player) {
       const updatedPlayer = {
        ...state.player,
        sharpness: Math.min(100, state.player.sharpness + 15),
        trust: Math.min(100, state.player.trust + 5)
       };
       setPlayer(updatedPlayer);
      }
      const notification = {
        id: Date.now().toString(),
        sender: getCanonicalSender(state, 'ASSISTANT'),
        subject: "Omission Fitness Report",
        content: "Excellent response to your squad omission today. You stayed back at the facility and put in an intense physical shift. Your sharpness and determination have been recorded and sent to the manager.",
        read: false,
        type: 'DM' as 'DM',
        timestamp: "Week " + state.currentWeek,
        choices: []
       };
       setInbox([notification, ...state.inbox]);
      advanceDay(true);
     }} 
     className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest flex items-center gap-3 relative z-10 transition-colors shadow-lg shadow-red-500/10 text-xs"
     >
     Complete Fitness Drills <ArrowRight size={18} />
     </button>
    </div>
    ) : (
    <div className={`bg-gradient-to-br ${state.nextMatch?.matchType === 'DERBY' ? 'from-[#1a1111] to-[#111] border-red-500/50' : state.nextMatch?.matchType === 'GRUDGE' ? 'from-[#1a1411] to-[#111] border-orange-500/50' : 'from-[#111] to-[#161616] border-[#00FF88]/40'} rounded-xl flex-1 flex flex-col p-6 md:p-8 relative overflow-hidden shadow-xl`}>
     <ShieldAlert size={90} className="text-[#00FF88] opacity-5 absolute -top-10 -right-10 pointer-events-none animate-pulse" />
     
     <div className="flex flex-col xl:flex-row gap-8 items-stretch w-full relative z-10">
      {/* Matchday general column */}
      <div className="flex-1 flex flex-col justify-center items-center text-center xl:text-left xl:items-start border-b xl:border-b-0 xl:border-r border-white/10 pb-6 xl:pb-0 xl:pr-8">
       <span className="text-[#00FF88] text-[9px] font-black uppercase tracking-widest border border-[#00FF88]/20 px-3 py-1 rounded bg-[#00FF88]/5 mb-4 animate-pulse inline-block">
        {state.nextMatch?.matchType === 'DERBY' ? (
          <span className="text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/40 px-3 py-1 rounded bg-red-950/20 animate-pulse flex items-center gap-1">
            🔥 DERBY DAY: Genuine Rivalry Stakes
          </span>
        ) : state.nextMatch?.matchType === 'GRUDGE' ? (
          <span className="text-orange-500 text-[9px] font-black uppercase tracking-widest border border-orange-500/40 px-3 py-1 rounded bg-orange-950/20 animate-pulse flex items-center gap-1">
            ⚡ GRUDGE MATCH: Deep-Seated History
          </span>
        ) : (
          <span>MATCHDAY PROTOCOL</span>
        )}
       </span>
       <h2 className="text-white text-4xl font-black uppercase tracking-tighter mb-2">MATCHDAY</h2>
       <p className="text-white/50 font-bold mb-6 uppercase tracking-widest text-xs font-mono">
        {state.nextMatch ? `ROUND VS ${state.nextMatch.opponentSymbol} · ${state.nextMatch.matchType}` : 'READY FOR THE CAMPAIGN.'}
       </p>
       
       <button 
        onClick={() => setScreen('MATCH')} 
        className="w-full sm:w-auto bg-[#00FF88] hover:bg-[#00FF88]/90 text-black px-12 py-4 rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#00FF88]/10 text-xs border-2 border-black ring-4 ring-[#00FF88]/20"
       >
        PLAY MATCHDAY FIXTURE <ArrowRight size={18} />
       </button>
      </div>

      {/* Scout Report column */}
      <div className="flex-1 flex flex-col justify-between">
       {(() => {
        const oppClub = CLUBS.find(c => c.symbol === state.nextMatch?.opponentSymbol);
        const oppName = oppClub ? oppClub.name : 'Upcoming Opponent';
        const oppOVR = oppClub ? oppClub.ovr : 75;
        const studied = !!state.nextMatch?.scoutReportStudied;
        const currentStrategy = state.nextMatch?.selectedStrategy || 'BALANCED';

        // Calculate if correct counter is active
        const hasCorrectCounter = studied && (
          (oppOVR >= 85 && currentStrategy === 'EXPOSE_HIGH_LINE') ||
          (oppOVR >= 70 && oppOVR < 85 && currentStrategy === 'TARGET_FLANKS') ||
          (oppOVR < 70 && currentStrategy === 'HIGH_PRESS')
        );
        const isMismatched = studied && currentStrategy !== 'BALANCED' && !hasCorrectCounter;

        return (
         <div className="flex flex-col h-full justify-between gap-4 text-left font-mono text-xs">
          <div>
           <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
            <span className="text-white/40 uppercase tracking-widest text-[9px] font-bold">Tactical Intelligence Room</span>
            <span className="text-[#00FF88] text-[9px] font-bold uppercase bg-[#00FF88]/10 px-2 py-0.5 rounded border border-[#00FF88]/20">Opposition: {state.nextMatch?.opponentSymbol} (OVR {oppOVR})</span>
           </div>

           {!studied ? (
            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg flex flex-col justify-center items-center text-center gap-3">
             <p className="text-white/70 text-xs leading-relaxed max-w-sm font-sans">
              An unread <strong>Scout Report</strong> has arrived for your match vs <strong>{oppName}</strong>. Study their setup to unlock vital tactical counters and reduce match difficulty.
             </p>
             <button 
              onClick={() => {
               updateNextMatch({ scoutReportStudied: true, selectedStrategy: 'BALANCED' });
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
             >
              Study Scout Report
             </button>
            </div>
           ) : (
            <div className="space-y-3">
             <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
              <span className="text-white/40 text-[9px] font-black block uppercase tracking-widest mb-1">
               {oppOVR >= 85 ? '🔍 HIGH-LINE COUNTER-ATTACK ANALYSIS' : oppOVR >= 70 ? '🔍 NARROW POSITIONAL TIKI-TAKA ANALYSIS' : '🔍 DIRECT DEEP LOW-BLOCK ANALYSIS'}
              </span>
              <p className="text-white/80 text-[11px] leading-relaxed font-sans">
               {oppOVR >= 85 
                ? `${oppName} uses an aggressive high defensive line with ball-playing center backs. They dominate possession but leave wide avenues vulnerable to direct overhead balls. Counter by exposing their high line.`
                : oppOVR >= 70 
                ? `${oppName} crowds the central channels with short positional passing circles. They lack lateral covering pace on the wings. Counter by targeting the flanks.`
                 : `${oppName} maintains a compact, defensive low block to frustrate forwards. They lack composure under immediate transition pressure. Counter by sustaining a high aggressive press.`
               }
              </p>
             </div>

             <div className="space-y-1">
              <span className="text-white/40 text-[9px] font-black block uppercase tracking-widest">Select Matchday Counter-Strategy:</span>
              <div className="grid grid-cols-2 gap-2">
               {[
                { id: 'BALANCED', label: 'Balanced' },
                { id: 'EXPOSE_HIGH_LINE', label: 'Expose High Line' },
                { id: 'TARGET_FLANKS', label: 'Target Flanks' },
                { id: 'HIGH_PRESS', label: 'High Press' }
               ].map(strat => (
                <button
                 key={strat.id}
                 onClick={() => updateNextMatch({ selectedStrategy: strat.id })}
                 className={`py-2 px-3 border rounded text-[10px] font-bold uppercase transition-all text-center ${
                  currentStrategy === strat.id 
                   ? 'border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]' 
                   : 'border-white/10 bg-[#0c0c0c] text-white/50 hover:border-white/30'
                 }`}
                >
                 {strat.label}
                </button>
               ))}
              </div>
             </div>
            </div>
           )}
          </div>

          {studied && (
           <div className={`p-2.5 rounded-lg border text-center text-[10px] font-bold uppercase tracking-widest ${
            hasCorrectCounter 
             ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 animate-pulse' 
             : isMismatched 
             ? 'bg-red-950/20 border-red-500/20 text-red-400' 
             : 'bg-white/5 border-white/10 text-white/50'
           }`}>
            {hasCorrectCounter && '⚡ IDEAL COUNTER ACTIVE: Goal rates boosted, opponent threats mitigated!'}
            {isMismatched && '⚠️ TACTICAL MISMATCH: High defensive risk of opponent exploits!'}
            {currentStrategy === 'BALANCED' && '📊 STANDARD SYSTEM: Playing with baseline team dynamics.'}
           </div>
          )}
         </div>
        );
       })()}
      </div>
     </div>
    </div>
    )
   ) : (
    <InboxDigest 
     onOpenFullInbox={() => setScreen('INBOX', true)} 
     onAdvanceDay={advanceDay} 
    />
   )}
   </div>
   
   {/* Calendar Agenda Row */}
   <div className="premium-card rounded-xl p-6 shadow-md relative">
   {fixtureCongestion && (
    <div className="absolute top-6 right-6 flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20 text-[10px] font-bold uppercase tracking-widest animate-pulse">
    <AlertTriangle size={12} />
    Fixture Congestion
    </div>
   )}
   <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
    <div>
    <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
     <Calendar size={14} className="text-[#00FF88]" />
     Dynamic Weekly Schedule
    </h3>
    <p className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mt-0.5">{getFormattedCalendarDate(state.currentWeek, state.currentDay)} &middot; {state.currentWeek <= 4 ? "Pre-Season" : state.currentWeek <= 40 ? "Domestic Campaign" : "Off-Season"}</p>
    </div>
    <span className="text-[#00FF88] text-[10px] font-bold tracking-widest uppercase font-mono bg-[#00FF88]/5 px-2.5 py-1 border border-[#00FF88]/10 rounded hidden sm:inline-block">
    {state.currentDay} Status
    </span>
   </div>

   <div className="grid grid-cols-7 gap-2">
    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => {
    const isToday = state.currentDay === day;
    const dailyEntries = state.seasonCalendar?.filter(e => e.week === state.currentWeek && e.day === day) || [];
    const isMatch = dailyEntries.some(e => e.type === 'MATCH');
    const isIntl = dailyEntries.some(e => e.type === 'INTERNATIONAL_BREAK');
    const isPast = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].indexOf(day) < ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].indexOf(state.currentDay);
    const isTraining = (day === 'TUE' || day === 'THU') && !isMatch && !isIntl;
    
    return (
     <div key={day} className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${
     isToday ? 'border-[#00FF88] bg-[#00FF88]/5 shadow-[0_0_20px_rgba(201,168,76,0.05)] relative scale-102 z-10' : 
     isPast ? 'border-[#1a1a1a] bg-[#0a0a0a]/50 opacity-40' : 'border-white/10 bg-[#141414] hover:border-white/10'
     }`}>
     <span className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${isToday ? 'text-[#00FF88]' : 'text-white/40'}`}>{day}</span>
     <span className={`text-[9px] font-black uppercase font-mono ${isMatch ? 'text-emerald-500 animate-pulse' : isIntl ? 'text-purple-500' : isTraining ? 'text-[#00FF88] font-bold' : 'text-white'}`}>
      {isMatch ? 'MATCH' : isIntl ? 'INTL' : isTraining ? 'CLUB TR.' : 'DAY'}
     </span>
     </div>
    );
    })}
   </div>
   </div>

  </div>

  {/* Right Widget: Vitals Indicator Status */}
  <div className="flex flex-col gap-6">

    {/* New Manager Bounce Widget */}
    {player.newManagerBounce?.active && (
     <div className="premium-card rounded-xl p-5 shadow-md flex flex-col border border-cyan-500/30 bg-gradient-to-br from-[#0b161c] to-[#0c0f12] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none animate-pulse"></div>
      
      <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-cyan-500/10">
       <div className="flex items-center gap-2">
        <Flame size={14} className="text-cyan-400 animate-bounce" />
        <span className="text-cyan-400 text-xs font-black uppercase tracking-widest font-display">New Manager Bounce</span>
       </div>
       <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-500/20">
        {player.newManagerBounce.matchesLeft} Match{player.newManagerBounce.matchesLeft > 1 ? 'es' : ''} Left
       </span>
      </div>

      <div className="space-y-2.5 font-mono text-xs font-semibold">
       <p className="text-[#ccc] text-[11px] leading-relaxed font-sans">
        You are in the <strong className="text-cyan-300">Manager Assessment Window</strong> under the new boss, <strong className="text-white">{player.managerInfo?.name}</strong>.
       </p>
       
       <div className="bg-cyan-950/20 border border-cyan-500/10 p-2.5 rounded-lg text-[10px] space-y-1">
        <div className="text-cyan-400 font-bold uppercase">Honeymoon Boost:</div>
        <div className="text-white/70 font-sans">All Manager Trust gains on the pitch and training are multiplied by <strong className="text-cyan-300">1.5x</strong>!</div>
       </div>

       <div className="text-[10px] text-white/50 border-t border-cyan-500/10 pt-2 flex justify-between">
        <span>Manager Personality:</span>
        <span className="text-white font-bold">{player.managerInfo?.personality || 'Pragmatic'}</span>
       </div>
       
       <div className="text-[10px] text-white/50 flex justify-between mb-2">
        <span>Tactical System:</span>
        <span className="text-white font-bold">{player.managerInfo?.tacticalSystem || '4-3-3 Defense'}</span>
       </div>

       {player.roleSpecialization && player.managerInfo?.tacticalSystem && (() => {
           const roleObj = getRoleById(player.roleSpecialization.selectedRoleId);
           if (!roleObj) return null;
           const fit = getManagerTacticalFit(player.managerInfo.tacticalSystem, roleObj);
           const fitColors = {
               'PERFECT': 'text-green-400 border-green-500/20 bg-green-950/20',
               'COMPATIBLE': 'text-[#00FF88] border-[#00FF88]/20 bg-[#00FF88]/10',
               'AWKWARD': 'text-red-400 border-red-500/20 bg-red-950/20'
           };
           return (
               <div className={`p-2 rounded border ${fitColors[fit.rating]} flex flex-col gap-1 mb-2`}>
                   <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                       <span>Tactical Fit</span>
                       <span>{fit.rating}</span>
                   </div>
                   <div className="text-[9px] font-sans opacity-80">{fit.note}</div>
               </div>
           );
       })()}

       <div className="text-[10px] text-white/50 pt-1">
        <div className="font-bold mb-1">Valued Attributes:</div>
        <div className="flex flex-wrap gap-1">
         {player.managerInfo?.valuedAttributes?.map((attr: string) => (
          <span key={attr} className="bg-white/5 border border-white/10 text-white px-2 py-0.5 rounded text-[9px] uppercase font-bold">
           {attr}
          </span>
         ))}
        </div>
       </div>
      </div>
     </div>
    )}

    {/* Board & Season Objectives Widget */}
    {player.seasonObjective && (
     <div className="premium-card rounded-xl p-5 shadow-md flex flex-col border border-white/5 bg-[#0d0d0d] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF88]/5 rounded-full blur-xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-white/10">
       <div className="flex items-center gap-2">
        <Briefcase size={14} className="text-[#00FF88]" />
        <span className="text-white text-xs font-black uppercase tracking-widest font-display">Board Room Directive</span>
       </div>
       <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20">
        Season {state.season || 1}
       </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
       <div>
        <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Board Expectation</div>
        <div className="text-white font-black uppercase text-sm mt-0.5">{player.seasonObjective.title}</div>
        <div className="text-[10px] text-white/60 mt-0.5">{player.seasonObjective.targetText}</div>
       </div>

       {/* Project progress */}
       {(() => {
         const currentClub = CLUBS.find(c => c.symbol === player.currentClubSymbol) || CLUBS[0];
         const standings = CLUBS.map((c, i) => {
           const pointsOffset = player.seasonObjective?.pointsOffset || 0;
           const tierNum = c.tier === 'Elite' ? 5 : c.tier === 'Strong' ? 4 : c.tier === 'Mid' ? 3 : c.tier === 'Lower' ? 2 : 1;
           const score = c.symbol === player.currentClubSymbol 
             ? Math.round(tierNum * 20 + player.form * 4 + pointsOffset)
             : Math.round(tierNum * 20 + Math.random() * 20);
           return { ...c, simulatedScore: score };
         }).sort((a, b) => b.simulatedScore - a.simulatedScore);

         const finalPosition = standings.findIndex(c => c.symbol === player.currentClubSymbol) + 1;
         const targetPos = player.seasonObjective.targetPos;

         let statusColor = 'text-amber-400';
         let statusBg = 'bg-amber-400/5 border-amber-400/20';
         let statusText = 'On Track';

         if (finalPosition < targetPos - 2 || (targetPos === 1 && finalPosition === 1)) {
           statusColor = 'text-emerald-400';
           statusBg = 'bg-emerald-400/5 border-emerald-400/20';
           statusText = 'Exceeding Expectations';
         } else if (finalPosition <= targetPos) {
           statusColor = 'text-cyan-400';
           statusBg = 'bg-cyan-400/5 border-cyan-400/20';
           statusText = 'On Track';
         } else {
           statusColor = 'text-red-400 animate-pulse';
           statusBg = 'bg-red-400/5 border-red-400/20';
           statusText = 'Off Pace';
         }

         const boardConfidence = Math.max(0, 100 - (player.managerInfo?.pressure || 0));

         return (
           <>
            <div className="flex justify-between items-center py-2 border-y border-white/5 mt-2">
             <span className="text-white/40">Current projected standing:</span>
             <span className="text-white font-black text-xs">{finalPosition}th place</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
             <span className="text-white/40">Board Satisfaction:</span>
             <span className={`font-black ${boardConfidence >= 75 ? 'text-emerald-400' : boardConfidence >= 45 ? 'text-amber-400' : 'text-red-400'}`}>{boardConfidence}%</span>
            </div>

            <div className={`mt-2 p-2.5 rounded-lg border text-center text-[10px] font-black uppercase tracking-wider ${statusBg} ${statusColor}`}>
             Status: {statusText}
            </div>
           </>
         );
       })()}
      </div>
     </div>
    )}
   
   <div className="premium-card rounded-xl p-6 shadow-md flex-1 flex flex-col">
   <h3 className="text-white text-xs font-black uppercase tracking-widest mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
    <Award size={14} className="text-[#00FF88]" />
    Live Performance Dials
   </h3>

   <div className="space-y-5 flex-1 flex flex-col justify-center">
    <div>
    <ProgressBar label="Physical Fatigue" value={player.fatigue} colorMode="fatigue" height="h-2" />
    </div>

    <div>
    <div className="flex justify-between items-center mb-1">
     <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/70">Mental Fatigue / Burnout</span>
     <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
      (player.mentalFatigue || 0) >= 75 ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
      (player.mentalFatigue || 0) >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
      (player.mentalFatigue || 0) >= 25 ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
     }`}>
      {player.mentalFatigueDetails?.level || ((player.mentalFatigue || 0) + '%')}
     </span>
    </div>
    <ProgressBar label="" value={player.mentalFatigue || 0} colorMode="fatigue" height="h-2" />
    </div>

    <div>
    <ProgressBar label="Match Sharpness" value={player.sharpness} colorMode="accent" height="h-2" />
    </div>

    <div>
    <ProgressBar label="Morale" value={player.morale} colorMode="morale" height="h-2" />
    </div>

    <div>
    <ProgressBar label="Manager Trust" value={player.trust} colorMode="trust" height="h-2" />
    </div>
   </div>

   <div className="mt-8 pt-4 border-t border-white/10 text-center flex flex-col gap-2">
    <button 
    onClick={() => setScreen('TRAINING')}
    className="w-full bg-[#181818] border border-[#2f2f2f] hover:border-[#00FF88] text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
    >
    <AlertTriangle size={12} className="text-white/50" />
    Enter Training Center
    </button>
   </div>
   </div>
   
   {/* Quick Inbox Digest Card */}
   <div 
   className={`premium-card rounded-xl p-5 flex flex-col transition-all text-left relative overflow-hidden group shadow-md ${
     isAdvanceBlocked 
       ? 'border-2 border-red-500/80 bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
       : 'hover:border-[#00FF88]'
   }`}
   >
   <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-white/10">
    <div className="flex items-center gap-2">
     <Mail size={14} className={isAdvanceBlocked ? 'text-red-500 animate-pulse' : 'text-white/50 group-hover:text-[#00FF88] transition-colors'} />
     <span className={`text-xs font-black uppercase tracking-widest ${isAdvanceBlocked ? 'text-red-500 font-mono font-black' : 'text-white'}`}>
       Inbox Digest {isAdvanceBlocked && '(ACTION REQUIRED)'}
     </span>
    </div>
    {unreadMessages.length > 0 && (
     <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
       isAdvanceBlocked ? 'bg-red-500 text-white animate-pulse' : 'bg-[#00FF88] text-black'
     }`}>
      {unreadMessages.length} New
     </span>
    )}
   </div>

   <div className="space-y-2 w-full">
    {unreadMessages.slice(0, 2).map((msg, idx) => (
    <div key={idx} className="bg-[#141414] p-3 border-l-2 border-[#00FF88] text-left rounded flex items-center justify-between">
     <div className="truncate pr-2">
      <div className="text-[9px] text-white/50 font-bold uppercase tracking-widest mb-0.5">{msg.sender}</div>
      <div className="text-white text-[10px] truncate uppercase font-mono">{msg.subject}</div>
     </div>
     <button
      onClick={() => {
        if (isDecisionRequired(msg)) {
          setScheduleTab('ACTIONS');
        } else {
          setScheduleTab('INBOX');
        }
      }}
      className="text-[9px] font-mono text-[#00FF88] hover:underline uppercase shrink-0 font-bold cursor-pointer"
     >
      Inspect
     </button>
    </div>
    ))}
    {unreadMessages.length === 0 && (
    <div className="text-[#555] text-[10px] uppercase tracking-widest italic font-mono">No unread letters.</div>
    )}
   </div>

   <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
    <button
     onClick={() => {
      if (isAdvanceBlocked) {
       setScheduleTab('ACTIONS');
      } else {
       setScheduleTab('INBOX');
      }
     }}
     className="text-[10px] font-mono font-bold text-white/70 hover:text-[#00FF88] uppercase transition-colors cursor-pointer"
    >
     Focus Command Flow &rarr;
    </button>
    <button
     onClick={() => setScreen('INBOX', true)}
     className="text-[10px] font-mono font-black text-[#00FF88] hover:underline uppercase cursor-pointer"
    >
     Full Mailbox &rarr;
    </button>
   </div>
   </div>

  </div>

  </div>

  {/* 3. Football Manager & Pro Career Style Feed Panel (Manager Office / Transfer Rumors) */}
  <div className="premium-card rounded-xl p-6 shadow-xl mt-2">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 mb-6 gap-4">
   <div className="flex items-center gap-3">
   <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
   <h2 className="text-white text-md font-black uppercase tracking-widest font-display">Club Intelligence & speculation</h2>
   </div>
   
   <div className="flex rounded-lg p-1 bg-[#0a0a0a]">
   <button
    onClick={() => setActiveFeedTab('MANAGER')}
    className={`px-4 py-2 rounded text-[10px] font-mono font-black uppercase tracking-wider transition-colors ${activeFeedTab === 'MANAGER' ? 'bg-[#00FF88] text-black' : 'text-white/50 hover:text-white'}`}
   >
    Manager's Office
   </button>
   <button
    onClick={() => setActiveFeedTab('SPECULATION')}
    className={`px-4 py-2 rounded text-[10px] font-mono font-black uppercase tracking-wider transition-colors ${activeFeedTab === 'SPECULATION' ? 'bg-[#00FF88] text-black' : 'text-white/50 hover:text-white'}`}
   >
    Rumor Stream
   </button>
   <button
    onClick={() => setActiveFeedTab('SCOUTING')}
    className={`px-4 py-2 rounded text-[10px] font-mono font-black uppercase tracking-wider transition-colors ${activeFeedTab === 'SCOUTING' ? 'bg-[#00FF88] text-black' : 'text-white/50 hover:text-white'}`}
   >
    Scout Report
   </button>
   <button
    onClick={() => setActiveFeedTab('WORLD_NEWS')}
    className={`px-4 py-2 rounded text-[10px] font-mono font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 ${activeFeedTab === 'WORLD_NEWS' ? 'bg-teal-400 text-black font-black' : 'text-teal-400/70 hover:text-teal-300'}`}
   >
    <Globe size={12} className="animate-pulse" /> World Press Wire
   </button>
   </div>
  </div>

  {activeFeedTab === 'MANAGER' ? (
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
   {/* Left: Manager Persona Speech bubble */}
   <div className="md:col-span-2 glass-panel rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-2xl pointer-events-none"></div>
    <div>
    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
     <div className="flex items-center gap-3">
     <CharacterPortrait type="manager" size={44} name={managerName} showBorder={false} className="" />
     <div>
      <h3 className="text-white text-sm font-black uppercase tracking-wider font-display">{managerName}</h3>
      <p className="text-white/40 text-[9px] font-mono uppercase tracking-widest font-bold">First Team Head Coach</p>
     </div>
     </div>
     <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 premium-card border border-[#2a2a2a] rounded self-start sm:self-auto ${getManagerVerdict(player.trust, player.isInjured).ratingColor}`}>
     Attitude: {getManagerVerdict(player.trust, player.isInjured).attitude}
     </span>
    </div>
    
    <div className="bg-[#0e0e0e] border-l-4 border-[#00FF88] p-4 rounded-lg my-4 italic text-xs text-[#ccc] leading-relaxed relative font-mono">
     {getManagerVerdict(player.trust, player.isInjured).quote}
     <div className="absolute -bottom-2.5 left-6 w-3 h-3 bg-[#0e0e0e] border-r border-b border-white/10 transform rotate-45"></div>
    </div>
    </div>

    <div className="mt-4 pt-4 border-t border-white/10/40 flex justify-between items-center">
    <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Coach Requirement:</span>
    <span className="text-white text-xs font-mono font-bold">{getManagerVerdict(player.trust, player.isInjured).actionRequired}</span>
    </div>
   </div>

   {/* Right: Tactical standing & instructions */}
   <div className="glass-panel rounded-xl p-6 flex flex-col justify-between">
    <div>
    <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4 font-display">Tactical Standing</h4>
    <div className="space-y-4 font-mono text-xs">
     <div className="flex justify-between items-center pb-2 border-b border-white/10/40">
     <span className="text-white/50">Squad Status:</span>
     <span className="text-[#00FF88] font-bold uppercase">{player.contract?.status || "Rotation"}</span>
     </div>
     <div className="flex justify-between items-center pb-2 border-b border-white/10/40">
     <span className="text-white/50">Positions Covered:</span>
     <span className="text-white font-bold">{player.position}</span>
     </div>
     <div className="flex justify-between items-center pb-2 border-b border-white/10/40">
     <GlossaryTooltip term="Form Coefficient" className="text-white/50">Form Coefficient:</GlossaryTooltip>
     <span className={`font-bold ${player.form >= 7.5 ? 'text-emerald-400' : 'text-amber-400'}`}>{player.form?.toFixed(1) || "6.5"} / 10</span>
     </div>
     <div className="flex justify-between items-center pb-2 border-b border-white/10/40">
     <span className="text-white/50">Form Streak:</span>
     <div className="flex gap-1.5">
      {formHistory.map((res: string, i: number) => (
      <span 
       key={i} 
       className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black
       ${res === 'W' ? 'bg-emerald-500 text-black' : res === 'D' ? 'bg-amber-500 text-black' : 'bg-red-600 text-white'}`}
      >
       {res}
      </span>
      ))}
     </div>
     </div>
    </div>
    </div>
    
   </div>
   </div>
  ) : activeFeedTab === 'SPECULATION' ? (
   <div className="flex flex-col gap-5 w-full">
    {/* Scouting Activity Meter */}
    <div className="bg-[#0b0b0b] border border-[#1e1e1e] p-5 rounded-xl">
     <div className="flex justify-between items-center mb-2.5">
      <GlossaryTooltip term="Scouting Activity" className="text-white text-[10px] font-bold font-mono tracking-wider uppercase">Scouting Activity Index</GlossaryTooltip>
      <span className="text-[#00FF88] text-xs font-bold font-mono">{scoutingActivity}% Intensity</span>
     </div>
     <div className="w-full bg-[#151515] h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
      <div className="h-full bg-[#00FF88] transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(0,255,136,0.3)]" style={{ width: `${scoutingActivity}%` }} />
     </div>
     <p className="text-[10px] text-white/50 font-mono mt-3 uppercase tracking-wider leading-relaxed">
      {scoutingActivity < 20 ? "⚪ Speculation status: Quiet. No scouts active. Focus on securing your place in the first team." :
       scoutingActivity < 50 ? "🟡 Speculation status: On the Radar. Regional scouts are monitoring appearances." :
       scoutingActivity < 85 ? "🟠 Speculation status: Active Scouting. Championship representatives spotted." :
       "🔥 Speculation status: Intense. Top-tier clubs and media giants are debating your next move!"}
     </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {generateParodyRumors().map((rumor, i) => (
     <div key={i} className="glass-panel hover:border-white/10 p-4 rounded-xl flex flex-col justify-between transition-colors">
     <div className="flex justify-between items-start mb-2.5">
      <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-white/10 rounded-full border border-[#00FF88]/20 flex items-center justify-center text-xs font-black text-[#00FF88] font-mono">
       ⚽
      </div>
      <div>
       <div className="flex items-center gap-1.5">
       <span className="text-white font-black text-xs uppercase font-display">{rumor.handle === '@RomanoHere' ? 'Fabrizio Romano' : rumor.handle === '@SkySportsNews' ? 'Sky Sports Football' : 'Speculation Hub'}</span>
       {rumor.verified && (
        <span className="text-blue-400 text-[10px]" title="Verified Insider">✓</span>
       )}
       </div>
       <span className="text-white/40 text-[9px] font-mono block">{rumor.handle}</span>
      </div>
      </div>
      <span className="text-white/40 text-[9px] font-mono">{rumor.time}</span>
     </div>
     
     <p className="text-[#bbb] text-xs font-mono leading-relaxed mb-4">{rumor.text}</p>
     
     <div className="flex gap-4 font-mono text-[9px] text-white/40 border-t border-white/10/40 pt-2.5">
      <span>❤️ {rumor.likes}</span>
      <span>🔁 {rumor.retweets}</span>
     </div>
     </div>
    ))}
    </div>
   </div>
  ) : (
   <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
    {!state.nextMatch ? (
     <div className="text-center py-12">
      <div className="text-4xl mb-3">📋</div>
      <h3 className="text-white text-sm font-black uppercase tracking-wider font-display">No Match Scheduled</h3>
      <p className="text-white/40 text-xs mt-1 max-w-sm mx-auto leading-relaxed">Our analytical staff are currently on rest rotation. Complete weekly events or advance to schedule the next fixture.</p>
     </div>
    ) : (() => {
     const oppClub = CLUBS.find(c => c.symbol === state.nextMatch?.opponentSymbol);
     const oppName = oppClub ? oppClub.name : state.nextMatch?.opponentSymbol || 'Opponent';
     const oppOVR = oppClub ? oppClub.ovr : 75;
     
     let threatLevel = "Unknown Threat Profile";
     let tacticalDescription = "";
     let vulnerableStat = "";
     
     if (oppOVR >= 85) {
      threatLevel = "Elite Title Contender (High-Line Press)";
      tacticalDescription = "They play a highly aggressive defensive line, hunting for turnovers. They squeeze the space in midfield but leave massive channels of empty green space behind their center-backs.";
      vulnerableStat = "Pace & Dribbling";
     } else if (oppOVR >= 70) {
      threatLevel = "Championship Midblock (Compact Center)";
      tacticalDescription = "Extremely structured defensively. They protect the center of the pitch diligently with narrow full-backs, leaving cross-field routes and wide flanks highly vulnerable to direct overlaps.";
      vulnerableStat = "Passing & Vision";
     } else {
      threatLevel = "Lower Tier Underdog (Low Block)";
      tacticalDescription = "Sits in deep defensive banks. They lack composure on the ball when pressured and are prone to critical passing errors in their own half under organized direct pressing.";
      vulnerableStat = "Tackling & Positioning";
     }

     const studied = state.nextMatch?.scoutReportStudied;
     const currentStrategy = state.nextMatch?.selectedStrategy || 'BALANCED';

     const hasPerfectCounter = studied && (
      (oppOVR >= 85 && currentStrategy === 'EXPOSE_HIGH_LINE') ||
      (oppOVR >= 70 && oppOVR < 85 && currentStrategy === 'TARGET_FLANKS') ||
      (oppOVR < 70 && currentStrategy === 'HIGH_PRESS')
     );

     return (
      <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/10 pb-4 gap-4">
        <div className="flex items-center gap-4">
         <TeamLogo
          symbol={state.nextMatch.opponentSymbol}
          name={oppName}
          primaryColor={oppClub?.primaryColor || '#999'}
          secondaryColor={oppClub?.secondaryColor || '#fff'}
          size={48}
          className="flex-shrink-0"
         />
         <div>
          <h3 className="text-white text-md font-black uppercase tracking-wider font-display">VS {oppName}</h3>
          <p className="text-[#00FF88] text-[10px] font-mono font-bold uppercase tracking-widest">{threatLevel}</p>
         </div>
        </div>
        <div className="flex items-center gap-2">
         <span className="text-white/40 text-xs font-mono">Opponent Rating:</span>
         <span className="text-white bg-[#0e0e0e] border border-[#2a2a2a] px-3 py-1 font-mono font-bold rounded text-xs">{oppOVR} OVR</span>
        </div>
       </div>

       {!studied ? (
        <div className="bg-[#0e0e0e] border border-white/5 rounded-xl p-6 text-center space-y-4">
         <div className="w-12 h-12 rounded-full bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88] text-xl mx-auto border border-[#00FF88]/20">
          🔒
         </div>
         <div>
          <h4 className="text-white text-sm font-black uppercase tracking-wider font-display">Tactical Intel Locked</h4>
          <p className="text-white/50 text-xs max-w-md mx-auto mt-1 leading-relaxed">
           Our performance analysis department has compiled a full video packet on {oppName}'s structural weaknesses. Studying this will unlock game-defining tactical counter-strategies.
          </p>
         </div>
         <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
          Cost: <span className="text-[#00FF88] font-bold">5 Match Sharpness</span> (Review hours)
         </div>
         <button
          onClick={() => {
           const newSharpness = Math.max(0, player.sharpness - 5);
           setPlayer({
            ...player,
            sharpness: newSharpness
           });
           updateNextMatch({ scoutReportStudied: true, selectedStrategy: 'BALANCED' });
          }}
          className="bg-[#00FF88] hover:bg-[#00FF88]/95 text-black font-mono font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-all"
         >
          Deduct 5 Sharpness & Study Report
         </button>
        </div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
         <div className="md:col-span-2 space-y-4">
          <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-3">
           <h4 className="text-[#00FF88] text-xs font-black uppercase tracking-widest font-mono">Tactical Assessment Feed</h4>
           <p className="text-[#ccc] text-xs leading-relaxed font-mono">{tacticalDescription}</p>
           <div className="bg-[#00FF88]/5 border border-[#00FF88]/10 p-3 rounded-lg text-[11px] flex justify-between items-center font-mono">
            <span className="text-white/60">Identified Vulnerability:</span>
            <strong className="text-[#00FF88] uppercase">{vulnerableStat}</strong>
           </div>
          </div>

          <div className="space-y-3">
           <h4 className="text-white text-xs font-black uppercase tracking-widest font-display">Deploy Counter Directive</h4>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
             onClick={() => updateNextMatch({ selectedStrategy: 'BALANCED' })}
             className={`p-4 border rounded-xl text-left transition-all flex flex-col justify-between h-28 font-mono ${
              currentStrategy === 'BALANCED'
               ? 'border-[#00FF88] bg-[#00FF88]/5'
               : 'border-white/5 bg-[#0e0e0e] hover:border-white/20'
             }`}
            >
             <div>
              <div className="text-white text-xs font-bold uppercase">🛡️ Balanced Stance</div>
              <p className="text-white/40 text-[9px] mt-1 leading-normal">Standard instructions. Maintain natural shape without risk.</p>
             </div>
             <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Default Stance</span>
            </button>

            <button
             onClick={() => updateNextMatch({ selectedStrategy: 'EXPOSE_HIGH_LINE' })}
             className={`p-4 border rounded-xl text-left transition-all flex flex-col justify-between h-28 font-mono ${
              currentStrategy === 'EXPOSE_HIGH_LINE'
               ? 'border-[#00FF88] bg-[#00FF88]/5'
               : 'border-white/5 bg-[#0e0e0e] hover:border-white/20'
             }`}
            >
             <div>
              <div className="text-white text-xs font-bold uppercase">⚡ Expose High Line</div>
              <p className="text-white/40 text-[9px] mt-1 leading-normal">Run in behind the defensive line on quick breaks.</p>
             </div>
             <span className={`text-[9px] uppercase font-bold tracking-widest ${oppOVR >= 85 ? 'text-emerald-400' : 'text-white/40'}`}>
              {oppOVR >= 85 ? '⭐ Elite Matchup' : 'Sub-Optimal'}
             </span>
            </button>

            <button
             onClick={() => updateNextMatch({ selectedStrategy: 'TARGET_FLANKS' })}
             className={`p-4 border rounded-xl text-left transition-all flex flex-col justify-between h-28 font-mono ${
              currentStrategy === 'TARGET_FLANKS'
               ? 'border-[#00FF88] bg-[#00FF88]/5'
               : 'border-white/5 bg-[#0e0e0e] hover:border-white/20'
             }`}
            >
             <div>
              <div className="text-white text-xs font-bold uppercase">📐 Target Flanks</div>
              <p className="text-white/40 text-[9px] mt-1 leading-normal">Spread opponents and cross from wide positions.</p>
             </div>
             <span className={`text-[9px] uppercase font-bold tracking-widest ${oppOVR >= 70 && oppOVR < 85 ? 'text-emerald-400' : 'text-white/40'}`}>
              {oppOVR >= 70 && oppOVR < 85 ? '⭐ Elite Matchup' : 'Sub-Optimal'}
             </span>
            </button>

            <button
             onClick={() => updateNextMatch({ selectedStrategy: 'HIGH_PRESS' })}
             className={`p-4 border rounded-xl text-left transition-all flex flex-col justify-between h-28 font-mono ${
              currentStrategy === 'HIGH_PRESS'
               ? 'border-[#00FF88] bg-[#00FF88]/5'
               : 'border-white/5 bg-[#0e0e0e] hover:border-white/20'
             }`}
            >
             <div>
              <div className="text-white text-xs font-bold uppercase">⚔️ High Pressing</div>
              <p className="text-white/40 text-[9px] mt-1 leading-normal">Directly choke ball possession. (+10 Match Fatigue penalty).</p>
             </div>
             <span className={`text-[9px] uppercase font-bold tracking-widest ${oppOVR < 70 ? 'text-emerald-400' : 'text-white/40'}`}>
              {oppOVR < 70 ? '⭐ Elite Matchup' : 'Sub-Optimal'}
             </span>
            </button>
           </div>
          </div>
         </div>

         <div className="space-y-4 w-full">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 space-y-4 font-mono">
           <h4 className="text-white text-xs font-bold uppercase tracking-wider">Tactical Evaluation</h4>
           
           <div className="space-y-2 text-xs">
            <div className="flex justify-between pb-1.5 border-b border-white/5">
             <span className="text-white/50">Active Focus:</span>
             <span className="text-white font-bold uppercase">{currentStrategy.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-white/5">
             <span className="text-white/50">Vulnerability Lock:</span>
             <span className="text-[#00FF88] font-bold uppercase">{vulnerableStat.split(' ')[0]}</span>
            </div>
            <div className="flex justify-between pb-1.5">
             <span className="text-white/50">Matchup Synergy:</span>
             <span className={`font-bold ${currentStrategy === 'BALANCED' ? 'text-white/60' : hasPerfectCounter ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}`}>
              {currentStrategy === 'BALANCED' ? 'BALANCED' : hasPerfectCounter ? '🔥 PERFECT COUNTER (+12%)' : '⚠ SUB-OPTIMAL (+2%)'}
             </span>
            </div>
           </div>

           <div className="bg-[#0e0e0e] p-3 rounded text-[10px] text-white/50 leading-relaxed border border-white/5">
            {currentStrategy === 'BALANCED' ? (
             <span>Balanced tactical approach.</span>
            ) : hasPerfectCounter ? (
             <span className="text-emerald-400">Tactical Advantage Active (+12%)</span>
            ) : (
             <span className="text-amber-400">Sub-optimal tactical alignment (+2%)</span>
            )}
           </div>
          </div>
         </div>
        </div>
       )}
      </div>
     );
    })()}
   </div>
  )}
  </div>

  {activeFeedTab === 'WORLD_NEWS' && (
    <div className="mt-4">
      <RealWorldNewsWidget />
    </div>
  )}

  {/* Custom Player Avatar Generator Modal */}
  <AvatarGeneratorModal
    isOpen={isAvatarModalOpen}
    onClose={() => setIsAvatarModalOpen(false)}
  />
 </div>
 );
}

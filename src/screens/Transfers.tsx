import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { Globe, ShieldAlert, Sparkles, Send, ArrowLeftRight, Check, X, Handshake, Users, DollarSign, Calendar, Flame, AlertCircle, Search, Lightbulb } from 'lucide-react';
import { TeamLogo } from '../components/TeamLogo';
import { CLUBS } from '../data/teams';
import { getPhilosophyFitText } from '../utils/managerPhilosophy';
import { negotiateTransfer, getClubInterestScore, getGatingStatus, getClubTier, generateDeadlineDayOffers, simulateDeadlineDayTicking } from '../utils/transfers';
import { TransferOffer } from '../types';
import { GlossaryTooltip } from '../components/GlossaryTooltip';
import { SuggestSigningModal } from '../components/SuggestSigningModal';
import { MedicalCheckModal } from '../components/MedicalCheckModal';

export function Transfers() {
 const { state, setPlayer, setInbox } = useGame();
 const player = state.player;

 const [activeTab, setActiveTab] = useState<'OFFERS' | 'INTEREST' | 'WORLD_ACTIVITY'>('OFFERS');
 const [negotiatingOffer, setNegotiatingOffer] = useState<string | null>(null);
 const [pendingMedicalOffer, setPendingMedicalOffer] = useState<string | null>(null);
 const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
 const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);
 
 // Custom inquiry states
 const [inquiryClub, setInquiryClub] = useState<string | null>(null);
 const [inquiryType, setInquiryType] = useState<'TRANSFER' | 'LOAN' | null>(null);
 const [inquiryStatus, setInquiryStatus] = useState<'IDLE' | 'NEGOTIATING' | 'SUCCESS' | 'REJECTED'>('IDLE');
 const [inquiryMsg, setInquiryMsg] = useState<string>('');
 const [searchQuery, setSearchQuery] = useState<string>('');

 // --- SYSTEM 5: TRANSFER DEADLINE DAY PACING ---
 const isDeadlineDay = (state.currentWeek === 4 || state.currentWeek === 28) && state.currentDay === 'SUN';
 const [deadlineHours, setDeadlineHours] = useState(12);
 const [deadlineLogs, setDeadlineLogs] = useState<string[]>([
  "⏰ 08:00 AM - Transfer Deadline Day is officially active! You have 12 hours left to secure a move."
 ]);
 const [deadlineInitialized, setDeadlineInitialized] = useState(false);

 React.useEffect(() => {
  if (isDeadlineDay && !deadlineInitialized && player) {
   const currentOffers = [...(player.transferOffers || [])];
   if (currentOffers.length === 0) {
    const panicBids = generateDeadlineDayOffers(player);
    setPlayer({
     ...player,
     transferOffers: panicBids
    });
    setDeadlineLogs(prev => [
     ...prev,
     `🚨 INITIAL SUITORS! Suitors are circling. ${panicBids.map(b => CLUBS.find(c => c.symbol === b.clubSymbol)?.name || b.clubSymbol).join(' and ')} have logged eleventh-hour interest.`
    ]);
   }
   setDeadlineInitialized(true);
  }
 }, [isDeadlineDay, deadlineInitialized, player, setPlayer]);

 if (!player) return null;

 const tickDeadlineHour = () => {
  if (deadlineHours <= 1) {
   setDeadlineHours(0);
   setDeadlineLogs(prev => [
    "🚨 11:00 PM - The transfer window has slammed shut! Sporting directors pack up and all pending offers have officially expired.",
    ...prev
   ]);
   setPlayer({
    ...player,
    transferOffers: []
   });
   return;
  }

  const nextHour = deadlineHours - 1;
  setDeadlineHours(nextHour);

  const tickResult = simulateDeadlineDayTicking(player, nextHour);
  
  let updatedOffers = [...(player.transferOffers || [])];
  let logMsg = `⏳ ${23 - nextHour}:00 - ${tickResult.text}`;

  if (tickResult.mode === 'NEW_OFFER' && tickResult.offer) {
   updatedOffers.push(tickResult.offer);
  } else if (tickResult.mode === 'IMPROVEMENT') {
   if (updatedOffers.length > 0) {
    const randIdx = Math.floor(Math.random() * updatedOffers.length);
    const target = updatedOffers[randIdx];
    updatedOffers[randIdx] = {
     ...target,
     wage: Math.round(target.wage * 1.15),
     bonus: Math.round(target.bonus * 1.2)
    };
    const cName = CLUBS.find(c => c.symbol === target.clubSymbol)?.name || target.clubSymbol;
    logMsg = `📈 ${23 - nextHour}:00 - Desperate for terms, ${cName} have increased their offer to £${updatedOffers[randIdx].wage.toLocaleString()} p/w!`;
   } else {
    logMsg = `⏳ ${23 - nextHour}:00 - Agents report high tension, but suitor lists are currently empty.`;
   }
  } else if (tickResult.mode === 'WITHDRAW') {
   if (updatedOffers.length > 0) {
    const removed = updatedOffers.shift();
    const cName = CLUBS.find(c => c.symbol === removed?.clubSymbol)?.name || 'A suitor';
    logMsg = `⚠️ ${23 - nextHour}:00 - ${cName} got cold feet or signed another target. They have officially WITHDRAWN their bid!`;
   } else {
    logMsg = `⏳ ${23 - nextHour}:00 - Silence in the press room as rumors cool down.`;
   }
  }

  setPlayer({
   ...player,
   transferOffers: updatedOffers
  });

  setDeadlineLogs(prev => [logMsg, ...prev]);
 };

 const handleNegotiateDeadlineOffer = (offerId: string, action: 'WAGE' | 'BONUS' | 'CLAUSE' | 'SHORTER') => {
  if (deadlineHours <= 0) return;
  
  const nextHour = deadlineHours - 1;
  setDeadlineHours(nextHour);

  const offer = player.transferOffers.find(o => o.id === offerId);
  if (!offer) return;

  const agentRel = player.relationships.agent || 50;
  const walkAwayChance = agentRel >= 75 ? 0.15 : 0.35;

  if (Math.random() < walkAwayChance) {
   const cName = CLUBS.find(c => c.symbol === offer.clubSymbol)?.name || offer.clubSymbol;
   setPlayer({
    ...player,
    transferOffers: player.transferOffers.filter(o => o.id !== offerId)
   });
   setDeadlineLogs(prev => [
    `❌ WALK AWAY! Sporting directors at ${cName} got fed up with late negotiation demands and pulled their offer off the table instantly!`,
    ...prev
   ]);
   return;
  }

  let wageIncrease = 0;
  let bonusIncrease = 0;
  let desc = '';

  if (action === 'WAGE') {
   wageIncrease = Math.round(offer.wage * 0.1);
   desc = `Negotiated wage up by 10% to £${(offer.wage + wageIncrease).toLocaleString()}/wk.`;
  } else if (action === 'BONUS') {
   bonusIncrease = Math.round(offer.bonus * 0.15);
   desc = `Negotiated signing bonus up by 15% to £${(offer.bonus + bonusIncrease).toLocaleString()}.`;
  } else if (action === 'CLAUSE') {
   wageIncrease = Math.round(offer.wage * 0.05);
   desc = `Added Goal Bonus clauses (+5% wage).`;
  } else {
   desc = `Shortened contract length.`;
  }

  const updatedOffers = player.transferOffers.map(o => {
   if (o.id === offerId) {
    return {
     ...o,
     wage: o.wage + wageIncrease,
     bonus: o.bonus + bonusIncrease
    };
   }
   return o;
  });

  setPlayer({
   ...player,
   transferOffers: updatedOffers
  });

  const cName = CLUBS.find(c => c.symbol === offer.clubSymbol)?.name || offer.clubSymbol;
  setDeadlineLogs(prev => [
   `🤝 SUCCESS! Under severe pressure, ${cName} accepted your terms! ${desc}`,
   ...prev
  ]);
 };

 if (isDeadlineDay && deadlineHours >= 0) {
  return (
   <div className="flex flex-col h-full gap-6 select-none font-mono text-xs text-[#cccccc]">
    {/* Banner */}
    <div className="bg-yellow-500 text-black px-6 py-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-yellow-400 font-sans shadow-lg animate-pulse">
     <div>
      <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
       <Flame className="text-red-600 fill-red-600 w-8 h-8 animate-bounce" />
       IN EXTREMIS: TRANSFER DEADLINE DAY
      </h1>
      <p className="text-black/80 text-xs font-mono font-bold mt-1">
       Desperate clubs are bidding late. Clock is ticking. Make your legacy.
      </p>
     </div>
     <div className="bg-black text-yellow-400 px-5 py-3 rounded-lg border border-yellow-500 font-mono font-bold text-center">
      <div className="text-[10px] text-white/50 uppercase tracking-widest">Time Remaining</div>
      <div className="text-2xl font-black">{deadlineHours} HOURS</div>
     </div>
    </div>

    {/* Outer Split Layout */}
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
     {/* Left Panel: Gossip & Ticker Log (col-span-5) */}
     <div className="lg:col-span-5 flex flex-col gap-4 premium-card p-5 rounded-xl border border-yellow-500/20">
      <h3 className="text-yellow-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
       <Calendar size={14} className="text-yellow-400" />
       Live Deadline Feed
      </h3>
      
      {/* Hour progression button */}
      {deadlineHours > 0 ? (
       <button
        onClick={tickDeadlineHour}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase rounded-lg shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer font-sans"
       >
        <Flame size={14} className="animate-pulse" />
        Wait & See (Progress 1 Hour)
       </button>
      ) : (
       <div className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold uppercase text-center rounded-lg font-sans">
        The Window is Closed
       </div>
      )}

      {/* Scrollable feed logs */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
       {deadlineLogs.map((log, lIdx) => {
        const isLateOffer = log.includes("LATE");
        const isImprovement = log.includes("IMPROVED");
        const isWithdraw = log.includes("WITHDRAW") || log.includes("WALK");
        return (
         <div
          key={lIdx}
          className={`p-3 rounded-lg border text-xs leading-relaxed transition-all ${
           isLateOffer
            ? 'bg-emerald-950/20 border-emerald-900 text-emerald-300'
            : isImprovement
            ? 'bg-blue-950/20 border-blue-900 text-blue-300'
            : isWithdraw
            ? 'bg-red-950/20 border-red-900 text-red-400'
            : 'bg-zinc-950/40 border-zinc-900 text-[#cccccc]'
          }`}
         >
          {log}
         </div>
        );
       })}
      </div>
     </div>

     {/* Right Panel: Active Offers (col-span-7) */}
     <div className="lg:col-span-7 flex flex-col gap-4">
      <div className="premium-card p-5 rounded-xl border border-white/10 flex-1 flex flex-col gap-4 overflow-y-auto">
       <h3 className="text-white text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2 justify-between">
        <span className="flex items-center gap-2">
         <Handshake size={14} className="text-[#00FF88]" />
         Active Panic Bids ({player.transferOffers?.length || 0})
        </span>
        <span className="text-white/40 text-[10px] font-mono">
         All pending bids expire at 11:00 PM
        </span>
       </h3>

       {(!player.transferOffers || player.transferOffers.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-white/40 p-8">
         <AlertCircle size={32} />
         <p className="font-bold">No Active Bids On the Table</p>
         <p className="text-xs max-w-sm">
          {deadlineHours > 0 
           ? "Advance the hour to wait for late-night panic bids from desperate clubs."
           : "The deadline is past. You must remain at your current club for the remainder of the campaign."
          }
         </p>
        </div>
       ) : (
        <div className="space-y-4">
         {player.transferOffers.map(offer => {
          const club = CLUBS.find(c => c.symbol === offer.clubSymbol);
          if (!club) return null;
          const tier = getClubTier(club);
          const isNegotiating = negotiatingOffer === offer.id;

          return (
           <div key={offer.id} className="bg-zinc-950/60 border border-white/10 hover:border-[#00FF88]/30 rounded-xl p-5 transition-all duration-150">
            <div className="flex justify-between items-start gap-4 mb-4">
             <div className="flex items-center gap-3">
              <TeamLogo symbol={offer.clubSymbol} size={36} />
               <div>
                <h4 className="text-white font-bold text-sm tracking-wider">{club.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-white/50">
                 <span>{club.league}</span>
                 <span>•</span>
                 <span className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">{tier}</span>
                 {offer.isHomecoming && <span className="bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded font-bold ml-1">🏠 HOMECOMING</span>}
                </div>
               </div>
             </div>
             <div className="text-right">
              <div className="text-[#00FF88] text-base font-black">
               £{offer.wage.toLocaleString()}
               <span className="text-white/40 text-[10px] font-bold ml-1">p/w</span>
              </div>
              <div className="text-white/50 text-[10px] font-bold mt-1">
               Bonus: £{offer.bonus.toLocaleString()}
              </div>
             </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 bg-white/5 p-3 rounded-lg mb-4 text-white/60">
             <div>
              <span className="text-white/40 block text-[9px] uppercase tracking-widest font-bold mb-0.5">Contract Length</span>
              <span className="text-white font-bold text-xs">{offer.length} Years</span>
             </div>
             <div>
              <span className="text-white/40 block text-[9px] uppercase tracking-widest font-bold mb-0.5">Squad Role</span>
              <span className="text-white font-bold text-xs">Crucial First Teamer</span>
             </div>
            </div>

            {/* Suitor Actions */}
            {deadlineHours > 0 && !isNegotiating && (
             <div className="grid grid-cols-3 gap-2 font-sans">
              <button
               onClick={() => {
                setPlayer({
                 ...player,
                 currentClubSymbol: offer.clubSymbol,
                 transferOffers: [],
                 contract: {
                  ...player.contract,
                  wage: offer.wage,
                  expires: `June 20${27 + offer.length}`,
                  status: 'Key Player'
                 }
                });
                setInbox([
                 {
                  id: `deadline_deal_${Date.now()}`,
                  sender: 'CLUB CHAIRMAN',
                  subject: 'WELCOME TO THE CLUB!',
                  content: `We have finalized your transfer papers in the nick of time! Welcome to ${club.name}. Let's make history together.`,
                  read: false,
                  type: 'DM',
                  timestamp: 'MON 08:00',
                  choices: []
                 },
                 ...state.inbox
                ]);
               }}
               className="py-2.5 bg-[#00FF88] hover:bg-[#00e577] text-black font-black uppercase rounded-lg text-[10px] tracking-wider transition-all cursor-pointer text-center"
              >
               Sign Deal
              </button>
              <button
               onClick={() => setNegotiatingOffer(offer.id)}
               className="py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 font-black uppercase rounded-lg text-[10px] tracking-wider transition-all cursor-pointer text-center"
              >
               Push Terms
              </button>
              <button
               onClick={() => handleRejectOffer(offer.id)}
               className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-black uppercase rounded-lg text-[10px] tracking-wider transition-all cursor-pointer text-center"
              >
               Reject Bid
              </button>
             </div>
            )}

            {/* Negotiation Options (Takes 1 hour, Walkaway Risk) */}
            {deadlineHours > 0 && isNegotiating && (
             <div className="bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-lg space-y-3">
              <p className="text-yellow-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
               <AlertCircle size={10} />
               Risk Window: Push demands (takes 1 hour. suitor might walk away)
              </p>
              <div className="grid grid-cols-2 gap-2 font-sans">
               <button
                onClick={() => {
                 handleNegotiateDeadlineOffer(offer.id, 'WAGE');
                 setNegotiatingOffer(null);
                }}
                className="py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded text-[10px] transition-all cursor-pointer"
               >
                Ask +10% Wage
               </button>
               <button
                onClick={() => {
                 handleNegotiateDeadlineOffer(offer.id, 'BONUS');
                 setNegotiatingOffer(null);
                }}
                className="py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded text-[10px] transition-all cursor-pointer"
               >
                Ask +15% Bonus
               </button>
              </div>
              <button
               onClick={() => setNegotiatingOffer(null)}
               className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white/60 font-bold rounded text-[9px] transition-all cursor-pointer text-center font-sans"
              >
               Back
              </button>
             </div>
            )}
           </div>
          );
         })}
        </div>
       )}
      </div>

      {/* Exit Window Button */}
      <button
       onClick={() => {
        setPlayer({
         ...player,
         transferOffers: []
        });
        setDeadlineHours(0);
       }}
       className="py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white/70 hover:text-white font-bold uppercase rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 font-sans font-bold"
      >
       Close Window & Finalize Papers
      </button>
     </div>
    </div>
   </div>
  );
 }

 if (!player) return null;

 const isTransferWindow = state.currentWeek <= 9 || (state.currentWeek >= 27 && state.currentWeek <= 30);

 
 const finalizeTransfer = (offer: TransferOffer) => {
   const club = CLUBS.find(c => c.symbol === offer.clubSymbol);
   
   let newFans = player.fans;
   let newTimeline = [...(player.timeline || [])];
   
   if (offer.isHomecoming) {
      newFans += 25;
      newTimeline.push({
        id: `transfer_homecoming_${Date.now()}`,
        week: state.currentWeek,
        day: state.currentDay,
        type: 'MILESTONE',
        title: `🏆 CAREER MILESTONE: The Homecoming`,
        description: `Returned to ${club?.name}, the club where it all began. The fans are ecstatic to have you back! (+25 Fan Adoration)`,
        clubSymbol: offer.clubSymbol
      });
   }
   
   newTimeline.push({
     id: `transfer_${Date.now()}`,
     week: state.currentWeek,
     day: state.currentDay,
     type: 'TRANSFER',
     title: `Transferred to ${club?.name}`,
     description: `Signed a ${offer.length}-year deal worth £${offer.wage.toLocaleString()}/week.`,
     clubSymbol: offer.clubSymbol
   });

   setPlayer({ 
    ...player, 
    currentClubSymbol: offer.clubSymbol,
    transferOffers: [],
    contract: {
    ...player.contract,
    wage: offer.wage,
    expires: `June 20${27 + offer.length}`,
    yearsLeft: offer.length,
    status: 'Squad Player',
    releaseClause: offer.releaseClause,
    goalBonus: offer.contractBonus?.type === 'GOAL' ? offer.contractBonus.amount : player.contract.goalBonus,
    appearanceBonus: offer.contractBonus?.type === 'APPEARANCE' ? offer.contractBonus.amount : player.contract.appearanceBonus,
    },
    transferListed: false,
    fans: newFans,
    transferRequestStatus: 'NONE',
    timeline: newTimeline
   });
   setNegotiatingOffer(null);
   setPendingMedicalOffer(null);
   setIsMedicalModalOpen(false);
 };

 const handleMedicalComplete = (success: boolean, newOffer?: TransferOffer) => {
   if (success && !newOffer) {
     // Successful medical, finalize the pending offer
     const offer = player.transferOffers.find(o => o.id === pendingMedicalOffer);
     if (offer) {
       finalizeTransfer(offer);
     } else {
       setIsMedicalModalOpen(false);
     }
   } else if (newOffer) {
     // Failed but revised offer returned
     setPlayer({
       ...player,
       transferOffers: player.transferOffers.map(o => o.id === pendingMedicalOffer ? newOffer : o)
     });
     setIsMedicalModalOpen(false);
     setPendingMedicalOffer(null);
   } else {
     // Completely failed, offer withdrawn
     setPlayer({ ...player, transferOffers: player.transferOffers.filter(o => o.id !== pendingMedicalOffer) });
     setInbox([
      ...state.inbox, 
      {
      id: `medical_failed_${Date.now()}`,
      sender: 'AGENT',
      subject: 'Transfer Collapsed',
      content: `The transfer has fallen through after you failed the medical. The club has withdrawn their offer.`,
      read: false,
      type: 'NEWS',
      timestamp: 'MON 14:00',
      choices: []
      }
     ]);
     setIsMedicalModalOpen(false);
     setPendingMedicalOffer(null);
   }
 };

 const handleRejectOffer = (id: string) => {
 setPlayer({ ...player, transferOffers: player.transferOffers.filter(o => o.id !== id) });
 if (negotiatingOffer === id) setNegotiatingOffer(null);
 };

 const handleNegotiateOption = (id: string, action: 'WAGE' | 'BONUS' | 'CLAUSE' | 'SHORTER' | 'ACCEPT') => {
 const offer = player.transferOffers.find(o => o.id === id);
 if (!offer) return;
 
  if (action === 'ACCEPT') {
    setPendingMedicalOffer(offer.id);
    setIsMedicalModalOpen(true);
    return;
  }

 const result = negotiateTransfer(offer, player, action);
 
 if (result.success && result.newOffer) {
  setPlayer({
   ...player,
   transferOffers: player.transferOffers.map(o => o.id === id ? result.newOffer! : o)
  });
 } else {
  // Club withdrew offer
  setPlayer({ ...player, transferOffers: player.transferOffers.filter(o => o.id !== id) });
  setInbox([
   ...state.inbox, 
   {
   id: `transfer_withdrawn_${Date.now()}`,
   sender: 'AGENT',
   subject: 'Offer Withdrawn',
   content: `The club walked away from negotiations. They felt our demands were too high.`,
   read: false,
   type: 'NEWS',
   timestamp: 'MON 14:00',
   choices: []
   }
  ]);
  setNegotiatingOffer(null);
 }
 };

 const handleTransferRequest = () => {
  const yearsLeft = player.contract?.yearsLeft || 0;
  const isKeyPlayer = player.contract?.status === 'Star Player' || player.contract?.status === 'Key Player' || player.contract?.status === 'Club Legend';
  
  const shouldRefuse = (yearsLeft >= 3 && Math.random() < 0.7) || (isKeyPlayer && Math.random() < 0.5);
  
  if (shouldRefuse) {
   const updatedOpenThreads = {
    ...(player.stateFlags?.openThreads || {}),
    contractDispute: true
   };
   
   setPlayer({ 
    ...player, 
    transferRequestStatus: 'REJECTED',
    trust: Math.max(0, player.trust - 20),
    fans: Math.max(0, player.fans - 15),
    stateFlags: {
     ...(player.stateFlags || {}),
     openThreads: updatedOpenThreads
    }
   });
   
   setInbox([
    ...state.inbox, 
    {
     id: `transfer_refused_${Date.now()}`,
     sender: 'SPORTING DIRECTOR',
     subject: 'Transfer Request REJECTED',
     content: `We have received your formal transfer request. However, the board has flatly rejected it. You are under a contract with ${yearsLeft} years remaining, and you are a critical asset to this club. We expect you to remain fully professional and honor your commitment.`,
     read: false,
     type: 'DM',
     timestamp: 'MON 14:00',
     choices: [{ text: "This isn't over.", type: 'ack' }]
    }
   ]);
  } else {
   setPlayer({ 
    ...player, 
    transferListed: true, 
    transferRequestStatus: 'ACCEPTED',
    trust: Math.max(0, player.trust - 15),
    fans: Math.max(0, player.fans - 20)
   });
   setInbox([
    ...state.inbox, 
    {
    id: `transfer_req_${Date.now()}`,
    sender: 'AGENT',
    subject: 'Transfer Request Submitted',
    content: `I've handed in the official request to the board. The manager isn't happy, and the fans will see it as a betrayal, but we needed to force their hand. I'll let you know as soon as offers come in.`,
    read: false,
    type: 'DM',
    timestamp: 'MON 14:00',
    choices: [{ text: 'Keep me updated.', type: 'ack' }]
    }
   ]);
  }
 };

 // Dynamic Interest Level Formula
 const getClubInterest = (club: typeof CLUBS[0]) => {
 return getClubInterestScore(player, club);
 };

 const getInterestBadge = (score: number, gateStatus: string | null) => {
 if (gateStatus) {
  if (gateStatus === 'AGENT_LOCK') return { label: 'REPRESENTATION LOCK', bg: 'bg-red-950/40 text-red-400 border border-red-900/50' };
  if (gateStatus === 'TIER_GAP') return { label: 'TIER GATED (MAX 2)', bg: 'bg-zinc-900 text-zinc-500 border border-zinc-800' };
  if (gateStatus === 'OVR_GAP') return { label: 'OVR GATE LOCKED', bg: 'bg-amber-950/20 text-amber-500 border border-amber-900/40' };
  if (gateStatus === 'REP_GAP') return { label: 'REPUTATION GATE LOCKED', bg: 'bg-purple-950/20 text-purple-400 border border-purple-900/30' };
  return { label: 'GATED', bg: 'bg-zinc-800 text-zinc-500' };
 }
 if (score >= 90) return { label: 'READY TO BID (OFFER UNLOCKED)', bg: 'bg-rose-500 text-white font-bold border border-rose-600 animate-pulse' };
 if (score >= 60) return { label: 'HIGH INTEREST', bg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' };
 if (score >= 30) return { label: 'MODERATE INTEREST', bg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
 return { label: 'LOW INTEREST', bg: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' };
 };

 const handleInquirySubmit = (club: typeof CLUBS[0], type: 'TRANSFER' | 'LOAN') => {
 if (!isTransferWindow) return;
 
 setInquiryClub(club.name);
 setInquiryType(type);
 setInquiryStatus('NEGOTIATING');
 setInquiryMsg('Your agent is initiating contact with the board...');

 setTimeout(() => {
  const interest = getClubInterest(club);
  let agentSkillBonus = 0;
  if (player.agentTier === 'Hungry') agentSkillBonus = 10;
  if (player.agentTier === 'Shark') agentSkillBonus = 20;
  if (player.agentTier === 'Super Agent') agentSkillBonus = 35;
  if (player.agentTier === 'Legend') agentSkillBonus = 50;

  // Base success calculation
  let successChance = interest + agentSkillBonus;
  if (type === 'TRANSFER' && player.transferListed) successChance += 15;
  if (type === 'LOAN') {
  if (player.contract.status === 'Backup' || player.contract.status === 'Rotation') successChance += 20;
  if (player.age < 21) successChance += 20;
  }

  const roll = Math.random() * 120;
  const success = roll < successChance;

  if (success) {
  // Generate customized Transfer Offer
  const baseWage = club.tier === 'Elite' ? 80000 : club.tier === 'Strong' ? 40000 : club.tier === 'Mid' ? 15000 : 5000;
  const multiplier = player.ovr / 50;
  const isLoan = type === 'LOAN';
  
  let wage = Math.round(baseWage * multiplier * (Math.random() * 0.2 + 0.9));
  if (isLoan) {
   wage = Math.round(player.contract.wage * (Math.random() * 0.3 + 0.7)); // loan wage resembles current wage
  }
  
  const bonus = Math.round(wage * (isLoan ? 10 : 35));
  const length = isLoan ? 1 : Math.floor(Math.random() * 3) + 2;

  const newOffer: TransferOffer = {
   id: `offer_${club.symbol}_${Date.now()}`,
   clubSymbol: club.symbol,
   wage,
   bonus,
   length,
   status: 'PENDING'
  };

  setPlayer({
   ...player,
   transferOffers: [...(player.transferOffers || []), newOffer]
  });

  setInbox([
   ...state.inbox,
   {
   id: `inquiry_success_${Date.now()}`,
   sender: 'AGENT',
   subject: `Inquiry Successful with ${club.name}`,
   content: `Following our aggressive inquiry, ${club.name} has formally responded with a ${isLoan ? '1-year loan proposal' : `${length}-year contract offer`}. I've routed the full breakdown to your Transfers tab. Let's make a deal!`,
   read: false,
   type: 'DM',
   timestamp: 'MON 14:30',
   choices: []
   }
  ]);

  setInquiryStatus('SUCCESS');
  setInquiryMsg(`Fantastic news! ${club.name} accepted our presentation and made an official offer: £${wage.toLocaleString()}/week wage.`);
  } else {
  setInquiryStatus('REJECTED');
  if (type === 'LOAN') {
   setInquiryMsg(`${club.name} declined our loan request. They indicated they aren't currently seeking a short-term reinforcement in your position.`);
  } else {
   setInquiryMsg(`${club.name} refused to make an offer. Their sporting director informed us that your salary expectations exceed their active wage structure.`);
  }
  }
 }, 1500);
 };

 const filteredClubs = CLUBS.filter(c => 
 c.symbol !== player.currentClubSymbol && 
 (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
  c.league.toLowerCase().includes(searchQuery.toLowerCase()) ||
  c.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
 );

 return (
 <div className="flex flex-col h-full gap-6 select-none font-mono text-xs text-[#cccccc]">
  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 shrink-0">
  <div>
   <h1 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-3">
   <ArrowLeftRight className="text-[#00FF88] w-7 h-7" />
   Transfers & Contracts
   </h1>
   <p className="text-white/50 text-xs font-mono mt-1">Pitch transfer inquiries, negotiate contract terms, and review active market interest.</p>
  </div>

  {/* Transfer Window Banner & DoF Action */}
  <div className="flex items-center gap-3">
   <button
    onClick={() => setIsSuggestModalOpen(true)}
    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer"
   >
    <Lightbulb size={14} /> Suggest Signing (DoF)
   </button>

   <div className={`px-4 py-2 rounded-lg font-bold border flex items-center gap-2 ${isTransferWindow ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/50' : 'bg-zinc-950/20 text-zinc-400 border-zinc-900'}`}>
    <Calendar size={14} />
    <span className="uppercase tracking-wider">
    Transfer Window: {isTransferWindow ? 'OPEN' : 'CLOSED'}
    </span>
   </div>
  </div>
  </div>

  {/* Tabs */}
  <div className="flex border-b border-white/10 shrink-0">
  <button 
   onClick={() => { setActiveTab('OFFERS'); setInquiryStatus('IDLE'); }}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-3 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'OFFERS' ? 'border-[#00FF88] text-white premium-card' : 'border-transparent text-white/50 hover:text-white'}`}
  >
   <Handshake size={14} />
   Offers & Contract
  </button>
  <button 
   onClick={() => { setActiveTab('INTEREST'); setInquiryStatus('IDLE'); }}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-3 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'INTEREST' ? 'border-[#00FF88] text-white premium-card' : 'border-transparent text-white/50 hover:text-white'}`}
  >
   <Globe size={14} />
   Market Interest & Inquiries
  </button>
   <button 
    onClick={() => { setActiveTab('WORLD_ACTIVITY'); setInquiryStatus('IDLE'); }}
    className={`text-xs font-bold tracking-widest uppercase px-6 py-3 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'WORLD_ACTIVITY' ? 'border-[#00FF88] text-white premium-card' : 'border-transparent text-white/50 hover:text-white'}`}
   >
    <ArrowLeftRight size={14} />
    World Transfer Feed & Rumours
   </button>
  </div>

  {/* Tab Contents */}
  {activeTab === 'OFFERS' && (
  <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-[400px]">
   {/* Left Panel: Current Contract & Financials */}
   <div className="w-full md:w-[350px] flex flex-col gap-6 shrink-0">
   {/* Contract details card */}
   <div className="premium-card p-6 rounded-xl flex flex-col justify-between">
    <div>
    <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-white/10/60 pb-2 flex items-center gap-2">
     <ShieldAlert size={12} />
     Your Current Contract
    </h3>
    <div className="space-y-4">
     <div>
     <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Weekly Wage</div>
     <div className="text-white text-2xl font-black">
      £{player.contract.wage.toLocaleString()}
      <span className="text-white/40 text-xs font-bold tracking-widest ml-1">p/w</span>
     </div>
     </div>
     <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
     <div>
      <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Expires</div>
      <div className="text-white font-bold text-xs">{player.contract.expires}</div>
     </div>
     <div>
      <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Squad Status</div>
      <div className="text-white font-bold text-xs">{(player.stateFlags?.preseasonEvaluation || player.stateFlags?.midSeasonEvaluation) ? 'Under Evaluation' : player.contract.status}</div>
     </div>
     </div>
     
     <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
     <div>
      <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">App Bonus</div>
      <div className="text-white font-bold text-xs">£{player.contract.appearanceBonus?.toLocaleString() || '0'}</div>
     </div>
     <div>
      <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Goal Bonus</div>
      <div className="text-white font-bold text-xs">£{player.contract.goalBonus?.toLocaleString() || '0'}</div>
     </div>
     </div>

     {player.contract.releaseClause && (
     <div className="pt-3 border-t border-white/10">
      <div className="text-red-400 text-[9px] font-bold uppercase tracking-widest mb-1"><GlossaryTooltip term="Release Clause Trigger">Release Clause Trigger</GlossaryTooltip></div>
      <div className="text-white font-bold text-xs">£{player.contract.releaseClause.toLocaleString()}</div>
     </div>
     )}
    </div>
    </div>

     <div className="mt-6 pt-4 border-t border-white/10/60">
     {player.currentClubSymbol === 'FA' ? (
      <div className="text-center py-3 bg-zinc-900/50 border border-zinc-800 rounded">
       <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">UNEMPLOYED - FREE AGENT</span>
       <p className="text-[10px] text-zinc-600 mt-1">Apply to interested clubs to find emergency terms.</p>
      </div>
     ) : player.stateFlags?.openThreads?.contractDispute ? (
      <div className="text-center py-3 bg-red-950/20 border border-red-900/40 rounded">
       <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest">⚠️ CONTRACT DISPUTE ACTIVE</span>
       <p className="text-[9px] text-red-500/80 mt-1 px-2">The board rejected your request. Morale, Manager Trust, and Training are heavily affected.</p>
      </div>
     ) : (
      <>
      <button 
       onClick={handleTransferRequest}
       disabled={player.transferListed || player.transferRequestStatus === 'REJECTED'}
       className="w-full py-3 glass-panel hover:bg-red-950/20 hover:border-red-500 hover:text-red-500 text-white/50 text-[10px] font-bold uppercase tracking-widest transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
       {player.transferListed ? 'Transfer Listed (Approved)' : player.transferRequestStatus === 'REJECTED' ? 'Transfer Request Rejected' : 'Submit Transfer Request'}
      </button>
      {player.transferListed && (
       <p className="text-red-400/80 text-[10px] text-center mt-2 font-semibold">Relationships with manager & fans are decreased.</p>
      )}
      </>
     )}
     </div>
   </div>

   {/* Bank Balance Card */}
   <div className="premium-card p-6 rounded-xl flex flex-col shrink-0">
    <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
    <DollarSign size={12} />
    Financial Records
    </h3>
    <div className="text-white text-3xl font-black tracking-tighter">£{(player.finances?.balance || 0).toLocaleString()}</div>
    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1 flex justify-between">
    <span>Personal Liquidity</span>
    <span className="text-emerald-500">+<GlossaryTooltip term="Agent Tier">{player.agentTier}</GlossaryTooltip> Agent Tier</span>
    </div>
   </div>
   </div>

   {/* Right Panel: Incoming Transfer Offers list */}
   <div className="flex-1 premium-card p-6 rounded-xl flex flex-col overflow-y-auto no-scrollbar">
   <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-white/10 flex items-center justify-between shrink-0">
    <span>Incoming Transfer Offers</span>
    <span className="text-white/40">{player.transferOffers?.length || 0} ACTIVE</span>
   </h3>

   {(!player.transferOffers || player.transferOffers.length === 0) ? (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
     <Handshake className="text-[#444] w-6 h-6" />
    </div>
    <div className="text-white/40 text-[11px] font-bold uppercase tracking-widest">No active contract offers</div>
    <p className="text-[#555] text-[10px] max-w-[320px] mt-1 leading-relaxed">Submit a transfer request, or navigate to the Interest tab to pitch inquiries to active clubs in the transfer window.</p>
    </div>
   ) : (
    <div className="space-y-4">
    {player.transferOffers.map(offer => {
     const club = CLUBS.find(c => c.symbol === offer.clubSymbol);
     const isNegotiating = negotiatingOffer === offer.id;
     
     return (
     <div key={offer.id} className="bg-[#0c0c0c] p-5 rounded-lg flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex items-center gap-3">
       <TeamLogo 
       symbol={club?.symbol || 'SYS'} 
       name={club?.name || ''} 
       primaryColor={club?.primaryColor || '#000'} 
       secondaryColor={club?.secondaryColor || '#fff'} 
       size={44} 
       />
        <div>
        <div className="text-white font-bold text-sm uppercase flex items-center gap-2">
         {club?.name}
         {offer.isHomecoming && <span className="bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded font-bold text-[8px] tracking-widest">🏠 HOMECOMING</span>}
        </div>
        <div className="text-white/50 text-[9px] font-mono tracking-wider mt-0.5">{club?.league} &middot; OVR {club?.ovr}</div>
       </div>
      </div>

      {/* Terms */}
      <div className="grid grid-cols-3 gap-6 bg-[#141414] px-4 py-2 rounded-lg text-center">
       <div>
       <div className="text-white/40 text-[8px] font-bold uppercase tracking-widest">Weekly Wage</div>
       <div className="text-white font-bold font-mono">£{offer.wage.toLocaleString()}</div>
       </div>
       <div>
       <div className="text-white/40 text-[8px] font-bold uppercase tracking-widest">Sign-on Bonus</div>
       <div className="text-white font-bold font-mono">£{offer.bonus.toLocaleString()}</div>
       </div>
       <div>
       <div className="text-white/40 text-[8px] font-bold uppercase tracking-widest">Contract</div>
       <div className="text-white font-bold font-mono">{offer.length} Yrs</div>
       </div>
      </div>

      {(offer.releaseClause || offer.contractBonus) && (
       <div className="flex gap-4 mt-3 premium-card p-2 rounded justify-center text-center">
       {offer.releaseClause && (
        <div className="text-amber-500 text-[9px] font-bold uppercase font-mono">
        Rel. Clause: £{(offer.releaseClause / 1000000).toFixed(1)}M
        </div>
       )}
       {offer.contractBonus && (
        <div className="text-emerald-500 text-[9px] font-bold uppercase font-mono">
        {offer.contractBonus.type === 'GOAL' ? 'Goal Bonus: ' : 'App. Bonus: '} 
        £{offer.contractBonus.amount.toLocaleString()}
        </div>
       )}
       </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
       <button 
       onClick={() => isNegotiating ? setNegotiatingOffer(null) : setNegotiatingOffer(offer.id)}
       className="px-3 py-2 glass-panel text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#252525] transition-colors rounded"
       >
       {isNegotiating ? 'Close' : 'Negotiate'}
       </button>
       <button 
       onClick={() => handleRejectOffer(offer.id)} 
       className="px-3 py-2 bg-[#2a1a1a] text-red-400 text-[9px] font-bold uppercase tracking-widest hover:bg-red-950/20 border border-red-900/30 transition-colors rounded"
       >
       Reject
       </button>
       <button 
       onClick={() => handleNegotiateOption(offer.id, 'ACCEPT')} 
       className="px-3 py-2 bg-[#00FF88] text-black text-[9px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded"
       >
       Accept
       </button>
      </div>
      </div>

      {/* Negotiate Options */}
      {isNegotiating && (
      <div className="border-t border-white/10 pt-4 mt-2">
       <div className="text-[#00FF88] text-[8px] font-bold uppercase tracking-widest mb-3">Instruct Agent to Demand:</div>
       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
       <button 
        onClick={() => handleNegotiateOption(offer.id, 'WAGE')} 
        className="premium-card hover:bg-[#181818] hover:border-[#00FF88] p-3 rounded text-center transition-all group"
       >
        <div className="text-white text-xs font-bold uppercase tracking-wider">Demand Wage</div>
        <div className="text-white/50 text-[8px] mt-1 font-mono">+5-15% Weekly Raise</div>
       </button>
       <button 
        onClick={() => handleNegotiateOption(offer.id, 'BONUS')} 
        className="premium-card hover:bg-[#181818] hover:border-[#00FF88] p-3 rounded text-center transition-all group"
       >
        <div className="text-white text-xs font-bold uppercase tracking-wider">Demand Bonus</div>
        <div className="text-white/50 text-[8px] mt-1 font-mono">+10-20% Goal Bonus</div>
       </button>
       <button 
        onClick={() => handleNegotiateOption(offer.id, 'CLAUSE')} 
        className="premium-card hover:bg-[#181818] hover:border-[#00FF88] p-3 rounded text-center transition-all group"
       >
        <div className="text-white text-xs font-bold uppercase tracking-wider">Add Release Clause</div>
        <div className="text-white/50 text-[8px] mt-1 font-mono">Set Transfer Value</div>
       </button>
       <button 
        onClick={() => handleNegotiateOption(offer.id, 'SHORTER')} 
        className="premium-card hover:bg-[#181818] hover:border-[#00FF88] p-3 rounded text-center transition-all group"
       >
        <div className="text-white text-xs font-bold uppercase tracking-wider">Shorter Deal</div>
        <div className="text-white/50 text-[8px] mt-1 font-mono">Reduce length by 1 yr</div>
       </button>
       </div>
      </div>
      )}
     </div>
     );
    })}
    </div>
   )}
   </div>
  </div>
  )}

  {activeTab === 'INTEREST' && (
  <div className="flex-1 flex flex-col gap-6">
   {/* Active Negotiation Loading overlay/status */}
   {inquiryStatus !== 'IDLE' && (
   <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all animate-fade-in ${
    inquiryStatus === 'NEGOTIATING' ? 'premium-card border-[#00FF88] text-[#00FF88]' :
    inquiryStatus === 'SUCCESS' ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' :
    'bg-[#221111]/30 border-red-900/40 text-red-400'
   }`}>
    <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-[#1c1c1c] flex items-center justify-center shrink-0">
     {inquiryStatus === 'NEGOTIATING' && <Flame className="w-5 h-5 text-[#00FF88] animate-pulse" />}
     {inquiryStatus === 'SUCCESS' && <Check className="w-5 h-5 text-emerald-500" />}
     {inquiryStatus === 'REJECTED' && <X className="w-5 h-5 text-red-500" />}
    </div>
    <div>
     <h4 className="text-white font-bold uppercase text-xs">
     {inquiryStatus === 'NEGOTIATING' && `PITCHING APPROACH TO ${inquiryClub?.toUpperCase()}`}
     {inquiryStatus === 'SUCCESS' && `PROPOSAL ACCEPTED BY ${inquiryClub?.toUpperCase()}!`}
     {inquiryStatus === 'REJECTED' && `REJECTED BY ${inquiryClub?.toUpperCase()}`}
     </h4>
     <p className="text-zinc-300 text-[11px] mt-1 max-w-[650px] leading-relaxed font-mono">{inquiryMsg}</p>
    </div>
    </div>
    
    {inquiryStatus !== 'NEGOTIATING' && (
    <button 
     onClick={() => setInquiryStatus('IDLE')}
     className="px-4 py-2 border border-zinc-800 glass-panel hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest transition-colors rounded shrink-0"
    >
     Dismiss
    </button>
    )}
   </div>
   )}

   {/* Clubs Search & Market Grid */}
   <div className="premium-card p-6 rounded-xl flex flex-col flex-1 gap-6 overflow-hidden">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
    <h3 className="text-white font-bold text-sm uppercase tracking-wide">Club Market Watch</h3>
    <input 
    type="text"
    placeholder="Search club, league or symbol..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full sm:w-[320px] px-4 py-2 glass-panel hover:border-zinc-700 focus:border-[#00FF88] rounded text-[#ccc] outline-none text-[11px] font-mono transition-all"
    />
   </div>

   {/* Market list */}
   <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
    {filteredClubs.length === 0 ? (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
     <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
      <Search className="text-[#444] w-6 h-6" />
     </div>
     <div className="text-white/40 text-[11px] font-bold uppercase tracking-widest">No matching clubs</div>
     <p className="text-[#555] text-[10px] max-w-[280px] mt-1 leading-relaxed">Adjust your search or filter parameters to explore other clubs in the world database.</p>
    </div>
    ) : (
    filteredClubs.map(club => {
     const gateStatus = getGatingStatus(player, club);
     const interestScore = gateStatus ? 0 : getClubInterest(club);
     const badge = getInterestBadge(interestScore, gateStatus);
     const hasActiveOffer = player.transferOffers?.some(o => o.clubSymbol === club.symbol);
     const scoutAttendance = player.stateFlags?.openThreads?.scoutAttendance?.[club.symbol] || 0;
     
     let reqText = '';
     if (gateStatus === 'AGENT_LOCK') {
      const nextAgent = player.agentTier === 'Rookie' ? 'Hungry' : player.agentTier === 'Hungry' ? 'Shark' : 'Super Agent';
      reqText = `🔒 LOCKED — Req: ${nextAgent} Agent`;
     } else if (gateStatus === 'TIER_GAP') {
      reqText = `🔒 LOCKED — Req: Max 2 Tiers Jump`;
     } else if (gateStatus === 'OVR_GAP') {
      const targetTier = club.tier === 'Elite' ? 1 : club.tier === 'Strong' ? 2 : club.tier === 'Mid' ? 3 : club.tier === 'Lower' ? 4 : 5;
      const minOvr = targetTier === 1 ? 82 : targetTier === 2 ? 75 : targetTier === 3 ? 65 : targetTier === 4 ? 55 : 30;
      reqText = `🔒 LOCKED — Req: ${minOvr} OVR`;
     } else if (gateStatus === 'REP_GAP') {
      const playerApps = player.stats?.apps || 0;
      const targetTier = club.tier === 'Elite' ? 1 : club.tier === 'Strong' ? 2 : club.tier === 'Mid' ? 3 : club.tier === 'Lower' ? 4 : 5;
      if (playerApps < 5 && targetTier <= 3) {
       reqText = `🔒 LOCKED — Req: 5+ Apps`;
      } else if (playerApps < 12 && targetTier <= 2) {
       reqText = `🔒 LOCKED — Req: 12+ Apps`;
      } else {
       const minRep = targetTier === 1 ? 65 : targetTier === 2 ? 45 : targetTier === 3 ? 25 : targetTier === 4 ? 10 : 0;
       reqText = `🔒 LOCKED — Req: ${minRep}% World Reputation`;
      }
     }

     return (
     <div 
      key={club.symbol} 
      className={`p-4 sm:p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
       gateStatus 
        ? 'opacity-40 bg-[#080808] border border-white/5 text-white/30' 
        : 'bg-[#0b0b0b]'
      }`}
     >
      {/* Club Identity */}
      <div className="flex items-center gap-3 w-full sm:w-[280px] shrink-0">
      <TeamLogo 
       symbol={club.symbol} 
       name={club.name} 
       primaryColor={club.primaryColor} 
       secondaryColor={club.secondaryColor} 
       size={40} 
      />
      <div className="min-w-0">
       <div className="text-white font-bold text-xs uppercase truncate flex items-center gap-1.5">
       <span>{club.name}</span>
       <span className="text-white/40 text-[9px]">({club.symbol})</span>
       </div>
       <div className="text-white/40 text-[9px] font-mono mt-0.5 uppercase truncate">{club.league}</div>
       <div className="text-[#00FF88] text-[9px] font-mono mt-0.5">CLUB OVR {club.ovr} &middot; {club.tier}</div>
       {gateStatus && (
        <div className="text-red-400 text-[10px] font-bold font-mono mt-1 uppercase tracking-wider">{reqText}</div>
       )}
      </div>
      </div>

      {/* Interest level indicator */}
      <div className="flex-1 max-w-[280px] flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-[9px] font-bold">
       <span className={`${badge.bg} px-2 py-0.5 rounded text-[8px]`}>{badge.label}</span>
      </div>
      <ProgressBar 
        value={interestScore} 
        showValue={true}
        colorMode="trust" 
        height="h-2" 
      />
      <div className="flex justify-between items-center text-[9px] text-white/50 font-mono mt-0.5">
       <span>Scouts Observed:</span>
       <span className="font-bold text-white">{scoutAttendance} / 3 Visits</span>
      </div>
      </div>

      {/* Pitch Actions */}
      <div className="flex gap-2 shrink-0 self-end sm:self-center">
      {gateStatus ? (
       <div className="px-3 py-2 border border-white/10 bg-white/5 text-white/30 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 cursor-not-allowed">
        🔒 LOCKED
       </div>
      ) : hasActiveOffer ? (
       <div className="px-3 py-2 bg-emerald-950/10 text-emerald-400 border border-emerald-900/30 text-[9px] font-bold uppercase rounded flex items-center gap-1.5">
       <Check size={12} />
       Offer Received
       </div>
      ) : (!isTransferWindow && player.currentClubSymbol !== 'FA') ? (
       <div className="px-3 py-2 text-[#555] text-[9px] font-bold uppercase bg-[#0c0c0c] rounded flex items-center gap-1">
       <AlertCircle size={11} />
       Window Closed
       </div>
      ) : (
       <>
       {player.currentClubSymbol !== 'FA' && (
        <button 
         onClick={() => handleInquirySubmit(club, 'LOAN')}
         disabled={inquiryStatus === 'NEGOTIATING' || player.loanInfo?.hostClub === club.symbol}
         className="px-3 py-2 glass-panel hover:bg-[#252525] text-white text-[9px] font-bold uppercase tracking-widest transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed"
        >
         Pitch Loan
        </button>
       )}
       <button 
        onClick={() => handleInquirySubmit(club, 'TRANSFER')}
        disabled={inquiryStatus === 'NEGOTIATING'}
        className="px-3 py-2 bg-[#00FF88] hover:bg-white hover:text-black text-black text-[9px] font-bold uppercase tracking-widest transition-all rounded disabled:opacity-30 disabled:cursor-not-allowed"
       >
        {player.currentClubSymbol === 'FA' ? 'Apply to Club' : 'Pitch Transfer'}
       </button>
       </>
      )}
      </div>
     </div>
     );
    })
    )}
   </div>
   </div>
  </div>
  )}

  <SuggestSigningModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />
  <MedicalCheckModal 
    isOpen={isMedicalModalOpen} 
    offer={player.transferOffers.find(o => o.id === pendingMedicalOffer) || null} 
    onClose={() => setIsMedicalModalOpen(false)} 
    onComplete={handleMedicalComplete} 
  />
 </div>
 
 );
}

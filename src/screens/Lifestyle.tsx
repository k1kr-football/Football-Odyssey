import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { 
 Building2, 
 UtensilsCrossed, 
 Dumbbell, 
 Home, 
 ShoppingBag, 
 Coins, 
 Briefcase, 
 Users,
 Sparkles,
 Brain
} from 'lucide-react';
import { checkLifestyleLock } from '../utils/financialProgression';
import { applyLifestyleMentalFatigueRecovery } from '../utils/wellbeingEngine';

export function Lifestyle() {
 const { state, setPlayer } = useGame();
 
 if (!state.player) return null;

 const [activeTab, setActiveTab] = useState<'LIFESTYLE' | 'AGENT'>('LIFESTYLE');
 const [notification, setNotification] = useState<string | null>(null);

  const getAgentUpgradeCostAndNext = (current: string) => {
   switch (current) {
    case 'Rookie': return { next: 'Hungry', cost: 25000, desc: 'Unlocks Championship transfers and demanding improved contracts.' };
    case 'Hungry': return { next: 'Shark', cost: 100000, desc: 'Unlocks Premier League transfer rumors, higher contract packages, and passive scouting interest.' };
    case 'Shark': return { next: 'Super Agent', cost: 500000, desc: 'Unlocks Elite club options and 2x scouting frequency.' };
    case 'Super Agent': return { next: 'Legend', cost: 2000000, desc: 'Unlocks World XI transfers, maximum base salaries, and instant release clauses.' };
    default: return null;
   }
  };

  const handleAgentUpgrade = () => {
   const upgrade = getAgentUpgradeCostAndNext(p.agentTier);
   if (!upgrade) {
    showNotification("Agent is already at maximum Tier!");
    return;
   }
   if ((p.finances?.balance || 0) < upgrade.cost) {
    showNotification(`Insufficient funds! Upgrade requires £${upgrade.cost.toLocaleString()}`);
    return;
   }
   setPlayer({
    ...p,
    agentTier: upgrade.next as any,
    finances: {
     ...p.finances,
     balance: (p.finances?.balance || 0) - upgrade.cost
    },
    relationships: {
     ...p.relationships,
     agent: 100
    }
   });
   showNotification(`Upgrade successful! ${upgrade.next} Agent hired! 🤝 | -£${upgrade.cost.toLocaleString()} | +100 Agent Rel`);
  };
 
 if (!state.player) return null;
 const p = state.player;

 const openThreads = p.stateFlags?.openThreads || {};
 const signedSponsors: string[] = openThreads.sponsors || [];
 const investments = openThreads.investments || {
 properties: [],
 startups: [],
 shibaFc: { tokens: 0, avgPrice: 0 }
 };
 const cryptoPrice = openThreads.shibaFcPrice || 1.25;

 let customSponsorIncome = 0;
 // Sponsor calculation for the left-hand breakdown
 const sponsorDealsDb = [
 { id: 'three_stripes', payout: 3000 },
 { id: 'victory_swoosh', payout: 10000 },
 { id: 'giga_cougar', payout: 30000 },
 { id: 'luxo_chrono', payout: 75000 },
 { id: 'apex_hypercars', payout: 150000 }
 ];
 signedSponsors.forEach(sId => {
 const deal = sponsorDealsDb.find(d => d.id === sId);
 if (deal) customSponsorIncome += deal.payout;
 });

 let propertyRentalYield = 0;
 const ownedProperties = investments.properties || [];
 ownedProperties.forEach((pOwned: any) => {
 propertyRentalYield += pOwned.yield || 0;
 });

 const sponsorIncome = ((p.reputation?.world || 50) * 1500) || 0;
 const totalIncome = (p.contract?.wage || 0) + sponsorIncome + customSponsorIncome + propertyRentalYield;
 const totalExpenses = (p.finances?.expenses?.housing || 0) + (p.finances?.expenses?.training || 0) + (p.finances?.expenses?.lifestyle || 0) + (p.finances?.expenses?.family || 0);
 const netWeekly = totalIncome - totalExpenses;

 const showNotification = (msg: string) => {
 setNotification(msg);
 setTimeout(() => setNotification(null), 3500);
 };

 const handleUpgrade = (category: keyof typeof p.lifestyleTier, level: string, cost: number, attr: 'housing' | 'training' | 'lifestyle' | 'family') => {
 setPlayer({
  ...p,
  lifestyleTier: { ...p.lifestyleTier, [category]: level },
  finances: {
  ...p.finances,
  expenses: { housing: 0, training: 0, lifestyle: 0, family: 0, ...(p.finances?.expenses || {}), [attr]: cost }
  }
 });
 showNotification(`${level} Tier Active! -£${cost}/w`);
 };

 const handleEvent = (cost: number, title: string, cb: (updated: typeof p) => void) => {
 if ((p.finances?.balance || 0) < cost) {
  showNotification("INSUFFICIENT FUNDS IN BANK BALANCE.");
  return;
 }
 const updated = { ...p, finances: { ...p.finances, balance: (p.finances?.balance || 0) - cost } };
 cb(updated);
 setPlayer(updated);
 showNotification(`Purchased ${title}! -£${cost.toLocaleString()}`);
 };

 const getLockInfo = (category: string, level: string) => {
  return checkLifestyleLock(p, category, level);
 };

 const TIERS = {
 housing: [
  { level: 'Digs', cost: 500, desc: 'Shared flat. Base morale and recovery.' },
  { level: 'Apartment', cost: 3000, desc: 'City center pad. +5 Fatigue Recovery weekly.' },
  { level: 'Mansion', cost: 15000, desc: 'Luxury estate. +10 Fatigue Recovery weekly.' },
 ],
 training: [
  { level: 'Basic', cost: 0, desc: 'Rely purely on club facilities.' },
  { level: 'Pro', cost: 1000, desc: 'Personal physio. Lowers injury risk slightly.' },
  { level: 'Elite', cost: 5000, desc: 'Hyperbaric chamber & personal data lab. Lowest injury risk.' },
 ],
 nutrition: [
  { level: 'Club', cost: 0, desc: 'Eat at the training ground.' },
  { level: 'Private Chef', cost: 3000, desc: 'Tailored diet. +15 Fatigue Recovery weekly.' },
 ],
 image: [
  { level: 'Standard', cost: 0, desc: 'Club tracksuits and basic clothes.' },
  { level: 'Designer', cost: 2000, desc: 'Boutique PR & stylings. +1 Media perception weekly.' },
  { level: 'Iconic', cost: 15000, desc: 'Global image rights firm. +2 Media, +1 Fans weekly.' },
 ]
 };

 return (
 <div className="flex flex-col h-full p-6 relative premium-card text-white overflow-hidden font-sans">
  {notification && (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 glass-panel border border-[#00FF88] text-[#00FF88] px-6 py-3 font-mono font-bold text-xs uppercase tracking-widest rounded animate-bounce">
   ⚡ {notification}
  </div>
  )}

  {/* Tabs Header */}
  <div className="flex gap-4 border-b border-[#222] pb-4 mb-6 shrink-0">
  <button 
   onClick={() => setActiveTab('LIFESTYLE')}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-2 transition-colors ${activeTab === 'LIFESTYLE' ? 'border-b-2 border-[#00FF88] text-white' : 'text-white/50 hover:text-white'}`}
  >
   Ledger & Lifestyle
  </button>
  <button 
   onClick={() => setActiveTab('AGENT')}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-2 transition-colors ${activeTab === 'AGENT' ? 'border-b-2 border-[#00FF88] text-white' : 'text-white/50 hover:text-white'}`}
  >
   Agent Meeting
  </button>
  </div>
  
  <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
  
  {/* Left Ledger Column */}
  <div className="w-full md:w-[350px] premium-card p-6 flex flex-col shrink-0 overflow-y-auto no-scrollbar ">
   <div className="text-[#00FF88] text-[10px] uppercase font-bold tracking-widest mb-6">Financial Ledger</div>
   
   <div className="space-y-4 flex-1">
   <div className="flex justify-between items-center text-xs pb-2 border-b border-[#222]/40">
    <span className="text-white/50">Weekly Club Wage:</span>
    <span className="text-emerald-500 font-mono font-bold">+£{p.contract.wage.toLocaleString()}</span>
   </div>
   
   <div className="flex justify-between items-center text-xs pb-2 border-b border-[#222]/40">
    <span className="text-white/50">Fame Sponsorships:</span>
    <span className="text-emerald-400 font-mono">+£{sponsorIncome.toLocaleString()}</span>
   </div>

   <div className="flex justify-between items-center text-xs pb-2 border-b border-[#222]/40">
    <span className="text-white/50">Brand Endorsements:</span>
    <span className="text-emerald-400 font-mono font-bold">+£{customSponsorIncome.toLocaleString()}</span>
   </div>

   <div className="flex justify-between items-center text-xs pb-2 border-b border-[#222]/40">
    <span className="text-white/50">Passive Rental Yields:</span>
    <span className="text-emerald-400 font-mono font-bold">+£{propertyRentalYield.toLocaleString()}</span>
   </div>

   <div className="flex justify-between items-center text-xs pt-2 pb-2 border-b border-[#222]/80 font-bold">
    <span className="text-white uppercase tracking-wider text-[10px]">Gross Income:</span>
    <span className="text-emerald-400 font-mono">£{totalIncome.toLocaleString()}</span>
   </div>

   <div className="flex justify-between items-center text-xs pb-2 border-b border-[#222]/40">
    <span className="text-white/50">Lifestyle Outgoings:</span>
    <span className="text-red-400 font-mono">-£{totalExpenses.toLocaleString()}</span>
   </div>

   <div className="pt-4">
    <div className="text-white/50 text-[9px] uppercase tracking-widest mb-1">Weekly Profit / Deficit</div>
    <div className={`text-2xl font-black font-mono ${netWeekly >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
    {netWeekly >= 0 ? '+' : '-'}£{Math.abs(netWeekly).toLocaleString()}/w
    </div>
    {netWeekly < 0 && (
    <div className="text-red-500 text-[9px] font-bold uppercase tracking-widest mt-2 animate-pulse flex items-center gap-1">
     ⚠️ BURNING CASH. MORALE DECAYING.
    </div>
    )}
   </div>
   </div>
  </div>

  {/* Right Tab Content Panel */}
  <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
   
   {/* TAB 1: LEDGER & LIFESTYLE */}
   {activeTab === 'LIFESTYLE' && (
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <div className="premium-card p-6 ">
    <h2 className="text-white text-md font-black uppercase tracking-wider mb-6 flex items-center gap-3">
     <Home className="text-[#00FF88]" size={18}/> Housing Upgrades
    </h2>
    <div className="space-y-4">
     {TIERS.housing.map(t => {
      const lock = getLockInfo('housing', t.level);
      return (
       <button 
        key={t.level} 
        onClick={() => {
         if (lock.locked) {
          showNotification(`🔒 Locked! ${lock.reason}`);
         } else {
          handleUpgrade('housing', t.level as any, t.cost, 'housing');
         }
        }}
        className={`w-full p-4 border text-left transition-colors flex justify-between items-center ${
         lock.locked ? 'opacity-40 cursor-not-allowed bg-[#080808] border-[#111] text-white/30' :
         p.lifestyleTier.housing === t.level ? 'border-[#00FF88] glass-panel' : 'border-[#222] hover:border-[#222] bg-[#0c0c0c]'
        }`}
       >
        <div>
        <div className={`font-black tracking-wider uppercase text-xs ${p.lifestyleTier.housing === t.level ? 'text-[#00FF88]' : 'text-white'}`}>
         {t.level}
        </div>
        <div className="text-white/50 text-[10px] mt-0.5">{lock.locked ? `LOCKED — Req: ${lock.reason}` : t.desc}</div>
        </div>
        <div className="text-right pl-4">
        <div className="text-red-400 font-bold font-mono text-xs">£{t.cost}/w</div>
        </div>
       </button>
      );
     })}
    </div>
    </div>

    <div className="premium-card p-6 ">
    <h2 className="text-white text-md font-black uppercase tracking-wider mb-6 flex items-center gap-3">
     <Dumbbell className="text-[#00FF88]" size={18}/> Training & nutrition
    </h2>
    <div className="space-y-4 mb-6">
     <div className="text-white/40 text-[9px] uppercase tracking-wider font-bold mb-2">Personal Fitness Programs</div>
     {TIERS.training.map(t => {
      const lock = getLockInfo('training', t.level);
      return (
       <button 
        key={t.level} 
        onClick={() => {
         if (lock.locked) {
          showNotification(`🔒 Locked! ${lock.reason}`);
         } else {
          handleUpgrade('training', t.level as any, t.cost, 'training');
         }
        }}
        className={`w-full p-4 border text-left flex justify-between transition-colors items-center ${
         lock.locked ? 'opacity-40 cursor-not-allowed bg-[#080808] border-[#111] text-white/30' :
         p.lifestyleTier.training === t.level ? 'border-[#00FF88] glass-panel' : 'border-[#222] hover:border-[#222] bg-[#0c0c0c]'
        }`}
       >
        <div>
        <div className={`font-black tracking-wider uppercase text-xs ${p.lifestyleTier.training === t.level ? 'text-[#00FF88]' : 'text-white'}`}>
         {t.level}
        </div>
        <div className="text-white/50 text-[10px] mt-0.5">{lock.locked ? `LOCKED — Req: ${lock.reason}` : (t.level === 'Pro' ? 'Personal Physio' : t.level === 'Elite' ? 'Hyperbaric Chamber' : 'Club standard')}</div>
        </div>
        <div className="text-red-400 font-bold font-mono text-xs">£{t.cost}/w</div>
       </button>
      );
     })}
    </div>
    
    <div className="space-y-4">
     <div className="text-white/40 text-[9px] uppercase tracking-wider font-bold mb-2">Dietary Protocols</div>
     {TIERS.nutrition.map(t => (
     <button 
      key={t.level} 
      onClick={() => handleUpgrade('nutrition', t.level as any, t.cost, 'training')}
      className={`w-full p-4 border text-left flex justify-between transition-colors items-center ${p.lifestyleTier.nutrition === t.level ? 'border-[#00FF88] glass-panel' : 'border-[#222] hover:border-[#222] bg-[#0c0c0c]'}`}
     >
      <div>
      <div className={`font-black tracking-wider uppercase text-xs ${p.lifestyleTier.nutrition === t.level ? 'text-[#00FF88]' : 'text-white'}`}>{t.level}</div>
      <div className="text-white/50 text-[10px] mt-0.5">{t.level === 'Private Chef' ? '+15 Fatigue Recovery weekly' : 'Club kitchen baseline'}</div>
      </div>
      <div className="text-red-400 font-bold font-mono text-xs">£{t.cost}/w</div>
     </button>
     ))}
    </div>
    </div>

    <div className="premium-card p-6 ">
    <h2 className="text-white text-md font-black uppercase tracking-wider mb-6 flex items-center gap-3">
     <ShoppingBag className="text-[#00FF88]" size={18}/> PR & Public Image
    </h2>
    <div className="space-y-4">
     {TIERS.image.map(t => {
      const lock = getLockInfo('image', t.level);
      return (
       <button 
        key={t.level} 
        onClick={() => {
         if (lock.locked) {
          showNotification(`🔒 Locked! ${lock.reason}`);
         } else {
          handleUpgrade('image', t.level as any, t.cost, 'lifestyle');
         }
        }}
        className={`w-full p-4 border text-left transition-colors flex justify-between items-center ${
         lock.locked ? 'opacity-40 cursor-not-allowed bg-[#080808] border-[#111] text-white/30' :
         p.lifestyleTier.image === t.level ? 'border-[#00FF88] glass-panel' : 'border-[#222] hover:border-[#222] bg-[#0c0c0c]'
        }`}
       >
        <div>
        <div className={`font-black tracking-wider uppercase text-xs ${p.lifestyleTier.image === t.level ? 'text-[#00FF88]' : 'text-white'}`}>
         {t.level}
        </div>
        <div className="text-white/50 text-[10px] mt-0.5">{lock.locked ? `LOCKED — Req: ${lock.reason}` : t.desc}</div>
        </div>
        <div className="text-red-400 font-bold font-mono text-xs">£{t.cost}/w</div>
       </button>
      );
     })}
    </div>
    </div>

    {/* ONE OFF EXPERIENCES & MORALE PURCHASES */}
    <div className="premium-card p-6 ">
    <h2 className="text-white text-md font-black uppercase tracking-wider mb-6 flex items-center gap-3">
     <ShoppingBag className="text-[#00FF88]" size={18}/> Luxury purchases
    </h2>
    <div className="space-y-4">
     <button 
     onClick={() => handleEvent(1200, "Michelin Dinner", (up) => { up.morale = Math.min(100, up.morale + 15); })}
     className="w-full p-4 hover:border-[#222] bg-[#0c0c0c] text-left transition-colors flex justify-between items-center"
     >
     <div>
      <div className="font-bold text-white text-xs uppercase tracking-wider">Book Michelin Dinner</div>
      <div className="text-white/50 text-[10px] mt-0.5">Rent a private dining pod with friends. Morale +15 immediately.</div>
     </div>
     <div className="text-red-400 font-bold font-mono text-xs">£1.2k</div>
     </button>

     <button 
     onClick={() => handleEvent(8000, "Squad Night Out", (up) => { up.relationships.teammates = Math.min(100, up.relationships.teammates + 15); })}
     className="w-full p-4 hover:border-[#222] bg-[#0c0c0c] text-left transition-colors flex justify-between items-center"
     >
     <div>
      <div className="font-bold text-white text-xs uppercase tracking-wider">Sponsor Squad Night Out</div>
      <div className="text-white/50 text-[10px] mt-0.5">Rent the VIP lounge for team building. Teammate Rel +15 immediately.</div>
     </div>
     <div className="text-red-400 font-bold font-mono text-xs">£8k</div>
     </button>

     <button 
     onClick={() => handleEvent(10000, "Luxury Cruise", (up) => { 
      up.relationships = up.relationships || { manager: 50, manager_discipline: 50, teammates: 50, agent: 50, family: 75 };
      up.relationships.family = Math.min(100, (up.relationships.family ?? 75) + 20); 
      up.morale = Math.min(100, up.morale + 10); 
     })}
     className="w-full p-4 hover:border-[#222] bg-[#0c0c0c] text-left transition-colors flex justify-between items-center"
     >
     <div>
      <div className="font-bold text-white text-xs uppercase tracking-wider">Send Parents on Luxury Cruise</div>
      <div className="text-white/50 text-[10px] mt-0.5">Improves family relationship (+20) and triggers positive morale (+10). Zero fatigue.</div>
     </div>
     <div className="text-red-400 font-bold font-mono text-xs">£10k</div>
     </button>
    </div>
    </div>

    {/* MENTAL WELLNESS & BURNOUT RETREATS */}
    <div className="premium-card p-6 border border-[#38bdf8]/30">
    <h2 className="text-white text-md font-black uppercase tracking-wider mb-6 flex items-center gap-3">
     <Brain className="text-[#38bdf8]" size={18}/> Mental Wellness & Burnout Countermeasures
    </h2>
    <div className="space-y-4">
     <button 
     onClick={() => handleEvent(2500, "Spa & Mindfulness Day", (up) => { 
      const recovered = applyLifestyleMentalFatigueRecovery(up, 20, "Spa & Mindfulness Day");
      up.mentalFatigue = recovered.mentalFatigue;
      up.mentalFatigueDetails = recovered.mentalFatigueDetails;
      up.morale = Math.min(100, up.morale + 10);
     })}
     className="w-full p-4 hover:border-[#38bdf8]/50 bg-[#0c0c0c] text-left transition-colors flex justify-between items-center"
     >
     <div>
      <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
       <span>Private Spa & Mindfulness Day</span>
       <span className="text-[9px] font-mono font-bold uppercase text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/30">-20 Mental Fatigue</span>
      </div>
      <div className="text-white/50 text-[10px] mt-0.5">Cryotherapy chambers, sound baths, and guided meditation to clear cognitive fatigue.</div>
     </div>
     <div className="text-red-400 font-bold font-mono text-xs">£2.5k</div>
     </button>

     <button 
     onClick={() => handleEvent(6000, "Off-Grid Sanctuary Weekend", (up) => { 
      const recovered = applyLifestyleMentalFatigueRecovery(up, 35, "Off-Grid Sanctuary Weekend");
      up.mentalFatigue = recovered.mentalFatigue;
      up.mentalFatigueDetails = recovered.mentalFatigueDetails;
      up.morale = Math.min(100, up.morale + 15);
     })}
     className="w-full p-4 hover:border-[#38bdf8]/50 bg-[#0c0c0c] text-left transition-colors flex justify-between items-center"
     >
     <div>
      <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
       <span>Off-Grid Sanctuary Weekend</span>
       <span className="text-[9px] font-mono font-bold uppercase text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/30">-35 Mental Fatigue</span>
      </div>
      <div className="text-white/50 text-[10px] mt-0.5">Disconnect from social media & press noise in a secluded mountain retreat.</div>
     </div>
     <div className="text-red-400 font-bold font-mono text-xs">£6k</div>
     </button>
    </div>
    </div>

   </div>
   )}

   {activeTab === 'AGENT' && (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-12 flex flex-col gap-6 animate-fade-in">
    <div className="flex flex-col gap-2">
     <h2 className="text-white text-xl font-bold uppercase tracking-wide">Agent Meeting</h2>
     <p className="text-white/50 text-sm">Sit down with your representative to discuss your career trajectory, contract demands, and market position.</p>
    </div>

    <div className="premium-card p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-center ">
     <div className="w-24 h-24 rounded-full glass-panel border-2 border-[#222] shrink-0 flex flex-col items-center justify-center">
      <Briefcase className="w-8 h-8 text-white/50 mb-1" />
      <div className="text-[9px] font-bold uppercase tracking-widest text-[#00FF88]">{p.agentTier}</div>
     </div>
     <div className="flex-1">
      <div className="text-white text-lg font-bold">Your Agent</div>
      <div className="text-white/50 text-sm mt-1 mb-4">
      {p.agentTier === 'Rookie' && "A family friend trying their best, but lacks connections."}
      {p.agentTier === 'Hungry' && "Young and ambitious. Will fight for a small bump in pay."}
      {p.agentTier === 'Shark' && "Ruthless operator. Knows how to play the media and force a move."}
      {p.agentTier === 'Super Agent' && "Global connections. Can get you into any club in the world."}
      {p.agentTier === 'Legend' && "The undisputed king of the transfer market. Demands the absolute max."}
      </div>
      
      <div className="h-2 w-full bg-[#1b1b1b] rounded-full overflow-hidden border border-[#2a2a2a]/40 mt-2">
      <div className="h-full bg-[#00FF88] transition-all duration-300 rounded-full" style={{ width: `${p.relationships.agent}%` }}></div>
      </div>
      <div className="flex justify-between mt-1">
       <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Relationship</span>
       <span className="text-white text-[10px] font-bold">{Math.round(p.relationships.agent || 0)}/100</span>
      </div>

      {(() => {
       const upgrade = getAgentUpgradeCostAndNext(p.agentTier);
       if (!upgrade) return <div className="text-emerald-400 text-xs font-mono font-bold mt-6 pt-4 border-t border-[#111]">✓ Maximum Agency Status Reached (Legend)</div>;
       return (
        <div className="mt-6 pt-4 border-t border-[#111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
          <div className="text-xs text-white/95 font-bold uppercase tracking-wide">Upgrade Representation to {upgrade.next} Agent</div>
          <p className="text-[10px] text-white/50 font-mono uppercase mt-1 leading-normal max-w-md">{upgrade.desc}</p>
         </div>
         <button
          onClick={handleAgentUpgrade}
          className="px-4 py-2 bg-[#00FF88] text-black hover:bg-white text-xs font-black uppercase tracking-wider rounded transition-all shrink-0 font-mono "
         >
          Retain Agent (£{upgrade.cost.toLocaleString()})
         </button>
        </div>
       );
      })()}
     </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
     <button 
      onClick={() => {
       const canDemand = (p.stats?.apps || 0) >= 15 && p.trust >= 75;
       if (canDemand) {
        showNotification("💼 Agent has requested a new contract meeting from the board! Response in next Inbox cycle.");
       } else {
        showNotification(`🔒 LOCKED — Req: 15+ Apps & 75+ Manager Trust (Currently ${(p.stats?.apps || 0)} Apps, ${p.trust} Trust)`);
       }
      }}
      className={`glass-panel p-6 hover:border-[#555] transition-colors text-left group flex flex-col justify-between ${
       (p.stats?.apps || 0) >= 15 && p.trust >= 75 ? '' : 'opacity-40 bg-[#080808] border-[#111]'
      }`}
     >
      <div>
       <h3 className="text-white font-bold uppercase tracking-wide mb-2 group-hover:text-[#00FF88] transition-colors flex items-center gap-1.5">
        Demand Contract {!((p.stats?.apps || 0) >= 15 && p.trust >= 75) && "🔒"}
       </h3>
       <p className="text-white/50 text-[10px] uppercase font-mono mb-2 leading-relaxed">
        {!((p.stats?.apps || 0) >= 15 && p.trust >= 75) ? "LOCKED — Req: 15+ Apps & 75+ Manager Trust" : "Speak to the board about a wage increase based on recent performances."}
       </p>
      </div>
     </button>

     <button 
      onClick={() => {
       const hasPremiumAgent = p.agentTier !== 'Rookie';
       if (hasPremiumAgent) {
        showNotification("🔍 Agent is speaking with scouts. You will see increased interest in the Transfer screen!");
       } else {
        showNotification("🔒 LOCKED — Req: Hungry Agent+ (Current: Rookie)");
       }
      }}
      className={`glass-panel p-6 hover:border-[#555] transition-colors text-left group flex flex-col justify-between ${
       p.agentTier !== 'Rookie' ? '' : 'opacity-40 bg-[#080808] border-[#111]'
      }`}
     >
      <div>
       <h3 className="text-white font-bold uppercase tracking-wide mb-2 group-hover:text-[#00FF88] transition-colors flex items-center gap-1.5">
        Sound Out Clubs {p.agentTier === 'Rookie' && "🔒"}
       </h3>
       <p className="text-white/50 text-[10px] uppercase font-mono mb-2 leading-relaxed">
        {p.agentTier === 'Rookie' ? "LOCKED — Req: Hungry Agent+" : "Quietly gauge interest from other teams before the transfer window opens."}
       </p>
      </div>
     </button>

     <button 
      onClick={() => {
       const canFire = p.reputation.world >= 30;
       if (canFire) {
        setPlayer({
         ...p,
         agentTier: 'Rookie',
         relationships: { ...p.relationships, agent: 50 }
        });
        showNotification("🔥 Agent fired! Reverted to Rookie agency representation.");
       } else {
        showNotification(`🔒 LOCKED — Req: 30% World Reputation (Current: ${Math.round(p.reputation.world)}%)`);
       }
      }}
      className={`glass-panel p-6 hover:border-[#555] transition-colors text-left group flex flex-col justify-between ${
       p.reputation.world >= 30 ? '' : 'opacity-40 bg-[#080808] border-[#111]'
      }`}
     >
      <div>
       <h3 className="text-white font-bold uppercase tracking-wide mb-2 group-hover:text-[#00FF88] transition-colors flex items-center gap-1.5">
        Fire Agent {p.reputation.world < 30 && "🔒"}
       </h3>
       <p className="text-white/50 text-[10px] uppercase font-mono mb-2 leading-relaxed">
        {p.reputation.world < 30 ? "LOCKED — Req: 30% World Reputation" : "Terminate relationship and look for new representation."}
       </p>
      </div>
     </button>
    </div>
    </div>
   )}

  </div>

  </div>
 </div>
 );
}

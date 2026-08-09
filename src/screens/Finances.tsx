import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { 
 CircleDollarSign, 
 TrendingUp, 
 TrendingDown, 
 Building2, 
 Coins, 
 Briefcase, 
 Award, 
 HelpCircle, 
 LineChart, 
 ArrowRight,
 Sparkles,
 ShoppingBag,
 Zap,
 Globe,
 PieChart, AlertTriangle
} from 'lucide-react';
import { CLUBS } from '../data/teams';
import { GlossaryTooltip } from '../components/GlossaryTooltip';
import { checkAssetLock, getActiveFinancialTier, calculateNetWorth } from '../utils/financialProgression';
import { useAPEngine } from '../hooks/useAPEngine';

export function Finances() {
 const { state, setPlayer } = useGame();
 const { apState, toggleLifestyle } = useAPEngine();
 const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SPONSORS' | 'INVESTMENTS' | 'EMPIRE' | 'CLUB_FINANCES' | 'LIFESTYLE'>('OVERVIEW');
 const [notification, setNotification] = useState<string | null>(null);
 
 // ShibaFC & Cryptocoin Trading limits
 const [cryptoTradeQty, setCryptoTradeQty] = useState<number>(100);
 
 // Sponsorship Negotiations
 const [negotiatingDealId, setNegotiatingDealId] = useState<string | null>(null);
 const [negotiationStage, setNegotiationStage] = useState<'INTRO' | 'TALKING' | 'RESULT_SUCCESS' | 'RESULT_FAILED'>('INTRO');
 const [negotiationRound, setNegotiationRound] = useState<number>(1);
 const [brandImpatience, setBrandImpatience] = useState<number>(15);
 const [currentOfferedWage, setCurrentOfferedWage] = useState<number>(0);
 const [targetWageInput, setTargetWageInput] = useState<number>(0);
 const [selectedExclusivity, setSelectedExclusivity] = useState<boolean>(false);
 const [selectedSocialMedia, setSelectedSocialMedia] = useState<boolean>(false);
 const [selectedMorality, setSelectedMorality] = useState<boolean>(false);
 const [negotiationHistory, setNegotiationHistory] = useState<{ sender: 'PLAYER' | 'BRAND'; text: string }[]>([]);
 const [negotiationResult, setNegotiationResult] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IMPROVED' | 'FAILED'>('PENDING');

 if (!state.player) return null;
 const p = state.player;

 // Defensive Initializations for new custom openThreads fields
 const openThreads = p.stateFlags?.openThreads || {};
 const signedSponsors: string[] = openThreads.sponsors || [];
 const investments = openThreads.investments || {
 properties: [],
 startups: [],
 shibaFc: { tokens: 0, avgPrice: 0 }
 };
 const cryptoPrice = openThreads.shibaFcPrice || 1.25;

 // Sponsor Deals Database:
 const sponsorDealsDb = [
 { 
  id: 'three_stripes', 
  name: 'ThreeStripes Brand Ambassador', 
  payout: 3000, 
  reqRep: 15, 
  icon: '👟', 
  clause: 'Requires 15% World Rep. Pays £3,000/w. Signature Speed Boots (+2 Pace).',
  statMod: { key: 'pace', val: 2 }
 },
 { 
  id: 'victory_swoosh', 
  name: 'VictorySwoosh Elite Athlete', 
  payout: 10000, 
  reqRep: 35, 
  icon: '⚡', 
  clause: 'Requires 35% World Rep. Pays £10,000/w. Signature Agility Boots (+2 Dribbling).',
  statMod: { key: 'dribbling', val: 2 }
 },
 { 
  id: 'giga_cougar', 
  name: 'GigaCougar Global Face', 
  payout: 30000, 
  reqRep: 55, 
  icon: '🐆', 
  clause: 'Requires 55% World Rep. Pays £30,000/w. Power Boots (+2 Shooting).',
  statMod: { key: 'shooting', val: 2 }
 },
 { 
  id: 'luxo_chrono', 
  name: 'LuxoChrono Signature Series', 
  payout: 75000, 
  reqRep: 75, 
  icon: '⌚', 
  clause: 'Requires 75% World Rep. Pays £75,000/w.' 
 },
 { 
  id: 'apex_hypercars', 
  name: 'ApexHypercars Track Ambassador', 
  payout: 150000, 
  reqRep: 90, 
  icon: '🏎️', 
  clause: 'Requires 90% World Rep. Pays £150,000/w.' 
 },
 ];

 // Properties Database:
 const propertiesDb = [
 { id: 'studio', name: 'Boutique Studio Flat', cost: 150000, yield: 1200, desc: 'Cozy city flat rented out to students. Yields £1.2k weekly.' },
 { id: 'townhouse', name: 'Suburban Townhouse', cost: 500000, yield: 5000, desc: 'Elegant brick townhouse in prime residential zone. Yields £5k weekly.' },
 { id: 'office', name: 'City Commercial Block', cost: 2000000, yield: 24000, desc: 'Modern steel office space leased to software firm. Yields £24k weekly.' },
 { id: 'plaza', name: 'Ultra-Modern Retail Plaza', cost: 10000000, yield: 150000, desc: 'Luxury bento shopping hub with key retail tenants. Yields £150k weekly.' },
 ];

 // Startups Database:
 const startupsDb = [
 { id: 'gaffertinder', name: 'GafferTinder Scout App', desc: 'AI scouting matching tool for local managers. High Risk.', defaultCost: 100000 },
 { id: 'nftball', name: 'NFT-Ball Virtual Soccer', desc: 'Blockchain interactive ball collectibles. Extreme Volatility.', defaultCost: 50000 },
 { id: 'greengator', name: 'GreenGator Kelp Drinks', desc: 'Sustainable kelp sport nutrition startup. Medium Growth.', defaultCost: 200000 }
 ];

 // Calculations
 let customSponsorIncome = 0;
 signedSponsors.forEach(sId => {
 const isImproved = sId.endsWith('_IMPROVED');
 const baseId = isImproved ? sId.replace('_IMPROVED', '') : sId;
 const customPayouts = openThreads.sponsorPayouts || {};
 if (customPayouts[baseId] !== undefined) {
  customSponsorIncome += customPayouts[baseId];
 } else {
  const deal = sponsorDealsDb.find(d => d.id === baseId);
  if (deal) customSponsorIncome += (deal.payout * (isImproved ? 1.25 : 1));
 }
 });

 let propertyRentalYield = 0;
 const ownedProperties = investments.properties || [];
 ownedProperties.forEach((pOwned: any) => {
 propertyRentalYield += pOwned.yield || 0;
 });

 let mediaMod = 1.0;
 if (p.mediaPerception !== undefined) {
  if (p.mediaPerception >= 70) mediaMod = 1.25;
  else if (p.mediaPerception <= 40) mediaMod = 0.75;
 }
 const sponsorIncome = Math.round((((p.reputation?.world || 50) * 1500) || 0) * mediaMod);
 
 let staffExpenses = 0;
 try {
   const apState = JSON.parse(localStorage.getItem('football_odyssey_ap_state') || '{}');
   if (apState.staff) {
     if (apState.staff.nutritionist) staffExpenses += 1200;
     if (apState.staff.privatePhysio) staffExpenses += 2500;
     if (apState.staff.prManager) staffExpenses += 1800;
   }
 } catch (e) {}

 const totalIncome = (p.contract?.wage || 0) + sponsorIncome + customSponsorIncome + propertyRentalYield;
 const totalExpenses = (p.finances?.expenses?.housing || 0) + (p.finances?.expenses?.training || 0) + (p.finances?.expenses?.lifestyle || 0) + (p.finances?.expenses?.family || 0) + staffExpenses;
 const netWeekly = totalIncome - totalExpenses;

 const realEstateValue = ownedProperties.reduce((sum: number, prop: any) => sum + ((prop.qty || 1) * (prop.cost || 0)), 0);
 const vcValue = (investments.startups || []).reduce((sum: number, start: any) => sum + (start.val || 0), 0);
 const cryptoValue = (investments.shibaFc?.tokens || 0) * cryptoPrice;
 const netWorth = calculateNetWorth(p);

 const financialTier = getActiveFinancialTier(p);

 const getPropLock = (id: string) => {
  return checkAssetLock(p, id);
 };

 const getStartupLock = (id: string) => {
  return checkAssetLock(p, 'startup_seed');
 };

 const getEmpireLock = () => {
  return checkAssetLock(p, 'financial_empire');
 };

 const showNotification = (msg: string) => {
 setNotification(msg);
 setTimeout(() => setNotification(null), 3500);
 };

 // Sponsor Actions
 const signSponsorDeal = (dealId: string, reqRep: number, payout: number = 0, exclusivity: boolean = false, socialMedia: boolean = false, morality: boolean = false) => {
 if (p.reputation.world < reqRep) {
  showNotification("Your world reputation is not high enough for this brand.");
  return;
 }
 if (signedSponsors.includes(dealId) || signedSponsors.includes(dealId + '_IMPROVED')) {
  showNotification("You are already signed with this brand.");
  return;
 }
 const updatedSponsors = [...signedSponsors, dealId];
 const customPayouts = { ...(openThreads.sponsorPayouts || {}), [dealId]: payout || 1000 };
 const activeClauses = {
  ...(openThreads.sponsorClauses || {}),
  [dealId]: { exclusivity, socialMedia, morality }
 };

 let updatedAttributes = { ...p.attributes };
 const deal = sponsorDealsDb.find(d => d.id === dealId);
 if (deal?.statMod) {
   updatedAttributes = {
     ...updatedAttributes,
     [deal.statMod.key]: Math.min(100, (updatedAttributes[deal.statMod.key as keyof typeof updatedAttributes] || 50) + deal.statMod.val)
   };
 }

 setPlayer({
  ...p,
  attributes: updatedAttributes,
  stateFlags: {
  ...p.stateFlags,
  openThreads: {
   ...openThreads,
   sponsors: updatedSponsors,
   sponsorPayouts: customPayouts,
   sponsorClauses: activeClauses
  }
  }
 });
 showNotification(`Signed ambassador deal with ${dealId} at £${(payout || 1000).toLocaleString()}/w successfully!`);
 };

 const terminateSponsorDeal = (dealId: string) => {
 const updatedSponsors = signedSponsors.filter(id => id !== dealId && id !== dealId + '_IMPROVED');
 let updatedAttributes = { ...p.attributes };
 const deal = sponsorDealsDb.find(d => d.id === dealId);
 if (deal?.statMod) {
   updatedAttributes = {
     ...updatedAttributes,
     [deal.statMod.key]: Math.max(1, (updatedAttributes[deal.statMod.key as keyof typeof updatedAttributes] || 50) - deal.statMod.val)
   };
 }

 setPlayer({
  ...p,
  attributes: updatedAttributes,
  stateFlags: {
  ...p.stateFlags,
  openThreads: {
   ...openThreads,
   sponsors: updatedSponsors
  }
  }
 });
 showNotification("Ambassador contract terminated.");
 };

 // Property Actions
 const buyProperty = (propId: string, cost: number, pYield: number, name: string) => {
  const lock = getPropLock(propId);
  if (lock.locked) {
   showNotification(`🔒 Gated! ${lock.reason}`);
   return;
  }
 if (p.finances.balance < cost) {
  showNotification("Insufficient balance to purchase this property.");
  return;
 }
 const existingIndex = ownedProperties.findIndex((prop: any) => prop.id === propId);
 let updatedProps = [...ownedProperties];
 if (existingIndex > -1) {
  updatedProps[existingIndex] = {
  ...updatedProps[existingIndex],
  qty: (updatedProps[existingIndex].qty || 1) + 1,
  yield: (updatedProps[existingIndex].yield || pYield) + pYield
  };
 } else {
  updatedProps.push({ id: propId, name, cost, yield: pYield, qty: 1 });
 }

 setPlayer({
  ...p,
  finances: {
  ...p.finances,
  balance: p.finances.balance - cost
  },
  stateFlags: {
  ...p.stateFlags,
  openThreads: {
   ...openThreads,
   investments: {
   ...investments,
   properties: updatedProps
   }
  }
  }
 });
 showNotification(`Purchased ${name}! -£${cost.toLocaleString()} | +£${pYield.toLocaleString()}/w Yield`);
 };

 const sellProperty = (propId: string) => {
 const existingIndex = ownedProperties.findIndex((prop: any) => prop.id === propId);
 if (existingIndex === -1 || ownedProperties[existingIndex].qty <= 0) {
  showNotification("You do not own any properties of this type.");
  return;
 }

 const prop = ownedProperties[existingIndex];
 const sellPrice = Math.floor(prop.cost * 0.9); // 90% return value
 const singleYield = Math.floor(prop.yield / prop.qty);

 let updatedProps = [...ownedProperties];
 if (prop.qty > 1) {
  updatedProps[existingIndex] = {
  ...prop,
  qty: prop.qty - 1,
  yield: prop.yield - singleYield
  };
 } else {
  updatedProps = updatedProps.filter((pOwned: any) => pOwned.id !== propId);
 }

 setPlayer({
  ...p,
  finances: {
  ...p.finances,
  balance: p.finances.balance + sellPrice
  },
  stateFlags: {
  ...p.stateFlags,
  openThreads: {
   ...openThreads,
   investments: {
   ...investments,
   properties: updatedProps
   }
  }
  }
 });
 showNotification(`Sold 1 unit of property for £${sellPrice.toLocaleString()}! Balance credited.`);
 };

 // Startup Actions
 const investInStartup = (id: string, name: string, cost: number) => {
  const lock = getStartupLock(id);
  if (lock.locked) {
   showNotification(`🔒 Gated! ${lock.reason}`);
   return;
  }
 if (p.finances.balance < cost) {
  showNotification("Insufficient balance to complete the angel round.");
  return;
 }
 const currentStartups = investments?.startups || [];
 if (currentStartups.some((s: any) => s.id === id)) {
  showNotification("You have already invested in this seed round.");
  return;
 }

 const updatedStartups = [...currentStartups, { id, name, val: cost, stage: 'Seed Round' }];
 setPlayer({
  ...p,
  finances: { ...p.finances, balance: p.finances.balance - cost },
  stateFlags: {
  ...p.stateFlags,
  openThreads: {
   ...openThreads,
   investments: {
   ...investments,
   startups: updatedStartups
   }
  }
  }
 });
 showNotification(`Invested in ${name}! -£${cost.toLocaleString()} | Added to Portfolio`);
 };

 // Cryptocoin Trading Actions
 const buyShibaFc = (qty: number) => {
 const cost = Math.floor(qty * cryptoPrice);
 if (p.finances.balance < cost) {
  showNotification("Insufficient funds to complete cryptocurrency transaction.");
  return;
 }
 const currentTokens = investments.shibaFc?.tokens || 0;
 const currentAvg = investments.shibaFc?.avgPrice || 0;
 const newTokens = currentTokens + qty;
 const newAvg = parseFloat((((currentTokens * currentAvg) + cost) / newTokens).toFixed(2));

 setPlayer({
  ...p,
  finances: { ...p.finances, balance: p.finances.balance - cost },
  stateFlags: {
  ...p.stateFlags,
  openThreads: {
   ...openThreads,
   investments: {
   ...investments,
   shibaFc: { tokens: newTokens, avgPrice: newAvg }
   }
  }
  }
 });
 showNotification(`Acquired ${qty.toLocaleString()} ShibaFC coins! Average price: £${newAvg}`);
 };

 const sellShibaFc = (qty: number) => {
 const currentTokens = investments.shibaFc?.tokens || 0;
 if (currentTokens < qty) {
  showNotification("You do not hold that quantity of ShibaFC coins.");
  return;
 }
 const payout = Math.floor(qty * cryptoPrice);
 const newTokens = currentTokens - qty;

 setPlayer({
  ...p,
  finances: { ...p.finances, balance: p.finances.balance + payout },
  stateFlags: {
  ...p.stateFlags,
  openThreads: {
   ...openThreads,
   investments: {
   ...investments,
   shibaFc: { tokens: newTokens, avgPrice: newTokens > 0 ? investments.shibaFc.avgPrice : 0 }
   }
  }
  }
 });
 showNotification(`Liquidated ${qty.toLocaleString()} ShibaFC coins. Received £${payout.toLocaleString()}`);
 };

 // Financial Empire unlock action
 const establishFinancialEmpire = () => {
  const lock = getEmpireLock();
  if (lock.locked) {
   showNotification(`🔒 Gated! ${lock.reason}`);
   return;
  }
 if (p.finances.balance < 1000000) {
  showNotification("Establishing a global Wealth Management Trust requires £1,000,000 liquid capital.");
  return;
 }
 setPlayer({
  ...p,
  finances: {
  ...p.finances,
  balance: p.finances.balance - 1000000
  },
  financialEmpire: {
  netWorth: netWorth - 1000000,
  cashBalance: 0,
  investments: [],
  businesses: [],
  stocks: { value: 250000, annualReturnRate: 0.12 },
  crypto: {
   value: 100000,
   currentPrice: 1.0,
   coinsHeld: 100000,
   rollingFourWeekDrawdown: 0
  },
  stage: 'INVESTOR',
  lastPayoutDate: 'Week 1'
  }
 });
 showNotification("FINANCIAL EMPIRE UNLOCKED! You now have a custom wealth advisory team and stocks.");
 };

 // Buy Stocks for Empire
 const buyEmpireStocks = (amount: number) => {
 if (!p.financialEmpire) return;
 if (p.finances.balance < amount) {
  showNotification("Insufficient bank balance to transfer to stock broker.");
  return;
 }
 const emp = { ...p.financialEmpire };
 emp.stocks.value += amount;
 
 setPlayer({
  ...p,
  finances: {
  ...p.finances,
  balance: p.finances.balance - amount
  },
  financialEmpire: emp
 });
 showNotification(`Transferred £${amount.toLocaleString()} into Stocks & Indices.`);
 };

 // Sell Stocks for Empire
 const sellEmpireStocks = (amount: number) => {
 if (!p.financialEmpire) return;
 const emp = { ...p.financialEmpire };
 if (emp.stocks.value < amount) {
  showNotification("Insufficient value in Stocks to liquidate.");
  return;
 }
 emp.stocks.value -= amount;
 
 setPlayer({
  ...p,
  finances: {
  ...p.finances,
  balance: p.finances.balance + amount
  },
  financialEmpire: emp
 });
 showNotification(`Liquidated £${amount.toLocaleString()} from Stocks to your checking account.`);
 };

 return (
 <div className="flex flex-col h-full premium-card text-white overflow-hidden p-6 md:p-8 font-sans animate-fade-in">
  {/* HEADER */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
  <div>
   <div className="flex items-center gap-2">
   <h1 className="text-white text-3xl font-black uppercase tracking-tight">
    FINANCIAL DESK
   </h1>
   <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-widest">
    {financialTier} Tier
   </span>
   </div>
   <p className="text-white/50 text-xs font-mono uppercase tracking-wider mt-1">
   Wages, Brand sponsors, Real estate holdings, & high-yield assets
   </p>
  </div>

  {notification && (
   <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-lg text-xs font-mono uppercase animate-pulse">
   {notification}
   </div>
  )}
  </div>

  {/* DASHBOARD GRID */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <div className="premium-card p-4 rounded-xl">
   <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1">Checking Balance</span>
   <span className="text-2xl font-black font-mono text-white">£{(p.finances?.balance || 0).toLocaleString()}</span>
  </div>
  <div className="premium-card p-4 rounded-xl">
   <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1">Total Assets Valuation</span>
   <span className="text-2xl font-black font-mono text-emerald-500">£{(realEstateValue + vcValue + cryptoValue).toLocaleString()}</span>
  </div>
  <div className="premium-card p-4 rounded-xl">
   <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1">Total Net Worth</span>
   <span className="text-2xl font-black font-mono text-[#00FF88]">£{netWorth.toLocaleString()}</span>
  </div>
  <div className="premium-card p-4 rounded-xl relative group">
   <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1">Net Weekly Cashflow</span>
   <span className={`text-2xl font-black font-mono ${netWeekly >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
   {netWeekly >= 0 ? '+' : '-'}£{Math.abs(netWeekly).toLocaleString()}/w
   </span>
   {staffExpenses > 0 && (
     <span className="text-[9px] text-white/30 font-mono absolute bottom-2 right-4">
       (Staff: £{staffExpenses.toLocaleString()}/wk)
     </span>
   )}
  </div>
  </div>

   {/* NAVIGATION TABS */}
   {(() => {
    const isInvestmentsLocked = netWorth < 30000 && p.reputation.world < 10;
    const isEmpireLocked = netWorth < 250000 && p.reputation.world < 25;
    return (
     <div className="flex gap-2 border-b border-white/10 mb-6">
     <button
      onClick={() => setActiveTab('OVERVIEW')}
      className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'OVERVIEW' ? 'border-emerald-500 text-white' : 'border-transparent text-white/40 hover:text-[#aaa]'}`}
     >
      <div className="flex items-center gap-2">
      <PieChart size={14} />
      Ledger Overview
      </div>
     </button>
     <button
      onClick={() => setActiveTab('SPONSORS')}
      className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'SPONSORS' ? 'border-emerald-500 text-white' : 'border-transparent text-white/40 hover:text-[#aaa]'}`}
     >
      <div className="flex items-center gap-2">
      <Award size={14} />
      Brand Deals ({signedSponsors.length})
      </div>
     </button>
     <button
      onClick={() => {
       if (isInvestmentsLocked) {
        showNotification("🔒 LOCKED — Req: £30,000 Net Worth or 10% World Reputation");
       } else {
        setActiveTab('INVESTMENTS');
       }
      }}
      className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
       isInvestmentsLocked 
        ? 'opacity-40 cursor-not-allowed text-white/20' 
        : activeTab === 'INVESTMENTS' ? 'border-emerald-500 text-white' : 'border-transparent text-white/40 hover:text-[#aaa]'
      }`}
     >
      <div className="flex items-center gap-2">
      <Building2 size={14} />
      Asset Portfolio {isInvestmentsLocked && "🔒"}
      </div>
     </button>
     <button
      onClick={() => {
       if (isEmpireLocked) {
        showNotification("🔒 LOCKED — Req: £250,000 Net Worth or 25% World Reputation");
       } else {
        setActiveTab('EMPIRE');
       }
      }}
      className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
       isEmpireLocked 
        ? 'opacity-40 cursor-not-allowed text-white/20' 
        : activeTab === 'EMPIRE' ? 'border-emerald-500 text-white' : 'border-transparent text-white/40 hover:text-[#aaa]'
      }`}
     >
      <div className="flex items-center gap-2">
      <Globe size={14} />
      Financial Empire {isEmpireLocked && "🔒"}
      </div>
     </button>

     <button
      onClick={() => setActiveTab('CLUB_FINANCES')}
      className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
       activeTab === 'CLUB_FINANCES' ? 'border-sky-500 text-white' : 'border-transparent text-white/40 hover:text-[#aaa]'
      }`}
     >
      <div className="flex items-center gap-2">
      <Building2 size={14} className="text-sky-400" />
      Club Boardroom
      </div>
     </button>
     
     <button
      onClick={() => setActiveTab('LIFESTYLE')}
      className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
       activeTab === 'LIFESTYLE' ? 'border-fuchsia-500 text-white' : 'border-transparent text-white/40 hover:text-[#aaa]'
      }`}
     >
      <div className="flex items-center gap-2">
      <Zap size={14} className="text-fuchsia-400" />
      Lifestyle Upgrades
      </div>
     </button>
     </div>
    );
   })()}

  {/* TAB SWITCH */}
  <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
  {activeTab === 'CLUB_FINANCES' && (() => {
    const clubSymbol = p.currentClubSymbol || 'MUN';
    const club = CLUBS.find(c => c.symbol === clubSymbol) || CLUBS[0];
    const financials = state.worldState?.clubFinances?.[clubSymbol];

    if (!financials) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-white/5 bg-zinc-950/20 rounded-xl">
          <Building2 size={48} className="text-zinc-600 mb-4 animate-pulse" />
          <p className="text-sm font-bold text-zinc-400">Boardroom Data Initializing...</p>
          <p className="text-xs text-zinc-500 mt-1 font-mono">Advance a day to load your club's financial profile.</p>
        </div>
      );
    }

    const healthColors = {
      'Secure': 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      'Stable': 'text-sky-400 border-sky-500/20 bg-sky-500/5',
      'Strained': 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      'Crisis': 'text-red-400 border-red-500/20 bg-red-500/5 animate-pulse'
    }[financials.financialHealth];

    const wageRatio = Math.round((financials.spending.wages / financials.revenue.total) * 100);
    const wageLimitExceeded = wageRatio > 70;
    const netWeeklyFlow = financials.revenue.total - financials.spending.total;

    return (
      <div className="space-y-6 font-sans">
        {/* CLUB PROFILE & HEALTH HEADER */}
        <div className="premium-card p-6 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black">{club.symbol}</span>
              <div>
                <h3 className="text-white text-base font-black uppercase tracking-wider">{club.name}</h3>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  {club.league} • {club.country}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full border text-xs font-bold font-mono tracking-wide ${healthColors}`}>
              Financial Status: {financials.financialHealth.toUpperCase()}
            </span>
            {financials.activeEmbargo && (
              <span className="px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold font-mono tracking-wide animate-pulse flex items-center gap-1">
                <AlertTriangle size={12} /> EMBARGO ACTIVE
              </span>
            )}
            {financials.pointsDeductionNextSeason > 0 && (
              <span className="px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold font-mono tracking-wide flex items-center gap-1">
                <AlertTriangle size={12} /> FFP DEDUCTION RISK
              </span>
            )}
          </div>
        </div>

        {/* EMBARGO / WARNING BULLETIN */}
        {(financials.activeEmbargo || financials.pointsDeductionNextSeason > 0) && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-300 leading-relaxed space-y-2">
            <h4 className="font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <AlertTriangle size={14} /> Club Regulatory Warning
            </h4>
            <p>
              {financials.activeEmbargo 
                ? "The regulatory authorities have placed this club under an active transfer registration ban due to sustained financial fair play breaches. The board will automatically veto any outward spending, player sign-ons, or major contract extensions until the reserve ledger is balanced."
                : "Continuous deficit spending has triggered severe Financial Fair Play reviews. A point reduction penalty (up to 12 points) is scheduled for implementation if the reserve ratio is not brought back under legal bounds before the season ends."}
            </p>
          </div>
        )}

        {/* REVENUE VS SPENDING SPREADSHEET */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* REVENUES */}
          <div className="premium-card p-6 rounded-xl border border-white/5">
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-400" />
              Weekly Operating Revenues
            </h4>
            <div className="space-y-3 font-mono text-xs text-zinc-300">
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-zinc-500 font-sans">Matchday Ingress (Tickets & Food)</span>
                <span>£{financials.revenue.matchday.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-zinc-500 font-sans">Broadcast Rights Yield</span>
                <span>£{financials.revenue.tvRights.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-zinc-500 font-sans">Sponsorships & Merchandise</span>
                <span>£{financials.revenue.sponsorship.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-zinc-500 font-sans">Transfer Amortization Yield</span>
                <span>£{financials.revenue.transferTrading.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 text-emerald-400 font-bold">
                <span className="font-sans">Total Weekly Revenue</span>
                <span>£{financials.revenue.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SPENDING */}
          <div className="premium-card p-6 rounded-xl border border-white/5">
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingDown size={14} className="text-red-400" />
              Weekly Operating Spending
            </h4>
            <div className="space-y-3 font-mono text-xs text-zinc-300">
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-zinc-500 font-sans">Squad & Staff Wages</span>
                <span>£{financials.spending.wages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-zinc-500 font-sans">Transfer Amortization Costs</span>
                <span>£{financials.spending.transfers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/5">
                <span className="text-zinc-500 font-sans">Stadium Upkeep & Youth Dev</span>
                <span>£{financials.spending.infrastructure.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 text-red-400 font-bold">
                <span className="font-sans">Total Weekly Spending</span>
                <span>£{financials.spending.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CASHFLOW, LEDGER RESERVES & FFP BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Net Weekly Cashflow</span>
            <span className={`text-xl font-black font-mono mt-1 ${netWeeklyFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netWeeklyFlow >= 0 ? '+' : ''}£{netWeeklyFlow.toLocaleString()}
            </span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Club Liquid Reserves</span>
            <span className="text-xl font-black font-mono mt-1 text-white">
              £{financials.cashReserves.toLocaleString()}
            </span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Accumulated Structural Debt</span>
            <span className="text-xl font-black font-mono mt-1 text-zinc-400">
              £{financials.debt.toLocaleString()}
            </span>
          </div>
        </div>

        {/* FINANCIAL FAIR PLAY MONITOR */}
        <div className="premium-card p-6 rounded-xl border border-white/5 space-y-4">
          <h4 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <Building2 size={14} className="text-sky-400" />
            Financial Fair Play (FFP) Monitor
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            UEFA and domestic governing bodies mandate that squad wage liabilities must not exceed <strong className="text-white">70%</strong> of total recurring operating revenues. Breaches can lead to active transfer bans, squad limits, or point penalties.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-500">Wage Liability Ratio</span>
              <span className={`font-bold ${wageLimitExceeded ? 'text-red-400' : 'text-emerald-400'}`}>
                {wageRatio}% {wageLimitExceeded ? '(VIOLATION - LIMIT 70%)' : '(COMPLIANT)'}
              </span>
            </div>
            <div className="h-3 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-500 ${wageLimitExceeded ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(100, wageRatio)}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-zinc-950/40 rounded-lg border border-white/5 text-xs">
              <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-mono mb-1">Contract Negotiation Wage Cap</span>
              <span className="text-sm font-black text-white font-mono">
                £{financials.wageCeiling.toLocaleString()}/w
              </span>
              <p className="text-[9px] text-zinc-500 mt-1">
                The boardroom blocks any personal contract extensions or incoming signings exceeding this limit.
              </p>
            </div>
            <div className="p-3 bg-zinc-950/40 rounded-lg border border-white/5 text-xs">
              <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-mono mb-1">Boardroom Transfer Allocation</span>
              <span className="text-sm font-black text-white font-mono">
                £{financials.transferBudget.toLocaleString()}
              </span>
              <p className="text-[9px] text-zinc-500 mt-1">
                Funds allocated for the purchase of new players during the active transfer window.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  })()}

  {activeTab === 'OVERVIEW' && (
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
   <div className="premium-card p-6 rounded-xl">
    <h3 className="text-white text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2">
    <TrendingUp size={16} className="text-emerald-500" />
    Revenue Breakdown (Weekly)
    </h3>
    <div className="space-y-4">
    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10/50">
     <span className="text-white/50">Professional Club Wage</span>
     <span className="text-white font-mono font-bold">£{p.contract.wage.toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10/50">
     <span className="text-white/50 flex flex-col sm:flex-row sm:items-center gap-1.5">
      <GlossaryTooltip term="World Reputation">World Reputation Sponsorship</GlossaryTooltip>
      {p.mediaPerception >= 70 && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Media Darling (+25%)</span>}
      {p.mediaPerception <= 40 && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Tabloid Target (-25%)</span>}
     </span>
     <span className="text-white font-mono">£{sponsorIncome.toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10/50">
     <span className="text-white/50">Signed Ambassador Deals</span>
     <span className="text-white font-mono font-bold">£{customSponsorIncome.toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10/50">
     <span className="text-white/50">Real Estate Rent Passive Yields</span>
     <span className="text-white font-mono font-bold">£{propertyRentalYield.toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-xs pt-4 font-bold">
     <span className="text-emerald-400 uppercase tracking-widest text-[10px]">Gross Weekly Income</span>
     <span className="text-emerald-400 font-mono text-sm">£{totalIncome.toLocaleString()}</span>
    </div>
    </div>
   </div>

   <div className="premium-card p-6 rounded-xl">
    <h3 className="text-white text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2">
    <TrendingDown size={16} className="text-red-500" />
    Expenses Breakdown (Weekly)
    </h3>
    <div className="space-y-4">
    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10/50">
     <span className="text-white/50">Housing Maintenance / Upkeep ({p.lifestyleTier.housing})</span>
     <span className="text-white font-mono">£{(p.finances?.expenses?.housing || 0).toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10/50">
     <span className="text-white/50">Physio, Gym, & Diet Coaching ({p.lifestyleTier?.training || 'Standard'})</span>
     <span className="text-white font-mono">£{(p.finances?.expenses?.training || 0).toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10/50">
     <span className="text-white/50">PR & Public Relations Outgoings ({p.lifestyleTier?.image || 'Standard'})</span>
     <span className="text-white font-mono">£{(p.finances?.expenses?.lifestyle || 0).toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10/50">
     <span className="text-white/50">Family Allowances / Support</span>
     <span className="text-white font-mono">£{(p.finances?.expenses?.family || 0).toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center text-xs pt-4 font-bold">
     <span className="text-red-400 uppercase tracking-widest text-[10px]">Gross Weekly Expenses</span>
     <span className="text-red-400 font-mono text-sm">£{totalExpenses.toLocaleString()}</span>
    </div>
    </div>
   </div>
   </div>
  )}

  {activeTab === 'SPONSORS' && (
   <div className="space-y-4">
   <div className="glass-panel p-4 rounded-xl text-xs text-white/50 flex items-center justify-between mb-4">
    <span>Your current World Reputation: <strong className="text-white ml-1">{p.reputation.world}%</strong></span>
    <span>Available Sponsorship slots: <strong className="text-white ml-1">Unlimited (Reputation locked)</strong></span>
   </div>

   <div className="flex flex-nowrap md:grid md:grid-cols-2 gap-4 overflow-x-auto pb-4 scrollbar-thin select-none">
    {sponsorDealsDb.map((deal) => {
    const isSignedBase = signedSponsors.includes(deal.id);
    const isSignedImproved = signedSponsors.includes(deal.id + '_IMPROVED');
    const isSigned = isSignedBase || isSignedImproved;
    const canSign = p.reputation.world >= deal.reqRep;
    
    return (
     <div key={deal.id} className={`min-w-[280px] md:min-w-0 p-5 border rounded-xl flex flex-col justify-between ${isSigned ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-white/10 premium-card'}`}>
     <div>
      <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{deal.icon}</span>
      {isSigned ? (
       <span className="text-[8px] font-bold text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/5">
       {isSignedImproved ? 'ACTIVE DEAL (IMPROVED)' : 'ACTIVE DEAL'}
       </span>
      ) : (
       <span className="text-[8px] font-bold text-white/40 px-2 py-0.5 rounded">AVAILABLE</span>
      )}
      </div>
      <h4 className="text-white font-black text-sm uppercase tracking-wide">{deal.name}</h4>
      <p className="text-emerald-400 font-bold font-mono mt-1 text-xs">+£{(deal.payout * (isSignedImproved ? 1.25 : 1)).toLocaleString()} / week</p>
      <p className="text-white/50 text-[10px] font-mono mt-2 uppercase">{deal.clause}</p>
     </div>

     <div className="mt-6 pt-4 border-t border-white/10/60 flex items-center justify-between">
      <span className="text-[9px] uppercase font-bold text-[#555]">Req Rep: {deal.reqRep}%</span>
      {isSigned ? (
      <button
       onClick={() => terminateSponsorDeal(deal.id)}
       className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded text-[10px] font-bold uppercase transition-colors"
      >
       Cancel Deal
      </button>
      ) : (
      <button
       onClick={() => {
         setNegotiatingDealId(deal.id);
         setNegotiationResult('PENDING');
         setNegotiationStage('INTRO');
         setNegotiationRound(1);
         setBrandImpatience(15);
         setCurrentOfferedWage(deal.payout);
         setTargetWageInput(deal.payout);
         setSelectedExclusivity(false);
         setSelectedSocialMedia(false);
         setSelectedMorality(false);
         setNegotiationHistory([
           { sender: 'BRAND', text: `Welcome. We are excited about the prospect of partnering with you. Our base offer is £${deal.payout.toLocaleString()}/w. What are your terms?` }
         ]);
       }}
       disabled={!canSign}
       className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${canSign ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-transparent text-[#444] cursor-not-allowed'}`}
      >
       {canSign ? 'Review Offer' : 'Locked'}
      </button>
      )}
     </div>
     </div>
    );
    })}
   </div>
   </div>
  )}

  {activeTab === 'INVESTMENTS' && (
   <div className="space-y-6">
   {/* REAL ESTATE */}
   <div className="premium-card p-6 rounded-xl">
    <h3 className="text-white text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
    <Building2 size={16} className="text-emerald-500" />
    Physical Property Acquisitions
    </h3>
    <div className="flex flex-nowrap md:grid md:grid-cols-2 gap-4 overflow-x-auto pb-4 scrollbar-thin select-none">
    {propertiesDb.map(prop => {
      const lock = getPropLock(prop.id);
     const owned = ownedProperties.find((o: any) => o.id === prop.id);
     const qty = owned ? owned.qty : 0;
     const totalYield = owned ? owned.yield : 0;

     return (
     <div key={prop.id} className={`min-w-[280px] md:min-w-0 p-4 rounded-lg flex flex-col justify-between transition-all duration-300 ${lock.locked ? 'opacity-40 bg-[#080808] border border-white/5 text-white/30' : 'bg-[#0a0a0a]'}`}>
      <div>
      <div className="flex justify-between items-center mb-1">
       <h4 className="text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1">{prop.name} {lock.locked && <span className="text-red-400">🔒</span>}</h4>
       {qty > 0 && <span className="bg-emerald-500 text-black font-mono font-bold text-[9px] px-1.5 py-0.5 rounded">OWNED: {qty}</span>}
      </div>
      {lock.locked ? (
        <p className="text-red-400 text-[10px] font-mono font-bold uppercase mt-2">
         LOCKED — Req: {lock.reason}
        </p>
       ) : (
        <p className="text-white/50 text-[10px] leading-relaxed font-mono mt-1">{prop.desc}</p>
       )}
      <div className="grid grid-cols-2 gap-2 font-mono text-[10px] mt-3">
       <div className="bg-[#141414] p-2 rounded">
       <span className="text-[#555] block">Purchase Cost</span>
       <span className="text-white font-bold">£{prop.cost.toLocaleString()}</span>
       </div>
       <div className="bg-[#141414] p-2 rounded">
       <span className="text-[#555] block">Weekly Passive Yield</span>
       <span className="text-emerald-400 font-bold">+£{prop.yield.toLocaleString()}</span>
       </div>
      </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10/50 flex gap-2 justify-end">
      {qty > 0 && (
       <button
       onClick={() => sellProperty(prop.id)}
       className="px-3 py-1 bg-red-950/60 border border-red-500/30 text-red-400 rounded text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-colors"
       >
       Sell 1 Unit
       </button>
      )}
      {lock.locked ? (
       <span className="px-3 py-1 bg-white/5 text-white/30 rounded text-[10px] font-bold uppercase cursor-not-allowed">
        Locked 🔒
       </span>
      ) : (
       <button
        onClick={() => buyProperty(prop.id, prop.cost, prop.yield, prop.name)}
        className="px-4 py-1 bg-emerald-500 text-black rounded text-[10px] font-bold uppercase hover:bg-emerald-400 transition-colors"
       >
        Acquire Unit
       </button>
      )}
      </div>
     </div>
     );
    })}
    </div>
   </div>

   {/* STARTUPS & ANGEL ROUNDS */}
   <div className="premium-card p-6 rounded-xl">
    <h3 className="text-white text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
    <Briefcase size={16} className="text-cyan-500" />
    Venture Capital Seed Rounds
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {startupsDb.map(start => {
      const lock = getStartupLock(start.id);
     const activeArr = investments.startups || [];
     const active = activeArr.find((s: any) => s.id === start.id);

     return (
     <div key={start.id} className={`p-4 rounded-lg flex flex-col justify-between transition-all duration-300 ${lock.locked ? 'opacity-40 bg-[#080808] border border-white/5 text-white/30' : 'bg-[#0a0a0a]'}`}>
      <div>
      <div className="flex justify-between items-start mb-1">
       <h4 className="text-white font-bold text-xs uppercase tracking-wide truncate max-w-[120px] flex items-center gap-1">{start.name} {lock.locked && <span className="text-red-400">🔒</span>}</h4>
       {active ? (
       <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[8px] px-1.5 py-0.5 rounded">{active.stage}</span>
       ) : (
       <span className="bg-white/10 text-white/40 font-mono text-[8px] px-1.5 py-0.5 rounded">AVAILABLE</span>
       )}
      </div>
      {lock.locked ? (
        <p className="text-red-400 text-[10px] font-mono font-bold uppercase mt-2">
         LOCKED — Req: {lock.reason}
        </p>
       ) : (
        <p className="text-white/50 text-[10px] leading-relaxed mt-1">{start.desc}</p>
       )}
      {active && (
       <div className="bg-[#141414] p-2 rounded font-mono text-[10px] mt-4">
       <span className="text-[#555] block">Your Equity Valuation</span>
       <span className="text-cyan-400 font-bold">£{active.val.toLocaleString()}</span>
       </div>
      )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10/50 flex justify-between items-center">
      <span className="text-white text-[10px] font-mono font-bold">Cost: £{start.defaultCost.toLocaleString()}</span>
      {!active && (
       lock.locked ? (
        <span className="px-3 py-1 bg-white/5 text-white/30 rounded text-[10px] font-bold uppercase cursor-not-allowed">
         Locked 🔒
        </span>
       ) : (
        <button
        onClick={() => investInStartup(start.id, start.name, start.defaultCost)}
        className="px-3 py-1 bg-cyan-500 text-black rounded text-[10px] font-bold uppercase hover:bg-cyan-400 transition-colors"
        >
        Invest Seed
        </button>
       )
      )}
      </div>
     </div>
     );
    })}
    </div>
   </div>

   {/* CRYPTO CURRENCY TRADING */}
   <div className="premium-card p-6 rounded-xl">
    {(() => {
     const cryptoLock = checkAssetLock(p, 'shiba_crypto');
     if (cryptoLock.locked) {
      return (
       <div className="text-center py-6">
        <Coins size={36} className="text-white/20 mx-auto mb-3" />
        <h3 className="text-white text-sm font-black uppercase tracking-wider mb-2">ShibaFC Cryptocoin Exchange</h3>
        <p className="text-red-400 font-mono text-xs font-bold uppercase">{cryptoLock.reason}</p>
       </div>
      );
     }
     return (
      <>
       <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
       <h3 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
     <Coins size={16} className="text-yellow-500 animate-pulse" />
     ShibaFC Cryptocoin Exchange
    </h3>
    <span className="text-xs font-mono bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2.5 py-1 rounded">
     Live Price: £{cryptoPrice.toFixed(2)} / coin
    </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-[#0a0a0a] p-4 rounded-lg">
     <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">My Holdings</h4>
     <div className="space-y-2 font-mono text-xs">
     <div className="flex justify-between">
      <span className="text-white/40">Coins Owned:</span>
      <span className="text-white font-bold">{(investments.shibaFc?.tokens || 0).toLocaleString()} coins</span>
     </div>
     <div className="flex justify-between">
      <span className="text-white/40">Average Purchase Price:</span>
      <span className="text-white">£{(investments.shibaFc?.avgPrice || 0).toFixed(2)}</span>
     </div>
     <div className="flex justify-between">
      <span className="text-white/40">Market Valuation:</span>
      <span className="text-emerald-400 font-bold">£{cryptoValue.toLocaleString()}</span>
     </div>
     </div>
    </div>

    <div className="bg-[#0a0a0a] p-4 rounded-lg flex flex-col justify-between">
     <div>
     <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest block mb-2">Trade Quantity</span>
     <input 
      type="number" 
      value={cryptoTradeQty} 
      onChange={(e) => setCryptoTradeQty(Math.max(1, parseInt(e.target.value) || 0))}
      className="w-full bg-[#141414] text-white p-2 rounded text-xs font-mono mb-4 text-center"
     />
     </div>

     <div className="flex gap-2 font-mono">
     <button
      onClick={() => sellShibaFc(cryptoTradeQty)}
      className="flex-1 py-2 bg-red-950/60 border border-red-500/30 text-red-400 rounded text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-colors"
     >
      Sell Coins
     </button>
     <button
      onClick={() => buyShibaFc(cryptoTradeQty)}
      className="flex-1 py-2 bg-emerald-500 text-black rounded text-xs font-bold uppercase hover:bg-emerald-400 transition-colors"
     >
      Buy Coins
     </button>
     </div>
    </div>
    </div>
   </>
  );
 })()}
   </div>
   </div>
  )}

  {activeTab === 'EMPIRE' && (
   <div className="space-y-6">
   {!p.financialEmpire ? (
    <div className="premium-card rounded-xl p-8 text-center max-w-xl mx-auto">
    <Globe size={48} className="text-[#333] mx-auto mb-4" />
    <h3 className="text-white text-lg font-black uppercase tracking-wider mb-2">Establish Wealth Advisor Office</h3>
    <p className="text-white/50 text-xs font-mono leading-relaxed mb-6 uppercase">
     Take your wealth management to the next level. Unlocking the Global Wealth Advisory allows you to invest massive capital into mutual index funds, purchase entire local commercial franchises, and maintain institutional assets.
    </p>
    <button
     onClick={establishFinancialEmpire}
      disabled={getEmpireLock().locked}
     className={`px-8 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${getEmpireLock().locked ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/10'}`}
    >
     {getEmpireLock().locked ? `Locked: ${getEmpireLock().reason} 🔒` : 'Establish Trust (Cost: £1,000,000)'}
    </button>
    </div>
   ) : (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Stocks & Indices */}
    <div className="premium-card p-6 rounded-xl">
     <h4 className="text-white text-md font-black uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
     <LineChart size={16} className="text-emerald-500" />
     Brokerage Stocks & Indices Portfolio
     </h4>
     <div className="space-y-4">
     <div className="bg-[#0a0a0a] p-4 rounded font-mono text-xs space-y-2">
      <div className="flex justify-between">
      <span className="text-white/40">Stocks Account Balance</span>
      <span className="text-white font-bold">£{p.financialEmpire.stocks.value.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
      <span className="text-white/40">Target Dividend Yield (Annual)</span>
      <span className="text-emerald-400 font-bold">{(p.financialEmpire.stocks.annualReturnRate * 100).toFixed(0)}%</span>
      </div>
     </div>

     <div className="grid grid-cols-2 gap-2">
      <button
      onClick={() => sellEmpireStocks(50000)}
      className="py-2.5 bg-red-950/40 border border-red-500/20 text-red-400 rounded text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-colors"
      >
      Liquidate £50k
      </button>
      <button
      onClick={() => buyEmpireStocks(50000)}
      className="py-2.5 bg-emerald-500 text-black rounded text-xs font-bold uppercase hover:bg-emerald-400 transition-colors"
      >
      Deposit £50k
      </button>
     </div>
     </div>
    </div>

    {/* Crypto coins Held */}
    <div className="premium-card p-6 rounded-xl">
     <h4 className="text-white text-md font-black uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
     <Coins size={16} className="text-yellow-500" />
     Advisory Crypto Assets
     </h4>
     <div className="bg-[#0a0a0a] p-4 rounded font-mono text-xs space-y-2">
     <div className="flex justify-between">
      <span className="text-white/40">Coins Held:</span>
      <span className="text-white font-bold">{(p.financialEmpire.crypto.coinsHeld).toLocaleString()} coins</span>
     </div>
     <div className="flex justify-between">
      <span className="text-white/40">Current Coin Price:</span>
      <span className="text-white">£{(p.financialEmpire.crypto.currentPrice).toFixed(2)}</span>
     </div>
     <div className="flex justify-between">
      <span className="text-white/40">Total Holding Value:</span>
      <span className="text-emerald-400 font-bold">£{p.financialEmpire.crypto.value.toLocaleString()}</span>
     </div>
     </div>
    </div>
    </div>
   )}
   </div>
  )}

  {activeTab === 'LIFESTYLE' && (
   <div className="animate-in fade-in zoom-in-95 duration-300">
    <div className="flex justify-between items-end mb-6">
     <div>
      <h3 className="text-white text-lg font-black uppercase tracking-wider mb-1">Lifestyle & Upgrades</h3>
      <p className="text-white/50 text-xs font-mono">Invest your wealth to gain permanent physiological and daily schedule benefits.</p>
     </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recovery Chamber */}
      <div className={`premium-card p-4 rounded-xl border flex flex-col justify-between ${apState.lifestyle?.recoveryChamber ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 bg-black/40'}`}>
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-bold text-sm uppercase">Cryo-Recovery Chamber</h4>
            {apState.lifestyle?.recoveryChamber && <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase border border-emerald-500/30">Owned</span>}
          </div>
          <p className="text-xs text-white/50 mb-4 line-clamp-2 font-mono">
            State-of-the-art home recovery suite. Increases daily fatigue recovery by +5%.
          </p>
        </div>
        <button
          onClick={() => {
            if (p.finances.balance >= 150000) {
              setPlayer({ ...p, finances: { ...p.finances, balance: p.finances.balance - 150000 } });
              toggleLifestyle('recoveryChamber');
              setNotification("Cryo-Recovery Chamber purchased! +5% daily fatigue recovery.");
            } else {
              setNotification("Insufficient funds.");
            }
          }}
          disabled={apState.lifestyle?.recoveryChamber || p.finances.balance < 150000}
          className={`w-full py-2.5 rounded text-xs font-bold uppercase transition-colors ${
            apState.lifestyle?.recoveryChamber 
              ? 'bg-emerald-500/20 text-emerald-500 cursor-not-allowed border border-emerald-500/20' 
              : p.finances.balance >= 150000
                ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-400 cursor-pointer shadow-lg shadow-fuchsia-500/20'
                : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
          }`}
        >
          {apState.lifestyle?.recoveryChamber ? 'Installed' : 'Purchase (£150,000)'}
        </button>
      </div>

      {/* Luxury Housing */}
      <div className={`premium-card p-4 rounded-xl border flex flex-col justify-between ${apState.lifestyle?.luxuryHousing ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 bg-black/40'}`}>
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-bold text-sm uppercase">Luxury Private Estate</h4>
            {apState.lifestyle?.luxuryHousing && <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase border border-emerald-500/30">Owned</span>}
          </div>
          <p className="text-xs text-white/50 mb-4 line-clamp-2 font-mono">
            An expansive, secluded mansion. The peace of mind and space grants +1 permanent Max AP.
          </p>
        </div>
        <button
          onClick={() => {
            if (p.finances.balance >= 2500000) {
              setPlayer({ ...p, finances: { ...p.finances, balance: p.finances.balance - 2500000 } });
              toggleLifestyle('luxuryHousing');
              setNotification("Luxury Private Estate purchased! +1 Max AP.");
            } else {
              setNotification("Insufficient funds.");
            }
          }}
          disabled={apState.lifestyle?.luxuryHousing || p.finances.balance < 2500000}
          className={`w-full py-2.5 rounded text-xs font-bold uppercase transition-colors ${
            apState.lifestyle?.luxuryHousing 
              ? 'bg-emerald-500/20 text-emerald-500 cursor-not-allowed border border-emerald-500/20' 
              : p.finances.balance >= 2500000
                ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-400 cursor-pointer shadow-lg shadow-fuchsia-500/20'
                : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
          }`}
        >
          {apState.lifestyle?.luxuryHousing ? 'Purchased' : 'Purchase (£2,500,000)'}
        </button>
      </div>
      
      {/* Private Jet */}
      <div className={`premium-card p-4 rounded-xl border flex flex-col justify-between ${apState.lifestyle?.privateJet ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 bg-black/40'}`}>
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-bold text-sm uppercase">Chartered Private Jet</h4>
            {apState.lifestyle?.privateJet && <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-black uppercase border border-emerald-500/30">Owned</span>}
          </div>
          <p className="text-xs text-white/50 mb-4 line-clamp-2 font-mono">
            Eliminates travel fatigue during away games and brand tours. Grants +1 permanent Max AP.
          </p>
        </div>
        <button
          onClick={() => {
            if (p.finances.balance >= 8000000) {
              setPlayer({ ...p, finances: { ...p.finances, balance: p.finances.balance - 8000000 } });
              toggleLifestyle('privateJet');
              setNotification("Chartered Private Jet purchased! +1 Max AP.");
            } else {
              setNotification("Insufficient funds.");
            }
          }}
          disabled={apState.lifestyle?.privateJet || p.finances.balance < 8000000}
          className={`w-full py-2.5 rounded text-xs font-bold uppercase transition-colors ${
            apState.lifestyle?.privateJet 
              ? 'bg-emerald-500/20 text-emerald-500 cursor-not-allowed border border-emerald-500/20' 
              : p.finances.balance >= 8000000
                ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-400 cursor-pointer shadow-lg shadow-fuchsia-500/20'
                : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
          }`}
        >
          {apState.lifestyle?.privateJet ? 'Purchased' : 'Purchase (£8,000,000)'}
        </button>
      </div>
    </div>
   </div>
  )}

  </div>

  {negotiatingDealId && (() => {
   const deal = sponsorDealsDb.find(d => d.id === negotiatingDealId);
   if (!deal) return null;

   const leverage = Math.min(100, Math.round(((p.reputation?.world || 10) * 0.5) + ((p.fans || 10) * 0.3) + ((p.mediaPerception || 50) * 0.2)));
   
   let clauseMultiplier = 1.0;
   if (selectedExclusivity) clauseMultiplier += 0.15;
   if (selectedSocialMedia) clauseMultiplier += 0.10;
   if (selectedMorality) clauseMultiplier += 0.10;

   const maxWilling = Math.round(deal.payout * (1 + (leverage / 100) * 0.5) * clauseMultiplier);

   const currentTarget = targetWageInput || currentOfferedWage || deal.payout;
   let acceptanceOdds = 100;
   if (currentTarget <= maxWilling) {
     const ratio = currentTarget / maxWilling;
     acceptanceOdds = Math.round(Math.max(15, 100 - (ratio * 45)));
   } else {
     const overDiff = currentTarget - maxWilling;
     const ratioOver = overDiff / maxWilling;
     acceptanceOdds = Math.round(Math.max(2, 50 - (ratioOver * 150)));
   }
   acceptanceOdds = Math.max(1, Math.round(acceptanceOdds * (1 - brandImpatience / 120)));

   const handleProposeCounter = () => {
     if (negotiationStage === 'INTRO') {
       setNegotiationStage('TALKING');
     }
     
     const nextRound = negotiationRound + 1;
     setNegotiationRound(nextRound);

     let impatienceIncrease = 15 + Math.floor(Math.random() * 15);
     if (currentTarget > maxWilling * 1.25) impatienceIncrease += 20;
     const nextImpatience = Math.min(100, brandImpatience + impatienceIncrease);
     setBrandImpatience(nextImpatience);

     const historyCopy = [...negotiationHistory];
     historyCopy.push({ sender: 'PLAYER', text: `I am countering with a weekly wage of £${currentTarget.toLocaleString()}/w. Let me know what you think.` });

     if (nextImpatience >= 100) {
       historyCopy.push({ sender: 'BRAND', text: `This negotiation is getting ridiculous. Your demands are entirely unreasonable and we are withdrawing our offer. Goodbye.` });
       setNegotiationHistory(historyCopy);
       setNegotiationStage('RESULT_FAILED');
       setNegotiationResult('FAILED');
       return;
     }

     const roll = Math.random() * 100;
     if (roll < acceptanceOdds) {
       historyCopy.push({ sender: 'BRAND', text: `We accept your terms! Having a player of your calibre represent us at £${currentTarget.toLocaleString()}/w is a fantastic fit. Let's make it official.` });
       setNegotiationHistory(historyCopy);
       setCurrentOfferedWage(currentTarget);
       setNegotiationStage('RESULT_SUCCESS');
       setNegotiationResult('IMPROVED');
     } else {
       const counterProportion = 0.82 + Math.random() * 0.13;
       let brandNewOffer = Math.round(Math.min(currentTarget * 0.9, maxWilling * counterProportion));
       brandNewOffer = Math.max(deal.payout, brandNewOffer);

       let responseText = "";
       if (currentTarget > maxWilling * 1.3) {
         responseText = `Are you joking? £${currentTarget.toLocaleString()}/w is outrageously high. We cannot offer more than £${brandNewOffer.toLocaleString()}/w. Our patience is wearing thin.`;
       } else {
         responseText = `We can't quite meet you at £${currentTarget.toLocaleString()}/w. However, we're willing to go up to £${brandNewOffer.toLocaleString()}/w as our final compromise.`;
       }

       historyCopy.push({ sender: 'BRAND', text: responseText });
       setNegotiationHistory(historyCopy);
       setCurrentOfferedWage(brandNewOffer);
       setTargetWageInput(brandNewOffer);
     }
   };

   const handleSignContract = () => {
     signSponsorDeal(deal.id, deal.reqRep, currentOfferedWage || deal.payout, selectedExclusivity, selectedSocialMedia, selectedMorality);
     setNegotiatingDealId(null);
   };

   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
    <div className="premium-card max-w-2xl w-full rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
     
     <div className="p-6 border-b border-white/5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="flex justify-between items-center">
       <div className="flex items-center gap-3">
        <span className="text-3xl p-2 bg-white/5 rounded-xl border border-white/10">{deal.icon}</span>
        <div>
         <h2 className="text-lg font-black uppercase tracking-wider text-white">{deal.name}</h2>
         <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Round {negotiationRound} of Negotiation</span>
        </div>
       </div>
       <button onClick={() => setNegotiatingDealId(null)} className="text-zinc-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full">✕</button>
      </div>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 bg-zinc-950/40">
      
      <div className="p-6 space-y-6 flex flex-col justify-between">
       <div>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 font-mono">Contract Parameters</h3>
        
        <div className="space-y-4">
         <div>
          <div className="flex justify-between items-center text-xs mb-1 font-mono">
           <span className="text-zinc-500 uppercase">Weekly Payout Demand</span>
           <span className="text-emerald-400 font-bold">£{(targetWageInput || deal.payout).toLocaleString()}</span>
          </div>
          <input 
           type="range" 
           min={Math.floor(deal.payout * 0.8)} 
           max={Math.floor(deal.payout * 2.0)} 
           step={Math.floor(deal.payout * 0.05) || 100}
           disabled={negotiationStage === 'RESULT_SUCCESS' || negotiationStage === 'RESULT_FAILED'}
           value={targetWageInput || deal.payout}
           onChange={(e) => setTargetWageInput(Number(e.target.value))}
           className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
           <span>MIN: £{Math.floor(deal.payout * 0.8).toLocaleString()}</span>
           <span>MAX: £{Math.floor(deal.payout * 2.0).toLocaleString()}</span>
          </div>
         </div>

         <div className="space-y-2 border-t border-white/5 pt-4">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Optional Clauses</span>
          
          <label className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
           <div className="flex flex-col">
            <span className="text-xs text-white font-bold">Exclusivity Clause</span>
            <span className="text-[9px] text-zinc-500">Block other shoe brands for a +15% pay boost</span>
           </div>
           <input 
            type="checkbox" 
            checked={selectedExclusivity} 
            disabled={negotiationStage === 'RESULT_SUCCESS' || negotiationStage === 'RESULT_FAILED'}
            onChange={(e) => {
              setSelectedExclusivity(e.target.checked);
              setTargetWageInput(prev => Math.round(prev * (e.target.checked ? 1.15 : 0.87)));
            }}
            className="accent-emerald-500"
           />
          </label>

          <label className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
           <div className="flex flex-col">
            <span className="text-xs text-white font-bold">Social Media Commitment</span>
            <span className="text-[9px] text-zinc-500 font-mono">Adds +10% pay, increases cancellation risk</span>
           </div>
           <input 
            type="checkbox" 
            checked={selectedSocialMedia} 
            disabled={negotiationStage === 'RESULT_SUCCESS' || negotiationStage === 'RESULT_FAILED'}
            onChange={(e) => {
              setSelectedSocialMedia(e.target.checked);
              setTargetWageInput(prev => Math.round(prev * (e.target.checked ? 1.10 : 0.91)));
            }}
            className="accent-emerald-500"
           />
          </label>

          <label className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
           <div className="flex flex-col">
            <span className="text-xs text-white font-bold">Morality Clause Safeguard</span>
            <span className="text-[9px] text-zinc-500">Risk termination on scandal for a +10% pay boost</span>
           </div>
           <input 
            type="checkbox" 
            checked={selectedMorality} 
            disabled={negotiationStage === 'RESULT_SUCCESS' || negotiationStage === 'RESULT_FAILED'}
            onChange={(e) => {
              setSelectedMorality(e.target.checked);
              setTargetWageInput(prev => Math.round(prev * (e.target.checked ? 1.10 : 0.91)));
            }}
            className="accent-emerald-500"
           />
          </label>
         </div>
        </div>
       </div>

       <div className="space-y-4 border-t border-white/5 pt-4">
        <div>
         <div className="flex justify-between text-xs mb-1 font-mono">
          <span className="text-zinc-500">Brand Impatience</span>
          <span className={`${brandImpatience > 70 ? 'text-red-400 font-bold' : brandImpatience > 40 ? 'text-amber-400' : 'text-zinc-400'}`}>{brandImpatience}%</span>
         </div>
         <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
          <div className={`h-full transition-all duration-500 ${brandImpatience > 70 ? 'bg-red-500' : brandImpatience > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${brandImpatience}%` }} />
         </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
         <div className="glass-panel p-3 rounded-lg border border-white/5">
          <span className="block text-[9px] text-zinc-500 uppercase font-mono mb-1">Leverage Power</span>
          <span className="text-lg font-black text-white font-mono">{leverage}%</span>
         </div>
         <div className="glass-panel p-3 rounded-lg border border-white/5">
          <span className="block text-[9px] text-zinc-500 uppercase font-mono mb-1">Acceptance Odds</span>
          <span className="text-lg font-black text-emerald-400 font-mono">{negotiationStage.startsWith('RESULT') ? '—' : `${acceptanceOdds}%`}</span>
         </div>
        </div>
       </div>
      </div>

      <div className="p-6 flex flex-col justify-between h-[450px]">
       <div>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 font-mono">Corporate Boardroom</h3>
        
        <div className="h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
         {negotiationHistory.map((item, index) => (
          <div key={index} className={`flex flex-col ${item.sender === 'PLAYER' ? 'items-end' : 'items-start'}`}>
           <span className="text-[8px] uppercase tracking-wider text-zinc-600 mb-1 font-mono">{item.sender === 'PLAYER' ? 'You' : 'Brand Executive'}</span>
           <div className={`p-3 rounded-xl max-w-[85%] text-xs font-sans leading-relaxed ${item.sender === 'PLAYER' ? 'bg-emerald-500/10 text-white border border-emerald-500/20 rounded-tr-none' : 'bg-zinc-900 text-zinc-300 border border-white/5 rounded-tl-none'}`}>
            {item.text}
           </div>
          </div>
         ))}
        </div>
       </div>

       <div className="pt-4 border-t border-white/5 flex gap-2">
        {negotiationStage === 'INTRO' || negotiationStage === 'TALKING' ? (
         <>
          <button 
           onClick={() => setNegotiatingDealId(null)} 
           className="flex-1 py-2.5 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
          >
           Walk Away
          </button>
          <button 
           onClick={handleProposeCounter} 
           className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
           Propose Counter
          </button>
         </>
        ) : negotiationStage === 'RESULT_SUCCESS' ? (
         <button 
          onClick={handleSignContract} 
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
         >
          Sign Contract (£{currentTarget.toLocaleString()}/w)
         </button>
        ) : (
         <button 
          onClick={() => setNegotiatingDealId(null)} 
          className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
         >
          Leave Meeting (Withdrawn)
         </button>
        )}
       </div>
      </div>

     </div>

    </div>
    </div>
   );
  })()}
 </div>
 );
}

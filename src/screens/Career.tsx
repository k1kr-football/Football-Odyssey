import React, { useState, useMemo } from 'react';
import { useGame } from '../store/GameContext';
import { Globe, Users, ShieldAlert, Sparkles, Send, Award, Heart, MessageSquare, Repeat, Activity, Compass, HelpCircle, Info, ShieldCheck, ChevronRight, Trophy, Search } from 'lucide-react';
import { TeamLogo } from '../components/TeamLogo';
import { CLUBS } from '../data/teams';
import { GlossaryTooltip } from '../components/GlossaryTooltip';
import { RITUALS } from '../utils/matchdayRituals';
import { REPUTATION_TAGS, getReputationTags, getTagName } from '../utils/reputation';
import { queryDecisionMemory, deriveRelationshipMap } from '../utils/decisionMemory';
import { MEDIA_BRAND_ACTIVITIES, executeMediaBrandActivity } from '../utils/personalBrand';
import { generateAcademyProspects, guideAcademyProspect, AcademyProspect } from '../utils/academyLegacy';

export function Career() {
 const { state, setPlayer, setInbox } = useGame();
 const player = state.player;
 if (!player) return null;
 const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REPUTATION' | 'SOCIAL' | 'TIMELINE' | 'INTERNATIONAL' | 'LEGACY_AGENT' | 'DECISIONS'>('OVERVIEW');
 const [postingStatus, setPostingStatus] = useState<string | null>(null);
 const [agentSuccess, setAgentSuccess] = useState<string | null>(null);

 // Reputation Simulator State
 const [selectedPersona, setSelectedPersona] = useState<'SILENT' | 'REBEL' | 'PR_STAR'>('SILENT');
 const [simLog, setSimLog] = useState<string[]>([]);
 const [simProgress, setSimProgress] = useState<number>(0);
 const [simulating, setSimulating] = useState<boolean>(false);
 const [simResults, setSimResults] = useState<{
  worldRep: number;
  mediaPercep: number;
  peerRespect: number;
  scoutingStatus: string;
  sponsorStatus: string;
 } | null>(null);

 const groupStandings = useMemo(() => {
  const capVal = player?.stats?.caps || 0;
  const played = Math.min(10, Math.floor(capVal / 2) || 4);
  
  const heroSymbol = player?.nationality?.slice(0, 3).toUpperCase() || 'ENG';
  const heroName = player?.nationality || 'England';

  const rawTeams = [
   { name: 'France', symbol: 'FRA', wRatio: 0.8, dRatio: 0.1, gfAvg: 2.2, gaAvg: 0.6, isHero: heroSymbol === 'FRA' },
   { name: 'Germany', symbol: 'GER', wRatio: 0.7, dRatio: 0.2, gfAvg: 2.0, gaAvg: 0.8, isHero: heroSymbol === 'GER' },
   { name: heroName, symbol: heroSymbol, wRatio: 0.6, dRatio: 0.2, gfAvg: 1.8, gaAvg: 0.9, isHero: heroSymbol !== 'FRA' && heroSymbol !== 'GER' && heroSymbol !== 'ESP' && heroSymbol !== 'ITA' && heroSymbol !== 'NED' },
   { name: 'Spain', symbol: 'ESP', wRatio: 0.5, dRatio: 0.3, gfAvg: 1.6, gaAvg: 1.0, isHero: heroSymbol === 'ESP' },
   { name: 'Italy', symbol: 'ITA', wRatio: 0.4, dRatio: 0.3, gfAvg: 1.2, gaAvg: 1.1, isHero: heroSymbol === 'ITA' },
   { name: 'Netherlands', symbol: 'NED', wRatio: 0.3, dRatio: 0.3, gfAvg: 1.1, gaAvg: 1.5, isHero: heroSymbol === 'NED' }
  ];

  return rawTeams.map(t => {
   const w = Math.max(0, Math.floor(played * t.wRatio));
   const d = Math.max(0, Math.floor(played * t.dRatio));
   const l = Math.max(0, played - w - d);
   const gf = Math.floor(played * t.gfAvg);
   const ga = Math.floor(played * t.gaAvg);
   const gd = gf - ga;
   const pts = w * 3 + d;
   return { ...t, p: played, w, d, l, gf, ga, gd, pts };
  }).sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.gd - a.gd);
 }, [player?.stats?.caps, player?.nationality]);

 const transferCount = useMemo(() => {
  if (!player?.timeline) return 0;
  return player.timeline.filter(e => e.type === 'TRANSFER').length;
 }, [player?.timeline]);

 // Compatibility dummies for removed Transfer Hub (moved to Transfers screen)
 const handleRejectOffer = (id: string) => {};
 const handleNegotiateOption = (id: string, action: string) => {};
 const handleTransferRequest = () => {};
 const negotiatingOffer = null;
 const setNegotiatingOffer = (val: any) => {};

 if (!player) return null;

 // Defensive Initializations for Social Media featuress
 const social = player.socialMedia || { followers: 1200, cancelRisk: 5 };
 const openThreads = player.stateFlags?.openThreads || {};
 const activePosts = openThreads.posts || [
 {
  id: 'post_init',
  text: "Hard work continues. The journey is long but the focus is absolute. Let's get the three points this weekend! ⚽🔴",
  type: 'GRIND',
  likes: '1.2K',
  retweets: '142',
  comments: [
  { handle: '@GafferFanatic', text: 'This is the attitude we need in this club!' },
  { handle: '@SpeedDeon', text: 'Are we starting Saturday? We need you!' }
  ]
 }
 ];

 const handleCreatePost = (postType: 'GRIND' | 'FLEX' | 'ENGAGE' | 'SOLIDARITY') => {
 let text = "";
 let fatigueCost = 0;
 let moraleCost = 0;
 let followersGain = 0;
 let cancelRiskChange = 0;
 let managerTrustChange = 0;
 let teammatesRelChange = 0;
 let fansRelChange = 0;

 const formRating = player.form || 6.5;

 switch (postType) {
  case 'GRIND':
  text = "No shortcuts. Triple training sessions locked in. Drip sweating for the badge. See you under the lights. 💪🏃‍♂️🔥 #NeverSatisfied";
  fatigueCost = 10;
  moraleCost = -5; // Fatigue takes toll
  followersGain = Math.floor(5000 + Math.random() * 8000);
  cancelRiskChange = -4; // Fans respect the grind
  managerTrustChange = 4;
  teammatesRelChange = 3;
  fansRelChange = 3;
  break;
  case 'FLEX':
  text = "Hard work pays off. Custom wrap finished on the new V12 twin-turbo. Off to training in style! 🏎️✨💎 #Blessed #Lifestyle #LevelUp";
  fatigueCost = 0;
  moraleCost = 15; // Flexing feels good
  followersGain = Math.floor(20000 + Math.random() * 25000);
  cancelRiskChange = 6; // Arrogance triggers critics
  managerTrustChange = -2;
  teammatesRelChange = -4; // Locker room jealousy
  fansRelChange = 6;
  break;
  case 'ENGAGE':
  text = "Direct Q&A session with the fans! Drop your burning questions below. Unfiltered replies coming in hot. 💬🎙️🔥 #AskMeAnything";
  fatigueCost = 5;
  moraleCost = 5;
  followersGain = Math.floor(10000 + Math.random() * 12000);
  cancelRiskChange = 12; // Unfiltered replies increase blunder risk!
  managerTrustChange = 0;
  teammatesRelChange = 1;
  fansRelChange = 10;
  break;
  case 'SOLIDARITY':
  text = "Incredible tactical briefing today. The Boss has a masterplan and we are 100% aligned. We fight for this badge, together. 🤝🛡️🔴 #SquadGoals #ClubUnity";
  fatigueCost = 0;
  moraleCost = 0;
  followersGain = Math.floor(4000 + Math.random() * 5000);
  cancelRiskChange = -2;
  managerTrustChange = 8;
  teammatesRelChange = 2;
  fansRelChange = -2; // Some plastic fans say you are sucking up
  break;
 }

 // Check if player has enough fatigue / stats to do this
 if (player.fatigue + fatigueCost > 100) {
  setPostingStatus("Too exhausted to engage in social PR campaigns. Focus on rest!");
  setTimeout(() => setPostingStatus(null), 3000);
  return;
 }

 // Generate dynamic comments based on post type and player form
 let commentsList = [];
 if (formRating >= 7.5) {
  commentsList.push({ handle: '@GoonerElite', text: 'Unbelievable performance recently, you deserve everything!' });
  commentsList.push({ handle: '@Fanatic_FC', text: 'Best player in the club right now! Sign him for life!' });
 } else if (formRating < 6.0) {
  commentsList.push({ handle: '@TacticalSteve', text: 'Maybe focus more on your passing accuracy on matchday instead of this...' });
  commentsList.push({ handle: '@Hater_Slayer', text: 'Absolute fraud. Bench him immediately, gaffer!' });
 } else {
  commentsList.push({ handle: '@SunderlandTid', text: 'Decent work, keep working hard.' });
  commentsList.push({ handle: '@BallerWatch', text: 'Elite potential. We see you!' });
 }

 if (postType === 'FLEX') {
  commentsList.push({ handle: '@Jealous_FC', text: 'How about spending less on supercars and more on scoring goals? 🤡' });
  commentsList.push({ handle: '@HyperDrive', text: 'Absolute beast of a machine! What is the top speed?!' });
 } else if (postType === 'ENGAGE') {
  commentsList.push({ handle: '@TrollPatrol', text: 'Are you planning to transfer in January? Give us a straight answer!' });
  commentsList.push({ handle: '@Wazza_M', text: 'Who is the funniest player in the dressing room?' });
 } else if (postType === 'SOLIDARITY') {
  commentsList.push({ handle: '@TacticianFC', text: 'Good to see alignment. Tactical stability is key.' });
 }

 const newPost = {
  id: `post_${Date.now()}`,
  text,
  type: postType,
  likes: (Math.floor(5000 + Math.random() * 15000) / 1000).toFixed(1) + 'K',
  retweets: Math.floor(200 + Math.random() * 800).toString(),
  comments: commentsList
 };

 const nextFollowers = Math.max(0, social.followers + followersGain);
 const nextCancelRisk = Math.min(100, Math.max(0, social.cancelRisk + cancelRiskChange));

 // Update player state with new social attributes and relationship changes
 const updatedPlayer = {
  ...player,
  fatigue: Math.min(100, player.fatigue + fatigueCost),
  morale: Math.min(100, Math.max(0, player.morale + moraleCost)),
  trust: Math.min(100, Math.max(0, player.trust + managerTrustChange)),
  relationships: {
   manager: player.relationships?.manager ?? 50,
   manager_discipline: player.relationships?.manager_discipline ?? 50,
   agent: player.relationships?.agent ?? 50,
   ...player.relationships,
   teammates: Math.min(100, Math.max(0, (player.relationships?.teammates ?? 50) + teammatesRelChange)),
   family: player.relationships?.family ?? 75
  },
  fans: Math.min(100, Math.max(0, player.fans + fansRelChange)),
  socialMedia: {
  followers: nextFollowers,
  cancelRisk: nextCancelRisk
  },
  stateFlags: {
  ...player.stateFlags,
  openThreads: {
   ...openThreads,
   posts: [newPost, ...activePosts.slice(0, 5)] // Limit history
  }
  }
 };

 setPlayer(updatedPlayer);
 setPostingStatus(`Post published! +${followersGain.toLocaleString()} Followers, stats adjusted.`);
 setTimeout(() => setPostingStatus(null), 3500);
 };

 const handleSimulateSeason = () => {
  if (simulating) return;
  setSimulating(true);
  setSimProgress(1);
  setSimLog(["Season started. Initial state: World Rep: 20%, Media Perception: 50%, Peer Respect: 50%."]);
  setSimResults(null);
  
  let wr = 20;
  let mp = 50;
  let pr = 50;
  let logs = ["Season started. Initial state: World Rep: 20%, Media Perception: 50%, Peer Respect: 50%."];
  
  let game = 1;
  const interval = setInterval(() => {
   if (game <= 5) {
    const stepPct = game * 20;
    setSimProgress(stepPct);
    
    if (selectedPersona === 'SILENT') {
     wr = Math.min(100, wr + 4 + Math.floor(Math.random() * 3));
     mp = Math.min(100, mp + 3 + Math.floor(Math.random() * 3));
     pr = Math.min(100, pr + 6 + Math.floor(Math.random() * 2));
     logs.push(`Week ${game * 7}: Consistent performance on pitch. Polite, respectful post-match press conference. Teammates trust grows (+6), World Rep increases (+4).`);
    } else if (selectedPersona === 'REBEL') {
     wr = Math.min(100, wr + 12 + Math.floor(Math.random() * 3));
     mp = Math.max(0, mp - 8 - Math.floor(Math.random() * 2));
     pr = Math.max(0, pr - 7 - Math.floor(Math.random() * 3));
     logs.push(`Week ${game * 7}: Scored a dramatic derby winner but slammed squad tactics to reporters! Tabloids go wild. World fame surges (+12), but Media relations (-8) and Peer Respect (-7) plummet.`);
    } else {
     wr = Math.min(100, wr + 8 + Math.floor(Math.random() * 3));
     mp = Math.min(100, mp + 7 + Math.floor(Math.random() * 2));
     pr = Math.max(0, pr - 2 - Math.floor(Math.random() * 2));
     logs.push(`Week ${game * 7}: Red carpet endorsement gala appearance. Sponsors declare you a lifestyle icon. World Rep (+8) and Media Perception (+7) rise, but teammate relation (-2) slightly decays.`);
    }
    
    setSimLog([...logs]);
    game++;
   } else {
    clearInterval(interval);
    setSimulating(false);
    setSimProgress(100);
    
    let scouting = "";
    let sponsor = "";
    
    if (selectedPersona === 'SILENT') {
     scouting = "🟢 ELITE MOVE UNLOCKED (Tier 1 & 2): Chief scouts praise your 'unmatched dressing room discipline'. High-profile clubs are framing formal bids.";
     sponsor = "🟡 MODERATE OFFERS: Signed ThreeStripes. However, luxury sponsor LuxoChrono bypassed you due to low global publicity buzz.";
    } else if (selectedPersona === 'REBEL') {
     scouting = "🔴 REPUTATION GAP GATING: Gated from Tier 1 Elite transfer moves. Agents report that Champions League clubs are wary of 'toxic dressing room friction'.";
     sponsor = "🟢 MASSIVE MAINSTREAM CASH: Unlocked ApexHypercars. However, VictorySwoosh threatened to invoke character-conduct clauses and drop you.";
    } else {
     scouting = "🟡 MID-TIER INTEREST: Premier League Mid-Table interest unlocked. Scouts report you are a 'commercial superstar but have inconsistent tactical work ethic.'";
     sponsor = "🟢 PREMIUM AMBASSADOR DEALS: Signed LuxoChrono and GigaCougar. Commercial revenue maximized due to highly polished PR profile.";
    }
    
    setSimResults({
     worldRep: wr,
     mediaPercep: mp,
     peerRespect: pr,
     scoutingStatus: scouting,
     sponsorStatus: sponsor
    });
   }
  }, 800);
 };

 return (
 <div className="flex flex-col h-full gap-6">
  <div className="flex gap-4 border-b border-white/10 pb-4 shrink-0">
  <button 
   onClick={() => setActiveTab('OVERVIEW')}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-2 transition-colors ${activeTab === 'OVERVIEW' ? 'bg-[#00FF88] text-white' : 'text-white/50 hover:text-white'}`}
  >
   Overview
  </button>
  <button 
   onClick={() => setActiveTab('REPUTATION')}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-2 transition-colors ${activeTab === 'REPUTATION' ? 'bg-[#00FF88] text-white' : 'text-white/50 hover:text-white'}`}
  >
   Reputation & Perception
  </button>
  <button 
   onClick={() => setActiveTab('SOCIAL')}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-2 transition-colors ${activeTab === 'SOCIAL' ? 'bg-[#00FF88] text-white' : 'text-white/50 hover:text-white'}`}
  >
   Social PR Studio
  </button>
  <button 
   onClick={() => setActiveTab('TIMELINE')}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-2 transition-colors ${activeTab === 'TIMELINE' ? 'bg-[#00FF88] text-white' : 'text-white/50 hover:text-white'}`}
  >
   Career Timeline
  </button>
  <button 
   onClick={() => setActiveTab('INTERNATIONAL')}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-2 transition-colors ${activeTab === 'INTERNATIONAL' ? 'bg-[#00FF88] text-white' : 'text-white/50 hover:text-white'}`}
  >
   International Cup
  </button>
  <button 
   onClick={() => setActiveTab('LEGACY_AGENT')}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-2 transition-colors ${activeTab === 'LEGACY_AGENT' ? 'bg-[#00FF88] text-white' : 'text-white/50 hover:text-white'}`}
  >
   Legacy & Milestones
  </button>
  <button 
   onClick={() => setActiveTab('DECISIONS')}
   className={`text-xs font-bold tracking-widest uppercase px-6 py-2 transition-colors ${activeTab === 'DECISIONS' ? 'bg-[#00FF88] text-white' : 'text-white/50 hover:text-white'}`}
  >
   Decision Footprint
  </button>

  </div>

  {activeTab === 'DECISIONS' && (() => {
    // Local filter states
    const [significanceFilter, setSignificanceFilter] = useState<string>('ALL');
    const [systemFilter, setSystemFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Fetch decisions based on query
    const results = queryDecisionMemory(state, {
      minSignificance: significanceFilter === 'ALL' ? undefined : significanceFilter as any,
      system: systemFilter === 'ALL' ? undefined : systemFilter,
      npc: searchQuery || undefined
    });

    const relations = deriveRelationshipMap(state);

    return (
     <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar animate-fade-in font-sans text-white">
      {/* DYNAMIC NARRATIVE SUMMARY */}
      <div className="premium-card p-6 rounded-xl border border-white/5 bg-zinc-950/20">
       <h3 className="text-white text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2">
        <Users size={16} className="text-[#00FF88]" />
        Dressing Room & Boardroom Relations Summary
       </h3>
       <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
        Your choices shape how you are perceived by stakeholders inside and outside the club. Below is an automated synthesis derived from your active memory ledger:
       </p>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(relations).map(([key, item]: [string, any]) => {
         const relationColors = {
          'WARM': 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
          'CORDIAL': 'text-sky-400 border-sky-500/20 bg-sky-500/5',
          'SKEPTICAL': 'text-amber-400 border-amber-500/20 bg-amber-500/5',
          'CONFLICT': 'text-red-400 border-red-500/20 bg-red-500/5 animate-pulse'
         }[item.status as string] || 'text-zinc-400 border-white/5 bg-zinc-900/5';

         return (
          <div key={key} className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col justify-between space-y-3 bg-[#0a0a0a]/30">
           <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">{key.toUpperCase()}</span>
            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold font-mono tracking-wide ${relationColors}`}>
             {item.status}
            </span>
           </div>
           <p className="text-xs text-zinc-300 leading-relaxed font-sans">{item.summary}</p>
          </div>
         );
        })}
       </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="premium-card p-4 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3 bg-zinc-950/20">
       <div>
        <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1 font-mono">Significance Filter</label>
        <select
         value={significanceFilter}
         onChange={(e) => setSignificanceFilter(e.target.value)}
         className="w-full bg-[#0d0d0d] border border-white/10 rounded px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#00FF88]"
        >
         <option value="ALL">All Significance Levels</option>
         <option value="MINOR">Minor</option>
         <option value="MODERATE">Moderate</option>
         <option value="MAJOR">Major</option>
         <option value="DEFINING">Defining Choice</option>
        </select>
       </div>

       <div>
        <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1 font-mono">System Source</label>
        <select
         value={systemFilter}
         onChange={(e) => setSystemFilter(e.target.value)}
         className="w-full bg-[#0d0d0d] border border-white/10 rounded px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#00FF88]"
        >
         <option value="ALL">All Sources</option>
         <option value="Cutscene">Story Cutscenes</option>
         <option value="Calendar Event">Calendar Events</option>
         <option value="Transfer Request">Transfer Negotiations</option>
         <option value="Player Council">Player Council / Rumbles</option>
        </select>
       </div>

       <div>
        <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1 font-mono">Keyword Search</label>
        <div className="relative">
         <input
          type="text"
          placeholder="Search choices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0d0d0d] border border-white/10 rounded pl-8 pr-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#00FF88]"
         />
         <Search size={12} className="absolute left-2.5 top-3 text-zinc-500" />
        </div>
       </div>
      </div>

      {/* CHRONOLOGICAL DECISION LEDGER */}
      <div className="premium-card p-6 rounded-xl border border-white/5 space-y-4">
       <div className="flex justify-between items-center mb-2">
        <h3 className="text-white text-xs font-black uppercase tracking-widest font-mono">Narrative Footprint Log ({results.length})</h3>
        <span className="text-[10px] text-zinc-500 font-mono uppercase">Chronological Ledger</span>
       </div>

       {results.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-white/10 rounded-lg">
         <Compass size={32} className="mx-auto mb-2 text-zinc-700 animate-pulse" />
         <p className="text-xs font-bold">No registered choices match your filters.</p>
         <p className="text-[10px] text-zinc-600 mt-1 font-mono">Your memory grows as you resolve more in-game dilemmas.</p>
        </div>
       ) : (
        <div className="relative border-l border-white/10 pl-6 space-y-6 ml-3 py-2">
         {results.map((entry, index) => {
          const sigColors = {
           'MINOR': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
           'MODERATE': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
           'MAJOR': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
           'DEFINING': 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse'
          }[entry.significance];

          const isFresh = index === 0;
          const echoStatus = isFresh ? 'ACTIVE IMPACT' : 'COOLING OFF';
          const echoColors = isFresh 
           ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
           : 'text-zinc-500 bg-zinc-900/40 border-white/5';

          return (
           <div key={entry.id} className="relative group">
            <div className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-[#111] border-2 border-[#00FF88] group-hover:scale-125 transition-transform" />
            
            <div className="glass-panel p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors space-y-3 bg-zinc-900/20">
             <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
               <span className="text-xs font-black text-white">{entry.choiceText}</span>
               <span className={`px-2 py-0.5 rounded border text-[8px] font-bold font-mono tracking-wide ${sigColors}`}>
                {entry.significance}
               </span>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono uppercase">{entry.timestamp}</span>
             </div>

             <p className="text-xs text-zinc-400 leading-relaxed font-sans">{entry.description}</p>

             <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-[9px] font-mono text-zinc-500">
              <div className="flex flex-wrap gap-2">
               <span>System: <strong className="text-zinc-400">{entry.system}</strong></span>
               {entry.npcsInvolved.length > 0 && (
                <span>NPCs: <strong className="text-zinc-400">{entry.npcsInvolved.join(', ')}</strong></span>
               )}
               {entry.entitiesInvolved.length > 0 && (
                <span>Involved: <strong className="text-zinc-400">{entry.entitiesInvolved.join(', ')}</strong></span>
               )}
              </div>
              <div className="flex items-center gap-1.5">
               <span>Echo state:</span>
               <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold ${echoColors}`}>
                {echoStatus}
               </span>
              </div>
             </div>
            </div>
           </div>
          );
         })}
        </div>
       )}
      </div>
     </div>
    );
   })()}

  {activeTab === 'OVERVIEW' && (
  <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar">
   <div className="grid grid-cols-2 md:grid-cols-5 gap-4 shrink-0">
    <div className="premium-card p-6 rounded-xl flex flex-col justify-center items-center relative overflow-hidden">
    <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Apps</div>
    <div className="text-white text-4xl font-black z-10">{player.stats?.apps || 0}</div>
    <div className="absolute -bottom-4 -right-4 text-[#00FF88]/5 text-8xl font-black">{player.stats.apps}</div>
    </div>
    <div className="premium-card p-6 rounded-xl flex flex-col justify-center items-center relative overflow-hidden">
    <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Goals</div>
    <div className="text-white text-4xl font-black z-10">{player.stats?.goals || 0}</div>
    <div className="absolute -bottom-4 -right-4 text-[#00FF88]/5 text-8xl font-black">{player.stats.goals}</div>
    </div>
    <div className="premium-card p-6 rounded-xl flex flex-col justify-center items-center relative overflow-hidden">
    <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Assists</div>
    <div className="text-white text-4xl font-black z-10">{player.stats?.assists || 0}</div>
    <div className="absolute -bottom-4 -right-4 text-[#00FF88]/5 text-8xl font-black">{player.stats.assists}</div>
    </div>
    <div className="premium-card p-6 rounded-xl flex flex-col justify-center items-center relative overflow-hidden">
    <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Caps</div>
    <div className="text-white text-4xl font-black z-10">{player.stats?.caps || 0}</div>
    <div className="absolute -bottom-4 -right-4 text-[#00FF88]/5 text-8xl font-black">{player.stats.caps}</div>
    </div>
    <div className="premium-card p-6 rounded-xl flex flex-col justify-center items-center relative overflow-hidden">
    <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Intl Goals</div>
    <div className="text-white text-4xl font-black z-10">{player.stats.intlGoals || 0}</div>
    <div className="absolute -bottom-4 -right-4 text-[#00FF88]/5 text-8xl font-black">{player.stats.intlGoals || 0}</div>
    </div>
   </div>

   <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[400px]">
   {/* Contracts & Finances */}
   <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
    <div className="premium-card p-6 rounded-xl flex flex-col relative overflow-hidden flex-1">
     <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-white/10/60 pb-2">Current Contract</h3>
     <div className="space-y-4 flex-1">
      <div>
      <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Wage</div>
      <div className="text-white text-2xl font-black">£{player.contract.wage.toLocaleString()} <span className="text-white/40 text-xs font-bold uppercase tracking-widest">p/w</span></div>
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
       <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Appearance Bonus</div>
       <div className="text-white font-bold text-xs">£{player.contract.appearanceBonus?.toLocaleString() || 0}</div>
      </div>
      <div>
       <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Goal Bonus</div>
       <div className="text-white font-bold text-xs">£{player.contract.goalBonus?.toLocaleString() || 0}</div>
      </div>
      </div>
      
      {player.contract.releaseClause && (
      <div className="pt-3 border-t border-white/10">
       <div className="text-red-400 text-[9px] font-bold uppercase tracking-widest mb-1"><GlossaryTooltip term="Release Clause Trigger">Release Clause Trigger</GlossaryTooltip></div>
       <div className="text-white font-bold text-xs">£{player.contract.releaseClause.toLocaleString()}</div>
      </div>
      )}
     </div>
     
     <div className="hidden">
      <button 
      onClick={() => {}}
      disabled={player.transferListed}
      className="w-full py-3 glass-panel hover:border-[#00FF88] hover:text-[#00FF88] text-white/50 text-[10px] font-bold uppercase tracking-widest transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
      {player.transferListed ? 'Transfer Requested' : 'Submit Transfer Request'}
      </button>
     </div>
    </div>
    
    <div className="premium-card p-6 rounded-xl flex flex-col relative overflow-hidden shrink-0">
     <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-4">Bank Balance</h3>
     <div className="text-white text-3xl font-black tracking-tighter">£{((player.finances?.balance || 0) / 1000000).toFixed(2)}M</div>
     <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
      {player.sponsors || 0} Active Sponsors
     </div>
    </div>
   </div>
   
   {/* Records & Legacy & Story Arc */}
   <div className="flex-1 premium-card p-6 rounded-xl flex flex-col overflow-y-auto no-scrollbar gap-8">
    
    {/* STORY ARC WIDGET */}
    {player.storyArc && (
     <div>
     <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-4 pb-2 border-b border-white/10 shrink-0">Personal Journey</h3>
     <div className="glass-panel p-5 rounded-lg mb-4">
      <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Driving Question</div>
      <div className="text-white font-bold text-sm leading-snug italic">"{player.storyArc.drivingQuestion}"</div>
     </div>
     
     <div>
      <div className="flex justify-between items-end mb-1.5">
       <div>
       <div className="text-white font-bold uppercase tracking-wider text-xs mb-0.5">Story Progress</div>
       <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest">Act {player.storyArc.currentAct}</div>
       </div>
       <div className="text-white font-mono font-bold text-xs">{player.storyArc.progress}%</div>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
       <div className="h-full bg-[#00FF88] transition-all duration-1000" style={{ width: `${player.storyArc.progress}%`}}></div>
      </div>
      
      <div className="space-y-3">
       {player.storyArc.beats.filter(b => b.triggered).map((beat, idx) => (
       <div key={idx} className="flex gap-4">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white/50 font-bold font-mono text-xs">
        {idx + 1}
        </div>
        <div>
        <div className="text-white font-bold text-xs">{beat.name}</div>
        <div className="text-white/50 text-[10px] mt-0.5 leading-snug">{beat.narrative}</div>
        </div>
       </div>
       ))}
       {player.storyArc.beats.every(b => !b.triggered) && (
       <div className="text-[#555] text-xs italic">Your story is just beginning to unfold...</div>
       )}
       {player.storyArc.resolution && (
       <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-[#00FF88] text-[9px] font-bold uppercase tracking-widest mb-1">Arc Resolution</div>
        <div className="text-white font-bold text-xs">Path: {player.storyArc.resolution}</div>
       </div>
       )}
      </div>
     </div>
     </div>
    )}
    
     {player.careerIdentity && player.careerIdentity.length > 0 && (
      <div>
       <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-white/10 shrink-0">Career Identity & Manager Fit</h3>
       <div className="space-y-3">
        {player.careerIdentity.map((identity, idx) => (
         <div key={idx} className="bg-[#111] border border-[#222] p-4 rounded-lg flex justify-between items-center">
          <div>
           <div className="text-white font-bold text-xs uppercase tracking-wider">{identity.philosophy.replace('_', ' ')}</div>
           <div className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Matches: {identity.matchesPlayed}</div>
          </div>
          <div className="text-right">
           <div className={`text-lg font-black font-mono tracking-tighter ${identity.averageRating >= 7.5 ? 'text-[#00FF88]' : identity.averageRating >= 6.8 ? 'text-amber-400' : 'text-red-400'}`}>
            {identity.averageRating.toFixed(1)}
           </div>
           <div className="text-white/40 text-[9px] uppercase tracking-widest mt-0.5">Avg Rating</div>
          </div>
         </div>
        ))}
       </div>
      </div>
     )}
     {/* RITUALS */}
     <div>
       <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-white/10 shrink-0">Matchday Rituals</h3>
       {player.matchdayRitual?.active ? (
        <div className="bg-[#111] border border-[#222] p-4 rounded-lg">
         <div className="text-white font-bold text-xs uppercase tracking-wider mb-1">{player.matchdayRitual.name}</div>
         <div className="text-white/40 text-[10px] leading-relaxed mb-3">{RITUALS.find(r => r.name === player.matchdayRitual?.name)?.description}</div>
         <div className="text-[#00FF88] font-mono text-[9px] font-bold uppercase">{player.matchdayRitual.effect}</div>
        </div>
       ) : (
        <div className="space-y-3">
         <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Establish a pre-match routine:</p>
         {RITUALS.map(r => (
          <button 
           key={r.id}
           onClick={() => {
            setPlayer({
             ...player,
             matchdayRitual: { name: r.name, active: true, effect: r.effect }
            });
           }}
           className="w-full text-left bg-zinc-950 hover:bg-[#111] border border-white/5 hover:border-[#00FF88]/30 p-4 rounded-lg transition-all"
          >
           <div className="text-white font-bold text-xs uppercase tracking-wider mb-1">{r.name}</div>
           <div className="text-white/40 text-[10px] leading-relaxed mb-2">{r.description}</div>
           <div className="text-amber-400 font-mono text-[9px] font-bold uppercase">Establishes: {r.effect}</div>
          </button>
         ))}
        </div>
       )}
     </div>
    <div>
     <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-white/10 shrink-0">Club Records Pursuit</h3>
    
    <div className="space-y-6">
     <div>
      <div className="flex justify-between items-end mb-1.5">
       <div>
       <div className="text-white font-bold uppercase tracking-wider text-xs mb-0.5">All-Time Appearances Record</div>
       <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest">Target: 300 Apps</div>
       </div>
       <div className="text-white font-mono font-bold text-xs">{(player.stats?.apps || 0)} / 300</div>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
       <div className="h-full bg-[#00FF88] transition-all duration-1000" style={{ width: `${Math.min(100, (((player.stats?.apps || 0) / 300) * 100))}%`}}></div>
      </div>
     </div>

     <div>
      <div className="flex justify-between items-end mb-1.5">
       <div>
       <div className="text-white font-bold uppercase tracking-wider text-xs mb-0.5">All-Time Club Goalscorer</div>
       <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest">Target: 150 Goals</div>
       </div>
       <div className="text-white font-mono font-bold text-xs">{(player.stats?.goals || 0)} / 150</div>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
       <div className="h-full bg-[#00FF88] transition-all duration-1000" style={{ width: `${Math.min(100, (((player.stats?.goals || 0) / 150) * 100))}%`}}></div>
      </div>
     </div>
     
     <div>
      <div className="flex justify-between items-end mb-1.5">
       <div>
       <div className="text-white font-bold uppercase tracking-wider text-xs mb-0.5">All-Time Club Assists</div>
       <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest">Target: 100 Assists</div>
       </div>
       <div className="text-white font-mono font-bold text-xs">{(player.stats?.assists || 0)} / 100</div>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
       <div className="h-full bg-[#00FF88] transition-all duration-1000" style={{ width: `${Math.min(100, (((player.stats?.assists || 0) / 100) * 100))}%`}}></div>
      </div>
     </div>
    </div>
    </div>
   </div>
   
   <div className="w-full lg:w-[300px] flex flex-col gap-6 shrink-0">
    <div className="premium-card p-6 rounded-xl flex flex-col flex-1">
     <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Trophy Cabinet</h3>
     <div className="flex-1 flex items-center justify-center text-[#555555] text-xs font-bold uppercase tracking-widest text-center px-4">
      No silverware yet. Get to work.
     </div>
    </div>
    <div className="glass-panel p-6 rounded-xl flex flex-col shrink-0">
     <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-3">Social Reputation</h3>
     <div className="flex justify-between items-end mb-3">
      <div className="text-white/50 font-bold uppercase tracking-widest text-[9px]">Followers</div>
      <div className="text-white text-xl font-black">{(social.followers || 0).toLocaleString()}</div>
     </div>
     
     <div>
      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest mb-1">
       <GlossaryTooltip term="Cancel Risk" className="text-white/50">Cancel Risk</GlossaryTooltip>
       <span className={social.cancelRisk > 70 ? 'text-red-500' : 'text-white/50'}>{social.cancelRisk || 0}%</span>
      </div>
      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
       <div className={`h-full transition-all duration-1000 ${social.cancelRisk > 70 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${social.cancelRisk || 0}%`}}></div>
      </div>
     </div>
    </div>
   </div>
   </div>
  </div>
  )}

  {/* NEW TAB: REPUTATION & PERCEPTION */}
  {activeTab === 'REPUTATION' && (
   <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
    
    {/* Header / Intro */}
    <div className="premium-card p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
     <div>
      <h2 className="text-white text-lg font-black uppercase tracking-wide flex items-center gap-2">
       <Sparkles className="text-[#00FF88]" size={20} />
       Dynamic Reputation & Perception Engine
      </h2>
      <p className="text-white/50 text-xs mt-1">
       Your choices shape three independent prestige metrics. Other systems read these dimensions as concrete gates.
      </p>
     </div>
     
     {/* Qualitative Label Badge */}
     <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Current Perception:</span>
      {getReputationTags(player).map(tagId => {
       const tag = REPUTATION_TAGS.find(t => t.id === tagId);
       return (
        <span key={tagId} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${tag?.badgeColor || 'bg-white/10 text-white/70 border-white/20'}`}>
         {getTagName(tagId)}
        </span>
       );
      })}
     </div>
    </div>

    {/* THREE TRACKED DIMENSIONS GRID */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
     {/* 1. World Reputation */}
     <div className="premium-card p-6 rounded-xl flex flex-col justify-between">
      <div>
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
         <Globe size={14} className="text-amber-500" />
         World Reputation
        </h3>
        <span className="text-amber-400 font-mono font-black text-sm">{player.reputation?.world || 20}%</span>
       </div>
       <p className="text-white/40 text-[11px] leading-relaxed mb-6">
        Global name recognition and stardom. Built through trophy hauls, international caps, and high-end lifestyles. Sticky and slow to decay.
       </p>
      </div>
      <div className="space-y-2">
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${player.reputation?.world || 20}%` }}></div>
       </div>
       <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-wider">
        <span>Local Profile</span>
        <span>Global Icon</span>
       </div>
       <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-emerald-400 font-mono">
        🎯 Unlocks: Brand Deals (VictorySwoosh, LuxoChrono, etc.) & High Real Estate Trusts.
       </div>
      </div>
     </div>

     {/* 2. Media Perception */}
     <div className="premium-card p-6 rounded-xl flex flex-col justify-between">
      <div>
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
         <MessageSquare size={14} className="text-cyan-400" />
         Media Perception
        </h3>
        <span className="text-cyan-400 font-mono font-black text-sm">{player.mediaPerception || 50}%</span>
       </div>
       <p className="text-white/40 text-[11px] leading-relaxed mb-6">
        Public framing by pundits and tabloids. Highly volatile; moves fast based on recent form and press conference handling. Decays toward 50 weekly.
       </p>
      </div>
      <div className="space-y-2">
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${player.mediaPerception || 50}%` }}></div>
       </div>
       <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-wider">
        <span>Tabloid Target</span>
        <span>Media Darling</span>
       </div>
       <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-cyan-400 font-mono">
        🎯 Unlocks: Transfer Scouting (T2/T1 interest), Reduces Press Penalty, weekly sponsor bonus.
       </div>
      </div>
     </div>

     {/* 3. Peer Respect */}
     <div className="premium-card p-6 rounded-xl flex flex-col justify-between">
      <div>
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
         <Users size={14} className="text-emerald-500" />
         Peer & Professional Respect
        </h3>
        <span className="text-emerald-400 font-mono font-black text-sm">{player.reputation?.peerRespect || 50}%</span>
       </div>
       <p className="text-white/40 text-[11px] leading-relaxed mb-6">
        Dressing room standing and coach appreciation. Earned through work ethic in training, match consistency, and defensive teamwork. Decays very slowly.
       </p>
      </div>
      <div className="space-y-2">
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${player.reputation?.peerRespect || 50}%` }}></div>
       </div>
       <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-wider">
        <span>Disruptive influence</span>
        <span>Locker Room Anchor</span>
       </div>
       <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-emerald-400 font-mono">
        🎯 Unlocks: Training XP modifiers, prevents Dressing Room unrest, unlocks Elite Transfer Scouting.
       </div>
      </div>
     </div>
    </div>

    {/* PERSISTENT TAGS DESCRIPTION BLOCK */}
    <div className="premium-card p-6 rounded-xl">
     <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5">
      <Award size={14} className="text-[#00FF88]" />
      Qualitative Reputation Badges & Traits
     </h3>
     <p className="text-white/50 text-[11px] mb-4">
      Your combination of attributes triggers dynamic traits that modify training efficiency, match performance, and commercial revenue:
     </p>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {REPUTATION_TAGS.map(tag => {
       const isActive = getReputationTags(player).includes(tag.id);
       return (
        <div key={tag.id} className={`p-4 border rounded-xl flex flex-col justify-between transition-all duration-300 ${isActive ? 'bg-[#00FF88]/5 border-[#00FF88]/40' : 'bg-[#050505]/40 border-white/5 opacity-50'}`}>
         <div>
          <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-bold text-white uppercase tracking-wider">{tag.name}</span>
           {isActive && <span className="bg-emerald-500 text-black font-black text-[7px] px-1.5 py-0.5 rounded">ACTIVE</span>}
          </div>
          <p className="text-white/40 text-[10px] leading-relaxed mb-3">{tag.description}</p>
         </div>
         <div className="space-y-2 pt-2 border-t border-white/5 text-[9px]">
          <div><strong className="text-white/50 uppercase">Trigger:</strong> <span className="text-white/70">{tag.triggerDesc}</span></div>
          <div><strong className="text-[#00FF88] uppercase">Effect:</strong> <span className="text-white/90">{tag.effectDesc}</span></div>
         </div>
        </div>
       );
      })}
     </div>
    </div>

    {/* SEASON NARRATIVE SIMULATOR (WORKED EXAMPLE) */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     {/* Simulator Configuration */}
     <div className="premium-card p-6 rounded-xl flex flex-col justify-between">
      <div>
       <h3 className="text-white text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <Activity size={14} className="text-[#00FF88]" />
        Season Divergence Simulator (Worked Example)
       </h3>
       <p className="text-white/50 text-[11px] leading-relaxed mb-4">
        Experience a worked simulation showing how player reputation dimensions diverge over a 38-game campaign. Select a persona and click simulate to view the concrete effects on scouting limits versus brand sponsors!
       </p>
       
       <div className="grid grid-cols-3 gap-3 mb-6">
        <button
         onClick={() => setSelectedPersona('SILENT')}
         disabled={simulating}
         className={`p-3 border rounded-xl text-left transition-all ${selectedPersona === 'SILENT' ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:border-white/20'}`}
        >
         <span className="text-[10px] font-black text-white block uppercase tracking-wider">The Silent Pro</span>
         <span className="text-[8px] text-white/40 block mt-1 leading-tight">Focuses purely on performance. Humble in press, works hard.</span>
        </button>
        <button
         onClick={() => setSelectedPersona('REBEL')}
         disabled={simulating}
         className={`p-3 border rounded-xl text-left transition-all ${selectedPersona === 'REBEL' ? 'border-red-500 bg-red-500/5' : 'border-white/10 hover:border-white/20'}`}
        >
         <span className="text-[10px] font-black text-white block uppercase tracking-wider">Tabloid Maverick</span>
         <span className="text-[8px] text-white/40 block mt-1 leading-tight">Elite output on pitch, but highly combative, outspoken in media.</span>
        </button>
        <button
         onClick={() => setSelectedPersona('PR_STAR')}
         disabled={simulating}
         className={`p-3 border rounded-xl text-left transition-all ${selectedPersona === 'PR_STAR' ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/10 hover:border-white/20'}`}
        >
         <span className="text-[10px] font-black text-white block uppercase tracking-wider">PR Fashion Icon</span>
         <span className="text-[8px] text-white/40 block mt-1 leading-tight">Glamorous off-field lifestyle. Pristine public and commercial branding.</span>
        </button>
       </div>
      </div>

      <div>
       {simulating ? (
        <div className="space-y-3 mb-2">
         <div className="flex justify-between items-center text-[10px] text-white/50 font-bold uppercase">
          <span>Simulating 38-Game campaign...</span>
          <span>{simProgress}%</span>
         </div>
         <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-[#00FF88] animate-pulse" style={{ width: `${simProgress}%` }}></div>
         </div>
        </div>
       ) : (
        <button
         onClick={handleSimulateSeason}
         className="w-full py-3 bg-[#00FF88] text-white text-xs font-black uppercase tracking-widest rounded hover:bg-opacity-90 transition-colors"
        >
         Simulate Full Season Profile
        </button>
       )}
      </div>
     </div>

     {/* Simulator Logs & Concrete Divergence Outcomes */}
     <div className="premium-card p-6 rounded-xl flex flex-col justify-between max-h-[360px] overflow-hidden">
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
       <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
        Simulation Stream & Career Results
       </h4>
       
       <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar text-[10px] font-mono">
        {simLog.map((logStr, lIdx) => (
         <div key={lIdx} className="text-white/70 flex gap-2">
          <span className="text-[#00FF88]">⚡</span>
          <span>{logStr}</span>
         </div>
        ))}
       </div>

       {simResults && (
        <div className="mt-4 pt-3 border-t border-white/10 space-y-3 bg-[#020202]/50 p-3 rounded-lg">
         <div className="grid grid-cols-3 gap-2 font-black text-center text-[10px]">
          <div className="text-amber-500 font-mono">World Rep: {simResults.worldRep}%</div>
          <div className="text-cyan-400 font-mono">Media Percep: {simResults.mediaPercep}%</div>
          <div className="text-emerald-500 font-mono">Peer Respect: {simResults.peerRespect}%</div>
         </div>
         <div className="space-y-1 text-[10px] leading-relaxed">
          <div className="text-white"><strong className="text-red-400 font-bold uppercase tracking-wide">Transfer Gating:</strong> {simResults.scoutingStatus}</div>
          <div className="text-white"><strong className="text-emerald-400 font-bold uppercase tracking-wide">Brand Sponsors:</strong> {simResults.sponsorStatus}</div>
         </div>
        </div>
       )}
      </div>
     </div>
    </div>

    {/* SYSTEM INTEGRATION MAP */}
    <div className="premium-card p-6 rounded-xl">
     <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5">
      <Compass size={14} className="text-[#00FF88]" />
      System Integration Map: Unified Gating Registry
     </h3>
     <p className="text-white/50 text-[11px] mb-6">
      Our three reputation dimensions are fed by and directly dictate outputs across all major application subsystems, eliminating fragmented, hardcoded logic:
     </p>
     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono text-white/70">
      <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg">
       <div className="text-amber-500 font-bold mb-2">1. Brand Deals</div>
       <p className="text-[10px] text-white/50 leading-relaxed">
        <strong>Reads World Reputation.</strong> Sets hard thresholds to unlock custom shoe lines, watches, or hypercar sponsorships (15% to 90% gates) in your Finance tab.
       </p>
      </div>
      <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg">
       <div className="text-cyan-400 font-bold mb-2">2. Transfer Pacing</div>
       <p className="text-[10px] text-white/50 leading-relaxed">
        <strong>Reads Media Perception & Peer Respect.</strong> Unlocks credible rumors and scout interests. If either metric falls below 45/55, you are gated from Tier 3/2 transfers.
       </p>
      </div>
      <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg">
       <div className="text-emerald-400 font-bold mb-2">3. Dressing Room</div>
       <p className="text-[10px] text-white/50 leading-relaxed">
        <strong>Reads Peer Respect.</strong> Weekly progress checks your locker standing. Lower respect triggers "Dressing Room Rumbles" or team rifts, whilst high respect yields +10% Training XP.
       </p>
      </div>
      <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg">
       <div className="text-[#00FF88] font-bold mb-2">4. Press & Board</div>
       <p className="text-[10px] text-white/50 leading-relaxed">
        <strong>Feeds All Dimensions.</strong> Your tone (Combative vs defend vs humble) adds instant delta adjustments, with press conferences logging concrete historical reasons in your profile feed.
       </p>
      </div>
     </div>
    </div>

    {/* CAUSE-AND-EFFECT HISTORY FEED */}
    <div className="premium-card p-6 rounded-xl">
     <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5">
      <Activity size={14} className="text-[#00FF88]" />
      Reputation & Perception Event History
     </h3>
     {(!player.stateFlags?.reputationHistory || player.stateFlags.reputationHistory.length === 0) ? (
      <div className="text-white/30 text-xs font-bold uppercase tracking-widest text-center py-6">
       No recent events. Handle press conferences or matches to establish a narrative history.
      </div>
     ) : (
      <div className="space-y-3">
       {player.stateFlags.reputationHistory.slice(0, 8).map((logItem: any, hIdx: number) => {
        const parts: string[] = [];
        if (logItem.deltaWorld !== 0) parts.push(`World Rep: ${logItem.deltaWorld > 0 ? '+' : ''}${logItem.deltaWorld}`);
        if (logItem.deltaMedia !== 0) parts.push(`Media Perception: ${logItem.deltaMedia > 0 ? '+' : ''}${logItem.deltaMedia}`);
        if (logItem.deltaPeer !== 0) parts.push(`Peer Respect: ${logItem.deltaPeer > 0 ? '+' : ''}${logItem.deltaPeer}`);
        
        return (
         <div key={hIdx} className="flex justify-between items-center bg-[#070707] border border-white/5 p-3 rounded-lg text-xs">
          <div className="flex gap-4 items-center">
           <span className="text-[#00FF88] font-bold uppercase tracking-widest text-[9px] bg-[#00FF88]/10 px-2 py-0.5 rounded">
            {logItem.date}
           </span>
           <span className="text-white font-medium">{logItem.reason}</span>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] font-bold">
           {parts.join(' | ')}
          </span>
         </div>
        );
       })}
      </div>
     )}
    </div>
   </div>
  )}

  {/* NEW TAB: SOCIAL PR STUDIO */}
  {activeTab === 'SOCIAL' && (
  <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
   
   {/* Post Generation Panel */}
   <div className="w-full lg:w-[380px] premium-card p-6 rounded-xl flex flex-col justify-between shrink-0 overflow-y-auto no-scrollbar">
   <div className="space-y-6">
    <div>
    <h3 className="text-white text-md font-black uppercase tracking-wider mb-1 flex items-center gap-2"><Globe className="text-[#00FF88]" size={18}/> PR Control Desk</h3>
    <p className="text-white/50 text-[11px] leading-relaxed">Compose strategic public statements. Flexing cash boosts followers but damages team morale, while grinding and head-coach backing solidify squad alignment.</p>
    </div>

    {postingStatus && (
    <div className="glass-panel border border-[#00FF88] text-[#00FF88] p-3 rounded text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
     ⚡ {postingStatus}
    </div>
    )}

    <div className="space-y-4">
    {/* Grind Post */}
    <button 
     onClick={() => handleCreatePost('GRIND')}
     className="w-full p-4 hover:border-[#00FF88] bg-[#080808] rounded-lg text-left transition-all group flex flex-col justify-between"
    >
     <div className="flex justify-between items-center mb-1">
     <span className="text-white font-black uppercase text-xs font-display">Post Training Grind</span>
     <span className="text-red-500 text-[9px] font-mono font-bold uppercase">Consumes 10 Fatigue</span>
     </div>
     <p className="text-white/50 text-[10px] leading-relaxed mb-3">Share high-intensity training clips. Boosts team cohesion, manager trust, and cuts cancel risk.</p>
     <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">+Followers | +Manager Trust | +Teammates</div>
    </button>

    {/* Flex Post */}
    <button 
     onClick={() => handleCreatePost('FLEX')}
     className="w-full p-4 hover:border-[#00FF88] bg-[#080808] rounded-lg text-left transition-all group flex flex-col justify-between"
    >
     <div className="flex justify-between items-center mb-1">
     <span className="text-white font-black uppercase text-xs font-display">Post Luxury Flex</span>
     <span className="text-emerald-500 text-[9px] font-mono font-bold uppercase">+15 Morale Boost</span>
     </div>
     <p className="text-white/50 text-[10px] leading-relaxed mb-3">Showcase elite supercars or designer watches. Massive follower surge, but risks dressing-room jealousy.</p>
     <div className="text-[9px] font-mono text-red-400 font-bold uppercase">++Followers | -Teammates | +Cancel Risk</div>
    </button>

    {/* Engage Post */}
    <button 
     onClick={() => handleCreatePost('ENGAGE')}
     className="w-full p-4 hover:border-[#00FF88] bg-[#080808] rounded-lg text-left transition-all group flex flex-col justify-between"
    >
     <div className="flex justify-between items-center mb-1">
     <span className="text-white font-black uppercase text-xs font-display">Unfiltered Fan Q&A</span>
     <span className="text-red-500 text-[9px] font-mono font-bold uppercase">Consumes 5 Fatigue</span>
     </div>
     <p className="text-white/50 text-[10px] leading-relaxed mb-3">Interact unfiltered. Deeply improves fan relationship and public buzz, but raises risk of speaking blunders.</p>
     <div className="text-[9px] font-mono text-amber-500 font-bold uppercase">+++Fans | +Followers | ++Cancel Risk</div>
    </button>

    {/* Coach Backing Post */}
    <button 
     onClick={() => handleCreatePost('SOLIDARITY')}
     className="w-full p-4 hover:border-[#00FF88] bg-[#080808] rounded-lg text-left transition-all group flex flex-col justify-between"
    >
     <div className="flex justify-between items-center mb-1">
     <span className="text-white font-black uppercase text-xs font-display">Coach Solidarity Statement</span>
     <span className="text-white/40 text-[9px] font-mono uppercase">Cost: Free</span>
     </div>
     <p className="text-white/50 text-[10px] leading-relaxed mb-3">Publish backing of head coach. Instantly pleases the manager, but plastic fans may mock you.</p>
     <div className="text-[9px] font-mono text-cyan-400 font-bold uppercase">++Manager Trust | +Teammates | -Fans</div>
    </button>
    </div>
   </div>

   {/* Social status card */}
   <div className="bg-[#080808] p-4 rounded-xl mt-6 space-y-3 font-mono text-xs">
    <div className="flex justify-between items-center">
    <span className="text-white/40">Followers:</span>
    <span className="text-white font-bold">{(social.followers || 0).toLocaleString()}</span>
    </div>
    <div className="flex justify-between items-center">
    <span className="text-white/40">Cancel Risk:</span>
    <span className={`font-bold ${social.cancelRisk > 60 ? 'text-red-500' : 'text-emerald-500'}`}>{social.cancelRisk || 0}%</span>
    </div>
    <div className="flex justify-between items-center">
    <span className="text-white/40">Match Form Coeff:</span>
    <span className="text-white font-bold">{player.form?.toFixed(1) || "6.5"} / 10</span>
    </div>
   </div>
   </div>

   {/* Social Media Feed View */}
   <div className="flex-1 premium-card rounded-xl p-6 flex flex-col overflow-hidden">
   <h3 className="text-white text-md font-black uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
    <Sparkles className="text-amber-400" size={16}/> Live X-FC Feed & Fan Reaction
   </h3>

   <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
    {activePosts.map((post: any, i: number) => (
    <div key={post.id || i} className="bg-[#0a0a0a] p-5 rounded-xl space-y-3">
     <div className="flex items-center gap-3">
     <div className="w-8 h-8 rounded-full bg-[#00FF88] flex items-center justify-center text-white text-xs font-black font-mono">
      ⚽
     </div>
     <div>
      <div className="flex items-center gap-1.5">
      <span className="text-white font-black text-xs uppercase font-display">{player.firstName} {player.lastName}</span>
      <span className="text-blue-400 text-[10px]">✓</span>
      </div>
      <span className="text-white/40 text-[10px] font-mono font-bold block">@{player.lastName || 'Striker'}Official</span>
     </div>
     </div>

     <p className="text-white text-xs font-mono leading-relaxed pl-1">{post.text}</p>

     <div className="flex gap-6 font-mono text-[10px] text-[#555] border-t border-white/10/40 pt-3 pl-1">
     <span className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer"><Heart size={11} className="text-red-500/80"/> {post.likes}</span>
     <span className="flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer"><Repeat size={11} className="text-emerald-500/80"/> {post.retweets}</span>
     <span className="flex items-center gap-1"><MessageSquare size={11} className="text-blue-400/80"/> {post.comments?.length || 0}</span>
     </div>

     {/* Fan Comments */}
     {post.comments && post.comments.length > 0 && (
     <div className="bg-[#0f0f0f] p-3 rounded-lg ml-2 space-y-2 mt-2">
      <div className="text-[#555] text-[9px] uppercase tracking-wider font-bold mb-1">Dressing Room & Fan replies</div>
      {post.comments.map((comment: any, cIdx: number) => (
      <div key={cIdx} className="text-[11px] font-mono leading-relaxed border-b border-white/10/20 pb-1.5 last:border-b-0 last:pb-0">
       <span className="text-[#00FF88] font-bold mr-1">{comment.handle}:</span>
       <span className="text-[#bbb]">{comment.text}</span>
      </div>
      ))}
     </div>
     )}
    </div>
    ))}
   </div>
   </div>

  </div>
  )}

  {activeTab === 'TIMELINE' && (
   <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar premium-card p-6 lg:p-12 relative rounded-xl">
   <div className="absolute left-[39px] top-12 bottom-12 w-0.5 bg-[#333] hidden md:block"></div>
   
   {player.timeline && player.timeline.length > 0 ? player.timeline.map((event, i) => (
    <div key={i} className="flex flex-col md:flex-row gap-6 mb-8 relative z-10 group">
     {/* Timeline dot */}
     <div className="w-10 h-10 rounded-full glass-panel border-2 border-white/10 group-hover:border-[#00FF88] shrink-0 flex items-center justify-center transition-colors">
     <span className="text-white/50 text-[9px] font-bold group-hover:text-[#00FF88]">W{event.week}</span>
     </div>
     
     {/* Content card */}
     <div className={`flex-1 border p-6 rounded transition-colors flex flex-col sm:flex-row gap-6 ${event.title.includes('🏆') ? 'bg-amber-950/20 border-amber-500/30 group-hover:border-amber-500/60' : 'glass-panel border-white/10 group-hover:border-[#444]'}`}>
     <div className="text-center shrink-0 w-full sm:w-20 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-6">
      <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">{event.day}</div>
      {event.clubSymbol && event.clubSymbol !== 'SYS' ? (
       (() => {
       const eventClub = CLUBS.find(c => c.symbol.toUpperCase() === event.clubSymbol?.toUpperCase());
       return (
        <div className="flex flex-col items-center gap-1">
        <TeamLogo
         symbol={event.clubSymbol}
         name={eventClub?.name}
         primaryColor={eventClub?.primaryColor}
         secondaryColor={eventClub?.secondaryColor}
         size={36}
        />
        <div className="text-white text-xs font-black font-mono leading-none mt-1">{event.clubSymbol}</div>
        </div>
       );
       })()
      ) : (
       <div className="text-white/50 text-[9px] font-bold font-mono uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded mt-1">SYSTEM</div>
      )}
     </div>
     <div className="flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-0.5">
       <div className={`text-[9px] font-bold uppercase tracking-widest ${event.title.includes('🏆') ? 'text-amber-500 animate-pulse' : 'text-[#00FF88]'}`}>{event.title.includes('🏆') ? 'RECORD' : event.type}</div>
      </div>
      <div className={`font-bold text-md mb-1 ${event.title.includes('🏆') ? 'text-amber-500' : 'text-white'}`}>{event.title}</div>
      <div className="text-[#aaa] text-xs leading-relaxed">{event.description}</div>
     </div>
     </div>
    </div>
   )) : (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 relative z-20">
    <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center mb-3 border border-white/5">
     <Trophy className="text-[#444] w-6 h-6" />
    </div>
    <div className="text-white/40 text-[11px] font-bold uppercase tracking-widest">No timeline events recorded yet</div>
    <p className="text-[#555] text-[10px] max-w-[320px] mt-1 leading-relaxed">Major career milestones, transfers, and achievements will be chronicled here.</p>
    </div>
   )}
   </div>
  )}
  
{activeTab === 'INTERNATIONAL' && (
   <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar animate-fade-in">
    <div className="premium-card p-6 rounded-xl flex flex-col gap-4">
     <div className="border-b border-white/10 pb-4">
      <h3 className="text-white text-base font-black tracking-wider uppercase flex items-center gap-2">
       <Globe className="text-[#00FF88]" size={16} />
       International Tournament Group Standings
      </h3>
      <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono mt-1">
       European Championship Qualification Group Stage &middot; Group D
      </p>
     </div>

     <div className="overflow-x-auto">
      <table className="w-full text-left font-mono text-xs border-collapse">
       <thead>
        <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase tracking-widest font-bold">
         <th className="py-3 px-2">Pos</th>
         <th className="py-3 px-4">Nation</th>
         <th className="py-3 px-2 text-center">P</th>
         <th className="py-3 px-2 text-center">W</th>
         <th className="py-3 px-2 text-center">D</th>
         <th className="py-3 px-2 text-center">L</th>
         <th className="py-3 px-2 text-center">GD</th>
         <th className="py-3 px-4 text-right">Pts</th>
        </tr>
       </thead>
       <tbody>
        {groupStandings.map((team, idx) => {
         const isUserNation = team.isHero;
         return (
          <tr 
           key={team.symbol} 
           className={`border-b border-white/5 transition-colors ${
            isUserNation ? 'bg-[#00FF88]/10 text-[#00FF88] font-bold' : 'hover:bg-white/5 text-white'
           }`}
          >
           <td className="py-3.5 px-2 font-black text-[11px]">{idx + 1}</td>
           <td className="py-3.5 px-4 flex items-center gap-2">
            <span className="text-base">{team.symbol === 'FRA' ? '🇫🇷' : team.symbol === 'GER' ? '🇩🇪' : team.symbol === 'ESP' ? '🇪🇸' : team.symbol === 'ITA' ? '🇮🇹' : team.symbol === 'NED' ? '🇳🇱' : '🏴󠁧󠁢󠁥󠁮󠁧󠁿'}</span>
            <span className="uppercase tracking-wide text-xs">{team.name}</span>
            {isUserNation && <span className="bg-[#00FF88] text-black text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-widest font-mono ml-2">YOU</span>}
           </td>
           <td className="py-3.5 px-2 text-center text-white/80">{team.p}</td>
           <td className="py-3.5 px-2 text-center text-white/80">{team.w}</td>
           <td className="py-3.5 px-2 text-center text-white/80">{team.d}</td>
           <td className="py-3.5 px-2 text-center text-white/80">{team.l}</td>
           <td className="py-3.5 px-2 text-center font-mono font-bold text-white/80">
            {team.gd > 0 ? `+${team.gd}` : team.gd}
           </td>
           <td className="py-3.5 px-4 text-right font-black text-sm">{team.pts}</td>
          </tr>
         );
        })}
       </tbody>
      </table>
     </div>

     <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-lg mt-4 text-[11px] leading-relaxed text-white/60 font-sans">
      <span className="text-[#00FF88] uppercase tracking-widest text-[9px] font-bold font-mono block mb-1">Board Directive & Qualification Status</span>
      <p>
       The top two nations secure immediate automatic tickets to the European Championship Finals. Third place enters a playoff round, while any placement lower results in tournament elimination.
      </p>
     </div>
    </div>
   </div>
  )}

  {activeTab === 'LEGACY_AGENT' && (
   <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar animate-fade-in">
    {/* 1. STADIUM & MILESTONE BADGES */}
    <div className="premium-card p-6 rounded-xl flex flex-col gap-6">
     <div className="border-b border-white/10 pb-4">
      <h3 className="text-white text-base font-black tracking-wider uppercase flex items-center gap-2">
       <Award className="text-[#00FF88]" size={16} />
       Career Legacy & Milestone Badge Tracker
      </h3>
      <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono mt-1">
       A list of locked and unlocked accolades achieved over your professional career
      </p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Named Stand */}
      <div className={`border p-5 rounded-lg flex flex-col items-center justify-between text-center transition-all ${
       player.stateFlags?.stadiumMilestones?.hasNamedStand 
        ? 'border-amber-500/30 bg-amber-500/5 text-white' 
        : 'border-white/5 bg-[#0a0a0a]/50 text-white/30'
      }`}>
       <div className="text-4xl mb-3">{player.stateFlags?.stadiumMilestones?.hasNamedStand ? '🏟️' : '🔒'}</div>
       <div>
        <h4 className={`text-xs font-black uppercase tracking-wider ${player.stateFlags?.stadiumMilestones?.hasNamedStand ? 'text-amber-400' : 'text-white/40'}`}>
         {player.stateFlags?.stadiumMilestones?.standName || 'Named Stand'}
        </h4>
        <p className="text-[10px] text-white/50 font-sans mt-1 leading-normal">Unlocked at 200 club appearances or 100 goal contributions.</p>
       </div>
       <div className="w-full mt-4 font-mono text-[10px] uppercase">
        <div className="flex justify-between mb-1 text-white/40">
         <span>Progress</span>
         <span className={player.stateFlags?.stadiumMilestones?.hasNamedStand ? 'text-amber-400 font-bold' : ''}>{player.stats.apps} / 200 Apps</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
         <div className={`h-full ${player.stateFlags?.stadiumMilestones?.hasNamedStand ? 'bg-amber-500' : 'bg-[#00FF88]'}`} style={{ width: `${Math.min(100, (player.stats.apps / 200) * 100)}%` }}></div>
        </div>
       </div>
      </div>

      {/* Bronze Statue */}
      <div className={`border p-5 rounded-lg flex flex-col items-center justify-between text-center transition-all ${
       player.stateFlags?.stadiumMilestones?.hasBronzeStatue 
        ? 'border-amber-500/30 bg-amber-500/5 text-white' 
        : 'border-white/5 bg-[#0a0a0a]/50 text-white/30'
      }`}>
       <div className="text-4xl mb-3">{player.stateFlags?.stadiumMilestones?.hasBronzeStatue ? '🗿' : '🔒'}</div>
       <div>
        <h4 className={`text-xs font-black uppercase tracking-wider ${player.stateFlags?.stadiumMilestones?.hasBronzeStatue ? 'text-amber-400' : 'text-white/40'}`}>
         Bronze Statue
        </h4>
        <p className="text-[10px] text-white/50 font-sans mt-1 leading-normal">Erected outside stadium plaza at 350 apps or 200 goal contributions.</p>
       </div>
       <div className="w-full mt-4 font-mono text-[10px] uppercase">
        <div className="flex justify-between mb-1 text-white/40">
         <span>Progress</span>
         <span className={player.stateFlags?.stadiumMilestones?.hasBronzeStatue ? 'text-amber-400 font-bold' : ''}>{player.stats.apps} / 350 Apps</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
         <div className={`h-full ${player.stateFlags?.stadiumMilestones?.hasBronzeStatue ? 'bg-amber-500' : 'bg-[#00FF88]'}`} style={{ width: `${Math.min(100, (player.stats.apps / 350) * 100)}%` }}></div>
        </div>
       </div>
      </div>

      {/* Hall of Fame */}
      <div className={`border p-5 rounded-lg flex flex-col items-center justify-between text-center transition-all ${
       player.stateFlags?.stadiumMilestones?.hasHallOfFame 
        ? 'border-amber-500/30 bg-amber-500/5 text-white' 
        : 'border-white/5 bg-[#0a0a0a]/50 text-white/30'
      }`}>
       <div className="text-4xl mb-3">{player.stateFlags?.stadiumMilestones?.hasHallOfFame ? '🏛️' : '🔒'}</div>
       <div>
        <h4 className={`text-xs font-black uppercase tracking-wider ${player.stateFlags?.stadiumMilestones?.hasHallOfFame ? 'text-amber-400' : 'text-white/40'}`}>
         Hall of Fame
        </h4>
        <p className="text-[10px] text-white/50 font-sans mt-1 leading-normal">Inducted for legendary status (500 apps or 3+ trophies).</p>
       </div>
       <div className="w-full mt-4 font-mono text-[10px] uppercase">
        <div className="flex justify-between mb-1 text-white/40">
         <span>Progress</span>
         <span className={player.stateFlags?.stadiumMilestones?.hasHallOfFame ? 'text-amber-400 font-bold' : ''}>{player.stats.apps} / 500 Apps</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
         <div className={`h-full ${player.stateFlags?.stadiumMilestones?.hasHallOfFame ? 'bg-amber-500' : 'bg-[#00FF88]'}`} style={{ width: `${Math.min(100, (player.stats.apps / 500) * 100)}%` }}></div>
        </div>
       </div>
      </div>
     </div>
    </div>

    {/* 2. PERSONAL BRAND BEYOND FOOTBALL */}
    <div className="premium-card p-6 rounded-xl flex flex-col gap-6">
     <div className="border-b border-white/10 pb-4 flex justify-between items-center">
      <div>
       <h3 className="text-white text-base font-black tracking-wider uppercase flex items-center gap-2">
        <Sparkles className="text-amber-400" size={16} />
        Personal Brand & Media Empire
       </h3>
       <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono mt-1">
        Expand your public presence beyond the 90 minutes through documentaries, boot lines, and punditry
       </p>
      </div>
      <div className="text-right">
       <span className="text-white/40 text-[10px] font-mono block uppercase">Media Profile</span>
       <span className="text-amber-400 font-black text-lg font-mono">{player.stateFlags?.mediaProfile || player.reputation?.media || 30}/100</span>
      </div>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MEDIA_BRAND_ACTIVITIES.map(activity => {
       const isCompleted = (player.stateFlags?.completedMediaActivities || []).includes(activity.id);
       return (
        <div key={activity.id} className="bg-[#0a0a0a] border border-white/5 p-5 rounded-lg flex flex-col justify-between space-y-3">
         <div>
          <div className="flex justify-between items-start mb-1">
           <h4 className="text-white text-xs font-bold uppercase tracking-wide font-display">{activity.title}</h4>
           <span className="text-amber-400 text-[9px] font-mono font-bold uppercase border border-amber-500/20 px-2 py-0.5 rounded">
            +{activity.mediaProfileGain} Media
           </span>
          </div>
          <p className="text-white/50 text-[10px] leading-relaxed font-sans mt-1">{activity.description}</p>
         </div>

         <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[10px]">
          <div className="space-x-3 text-white/40">
           <span>Payout: <strong className="text-emerald-400">+£{(activity.incomePayout / 1000).toFixed(0)}k</strong></span>
           <span>Fatigue: <strong className="text-red-400">+{activity.costMentalFatigue}</strong></span>
          </div>

          <button
           disabled={isCompleted}
           onClick={() => {
            const res = executeMediaBrandActivity(player, activity.id);
            setPlayer(res.updatedPlayer);
            setInbox([...state.inbox, res.inboxMessage]);
           }}
           className={`px-4 py-2 font-mono font-bold text-[10px] uppercase tracking-wider rounded transition-colors ${
            isCompleted 
             ? 'bg-white/5 text-white/30 cursor-not-allowed'
             : 'bg-amber-500 text-black hover:bg-amber-400'
           }`}
          >
           {isCompleted ? 'Launched' : 'Launch Venture'}
          </button>
         </div>
        </div>
       );
      })}
     </div>
    </div>

    {/* 3. YOUTH ACADEMY INVOLVEMENT & MENTORSHIP */}
    <div className="premium-card p-6 rounded-xl flex flex-col gap-6">
     <div className="border-b border-white/10 pb-4 flex justify-between items-center">
      <div>
       <h3 className="text-white text-base font-black tracking-wider uppercase flex items-center gap-2">
        <Users className="text-cyan-400" size={16} />
        Youth Academy Involvement & Understudies
       </h3>
       <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono mt-1">
        Guide the next generation of prospects to secure legacy continuity
       </p>
      </div>

      <button
       onClick={() => {
        const prospects = generateAcademyProspects(player);
        const existing = player.stateFlags?.academyProspects || [];
        setPlayer({
         ...player,
         stateFlags: {
          ...player.stateFlags,
          academyProspects: existing.length > 0 ? existing : prospects
         }
        });
       }}
       className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono font-bold text-[10px] uppercase tracking-widest transition-all rounded"
      >
       Scout Academy Prodigies 🔍
      </button>
     </div>

     {(player.stateFlags?.academyProspects || []).length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {(player.stateFlags?.academyProspects || []).map((prospect: AcademyProspect) => (
        <div key={prospect.id} className="bg-[#0a0a0a] border border-white/5 p-5 rounded-lg space-y-4 font-mono">
         <div className="flex justify-between items-start">
          <div>
           <span className="text-cyan-400 text-[9px] uppercase font-bold tracking-widest">{prospect.position} Prospect</span>
           <h4 className="text-white text-sm font-bold mt-0.5">{prospect.name}</h4>
          </div>
          <div className="text-right">
           <span className="text-white text-xs font-bold">{prospect.ovr} OVR</span>
           <span className="text-white/40 text-[9px] block">Potential: {prospect.potential}</span>
          </div>
         </div>

         {prospect.quote && (
          <div className="bg-[#111] p-3 rounded text-[10px] text-white/50 leading-relaxed italic border border-white/5">
           "{prospect.quote}"
          </div>
         )}

         <div className="flex justify-between items-center text-[10px]">
          <span className="text-white/40">Breakthrough Status: <strong className={prospect.breakthroughMade ? 'text-amber-400 font-bold' : 'text-cyan-400'}>{prospect.breakthroughMade ? '🌟 Debut Senior Team' : '🌱 Academy Squad'}</strong></span>
          <div className="flex gap-2">
           <button
            onClick={() => {
             const res = guideAcademyProspect(player, prospect, 'TECHNICAL');
             setPlayer(res.updatedPlayer);
             setInbox([...state.inbox, res.inboxMessage]);
            }}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-cyan-500/20 text-white hover:text-cyan-400 text-[9px] font-bold uppercase rounded border border-white/10 transition-all"
           >
            Technical Drill
           </button>
           <button
            onClick={() => {
             const res = guideAcademyProspect(player, prospect, 'MENTALITY');
             setPlayer(res.updatedPlayer);
             setInbox([...state.inbox, res.inboxMessage]);
            }}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-emerald-500/20 text-white hover:text-emerald-400 text-[9px] font-bold uppercase rounded border border-white/10 transition-all"
           >
            Mental Focus
           </button>
          </div>
         </div>
        </div>
       ))}
      </div>
     ) : (
      <div className="text-center py-8 border border-dashed border-white/10 rounded-lg text-white/40 font-mono text-xs">
       No active academy prospects under your wing. Click "Scout Academy Prodigies" to mentor youngsters!
      </div>
     )}
    </div>
   </div>
  )}
 </div>
 );
}

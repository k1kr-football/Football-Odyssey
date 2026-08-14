import React from 'react';
import { useGame } from '../store/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { Users, Award, ShieldAlert, Zap, BookOpen, Crown, Heart, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export function getFanTier(support: number) {
 if (support >= 95) return { tier: 5, title: 'Legend', perk: 'Statue material. Permanent +5% to all stats at this club.', range: '95-100', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
 if (support >= 80) return { tier: 4, title: 'Icon', perk: 'The crowd protects you. Media criticism has -50% morale impact.', range: '80-94', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' };
 if (support >= 60) return { tier: 3, title: 'Cult Hero', perk: '+15% stats in clutch moments (fans will you to success).', range: '60-79', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
 if (support >= 40) return { tier: 2, title: 'Fan Favourite', perk: '+10% morale at home games (fans carry you).', range: '40-59', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
 if (support >= 20) return { tier: 1, title: 'Squaddie', perk: '"He\'s one of ours." No gameplay effect.', range: '20-39', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' };
 return { tier: 0, title: 'Stranger', perk: 'No perks', range: '0-19', color: 'text-gray-400 border-gray-500/30 bg-gray-500/10' };
}

const TIERS_LIST = [
 { level: 0, title: 'Stranger', range: '0-19', desc: 'No perks' },
 { level: 1, title: 'Squaddie', range: '20-39', desc: '"He\'s one of ours."' },
 { level: 2, title: 'Fan Favourite', range: '40-59', desc: '+10% home morale' },
 { level: 3, title: 'Cult Hero', range: '60-79', desc: '+15% stats in clutch moments' },
 { level: 4, title: 'Icon', range: '80-94', desc: '-50% media morale impact' },
 { level: 5, title: 'Legend', range: '95-100', desc: 'Statue material. Permanent +5% club stats' }
];

export function Social() {
 const { state, setPlayer } = useGame();
 
 if (!state.player) return null;
 const player = state.player;
 
 // Default mentees fallback
 const openThreads = player.stateFlags?.openThreads || {};
 const mentees = openThreads.mentees || [
 {
  id: "david_pereira",
  name: "David Pereira Da Costa",
  age: 19,
  ovr: 63,
  position: "AM",
  relationship: 60,
  isMentored: false,
  growthProgress: 0,
 },
 {
  id: "mason_saka",
  name: "Mason Saka",
  age: 18,
  ovr: 58,
  position: "RW",
  relationship: 45,
  isMentored: false,
  growthProgress: 0,
 }
 ];

 const activeMenteesCount = mentees.filter((m: any) => m.isMentored).length;
 const fanSupport = player.fans || 0;
 const currentFanTier = getFanTier(fanSupport);

 const handleToggleMentor = (menteeId: string) => {
 const updatedMentees = mentees.map((m: any) => {
  if (m.id === menteeId) {
  if (!m.isMentored && activeMenteesCount >= 2) {
   return m; // Max 2 mentees
  }
  return { ...m, isMentored: !m.isMentored };
  }
  return m;
 });

 const updatedPlayer = {
  ...player,
  stateFlags: {
  ...player.stateFlags,
  openThreads: {
   ...openThreads,
   mentees: updatedMentees
  }
  }
 };
 setPlayer(updatedPlayer);
 };

 return (
 <div id="social_screen" className="flex flex-col h-full bg-[#0c0c0c] text-white p-6 md:p-8 overflow-y-auto space-y-8">
  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#222] pb-6 gap-4">
  <div>
   <span className="text-xs font-mono font-bold tracking-widest text-[#00FF88] uppercase">RELATIONSHIPS & FAN CONNECTION</span>
   <h1 className="text-white text-3xl font-black uppercase tracking-tight mt-1">Social Hub</h1>
   <p className="text-white/50 text-xs font-mono mt-1">
   Nurture young club talent and secure the adoration of the stadium terraces.
   </p>
  </div>
  <div className="premium-card px-4 py-2 rounded flex items-center gap-3 font-mono text-xs">
   <Sparkles className="text-[#00FF88]" size={16} />
   <span>Active Mentoring: <strong className="text-white">{activeMenteesCount}/2</strong></span>
  </div>
  </div>

  {/* Fan Progression System */}
  <div id="fan_progression_card" className="premium-card p-6 space-y-6">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
   <div>
   <div className="flex items-center gap-2">
    <Crown className="text-[#00FF88]" size={20} />
    <h2 className="text-white text-lg font-bold font-display uppercase tracking-wide">Fan Adoration & Perks</h2>
   </div>
   <p className="text-xs text-white/50 font-mono mt-1">Your performances, derby wins, and loyalty shape your status with the local fans.</p>
   </div>
   
   <div className="flex items-center gap-4 glass-panel p-3 rounded">
   <div className="text-center font-mono">
    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Fan Support</span>
    <span className="text-white text-2xl font-black">{fanSupport}%</span>
   </div>
   <div className="h-8 w-[1px] bg-white/10"></div>
   <div className="font-mono">
    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Current Status</span>
    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${currentFanTier.color}`}>
    {currentFanTier.title}
    </span>
   </div>
   </div>
  </div>

  {/* Current Tier perk display */}
  <div className="bg-[#00FF88]/5 border border-[#00FF88]/10 p-4 rounded flex items-start gap-3">
   <Award className="text-[#00FF88] mt-0.5 flex-shrink-0" size={18} />
   <div>
   <span className="text-xs font-mono font-bold text-[#00FF88] uppercase tracking-wider">Active Tier Perk: {currentFanTier.title}</span>
   <p className="text-[#ccc] text-xs font-mono mt-1 leading-relaxed">{currentFanTier.perk}</p>
   </div>
  </div>

  {/* Fan Tier Roadmap / Progress Bar */}
  <div className="space-y-3">
   <ProgressBar label="Roadmap to Legend" value={fanSupport} colorMode="accent" height="h-2" />
   
   {/* Tiers Grid */}
   <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-3">
   {TIERS_LIST.map((t) => {
    const isUnlocked = fanSupport >= (t.level === 0 ? 0 : t.level === 1 ? 20 : t.level === 2 ? 40 : t.level === 3 ? 60 : t.level === 4 ? 80 : 95);
    const isActive = currentFanTier.tier === t.level;
    return (
    <div 
     key={t.level} 
     className={`p-3 border font-mono flex flex-col justify-between transition-all rounded ${
     isActive 
      ? 'border-[#00FF88] bg-[#00FF88]/10 scale-102' 
      : isUnlocked 
      ? 'border-[#222] glass-panel text-[#ccc]' 
      : 'border-[#1a1a1a] bg-[#0c0c0c] text-[#555] opacity-50'
     }`}
    >
     <div>
     <div className="flex justify-between items-start">
      <span className="text-[9px] font-bold text-[#555]">TIER {t.level}</span>
      {isUnlocked && <CheckCircle className="text-[#00FF88]" size={10} />}
     </div>
     <span className={`text-xs font-black uppercase block mt-1 ${isActive ? 'text-[#00FF88]' : ''}`}>
      {t.title}
     </span>
     <span className="text-[10px] text-white/40 font-semibold tracking-wider block mt-0.5">{t.range}% Support</span>
     </div>
     <p className="text-[9px] text-white/50 leading-tight mt-2 border-t border-[#222] pt-1.5 font-medium">
     {t.desc}
     </p>
    </div>
    );
   })}
   </div>
  </div>
  </div>

  {/* Youth Mentorship System */}
  <div className="space-y-4">
  <div className="flex justify-between items-center">
   <div>
   <h2 className="text-white text-xl font-bold font-display uppercase tracking-wide flex items-center gap-2">
    <Users className="text-[#00FF88]" size={20} />
    Youth Mentorship Program
   </h2>
   <p className="text-xs text-white/50 font-mono mt-1">
    Sacrifice 25% of your own weekly training growth to mentor club prospects under 21 with lower OVR.
   </p>
   </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   {mentees.map((mentee: any) => {
   const isMentored = mentee.isMentored;
   const isGraduate = mentee.ovr >= 80;
   const canMentorMore = activeMenteesCount < 2;
   const relationshipColor = mentee.relationship >= 80 ? 'text-emerald-400' : mentee.relationship >= 50 ? 'text-cyan-400' : 'text-amber-500';

   return (
    <div 
    key={mentee.id} 
    className={`p-6 border flex flex-col justify-between transition-all ${
     isMentored 
     ? 'border-[#00FF88] bg-[#00FF88]/5' 
     : isGraduate 
      ? 'border-amber-400 bg-amber-400/5'
      : 'border-[#222] premium-card hover:border-[#222]'
    }`}
    >
    <div>
     {/* Prospect Header */}
     <div className="flex justify-between items-start mb-4">
     <div>
      <div className="flex items-center gap-2">
      <h3 className="text-white font-black text-lg font-display uppercase tracking-tight">{mentee.name}</h3>
      <span className="text-xs font-mono text-white/40">({mentee.age} y/o)</span>
      </div>
      <span className="text-[#00FF88] text-xs font-mono font-bold uppercase block mt-0.5">
      Pos: {mentee.position} &middot; Prospect
      </span>
     </div>

     <div className="text-center font-mono">
      <span className="text-white/40 text-[8px] font-bold block uppercase tracking-widest">OVR Rating</span>
      <span className={`text-lg font-black ${isGraduate ? 'text-amber-400' : 'text-white'}`}>OVR {mentee.ovr}</span>
     </div>
     </div>

     {/* Graduate state */}
     {isGraduate && (
     <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded mb-4 flex items-start gap-2 text-amber-400 font-mono text-[11px] leading-relaxed">
      <Crown className="flex-shrink-0 mt-0.5" size={14} />
      <div>
      <strong>★ STAR GRADUATE (MENTOR CREDIT ACTIVATED):</strong> Permanent +5% to World Reputation & permanent Positive Media Perception boost!
      </div>
     </div>
     )}

     {/* Progress Indicators */}
     <div className="space-y-4 border-t border-[#222] pt-4 mb-6">
     {/* Growth progress bar */}
     <div className="space-y-1.5 font-mono">
      <div className="flex justify-between text-xs text-white/50">
      <span>Development Progress</span>
      <span className="text-white font-bold">{mentee.growthProgress}%</span>
      </div>
      <div className="w-full bg-[#1e1e1e] h-2 rounded overflow-hidden">
      <div 
       className={`h-full transition-all duration-500 ${isMentored ? 'bg-[#00FF88]' : 'bg-gray-600'}`}
       style={{ width: `${mentee.growthProgress}%` }}
      ></div>
      </div>
      <span className="text-[10px] text-[#555] italic block mt-0.5">
      {isMentored ? '🚀 Growing 2x Faster due to active mentorship!' : '🐢 Natural slow growth.'}
      </span>
     </div>

     {/* Relationship bar */}
     <div className="space-y-1.5 font-mono">
      <div className="flex justify-between text-xs text-white/50">
      <span>Relationship with You</span>
      <span className={`font-bold ${relationshipColor}`}>{mentee.relationship}%</span>
      </div>
      <div className="w-full bg-[#1e1e1e] h-2 rounded overflow-hidden">
      <div 
       className="bg-emerald-500 h-full transition-all duration-500"
       style={{ width: `${mentee.relationship}%` }}
      ></div>
      </div>
     </div>
     </div>
    </div>

    {/* Mentorship actions */}
    {!isGraduate && (
     <button
     onClick={() => handleToggleMentor(mentee.id)}
     disabled={!isMentored && !canMentorMore}
     className={`w-full py-3 font-mono font-bold uppercase tracking-wider text-[11px] transition-all border 
      ${isMentored 
      ? 'bg-[#1e1e1e] text-white border-[#222] hover:bg-red-500/10 hover:border-red-500 hover:text-red-400' 
      : canMentorMore 
       ? 'bg-[#00FF88] text-black border-transparent hover:bg-[#00FF88]' 
       : 'bg-transparent text-[#555] border-[#222] cursor-not-allowed'
      }`}
     >
     {isMentored 
      ? 'Stop Mentoring Prospect' 
      : canMentorMore 
      ? 'Begin Mentorship Program' 
      : 'Mentor Slots Full (Max 2)'
     }
     </button>
    )}
    </div>
   );
   })}
  </div>
  </div>
 </div>
 );
}

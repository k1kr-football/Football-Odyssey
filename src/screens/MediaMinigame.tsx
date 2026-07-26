import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { Mic, Radio, Award, AlertCircle, ArrowRight, MessageSquare } from 'lucide-react';

export function MediaMinigame() {
 const { state, setPlayer, advanceDay, setScreen } = useGame();
 const [step, setStep] = useState(0);
 const [aggression, setAggression] = useState(45); // Reporter aggression 0-100%
 const [tickerText, setTickerText] = useState('LIVE: PLAYER COPES WITH HIGH PRESSURE JOURNALISM DRILLS');

 const p = state.player;
 if (!p) return null;

 const scenarios = [
 {
  setup: "Senior reporter leans forward: 'Your recent performances are being torn apart by fans online. Social consensus says you lack the concentration for this tier. How do you respond?'",
  options: [
  { 
   text: "Let them talk. I only look at what the coaching staff tells me.", 
   feedback: "The press translates this as complete loyalty, though fans wanted a personal apology.",
   ticker: "BREAKING: 'COACH DECIDES MY LEVEL' - PLAYER IGNORES FAN OUTCRY",
   effect: { mediaPerception: 5, fans: -10, trust: 8, aggression: 5 } 
  },
  { 
   text: "I target perfect football. I hold myself to a higher standard than any fan accounts.", 
   feedback: "An authoritative answer. Journalists appreciate the confidence.",
   ticker: "BREAKING: HIGH STANDARDS VOWS INSPIRES BOARD CONFIDENCE",
   effect: { mediaPerception: 12, fans: 5, trust: 4, aggression: -10 } 
  },
  { 
   text: "With all respect, the casual spectators don't understand the tactical workload.", 
   feedback: "An immediate media firestorm! The fans are absolutely insulted.",
   ticker: "SENSATIONALISM: PLAYER INSULTS CUSTOMER CLASS IN BRIEFING",
   effect: { mediaPerception: -15, fans: -25, trust: -10, aggression: 30 } 
  }
  ]
 },
 {
  setup: "A Sky Sports correspondent asks: 'Reports indicate your agent is aggressively seeking an exit move to a wealthier Club next summer. Are you looking to jump ship?'",
  options: [
  { 
   text: "I am contracted to this badge. I do not gossip about my future.", 
   feedback: "A classic professional shutdown. Very safe.",
   ticker: "LIVE UPDATE: 'CONTRACTED TO THE BADGE' - TALKS OF TRANSFERS BLUNTED",
   effect: { mediaPerception: 6, trust: 10, agent: -5, aggression: -10 } 
  },
  { 
   text: "It's flattering to be linked with top clubs, but my total priority is the squad.", 
   feedback: "Leaves a door slightly open, but keeps current fans moderately content.",
   ticker: "LATEST: LINKED MOVES 'FLATTERING' SAYS RISING TALENT",
   effect: { mediaPerception: 10, fans: 5, agent: 10, aggression: 5 } 
  },
  { 
   text: "Every ambitious footballer wants to play on the absolute grandest stage possible.", 
   feedback: "The fans and manager react negatively to your open ambition.",
   ticker: "EXCLUSIVE: STARLET HINTS AT LEAVING - 'WANT THE BIGGEST STAGE'",
   effect: { mediaPerception: -10, fans: -12, trust: -15, aggression: 20 } 
  }
  ]
 },
 {
  setup: "A local radio host asks: 'Your strike partner missed a wide-open header in the dying seconds of last fixture. Did they cost the club points?'",
  options: [
  { 
   text: "We struggle together. There's zero room for finger-pointing inside our camp.", 
   feedback: "Unshakeable team spirit! The dressing room respects you immensely for this.",
   ticker: "SQUAD SOLIDARITY: 'ZERO ROOM FOR BLAME' - TEAM SPIRIT RISES",
   effect: { mediaPerception: 10, teammates: 15, aggression: -15 } 
  },
  { 
   text: "We had ample chances to seal the game beforehand. We collectively failed today.", 
   feedback: "A practical evaluation. Respectable post-game remarks.",
   ticker: "MUTED RESPONSES: LACK OF CLINICAL BITE ADMITTED BY ROSTER",
   effect: { mediaPerception: 5, teammates: 4, aggression: -5 } 
  },
  { 
   text: "When you get paid that wage, you are expected to slide those in. Simple.", 
   feedback: "Total toxic implosion! The dressing room is completely fractured.",
   ticker: "MUTINY: STAR DISMANTLES TEAMMATE'S EFFICIENCY IN RAW ATTACK",
   effect: { mediaPerception: -20, teammates: -35, aggression: 40 } 
  }
  ]
 }
 ];

 const handleChoice = (opt: typeof scenarios[0]['options'][0]) => {
 let updatedPlayer = { ...p };
 const effect = opt.effect as any;
 
 // Aggression change
 if (effect.aggression) {
  setAggression(a => Math.max(0, Math.min(100, a + (effect.aggression || 0))));
 }

 if (effect.mediaPerception) updatedPlayer.mediaPerception = Math.max(0, Math.min(100, updatedPlayer.mediaPerception + effect.mediaPerception));
 if (effect.fans) updatedPlayer.fans = Math.max(0, Math.min(100, updatedPlayer.fans + effect.fans));
 if (effect.trust) updatedPlayer.trust = Math.max(0, Math.min(100, updatedPlayer.trust + effect.trust));
 
 if (effect.teammates && updatedPlayer.relationships) {
  updatedPlayer.relationships.teammates = Math.max(0, Math.min(100, updatedPlayer.relationships.teammates + effect.teammates));
 }
 if (effect.agent && updatedPlayer.relationships) {
  updatedPlayer.relationships.agent = Math.max(0, Math.min(100, updatedPlayer.relationships.agent + effect.agent));
 }

 setPlayer(updatedPlayer);
 setTickerText(opt.ticker);

 if (step < scenarios.length - 1) {
  setStep(s => s + 1);
 } else {
  setTimeout(() => {
  advanceDay();
  setScreen('HUB');
  }, 2000);
 }
 };

 const currentScen = scenarios[step];

 if (!currentScen) {
  return (
   <div className="flex flex-col h-full bg-[#080909] p-8 justify-center items-center text-center">
    <h2 className="text-white text-xl font-bold uppercase mb-4 font-display">Media Briefing Completed</h2>
    <p className="text-white/60 text-sm mb-6 max-w-md">You've completed all media scenarios for today.</p>
    <button
     onClick={() => {
      advanceDay();
      setScreen('HUB');
     }}
     className="px-6 py-3 bg-[#00FF88] text-black font-bold uppercase tracking-wider rounded hover:brightness-110 transition-all cursor-pointer"
    >
     Continue to Hub
    </button>
   </div>
  );
 }

 return (
 <div className="flex flex-col h-full bg-[#080909] p-8 select-none font-sans justify-center items-center">
  <div className="max-w-3xl w-full flex flex-col gap-6 animate-fade-in">
  
  {/* TV Header Widget */}
  <div className="flex justify-between items-center premium-card px-6 py-4 rounded">
   <div className="flex items-center gap-3">
   <Radio className="text-red-500 animate-pulse" size={20} />
   <span className="text-white text-xs font-black tracking-widest font-display uppercase">PRE-CRITICAL PRESS BRIEFINGS</span>
   </div>
   <div className="flex items-center gap-4">
   <span className="text-[10px] uppercase font-mono font-bold text-white/40">REPORTER BIAS</span>
   <div className="bg-white/10 w-24 h-2 rounded overflow-hidden">
    <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${aggression}%` }}></div>
   </div>
   <span className="text-xs text-red-500 font-mono font-bold w-10">{aggression}%</span>
   </div>
  </div>

  {/* Live Broadcast Feed */}
  <div className="relative premium-card p-8 rounded-lg overflow-hidden flex flex-col min-h-[180px] justify-between shadow-2xl">
   <div className="absolute top-4 right-4 bg-red-600/20 border border-red-500/30 text-red-500 font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded tracking-widest">
   REC 1080P
   </div>
   
   <div className="flex gap-4">
   <MessageSquare size={24} className="text-[#00FF88] shrink-0 mt-1" />
   <div>
    <span className="text-[#00FF88] text-[10px] font-mono font-bold uppercase tracking-widest">SCENARIO {step + 1} OF 3</span>
    <p className="text-white text-md font-sans leading-relaxed mt-2 font-medium">"{currentScen.setup}"</p>
   </div>
   </div>
   
   {/* Animated TV Ticker */}
   <div className="bg-red-700 text-black font-semibold text-[11px] font-mono tracking-wider py-1.5 -mx-8 -mb-8 overflow-hidden relative flex shrink-0 items-center">
   <div className="bg-black text-white px-3 font-black text-[10px] h-full flex items-center absolute left-0 z-10 select-none">
    NEWS 24
   </div>
   <div className="whitespace-nowrap pl-24 animate-marquee inline-block uppercase text-white font-black">
    {tickerText}
   </div>
   </div>
  </div>

  {/* Response Options */}
  <div className="grid gap-3 pt-4">
   {currentScen.options.map((opt, i) => (
    <button
    key={i}
    onClick={() => handleChoice(opt)}
    className="p-5 text-left hover:border-[#00FF88] premium-card hover:bg-[#151515] text-white hover:text-[#00FF88] transition-all duration-200 flex flex-col justify-between rounded group"
    >
    <span className="text-sm font-semibold uppercase font-display leading-snug group-hover:pl-1 transition-all">{opt.text}</span>
    <span className="text-[#555] text-[10px] uppercase font-mono mt-2 group-hover:text-[#00FF88]/60 font-medium">
     View potential posture impact &middot; Professional stance
    </span>
    </button>
   ))}
  </div>

  </div>
 </div>
 );
}

import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { TeamLogo } from '../components/TeamLogo';
import { CLUBS } from '../data/teams';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { getClubSquad } from '../data/sheetSquads';
import { updateReputationAndPerception, getReputationTags, getTagName } from '../utils/reputation';
import { generatePressQuestions, PressQuestion } from '../utils/pressGenerator';


export function PressConference() {
 const { state, setPlayer, advanceDay, setScreen, setInbox } = useGame();
 const [questionIndex, setQuestionIndex] = useState(0);

 const [questions] = useState<PressQuestion[]>(() => generatePressQuestions(state));
 const p = state.player;
 if (!p) return null;
 const club = CLUBS.find(c => c.symbol.toUpperCase() === p.currentClubSymbol?.toUpperCase()) || CLUBS[0];
 const handleAnswer = (effects: PressQuestion['options'][0]['effects'], tone: string) => {
 const p = state.player;
  if (!p) return;
  let updatedPlayer = { ...p };
 
 // Press Mood Modifier
 let pressMoodMod = 0;
 if (p.form < 5 && !p.buffs?.charismatic) {
  // Poor performance + no charisma = negative spin on neutral/media perception
  pressMoodMod = -10;
 } else if (p.form >= 8 || p.buffs?.charismatic) {
  pressMoodMod = +5;
 }

 if (effects.trust) updatedPlayer.trust = Math.max(0, Math.min(100, updatedPlayer.trust + effects.trust));
 if (effects.morale) updatedPlayer.morale = Math.max(0, Math.min(100, updatedPlayer.morale + effects.morale));
 let newFans = p.fans + (effects.fans || 0);
 
 // Apply Mood modifier only to media perception outputs & trigger dynamic reputation systems
 const dMedia = effects.mediaPerception ? (effects.mediaPerception + pressMoodMod) : 0;
 const dPeer = effects.teammates || 0;
 const dWorld = (tone.toLowerCase() === 'combative' && Math.random() > 0.4) ? 1 : 0;

 const currentQ = questions[questionIndex];
 const repRes = updateReputationAndPerception(
  updatedPlayer,
  { world: dWorld, media: dMedia, peer: dPeer },
  `Press: ${tone} answer regarding ${currentQ?.journalistType || 'speculation'}`,
  state.currentWeek,
  state.currentDay
 );
 updatedPlayer = repRes.player;

 // Journalist Rivalry
 let affinityChange = 0;
 const toneLower = tone.toLowerCase();
 if (currentQ.journalistType === "Aggressive Tabloid") {
  if (toneLower === "deflect") affinityChange = -10;
  if (toneLower === "combative") affinityChange = 10;
  if (toneLower === "criticise") affinityChange = 5;
 } else if (currentQ.journalistType === "Tactical Nerd") {
  if (toneLower === "combative") affinityChange = -10;
  if (toneLower === "defend") affinityChange = 10;
  if (toneLower === "deflect") affinityChange = 5;
 } else if (currentQ.journalistType === "Friendly Local") {
  if (toneLower === "criticise") affinityChange = -15;
  if (toneLower === "praise") affinityChange = 10;
  if (toneLower === "defend") affinityChange = 5;
 }

 const journalists = updatedPlayer.stateFlags?.openThreads?.journalists || {};
 let affinity = journalists[currentQ.journalist] ?? 50;
 affinity = Math.max(0, Math.min(100, affinity + affinityChange));
 
 // Grudge logic
 if (affinity < 20) {
  newFans -= 5;
 }

 updatedPlayer.fans = Math.max(0, Math.min(100, newFans));
 
 updatedPlayer.stateFlags = {
  ...updatedPlayer.stateFlags,
  openThreads: {
  ...(updatedPlayer.stateFlags?.openThreads || {}),
  journalists: {
   ...journalists,
   [currentQ.journalist]: affinity
  }
  }
 };

 setPlayer(updatedPlayer);

  if (questionIndex < questions.length - 1) {
   setQuestionIndex(i => i + 1);
  } else {
   // Check for hostile leaks from low-affinity journalists
   const updatedInbox = [...(state.inbox || [])];
   let generatedLeak = false;

   for (const jName of Object.keys(updatedPlayer.stateFlags?.openThreads?.journalists || {})) {
    const jAffinity = updatedPlayer.stateFlags.openThreads.journalists[jName];
    if (jAffinity < 25 && Math.random() > 0.4) {
     generatedLeak = true;
     let leakSubject = "";
     let leakContent = "";
     
     if (jName === "Tom Scolder") {
      leakSubject = "🚨 EXCLUSIVE LEAK: Dressing Room Division!";
      leakContent = `Tom Scolder of Daily Sun Tabloid has published a highly toxic, unsourced report claiming that your personal conduct is destroying dressing room chemistry. The board is concerned about your rising drama profile. Trust has dropped by 5 points.`;
      updatedPlayer.trust = Math.max(0, updatedPlayer.trust - 5);
     } else if (jName === "Sarah Insight") {
      leakSubject = "📉 ANALYTICAL TEARDOWN: Ceiling Overestimated?";
      leakContent = `Sarah Insight of The Athletic has released an in-depth analytical dossier pointing out your physical regressions and criticizing your recent workrate. This public takedown has damaged your global reputation by 3 points.`;
      updatedPlayer.reputation.world = Math.max(0, updatedPlayer.reputation.world - 3);
     } else {
      leakSubject = "😡 FAN OUTCRY: Dave Local Local Column";
      leakContent = `Dave Local has written a disappointment-filled editorial detailing your combative attitude. The local fan base is starting to turn on you. Fan relationship has decreased by 8 points.`;
      updatedPlayer.fans = Math.max(0, updatedPlayer.fans - 8);
     }
     
     updatedInbox.unshift({
      id: `hostile_leak_${Date.now()}`,
      sender: jName.toUpperCase(),
      subject: leakSubject,
      content: leakContent,
      read: false,
      type: 'DM',
      timestamp: "Week " + state.currentWeek,
      choices: []
     });
     
     break; // Max one leak per conference
    }
   }

   setPlayer(updatedPlayer);
   setInbox(updatedInbox);
   advanceDay(true);
   setScreen('HUB');
  }
 };

 const currentQ = questions[questionIndex];

 if (!currentQ) {
  return (
   <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#0d0d0d]">
    <h1 className="text-white text-2xl font-bold uppercase mb-4 font-display">Press Briefing Concluded</h1>
    <p className="text-white/60 text-sm mb-6 max-w-md">The media session has finished and all questions have been answered.</p>
    <button
     onClick={() => {
      advanceDay(true);
      setScreen('HUB');
     }}
     className="px-6 py-3 bg-[#00FF88] text-black font-bold uppercase tracking-wider rounded hover:brightness-110 transition-all cursor-pointer"
    >
     Return to Hub
    </button>
   </div>
  );
 }

 return (
 <div className="flex flex-col md:flex-row h-full premium-card overflow-hidden relative">
  <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-center items-center relative">
  
  {/* Subtle Press Conference backdrop grid background */}
  <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-8 gap-4 p-8 opacity-[0.03] pointer-events-none select-none">
   {Array.from({ length: 48 }).map((_, idx) => (
   <div key={idx} className="flex flex-col items-center justify-center border border-white/20 p-2 rounded">
    <TeamLogo
    symbol={club.symbol}
    name={club.name}
    primaryColor={club.primaryColor}
    secondaryColor={club.secondaryColor}
    size={24}
    />
    <span className="text-[6px] font-mono mt-1 font-bold tracking-tighter truncate w-full text-center">{club.symbol}</span>
   </div>
   ))}
  </div>

  <div className="max-w-3xl w-full z-10">
   <div className="mb-8 flex items-center justify-between gap-4">
   <div>
    <h2 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
    LIVE BROADCAST
    </h2>
    <h1 className="text-white text-3xl font-black uppercase tracking-tighter">Post-Match Press Briefing</h1>
    <p className="text-white/50 text-xs font-mono uppercase tracking-wider mt-0.5">{club.name} Media Room</p>
   </div>
   
   <TeamLogo
    symbol={club.symbol}
    name={club.name}
    primaryColor={club.primaryColor}
    secondaryColor={club.secondaryColor}
    size={56}
    className="flex-shrink-0 bg-[#151515] p-2 rounded-lg shadow-xl"
   />
   </div>
   
   <div className="mb-10">
   <div className="glass-panel p-6 relative rounded-lg shadow-lg flex items-start gap-4">
    <CharacterPortrait type="agent" size={48} name="Reporter" showBorder={false} className="rounded shadow-inner shrink-0" />
    <div className="flex-1 min-w-0">
    <div className="absolute -top-3 left-6 premium-card px-3 py-0.5 text-white/50 text-[9px] font-bold uppercase tracking-widest rounded-md font-mono">
     REPORTER &middot; Q {questionIndex + 1} of {questions.length}
    </div>
    <p className="text-white text-lg font-semibold leading-relaxed mt-2">"{currentQ.text}"</p>
    </div>
   </div>
   </div>

   <div className="grid grid-cols-1 gap-4">
    {currentQ.options.map((opt, i) => (
    <button 
     key={i}
     onClick={() => handleAnswer(opt.effects, opt.tone)}
     className="group flex flex-col items-start p-5 hover:border-[#00FF88] glass-panel transition-all text-left w-full relative overflow-hidden rounded-md shadow-md hover:translate-x-1"
    >
     <div className="absolute right-0 top-0 bottom-0 w-2 transition-colors duration-300
     group-hover:bg-[#00FF88] bg-white/10" />
     
     <div className="text-[#00FF88] text-[9px] font-bold uppercase tracking-widest mb-1.5">{opt.tone}</div>
     <div className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-[#00FF88] transition-colors">{opt.text}</div>
    </button>
    ))}
   </div>
  </div>

  </div>

  {/* Side HUD for seeing exact consequences visually */}
  <div className="w-full md:w-[320px] border-t md:border-t-0 md:border-l border-white/10 bg-[#151515] p-8 shrink-0 flex flex-col justify-between relative z-20">
  <div>
   <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-8">Public Image</h3>
   
   <div className="space-y-6">
   <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Media Perception</span>
     <span className="text-white font-mono">{p.mediaPerception}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${p.mediaPerception}%`}}></div>
    </div>
   </div>
   <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Fan Support</span>
     <span className="text-white font-mono">{p.fans}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-[#00FF88] transition-all duration-300" style={{ width: `${p.fans}%`}}></div>
    </div>
   </div>
   <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Manager Trust</span>
     <span className="text-white font-mono">{p.trust}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${p.trust}%`}}></div>
    </div>
   </div>
   <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Dressing Room Morale</span>
     <span className="text-white font-mono">{p.morale}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${p.morale}%`}}></div>
    </div>
   </div>

   {/* Media Stance Meter */}
   <div className="pt-4 border-t border-white/5">
    <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest block mb-2">Media Stance</span>
    {(() => {
      const tags = getReputationTags(p);
      let stanceLabel = "Quiet Professional";
      let stanceDesc = "Low-profile, team-focused athlete who avoids tabloid drama.";
      let stanceColor = "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";

      if (tags.includes('MODEL_PROFESSIONAL') || tags.includes('FAN_FAVOURITE')) {
        stanceLabel = "The Hero";
        stanceDesc = "Loved by fans, trusted by the boss, a model professional on and off the pitch.";
        stanceColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 animate-pulse";
      } else if (tags.includes('MEDIA_DARLING')) {
        stanceLabel = "Media Darling";
        stanceDesc = "The golden boy of the press. Protected by positive media spin.";
        stanceColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
      } else if (tags.includes('DISRUPTIVE_INFLUENCE')) {
        stanceLabel = "The Rebel";
        stanceDesc = "A lightning rod for controversy. Tabloids love the dressing room drama.";
        stanceColor = "text-red-400 bg-red-500/10 border-red-500/30";
      } else if (tags.includes('MERCENARY')) {
        stanceLabel = "The Mercenary";
        stanceDesc = "Primarily driven by money, contract extensions, and luxury. Highly transactional.";
        stanceColor = "text-lime-400 bg-lime-500/10 border-lime-500/30";
      } else if (tags.includes('BOTTLER')) {
        stanceLabel = "Punching Bag";
        stanceDesc = "Heavily criticized by the pundits. Struggling to handle the media heat.";
        stanceColor = "text-orange-400 bg-orange-500/10 border-orange-500/30";
      }

      return (
        <div className={`p-3 rounded-lg border ${stanceColor} transition-all`}>
          <div className="font-bold text-xs uppercase tracking-wider mb-1">{stanceLabel}</div>
          <p className="text-[10px] leading-tight opacity-80">{stanceDesc}</p>
        </div>
      );
    })()}
   </div>
   </div>
  </div>

   {/* Journalists Dossier */}
   <div className="mt-8 pt-6 border-t border-white/10">
    <h3 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest mb-4">Press Room Dossier</h3>
    <div className="space-y-3">
     {[
       { name: "Dave Local", pub: "The Herald", icon: "🤝", type: "Friendly Local", desc: "Values praise & loyalty." },
       { name: "Tom Scolder", pub: "Daily Sun Tabloid", icon: "🔥", type: "Aggressive Tabloid", desc: "Seeks clickbait. Spin-heavy." },
       { name: "Sarah Insight", pub: "The Athletic", icon: "📊", type: "Tactical Nerd", desc: "Analyzes fitness & ceiling." }
     ].map(j => {
       const jAffinity = p.stateFlags?.openThreads?.journalists?.[j.name] ?? 50;
       const jStatus = jAffinity < 30 ? "Hostile 💢" : jAffinity > 70 ? "Allied 🤝" : "Neutral ⚖️";
       const statusColor = jAffinity < 30 ? "text-red-400" : jAffinity > 70 ? "text-emerald-400" : "text-zinc-400";
       const barColor = jAffinity < 30 ? "bg-red-500" : jAffinity > 70 ? "bg-emerald-500" : "bg-zinc-500";
       const isAsking = currentQ?.journalist === j.name;

       return (
         <div key={j.name} className={`p-3 rounded-lg border transition-all ${isAsking ? 'bg-white/5 border-[#00FF88]/40' : 'bg-black/20 border-white/5'}`}>
           <div className="flex justify-between items-start mb-1">
             <div>
               <div className="flex items-center gap-1.5">
                 <span className="text-[10px] font-bold text-white">{j.name}</span>
                 {isAsking && <span className="text-[8px] bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded font-bold font-mono uppercase animate-pulse">Asking</span>}
               </div>
               <span className="text-[8px] text-zinc-500 font-mono">{j.pub} &middot; {j.type}</span>
             </div>
             <span className={`text-[8px] font-bold font-mono uppercase ${statusColor}`}>{jStatus} ({jAffinity}%)</span>
           </div>
           <p className="text-[9px] text-zinc-400 mb-2 leading-tight">{j.desc}</p>
           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className={`h-full transition-all duration-300 ${barColor}`} style={{ width: `${jAffinity}%` }}></div>
           </div>
         </div>
       );
     })}
    </div>
   </div>

  </div>
 </div>
 );
}


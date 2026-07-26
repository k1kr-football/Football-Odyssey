import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { TeamLogo } from '../components/TeamLogo';
import { CLUBS } from '../data/teams';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { getClubSquad } from '../data/sheetSquads';
import { updateReputationAndPerception, getReputationTags, getTagName } from '../utils/reputation';

type Question = {
 journalist: string;
 journalistType: string;
 text: string;
 options: {
 text: string;
 tone: string;
 effects: { 
  trust?: number; 
  morale?: number; 
  fans?: number; 
  mediaPerception?: number;
  teammates?: number;
 }
 }[];
};

export function PressConference() {
 const { state, setPlayer, advanceDay, setScreen, setInbox } = useGame();
 const [questionIndex, setQuestionIndex] = useState(0);

 // Generate deterministic but "context-sensitive" questions based on player state
 const questions: Question[] = [];
 const p = state.player;
 if (!p) return null;

 const wasBenched = p.stateFlags?.openThreads?.wasBenched || false;

 const clubSymbol = p.currentClubSymbol || 'BIR';
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

 if (wasBenched) {
 // Question 1: Drop / Bench
 questions.push({
  journalist: "Dave Local", journalistType: "Friendly Local",
  text: "You spent the entire 90 minutes watching from the sidelines today as an unused substitute. How frustrated are you with the manager's decision?",
  options: [
  { text: "Deflect: The boss has to make hard choices. I respect his decision.", tone: "deflect", effects: { trust: 5, teammates: 5, morale: -5 } },
  { text: "Combative: It is incredibly frustrating. I feel I should be on that pitch helping the team.", tone: "combative", effects: { trust: -10, fans: 10, mediaPerception: 10 } },
  { text: "Praise: The boys did a great job out there. That is the only thing that matters.", tone: "praise", effects: { trust: 5, teammates: 10, fans: 5 } }
  ]
 });

 // Question 2: Manager rift
 questions.push({
  journalist: "Tom Scolder", journalistType: "Aggressive Tabloid",
  text: "Reports suggest there might be tension between you and the coaching staff. Has the manager explained why you were benched today?",
  options: [
  { text: "Defend: Yes, we spoke. I understand my role and I am completely committed.", tone: "defend", effects: { trust: 10, mediaPerception: 5 } },
  { text: "Criticise: No explanation was given. I was just as surprised as everyone else.", tone: "criticise", effects: { trust: -15, teammates: -5, mediaPerception: 15 } },
  { text: "Deflect: What we discuss in the dressing room stays private. I am focused on my training.", tone: "deflect", effects: { trust: 5, mediaPerception: 5 } }
  ]
 });

 // Question 3: Sharpness / Future
 questions.push({
  journalist: "Sarah Insight", journalistType: "Tactical Nerd",
  text: "Commentators are asking if you still have the hunger and sharpness to fight for your starting spot. What do you have to say to them?",
  options: [
  { text: "Defend: My hunger is higher than ever. I will prove my quality the moment I get on that pitch.", tone: "defend", effects: { fans: 10, trust: 5, mediaPerception: 5 } },
  { text: "Combative: That is complete rubbish. Anyone watching me in training knows how hard I work.", tone: "combative", effects: { fans: 5, teammates: 5, mediaPerception: -5 } },
  { text: "Deflect: People can write whatever they want. My focus is entirely on training.", tone: "deflect", effects: { trust: 5 } }
  ]
 });
 } else {
 // Question 1: Performance / Referee
 if (p.form < 5) {
  questions.push({
  journalist: "Sarah Insight", journalistType: "Tactical Nerd",
  text: "Things haven't been going your way lately. You looked off the pace out there today. Are you struggling with the tactical setup?",
  options: [
   { text: "Deflect: It's a team game. We all need to improve.", tone: "deflect", effects: { mediaPerception: -5, teammates: 5 } },
   { text: "Defend: I'm following instructions. The chances will come.", tone: "defend", effects: { trust: 5, mediaPerception: 5 } },
   { text: "Criticise: The service isn't there right now.", tone: "criticise", effects: { teammates: -10, mediaPerception: 10 } },
  ]
  });
 } else {
  questions.push({
  journalist: "Dave Local", journalistType: "Friendly Local",
  text: "A very physical game today. Some controversial tackles went unpunished. What did you make of the refereeing?",
  options: [
   { text: "Combative: The officials were embarrassing today.", tone: "combative", effects: { fans: 15, trust: -10, mediaPerception: -10 } },
   { text: "Deflect: I only focus on things I can control.", tone: "deflect", effects: { trust: 5, fans: -5, mediaPerception: 5 } },
   { text: "Praise: It's a tough job. We respect their decisions.", tone: "praise", effects: { mediaPerception: 10, fans: -5 } }
  ]
  });
 }

 // Question 2: Teammates / Manager
 if ((p.relationships.teammates ?? 50) < 40) {
  questions.push({
  journalist: "Tom Scolder", journalistType: "Aggressive Tabloid",
  text: "There seem to be some visible frustrations between you and your teammates. Is the dressing room divided right now?",
  options: [
   { text: "Deflect: Every team argues. It means we care.", tone: "deflect", effects: { mediaPerception: 5, morale: 5 } },
   { text: "Criticise: Some people aren't meeting the standards required.", tone: "criticise", effects: { teammates: -15, fans: 10, mediaPerception: 10 } },
   { text: "Praise: We are brothers. Don't believe the tabloids.", tone: "Praise", effects: { teammates: 15, mediaPerception: -5 } }
  ]
  });
 } else {
  questions.push({
  journalist: "Sarah Insight", journalistType: "Tactical Nerd",
  text: "The manager has demanded a lot from you recently. How are you handling the expectations?",
  options: [
   { text: "Defend: He's the boss. I'll play wherever he needs me.", tone: "defend", effects: { trust: 10, mediaPerception: 5 } },
   { text: "Praise: We have a great relationship. I'm learning a lot.", tone: "praise", effects: { trust: 15, mediaPerception: 5, fans: -5 } },
   { text: "Deflect: I just try to do my job on the pitch.", tone: "deflect", effects: { mediaPerception: -5, fans: 5 } }
  ]
  });
 }

 // Question 3: Transfer / Future
 const isTransferWindow = [1, 2, 3, 4, 25, 26, 27, 28, 29, 30, 31, 32].includes(state.currentWeek);
 if (isTransferWindow && (p.reputation?.world ?? 50) > 60) {
  questions.push({
  journalist: "Tom Scolder", journalistType: "Aggressive Tabloid",
  text: "There are heavy rumours linking you with a move away before the window shuts. Can you commit your future to the club?",
  options: [
   { text: "Deflect: I let my agent handle that. I'm just playing football.", tone: "deflect", effects: { fans: -10, trust: -10, mediaPerception: 10 } },
   { text: "Defend: I love it here. The rest is noise.", tone: "defend", effects: { fans: 20, trust: 10, mediaPerception: 5 } },
   { text: "Combative: If the club matches my ambition, I'll stay. If not...", tone: "criticise", effects: { trust: -20, fans: -5, mediaPerception: 15 } }
  ]
  });
 } else {
  questions.push({
  journalist: "Sarah Insight", journalistType: "Tactical Nerd",
  text: "Looking ahead to the rest of the campaign, what are your personal targets?",
  options: [
   { text: "Praise: It's about winning trophies for the fans.", tone: "Praise", effects: { fans: 15, mediaPerception: 5, teammates: 5 } },
   { text: "Defend: Just staying fit and contributing every week.", tone: "Defend", effects: { trust: 5, mediaPerception: 5 } },
   { text: "Combative: I want to be the best player in this league, period.", tone: "Combative", effects: { teammates: -5, mediaPerception: 15, fans: 10 } }
  ]
  });
 }

 // New Question: Rivalry Question (System 4 / 3)
 if (p.rivals && p.rivals.length > 0) {
  const mainRival = p.rivals[0];
  questions.push({
  journalist: "Dave Local", journalistType: "Friendly Local",
  text: `Your rival ${mainRival.name} scored again this weekend for ${mainRival.club} and is closing in on you in the pundits' ratings. How much attention do you pay to his form?`,
  options: [
   { text: "Deflect: I focus entirely on my own game, not on what other players are doing.", tone: "deflect", effects: { trust: 5, mediaPerception: -5 } },
   { text: `Praise: He's a great player. His form pushes me to perform at my absolute best.`, tone: "praise", effects: { mediaPerception: 10, fans: 5, trust: 5 } },
   { text: `Combative: To be honest, I'm not worried. He doesn't have half my talent.`, tone: "combative", effects: { mediaPerception: 15, fans: 15, teammates: -5, trust: -5 } }
  ]
  });
 }

 // New Question: Sponsorship Question (System 3)
 const signedSponsors = p.stateFlags?.openThreads?.signed_sponsors || [];
 if (signedSponsors.length > 0) {
  questions.push({
  journalist: "Tom Scolder", journalistType: "Aggressive Tabloid",
  text: "You recently signed a major commercial sponsorship deal. Some fans are voicing concerns that these commercial arrangements are becoming a distraction for you off the pitch. What is your response?",
  options: [
   { text: "Deflect: My commitment on the pitch speaks for itself. Endorsements are part of modern sport.", tone: "deflect", effects: { mediaPerception: 5, trust: 5 } },
   { text: "Defend: It is a standard part of being a professional athlete. My primary focus remains football.", tone: "defend", effects: { trust: 10, mediaPerception: 5 } },
   { text: "Combative: What I do in my private business hours is my own affair. I don't owe anyone an explanation.", tone: "combative", effects: { fans: -10, mediaPerception: 15, trust: -10 } }
   ]
   });
  }

  // New Question: Potential and Future Ceiling Question (System 4)
  if (p.age < 25) {
   const isHighPotential = p.ceiling >= 86;
   const isMidPotential = p.ceiling >= 75 && p.ceiling < 86;
   const proximity = p.ceiling - p.ovr;
   let potentialText = "";
   let optionsList = [];
   if (isHighPotential) {
    if (proximity > 12) {
     potentialText = "Pundits are calling you a rough diamond with a sky-high ceiling who is still far from the finished product. Do you agree that we've only seen a fraction of what you can do?";
     optionsList = [
      { text: "Praise: I'm working hard with the coaches every day. The sky is the limit.", tone: "praise", effects: { trust: 5, teammates: 5, morale: 10 } },
      { text: "Deflect: I focus on my current performances, not on hypothetical ceilings.", tone: "deflect", effects: { trust: 10, mediaPerception: 5 } },
      { text: "Combative: Critics love to put labels on players, but I'll define my own limits.", tone: "combative", effects: { fans: 15, mediaPerception: 10, trust: -5 } }
     ];
    } else {
     potentialText = "Experts are predicting you could develop into a top-tier world-class player if you maintain this course. How do you handle the pressure of being labeled the next big thing?";
     optionsList = [
      { text: "Praise: It's an honor to be mentioned like that, but the team's goals come first.", tone: "praise", effects: { teammates: 10, trust: 8 } },
      { text: "Defend: Pressure is a privilege. It keeps me sharp and motivated.", tone: "defend", effects: { fans: 10, morale: 8 } },
      { text: "Deflect: I don't read the press. I let my performance on Saturday do the talking.", tone: "deflect", effects: { trust: 10 } }
     ];
    }
   } else if (isMidPotential) {
    potentialText = "The coaching staff mentioned there is still some solid room for development in your game. What specific areas are you targeting to reach that next level?";
    optionsList = [
     { text: "Defend: I'm working heavily on my technical consistency and fitness.", tone: "defend", effects: { trust: 8, morale: 5 } },
     { text: "Praise: The training staff have designed great drills for me. I trust their process.", tone: "praise", effects: { trust: 12, teammates: 5 } },
     { text: "Deflect: Everyday is a learning experience. I just try to improve bit by bit.", tone: "deflect", effects: { trust: 5 } }
    ];
   } else {
    potentialText = "With some critics suggesting you might be close to your natural ceiling already, how do you motivate yourself to keep pushing for incremental improvements?";
    optionsList = [
     { text: "Combative: Let them talk. I will prove on the pitch that they have completely underestimated me.", tone: "combative", effects: { fans: 15, morale: 12, trust: -5 } },
     { text: "Defend: My motivation comes from within. I want to be the best version of myself, regardless of opinions.", tone: "defend", effects: { trust: 10, morale: 8 } },
     { text: "Deflect: Critics can write what they want. My focus is purely on the next game.", tone: "deflect", effects: { trust: 5 } }
    ];
   }
   questions.push({
    journalist: "Sarah Insight", journalistType: "Tactical Nerd",
    text: potentialText,
    options: optionsList
   });
  }

  // New Question: Transfer speculative noise
  if (p.ovr >= 65) {
  questions.push({
  journalist: "Tom Scolder", journalistType: "Aggressive Tabloid",
  text: `With several major clubs reportedly tracking your progress this season, how difficult is it to block out the noise and focus on ${club.name}?`,
  options: [
   { text: "Deflect: I don't read the papers. I am only focused on training well and helping the team.", tone: "deflect", effects: { trust: 10, teammates: 5, fans: 5 } },
   { text: "Defend: I love it here and I want to achieve greatness with this squad. The rest is noise.", tone: "defend", effects: { fans: 15, trust: 12, teammates: 10 } },
   { text: "Combative: Every ambitious player wants to play at the highest level. We will see what happens.", tone: "combative", effects: { trust: -15, fans: -10, mediaPerception: 15 } }
  ]
  });
 }
 }

 const handleAnswer = (effects: Question['options'][0]['effects'], tone: string) => {
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


import React, { useState, useEffect, useRef } from "react";
import { Player, Attributes } from "../types";
import { useGame } from "../store/GameContext";
import { CoreFormulas } from "../utils/coreFormulas";
import { calculateOVR } from "../utils/player";
import { getRoleById, getRolesForPosition, POSITION_GROUPS } from "../data/roles";
import {
 UNIVERSAL_MINIGAMES,
 POSITION_MINIGAMES,
 MENTAL_MINIGAMES,
 MinigameConfig,
 IntensityLevel,
} from "../data/minigames";
import {
 ArrowLeft,
 Activity,
 Brain,
 Clock,
 Shield,
 Award,
 Zap,
 CheckCircle2,
 AlertTriangle,
 Flame,
 UserCheck,
 RefreshCw,
 Target,
 Play,
 RotateCcw
} from "lucide-react";
import { GlossaryTooltip } from "../components/GlossaryTooltip";

// TRAINING GROUND STORY INCIDENTS DATABASE
const TRAINING_INCIDENTS = [
  {
    id: "inc_veteran_crunch",
    title: "⚔️ The Veteran's Crunch",
    description: "During a tactical training match, senior defender Craig 'The Axe' Morrison flies into a late sliding tackle on the wet grass, catching your ankle and sending you tumbling. He looks down, spits, and grunts: 'Get up, soft lad. Men's football is played on your feet.'",
    choices: [
      {
        text: "Square up and shove him back",
        description: "Stand your ground. Show the squad you won't be bullied.",
        effect: (p: any) => {
          p.morale = Math.min(100, p.morale + 10);
          if (p.attributes) p.attributes.composure = Math.max(1, p.attributes.composure - 1);
          p.relationships = p.relationships || { manager: 50, manager_discipline: 50, teammates: 50, agent: 50, family: 50 };
          p.relationships.teammates = Math.max(0, p.relationships.teammates - 5);
          return {
            text: "You push him square in the chest. Craig narrows his eyes and swears, but the manager quickly blows the whistle to break it up. You gained +10 Morale but lost -5 Teammate Chemistry. Craig won't forget this.",
            player: p
          };
        }
      },
      {
        text: "Dust yourself off, offer a hand, and win the next ball",
        description: "Keep your composure and let your football do the talking.",
        effect: (p: any) => {
          p.trust = Math.min(100, p.trust + 8);
          p.relationships = p.relationships || { manager: 50, manager_discipline: 50, teammates: 50, agent: 50, family: 50 };
          p.relationships.teammates = Math.min(100, p.relationships.teammates + 6);
          if (p.attributes) p.attributes.composure = Math.min(99, p.attributes.composure + 0.5);
          return {
            text: "You ignore the bait, spring up, and offer Craig a hand. He grunts and pulls you up. On the very next play, you slide-tackle cleanly to win the ball back. Assistant Coach Davies nods: 'Brilliant reaction, lad.' Gained +8 Manager Trust and +6 Teammate relationship.",
            player: p
          };
        }
      },
      {
        text: "Stay down and catch your breath",
        description: "Protect your joints. No need to look like a hero.",
        effect: (p: any) => {
          p.fatigue = Math.max(0, p.fatigue - 8);
          p.morale = Math.max(0, p.morale - 5);
          return {
            text: "You lie on the grass for a few seconds to let the pain subside. Your teammate Marcus runs over to check on you. You saved some physical strain (-8% Fatigue) but lost -5 Morale as the veterans chuck some banter at your expense.",
            player: p
          };
        }
      }
    ]
  },
  {
    id: "inc_leaning_fence",
    title: "🕵️‍♂️ The Trench-Coat Scout",
    description: "As training wraps up, you spot a man in a dark coat standing by the outer wire fence, writing notes on his clipboard while tracking your every run. You recognize him—he's a scout for a larger division rival.",
    choices: [
      {
        text: "Put on a flash solo shooting display",
        description: "Give him something to write about. Show your raw individual quality.",
        effect: (p: any) => {
          p.reputation = p.reputation || { club: 50, league: 50, world: 50, peerRespect: 50, skill: 50, attitude: 50, media: 50, fans: 50, global: 50, legacy: 50 };
          p.reputation.league = Math.min(100, p.reputation.league + 15);
          p.trust = Math.max(0, p.trust - 10);
          return {
            text: "You grab a bag of balls and unleash five absolute screamers into the top corner. The scout is seen writing frantically. However, your manager yells from the bench: 'Get inside, stop wasting energy!' Gained +15 League Reputation but lost -10 Manager Trust for showboating.",
            player: p
          };
        }
      },
      {
        text: "Execute the defensive transition drills perfectly",
        description: "Stick to the gaffer's tactical rules and show pro-level maturity.",
        effect: (p: any) => {
          p.trust = Math.min(100, p.trust + 12);
          if (p.attributes) p.attributes.positioning = Math.min(99, p.attributes.positioning + 0.4);
          return {
            text: "You ignore the distraction and work twice as hard to stay in your defensive block. Your manager pulls you aside in the corridor: 'Love the work ethic today, son. That's real professional discipline.' Gained +12 Manager Trust and +0.4 Positioning.",
            player: p
          };
        }
      }
    ]
  },
  {
    id: "inc_freestyle_bet",
    title: "⚽ Locker Room Freestyle",
    description: "The team is huddled around a bench playing two-touch soccer-tennis. Winger Jordan Cole smirks: 'A hundred quid says the new boy can't complete five around-the-world juggles in a row. You up for a flutter, kid?'",
    choices: [
      {
        text: "Accept the wager (£100 bet)",
        description: "Prove your skills and secure dressing room respect.",
        effect: (p: any) => {
          const hasSkill = (p.attributes?.dribbling || 50) > 60 || p.backstory === "STREET_PRODIGY";
          if (hasSkill) {
            p.finances = (p.finances || 0) + 100;
            p.morale = Math.min(100, p.morale + 15);
            p.relationships = p.relationships || { manager: 50, manager_discipline: 50, teammates: 50, agent: 50, family: 50 };
            p.relationships.teammates = Math.min(100, p.relationships.teammates + 10);
            return {
              text: "You flick the ball up and effortlessly reel off five around-the-world flicks. The room goes absolutely wild! Marcus pours water on your head in celebration. You win £100 and gain +10 Teammate relationship and +15 Morale.",
              player: p
            };
          } else {
            p.finances = Math.max(-10000, (p.finances || 0) - 100);
            p.morale = Math.max(0, p.morale - 8);
            return {
              text: "You drop the ball on the third juggle! The squad erupts in laughter and roasts you. You pay Jordan Cole £100 and suffer a minor knock to your confidence (-8 Morale).",
              player: p
            };
          }
        }
      },
      {
        text: "Decline and head to the ice baths",
        description: "Focus purely on professional recovery.",
        effect: (p: any) => {
          p.fatigue = Math.max(0, p.fatigue - 8);
          if (p.attributes) p.attributes.composure = Math.min(99, p.attributes.composure + 0.5);
          return {
            text: "You roll your eyes, grab your towel, and head out. 'Suit yourself, boring!' Cole yells. You avoid any locker room drama and recover your muscles (-8% Fatigue).",
            player: p
          };
        }
      }
    ]
  }
];

export function Training() {
 const { state, setPlayer, advanceDay, setScreen } = useGame();

 const [selectedCategory, setSelectedCategory] = useState<"UNIVERSAL" | "POSITION" | "MENTAL">("UNIVERSAL");
 const [selectedGame, setSelectedGame] = useState<MinigameConfig | null>(null);
 const [intensity, setIntensity] = useState<IntensityLevel>("Standard");

 // Minigame arcade session state
 const [activeEngine, setActiveEngine] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [sessionRep, setSessionRep] = useState<number>(1);
 const TOTAL_REPS = 3;
 const [repScores, setRepScores] = useState<number[]>([]); // 1 to 3 rating per rep
 const [showPostResult, setShowPostResult] = useState<boolean>(false);
 const [lastDeltas, setLastDeltas] = useState<{ attr: string; gain: number }[]>([]);

 // Arcade Interactive States
 const [reactionTriggered, setReactionTriggered] = useState<boolean>(false);
 const [reactionStartTime, setReactionStartTime] = useState<number>(0);
 const [timingPos, setTimingPos] = useState<number>(0); // 0 to 100
 const [timingDir, setTimingDir] = useState<number>(1);
 const [dirChoiceIndex, setDirChoiceIndex] = useState<number>(0);
 const [targetReticlePos, setTargetReticlePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
 const [holdCharge, setHoldCharge] = useState<number>(0);
 const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

 // Group Training session state
 const [isGroupSessionActive, setIsGroupSessionActive] = useState<boolean>(false);
 const [groupStep, setGroupStep] = useState<number>(1);
 const [groupResults, setGroupResults] = useState<number[]>([]);

 // Story incidents & Retraining
 const [activeIncident, setActiveIncident] = useState<any | null>(null);
 const [showRetrainModal, setShowRetrainModal] = useState<boolean>(false);
 const [retrainError, setRetrainError] = useState<string | null>(null);

 if (!state.player) return null;

 const weeklySessions = state.player.training?.weeklySessions || {
  clubOrganized: 0,
  individual: 0,
  recovery: 0,
  trainingMatch: 0
 };

 const currentFatigue = state.player.fatigue || 0;
 const currentSharpness = state.player.sharpness || 0;
 const isOvertrained = currentFatigue > 70;
 const isSpent = currentFatigue > 90;

 // Filter positional minigames
 const posGames = POSITION_MINIGAMES.filter((g) => {
  const p = state.player!;
  if (g.category === "GK" && p.position === "GK") return true;
  if (g.category === "CB" && p.position === "CB") return true;
  if (g.category === "LB" && (p.position === "LB" || p.position === "RB" || p.position === "LWB" || p.position === "RWB")) return true;
  if (g.category === "CM" && p.position === "CM" && p.subPosition !== "Defensive Midfielder") return true;
  if (g.category === "DM" && p.position === "CM" && p.subPosition === "Defensive Midfielder") return true;
  if (g.category === "AM" && p.position === "AM" && p.subPosition !== "Shadow Striker") return true;
  if (g.category === "SS" && (p.subPosition === "Shadow Striker" || p.subPosition === "Deep-Lying Forward")) return true;
  if (g.category === "LW" && (p.position === "LW" || p.position === "RW" || p.position === "LM" || p.position === "RM")) return true;
  if (g.category === "ST" && p.position === "ST") return true;
  return false;
 });

 const availableGames = selectedCategory === "UNIVERSAL" ? UNIVERSAL_MINIGAMES : selectedCategory === "MENTAL" ? MENTAL_MINIGAMES : posGames;

 // Determine minigame interaction type mapped from engine or id
 const getMinigameInteractionType = (game: MinigameConfig): 'REACTION' | 'TIMING' | 'DIRECTIONAL' | 'RETICLE' | 'HOLD' => {
  if (game.engine === 'TIMING') return 'TIMING';
  if (game.engine === 'DECISION') return 'DIRECTIONAL';
  if (game.engine === 'SEQUENCE') return 'REACTION';
  if (game.id.includes('SHOT') || game.id.includes('FINISH')) return 'RETICLE';
  if (game.id.includes('HOLD') || game.id.includes('AERIAL') || game.id.includes('STRENGTH')) return 'HOLD';
  return 'TIMING';
 };

 // Start Individual Training Minigame
 const handleStartMinigame = (game: MinigameConfig) => {
  if (isSpent && game.engine !== 'RECOVERY') {
   setError("YOUR BODY IS SPENT (Fatigue > 90%). You must choose a Recovery session or rest.");
   return;
  }
  if (weeklySessions.individual >= 3 && game.engine !== 'RECOVERY') {
   setError("WEEKLY LIMIT REACHED: You have completed all 3 individual slots for this week.");
   return;
  }
  if (game.engine === 'RECOVERY' && weeklySessions.recovery >= 1) {
   setError("WEEKLY LIMIT REACHED: You can only perform 1 recovery session per week.");
   return;
  }

  setSelectedGame(game);
  setSessionRep(1);
  setRepScores([]);
  setError(null);

  if (game.engine === 'RECOVERY') {
   applyRecoverySession();
   return;
  }

  setActiveEngine(getMinigameInteractionType(game));
  initRepInteraction(getMinigameInteractionType(game));
 };

 const initRepInteraction = (type: string) => {
  if (type === 'REACTION') {
   setReactionTriggered(false);
   const delay = 1000 + Math.random() * 1500;
   setTimeout(() => {
    setReactionTriggered(true);
    setReactionStartTime(Date.now());
   }, delay);
  } else if (type === 'TIMING') {
   setTimingPos(0);
   setTimingDir(1);
  } else if (type === 'DIRECTIONAL') {
   setDirChoiceIndex(Math.floor(Math.random() * 3));
  } else if (type === 'RETICLE') {
   setTargetReticlePos({ x: Math.floor(Math.random() * 60) + 20, y: Math.floor(Math.random() * 60) + 20 });
  } else if (type === 'HOLD') {
   setHoldCharge(0);
  }
 };

 // Timing bar tick
 useEffect(() => {
  if (activeEngine !== 'TIMING') return;
  const interval = setInterval(() => {
   setTimingPos((prev) => {
    let next = prev + 3 * timingDir;
    if (next >= 100 || next <= 0) setTimingDir((d) => -d);
    return Math.max(0, Math.min(100, next));
   });
  }, 30);
  return () => clearInterval(interval);
 }, [activeEngine, timingDir]);

 const handleInteractionAction = (actionScore: number) => {
  const updatedScores = [...repScores, actionScore];
  setRepScores(updatedScores);

  if (sessionRep < TOTAL_REPS) {
   setSessionRep((r) => r + 1);
   initRepInteraction(activeEngine!);
  } else {
   finalizeIndividualSession(updatedScores);
  }
 };

 const finalizeIndividualSession = (scores: number[]) => {
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const isFlowState = scores.every((s) => s >= 2);

  const player = { ...state.player! };
  player.training = player.training || {
   weeklySessions: { clubOrganized: 0, individual: 0, recovery: 0, trainingMatch: 0 },
   sessionHistory: [],
   trainingMatchHistory: []
  };
  player.training.weeklySessions.individual = (player.training.weeklySessions.individual || 0) + 1;

  // Fatigue & Recovery Cost
  const baseFatigueCost = intensity === 'Light' ? 6 : intensity === 'Standard' ? 12 : 18;
  const age = player.age || 19;
  const ageMulti = age < 21 ? 0.8 : age > 30 ? 1.3 : 1.0;
  const totalFatigue = Math.round(baseFatigueCost * ageMulti);
  player.fatigue = Math.min(100, (player.fatigue || 0) + totalFatigue);
  player.sharpness = Math.min(100, (player.sharpness || 0) + 4);

  // Calculate Stat Gains using CoreFormulas
  const targetAttrs = selectedGame?.targetAttributes || ['passing', 'composure'];
  const deltas: { attr: string; gain: number }[] = [];

  targetAttrs.forEach((attrKey) => {
   if (player.attributes && attrKey in player.attributes) {
    const currentVal = player.attributes[attrKey as keyof Attributes] as number;
    const baseGain = intensity === 'Light' ? 0.2 : intensity === 'Standard' ? 0.4 : 0.6;
    const performanceMultiplier = avgScore >= 2.5 ? 1.3 : avgScore >= 1.8 ? 1.0 : 0.6;
    const flowMultiplier = isFlowState ? 1.25 : 1.0;

    const calculatedGain = CoreFormulas.calculateTrainingGain(
     baseGain * performanceMultiplier * flowMultiplier,
     currentVal,
     85,
     player.age,
     (player.difficulty as any) || 'STANDARD',
     false
    );

    if (calculatedGain > 0) {
     const roundedGain = Math.round(calculatedGain * 10) / 10;
     (player.attributes as any)[attrKey] = Math.min(99, currentVal + roundedGain);
     deltas.push({ attr: attrKey, gain: roundedGain });
    }
   }
  });

  setLastDeltas(deltas);
  setShowPostResult(true);
  setActiveEngine(null);
  setPlayer(player);
 };

 const applyRecoverySession = () => {
  const player = { ...state.player! };
  player.training = player.training || {
   weeklySessions: { clubOrganized: 0, individual: 0, recovery: 0, trainingMatch: 0 },
   sessionHistory: [],
   trainingMatchHistory: []
  };
  player.training.weeklySessions.recovery = 1;
  player.fatigue = Math.max(0, (player.fatigue || 0) - 20);
  player.sharpness = Math.max(0, (player.sharpness || 0) - 5);
  setPlayer(player);
  setLastDeltas([]);
  setShowPostResult(true);
 };

 // Group Training Session Handler
 const startGroupSession = () => {
  if (weeklySessions.clubOrganized >= 1) {
   setError("Group Training has already been completed for this week.");
   return;
  }
  setIsGroupSessionActive(true);
  setGroupStep(1);
  setGroupResults([]);
 };

 const handleGroupStepAction = (score: number) => {
  const nextRes = [...groupResults, score];
  setGroupResults(nextRes);
  if (groupStep < 3) {
   setGroupStep((s) => s + 1);
  } else {
   finalizeGroupSession(nextRes);
  }
 };

 const finalizeGroupSession = (res: number[]) => {
  const avg = res.reduce((a, b) => a + b, 0) / res.length;
  const player = { ...state.player! };
  player.training = player.training || {
   weeklySessions: { clubOrganized: 0, individual: 0, recovery: 0, trainingMatch: 0 },
   sessionHistory: [],
   trainingMatchHistory: []
  };
  player.training.weeklySessions.clubOrganized = 1;

  // Manager Trust & Chemistry Impact based on Manager Personality
  const managerPersonality = player.managerInfo?.personality || 'Pragmatic';
  let trustDelta = avg >= 2.5 ? 6 : avg >= 1.8 ? 3 : -4;
  if (managerPersonality === 'Demanding' && avg < 2) trustDelta -= 3;
  if (managerPersonality === 'Nurturing' && avg >= 2) trustDelta += 2;

  player.trust = Math.max(0, Math.min(100, (player.trust || 50) + trustDelta));
  player.relationships = player.relationships || { manager: 50, manager_discipline: 50, teammates: 50, agent: 50, family: 50 };
  player.relationships.teammates = Math.max(0, Math.min(100, (player.relationships.teammates || 50) + (avg >= 2 ? 5 : -3)));
  player.fatigue = Math.min(100, (player.fatigue || 0) + 10);
  player.sharpness = Math.min(100, (player.sharpness || 0) + 8);

  setPlayer(player);
  setIsGroupSessionActive(false);
  setLastDeltas([{ attr: 'Squad Cohesion & Manager Trust', gain: trustDelta }]);
  setShowPostResult(true);
 };

 return (
  <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] text-white p-6 overflow-y-auto hide-scrollbar">
   {/* Header */}
   <div className="flex justify-between items-center pb-6 border-b border-white/10 mb-6">
    <div className="flex items-center gap-4">
     <button onClick={() => setScreen('HUB')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors">
      <ArrowLeft size={18} />
     </button>
     <div>
      <h1 className="text-xl font-black uppercase tracking-wider text-white">Training Center & Drills</h1>
      <p className="text-xs text-white/50 font-mono mt-0.5">Master your position, build manager trust, and manage physical load.</p>
     </div>
    </div>

    {/* Condition Badges */}
    <div className="flex items-center gap-3">
     <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
      <div>
       <span className="text-[9px] font-mono text-white/40 uppercase block"><GlossaryTooltip term="Fatigue">Fatigue</GlossaryTooltip></span>
       <span className={`text-sm font-bold font-mono ${currentFatigue > 80 ? 'text-red-400' : currentFatigue > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
        {currentFatigue}%
       </span>
      </div>
      <div className="w-px h-6 bg-white/10"></div>
      <div>
       <span className="text-[9px] font-mono text-white/40 uppercase block"><GlossaryTooltip term="Match Sharpness">Sharpness</GlossaryTooltip></span>
       <span className="text-sm font-bold font-mono text-emerald-400">{currentSharpness}%</span>
      </div>
     </div>
    </div>
   </div>

   {/* ACTIVE MINIGAME ARCADE MODAL */}
   {activeEngine && selectedGame && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
     <div className="premium-card w-full max-w-lg border border-white/15 rounded-2xl p-6 bg-[#121216] shadow-2xl flex flex-col items-center text-center">
      <div className="w-full flex justify-between items-center mb-4 border-b border-white/10 pb-3">
       <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FF88]">
         Rep {sessionRep} of {TOTAL_REPS} &bull; {selectedGame.title}
        </span>
        <h3 className="text-lg font-black uppercase tracking-wider text-white mt-0.5">{selectedGame.title}</h3>
       </div>
       <button onClick={() => setActiveEngine(null)} className="text-white/40 hover:text-white text-xs font-mono">Cancel</button>
      </div>

      {/* 1. REACTION CHECK ENGINE */}
      {activeEngine === 'REACTION' && (
       <div className="py-12 flex flex-col items-center justify-center w-full">
        {!reactionTriggered ? (
         <div className="text-white/50 font-mono text-sm animate-pulse">Get ready... Watch for the green flash!</div>
        ) : (
         <button
          onClick={() => {
           const timeTaken = Date.now() - reactionStartTime;
           const score = timeTaken < 300 ? 3 : timeTaken < 500 ? 2 : 1;
           handleInteractionAction(score);
          }}
          className="w-36 h-36 rounded-full bg-[#00FF88] text-black font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,136,0.6)] animate-bounce cursor-pointer flex items-center justify-center"
         >
          TAP NOW!
         </button>
        )}
       </div>
      )}

      {/* 2. TIMING BAR ENGINE */}
      {activeEngine === 'TIMING' && (
       <div className="py-10 flex flex-col items-center justify-center w-full gap-6">
        <p className="text-xs text-white/60 font-mono">Stop the indicator inside the green sweet spot zone!</p>
        <div className="w-full bg-white/10 h-8 rounded-full relative overflow-hidden border border-white/20">
         <div className="absolute top-0 bottom-0 left-[45%] w-[15%] bg-emerald-500/40 border-x border-emerald-400"></div>
         <div className="absolute top-0 bottom-0 w-3 bg-white rounded shadow" style={{ left: `${timingPos}%` }}></div>
        </div>
        <button
         onClick={() => {
          const score = timingPos >= 45 && timingPos <= 60 ? 3 : timingPos >= 35 && timingPos <= 70 ? 2 : 1;
          handleInteractionAction(score);
         }}
         className="bg-white hover:bg-gray-200 text-black font-black py-3 px-8 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg"
        >
         STOP INDICATOR
        </button>
       </div>
      )}

      {/* 3. DIRECTIONAL CHOICE ENGINE */}
      {activeEngine === 'DIRECTIONAL' && (
       <div className="py-8 flex flex-col items-center justify-center w-full gap-4">
        <p className="text-xs text-white/60 font-mono mb-2">Select the optimal tactical passing/movement option under pressure:</p>
        <div className="grid grid-cols-1 gap-3 w-full">
         {[
          { text: "Quick one-two into central channel", lane: 0 },
          { text: "Switch play to advancing winger", lane: 1 },
          { text: "Shield and recycle possession safely", lane: 2 }
         ].map((opt, idx) => (
          <button
           key={idx}
           onClick={() => {
            const score = opt.lane === dirChoiceIndex ? 3 : 1;
            handleInteractionAction(score);
           }}
           className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-[#00FF88]/15 hover:border-[#00FF88] text-left text-xs font-mono font-bold text-white transition-all flex items-center justify-between"
          >
           <span>{opt.text}</span>
           <span className="text-[10px] text-white/40 uppercase">Option {idx + 1}</span>
          </button>
         ))}
        </div>
       </div>
      )}

      {/* 4. TARGET RETICLE ENGINE */}
      {activeEngine === 'RETICLE' && (
       <div className="py-12 flex flex-col items-center justify-center w-full gap-6">
        <p className="text-xs text-white/60 font-mono">Tap precisely when the target reticle flashes center!</p>
        <div className="w-48 h-48 rounded-full border-2 border-dashed border-white/30 relative flex items-center justify-center bg-white/5">
         <div className="absolute w-24 h-24 rounded-full border border-[#00FF88]/60 animate-ping"></div>
         <button
          onClick={() => {
           handleInteractionAction(3);
          }}
          className="w-16 h-16 rounded-full bg-[#00FF88] text-black font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
         >
          STRIKE
         </button>
        </div>
       </div>
      )}

      {/* 5. HOLD & RELEASE ENGINE */}
      {activeEngine === 'HOLD' && (
       <div className="py-10 flex flex-col items-center justify-center w-full gap-6">
        <p className="text-xs text-white/60 font-mono">Press and hold to charge power, release in the green zone!</p>
        <div className="w-full bg-white/10 h-6 rounded-full relative overflow-hidden border border-white/20">
         <div className="absolute top-0 bottom-0 left-[60%] w-[20%] bg-emerald-500/40"></div>
         <div className="absolute top-0 bottom-0 bg-[#00FF88]" style={{ width: `${holdCharge}%` }}></div>
        </div>
        <button
         onMouseDown={() => {
          setHoldCharge(0);
          holdIntervalRef.current = setInterval(() => {
           setHoldCharge((prev) => Math.min(100, prev + 5));
          }, 50);
         }}
         onMouseUp={() => {
          if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
          const score = holdCharge >= 60 && holdCharge <= 80 ? 3 : holdCharge >= 40 && holdCharge <= 90 ? 2 : 1;
          handleInteractionAction(score);
         }}
         className="bg-[#00FF88] text-black font-black py-4 px-10 rounded-xl text-xs uppercase tracking-widest shadow-lg select-none"
        >
         HOLD & RELEASE
        </button>
       </div>
      )}
     </div>
    </div>
   )}

   {/* GROUP TRAINING SESSION MODAL */}
   {isGroupSessionActive && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
     <div className="premium-card w-full max-w-lg border border-blue-500/30 rounded-2xl p-6 bg-[#121216] shadow-2xl flex flex-col items-center text-center">
      <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-1">
       Mandatory Group Session &bull; Drill {groupStep} of 3
      </span>
      <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4">Manager Tactical Drill</h3>
      <p className="text-xs text-white/60 font-mono mb-6 leading-relaxed">
       The coaching staff is running full-pitch tactical shape drills. Execute your assigned role responsibilities with high precision to impress the manager.
      </p>

      <div className="grid grid-cols-1 gap-3 w-full">
       <button
        onClick={() => handleGroupStepAction(3)}
        className="w-full p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-left text-xs font-mono font-bold text-white transition-all"
       >
        🚀 Execute high-tempo tactical press and recover
       </button>
       <button
        onClick={() => handleGroupStepAction(2)}
        className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left text-xs font-mono font-bold text-white transition-all"
       >
        🛡️ Maintain defensive shape and positional discipline
       </button>
       <button
        onClick={() => handleGroupStepAction(1)}
        className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left text-xs font-mono font-bold text-white transition-all"
       >
        🚶 Play conservative short passes to keep safe
       </button>
      </div>
     </div>
    </div>
   )}

   {/* POST SESSION RESULT MODAL */}
   {showPostResult && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
     <div className="premium-card w-full max-w-md border border-[#00FF88]/30 rounded-2xl p-6 bg-[#121216] shadow-2xl text-center">
      <div className="w-12 h-12 rounded-full bg-[#00FF88]/20 border border-[#00FF88]/40 flex items-center justify-center mx-auto mb-4 text-[#00FF88]">
       <Award size={24} />
      </div>
      <h3 className="text-lg font-black uppercase tracking-wider text-white mb-1">Training Session Complete</h3>
      <p className="text-xs text-white/50 font-mono mb-6">Your session was processed successfully through the development pipeline.</p>

      <div className="space-y-2 mb-6 text-left bg-white/5 p-4 rounded-xl border border-white/10">
       <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-2">Attribute & Development Gains</span>
       {lastDeltas.map((d, idx) => (
        <div key={idx} className="flex justify-between items-center text-xs font-mono">
         <span className="text-white/70 uppercase">{d.attr}</span>
         <span className="text-[#00FF88] font-bold">+{d.gain}</span>
        </div>
       ))}
       {lastDeltas.length === 0 && (
        <div className="text-xs font-mono text-white/50 text-center py-2">Recovery session completed. Muscle fatigue cleared.</div>
       )}
      </div>

      <button
       onClick={() => setShowPostResult(false)}
       className="w-full bg-[#00FF88] hover:bg-[#00FF88]/80 text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg"
      >
       Continue
      </button>
     </div>
    </div>
   )}

   {/* STORY INCIDENT MODAL */}
   {activeIncident && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
     <div className="premium-card w-full max-w-lg border border-amber-500/30 rounded-2xl p-6 bg-[#121216] shadow-2xl text-left">
      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">Training Ground Incident</span>
      <h3 className="text-lg font-black uppercase tracking-wider text-white mb-2">{activeIncident.title}</h3>
      <p className="text-xs text-white/70 font-mono leading-relaxed mb-6">{activeIncident.description}</p>
      <div className="space-y-3">
       {activeIncident.choices.map((choice: any, idx: number) => (
        <button
         key={idx}
         onClick={() => {
          const res = choice.effect({ ...state.player });
          setPlayer(res.player);
          setActiveIncident(null);
         }}
         className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-amber-500/15 hover:border-amber-500/40 text-left transition-all"
        >
         <div className="text-xs font-bold text-white mb-0.5">{choice.text}</div>
         <div className="text-[10px] text-white/50">{choice.description}</div>
        </button>
       ))}
      </div>
     </div>
    </div>
   )}

   {/* MAIN TRAINING DASHBOARD LAYOUT */}
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left 2 Cols: Individual & Group Training */}
    <div className="lg:col-span-2 space-y-6">
     {/* 1. Individual Training Slots */}
     <div className="premium-card p-6 rounded-2xl flex flex-col gap-5">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
       <div>
        <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
         <Zap size={16} className="text-[#00FF88]" />
         Individual Training Slots ({weeklySessions.individual}/3 Completed)
        </h2>
        <p className="text-white/40 text-[10px] mt-0.5">Choose light, fast-to-repeat minigames tailored to your position and role.</p>
       </div>
       <div className="flex gap-2">
        {(["UNIVERSAL", "POSITION", "MENTAL"] as const).map((cat) => (
         <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${
           selectedCategory === cat ? "bg-[#00FF88] text-black" : "bg-white/5 text-white/50 hover:text-white"
          }`}
         >
          {cat}
         </button>
        ))}
       </div>
      </div>

      {/* Minigames Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
       {availableGames.map((game) => (
        <div
         key={game.id}
         onClick={() => handleStartMinigame(game)}
         className="glass-panel p-4 rounded-xl border border-white/10 hover:border-[#00FF88]/50 hover:bg-white/[0.07] transition-all cursor-pointer flex flex-col justify-between"
        >
         <div>
          <div className="flex justify-between items-start mb-2">
           <h3 className="text-white text-xs font-bold uppercase tracking-wide">{game.title}</h3>
           <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/70 uppercase">
            {game.engine}
           </span>
          </div>
          <p className="text-[11px] text-white/60 mb-3 leading-relaxed">{game.description}</p>
         </div>

         <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex flex-wrap gap-1">
           {game.targetAttributes.map((attr) => (
            <span key={attr} className="text-[9px] font-mono bg-[#00FF88]/10 text-[#00FF88] px-1.5 py-0.5 rounded uppercase font-bold">
             +{attr}
            </span>
           ))}
           {game.targetAttributes.length === 0 && (
            <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold">
             Fatigue Recovery
            </span>
           )}
          </div>
          <span className="text-[10px] font-mono text-[#00FF88] uppercase font-bold flex items-center gap-1">
           Play <Play size={10} />
          </span>
         </div>
        </div>
       ))}
      </div>
     </div>

     {/* 2. Group Training Session Card */}
     <div className="premium-card p-6 rounded-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
       <div>
        <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
         <UserCheck size={16} className="text-blue-400" />
         Mandatory Group Training Session
        </h2>
        <p className="text-white/40 text-[10px] mt-0.5">Club-scheduled tactical drills. Builds Manager Trust and Squad Chemistry.</p>
       </div>
       <div className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded">
        {weeklySessions.clubOrganized >= 1 ? "Completed" : "Scheduled"}
       </div>
      </div>

      <div className="flex items-center justify-between">
       <div className="text-xs text-white/70 font-mono">
        Manager Personality: <strong className="text-white uppercase">{state.player.managerInfo?.personality || 'Pragmatic'}</strong>
       </div>
       <button
        onClick={startGroupSession}
        disabled={weeklySessions.clubOrganized >= 1}
        className={`px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all ${
         weeklySessions.clubOrganized >= 1
          ? "bg-white/5 text-white/30 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
        }`}
       >
        {weeklySessions.clubOrganized >= 1 ? "Group Training Done" : "Start Group Session"}
       </button>
      </div>
     </div>
    </div>

    {/* Right Col: Player Condition & Story Incidents */}
    <div className="space-y-6">
     {/* Development Status */}
     <div className="premium-card rounded-2xl p-5 border border-white/10 relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-2xl pointer-events-none"></div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FF88] block mb-2 border-b border-white/10 pb-1">
       Development Phase
      </span>
      <div className="text-white font-bold text-sm mb-1">
       {state.player.age < 21 ? '⚡ RAPID GROWTH' : state.player.age < 28 ? '💎 PEAK YEARS' : '📉 LATE PLATEAU'}
      </div>
      <p className="text-[11px] text-white/60 leading-relaxed font-sans">
       {state.player.age < 21
        ? 'Training gains are amplified (+50%) and physical recovery is extremely efficient.'
        : state.player.age < 28
        ? 'You are in your prime physical window. Training gains are steady and balanced.'
        : 'Development is slowing down. Maintaining stats requires elite training sessions.'}
      </p>
     </div>

     {/* Story Incident Trigger */}
     <div className="premium-card rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-2 border-b border-amber-500/20 pb-1">
       Training Ground Drama
      </span>
      <p className="text-xs text-white/70 font-mono mb-4 leading-relaxed">
       Encounter real locker room incidents, veteran clashes, and scouting spotlights during your weekly training regime.
      </p>
      <button
       onClick={() => {
        const inc = TRAINING_INCIDENTS[Math.floor(Math.random() * TRAINING_INCIDENTS.length)];
        setActiveIncident(inc);
       }}
       className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md"
      >
       Trigger Incident Event
      </button>
     </div>

     {/* Retrain Tactical Role */}
     <div className="premium-card rounded-2xl p-5">
      <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-2 border-b border-white/10 pb-1">
       Tactical Specialization
      </span>
      <p className="text-xs text-white/60 font-mono mb-4">Adapt your tactical role familiarity for your position group (£1,500).</p>
      <button
       onClick={() => setShowRetrainModal(true)}
       className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all border border-white/10"
      >
       Retrain Role
      </button>
     </div>
    </div>
   </div>

   {/* RETRAIN MODAL */}
   {showRetrainModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
     <div className="premium-card w-full max-w-md border border-white/15 rounded-2xl p-6 bg-[#121216] shadow-2xl text-left">
      <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">Retrain Tactical Role</h3>
      <p className="text-xs text-white/50 mb-4 leading-relaxed">Select a new role for your position group. Retraining costs <strong className="text-white">£1,500</strong>.</p>
      
      {retrainError && (
       <div className="p-3 mb-4 bg-red-950/40 border border-red-500/20 rounded text-red-400 text-xs font-mono">{retrainError}</div>
      )}

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
       {getRolesForPosition(state.player.position).map((role) => {
        const isCurrent = state.player!.roleSpecialization?.selectedRoleId === role.id;
        return (
         <div
          key={role.id}
          onClick={() => {
           if (isCurrent) return;
           if (state.player!.finances.balance < 1500) {
            setRetrainError("Insufficient bank balance (£1,500 required).");
            return;
           }
           const updatedPlayer = { ...state.player! };
           updatedPlayer.finances.balance -= 1500;
           updatedPlayer.roleSpecialization = { selectedRoleId: role.id, familiarity: 30, recentMatchesInRole: 0 };
           updatedPlayer.subPosition = role.name as any;
           setPlayer(updatedPlayer);
           setShowRetrainModal(false);
          }}
          className={`p-3 rounded border text-left cursor-pointer transition-all ${
           isCurrent ? 'border-[#00FF88] bg-[#00FF88]/15 opacity-80' : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
         >
          <div className="flex justify-between items-center mb-1">
           <span className="font-bold text-white text-xs">{role.name}</span>
           {isCurrent && <span className="text-[8px] bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded uppercase font-mono font-bold">Active</span>}
          </div>
          <p className="text-[10px] text-white/60 mb-2">{role.description}</p>
         </div>
        );
       })}
      </div>
      <button onClick={() => setShowRetrainModal(false)} className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase">Cancel</button>
     </div>
    </div>
   )}
  </div>
 );
}

import { CoreFormulas } from "../utils/coreFormulas";
import React, { useState, useEffect, useRef } from "react";
import { Player } from "../types";
import { useGame } from "../store/GameContext";
import { calculateOVR } from "../utils/player";
import { getRoleById, getRolesForPosition, POSITION_GROUPS, getManagerTacticalFit } from "../data/roles";
import {
 UNIVERSAL_MINIGAMES,
 POSITION_MINIGAMES,
 MENTAL_MINIGAMES,
 MinigameConfig,
 IntensityLevel,
} from "../data/minigames";
import {
 ArrowLeft,
 ArrowRight,
 ArrowUp,
 ArrowDown,
 Activity,
 Brain,
 Clock,
 PlusSquare,
 Shield,
 Award,
 Zap,
 CheckCircle2,
 AlertTriangle,
 Flame,
 UserCheck,
 RefreshCw,
 Target
} from "lucide-react";
import { Attributes } from "../types";
import { GlossaryTooltip } from "../components/GlossaryTooltip";

// Types for Training Match
interface TrainingMatchDecision {
 minute: number;
 situation: string;
 options: {
 text: string;
 attribute: keyof Attributes;
 successRate: number; // base success %
 successLog: string;
 failLog: string;
 }[];
}

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
          p.relationships = p.relationships || { teammates: 50, manager: 50, fans: 50, board: 50 };
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
          p.relationships = p.relationships || { teammates: 50, manager: 50, fans: 50, board: 50 };
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
            p.relationships = p.relationships || { teammates: 50, manager: 50, fans: 50, board: 50 };
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
  },
  {
    id: "inc_terry_foreman",
    title: "🧱 A Voice from the Yard",
    description: "Your phone buzzes on the bench. It's Terry, your old boss from the bricklaying crew. 'Saw you on the match highlights on Saturday, son! The whole crew was cheering in the pub. We've got a wager on your first 10 goals. Keep hammering!'",
    choices: [
      {
        text: "Invite the old crew to the next home match (£150)",
        description: "Keep your feet on the ground and buy them tickets.",
        effect: (p: any) => {
          p.finances = Math.max(-10000, (p.finances || 0) - 150);
          p.morale = Math.min(100, p.morale + 20);
          p.fans = (p.fans || 0) + 150;
          return {
            text: "You call him back, laugh, and buy five main-stand tickets for the crew. Terry is choked up: 'You're a proper gentleman, lad.' A fan-page hears about it and posts it. Gained +150 Fans and +20 Morale, cost £150.",
            player: p
          };
        }
      },
      {
        text: "Send a polite text and focus on extra sprint runs",
        description: "Appreciate them, but protect your professional focus.",
        effect: (p: any) => {
          if (p.attributes) p.attributes.stamina = Math.min(99, p.attributes.stamina + 0.5);
          if (p.attributes) p.attributes.workrate = Math.min(99, p.attributes.workrate + 0.5);
          return {
            text: "You reply with a warm, humble text, then lace your boots back up to run four extra shuttles. Terry sends back: 'That's the work ethic! Go get 'em.' Gained +0.5 Stamina and +0.5 Workrate.",
            player: p
          };
        }
      }
    ]
  },
  {
    id: "inc_ice_bath_politics",
    title: "🥶 Ice Bath Whispers",
    description: "You're sitting in the freezing ice bath next to sub-goalkeeper Marcus, who has been benched for six weeks. He turns to you, shivering: 'The gaffer's tactical system is absolute trash, isn't it? He's completely lost the plot. What do you think?'",
    choices: [
      {
        text: "Nod and agree with him",
        description: "Build a tight bond with Marcus by venting together.",
        effect: (p: any) => {
          p.relationships = p.relationships || { teammates: 50, manager: 50, fans: 50, board: 50 };
          p.relationships.teammates = Math.min(100, p.relationships.teammates + 10);
          p.trust = Math.max(0, p.trust - 8);
          return {
            text: "You nod: 'Yeah, sometimes it feels a bit rigid.' Marcus grins: 'Spot on! At least someone has eyes.' Gained +10 Teammate relationship, but lost -8 Manager Trust as word of locker room dissent filters back.",
            player: p
          };
        }
      },
      {
        text: "Defend the manager's tactics",
        description: "Back the boss. Maintain tactical alignment.",
        effect: (p: any) => {
          p.trust = Math.min(100, p.trust + 10);
          p.relationships = p.relationships || { teammates: 50, manager: 50, fans: 50, board: 50 };
          p.relationships.teammates = Math.max(0, p.relationships.teammates - 5);
          return {
            text: "You shake your head: 'Nah, the block works if we run our lanes.' Marcus scoffs: 'You're such a teacher's pet.' Gained +10 Manager Trust but lost -5 Teammate Chemistry.",
            player: p
          };
        }
      },
      {
        text: "Put your headphones in and shut your eyes",
        description: "Stay out of dressing room politics entirely.",
        effect: (p: any) => {
          if (p.attributes) p.attributes.composure = Math.min(99, p.attributes.composure + 0.8);
          return {
            text: "You put your AirPods in, play some drill music, and slide deeper into the freezing water. Marcus sighs and stops talking. Gained +0.8 Composure for maintaining flawless peace.",
            player: p
          };
        }
      }
    ]
  },
  {
    id: "inc_academic_spotlight",
    title: "🦁 The TikTok Lion",
    description: "The club's media officer asks if you can do a quick 30-second silly dance with the club's goofy mascot, 'Roary the Lion', to boost the club's local community outreach channels.",
    choices: [
      {
        text: "Do the dance and have a laugh",
        description: "Boost your fan interaction and local reputation.",
        effect: (p: any) => {
          p.fans = (p.fans || 0) + 300;
          p.morale = Math.min(100, p.morale + 10);
          p.relationships = p.relationships || { teammates: 50, manager: 50, fans: 50, board: 50 };
          p.relationships.teammates = Math.max(0, p.relationships.teammates - 5);
          return {
            text: "You bust some hilarious moves alongside Roary. The video gets 50,000 views! Local fans find you incredibly endearing. However, you find a printout of your dance taped to your locker on Saturday morning. Gained +300 Fans but lost -5 Teammate Chemistry (banter price).",
            player: p
          };
        }
      },
      {
        text: "Refuse and offer to do a tactical review instead",
        description: "Keep a serious, football-first professional image.",
        effect: (p: any) => {
          p.trust = Math.min(100, p.trust + 8);
          if (p.attributes) p.attributes.composure = Math.min(99, p.attributes.composure + 0.5);
          return {
            text: "You decline the dance but offer to analyze a youth squad replay. The coaching staff is highly impressed with your football-first maturity. Gained +8 Manager Trust.",
            player: p
          };
        }
      }
    ]
  },
  {
    id: "inc_knee_panic",
    title: "🩺 The Phantom Knee Strain",
    description: "During a heavy shuttle run, you feel a sudden, tight pinch in your knee. Your pulse spikes in panic—it's the exact same joint that kept you out of action for months in your past.",
    choices: [
      {
        text: "Stop running immediately and call the physio",
        description: "Prioritize joint safety over looking tough.",
        effect: (p: any) => {
          p.fatigue = Math.max(0, p.fatigue - 10);
          return {
            text: "You stop and raise a hand. The physio runs an ice massage and ultrasound. 'Just minor scar tissue tension, son. Glad you didn't push it.' Gained -10% Fatigue. Your knee is completely safe.",
            player: p
          };
        }
      },
      {
        text: "Push through the pain and finish the shuttle",
        description: "Show absolute, terrifying mental toughness.",
        effect: (p: any) => {
          if (p.attributes) p.attributes.determination = Math.min(99, p.attributes.determination + 0.8);
          p.morale = Math.min(100, p.morale + 10);
          p.fatigue = Math.min(100, p.fatigue + 10);
          return {
            text: "You grit your teeth and run like a man possessed, finishing first in the squad. Your knee holds up, but your joints are burning. Gained +0.8 Determination and +10 Morale, but added +10% Fatigue.",
            player: p
          };
        }
      }
    ]
  },
  {
    id: "inc_whiteboard_tactics",
    title: "📋 The Tactical Board Quiz",
    description: "The Manager stops you in the corridor and points to a tactical board showing Saturday's opponent using a narrow, high-pressing 3-4-3 block. 'If we are playing in your role, how do you beat this, son?'",
    choices: [
      {
        text: "'Expose their wide flanks with quick lateral shifts'",
        description: "Provide an elite tactical answer.",
        effect: (p: any) => {
          p.trust = Math.min(100, p.trust + 10);
          p.tacticalFamiliarity = Math.min(100, (p.tacticalFamiliarity || 30) + 8);
          return {
            text: "The Manager's eyes light up. 'Precisely! We drag their wing-backs high and slide inside.' He taps your shoulder. Gained +10 Manager Trust and +8% Tactical Familiarity.",
            player: p
          };
        }
      },
      {
        text: "'Play direct long balls over their press'",
        description: "A traditional, low-risk approach.",
        effect: (p: any) => {
          p.trust = Math.min(100, p.trust + 5);
          p.tacticalFamiliarity = Math.min(100, (p.tacticalFamiliarity || 30) + 4);
          return {
            text: "The Manager nods slowly. 'A solid fallback option to bypass their lines, yes.' Gained +5 Manager Trust and +4% Tactical Familiarity.",
            player: p
          };
        }
      },
      {
        text: "'Just dribble past their midfielders 1v1'",
        description: "Trust in pure flair.",
        effect: (p: any) => {
          p.trust = Math.max(0, p.trust - 5);
          p.morale = Math.min(100, p.morale + 5);
          return {
            text: "The Manager sighs and shakes his head. 'This is men's football, not a schoolyard. We play as an eleven.' Lost -5 Manager Trust but gained +5 Morale.",
            player: p
          };
        }
      }
    ]
  }
];

export function Training() {
 const { state, setPlayer, advanceDay, setScreen } = useGame();

 const [selectedCategory, setSelectedCategory] = useState<
 "UNIVERSAL" | "POSITION" | "MENTAL"
 >("UNIVERSAL");
 const [selectedGame, setSelectedGame] = useState<MinigameConfig | null>(null);
 const [intensity, setIntensity] = useState<IntensityLevel>("Standard");

 const [activeEngine, setActiveEngine] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);

 // Session State
 const [sessionReps, setSessionReps] = useState(0);
 const [sessionSuccesses, setSessionSuccesses] = useState(0);
 const [sessionStreak, setSessionStreak] = useState(0);
 const [standoutMoments, setStandoutMoments] = useState<string[]>([]);
 const MAX_REPS = 3;
 const [showRetrainModal, setShowRetrainModal] = useState<boolean>(false);
 const [retrainError, setRetrainError] = useState<string | null>(null);

 // Custom Minigames Engine States
 const [mgResult, setMgResult] = useState<"Success" | "Partial" | "Fail" | null>(null);
 const [isFlowActive, setIsFlowActive] = useState<boolean>(false);

 // Game 1: Dribbling Gauntlet ("THE GAUNTLET")
 const [gauntletPlayerX, setGauntletPlayerX] = useState<number>(2); // 0-4
 const [gauntletRow, setGauntletRow] = useState<number>(4); // player starts at 4, moves to 0
 const [gauntletGrid, setGauntletGrid] = useState<number[][]>([]); // 5x5: 0=empty, 1=cone

 // Game 2: Long-Range Shooting ("POWER & PLACEMENT")
 const [powerLevel, setPowerLevel] = useState<number>(0);
 const [powerDirection, setPowerDirection] = useState<number>(1);
 const [shootingTargetSelected, setShootingTargetSelected] = useState<string | null>(null);
 const [shootingCurrentTarget, setShootingCurrentTarget] = useState<string>("TOP-RIGHT");
 const [isChargingPower, setIsChargingPower] = useState<boolean>(false);
 const powerIntervalRef = useRef<NodeJS.Timeout | null>(null);

 // Game 3: Through-Ball Threading ("SPLIT THE DEFENSE")
 const [defenderGap, setDefenderGap] = useState<number>(50); // Fluctuates 0 to 100
 const [defenderGapDir, setDefenderGapDir] = useState<number>(1);
 const [strikerRunPhase, setStrikerRunPhase] = useState<"READY" | "RUNNING" | "RECEIVED" | "OFFSIDE">("READY");
 const [strikerPosition, setStrikerPosition] = useState<number>(0); // 0 to 100 (runs top to bottom)
 const [threadingSuccess, setThreadingSuccess] = useState<boolean | null>(null);

 // Game 6: Fitness & Conditioning ("HEART RATE CHALLENGE")
 const [heartRate, setHeartRate] = useState<number>(100);
 const [heartRateGoodSecs, setHeartRateGoodSecs] = useState<number>(0);
 const [hrTargetMin, setHrTargetMin] = useState<number>(120);
 const [hrTargetMax, setHrTargetMax] = useState<number>(140);
 const [hrSecondsLeft, setHrSecondsLeft] = useState<number>(10);

 // Game 8: Tactical Shape ("POSITIONAL PUZZLE")
 const [selectedGridCell, setSelectedGridCell] = useState<{ r: number; c: number } | null>(null);
 const [correctGridCell, setCorrectGridCell] = useState<{ r: number; c: number }>({ r: 2, c: 2 });
 const [positioningScenario, setPositioningScenario] = useState<string>("");

 // Custom states for ST_PENALTY
 const [penaltyTargetSelected, setPenaltyTargetSelected] = useState<string | null>(null);
 const [penaltyResult, setPenaltyResult] = useState<boolean | null>(null);

 // Custom states for AERIAL
 const [aerialCountdown, setAerialCountdown] = useState<number | null>(null);
 const [aerialPhase, setAerialPhase] = useState<'IDLE' | 'CROSSING' | 'BALL_ARRIVED' | 'MISSED'>('IDLE');
 const [aerialResult, setAerialResult] = useState<boolean | null>(null);

 // RONDO
 const [rondoTarget, setRondoTarget] = useState<number | null>(null);
 
 // SET PIECE REHEARSAL
 const [spDelivery, setSpDelivery] = useState<string | null>(null);
 const [spTarget, setSpTarget] = useState<string | null>(null);
 const [spExecutionStep, setSpExecutionStep] = useState<number>(0);
 
 // PATTERN RECOGNITION
 const [patternShowTime, setPatternShowTime] = useState<number>(3);
 const [patternVisible, setPatternVisible] = useState<boolean>(true);
 const [patternFormation, setPatternFormation] = useState<string>("");

 // Video MCQ Scenario (Game 4 / Game 5 / Set Piece General MCQ Fallback)
 const [mcqQuestion, setMcqQuestion] = useState<string>("");
 const [mcqOptions, setMcqOptions] = useState<{ text: string; correct: boolean; explanation: string }[]>([]);

 // Engine States (Fallback Timing & Fallback Decision)
 const [cursorPos, setCursorPos] = useState(0);
 const [cursorDir, setCursorDir] = useState(1);
 const [timingMargin, setTimingMargin] = useState(8);
 const [timingSpeed, setTimingSpeed] = useState(2);
 const [timeLeft, setTimeLeft] = useState(5);
 const [decisionOptions, setDecisionOptions] = useState<{ text: string; correct: boolean }[]>([]);
 const [sequence, setSequence] = useState<string[]>([]);
 const [playerSeq, setPlayerSeq] = useState<string[]>([]);

 // Group Training Sequence
   // NEW REVAMPED MINIGAME AND NARRATIVE STATES
  const [activeIncident, setActiveIncident] = useState<any | null>(null);
  const [incidentOutcome, setIncidentOutcome] = useState<string | null>(null);

  // Revamped Gauntlet: Dribble Lanes
  const [dribbleLane, setDribbleLane] = useState<number>(1); // 0=Left, 1=Center, 2=Right
  const [playerLane, setPlayerLane] = useState<number>(1);
  const [reactionTimeLeft, setReactionTimeLeft] = useState<number>(100);

  // Revamped Shooting: Start/Stop clicker
  const [isRunUpStarted, setIsRunUpStarted] = useState<boolean>(false);

  // Revamped Aerial: Slider position
  const [aerialBallPos, setAerialBallPos] = useState<number>(0);
  const [aerialBallDir, setAerialBallDir] = useState<number>(1);

  // Revamped Rondo: Passing lanes and open target
  const [rondoOpenOutlet, setRondoOpenOutlet] = useState<number>(0); // index of open teammate (0-3)
  const [rondoTimer, setRondoTimer] = useState<number>(100);
  const [rondoDefenderPos, setRondoDefenderPos] = useState<number>(0);
  const [rondoPassResult, setRondoPassResult] = useState<string | null>(null);

  const [isGroupTraining, setIsGroupTraining] = useState<boolean>(false);
 const [groupTrainingIndex, setGroupTrainingIndex] = useState<number>(0);
 const GROUP_SEQUENCE = ["RONDO", "TAC_SHAPE", "FIT_COND"];

 // Training Match Mode State
 const [isTrainingMatch, setIsTrainingMatch] = useState<boolean>(false);
 const [matchScore, setMatchScore] = useState<{ player: number; opponent: number }>({ player: 0, opponent: 0 });
 const [matchLog, setMatchLog] = useState<string[]>([]);
 const [currentMatchDecisionIdx, setCurrentMatchDecisionIdx] = useState<number>(0);
 const [activeMatchDecision, setActiveMatchDecision] = useState<TrainingMatchDecision | null>(null);
 const [trainingMatchComplete, setTrainingMatchComplete] = useState<boolean>(false);
 const [trainingMatchRating, setTrainingMatchRating] = useState<number>(6.0);
 const [trainingMatchGoals, setTrainingMatchGoals] = useState<number>(0);
 const [trainingMatchAssists, setTrainingMatchAssists] = useState<number>(0);

 // Safe training & weekly sessions mapping
 const weeklySessions = state.player?.training?.weeklySessions || {
 clubOrganized: 0,
 individual: 0,
 recovery: 0,
 trainingMatch: 0
 };

 const currentFatigue = state.player?.fatigue || 0;
 const currentSharpness = state.player?.sharpness || 0;

 // Injury and fatigue check logic
 const isOvertrained = currentFatigue > 70;
 const isSpent = currentFatigue > 90;

 if (!state.player) return null;

 // Filter positional games
 const posGames = POSITION_MINIGAMES.filter((g) => {
 if (!state.player) return false;
 const p = state.player;
 if (g.category === "GK" && p.position === "GK") return true;
 if (g.category === "CB" && p.position === "CB") return true;
 if (
  g.category === "LB" &&
  (p.position === "LB" ||
  p.position === "RB" ||
  p.position === "LWB" ||
  p.position === "RWB")
 )
  return true;
 if (
  g.category === "CM" &&
  p.position === "CM" &&
  p.subPosition !== "Defensive Midfielder"
 )
  return true;
 if (
  g.category === "DM" &&
  p.position === "CM" &&
  p.subPosition === "Defensive Midfielder"
 )
  return true;
 if (
  g.category === "AM" &&
  p.position === "AM" &&
  p.subPosition !== "Shadow Striker"
 )
  return true;
 if (
  g.category === "SS" &&
  (p.subPosition === "Shadow Striker" ||
  p.subPosition === "Deep-Lying Forward")
 )
  return true;
 if (
  g.category === "LW" &&
  (p.position === "LW" ||
  p.position === "RW" ||
  p.position === "LM" ||
  p.position === "RM")
 )
  return true;
 if (g.category === "ST" && p.position === "ST") return true;
 return false;
 });

 const availableGames =
 selectedCategory === "UNIVERSAL"
  ? UNIVERSAL_MINIGAMES
  : selectedCategory === "MENTAL"
  ? MENTAL_MINIGAMES
  : posGames;

 const getAttrGain = (level: IntensityLevel) => {
 if (level === "Recovery") return 0;
 // Overtrained halves attribute gains
 const multiplier = isOvertrained ? 0.5 : 1.0;
 if (level === "Light") return 0.2 * multiplier;
 if (level === "Standard") return 0.4 * multiplier;
 return 0.6 * multiplier; // Intense
 };

 const getFatigueCost = (level: IntensityLevel) => {
 let baseCost = 0;
 if (level === "Recovery") baseCost = -6;
 else if (level === "Light") baseCost = 6;
 else if (level === "Standard") baseCost = 12;
 else baseCost = 18; // Intense
 
 if (level === "Recovery") return baseCost;
 
 const age = state.player?.age || 19;
 let ageCostMulti = 1.0;
 if (age < 21) ageCostMulti = 0.8;
 else if (age < 28) ageCostMulti = 1.0;
 else if (age < 32) ageCostMulti = 1.2;
 else ageCostMulti = 1.5;
 
 return Math.round(baseCost * ageCostMulti);
 };

 const getInjuryRiskMulti = (level: IntensityLevel) => {
 if (level === "Recovery") return 0;
 if (level === "Light") return 0.5;
 if (level === "Standard") return 1.0;
 return 2.0; // Intense
 };

 // Setup minigames specific state
 const startMinigame = () => {
 if (!selectedGame || !state.player) return;

 if (isSpent) {
  setError(
  "YOUR BODY IS SPENT. ACCUMULATED FATIGUE IS TOO HIGH TO TRAIN (ABOVE 90%). CHOOSE A RECOVERY SESSION INSTEAD."
  );
  return;
 }

 // Weekly session limits checking
 if (selectedGame.engine === "RECOVERY" || intensity === "Recovery") {
  if (weeklySessions.recovery >= 1) {
  setError("WEEKLY LIMIT REACHED: You can only perform 1 recovery session per week.");
  return;
  }
 } else {
  if (weeklySessions.individual >= 3) {
  setError("WEEKLY LIMIT REACHED: You can only perform 3 individual drills per week.");
  return;
  }
 }

 setMgResult(null);
 setActiveEngine(selectedGame.id); // set specific minigame id as engine mode!
 setSessionReps(0);
 setSessionSuccesses(0);
 setSessionStreak(0);
 setStandoutMoments([]);

 if (selectedGame.engine === "RECOVERY") {
  processSessionEnd(0, 0);
  return;
 }

 setupRep(1, 0);
 };

 const setupRep = (repNum: number, currentStreak: number) => {
 if (!selectedGame || !state.player) return;

 setError(null);
 const avgScore = getAverageTargetAttributeScore();
 const isDifficultyBoosted = avgScore > 75;

 // Reset game-specific parameters
 if (selectedGame.id === "AM_TIGHT_DRIB" || selectedGame.id === "CB_DEF_POS" || selectedGame.id === "FB_TRACKING" || selectedGame.id === "W_1V1" || selectedGame.id === "CM_PASS_COMBO" || selectedGame.id === "CM_RETENTION" || selectedGame.id === "GK_SHOT_STOP" || selectedGame.id === "FB_COMBO" || selectedGame.id === "SS_LINKUP") {
  // DRIBBLING REACTION LANE
  setDribbleLane(Math.floor(Math.random() * 3)); // 0=Left, 1=Center, 2=Right
  setPlayerLane(1); // Center
  setReactionTimeLeft(100);
 } else if (selectedGame.id === "AM_LONG_SHOT" || selectedGame.id === "ST_FINISHING" || selectedGame.id === "ST_HOLDUP" || selectedGame.id === "GK_CROSS_CLAIM" || selectedGame.id === "GK_DIST" || selectedGame.id === "W_CUT_INSIDE" || selectedGame.id === "DM_SHIELD") {
  // POWER & PLACEMENT SHOOTING
  const targets = ["TOP-LEFT", "TOP-RIGHT", "BOTTOM-LEFT", "BOTTOM-RIGHT", "MID-CENTER"];
  setShootingCurrentTarget(targets[Math.floor(Math.random() * targets.length)]);
  setShootingTargetSelected(null);
  setPowerLevel(0);
  setPowerDirection(1);
  setIsRunUpStarted(false);
  setIsChargingPower(false);
 } else if (selectedGame.id === "ST_PENALTY") {
  // PENALTY SHOOTOUT
  setPenaltyTargetSelected(null);
  setPenaltyResult(null);
  setCursorPos(0);
  setCursorDir(1);
 } else if (selectedGame.id === "ST_AERIAL" || selectedGame.id === "CB_AERIAL") {
  // HEADING rhythm note
  setAerialBallPos(0);
  setAerialBallDir(1);
  setAerialResult(null);
  setAerialPhase('IDLE');
 } else if (selectedGame.id === "AM_THROUGH" || selectedGame.id === "FB_CROSSING" || selectedGame.id === "W_CROSS_BYLINE") {
  // THROUGH-BALL THREADING
  setDefenderGap(50);
  setDefenderGapDir(isDifficultyBoosted ? 2 : 1.5);
  setStrikerRunPhase("READY");
  setStrikerPosition(0);
  setThreadingSuccess(null);
 } else if (selectedGame.id === "FIT_COND" || selectedGame.id === "W_SPRINT" || selectedGame.id === "CM_BOX2BOX") {
  // FITNESS HEART RATE CHALLENGE
  setHeartRate(100);
  setHeartRateGoodSecs(0);
  setHrSecondsLeft(10);
  const zones = [
  { min: 110, max: 130 },
  { min: 125, max: 145 },
  { min: 140, max: 160 },
  ];
  const selectedZone = zones[Math.floor(Math.random() * zones.length)];
  
  const backstory = state.player.backstory;
  let zoneSpan = 20; // Default span
  if (backstory === "FALLEN_PRODIGY" || backstory === "ACADEMY_GRADUATE") {
   zoneSpan = 14; // Narrower target, much harder to maintain!
  } else if (backstory === "FROM_SCRATCH") {
   zoneSpan = 16;
  }
  
  const mid = (selectedZone.min + selectedZone.max) / 2;
  setHrTargetMin(mid - zoneSpan / 2);
  setHrTargetMax(mid + zoneSpan / 2);
 } else if (selectedGame.id === "TAC_SHAPE" || selectedGame.id === "CB_BALL_PLAY" || selectedGame.id === "ST_MOVEMENT") {
  // POSITION GRID SHAPE
  const row = Math.floor(Math.random() * 5);
  const col = Math.floor(Math.random() * 5);
  setCorrectGridCell({ r: row, c: col });
  setSelectedGridCell(null);

  const scenarios = [
  `The opposition CDM is building from deep in their left channel. As defensive line shifts, block their direct progressive line.`,
  `Your team is playing high vertical blocks. The wing-back pushes wide. Move to cover the half-space pocket.`,
  `A crossing delivery is whipped from the opposite channel toward the back post. Move to challenge or intercept.`,
  `Your center back has pressed high to contest the header. Shadow the secondary forward runner to block the gap.`,
  ];
  setPositioningScenario(scenarios[Math.floor(Math.random() * scenarios.length)]);
 } else if (selectedGame.id === "PATTERN_REC") {
  setPatternShowTime(3);
  setPatternVisible(true);
  const formations = ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1"];
  const trueFormation = formations[Math.floor(Math.random() * formations.length)];
  setPatternFormation(trueFormation);
  setMcqQuestion("Identify the opposition's shape and exploit.");
  setMcqOptions([
  { text: `It's a ${trueFormation}. Target the ${trueFormation === '4-4-2' ? 'between the lines' : trueFormation === '4-3-3' ? 'wide channels behind wingers' : trueFormation === '3-5-2' ? 'flanks behind wingbacks' : 'pivot pockets'}.`, correct: true, explanation: "Good eye!" },
  { text: `It's a ${formations.find(f => f !== trueFormation)}. Play direct.`, correct: false, explanation: "Misread the formation." },
  { text: "Just run at them.", correct: false, explanation: "No tactical plan." }
  ].sort(() => Math.random() - 0.5));
 } else if (selectedGame.id === "SET_PIECE") {
  setSpDelivery(null);
  setSpTarget(null);
  setSpExecutionStep(0);
  setCursorPos(0);
  setCursorDir(1);
  setTimingMargin(8);
  setTimingSpeed(isDifficultyBoosted ? 3.5 : 2);
 } else if (selectedGame.id === "RONDO") {
  setRondoOpenOutlet(Math.floor(Math.random() * 4));
  setRondoTimer(100);
  setRondoTarget(null);
 } else if (selectedGame.id === "VIDEO_ANALYSIS" || selectedGame.id === "DM_INTERCEPT" || selectedGame.id === "DM_PRESS" || selectedGame.id === "GK_1V1" || selectedGame.id === "GK_PENALTY" || selectedGame.id === "CB_TACKLE" || selectedGame.id === "SS_COMBO_FINISH") {
  // VIDEO ANALYSIS MCQ
  const mcqs = [
  {
   question: "You receive the ball with your back to goal in the defensive channel. Two pressers close in fast. What's the optimal play?",
   options: [
   { text: "Pass first-time to dropping midfielder", correct: true, explanation: "Excellent composure! Releasing the ball immediately bypasses the press." },
   { text: "Turn towards your own goal and dribble", correct: false, explanation: "Too risky! Turning blind into press leads to high turnovers." },
   { text: "Hold up and shield manually", correct: false, explanation: "Unsafe. Under dual-press, you run a high risk of being dispossessed." }
   ]
  },
  {
   question: "Opposition runs a compact 4-2-3-1 counter block. Where should you target your progressive passes?",
   options: [
   { text: "Bypassing the double-pivot into the wing channels", correct: true, explanation: "Correct! The half-spaces and wide wings are the weak link of narrow setups." },
   { text: "Direct long balls through the central defenders", correct: false, explanation: "Incorrect. Compact setups easily clear direct central long passes." },
   { text: "Short slow passes laterally across defense", correct: false, explanation: "Too slow. Allows their block to organize and adjust easily." }
   ]
  },
  {
   question: "During defensive transition, the opposition winger overlaps heavily. Your teammate has advanced too high.",
   options: [
   { text: "Sprint back to cover the half-space delay zone", correct: true, explanation: "Spot on! Tracking back prevents immediate overload counters." },
   { text: "Press their central ball carrier aggressively", correct: false, explanation: "Leaves the wing completely exposed for a clear run." },
   { text: "Call for Chairman intervention", correct: false, explanation: "The Chairman won't save you on the pitch, lad!" }
   ]
  }
  ];
  const selectedMcq = mcqs[Math.floor(Math.random() * mcqs.length)];
  setMcqQuestion(selectedMcq.question);
  setMcqOptions(selectedMcq.options.sort(() => Math.random() - 0.5));
 } else {
  // Fallback Engines Setup
  const sharpnessModifier = state.player.sharpness > 80 ? 0.9 : state.player.sharpness < 40 ? 1.2 : 1.0;
  const streakDifficulty = currentStreak * 0.15;

  const backstory = state.player.backstory;
  const globalHardnessMultiplier = 1.15; // 15% harder game mechanics

  if (selectedGame.engine === "TIMING" || selectedGame.engine === "RECOVERY") {
  setCursorPos(0);
  setCursorDir(1);
  
  let backstorySpeedModifier = 1.0;
  if (backstory === "LATE_BLOOMER") backstorySpeedModifier = 1.35; // Technical gap increases cursor timing speed
  if (backstory === "FROM_SCRATCH") backstorySpeedModifier = 1.15;
  
  const margin = Math.max(2, Math.floor(avgScore / 8) - Math.floor(currentStreak * 1.5));
  setTimingMargin(margin);
  const speedBase = 2 + (intensity === "Intense" ? 2 : intensity === "Standard" ? 1 : 0);
  setTimingSpeed((speedBase * sharpnessModifier + streakDifficulty) * globalHardnessMultiplier * backstorySpeedModifier);
  } else if (selectedGame.engine === "DECISION") {
  let backstoryTimeModifier = 1.0;
  if (backstory === "STREET_PRODIGY") backstoryTimeModifier = 0.65; // Tactical gaps shorten decision thinking windows
  if (backstory === "FROM_SCRATCH") backstoryTimeModifier = 0.85;

  const timeBase = 5 - (intensity === "Intense" ? 2 : intensity === "Standard" ? 1 : 0);
  const baseTime = Math.max(1, Math.floor((timeBase + Math.floor(avgScore / 25)) / sharpnessModifier) - currentStreak);
  setTimeLeft(Math.max(1, Math.floor(baseTime * backstoryTimeModifier * (1 / globalHardnessMultiplier))));
  setDecisionOptions(
   [
   { text: "Core tactical option", correct: true },
   { text: "Safe lateral play", correct: false },
   { text: "Risky direct mistake", correct: false },
   ].sort(() => Math.random() - 0.5)
  );
  } else if (selectedGame.engine === "SEQUENCE") {
  const dirs = ["UP", "DOWN", "LEFT", "RIGHT"];
  const lenPenalty = intensity === "Intense" ? 3 : intensity === "Standard" ? 2 : 1;
  const seqLen = Math.max(3, Math.floor(3 + lenPenalty + currentStreak));
  const s = [];
  for (let i = 0; i < seqLen; i++) s.push(dirs[Math.floor(Math.random() * dirs.length)]);
  setSequence(s);
  setPlayerSeq([]);
  } else if (selectedGame.engine === "INTENSITY") {
  setCursorPos(50);
  setCursorDir(1);
  }
 }
 };

 const getAverageTargetAttributeScore = () => {
 if (!selectedGame || !state.player) return 50;
 let sum = 0;
 selectedGame.targetAttributes.forEach((attr) => {
  sum += Number(state.player!.attributes[attr as keyof Attributes] || 50);
 });
 return selectedGame.targetAttributes.length > 0 ? sum / selectedGame.targetAttributes.length : 50;
 };

 const processRepResult = (success: boolean) => {
 let finalSuccess = success;
 if (success && state.player) {
  const backstory = state.player.backstory;
  const gameCat = selectedGame?.category;
  const gameId = selectedGame?.id;
  
  if (backstory === 'STREET_PRODIGY' && (gameCat === 'MENTAL' || gameId === 'VIDEO_ANALYSIS' || gameId === 'TAC_SHAPE' || gameId === 'PATTERN_REC' || gameId === 'DM_INTERCEPT' || gameId === 'DM_PRESS')) {
   if (Math.random() < 0.25) {
   finalSuccess = false;
   setStandoutMoments((prev) => [...prev, `Tactical Hesitation: As a raw street talent, you hesitated on pro-level positioning rules.`]);
   }
  } else if (backstory === 'LATE_BLOOMER' && (gameId === 'TIMING' || gameId === 'AM_THROUGH' || gameId === 'FB_CROSSING' || gameId === 'W_CROSS_BYLINE' || gameId === 'AM_LONG_SHOT' || gameId === 'ST_FINISHING')) {
   if (Math.random() < 0.25) {
   finalSuccess = false;
   setStandoutMoments((prev) => [...prev, `Technical Gap: Your raw Sunday-league technique let you down in this tight drill.`]);
   }
  } else if ((backstory === 'FALLEN_PRODIGY' || backstory === 'ACADEMY_GRADUATE') && (gameId === 'FIT_COND' || gameId === 'W_SPRINT' || gameId === 'CM_BOX2BOX')) {
   if (Math.random() < 0.25) {
   finalSuccess = false;
   setStandoutMoments((prev) => [...prev, `Endurance Squeeze: Your fragile physical base gave out near the end of this fitness sprint.`]);
   }
  }
 }

 const newSuc = finalSuccess ? sessionSuccesses + 1 : sessionSuccesses;
 const newStreak = finalSuccess ? sessionStreak + 1 : 0;
 const nextRep = sessionReps + 1;

 setSessionSuccesses(newSuc);
 setSessionStreak(newStreak);
 setSessionReps(nextRep);

 if (finalSuccess) {
  setStandoutMoments((prev) => [...prev, `Rep ${nextRep}: Executed perfectly.`]);
 } else if (success && !finalSuccess) {
  // Custom backstory warning already logged to standoutMoments
 } else {
  setStandoutMoments((prev) => [...prev, `Rep ${nextRep}: Failed to execute properly.`]);
 }

 if (nextRep >= MAX_REPS) {
  processSessionEnd(newSuc, newStreak);
 } else {
  setupRep(nextRep, newStreak);
 }
 };

 const processSessionEnd = (successes: number, finalStreak: number) => {
 if (!state.player || !selectedGame) return;

 let overallResult: "Success" | "Partial" | "Fail" = "Fail";
 if (successes === MAX_REPS) overallResult = "Success";
 else if (successes > 0) overallResult = "Partial";

 if (selectedGame.engine === "RECOVERY") overallResult = "Success";

 setMgResult(overallResult);

 const p: Player = { ...state.player } as Player;

 // Update fatigue based on session type
 const isRecovery = selectedGame.engine === "RECOVERY" || intensity === "Recovery";
 
 // Flow State/In the Zone chance
 let flowTriggered = false;
 if (successes > 0 && !isRecovery) {
  const focusAttribute = p.attributes.composure || 50;
  const flowChance = (focusAttribute / 500) + (p.morale > 70 ? 0.05 : 0);
  if (Math.random() < flowChance) {
   flowTriggered = true;
   setIsFlowActive(true);
  }
 }

 if (isRecovery) {
  const fatigueChange = getFatigueCost("Recovery");
  p.fatigue = Math.max(0, p.fatigue + fatigueChange);
 } else {
  const cost = getFatigueCost(intensity);
  p.fatigue = Math.min(100, Math.max(0, p.fatigue + cost));

  // Injury trigger logic on fatigue spikes
  if (p.fatigue >= 100) {
  p.isInjured = true;
  p.injuryWeeksLeft = Math.floor(Math.random() * 3) + 4; // 4 to 6 weeks
  p.injuryName = "Grade 2 Hamstring Tear (Fatigue Blowout)";
  p.fatigue = 50;
  p.morale = Math.max(0, p.morale - 25);
  p.timeline = [
    {
      id: `injury_tr_${Date.now()}`,
      week: state.currentWeek,
      day: state.currentDay,
      type: 'INJURY',
      title: '🏥 INJURED: Hamstring Tear',
      description: 'Suffered a Grade 2 Hamstring Tear (Fatigue Blowout) during a training session. Sidelined for 4-6 weeks.',
      clubSymbol: p.currentClubSymbol
    },
    ...(p.timeline || [])
  ];
  setStandoutMoments((prev) => [
   ...prev,
   "🚨 BLOWN ENGINE: Your body completely gave out! You suffered a Grade 2 Hamstring Tear and are sidelined."
  ]);
  } else if (p.fatigue > 85) {
  setStandoutMoments((prev) => [...prev, "Physio warning: Your muscles are tightly locked. You must recover."]);
  p.morale = Math.max(0, p.morale - 5);
  }

  // Attribute Gain Calculations
  if (overallResult === "Success" || overallResult === "Partial") {
  const baseGain = getAttrGain(intensity);
  const streakBonus = finalStreak >= MAX_REPS ? 0.2 : 0;
  let totalGain = (overallResult === "Success" ? baseGain : baseGain * 0.5) + streakBonus;

  if (flowTriggered) {
   totalGain += 0.5;
   setStandoutMoments((prev) => [
    ...prev,
    "✨ FLOW STATE: You entered 'The Zone' during this session! Dynamic gains are amplified (+0.5)."
   ]);
  }

  selectedGame.targetAttributes.forEach((attr) => {
   
    const k = attr as keyof typeof p.attributes;
    if (typeof p.attributes[k] === "number") {
     const currentVal = Number(p.attributes[k]) || 50;
     const ceiling = p.ceiling || 80;
     const age = p.age || 20;
     
     // Base gain calculation using CoreFormulas
     let rawGain = CoreFormulas.calculateTrainingGain(totalGain, currentVal, ceiling, age, state.difficulty || 'STANDARD', false);
     
     // 3. Role-based multiplier
     let roleMulti = 1.0;
     if (p.roleSpecialization?.selectedRoleId) {
      const rObj = getRoleById(p.roleSpecialization.selectedRoleId);
      if (rObj && rObj.attributeWeights[k] !== undefined) {
       roleMulti = rObj.attributeWeights[k] || 1.0;
      }
     }

     const attrGain = rawGain * roleMulti;
     
     if (attrGain > 0) {
      p.attributes[k] = parseFloat(Math.min(99, currentVal + attrGain).toFixed(2));
     }
    }
  });

  // Increase role familiarity if not fully familiar
  if (p.roleSpecialization && p.roleSpecialization.familiarity < 100) {
   p.roleSpecialization.familiarity = Math.min(100, p.roleSpecialization.familiarity + 3);
   const roleObj = getRoleById(p.roleSpecialization.selectedRoleId);
   setStandoutMoments((prev) => [
    ...prev,
    `📈 ROLE FAMILIARITY: Your understanding of the ${roleObj?.name || 'role'} system grew (+3%). Current: ${p.roleSpecialization!.familiarity}%`
   ]);
  }

  p.sharpness = Math.min(100, p.sharpness + (overallResult === "Success" ? 10 : 5));
  p.ovr = calculateOVR(p.attributes, p.position);

  let hasValuedAttr = false;
  selectedGame.targetAttributes.forEach(k => {
    if (p.managerInfo?.valuedAttributes?.includes(k)) {
      hasValuedAttr = true;
    }
  });
  let trustBonus = overallResult === "Success" ? 5 : 2;
  if (hasValuedAttr) {
    trustBonus += 2; // Manager's preferred attribute bonus
  }

  // Multiply by tactical fit bonus
  if (p.managerInfo?.tacticalSystem && p.roleSpecialization?.selectedRoleId) {
      const roleObj = getRoleById(p.roleSpecialization.selectedRoleId);
      if (roleObj) {
          const fit = getManagerTacticalFit(p.managerInfo.tacticalSystem, roleObj);
          if (trustBonus > 0 && fit.bonus > 1) trustBonus = Math.ceil(trustBonus * fit.bonus);
          else if (trustBonus < 0 && fit.bonus < 1) trustBonus = Math.floor(trustBonus / fit.bonus);
      }
  }

  p.trust = Math.min(100, p.trust + trustBonus);
  }

  // Roll general injury risk
  if (!p.isInjured) {
  let injuryRisk = selectedGame.injuryRiskBase * getInjuryRiskMulti(intensity) * (1 - p.sharpness / 200);
  const fatigueMulti = p.fatigue > 80 ? 3.0 : p.fatigue > 50 ? 1.5 : 1.0;
  injuryRisk *= fatigueMulti;

  if (Math.random() < injuryRisk) {
   p.isInjured = true;
   p.injuryWeeksLeft = Math.floor(Math.random() * 2) + 1; // 1 to 2 weeks
   p.injuryName = "Minor Hamstring Strain";
   p.fatigue = Math.min(100, p.fatigue + 15);
   p.morale = Math.max(0, p.morale - 12);
   p.timeline = [
     {
       id: `injury_tr_${Date.now()}`,
       week: state.currentWeek,
       day: state.currentDay,
       type: 'INJURY',
       title: '🏥 INJURED: Hamstring Strain',
       description: 'Diagnosed with a Minor Hamstring Strain during a training session. Sidelined for 1-2 weeks.',
       clubSymbol: p.currentClubSymbol
     },
     ...(p.timeline || [])
   ];
   setStandoutMoments((prev) => [...prev, "You felt a sharp tear in your leg. Minor Hamstring Strain diagnosed."]);
  }
  }
 }

 // Apply Weekly Caps tracking
 const updatedWeekly = { ...weeklySessions };
 if (isRecovery) {
  updatedWeekly.recovery = Math.min(1, updatedWeekly.recovery + 1);
 } else if (isGroupTraining) {
  if (groupTrainingIndex === GROUP_SEQUENCE.length - 1) {
  updatedWeekly.clubOrganized = Math.min(1, updatedWeekly.clubOrganized + 1);
  }
 } else {
  updatedWeekly.individual = Math.min(3, updatedWeekly.individual + 1);
 }

 p.training = {
  weeklySessions: updatedWeekly,
  sessionHistory: [
  {
   date: new Date().toISOString().split("T")[0],
   type: selectedGame.id,
   performance: successes * 33,
   attributeGained: selectedGame.targetAttributes.join(", "),
   gainAmount: successes > 0 ? Number(getAttrGain(intensity).toFixed(1)) : 0
  },
  ...(p.training?.sessionHistory || [])
  ],
  trainingMatchHistory: p.training?.trainingMatchHistory || []
 };

 setPlayer(p);
 };

 const completeSession = () => {
  setIsFlowActive(false);
  if (isGroupTraining) {
   if (groupTrainingIndex < GROUP_SEQUENCE.length - 1) {
    const nextIndex = groupTrainingIndex + 1;
    setGroupTrainingIndex(nextIndex);
    const nextGame = UNIVERSAL_MINIGAMES.find(g => g.id === GROUP_SEQUENCE[nextIndex]);
    if (nextGame) {
     setSelectedGame(nextGame);
     setMgResult(null);
     setActiveEngine(nextGame.id);
     setSessionReps(0);
     setSessionSuccesses(0);
     setSessionStreak(0);
     setStandoutMoments([]);
     setupRep(1, 0);
     return;
    }
   } else {
    setIsGroupTraining(false);
   }
  }

  // INTERCEPT: Trigger realistic Training Ground Incident (75% probability for non-recovery)
  if (selectedGame && selectedGame.engine !== "RECOVERY" && Math.random() < 0.75 && TRAINING_INCIDENTS.length > 0) {
    const randomInc = TRAINING_INCIDENTS[Math.floor(Math.random() * TRAINING_INCIDENTS.length)];
    setActiveIncident(randomInc);
    setIncidentOutcome(null);
    return;
  }

  advanceDay();
  setActiveEngine(null);
  setMgResult(null);
  setSelectedGame(null);
 };



 const startGroupSession = () => {
 if (weeklySessions.clubOrganized >= 1) {
  setError("WEEKLY LIMIT REACHED: You can only perform 1 club group training session per week.");
  return;
 }
 if (isSpent) {
  setError("YOUR BODY IS SPENT. ACCUMULATED FATIGUE IS TOO HIGH TO TRAIN (ABOVE 90%).");
  return;
 }
 const firstGame = UNIVERSAL_MINIGAMES.find(g => g.id === GROUP_SEQUENCE[0]);
 if (!firstGame) return;
 setIsGroupTraining(true);
 setGroupTrainingIndex(0);
 setIntensity("Standard");
 setSelectedGame(firstGame);
 setMgResult(null);
 setActiveEngine(firstGame.id);
 setSessionReps(0);
 setSessionSuccesses(0);
 setSessionStreak(0);
 setStandoutMoments([]);
 setupRep(1, 0);
 };

 const handleTimingClick = () => {
 if (mgResult !== null) return completeSession();
 const sweetSpotStart = 50 - timingMargin;
 const sweetSpotEnd = 50 + timingMargin;
 if (cursorPos >= sweetSpotStart && cursorPos <= sweetSpotEnd) {
  processRepResult(true);
 } else {
  processRepResult(false);
 }
 };

 const handleDecisionClick = (correct: boolean) => {
 if (mgResult !== null) return completeSession();
 processRepResult(correct);
 };

 const handleSequenceClick = (dir: string) => {
 if (mgResult !== null) return completeSession();
 const nextSeq = [...playerSeq, dir];
 setPlayerSeq(nextSeq);

 for (let i = 0; i < nextSeq.length; i++) {
  if (nextSeq[i] !== sequence[i]) {
  processRepResult(false);
  return;
  }
 }
 if (nextSeq.length === sequence.length) {
  processRepResult(true);
 }
 };

 // Hearts and Timer update interval for heart rate challenge
 useEffect(() => {
 if (!activeEngine || selectedGame?.id !== "FIT_COND" && selectedGame?.id !== "W_SPRINT" && selectedGame?.id !== "CM_BOX2BOX") return;
 if (mgResult !== null) return;

 const timer = setInterval(() => {
  setHrSecondsLeft((prev) => {
  if (prev <= 1) {
   clearInterval(timer);
   // Check performance
   const win = heartRateGoodSecs >= 6;
   processRepResult(win);
   return 0;
  }
  // Heart rate organically fluctuates slightly towards resting (100) or stays high
  setHeartRate((hr) => Math.max(80, hr + (Math.random() > 0.5 ? 2 : -2)));
  // Tick good seconds
  if (heartRate >= hrTargetMin && heartRate <= hrTargetMax) {
   setHeartRateGoodSecs((g) => g + 1);
  }
  return prev - 1;
  });
 }, 1000);

 return () => clearInterval(timer);
 }, [activeEngine, heartRate, heartRateGoodSecs, hrSecondsLeft, mgResult]);

 // Timed Fluctuations for through-ball split defenders
 useEffect(() => {
 if (!activeEngine || selectedGame?.id !== "AM_THROUGH" && selectedGame?.id !== "FB_CROSSING" && selectedGame?.id !== "W_CROSS_BYLINE") return;
 if (mgResult !== null || strikerRunPhase === "OFFSIDE" || strikerRunPhase === "RECEIVED") return;

 const interval = setInterval(() => {
  setDefenderGap((g) => {
  let nextGap = g + defenderGapDir;
  if (nextGap >= 100) {
   setDefenderGapDir(-Math.abs(defenderGapDir));
   return 100;
  }
  if (nextGap <= 15) {
   setDefenderGapDir(Math.abs(defenderGapDir));
   return 15;
  }
  return nextGap;
  });

  if (strikerRunPhase === "RUNNING") {
  setStrikerPosition((pos) => {
   const nextPos = pos + 2.5;
   if (nextPos >= 90) {
   // Striker missed the run timing window
   setStrikerRunPhase("OFFSIDE");
   setThreadingSuccess(false);
   setTimeout(() => {
    processRepResult(false);
   }, 1200);
   return 90;
   }
   return nextPos;
  });
  }
 }, 45);

 return () => clearInterval(interval);
 }, [activeEngine, defenderGap, defenderGapDir, strikerRunPhase, strikerPosition, mgResult]);

 // NEW REACTION DRIBBBLE LANE TIMER
 useEffect(() => {
  if (!activeEngine || mgResult !== null) return;
  const isDribbleGame = selectedGame?.id === "AM_TIGHT_DRIB" || selectedGame?.id === "CB_DEF_POS" || selectedGame?.id === "FB_TRACKING" || selectedGame?.id === "W_1V1" || selectedGame?.id === "CM_PASS_COMBO" || selectedGame?.id === "CM_RETENTION" || selectedGame?.id === "GK_SHOT_STOP" || selectedGame?.id === "FB_COMBO" || selectedGame?.id === "SS_LINKUP";
  if (!isDribbleGame) return;

  const interval = setInterval(() => {
   setReactionTimeLeft((t) => {
    if (t <= 1) {
     clearInterval(interval);
     processRepResult(false);
     return 0;
    }
    return t - 1.8; // Decreases by 1.8% per tick (~850ms to react)
   });
  }, 16);
  return () => clearInterval(interval);
 }, [activeEngine, mgResult, selectedGame]);

 // NEW RONDO TIMER
 useEffect(() => {
  if (!activeEngine || mgResult !== null || selectedGame?.id !== "RONDO") return;

  const interval = setInterval(() => {
   setRondoTimer((t) => {
    if (t <= 1) {
     clearInterval(interval);
     processRepResult(false);
     return 0;
    }
    return t - 1.5;
   });
  }, 16);
  return () => clearInterval(interval);
 }, [activeEngine, mgResult, selectedGame]);

 // NEW AERIAL SLIDER
 useEffect(() => {
  if (!activeEngine || mgResult !== null) return;
  if (selectedGame?.id !== "ST_AERIAL" && selectedGame?.id !== "CB_AERIAL") return;

  const interval = setInterval(() => {
   setAerialBallPos((pos) => {
    let nextPos = pos + 2.5 * aerialBallDir;
    if (nextPos >= 100) {
     clearInterval(interval);
     processRepResult(false); // too late, missed it!
     return 100;
    }
    return nextPos;
   });
  }, 16);
  return () => clearInterval(interval);
 }, [activeEngine, mgResult, selectedGame, aerialBallDir]);

 // NEW RUN-UP POWER CHARGER
 useEffect(() => {
  if (!activeEngine || mgResult !== null || !isRunUpStarted) return;
  const isShootingGame = selectedGame?.id === "AM_LONG_SHOT" || selectedGame?.id === "ST_FINISHING" || selectedGame?.id === "ST_HOLDUP" || selectedGame?.id === "GK_CROSS_CLAIM" || selectedGame?.id === "GK_DIST" || selectedGame?.id === "W_CUT_INSIDE" || selectedGame?.id === "DM_SHIELD";
  if (!isShootingGame) return;

  const interval = setInterval(() => {
   setPowerLevel((prev) => {
    let nextPower = prev + 3.2 * powerDirection;
    if (nextPower >= 100) {
     setPowerDirection(-1);
     return 100;
    }
    if (nextPower <= 0) {
     setPowerDirection(1);
     return 0;
    }
    return nextPower;
   });
  }, 16);
  return () => clearInterval(interval);
 }, [activeEngine, mgResult, isRunUpStarted, powerDirection, selectedGame]);

 // General TIMING cursor sweep
 useEffect(() => {
 if (activeEngine !== "TIMING" && !activeEngine?.includes("TIMING") && activeEngine !== selectedGame?.id) return;
 if (selectedGame?.engine !== "TIMING") return;
 if (mgResult !== null) return;

 const interval = setInterval(() => {
  setCursorPos((pos) => {
  let n = pos + timingSpeed * cursorDir;
  if (n >= 100) {
   setCursorDir(-1);
   return 100;
  }
  if (n <= 0) {
   setCursorDir(1);
   return 0;
  }
  return n;
  });
 }, 16);
 return () => clearInterval(interval);
 }, [activeEngine, mgResult, cursorDir, timingSpeed, selectedGame]);

 // Pattern recognition display timer
 useEffect(() => {
 if (selectedGame?.id !== "PATTERN_REC") return;
 if (mgResult !== null || !patternVisible) return;
 const t = setInterval(() => {
  setPatternShowTime(p => {
  if (p <= 1) {
   setPatternVisible(false);
   clearInterval(t);
   return 0;
  }
  return p - 1;
  });
 }, 1000);
 return () => clearInterval(t);
 }, [selectedGame, mgResult, patternVisible]);

 const triggerReactionLaneChange = (laneIdx: number) => {
  if (mgResult !== null) return;
  setPlayerLane(laneIdx);
  const success = laneIdx !== dribbleLane;
  processRepResult(success);
 };

 const triggerRondoPass = (outletIdx: number) => {
  if (mgResult !== null) return;
  setRondoTarget(outletIdx);
  const success = outletIdx === rondoOpenOutlet;
  processRepResult(success);
 };

 const triggerAerialStrike = () => {
  if (mgResult !== null || aerialResult !== null) return;
  const success = aerialBallPos >= 42 && aerialBallPos <= 58;
  setAerialResult(success);
  processRepResult(success);
 };

 const triggerShootingRunupToggle = () => {
  if (mgResult !== null) return;
  setIsRunUpStarted(true);
  setPowerLevel(0);
  setPowerDirection(1);
 };

 const triggerShootingStrike = (target: string) => {
  if (mgResult !== null || !isRunUpStarted) return;
  setShootingTargetSelected(target);
  setIsRunUpStarted(false);

  const isCorrectTarget = target === shootingCurrentTarget;
  const isCorrectPower = powerLevel >= 65 && powerLevel <= 82;
  const success = isCorrectTarget && isCorrectPower;

  processRepResult(success);
 };

 const triggerGauntletMove = (direction: "LEFT" | "STRAIGHT" | "RIGHT") => {
 if (mgResult !== null) return;
 let nextX = gauntletPlayerX;
 if (direction === "LEFT") nextX = Math.max(0, gauntletPlayerX - 1);
 if (direction === "RIGHT") nextX = Math.min(4, gauntletPlayerX + 1);

 const nextRow = gauntletRow - 1;

 // Check collision in the new row
 if (nextRow >= 0) {
  const isHit = gauntletGrid[nextRow][nextX] === 1;
  if (isHit) {
  setStandoutMoments((prev) => [...prev, `Collision with a cone at row ${5 - nextRow}!`]);
  processRepResult(false);
  } else {
  setGauntletPlayerX(nextX);
  setGauntletRow(nextRow);
  if (nextRow === 0) {
   processRepResult(true);
  }
  }
 }
 };

 const triggerPenaltyShot = (target: string) => {
 if (mgResult !== null || penaltyTargetSelected !== null) return;
 setPenaltyTargetSelected(target);
 const isPerfectTiming = cursorPos >= 45 && cursorPos <= 55;
 if (isPerfectTiming) {
  setPenaltyResult(true);
  setTimeout(() => processRepResult(true), 1500);
 } else {
  setPenaltyResult(false);
  setTimeout(() => processRepResult(false), 1500);
 }
 };

 useEffect(() => {
 if ((selectedGame?.id !== "ST_AERIAL" && selectedGame?.id !== "CB_AERIAL") || aerialPhase !== 'CROSSING') return;
 if (aerialCountdown === null) return;
 
 const t = setTimeout(() => {
  if (aerialCountdown > 0) {
  setAerialCountdown(aerialCountdown - 1);
  } else {
  setAerialPhase('BALL_ARRIVED');
  }
 }, 1000);
 return () => clearTimeout(t);
 }, [selectedGame, aerialPhase, aerialCountdown]);

 useEffect(() => {
 if ((selectedGame?.id !== "ST_AERIAL" && selectedGame?.id !== "CB_AERIAL") || aerialPhase !== 'BALL_ARRIVED') return;
 
 const t = setTimeout(() => {
  setAerialPhase('MISSED');
  setAerialResult(false);
  processRepResult(false);
 }, 450); // 450ms window to react
 return () => clearTimeout(t);
 }, [selectedGame, aerialPhase]);

 const triggerAerialJump = () => {
 if (mgResult !== null || aerialResult !== null) return;
 if (aerialPhase === 'IDLE') {
  setAerialPhase('CROSSING');
  setAerialCountdown(3);
 } else if (aerialPhase === 'CROSSING') {
  setAerialPhase('MISSED');
  setAerialResult(false);
  processRepResult(false);
 } else if (aerialPhase === 'BALL_ARRIVED') {
  setAerialPhase('IDLE');
  setAerialResult(true);
  processRepResult(true);
 }
 };

 const triggerShootingHold = () => {
 if (isChargingPower || mgResult !== null) return;
 setIsChargingPower(true);
 setPowerLevel(0);
 setPowerDirection(1);

 powerIntervalRef.current = setInterval(() => {
  setPowerLevel((prev) => {
  let nextPower = prev + 5 * powerDirection;
  if (nextPower >= 100) {
   setPowerDirection(-1);
   return 100;
  }
  if (nextPower <= 0) {
   setPowerDirection(1);
   return 0;
  }
  return nextPower;
  });
 }, 30);
 };

 const triggerShootingRelease = (target: string) => {
 if (!isChargingPower || mgResult !== null) return;
 if (powerIntervalRef.current) clearInterval(powerIntervalRef.current);
 setIsChargingPower(false);
 setShootingTargetSelected(target);

 // Calculate score based on power accuracy and correct target
 const isCorrectTarget = target === shootingCurrentTarget;
 // Optimal power is between 65% and 80%
 const isCorrectPower = powerLevel >= 65 && powerLevel <= 82;

 const success = isCorrectTarget && isCorrectPower;
 setTimeout(() => {
  processRepResult(success);
 }, 1000);
 };

 const triggerRondoRelease = (targetIdx: number) => {
 if (!isChargingPower || mgResult !== null) return;
 if (powerIntervalRef.current) clearInterval(powerIntervalRef.current);
 setIsChargingPower(false);

 // Let's say target distance required power is based on the target
 const requiredPower = 30 + (targetIdx * 15);
 const success = Math.abs(powerLevel - requiredPower) < 15;
 
 setTimeout(() => {
  processRepResult(success);
 }, 500);
 };

 const triggerThreadPass = (power: "SOFT" | "MEDIUM" | "HARD") => {
 if (strikerRunPhase !== "READY" || mgResult !== null) return;
 setStrikerRunPhase("RUNNING");
 setStrikerPosition(15);

 // Timing score depends on gap size when pass is triggered
 const gapScore = defenderGap; // Above 70 represents a wide defensive split

 setTimeout(() => {
  // Determine if striker catches ball
  const passQuality = gapScore > 72;
  const powerMatches =
  (power === "SOFT" && gapScore > 85) ||
  (power === "MEDIUM" && gapScore >= 70 && gapScore <= 85) ||
  (power === "HARD" && gapScore < 70);

  const win = passQuality && powerMatches;
  setStrikerRunPhase(win ? "RECEIVED" : "OFFSIDE");
  setThreadingSuccess(win);

  setTimeout(() => {
  processRepResult(win);
  }, 1200);
 }, 800);
 };

 const triggerPosGridSelect = (r: number, c: number) => {
 if (mgResult !== null) return;
 setSelectedGridCell({ r, c });
 const success = r === correctGridCell.r && c === correctGridCell.c;
 setTimeout(() => {
  processRepResult(success);
 }, 1000);
 };

 const triggerFitnessHRControl = (intensity: "REST" | "JOG" | "SPRINT") => {
 if (mgResult !== null) return;
 setHeartRate((prev) => {
  if (intensity === "REST") return Math.max(80, prev - 15);
  if (intensity === "JOG") return Math.min(200, prev + 12);
  return Math.min(220, prev + 25); // SPRINT
 });
 };

 // Launch Training Match flow
 const startTrainingMatchMode = () => {
 if (!state.player) return;
 if (weeklySessions.trainingMatch >= 1) {
  setError("WEEKLY LIMIT REACHED: You've already played your weekly training match.");
  return;
 }

 setIsTrainingMatch(true);
 setMatchScore({ player: 0, opponent: 0 });
 setMatchLog(["The manager blows the whistle. Friendly training match starts under the eyes of the staff!"]);
 setCurrentMatchDecisionIdx(0);
 setTrainingMatchGoals(0);
 setTrainingMatchAssists(0);
 setTrainingMatchComplete(false);
 loadMatchDecision(0);
 };

 const loadMatchDecision = (idx: number) => {
 const decisions: TrainingMatchDecision[] = [
  {
  minute: 15,
  situation: "You pick up the ball in the transition zone near the center circle. Defenders are stepping up quickly to press.",
  options: [
   {
   text: "Thread a vertical through ball to the running striker",
   attribute: "vision",
   successRate: 60,
   successLog: "Incredible pass! You split the defenders perfectly, giving the striker an easy finish! Assist recorded!",
   failLog: "Your pass lacks weight. Slipped directly into the center back's path."
   },
   {
   text: "Dribble past the advancing midfielder",
   attribute: "dribbling",
   successRate: 55,
   successLog: "Silky footwork! You execute a step-over, beating your marker cleanly and opening up play.",
   failLog: "The midfielder reads your movement and executes a clean tackle."
   },
   {
   text: "Calmly shift play wide to the open winger",
   attribute: "passing",
   successRate: 80,
   successLog: "Safe and effective. You switch the play nicely, keeping ball possession.",
   failLog: "A sloppy pass sails out of bounds for an opposition throw."
   }
  ]
  },
  {
  minute: 44,
  situation: "A floating cross is delivered from the left wing right towards your zone inside the penalty box.",
  options: [
   {
   text: "Execute a volley first-time into the corner",
   attribute: "finishing",
   successRate: 50,
   successLog: "WHAT A GOAL! You smash the volley directly into the roof of the net! Stunning strike!",
   failLog: "You slice the volley, sending it harmlessly wide of the target."
   },
   {
   text: "Leap and direct a powerful header down",
   attribute: "strength",
   successRate: 65,
   successLog: "Goal! You win the aerial duel and bullet the header past the keeper's reach!",
   failLog: "The defender wins the physical battle, shielding the ball away."
   },
   {
   text: "Cushion the ball down cleanly to retain possession",
   attribute: "firstTouch",
   successRate: 75,
   successLog: "Glued to your boot! Exceptional first touch allows you to turn and pass to an oncoming midfielder.",
   failLog: "The ball bounces off your shin and is immediately cleared by defense."
   }
  ]
  },
  {
  minute: 75,
  situation: "Opposition launches a quick counter down your channel as fatigue levels set in.",
  options: [
   {
   text: "Perform an aggressive tactical sliding tackle",
   attribute: "tackling",
   successRate: 50,
   successLog: "Fantastic tackle! You cleanly sweep the ball away and immediately kickstart a counter.",
   failLog: "You miss the ball completely. The manager scowls at your rash sliding attempt."
   },
   {
   text: "Maintain position and shadow their passing lane",
   attribute: "decisionMaking",
   successRate: 70,
   successLog: "Smart choice. You intercept their passing sequence and calmly recycle the ball.",
   failLog: "The playmaker slides it right through your zone anyway as you stood passive."
   },
   {
   text: "Sprint back to double-up with your full back",
   attribute: "stamina",
   successRate: 60,
   successLog: "Endless lung capacity! You catch up, apply physical pressure, and win the goal kick.",
   failLog: "You're too spent. The attacker breezes past you on the outside easily."
   }
  ]
  }
 ];

 setActiveMatchDecision(decisions[idx]);
 };

 const handleMatchDecisionSelect = (opt: any) => {
 if (!state.player || !activeMatchDecision) return;

 const playerAttrValue = Number(state.player.attributes[opt.attribute] || 50);
 // Attribute scaling for the training match check
 const rolledChance = opt.successRate + (playerAttrValue - 60) * 0.5;
 const isSuccess = Math.random() * 100 < rolledChance;

 let pGoals = trainingMatchGoals;
 let pAssists = trainingMatchAssists;
 let pScore = matchScore.player;
 let oScore = matchScore.opponent;

 if (isSuccess) {
  setMatchLog((prev) => [...prev, `[Min ${activeMatchDecision.minute}] Success: ${opt.successLog}`]);
  if (opt.attribute === "finishing" || opt.attribute === "strength") {
  pGoals += 1;
  pScore += 1;
  }
  if (opt.attribute === "vision") {
  pAssists += 1;
  pScore += 1;
  }
 } else {
  setMatchLog((prev) => [...prev, `[Min ${activeMatchDecision.minute}] Failed: ${opt.failLog}`]);
  if (Math.random() < 0.25) {
  oScore += 1;
  setMatchLog((prev) => [...prev, `[Min ${activeMatchDecision.minute}] Goal conceded on the counter.`]);
  }
 }

 setTrainingMatchGoals(pGoals);
 setTrainingMatchAssists(pAssists);
 setMatchScore({ player: pScore, opponent: oScore });

 const nextIdx = currentMatchDecisionIdx + 1;
 if (nextIdx >= 3) {
  // End training match
  setTrainingMatchComplete(true);
  // Calculate rating based on actions
  const finalRating = Number((6.0 + pGoals * 1.5 + pAssists * 1.0 + (isSuccess ? 0.8 : -0.5)).toFixed(1));
  setTrainingMatchRating(finalRating);
 } else {
  setCurrentMatchDecisionIdx(nextIdx);
  loadMatchDecision(nextIdx);
 }
 };

 const completeTrainingMatch = () => {
 if (!state.player) return;

 const p: Player = { ...state.player } as Player;
 const updatedWeekly = {
  ...weeklySessions,
  trainingMatch: 1
 };

 // Training match increases fatigue by 15%, boosts sharpness and chemistry
 p.fatigue = Math.min(100, p.fatigue + 15);
 p.sharpness = Math.min(100, p.sharpness + 15);

 let trainingMatchTrustGain = Math.round(trainingMatchRating - 6.0);
 let preferredBoost = 0;
 if (p.managerInfo?.valuedAttributes) {
  p.managerInfo.valuedAttributes.forEach((k) => {
   const val = p.attributes[k as keyof typeof p.attributes] || 50;
   if (val >= 75) preferredBoost += 1;
  });
 }
 p.trust = Math.min(100, p.trust + trainingMatchTrustGain + preferredBoost);
 p.form = Math.min(100, p.form + Math.round(trainingMatchRating - 6.0) * 2);

 // Dynamic chemistry gains
 p.relationships = {
  ...p.relationships,
  teammates: Math.min(100, p.relationships.teammates + 5)
 };

 p.training = {
  weeklySessions: updatedWeekly,
  sessionHistory: p.training?.sessionHistory || [],
  trainingMatchHistory: [
  {
   date: new Date().toISOString().split("T")[0],
   rating: trainingMatchRating,
   goals: trainingMatchGoals,
   assists: trainingMatchAssists
  },
  ...(p.training?.trainingMatchHistory || [])
  ]
 };

 setPlayer(p);
 setIsTrainingMatch(false);
 advanceDay();
 };

 return (
 <div className="flex flex-col h-full bg-black text-white overflow-hidden p-6 md:p-8 font-sans">
  {/* RICH HEADER */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
  <div>
   <div className="flex items-center gap-2">
   <h1 className="text-white text-3xl font-black uppercase tracking-tight">
    TRAINING CENTER
   </h1>
   <span className="bg-[#00FF88] text-black text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-widest animate-pulse">
    Elite System
   </span>
   </div>
   <p className="text-white/50 text-xs font-mono uppercase tracking-wider mt-1">
   Build specialized thresholds & tactical discipline safely
   </p>
  </div>
  <div className="flex items-center gap-3">
   <button
   onClick={() => setScreen("HUB")}
   className="px-5 py-2.5 glass-panel hover:border-[#00FF88] text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all"
   >
   ← Career Hub
   </button>
  </div>
  </div>

  {/* ERROR WARNINGS */}
  {error && (
  <div className="mb-6 p-4 bg-red-950/40 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono uppercase tracking-wider flex items-center justify-between animate-fade-in">
   <span className="flex items-center gap-2">
   <AlertTriangle size={16} className="text-red-400" /> {error}
   </span>
   <button
   onClick={() => setError(null)}
   className="text-red-400 hover:text-white font-black px-3 py-1 bg-red-900/40 rounded text-[10px] uppercase tracking-widest transition-colors"
   >
   Dismiss
   </button>
  </div>
  )}

  {/* TRAINING MATCH MODULE IN PROGRESS */}
  {isTrainingMatch ? (
  <div className="flex-1 max-w-4xl w-full mx-auto premium-card rounded-2xl p-6 md:p-8 flex flex-col justify-between animate-fade-in">
   <div>
   <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
    <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-900/30 text-amber-500 border border-amber-500/30 px-3 py-1 rounded-full">
    Midweek 11v11 Training Match
    </span>
    <div className="text-right">
    <span className="text-xs font-mono text-white/50 block uppercase">Scoreboard</span>
    <span className="text-2xl font-black tracking-tight text-white">
     Blues {matchScore.player} - {matchScore.opponent} Reds
    </span>
    </div>
   </div>

   {trainingMatchComplete ? (
    <div className="text-center py-8 animate-fade-in">
    <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
    <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
     Training Match Finished
    </h2>
    <p className="text-white/50 text-xs font-mono uppercase tracking-widest mb-6">
     Final Whistle Blown at the Training Ground
    </p>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
     <div className="glass-panel p-4 rounded-xl ">
     <span className="text-white/50 text-[9px] uppercase tracking-widest block mb-1">Match Rating</span>
     <span className="text-2xl font-mono font-bold text-[#00FF88]">{trainingMatchRating}</span>
     </div>
     <div className="glass-panel p-4 rounded-xl ">
     <span className="text-white/50 text-[9px] uppercase tracking-widest block mb-1">Goals scored</span>
     <span className="text-2xl font-mono font-bold text-white">{trainingMatchGoals}</span>
     </div>
     <div className="glass-panel p-4 rounded-xl ">
     <span className="text-white/50 text-[9px] uppercase tracking-widest block mb-1">Assists</span>
     <span className="text-2xl font-mono font-bold text-white">{trainingMatchAssists}</span>
     </div>
     <div className="glass-panel p-4 rounded-xl ">
     <span className="text-white/50 text-[9px] uppercase tracking-widest block mb-1">Fatigue delta</span>
     <span className="text-2xl font-mono font-bold text-red-500">+15%</span>
     </div>
    </div>

    <div className="bg-[#141414] p-4 rounded-xl max-w-2xl mx-auto mb-8 text-left">
     <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest block mb-2">
     Physical & tactical rewards:
     </span>
     <ul className="text-xs font-mono text-[#aaa] space-y-1.5 list-disc pl-4">
     <li>Match Sharpness boosted (+15)</li>
     <li>Team Chemistry increased (+5)</li>
     <li>Manager trust and form modified based on rating</li>
     </ul>
    </div>

    <button
     onClick={completeTrainingMatch}
     className="bg-white text-black hover:bg-[#00FF88] hover:text-white px-10 py-3.5 rounded-lg font-black uppercase tracking-widest text-xs transition-colors"
    >
     Return to Hub
    </button>
    </div>
   ) : (
    <div className="space-y-6">
    <div className="glass-panel rounded-xl p-5">
     <p className="text-white text-sm leading-relaxed mb-4">
     {activeMatchDecision?.situation}
     </p>
     <div className="flex flex-col gap-3">
     {activeMatchDecision?.options.map((opt, i) => (
      <button
      key={i}
      onClick={() => handleMatchDecisionSelect(opt)}
      className="text-left w-full bg-[#1e1e1e] hover:bg-[#252525] hover:border-[#00FF88] px-5 py-4 rounded-lg text-xs font-bold transition-all flex justify-between items-center group"
      >
      <span className="text-white">{opt.text}</span>
      <span className="text-[9px] uppercase tracking-widest bg-[#2d2d2d] group-hover:bg-[#00FF88] group-hover:text-black text-white/50 px-2.5 py-1 rounded font-mono">
       {opt.attribute} check
      </span>
      </button>
     ))}
     </div>
    </div>

        <div className="bg-[#141414] rounded-xl p-5">
     <span className="text-white/50 text-[9px] uppercase tracking-widest block mb-2 border-b border-white/10 pb-1">
      Match Highlights Log
     </span>
     {matchLog.length > 0 ? (
       <div className="space-y-1 max-h-[160px] overflow-y-auto font-mono text-xs text-[#aaa]">
        {matchLog.map((log, index) => (
        <p key={index} className="border-l border-[#00FF88] pl-3">
         {log}
        </p>
        ))}
       </div>
     ) : (
       <div className="py-6 text-center text-white/30 text-[10px] uppercase tracking-widest font-bold">
         No match events recorded yet.
       </div>
     )}

    </div>
    </div>
   )}
   </div>
   </div>
  ) : (<>

  {activeEngine ? (
   <div className="flex-1 overflow-y-auto no-scrollbar p-6">
    {/* GAME 1: THE GAUNTLET REVISION */}
         {(selectedGame?.id === "AM_TIGHT_DRIB" || selectedGame?.id === "CB_DEF_POS" || selectedGame?.id === "FB_TRACKING" || selectedGame?.id === "W_1V1" || selectedGame?.id === "CM_PASS_COMBO" || selectedGame?.id === "CM_RETENTION" || selectedGame?.id === "GK_SHOT_STOP" || selectedGame?.id === "FB_COMBO" || selectedGame?.id === "SS_LINKUP") && (
     <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in">
      <div className="text-center mb-4">
       <span className="text-[10px] uppercase font-mono tracking-widest bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 px-3 py-1 rounded-full">
        Tactical Reaction Zone
       </span>
       <h3 className="text-xl font-black uppercase mt-2 tracking-tight text-white">
        Dribble Gauntlet / Close Control
       </h3>
       <p className="text-[11px] text-white/50 font-mono mt-1">
        Rushing defender is closing down fast! Switch lanes before the timer runs out to avoid the tackle.
       </p>
      </div>

      <div className="w-full glass-panel border-white/10 rounded-2xl p-6 mb-6 flex flex-col items-center relative overflow-hidden bg-[#0d0d0d]">
       <div className="grid grid-cols-3 gap-3 w-full h-44 relative bg-emerald-950/10 rounded-xl border border-white/5 p-3">
        {[0, 1, 2].map((laneIdx) => {
         const isDefenderHere = laneIdx === dribbleLane;
         const isPlayerHere = laneIdx === playerLane;
         return (
          <div
           key={laneIdx}
           className={`relative rounded-lg flex flex-col items-center justify-between p-2 border transition-all duration-200 ${
            isDefenderHere
             ? "bg-red-950/20 border-red-500/40 text-red-400"
             : isPlayerHere
             ? "bg-[#00FF88]/10 border-[#00FF88]/40 text-[#00FF88]"
             : "bg-white/5 border-white/5"
           }`}
          >
           <span className="text-[9px] font-mono uppercase text-white/40">
            {laneIdx === 0 ? "Left Channel" : laneIdx === 1 ? "Center" : "Right Channel"}
           </span>

           {isDefenderHere && (
            <div className="flex flex-col items-center animate-bounce">
             <span className="text-2xl">🏃‍♂️🔴</span>
             <span className="text-[9px] font-mono bg-red-500 text-black px-1.5 py-0.5 rounded font-black mt-1 uppercase">
              Tackle
             </span>
            </div>
           )}

           {isPlayerHere && (
            <div className="flex flex-col items-center animate-pulse">
             <span className="text-2xl">⚽🟢</span>
             <span className="text-[9px] font-mono bg-[#00FF88] text-black px-1.5 py-0.5 rounded font-black mt-1 uppercase">
              You
             </span>
            </div>
           )}

           <div />
          </div>
         );
        })}
       </div>

       <div className="w-full mt-6">
        <div className="flex justify-between text-[10px] font-mono text-[#00FF88] mb-1">
         <span>REACTION WINDOW</span>
         <span className={reactionTimeLeft > 30 ? "text-[#00FF88]" : "text-red-500"}>
          {reactionTimeLeft.toFixed(0)}% LEFT
         </span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
         <div
          className={`h-full transition-all duration-75 ${
           reactionTimeLeft > 30 ? "bg-[#00FF88]" : "bg-red-500"
          }`}
          style={{ width: `${reactionTimeLeft}%` }}
         />
        </div>
       </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full mb-6">
       {[0, 1, 2].map((idx) => (
        <button
         key={idx}
         onClick={() => triggerReactionLaneChange(idx)}
         className={`py-4 glass-panel rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
          playerLane === idx
           ? "border-[#00FF88] text-[#00FF88] bg-[#00FF88]/5"
           : "border-white/10 text-white/60 hover:border-white hover:text-white"
         }`}
        >
         {idx === 0 ? "Shift Left" : idx === 1 ? "Hold Center" : "Shift Right"}
        </button>
       ))}
      </div>
     </div>
     )}



    {/* GAME 2: POWER & PLACEMENT SHOOTING */}
         {(selectedGame?.id === "AM_LONG_SHOT" || selectedGame?.id === "ST_FINISHING" || selectedGame?.id === "ST_HOLDUP" || selectedGame?.id === "GK_CROSS_CLAIM" || selectedGame?.id === "GK_DIST" || selectedGame?.id === "W_CUT_INSIDE" || selectedGame?.id === "DM_SHIELD") && (
     <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in">
      <div className="text-center mb-4">
       <span className="text-[10px] uppercase font-mono tracking-widest bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/20 px-3 py-1 rounded-full">
        Striking Metronome
       </span>
       <h3 className="text-xl font-black uppercase mt-2 tracking-tight text-white">
        Precision Power Strike
       </h3>
       <p className="text-[11px] text-white/50 font-mono mt-1">
        Target: <span className="text-[#00FF88] font-bold">{shootingCurrentTarget}</span>. Start your run-up and strike the ball exactly inside the sweet spot!
       </p>
      </div>

      <div className="w-full glass-panel border-white/10 rounded-2xl p-6 mb-6 flex flex-col items-center bg-[#0d0d0d]">
       <div className="w-full grid grid-cols-3 gap-2.5 mb-6 max-w-sm relative aspect-[3/1.2] bg-black/40 p-4 border border-white/10 rounded-xl">
        {["TOP-LEFT", "TOP-CENTER", "TOP-RIGHT", "BOTTOM-LEFT", "BOTTOM-CENTER", "BOTTOM-RIGHT"].map((zone) => {
         const isCurrent = zone === shootingCurrentTarget;
         const isSelected = zone === shootingTargetSelected;
         return (
          <button
           key={zone}
           onClick={() => isRunUpStarted && triggerShootingStrike(zone)}
           disabled={!isRunUpStarted}
           className={`flex flex-col items-center justify-center rounded-lg text-[9px] font-mono border font-black uppercase transition-all relative ${
            isCurrent
             ? "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88] shadow-[0_0_10px_rgba(0,255,136,0.2)] animate-pulse"
             : isSelected
             ? "bg-white text-black border-white"
             : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
           } ${!isRunUpStarted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
           {zone}
           {isCurrent && <span className="absolute top-1 right-1 text-xs">🎯</span>}
          </button>
         );
        })}
       </div>

       <div className="w-full max-w-sm">
        <div className="flex justify-between text-[10px] font-mono text-white/50 mb-1.5">
         <span>RUN-UP POWER LEVEL</span>
         <span className="text-[#00FF88] font-bold">65% - 82% OPTIMAL</span>
        </div>
        <div className="h-6 bg-white/10 rounded-full overflow-hidden relative">
         <div
          className="absolute top-0 bottom-0 bg-[#00FF88] transition-all duration-[16ms]"
          style={{ width: `${powerLevel}%` }}
         />
         <div className="absolute top-0 bottom-0 left-[65%] right-[18%] bg-emerald-500/20 border-l border-r border-[#00FF88] flex items-center justify-center text-[8px] font-mono text-[#00FF88] font-black tracking-widest">
          SWEET SPOT
         </div>
        </div>
       </div>
      </div>

      <div className="w-full max-w-sm mb-6">
       {!isRunUpStarted ? (
        <button
         onClick={triggerShootingRunupToggle}
         className="w-full py-5 bg-white text-black hover:bg-[#00FF88] hover:text-black font-black uppercase text-xs rounded-xl tracking-widest transition-all duration-200 border border-transparent shadow-lg"
        >
         👟 START RUN-UP
        </button>
       ) : (
        <div className="text-center py-4 text-xs font-mono text-white/60 uppercase animate-pulse">
         ⚡ Run-Up active! Click your target <span className="text-[#00FF88] font-bold">{shootingCurrentTarget}</span> on the goal to strike!
        </div>
       )}
      </div>
     </div>
     )}



    {/* GAME: PENALTY SHOOTOUT */}
         {selectedGame?.id === "ST_PENALTY" && (
     <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in">
      <div className="text-center mb-4">
       <span className="text-[10px] uppercase font-mono tracking-widest bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/20 px-3 py-1 rounded-full">
        Spot Kick Duel
       </span>
       <h3 className="text-xl font-black uppercase mt-2 tracking-tight text-white">
        Match Point Penalty Kick
       </h3>
       <p className="text-[11px] text-white/50 font-mono mt-1">
        Select your target precisely when the sliding metronome hits the green zone!
       </p>
      </div>

      <div className="w-full glass-panel border-white/10 rounded-2xl p-6 mb-6 flex flex-col items-center bg-[#0d0d0d]">
       <div className="w-full h-8 bg-white/10 relative mb-8 rounded-lg max-w-sm overflow-hidden">
        <div
         className="absolute top-0 bottom-0 bg-emerald-500/20 border-l border-r border-[#00FF88]"
         style={{
          left: '45%',
          right: '45%',
         }}
        />
        <div
         className="absolute top-0 bottom-0 w-2 bg-[#00FF88] -ml-1 shadow-md"
         style={{ left: `${cursorPos}%` }}
        />
       </div>

       <div className="w-full max-w-sm grid grid-cols-2 gap-2 mb-4">
        {["TOP-LEFT", "TOP-RIGHT", "BOTTOM-LEFT", "BOTTOM-RIGHT"].map((target) => (
         <button
          key={target}
          onClick={() => triggerPenaltyShot(target)}
          className={`py-4 font-black border transition-colors rounded-lg text-xs uppercase tracking-wider ${
           penaltyTargetSelected === target
            ? 'bg-[#00FF88] text-black border-[#00FF88]'
            : 'glass-panel text-white/50 border-white/10 hover:border-white'
          }`}
         >
          {target.replace("-", " ")}
         </button>
        ))}
        <button
         onClick={() => triggerPenaltyShot("CENTER")}
         className={`col-span-2 py-4 font-black border transition-colors rounded-lg text-xs uppercase tracking-wider ${
          penaltyTargetSelected === "CENTER"
           ? 'bg-[#00FF88] text-black border-[#00FF88]'
           : 'glass-panel text-white/50 border-white/10 hover:border-white'
         }`}
        >
         CENTER SHOT
        </button>
       </div>

       {penaltyResult !== null && (
        <div className={`text-2xl font-black uppercase mt-4 ${penaltyResult ? 'text-[#00FF88]' : 'text-red-500'}`}>
         {penaltyResult ? '💥 GOAL!' : '❌ SAVED / WIDE!'}
        </div>
       )}
      </div>
     </div>
     )}



    {/* GAME: HEADING PRACTICE */}
    {(selectedGame?.id === "ST_AERIAL" || selectedGame?.id === "CB_AERIAL") && (
     <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in">
      <div className="text-center mb-4">
       <span className="text-[10px] uppercase font-mono tracking-widest bg-purple-950/50 text-[#00FF88] border border-[#00FF88]/20 px-3 py-1 rounded-full">
        Aerial Metronome
       </span>
       <h3 className="text-xl font-black uppercase mt-2 tracking-tight text-white">
        Rhythmic Cross & Header
       </h3>
       <p className="text-[11px] text-white/50 font-mono mt-1">
        Strike the incoming ball exactly when the icon lines up with the green sweet spot!
       </p>
      </div>

      <div className="w-full glass-panel border-white/10 rounded-2xl p-6 mb-6 flex flex-col items-center bg-[#0d0d0d]">
       <div className="w-full h-10 bg-white/10 relative mb-8 rounded-full max-w-sm border border-white/5 overflow-hidden">
        <div
         className="absolute top-0 bottom-0 bg-[#00FF88]/20 border-l border-r border-[#00FF88] flex items-center justify-center text-[8px] font-mono text-[#00FF88]"
         style={{
          left: '42%',
          right: '42%',
         }}
        >
         SWEET SPOT
        </div>
        <div
         className="absolute top-1/2 -mt-3.5 w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs shadow-lg transition-all animate-pulse"
         style={{ left: `calc(${aerialBallPos}% - 14px)` }}
        >
         ⚽
        </div>
       </div>

       <button
        onClick={triggerAerialStrike}
        disabled={aerialResult !== null}
        className="w-full max-w-sm py-5 bg-[#00FF88] text-black hover:bg-white hover:text-black font-black uppercase text-sm rounded-xl tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
       >
        💥 CONNECT HEADER
       </button>

       {aerialResult !== null && (
        <div className={`mt-6 text-xl font-black uppercase ${aerialResult ? 'text-[#00FF88]' : 'text-red-500'}`}>
         {aerialResult ? '👑 PERFECT CONNECTION!' : '❌ LOST FOCUS / MISSED'}
        </div>
       )}
      </div>
     </div>
     )}



    {/* GAME 3: THROUGH-BALL SPLIT DEFENSE */}
    {(selectedGame?.id === "AM_THROUGH" || selectedGame?.id === "FB_CROSSING" || selectedGame?.id === "W_CROSS_BYLINE") && (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
     <p className="text-xs text-white/50 font-mono tracking-widest uppercase mb-4">
     Gap widest: Above 72! Match pass to gap size.
     </p>

     <div className="w-full h-36 glass-panel rounded-2xl p-4 relative mb-6 overflow-hidden max-w-sm">
     {/* Striker representation */}
     <div
      className="absolute top-4 bg-emerald-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
      style={{ left: `${strikerPosition}%` }}
     >
      🏃 Striker
     </div>

     {/* Defenders representation */}
     <div className="absolute top-16 left-0 right-0 h-4 flex justify-between px-6">
      <div
      className="w-10 h-6 bg-red-900/60 border border-red-500 text-red-300 text-[8px] font-mono rounded flex items-center justify-center transition-all"
      style={{ marginLeft: `${100 - defenderGap}%` }}
      >
      🔴 DEF
      </div>
      <div
      className="w-10 h-6 bg-red-900/60 border border-red-500 text-red-300 text-[8px] font-mono rounded flex items-center justify-center transition-all"
      style={{ marginRight: `${100 - defenderGap}%` }}
      >
      🔴 DEF
      </div>
     </div>

     {/* Gap reading */}
     <div className="absolute top-24 left-0 right-0 text-center">
      <span className="text-xs font-mono text-white/50">Defensive Split: </span>
      <span className={`text-sm font-mono font-bold ${defenderGap > 72 ? "text-emerald-400" : "text-red-400"}`}>
      {defenderGap.toFixed(0)}%
      </span>
     </div>

     {/* You at bottom */}
     <div className="absolute bottom-4 left-1/2 -ml-6 bg-[#00FF88] text-black text-[10px] font-bold px-3 py-1 rounded-full">
      ⚽ YOU
     </div>

     {strikerRunPhase === "RECEIVED" && (
      <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center text-sm font-black text-emerald-300 uppercase font-mono animate-fade-in">
      Goal opportunity created!
      </div>
     )}

     {strikerRunPhase === "OFFSIDE" && (
      <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center text-sm font-black text-red-300 uppercase font-mono animate-fade-in">
      Pass Blocked / Offside!
      </div>
     )}
     </div>

     <div className="flex gap-2 w-full max-w-sm">
     <button
      onClick={() => triggerThreadPass("SOFT")}
      className="flex-1 bg-[#1c1c1c] hover:border-white py-3 rounded text-[10px] font-bold font-mono"
     >
      SOFT PASS
     </button>
     <button
      onClick={() => triggerThreadPass("MEDIUM")}
      className="flex-1 bg-[#1c1c1c] hover:border-white py-3 rounded text-[10px] font-bold font-mono"
     >
      MEDIUM PASS
     </button>
     <button
      onClick={() => triggerThreadPass("HARD")}
      className="flex-1 bg-[#1c1c1c] hover:border-white py-3 rounded text-[10px] font-bold font-mono"
     >
      HARD PASS
     </button>
     </div>
    </div>
    )}

    {/* GAME 6: FITNESS & CONDITIONING */}
    {(selectedGame?.id === "FIT_COND" || selectedGame?.id === "W_SPRINT" || selectedGame?.id === "CM_BOX2BOX") && (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
     <div className="text-red-500 font-bold text-lg mb-2 flex items-center gap-2 font-mono">
     ⏱️ TIME LIMIT: {hrSecondsLeft}s
     </div>
     <p className="text-xs text-white/50 font-mono tracking-widest uppercase mb-4">
     Stable Seconds: {heartRateGoodSecs} / 6 to win!
     </p>

     <div className="w-full glass-panel p-4 rounded-2xl max-w-sm mb-6">
     <div className="flex justify-between text-xs font-mono text-white/50 mb-1">
      <span>HEART RATE</span>
      <span className={heartRate >= hrTargetMin && heartRate <= hrTargetMax ? "text-emerald-500" : "text-amber-500"}>
      {heartRate.toFixed(0)} BPM
      </span>
     </div>

     <div className="h-6 bg-white/10 rounded-full overflow-hidden relative mb-4">
      <div
      className="absolute top-0 bottom-0 bg-red-600 transition-all duration-300"
      style={{ width: `${(heartRate / 220) * 100}%` }}
      ></div>
      {/* Target Zone */}
      <div
      className="absolute top-0 bottom-0 bg-emerald-500/20 border-l border-r border-emerald-500"
      style={{
       left: `${(hrTargetMin / 220) * 100}%`,
       right: `${100 - (hrTargetMax / 220) * 100}%`,
      }}
      ></div>
     </div>

     <div className="text-center font-mono text-[10px] text-white/40">
      Target Window: {hrTargetMin} - {hrTargetMax} BPM
     </div>
     </div>

     <div className="flex gap-2 w-full max-w-sm">
     <button
      onClick={() => triggerFitnessHRControl("REST")}
      className="flex-1 bg-[#1c1c1c] hover:border-emerald-500 py-3 rounded text-xs font-bold font-mono text-emerald-400"
     >
      REST
     </button>
     <button
      onClick={() => triggerFitnessHRControl("JOG")}
      className="flex-1 bg-[#1c1c1c] hover:border-amber-500 py-3 rounded text-xs font-bold font-mono text-amber-400"
     >
      JOG
     </button>
     <button
      onClick={() => triggerFitnessHRControl("SPRINT")}
      className="flex-1 bg-[#1c1c1c] hover:border-red-500 py-3 rounded text-xs font-bold font-mono text-red-500"
     >
      SPRINT
     </button>
     </div>
    </div>
    )}

    {/* GAME 8: TACTICAL SHAPE POSITIONAL PUZZLE */}
    {(selectedGame?.id === "TAC_SHAPE" || selectedGame?.id === "CB_BALL_PLAY" || selectedGame?.id === "ST_MOVEMENT") && (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
     <p className="text-xs text-white/50 font-mono tracking-widest uppercase mb-4">
     Position your player onto the correct zone on pitch grid!
     </p>

     <div className="glass-panel p-4 rounded-xl text-xs text-[#aaa] font-mono leading-relaxed mb-6">
     "{positioningScenario}"
     </div>

     <div className="grid grid-rows-5 gap-2 glass-panel p-4 rounded-2xl w-full max-w-[280px] mb-6">
     {Array(5)
      .fill(0)
      .map((_, rIdx) => (
      <div key={rIdx} className="grid grid-cols-5 gap-2">
       {Array(5)
       .fill(0)
       .map((_, cIdx) => {
        const isSelected = selectedGridCell?.r === rIdx && selectedGridCell?.c === cIdx;
        const isCorrect = correctGridCell.r === rIdx && correctGridCell.c === cIdx;
        return (
        <button
         key={cIdx}
         onClick={() => triggerPosGridSelect(rIdx, cIdx)}
         className={`h-10 rounded border text-xs font-bold flex items-center justify-center transition-all ${
         isSelected
          ? isCorrect
          ? "bg-emerald-500 border-emerald-400 text-black"
          : "bg-red-500 border-red-400 text-white"
          : "bg-white/10 border-white/10 hover:border-[#555] text-transparent hover:text-white"
         }`}
        >
         {isSelected ? (isCorrect ? "✅" : "❌") : "?"}
        </button>
        );
       })}
      </div>
      ))}
     </div>
    </div>
    )}

    {/* GAME 5: PATTERN RECOGNITION */}
    {selectedGame?.id === "PATTERN_REC" && (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
     <p className="text-xs text-white/50 font-mono tracking-widest uppercase mb-4">
     Pattern Recognition
     </p>
     
     {patternVisible ? (
     <div className="w-full glass-panel p-8 rounded-xl flex flex-col items-center justify-center mb-6 h-48">
      <p className="text-sm font-mono text-white/40 mb-2 uppercase">Memorize Opposition Shape</p>
      <h2 className="text-4xl font-black font-mono text-white">{patternFormation}</h2>
      <p className="text-red-500 font-bold font-mono mt-4 text-xl">{patternShowTime}s</p>
     </div>
     ) : (
     <>
      <div className="glass-panel p-5 rounded-xl text-sm text-white font-mono leading-relaxed text-left mb-6 w-full">
      {mcqQuestion}
      </div>

      <div className="flex flex-col gap-3 w-full">
      {mcqOptions.map((opt, i) => (
       <button
       key={i}
       onClick={() => processRepResult(opt.correct)}
       className="text-left w-full glass-panel hover:bg-white/10 hover:border-white p-4 rounded-xl text-xs font-bold transition-all"
       >
       {opt.text}
       </button>
      ))}
      </div>
     </>
     )}
    </div>
    )}

    {/* RONDO (5v2 Keep-Away) */}
         {selectedGame?.id === "RONDO" && (
     <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in">
      <div className="text-center mb-4">
       <span className="text-[10px] uppercase font-mono tracking-widest bg-emerald-950/50 text-[#00FF88] border border-[#00FF88]/20 px-3 py-1 rounded-full">
        Rondo Keep-Away
       </span>
       <h3 className="text-xl font-black uppercase mt-2 tracking-tight text-white">
        Positional Passing Rondo
       </h3>
       <p className="text-[11px] text-white/50 font-mono mt-1">
        Distribute the ball quickly! Select a teammate who has space and pass before the closing defenders block the line.
       </p>
      </div>

      <div className="w-full glass-panel border-white/10 rounded-2xl p-6 mb-6 flex flex-col items-center bg-[#0d0d0d]">
       {/* Visual Passing Grid */}
       <div className="w-full max-w-[320px] aspect-square relative bg-emerald-950/5 border border-[#00FF88]/10 rounded-full flex items-center justify-center p-8 mb-6">
        {/* Animated Defender circle block */}
        <div
         className="absolute w-8 h-8 bg-red-950/80 border border-red-500 rounded-full flex items-center justify-center text-xs shadow-lg shadow-red-500/20 transition-all duration-300 animate-bounce"
         style={{
          transform: `rotate(${rondoDefenderPos}deg) translate(50px) rotate(-${rondoDefenderPos}deg)`
         }}
        >
         ❌
        </div>

        {/* Center player (You) */}
        <div className="w-12 h-12 bg-[#00FF88] text-black rounded-full flex flex-col items-center justify-center text-[10px] font-black uppercase shadow-[0_0_15px_rgba(0,255,136,0.3)] animate-pulse">
         <span>⚽</span>
         <span>YOU</span>
        </div>

        {/* Teammates distributed symmetrically around the Rondo circle */}
        {[0, 1, 2, 3].map((idx) => {
         const angle = idx * 90;
         const isSelected = rondoTarget === idx;
         return (
          <button
           key={idx}
           onClick={() => triggerRondoPass(idx)}
           className={`absolute w-12 h-12 rounded-full flex flex-col items-center justify-center text-[9px] font-mono font-black border transition-all ${
            isSelected
             ? "bg-[#00FF88] text-black border-[#00FF88] scale-110 shadow-[0_0_10px_rgba(0,255,136,0.4)]"
             : "bg-white/5 text-white/60 border-white/10 hover:border-white hover:text-white"
           }`}
           style={{
            transform: `rotate(${angle}deg) translate(95px) rotate(-${angle}deg)`
           }}
          >
           <span>🧑‍⚕️</span>
           <span>P{idx + 1}</span>
          </button>
         );
        })}
       </div>

       {/* Pass indicators */}
       {rondoPassResult !== null && (
        <div className={`text-center py-2 text-xs font-mono font-black uppercase ${
         rondoPassResult.includes("SUCCESS") ? "text-[#00FF88]" : "text-red-500"
        }`}>
         {rondoPassResult}
        </div>
       )}
      </div>
     </div>
     )}



    {/* SET PIECE REHEARSAL */}
    {selectedGame?.id === "SET_PIECE" && (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
     <p className="text-xs text-white/50 font-mono tracking-widest uppercase mb-4">
     Set Piece Rehearsal
     </p>

     {spExecutionStep === 0 && (
     <div className="w-full max-w-sm flex flex-col gap-4 mb-6">
      <p className="text-sm font-mono text-white text-center mb-2">Step 1: Choose Delivery Type</p>
      <button onClick={() => { setSpDelivery('DRIVEN'); setSpExecutionStep(1); }} className="bg-[#1c1c1c] hover:border-white p-4 rounded text-xs font-bold font-mono text-left">DRIVEN CROSS (Hard, Low trajectory)</button>
      <button onClick={() => { setSpDelivery('LOOPING'); setSpExecutionStep(1); }} className="bg-[#1c1c1c] hover:border-white p-4 rounded text-xs font-bold font-mono text-left">LOOPING CROSS (High hang time)</button>
      <button onClick={() => { setSpDelivery('DIRECT'); setSpExecutionStep(1); }} className="bg-[#1c1c1c] hover:border-white p-4 rounded text-xs font-bold font-mono text-left">DIRECT SHOT (On target)</button>
     </div>
     )}

     {spExecutionStep === 1 && (
     <div className="w-full max-w-sm flex flex-col gap-4 mb-6">
      <p className="text-sm font-mono text-white text-center mb-2">Step 2: Choose Target Area</p>
      <div className="grid grid-cols-2 gap-3">
      <button onClick={() => { setSpTarget('NEAR_POST'); setSpExecutionStep(2); }} className="bg-[#1c1c1c] hover:border-white p-4 rounded text-[10px] font-bold font-mono">NEAR POST</button>
      <button onClick={() => { setSpTarget('FAR_POST'); setSpExecutionStep(2); }} className="bg-[#1c1c1c] hover:border-white p-4 rounded text-[10px] font-bold font-mono">FAR POST</button>
      <button onClick={() => { setSpTarget('PENALTY_SPOT'); setSpExecutionStep(2); }} className="bg-[#1c1c1c] hover:border-white p-4 rounded text-[10px] font-bold font-mono">PENALTY SPOT</button>
      <button onClick={() => { setSpTarget('TOP_CORNER'); setSpExecutionStep(2); }} className="bg-[#1c1c1c] hover:border-amber-500 text-amber-500 p-4 rounded text-[10px] font-bold font-mono">TOP CORNER (Goal)</button>
      </div>
     </div>
     )}

     {spExecutionStep === 2 && (
     <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <p className="text-white font-bold text-xs tracking-widest uppercase mb-2 font-mono">
      Step 3: Execute {spDelivery} to {spTarget?.replace('_', ' ')}
      </p>
      <p className="text-[10px] text-white/40 mb-8 font-mono">Time your strike in the green sweet spot to finalize.</p>
      <div className="w-full h-8 bg-white/10 relative mb-12 rounded-lg max-w-md">
      <div
       className="absolute top-0 bottom-0 bg-emerald-500/20 border-l border-r border-emerald-500"
       style={{ left: `${50 - timingMargin}%`, right: `${50 - timingMargin}%` }}
      ></div>
      <div
       className="absolute top-0 bottom-0 w-2 bg-white -ml-1 shadow-md"
       style={{ left: `${cursorPos}%` }}
      ></div>
      </div>
      <button
      onClick={handleTimingClick}
      className="bg-[#00FF88] text-black hover:bg-white px-12 py-4 rounded-lg font-bold tracking-widest uppercase transition-colors text-xs font-mono"
      >
      STRIKE BALL
      </button>
     </div>
     )}
    </div>
    )}

    {/* GENERAL MCQ / TACTICAL VIDEO SCENARIO */}
    {(selectedGame?.id === "VIDEO_ANALYSIS" || selectedGame?.id === "DM_INTERCEPT" || selectedGame?.id === "DM_PRESS" || selectedGame?.id === "GK_1V1" || selectedGame?.id === "GK_PENALTY" || selectedGame?.id === "CB_TACKLE" || selectedGame?.id === "SS_COMBO_FINISH") && (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
     <p className="text-xs text-white/50 font-mono tracking-widest uppercase mb-4">
     Tactical Video Analysis
     </p>

     <div className="glass-panel p-5 rounded-xl text-sm text-white font-mono leading-relaxed text-left mb-6 w-full">
     {mcqQuestion}
     </div>

     <div className="flex flex-col gap-3 w-full">
     {mcqOptions.map((opt, i) => (
      <button
      key={i}
      onClick={() => processRepResult(opt.correct)}
      className="text-left w-full glass-panel hover:bg-white/10 hover:border-white p-4 rounded-xl text-xs font-bold transition-all"
      >
      {opt.text}
      </button>
     ))}
     </div>
    </div>
    )}

    {/* FALLBACK TIMING ENGINE */}
    {selectedGame?.engine === "TIMING" &&
    selectedGame.id !== "AM_LONG_SHOT" &&
    selectedGame.id !== "ST_FINISHING" &&
    selectedGame.id !== "ST_PENALTY" &&
    selectedGame.id !== "AM_THROUGH" &&
    selectedGame.id !== "FB_CROSSING" &&
    selectedGame.id !== "W_CROSS_BYLINE" && (
     <div className="w-full max-w-xl mx-auto flex flex-col items-center">
     <p className="text-white font-bold text-xs tracking-widest uppercase mb-8 font-mono">
      Time your delivery! Stop in the green sweet spot.
     </p>
     <div className="w-full h-8 bg-white/10 relative mb-12 rounded-lg">
      <div
      className="absolute top-0 bottom-0 bg-emerald-500/20 border-l border-r border-emerald-500"
      style={{
       left: `${50 - timingMargin}%`,
       right: `${50 - timingMargin}%`,
      }}
      ></div>
      <div
      className="absolute top-0 bottom-0 w-2 bg-white -ml-1 shadow-md"
      style={{ left: `${cursorPos}%` }}
      ></div>
     </div>
     <button
      onClick={handleTimingClick}
      className="glass-panel hover:border-white px-12 py-4 rounded-lg text-white font-bold tracking-widest uppercase transition-colors text-xs font-mono"
     >
      EXECUTE DELIVER
     </button>
     </div>
    )}

    {/* FALLBACK DECISION ENGINE */}
    {selectedGame?.engine === "DECISION" &&
    selectedGame.id !== "TAC_SHAPE" &&
    selectedGame.id !== "CB_BALL_PLAY" &&
    selectedGame.id !== "ST_MOVEMENT" &&
    selectedGame.id !== "VIDEO_ANALYSIS" &&
    selectedGame.id !== "PATTERN_REC" &&
    selectedGame.id !== "DM_INTERCEPT" &&
    selectedGame.id !== "DM_PRESS" && (
     <div className="w-full max-w-xl mx-auto flex flex-col items-center">
     <div className="text-red-500 font-bold text-2xl mb-8 flex items-center gap-2 font-mono">
      <Clock size={24} /> {timeLeft}s
     </div>
     <div className="grid grid-cols-1 gap-4 w-full">
      {decisionOptions.map((opt, i) => (
      <button
       key={i}
       onClick={() => handleDecisionClick(opt.correct)}
       className="glass-panel hover:border-white p-4 rounded-xl text-white font-bold tracking-widest uppercase text-xs transition-colors"
      >
       {opt.text}
      </button>
      ))}
     </div>
     </div>
    )}

    {/* FALLBACK SEQUENCE ENGINE */}
    {selectedGame?.engine === "SEQUENCE" &&
    selectedGame.id !== "AM_TIGHT_DRIB" &&
    selectedGame.id !== "CB_DEF_POS" &&
    selectedGame.id !== "FB_TRACKING" && (
     <div className="w-full max-w-xl mx-auto flex flex-col items-center">
     <div className="flex gap-4 mb-12 justify-center">
      {sequence.map((dir, i) => (
      <div
       key={i}
       className={`p-4 border rounded-xl ${
       i < playerSeq.length
        ? "border-emerald-500 text-emerald-500 bg-emerald-950/20"
        : "border-white/10 text-[#555] bg-transparent"
       }`}
      >
       {dir === "UP" && <ArrowUp size={32} />}
       {dir === "DOWN" && <ArrowDown size={32} />}
       {dir === "LEFT" && <ArrowLeft size={32} />}
       {dir === "RIGHT" && <ArrowRight size={32} />}
      </div>
      ))}
     </div>
     <div className="grid grid-cols-3 gap-2 max-w-[200px] w-full mx-auto">
      <div />
      <button
      onClick={() => handleSequenceClick("UP")}
      className="p-4 glass-panel hover:bg-white hover:text-black flex justify-center rounded-xl"
      >
      <ArrowUp size={24} />
      </button>
      <div />
      <button
      onClick={() => handleSequenceClick("LEFT")}
      className="p-4 glass-panel hover:bg-white hover:text-black flex justify-center rounded-xl"
      >
      <ArrowLeft size={24} />
      </button>
      <button
      onClick={() => handleSequenceClick("DOWN")}
      className="p-4 glass-panel hover:bg-white hover:text-black flex justify-center rounded-xl"
      >
      <ArrowDown size={24} />
      </button>
      <button
      onClick={() => handleSequenceClick("RIGHT")}
      className="p-4 glass-panel hover:bg-white hover:text-black flex justify-center rounded-xl"
      >
      <ArrowRight size={24} />
      </button>
     </div>
     </div>
    )}
  </div>
  ) : (
  /* MAIN TRAINING CENTER MENU */
  <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-y-auto">
   {/* LEFT: DRILL LIST */}
   <div className="flex-1 flex flex-col gap-6">
   <h2 className="text-xl font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
    Individual Drills
   </h2>
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...UNIVERSAL_MINIGAMES, ...MENTAL_MINIGAMES, ...POSITION_MINIGAMES].filter(g => posGames.includes(g) || g.category === 'UNIVERSAL' || g.category === 'MENTAL').slice(0, 9).map((game) => {
    const isSelected = selectedGame?.id === game.id;
    return (
     <div
     key={game.id}
     onClick={() => {
      setSelectedGame(game);
      setError(null);
     }}
     className={`p-4 border transition-all duration-300 cursor-pointer group flex flex-col justify-between rounded-xl min-h-[120px] ${
      isSelected
      ? "border-white bg-white/5 shadow-md shadow-white/5"
      : "border-white/10 premium-card hover:border-gray-600"
     }`}
     >
     <div>
      <h3 className="text-white font-bold uppercase tracking-wider text-xs mb-1 flex items-center justify-between gap-1">
       <span>{game.title}</span>
       {state.player?.roleSpecialization?.selectedRoleId && getRoleById(state.player.roleSpecialization.selectedRoleId)?.recommendedDrills.includes(game.id) && (
        <span className="text-[8px] bg-[#00FF88]/25 text-[#00FF88] px-1.5 py-0.5 rounded uppercase font-mono font-bold tracking-tight shrink-0">
         ★ Focus
        </span>
       )}
      </h3>
      <p className="text-white/50 text-[10px] font-sans leading-relaxed line-clamp-2">
      {game.description}
      </p>
     </div>
     <div className="text-[9px] font-mono uppercase tracking-widest text-[#00FF88] mt-3">
      +{game.targetAttributes.slice(0,2).join(', ')}
     </div>
     </div>
    );
    })}
   </div>
   </div>

   {/* RIGHT: PLAN & STATS DASHBOARD */}
   <div className="w-full lg:w-[280px] flex flex-col gap-6">

   {state.player?.roleSpecialization && (() => {
    const roleObj = getRoleById(state.player.roleSpecialization.selectedRoleId);
    if (!roleObj) return null;
    return (
     <div className="premium-card rounded-2xl p-5 border border-white/10 relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent text-left">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-2xl pointer-events-none"></div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FF88] block mb-3 border-b border-white/10 pb-1 flex justify-between items-center">
       <span>Tactical Role</span>
       <span className="text-[9px] bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded font-mono font-bold">
        {POSITION_GROUPS[state.player.position] || state.player.position}
       </span>
      </span>
      <div className="flex flex-col gap-2">
       <div className="flex justify-between items-center">
        <div className="text-white font-bold text-sm">{roleObj.name}</div>
       </div>
       <p className="text-[10px] text-white/50 leading-relaxed font-sans">
        {roleObj.description}
       </p>
       
       <div className="mt-2">
        <div className="flex justify-between items-center text-[10px] mb-1">
         <span className="text-white/40 uppercase tracking-wider font-mono">Familiarity</span>
         <span className="text-[#00FF88] font-bold font-mono">{state.player.roleSpecialization.familiarity}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
         <div 
          className="bg-[#00FF88] h-full transition-all duration-500" 
          style={{ width: `${state.player.roleSpecialization.familiarity}%` }}
         ></div>
        </div>
       </div>

       {/* RETRAIN BUTTON */}
       <button 
        onClick={() => {
         setRetrainError(null);
         setShowRetrainModal(true);
        }}
        className="mt-3 w-full py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded font-bold text-[10px] uppercase tracking-wider transition-all duration-250 cursor-pointer"
       >
        Retrain Role (Cost: £1,500)
       </button>
      </div>
     </div>
    );
   })()}
   
   {/* NEW DEVELOPMENT STATUS PANEL */}
   <div className="premium-card rounded-2xl p-5 border border-white/10 relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-2xl pointer-events-none"></div>
    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FF88] block mb-3 border-b border-white/10 pb-1">
    Development Status
    </span>
    <div className="flex flex-col gap-1.5">
     <div className="text-white font-bold text-sm">
      {state.player && (state.player.age < 21 ? '⚡ RAPID GROWTH' :
       state.player.age < 28 ? '💎 PEAK YEARS' :
       state.player.age < 32 ? '📉 SLOWING GAINS' :
       '🏥 LATE PLATEAU')}
     </div>
     <div className="text-[10px] text-white/60 leading-relaxed font-sans">
      {state.player && (state.player.age < 21 ? 'You are in the rapid development phase. Training gains are amplified (+50%) and physical recovery is extremely efficient (-20% fatigue cost).' :
       state.player.age < 28 ? 'You are in your prime physical window. Training gains are steady and balanced. Solidify your traits and build your tactical core.' :
       state.player.age < 32 ? 'Development is slowing down. Gains are significantly reduced. Maintaining your stats requires elite facilities and deliberate training sessions.' :
       'You are in maintenance mode. Standard training will produce minimal gains. Focus on premium lifestyle facilities and physical condition to offset natural athletic decline.')}
     </div>
    </div>
   </div>

   <div className="premium-card rounded-2xl p-5">
    <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-3 border-b border-white/10 pb-1">
    Player Condition
    </span>
    <div className="grid grid-cols-2 gap-3 mb-6">
    <div className="text-center p-3 glass-panel rounded-xl ">
     <span className="text-[9px] uppercase tracking-widest text-white/50 block mb-1"><GlossaryTooltip term="Fatigue">Fatigue</GlossaryTooltip></span>
     <span className={`text-xl font-black font-mono ${currentFatigue > 80 ? "text-red-500" : currentFatigue > 50 ? "text-amber-500" : "text-emerald-500"}`}>
     {currentFatigue}%
     </span>
    </div>
    <div className="text-center p-3 glass-panel rounded-xl ">
     <span className="text-[9px] uppercase tracking-widest text-white/50 block mb-1"><GlossaryTooltip term="Match Sharpness">Sharpness</GlossaryTooltip></span>
     <span className="text-xl font-black font-mono text-emerald-400">
     {currentSharpness}%
     </span>
    </div>
    </div>
    
    <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-3 border-b border-white/10 pb-1">
    Mandatory Sessions
    </span>
    <div className="flex flex-col gap-3">
    <button 
     onClick={startGroupSession}
     disabled={weeklySessions.clubOrganized >= 1 || isSpent}
     className={`w-full py-3 text-xs font-bold font-mono tracking-widest uppercase rounded-lg transition-all ${
     weeklySessions.clubOrganized >= 1 || isSpent
      ? "bg-white/10 text-[#555] cursor-not-allowed"
      : "bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/30"
     }`}
    >
     {weeklySessions.clubOrganized >= 1 ? "Group Done" : "Group Training"}
    </button>
    {weeklySessions.trainingMatch < 1 && (
     <button
     onClick={startTrainingMatchMode}
     className="w-full py-3 text-xs font-bold font-mono tracking-widest uppercase rounded-lg transition-all bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-600/30"
     >
     11v11 Match
     </button>
    )}
    </div>
   </div>

   {/* DRILL START TRIGGER CARD */}
   {selectedGame && (
    <div className="glass-panel p-5 rounded-xl flex flex-col gap-4 animate-fade-in">
    <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">
     Drill Setup: {selectedGame.title}
    </span>
    {selectedGame.engine !== "RECOVERY" && (
     <div className="grid grid-cols-3 gap-2">
     {["Light", "Standard", "Intense"].map((level) => (
      <button
      key={level}
      onClick={() => setIntensity(level as IntensityLevel)}
      className={`py-2 rounded text-[9px] font-bold uppercase tracking-widest border transition-all ${
       intensity === level
       ? "bg-white text-black border-white font-black"
       : "premium-card text-white/50 border-white/10 hover:border-[#444]"
      }`}
      >
      {level}
      </button>
     ))}
     </div>
    )}
    <button
     onClick={startMinigame}
     className="w-full bg-white hover:bg-gray-200 text-black font-black py-4 px-6 rounded-lg text-xs uppercase tracking-widest transition-all shadow-md"
    >
     {selectedGame.engine === "RECOVERY" ? "Initiate Recovery" : "Execute Drill"}
    </button>
    </div>
   )}
   </div>
  </div>
  )}

  {showRetrainModal && state.player && (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
    <div className="premium-card w-full max-w-md border border-white/10 rounded-2xl p-6 bg-[#0f0f12] shadow-2xl relative overflow-hidden text-left">
     <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-2xl pointer-events-none"></div>
     
     <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">
      Retrain Tactical Role
     </h3>
     <p className="text-xs text-white/50 mb-4 leading-relaxed">
      Select a new role for your position group. Retraining costs <strong className="text-white">£1,500</strong>. Your role familiarity will reset to <strong className="text-white">30%</strong> as you adapt to new tactical duties.
     </p>

     {retrainError && (
      <div className="p-3 mb-4 bg-red-950/40 border border-red-500/20 rounded text-red-400 text-xs font-mono">
       {retrainError}
      </div>
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
           setRetrainError("Insufficient bank balance to afford tactical retraining (£1,500 required).");
           return;
          }
          
          const updatedPlayer = { ...state.player! };
          updatedPlayer.finances = {
           ...updatedPlayer.finances,
           balance: updatedPlayer.finances.balance - 1500
          };
          updatedPlayer.roleSpecialization = {
           selectedRoleId: role.id,
           familiarity: 30, // reset to 30%
           recentMatchesInRole: 0
          };
          updatedPlayer.subPosition = role.name as any;
          
          if (updatedPlayer.trust) {
           updatedPlayer.trust = Math.max(10, updatedPlayer.trust - 5);
          }

          setPlayer(updatedPlayer);
          setShowRetrainModal(false);
         }}
         className={`p-3 rounded border text-left cursor-pointer transition-all ${
          isCurrent 
           ? 'border-[#00FF88] bg-[#00FF88]/15 cursor-default opacity-80' 
           : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
         }`}
        >
         <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-white text-xs">{role.name}</span>
          {isCurrent && (
           <span className="text-[8px] bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded uppercase font-mono font-bold">
            Active Role
           </span>
          )}
         </div>
         <p className="text-[10px] text-white/60 mb-2 leading-relaxed">{role.description}</p>
         <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider mr-1">Key attributes:</span>
          {role.keyAttributes.map((attr) => (
           <span key={attr} className="text-[8px] bg-white/5 text-white/70 px-1 py-0.5 rounded font-mono uppercase">
            {attr}
           </span>
          ))}
         </div>
        </div>
       );
      })}
     </div>

     <div className="flex gap-3 mt-6">
      <button
       onClick={() => setShowRetrainModal(false)}
       className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
      >
       Cancel
      </button>
     </div>
    </div>
   </div>
  )}
  </>)}
 </div>
 );
}

// Inline helper to calculate result growth value
function overallResultValue(res: "Success" | "Partial" | "Fail" | null, level: IntensityLevel) {
 if (level === "Recovery") return 0;
 let base = 0.4;
 if (level === "Light") base = 0.2;
 if (level === "Intense") base = 0.6;

 if (res === "Success") return base;
 if (res === "Partial") return base * 0.5;
 return 0;
}

import React, { useState, useEffect, useRef } from "react";
import { Player, Attributes, DayOfWeek } from "../types";
import { useGame } from "../store/GameContext";
import { getRolesForPosition } from "../data/roles";
import { CoreFormulas } from "../utils/coreFormulas";
import { musicEngine } from '../utils/musicEngine';
import { getPositionGroup, PositionGroup } from "../utils/positionMatchDecisions";
import { DailyActionWidget } from "../components/DailyActionWidget";
import { WeeklyBalanceIndicator } from "../components/WeeklyBalanceIndicator";
import { ScheduleActivityModal } from "../components/ScheduleActivityModal";
import { DailyActionType, getWeeklyActionTracker, isDayMandatory } from "../utils/dailyActionEngine";
import {
  ArrowLeft,
  Award,
  UserCheck,
  Target,
  Zap,
  Shield,
  Activity,
  Flame,
  CheckCircle2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Heart,
  RotateCcw,
  Star
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
            text: "You push him square in the chest. Craig narrows his eyes and swears, but the manager quickly blows the whistle to break it up. You gained +10 Morale but lost -5 Teammate Chemistry.",
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
            text: "You ignore the bait, spring up, and offer Craig a hand. On the very next play, you slide-tackle cleanly to win the ball back. Assistant Coach Davies nods: 'Brilliant reaction, lad.' Gained +8 Manager Trust and +6 Teammate relationship.",
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
            text: "You lie on the grass for a few seconds to let the pain subside. You saved physical strain (-8% Fatigue) but lost -5 Morale as the veterans banter.",
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
            text: "You grab a bag of balls and unleash five absolute screamers into the top corner. Gained +15 League Reputation but lost -10 Manager Trust for showboating.",
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
            text: "You ignore the distraction and work twice as hard. Your manager pulls you aside: 'Love the work ethic today, son.' Gained +12 Manager Trust and +0.4 Positioning.",
            player: p
          };
        }
      }
    ]
  },
  {
    id: "inc_freestyle_bet",
    title: "⚽ Locker Room Freestyle",
    description: "The team is huddled around a bench playing soccer-tennis. Winger Jordan Cole smirks: 'A hundred quid says the new boy can't complete five around-the-world juggles in a row. You up for a flutter, kid?'",
    choices: [
      {
        text: "Accept the wager (£100 bet)",
        description: "Prove your skills and secure dressing room respect.",
        effect: (p: any) => {
          const hasSkill = (p.attributes?.dribbling || 50) > 60 || p.backstory === "STREET_PRODIGY";
          if (hasSkill) {
            p.finances = p.finances || { balance: 0, expenses: { housing: 0, training: 0, lifestyle: 0, family: 0 } };
            p.finances.balance = (p.finances.balance || 0) + 100;
            p.morale = Math.min(100, p.morale + 15);
            p.relationships = p.relationships || { manager: 50, manager_discipline: 50, teammates: 50, agent: 50, family: 50 };
            p.relationships.teammates = Math.min(100, p.relationships.teammates + 10);
            return {
              text: "You flick the ball up and effortlessly reel off five around-the-world flicks. The room goes wild! You win £100, +10 Teammate relationship, and +15 Morale.",
              player: p
            };
          } else {
            p.finances = p.finances || { balance: 0, expenses: { housing: 0, training: 0, lifestyle: 0, family: 0 } };
            p.finances.balance = (p.finances.balance || 0) - 100;
            p.morale = Math.max(0, p.morale - 8);
            return {
              text: "You drop the ball on the third juggle! The squad roasts you. You lose £100 and -8 Morale.",
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
            text: "You grab your towel and head out. You avoid any drama and recover muscle fatigue (-8% Fatigue).",
            player: p
          };
        }
      }
    ]
  }
];

// DRILL CONFIGURATIONS
interface DrillConfig {
  id: 'SHOOTING' | 'PASSING' | 'DRIBBLING' | 'TACKLING' | 'GK_STOPPING' | 'GK_DISTRIBUTION';
  name: string;
  category: string;
  icon: any;
  color: string;
  accentBg: string;
  borderColor: string;
  targetStats: { key: keyof Attributes; label: string }[];
  description: string;
  minigameType: 'TIMING' | 'SEQUENCE' | 'DODGE' | 'HOLD_RELEASE';
  instructions: string;
  positions: PositionGroup[];
}

const DRILL_CONFIGS: DrillConfig[] = [
  {
    id: 'SHOOTING',
    name: 'Precision Finishing',
    category: 'Attack & Power',
    icon: Target,
    color: '#00FF88',
    accentBg: 'bg-[#00FF88]/10',
    borderColor: 'border-[#00FF88]/30',
    targetStats: [
      { key: 'finishing', label: 'Finishing' },
      { key: 'composure', label: 'Composure' }
    ],
    description: 'Time your strike inside the green target zone for maximum power and corner placement.',
    minigameType: 'TIMING',
    instructions: 'Press STRIKE when the oscillating indicator reaches the central GREEN target zone!',
    positions: ['STRIKER', 'ATTACKING_MID_WING', 'MIDFIELDER']
  },
  {
    id: 'PASSING',
    name: 'Vision & Passing Matrix',
    category: 'Playmaking & Vision',
    icon: Zap,
    color: '#3B82F6',
    accentBg: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    targetStats: [
      { key: 'passing', label: 'Passing' },
      { key: 'vision', label: 'Vision' }
    ],
    description: 'Memorize and execute rapid directional passing sequences under intense pressure.',
    minigameType: 'SEQUENCE',
    instructions: 'Tap the arrow directional controls in exact sequence before the time limit expires!',
    positions: ['MIDFIELDER', 'ATTACKING_MID_WING', 'DEFENDER', 'STRIKER']
  },
  {
    id: 'DRIBBLING',
    name: 'Slalom Dribble & Reflex',
    category: 'Agility & Pace',
    icon: Activity,
    color: '#F59E0B',
    accentBg: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    targetStats: [
      { key: 'dribbling', label: 'Dribbling' },
      { key: 'pace', label: 'Pace' }
    ],
    description: 'React rapidly to slalom cones and tackle challenges by dodging left, straight, or right.',
    minigameType: 'DODGE',
    instructions: 'React and dodge to the correct clear lane (Left, Center, or Right) as cones approach!',
    positions: ['ATTACKING_MID_WING', 'STRIKER', 'MIDFIELDER', 'DEFENDER']
  },
  {
    id: 'TACKLING',
    name: 'Last-Man Slide Tackle',
    category: 'Defense & Physical',
    icon: Shield,
    color: '#EC4899',
    accentBg: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    targetStats: [
      { key: 'tackling', label: 'Tackling' },
      { key: 'positioning', label: 'Positioning' }
    ],
    description: 'Charge up your tackle power gauge and execute a clean slide tackle without fouling.',
    minigameType: 'HOLD_RELEASE',
    instructions: 'Press and hold TACKLE to charge power, then release inside the green Sweet Spot!',
    positions: ['DEFENDER', 'MIDFIELDER']
  },
  {
    id: 'GK_STOPPING',
    name: 'Shot-Stopping & Reflex Reactions',
    category: 'Goalkeeping & Reflexes',
    icon: Shield,
    color: '#00E5FF',
    accentBg: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    targetStats: [
      { key: 'composure', label: 'Reflexes & Composure' },
      { key: 'positioning', label: 'GK Positioning' }
    ],
    description: 'Time your diving parry to push stinging strikes away from the top corners.',
    minigameType: 'TIMING',
    instructions: 'Press DIVE when the oscillating indicator reaches the central GREEN target zone!',
    positions: ['GK']
  },
  {
    id: 'GK_DISTRIBUTION',
    name: 'Precision GK Distribution',
    category: 'Goalkeeping & Distribution',
    icon: Zap,
    color: '#3B82F6',
    accentBg: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    targetStats: [
      { key: 'passing', label: 'Kicking & Distribution' },
      { key: 'vision', label: 'GK Vision' }
    ],
    description: 'Memorize long-range throwing and punting sequences to jumpstart rapid counter-attacks.',
    minigameType: 'SEQUENCE',
    instructions: 'Tap the arrow directional controls in exact sequence before the time limit expires!',
    positions: ['GK']
  }
];

type ArrowDir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
const ALL_DIRECTIONS: ArrowDir[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

export function Training() {
  const { state, setPlayer, setScreen, setDailyAction } = useGame();

  useEffect(() => {
    musicEngine.playMood('TRAINING');
  }, []);

  // Modal for scheduling specific day focus
  const [selectedDayForModal, setSelectedDayForModal] = useState<DayOfWeek | null>(null);

  // Group Training session state
  const [isGroupSessionActive, setIsGroupSessionActive] = useState<boolean>(false);
  const [groupStep, setGroupStep] = useState<number>(1);
  const [groupResults, setGroupResults] = useState<number[]>([]);
  const [showPostResult, setShowPostResult] = useState<boolean>(false);
  const [lastDeltas, setLastDeltas] = useState<{ attr: string; gain: number | string }[]>([]);

  // Story incidents & Retraining
  const [activeIncident, setActiveIncident] = useState<any | null>(null);
  const [showRetrainModal, setShowRetrainModal] = useState<boolean>(false);
  const [retrainError, setRetrainError] = useState<string | null>(null);

  // Individual Minigame State
  const [activeDrill, setActiveDrill] = useState<DrillConfig | null>(null);
  const [drillIntensity, setDrillIntensity] = useState<'LIGHT' | 'STANDARD' | 'INTENSE'>('STANDARD');
  const [activeHabit, setActiveHabit] = useState<string | null>(null);
  
  // Minigame Runtime States
  const [repIndex, setRepIndex] = useState<number>(1);
  const [repScores, setRepScores] = useState<number[]>([]);
  const [repFeedback, setRepFeedback] = useState<string | null>(null);
  
  // Timing / Gauge Oscillator state
  const [gaugePos, setGaugePos] = useState<number>(0);
  const [gaugeDir, setGaugeDir] = useState<number>(1);
  const [isHoldingGauge, setIsHoldingGauge] = useState<boolean>(false);

  // Sequence state
  const [targetSequence, setTargetSequence] = useState<ArrowDir[]>([]);
  const [userSequence, setUserSequence] = useState<ArrowDir[]>([]);
  const [sequenceTimer, setSequenceTimer] = useState<number>(4.0);

  // Dodge state
  const [targetLane, setTargetLane] = useState<'LEFT' | 'CENTER' | 'RIGHT'>('CENTER');
  const [dodgeTimer, setDodgeTimer] = useState<number>(2.5);

  const gaugeAnimationRef = useRef<number | null>(null);

  if (!state.player) return null;

  const weeklySessions = state.player.training?.weeklySessions || {
    clubOrganized: 0,
    individual: 0,
    recovery: 0,
    trainingMatch: 0
  };

  const currentFatigue = state.player.fatigue || 0;
  const currentSharpness = state.player.sharpness || 0;

  // ==========================================
  // MINIGAME LAUNCH & LOGIC
  // ==========================================
  const startMinigame = (drill: DrillConfig) => {
    if (weeklySessions.individual >= 3) {
      alert("You have reached your 3 individual training sessions limit for this week!");
      return;
    }
    setDailyAction('TRAINING');
    setActiveDrill(drill);
    setRepIndex(1);
    setRepScores([]);
    setRepFeedback(null);
    initRepState(drill, 1);
  };

  const initRepState = (drill: DrillConfig, repNum: number) => {
    setRepFeedback(null);
    setGaugePos(10);
    setGaugeDir(1);
    setIsHoldingGauge(false);

    if (drill.minigameType === 'SEQUENCE') {
      const len = 3 + repNum; // length 4, 5, 6
      const seq: ArrowDir[] = [];
      for (let i = 0; i < len; i++) {
        seq.push(ALL_DIRECTIONS[Math.floor(Math.random() * ALL_DIRECTIONS.length)]);
      }
      setTargetSequence(seq);
      setUserSequence([]);
      setSequenceTimer(3.5 + repNum * 0.5);
    } else if (drill.minigameType === 'DODGE') {
      const lanes: ('LEFT' | 'CENTER' | 'RIGHT')[] = ['LEFT', 'CENTER', 'RIGHT'];
      setTargetLane(lanes[Math.floor(Math.random() * lanes.length)]);
      setDodgeTimer(2.0 - repNum * 0.3);
    }
  };

  // Oscillating gauge effect for TIMING and HOLD_RELEASE
  useEffect(() => {
    if (!activeDrill) return;
    if (activeDrill.minigameType !== 'TIMING' && activeDrill.minigameType !== 'HOLD_RELEASE') return;
    if (repFeedback) return;

    const speed = (activeDrill.minigameType === 'TIMING' ? 1.4 : 1.1) + repIndex * 0.2;

    const interval = setInterval(() => {
      setGaugePos((prev) => {
        let next = prev + gaugeDir * speed * 2;
        if (next >= 95) {
          setGaugeDir(-1);
          next = 95;
        } else if (next <= 5) {
          setGaugeDir(1);
          next = 5;
        }
        return next;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [activeDrill, gaugeDir, repIndex, repFeedback]);

  // Timer countdown for SEQUENCE
  useEffect(() => {
    if (!activeDrill || activeDrill.minigameType !== 'SEQUENCE' || repFeedback) return;

    const interval = setInterval(() => {
      setSequenceTimer((prev) => {
        if (prev <= 0.1) {
          handleSequenceTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeDrill, repFeedback]);

  // Timer countdown for DODGE
  useEffect(() => {
    if (!activeDrill || activeDrill.minigameType !== 'DODGE' || repFeedback) return;

    const interval = setInterval(() => {
      setDodgeTimer((prev) => {
        if (prev <= 0.1) {
          handleDodgeChoice('NONE');
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeDrill, repFeedback]);

  // ==========================================
  // ACTION HANDLERS FOR DRILLS
  // ==========================================
  // 1. TIMING DRILL ACTION (Shooting)
  const handleTimingStrike = () => {
    if (repFeedback) return;

    // Sweet spot is 42 to 58
    const distFromCenter = Math.abs(gaugePos - 50);
    let pts = 0;
    let label = '';

    if (distFromCenter <= 8) {
      pts = 10;
      label = '🎯 PERFECT TOP CORNER! (+10)';
    } else if (distFromCenter <= 18) {
      pts = 7;
      label = '⚽ GREAT STRIKE! (+7)';
    } else if (distFromCenter <= 30) {
      pts = 4;
      label = '🥅 ON TARGET (+4)';
    } else {
      pts = 1;
      label = '💨 WIDE / SAVED (+1)';
    }

    processRepScore(pts, label);
  };

  // 2. HOLD & RELEASE TACKLE ACTION
  const handleTackleRelease = () => {
    if (repFeedback) return;

    // Sweet spot for tackle power is 65 to 85
    let pts = 0;
    let label = '';

    if (gaugePos >= 68 && gaugePos <= 84) {
      pts = 10;
      label = '🛡️ PERFECT TIMED TACKLE! (+10)';
    } else if ((gaugePos >= 52 && gaugePos < 68) || (gaugePos > 84 && gaugePos <= 92)) {
      pts = 6;
      label = '⚡ POKED CLEAR! (+6)';
    } else if (gaugePos > 92) {
      pts = 0;
      label = '🚨 OVERCOMMITTED / FOUL! (+0)';
    } else {
      pts = 2;
      label = '⚠️ WEAK TACKLE (+2)';
    }

    processRepScore(pts, label);
  };

  // 3. SEQUENCE DRILL ACTION (Passing)
  const handleSequenceInput = (dir: ArrowDir) => {
    if (repFeedback || !activeDrill) return;

    const newSeq = [...userSequence, dir];
    setUserSequence(newSeq);

    const step = newSeq.length - 1;
    if (newSeq[step] !== targetSequence[step]) {
      // Wrong key!
      processRepScore(1, '❌ MISPLACED PASS! (+1)');
      return;
    }

    if (newSeq.length === targetSequence.length) {
      // Completed correctly!
      const timeBonus = sequenceTimer > 1.5 ? 3 : 0;
      const totalPts = 7 + timeBonus;
      processRepScore(totalPts, `⚡ FLAWLESS PASSING SEQUENCE! (+${totalPts})`);
    }
  };

  const handleSequenceTimeout = () => {
    if (repFeedback) return;
    processRepScore(0, '⏰ TIMED OUT / INTERCEPTED! (+0)');
  };

  // 4. DODGE DRILL ACTION (Dribbling)
  const handleDodgeChoice = (lane: 'LEFT' | 'CENTER' | 'RIGHT' | 'NONE') => {
    if (repFeedback) return;

    if (lane === targetLane) {
      const isFast = dodgeTimer > 0.8;
      const pts = isFast ? 10 : 7;
      const msg = isFast ? '🔥 LIGHTNING NUTMEG & FLICK! (+10)' : '⚡ CLEAN SLALOM DODGE! (+7)';
      processRepScore(pts, msg);
    } else {
      processRepScore(1, '💥 COLLISION / LOST CONTROL (+1)');
    }
  };

  // Process rep score and advance or finalize
  const processRepScore = (pts: number, msg: string) => {
    const updated = [...repScores, pts];
    setRepScores(updated);
    setRepFeedback(msg);

    setTimeout(() => {
      if (repIndex < 3) {
        const nextRep = repIndex + 1;
        setRepIndex(nextRep);
        initRepState(activeDrill!, nextRep);
      } else {
        finalizeMinigame(updated);
      }
    }, 1200);
  };

  // Finalize Drill Session & Compute Gains
  const finalizeMinigame = (scores: number[]) => {
    const totalScore = scores.reduce((a, b) => a + b, 0); // max 30
    const player = { ...state.player! };

    // Intensity Multipliers
    let fatigueAdd = 8;
    let sharpnessAdd = 6;
    let gainMult = 1.0;

    if (drillIntensity === 'LIGHT') {
      fatigueAdd = 5;
      sharpnessAdd = 4;
      gainMult = 0.7;
    } else if (drillIntensity === 'INTENSE') {
      fatigueAdd = 14;
      sharpnessAdd = 10;
      gainMult = 1.35;
    }

    // Performance grade rating
    let grade = 'C';
    let baseGain = 0.04;
    if (totalScore >= 25) {
      grade = 'A+';
      baseGain = 0.15;
    } else if (totalScore >= 18) {
      grade = 'A';
      baseGain = 0.11;
    } else if (totalScore >= 12) {
      grade = 'B';
      baseGain = 0.07;
    }

    // Calculate actual stat gains
    const deltas: { attr: string; gain: number | string }[] = [];
    const difficultyTier = player.difficulty || 'STANDARD';

    player.attributes = { ...player.attributes };

    activeDrill!.targetStats.forEach((st) => {
      const currentVal = player.attributes[st.key] || 50;
      const calcGain = CoreFormulas.calculateTrainingGain(
        baseGain * gainMult,
        currentVal,
        (player as any).potential || 85,
        player.age,
        difficultyTier as any
      );
      const roundedGain = Math.round(calcGain * 10) / 10;
      player.attributes[st.key] = Math.min(99, currentVal + roundedGain);
      deltas.push({ attr: st.label, gain: roundedGain });
    });

    // Recalculate OVR
    player.ovr = CoreFormulas.calculateOVR(player.attributes, player.position);

    // Update physical status & weekly session counter
    player.fatigue = Math.min(100, (player.fatigue || 0) + fatigueAdd);
    player.sharpness = Math.min(100, (player.sharpness || 0) + sharpnessAdd);

    player.training = player.training || {
      weeklySessions: { clubOrganized: 0, individual: 0, recovery: 0, trainingMatch: 0 },
      sessionHistory: [],
      trainingMatchHistory: []
    };
    player.training.weeklySessions.individual = (player.training.weeklySessions.individual || 0) + 1;

    // Apply Daily Habit Bonuses
    if (activeHabit === 'EXTRA_YOGA') {
      fatigueAdd = Math.max(0, fatigueAdd - 3);
      player.sharpness = Math.min(100, (player.sharpness || 0) + 2);
      deltas.push({ attr: 'Fatigue (Yoga)', gain: '-3%' });
    } else if (activeHabit === 'FILM_STUDY') {
      player.attributes.vision = Math.min(99, (player.attributes.vision || 50) + 0.1);
      player.attributes.positioning = Math.min(99, (player.attributes.positioning || 50) + 0.1);
      deltas.push({ attr: 'Vis/Pos (Film)', gain: '+0.1' });
    } else if (activeHabit === 'DIET_DISCIPLINE') {
      player.attributes.stamina = Math.min(99, (player.attributes.stamina || 50) + 0.1);
      player.morale = Math.min(100, (player.morale || 50) + 2);
      deltas.push({ attr: 'Stamina (Diet)', gain: '+0.1' });
    }

    deltas.push({ attr: 'Drill Grade', gain: grade });
    deltas.push({ attr: 'Fatigue Load', gain: `+${fatigueAdd}%` });
    deltas.push({ attr: 'Match Sharpness', gain: `+${sharpnessAdd}%` });

    setPlayer(player);
    setActiveDrill(null);
    setLastDeltas(deltas);
    setShowPostResult(true);
  };

  // Group Training Session Handler
  const startGroupSession = () => {
    if (weeklySessions.clubOrganized >= 1) return;
    setDailyAction('TRAINING');
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
    setLastDeltas([
      { attr: 'Manager Trust', gain: trustDelta > 0 ? `+${trustDelta}` : `${trustDelta}` },
      { attr: 'Squad Chemistry', gain: avg >= 2 ? '+5' : '-3' }
    ]);
    setShowPostResult(true);
  };

  const todayEntry = state.seasonCalendar.find(c => c.week === state.currentWeek && c.day === state.currentDay);
  const tracker = getWeeklyActionTracker(state.player, state.currentWeek);
  const currentChoice = tracker.choices[state.currentDay];
  const isMandatoryDay = isDayMandatory(todayEntry);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] text-white p-6 overflow-y-auto hide-scrollbar">
      {/* Top Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#222] mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreen('HUB')} className="p-2.5 bg-white/5 hover:bg-white/10 text-white/70 transition-colors border border-[#222]">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
              Daily Focus & Training Hub
            </h1>
            <p className="text-xs text-white/50 font-mono mt-0.5">Manage daily choices (Training, PR & Social, Conditioning, Rest) and individual attribute drills.</p>
          </div>
        </div>

        {/* Condition Badges & Session Slots */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-panel px-4 py-2 flex items-center gap-4 border border-[#222] bg-black/40">
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
            <div className="w-px h-6 bg-white/10"></div>
            <div>
              <span className="text-[9px] font-mono text-white/40 uppercase block">Weekly Slots</span>
              <span className="text-sm font-bold font-mono text-[#00FF88]">
                {weeklySessions.individual}/3 Drills
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DAILY ACTION FOCUS & SCHEDULE INTEGRATION */}
      <div className="mb-6 space-y-4">
        <DailyActionWidget
          player={state.player}
          currentWeek={state.currentWeek}
          currentDay={state.currentDay}
          todaysCalendarEntry={todayEntry}
          onSelectAction={(act) => setDailyAction(act)}
        />
        <WeeklyBalanceIndicator
          player={state.player}
          currentWeek={state.currentWeek}
          currentDay={state.currentDay}
          seasonCalendar={state.seasonCalendar}
          onOpenDayModal={(day) => setSelectedDayForModal(day)}
        />
      </div>

      {/* INTERACTIVE MINIGAME MODAL */}
      {activeDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
          <div className={`premium-card w-full max-w-xl border ${activeDrill.borderColor} p-6 bg-[#0f1115] flex flex-col items-center text-center relative overflow-hidden`}>
            
            {/* Header info */}
            <div className="w-full flex justify-between items-center border-b border-[#222] pb-3 mb-4">
              <div className="flex items-center gap-2 text-left">
                <activeDrill.icon size={20} style={{ color: activeDrill.color }} />
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-wider">{activeDrill.name}</h3>
                  <span className="text-[10px] font-mono text-white/50">{activeDrill.category} &bull; Repetition {repIndex} of 3</span>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveDrill(null)}
                className="text-xs font-mono text-white/40 hover:text-white px-2.5 py-1 rounded bg-white/5"
              >
                Cancel Drill
              </button>
            </div>

            <p className="text-xs font-mono text-white/70 mb-4 bg-white/5 px-4 py-2 border border-[#111]">
              {activeDrill.instructions}
            </p>

            {/* MINIGAME VIEW: 1. TIMING DRILL (Shooting) */}
            {activeDrill.minigameType === 'TIMING' && (
              <div className="w-full my-6 flex flex-col items-center">
                {/* Target Pitch Goal Visual */}
                <div className="w-full h-36 bg-[#182a1e] border-2 border-[#333] relative overflow-hidden flex items-center justify-center mb-6 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(#00FF88_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                  
                  {/* Goal Frame */}
                  <div className="w-64 h-24 border-t-4 border-x-4 border-white rounded-t relative flex justify-between items-end p-2 bg-black/30">
                    <div className="w-10 h-10 border border-[#00FF88]/50 bg-[#00FF88]/20 rounded flex items-center justify-center text-[10px] font-mono text-[#00FF88] font-bold">TOP L</div>
                    <div className="w-10 h-10 border border-[#00FF88]/50 bg-[#00FF88]/20 rounded flex items-center justify-center text-[10px] font-mono text-[#00FF88] font-bold">TOP R</div>
                  </div>

                  {/* Ball Marker */}
                  <div 
                    className="absolute bottom-2 w-6 h-6 bg-white rounded-full border-2 border-black shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all"
                    style={{ left: `calc(${gaugePos}% - 12px)` }}
                  />
                </div>

                {/* Oscillating Slider Bar */}
                <div className="w-full h-8 bg-white/10 rounded-full relative overflow-hidden border border-[#333] mb-6 p-1">
                  {/* Green Sweet Spot Zone */}
                  <div className="absolute top-0 bottom-0 left-[42%] right-[42%] bg-[#00FF88]/40 border-x-2 border-[#00FF88] flex items-center justify-center">
                    <span className="text-[8px] font-mono font-bold text-[#00FF88] uppercase tracking-tighter">SWEET SPOT</span>
                  </div>

                  {/* Moving Cursor Indicator */}
                  <div 
                    className="absolute top-0 bottom-0 w-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_#F59E0B]"
                    style={{ left: `${gaugePos}%` }}
                  />
                </div>

                <button
                  onClick={handleTimingStrike}
                  disabled={!!repFeedback}
                  className="w-full py-4 bg-[#00FF88] hover:bg-[#00FF88]/80 text-black font-black uppercase tracking-widest text-sm transition-all shadow-[#00FF88]/20 active:scale-98"
                >
                  ⚡ STRIKE BALL!
                </button>
              </div>
            )}

            {/* MINIGAME VIEW: 2. HOLD_RELEASE DRILL (Tackling) */}
            {activeDrill.minigameType === 'HOLD_RELEASE' && (
              <div className="w-full my-6 flex flex-col items-center">
                <div className="w-full h-32 bg-[#201318] border-2 border-pink-500/30 relative flex items-center justify-center mb-6 overflow-hidden">
                  <div className="text-center">
                    <Shield className="mx-auto text-pink-400 mb-1" size={32} />
                    <span className="text-xs font-mono font-bold text-white uppercase">Charging Attacker Approaching</span>
                  </div>

                  {/* Meter Fill Visual */}
                  <div 
                    className="absolute left-0 bottom-0 top-0 bg-pink-500/20 border-r-2 border-pink-400 transition-all"
                    style={{ width: `${gaugePos}%` }}
                  />
                </div>

                {/* Power Gauge Bar */}
                <div className="w-full h-8 bg-white/10 rounded-full relative overflow-hidden border border-[#333] mb-6 p-1">
                  {/* Ideal Slide Tackle Zone */}
                  <div className="absolute top-0 bottom-0 left-[68%] right-[16%] bg-pink-500/40 border-x-2 border-pink-400 flex items-center justify-center">
                    <span className="text-[8px] font-mono font-bold text-pink-300 uppercase tracking-tighter">PERFECT TIMING</span>
                  </div>

                  {/* Moving Cursor Indicator */}
                  <div 
                    className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_10px_#FFF]"
                    style={{ left: `${gaugePos}%` }}
                  />
                </div>

                <button
                  onClick={handleTackleRelease}
                  disabled={!!repFeedback}
                  className="w-full py-4 bg-pink-500 hover:bg-pink-400 text-white font-black uppercase tracking-widest text-sm transition-all active:scale-98"
                >
                  🛡️ EXECUTE SLIDE TACKLE!
                </button>
              </div>
            )}

            {/* MINIGAME VIEW: 3. SEQUENCE DRILL (Passing) */}
            {activeDrill.minigameType === 'SEQUENCE' && (
              <div className="w-full my-4 flex flex-col items-center">
                {/* Timer Bar */}
                <div className="w-full flex justify-between items-center text-xs font-mono mb-3 text-white/70">
                  <span>TIME REMAINING:</span>
                  <span className="text-blue-400 font-bold">{sequenceTimer.toFixed(1)}s</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-100" 
                    style={{ width: `${(sequenceTimer / (3.5 + repIndex * 0.5)) * 100}%` }}
                  />
                </div>

                {/* Target Sequence Display */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  {targetSequence.map((dir, idx) => {
                    const isDone = idx < userSequence.length;
                    return (
                      <div 
                        key={idx}
                        className={`w-12 h-12 border flex items-center justify-center font-bold transition-all ${
                          isDone 
                            ? 'bg-blue-500/30 border-blue-400 text-blue-400 scale-105' 
                            : 'bg-white/5 border-[#333] text-white/40'
                        }`}
                      >
                        {dir === 'UP' && <ChevronUp size={24} />}
                        {dir === 'DOWN' && <ChevronDown size={24} />}
                        {dir === 'LEFT' && <ChevronLeft size={24} />}
                        {dir === 'RIGHT' && <ChevronRight size={24} />}
                      </div>
                    );
                  })}
                </div>

                {/* Input Directional Buttons */}
                <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
                  <div></div>
                  <button 
                    onClick={() => handleSequenceInput('UP')}
                    disabled={!!repFeedback}
                    className="p-3 bg-white/10 hover:bg-blue-500/30 active:scale-95 border border-[#333] flex items-center justify-center text-white"
                  >
                    <ChevronUp size={24} />
                  </button>
                  <div></div>

                  <button 
                    onClick={() => handleSequenceInput('LEFT')}
                    disabled={!!repFeedback}
                    className="p-3 bg-white/10 hover:bg-blue-500/30 active:scale-95 border border-[#333] flex items-center justify-center text-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => handleSequenceInput('DOWN')}
                    disabled={!!repFeedback}
                    className="p-3 bg-white/10 hover:bg-blue-500/30 active:scale-95 border border-[#333] flex items-center justify-center text-white"
                  >
                    <ChevronDown size={24} />
                  </button>
                  <button 
                    onClick={() => handleSequenceInput('RIGHT')}
                    disabled={!!repFeedback}
                    className="p-3 bg-white/10 hover:bg-blue-500/30 active:scale-95 border border-[#333] flex items-center justify-center text-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            )}

            {/* MINIGAME VIEW: 4. DODGE DRILL (Dribbling) */}
            {activeDrill.minigameType === 'DODGE' && (
              <div className="w-full my-4 flex flex-col items-center">
                <div className="w-full flex justify-between items-center text-xs font-mono mb-2 text-white/70">
                  <span>REFLEX WINDOW:</span>
                  <span className="text-amber-400 font-bold">{dodgeTimer.toFixed(1)}s</span>
                </div>

                {/* Field Slalom View */}
                <div className="w-full h-40 bg-[#1f2316] border-2 border-amber-500/30 relative overflow-hidden grid grid-cols-3 p-2 gap-2 mb-6">
                  {(['LEFT', 'CENTER', 'RIGHT'] as const).map((lane) => {
                    const isTarget = targetLane === lane;
                    return (
                      <div 
                        key={lane}
                        className={`h-full border border-dashed flex flex-col items-center justify-between p-2 transition-all ${
                          isTarget 
                            ? 'bg-amber-500/20 border-amber-400' 
                            : 'bg-black/20 border-[#222]'
                        }`}
                      >
                        <span className="text-[9px] font-mono text-white/40">{lane}</span>
                        {isTarget ? (
                          <div className="text-amber-400 font-bold text-xs flex flex-col items-center gap-1 animate-bounce">
                            <Flame size={20} />
                            <span>CLEAR LANE!</span>
                          </div>
                        ) : (
                          <div className="text-red-400/60 font-bold text-xs">🚧 CONE</div>
                        )}
                        <div></div>
                      </div>
                    );
                  })}
                </div>

                {/* Dodge Controls */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  <button
                    onClick={() => handleDodgeChoice('LEFT')}
                    disabled={!!repFeedback}
                    className="py-3 bg-white/10 hover:bg-amber-500/30 border border-[#333] font-mono text-xs font-bold text-white uppercase"
                  >
                    ⬅️ Dodge Left
                  </button>
                  <button
                    onClick={() => handleDodgeChoice('CENTER')}
                    disabled={!!repFeedback}
                    className="py-3 bg-white/10 hover:bg-amber-500/30 border border-[#333] font-mono text-xs font-bold text-white uppercase"
                  >
                    ⬆️ Burst Straight
                  </button>
                  <button
                    onClick={() => handleDodgeChoice('RIGHT')}
                    disabled={!!repFeedback}
                    className="py-3 bg-white/10 hover:bg-amber-500/30 border border-[#333] font-mono text-xs font-bold text-white uppercase"
                  >
                    ➡️ Dodge Right
                  </button>
                </div>
              </div>
            )}

            {/* Rep Feedback Banner */}
            {repFeedback && (
              <div className="mt-4 p-3 bg-white/10 border border-[#333] text-xs font-mono font-bold text-[#00FF88] animate-bounce">
                {repFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GROUP TRAINING SESSION MODAL */}
      {isGroupSessionActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
          <div className="premium-card w-full max-w-lg border border-blue-500/30 p-6 bg-[#121216] flex flex-col items-center text-center">
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
                className="w-full p-4 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-left text-xs font-mono font-bold text-white transition-all"
              >
                🚀 Execute high-tempo tactical press and recover
              </button>
              <button
                onClick={() => handleGroupStepAction(2)}
                className="w-full p-4 border border-[#222] bg-white/5 hover:bg-white/10 text-left text-xs font-mono font-bold text-white transition-all"
              >
                🛡️ Maintain defensive shape and positional discipline
              </button>
              <button
                onClick={() => handleGroupStepAction(1)}
                className="w-full p-4 border border-[#222] bg-white/5 hover:bg-white/10 text-left text-xs font-mono font-bold text-white transition-all"
              >
                🚶 Play conservative short passes to keep safe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST SESSION RESULT MODAL */}
      {showPostResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
          <div className="premium-card w-full max-w-md border border-[#00FF88]/30 p-6 bg-[#121216] text-center">
            <div className="w-12 h-12 rounded-full bg-[#00FF88]/20 border border-[#00FF88]/40 flex items-center justify-center mx-auto mb-4 text-[#00FF88]">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider text-white mb-1">Session Summary</h3>
            <p className="text-xs text-white/50 font-mono mb-6">Your training drill was processed into player progression.</p>

            <div className="space-y-2.5 mb-6 text-left bg-white/5 p-4 border border-[#222]">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-2">Attribute & Condition Impact</span>
              {lastDeltas.map((d, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-mono border-b border-[#111] pb-1 last:border-0">
                  <span className="text-white/70 uppercase">{d.attr}</span>
                  <span className="text-[#00FF88] font-bold">{d.gain}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPostResult(false)}
              className="w-full bg-[#00FF88] hover:bg-[#00FF88]/80 text-black font-black py-3 text-xs uppercase tracking-widest transition-all "
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STORY INCIDENT MODAL */}
      {activeIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
          <div className="premium-card w-full max-w-lg border border-amber-500/30 p-6 bg-[#121216] text-left">
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
                  className="w-full p-4 border border-[#222] bg-white/5 hover:bg-amber-500/15 hover:border-amber-500/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-white mb-0.5">{choice.text}</div>
                  <div className="text-[10px] text-white/50">{choice.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN DASHBOARD LAYOUT */}
      {!currentChoice && !isMandatoryDay && (
        <div className="flex flex-col items-center justify-center p-12 bg-[#121216] border border-[#222] text-center">
          <Sparkles size={32} className="text-[#00FF88] mb-4" />
          <h3 className="text-xl font-black uppercase text-white mb-2">Awaiting Daily Focus</h3>
          <p className="text-white/50 text-sm font-mono max-w-md mx-auto">
            Select your primary focus for today using the options above. Your choice will dictate available activities and impact your physical and mental conditioning.
          </p>
        </div>
      )}

      {currentChoice === 'REST' && (
        <div className="flex flex-col items-center justify-center p-12 bg-purple-500/5 border border-purple-500/20 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
            <span className="text-3xl">🛋️</span>
          </div>
          <h3 className="text-xl font-black uppercase text-white mb-2">Rest & Recovery</h3>
          <p className="text-white/50 text-sm font-mono max-w-md mx-auto">
            You spent the day resting. Mental fatigue and physical stress have been significantly reduced.
          </p>
        </div>
      )}

      {currentChoice === 'SOCIAL' && (
        <div className="flex flex-col items-center justify-center p-12 bg-cyan-500/5 border border-cyan-500/20 text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400">
            <span className="text-3xl">📱</span>
          </div>
          <h3 className="text-xl font-black uppercase text-white mb-2">PR & Social Media</h3>
          <p className="text-white/50 text-sm font-mono max-w-md mx-auto">
            You spent the day on PR events and team bonding. Squad chemistry and media perception have improved.
          </p>
        </div>
      )}

      {currentChoice === 'CONDITIONING' && (
        <div className="flex flex-col items-center justify-center p-12 bg-blue-500/5 border border-blue-500/20 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
            <span className="text-3xl">🧊</span>
          </div>
          <h3 className="text-xl font-black uppercase text-white mb-2">Conditioning & Physio</h3>
          <p className="text-white/50 text-sm font-mono max-w-md mx-auto">
            You spent the day in cryotherapy and physio sessions. Recovery debt has been cleared and injury risk reduced.
          </p>
        </div>
      )}

      {(currentChoice === 'TRAINING' || isMandatoryDay) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Individual Minigame Training Drills */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Daily Habits Module */}
            <div className="bg-[#050505] border border-[#222] p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pre-Training Habit</h3>
              </div>
              <p className="text-[11px] font-mono text-white/50 mb-4">Choose a focused activity to perform before your daily drill to gain minor, situational stat boosts.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => setActiveHabit('EXTRA_YOGA')}
                  className={`p-3 border transition-all text-left flex flex-col gap-2 ${activeHabit === 'EXTRA_YOGA' ? 'bg-purple-500/20 border-purple-400' : 'bg-white/5 border-[#222] hover:border-white/30'}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xl">🧘</span>
                    {activeHabit === 'EXTRA_YOGA' && <CheckCircle2 size={16} className="text-purple-400" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${activeHabit === 'EXTRA_YOGA' ? 'text-purple-400' : 'text-white'}`}>Extra Yoga</h4>
                    <p className="text-[9px] font-mono text-white/60 mt-1">-3% Drill Fatigue<br/>+2% Sharpness</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveHabit('FILM_STUDY')}
                  className={`p-3 border transition-all text-left flex flex-col gap-2 ${activeHabit === 'FILM_STUDY' ? 'bg-blue-500/20 border-blue-400' : 'bg-white/5 border-[#222] hover:border-white/30'}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xl">📺</span>
                    {activeHabit === 'FILM_STUDY' && <CheckCircle2 size={16} className="text-blue-400" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${activeHabit === 'FILM_STUDY' ? 'text-blue-400' : 'text-white'}`}>Film Study</h4>
                    <p className="text-[9px] font-mono text-white/60 mt-1">+0.1 Vision<br/>+0.1 Positioning</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveHabit('DIET_DISCIPLINE')}
                  className={`p-3 border transition-all text-left flex flex-col gap-2 ${activeHabit === 'DIET_DISCIPLINE' ? 'bg-emerald-500/20 border-emerald-400' : 'bg-white/5 border-[#222] hover:border-white/30'}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xl">🥗</span>
                    {activeHabit === 'DIET_DISCIPLINE' && <CheckCircle2 size={16} className="text-emerald-400" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${activeHabit === 'DIET_DISCIPLINE' ? 'text-emerald-400' : 'text-white'}`}>Diet Discipline</h4>
                    <p className="text-[9px] font-mono text-white/60 mt-1">+0.1 Stamina<br/>+2 Morale</p>
                  </div>
                </button>
              </div>
            </div>

          <div className="flex justify-between items-center border-b border-[#222] pb-3 mt-6">
            <div>
              <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Dumbbell size={18} className="text-[#00FF88]" />
                Individual Skill Minigames
              </h2>
              <p className="text-white/40 text-[10px] mt-0.5">Interactive drill challenges to build specific technical stats.</p>
            </div>

            {/* Drill Intensity Selector */}
            <div className="flex items-center gap-1.5 bg-white/5 p-1 border border-[#222]">
              {(['LIGHT', 'STANDARD', 'INTENSE'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDrillIntensity(mode)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                    drillIntensity === mode
                      ? 'bg-[#00FF88] text-black shadow'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Fatigue & Energy Impact Indicator */}
          {(() => {
            const fatigueCost = drillIntensity === 'LIGHT' ? 5 : drillIntensity === 'INTENSE' ? 14 : 8;
            const sharpnessGain = drillIntensity === 'LIGHT' ? 4 : drillIntensity === 'INTENSE' ? 10 : 6;
            const statGainMult = drillIntensity === 'LIGHT' ? '0.7x' : drillIntensity === 'INTENSE' ? '1.35x' : '1.0x';
            const projectedFatigue = Math.min(100, currentFatigue + fatigueCost);
            const fatigueColor = projectedFatigue > 85 ? 'text-red-400 bg-red-500/10 border-red-500/30' : projectedFatigue > 65 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

            return (
              <div className="bg-white/5 border border-[#222] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 border ${fatigueColor} flex items-center justify-center`}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Intensity Energy Impact</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/80 font-bold uppercase">
                        {drillIntensity} MODE
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 font-mono mt-0.5">
                      Energy loss: <strong className="text-red-400 font-bold">+{fatigueCost}% Fatigue</strong> &bull; Sharpness: <strong className="text-emerald-400 font-bold">+{sharpnessGain}%</strong> &bull; Growth: <strong className="text-[#00FF88] font-bold">{statGainMult}</strong>
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-56 flex flex-col gap-1.5 bg-black/40 p-3 border border-[#222]">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-white/50">Projected Fatigue:</span>
                    <span className={`font-bold ${projectedFatigue > 85 ? 'text-red-400' : projectedFatigue > 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {currentFatigue}% ➡️ {projectedFatigue}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full transition-all duration-300"
                      style={{ width: `${currentFatigue}%` }}
                    />
                    <div 
                      className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 ${
                        projectedFatigue > 85 ? 'bg-red-500 animate-pulse' : projectedFatigue > 65 ? 'bg-amber-500' : 'bg-[#00FF88]'
                      }`}
                      style={{ left: `${currentFatigue}%`, width: `${fatigueCost}%` }}
                    />
                  </div>
                  {projectedFatigue >= 90 && (
                    <span className="text-[9px] font-mono text-red-400 font-bold flex items-center gap-1 mt-0.5">
                      ⚠️ High fatigue risk! Consider hydrotherapy.
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Drills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DRILL_CONFIGS.filter(d => d.positions.includes(getPositionGroup(state.player.position))).map((drill) => {
              const Icon = drill.icon;
              return (
                <div 
                  key={drill.id}
                  className={`premium-card p-5 border ${drill.borderColor} flex flex-col justify-between hover:border-[#00FF88]/50 transition-all group`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2.5 ${drill.accentBg} border ${drill.borderColor}`}>
                        <Icon size={20} style={{ color: drill.color }} />
                      </div>
                      <span className="text-[9px] font-mono text-white/40 uppercase bg-white/5 px-2 py-0.5 rounded border border-[#111]">
                        {drill.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider">{drill.name}</h3>
                    <p className="text-xs text-white/50 font-mono mb-4 leading-relaxed">{drill.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {drill.targetStats.map((st) => (
                        <span key={st.key} className="text-[10px] font-mono font-bold text-[#00FF88] bg-[#00FF88]/10 border border-[#00FF88]/20 px-2 py-0.5 rounded">
                          +{st.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => startMinigame(drill)}
                    disabled={weeklySessions.individual >= 3}
                    className={`w-full py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all ${
                      weeklySessions.individual >= 3
                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                        : 'bg-[#00FF88] hover:bg-[#00FF88]/80 text-black shadow-[#00FF88]/15 group-hover:scale-[1.02]'
                    }`}
                  >
                    {weeklySessions.individual >= 3 ? 'Slots Depleted' : 'Play Minigame'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Group Training & Story Events */}
        <div className="space-y-6">
          {/* Group Training Session Card */}
          <div className="premium-card p-5 border border-blue-500/30 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#222] pb-3">
              <div>
                <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <UserCheck size={16} className="text-blue-400" />
                  Mandatory Group Training
                </h2>
                <p className="text-white/40 text-[10px] mt-0.5">Club-scheduled tactical drills with the squad.</p>
              </div>
              <div className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded">
                {weeklySessions.clubOrganized >= 1 ? "Completed" : "Scheduled"}
              </div>
            </div>

            <div className="text-xs text-white/70 font-mono">
              Manager Style: <strong className="text-white uppercase">{state.player.managerInfo?.personality || 'Pragmatic'}</strong>
            </div>

            <button
              onClick={startGroupSession}
              disabled={weeklySessions.clubOrganized >= 1}
              className={`w-full py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all ${
                weeklySessions.clubOrganized >= 1
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white "
              }`}
            >
              {weeklySessions.clubOrganized >= 1 ? "Group Training Done" : "Start Group Session"}
            </button>
          </div>

          {/* Development Status */}
          <div className="premium-card p-5 border border-[#222] relative overflow-hidden from-white/5 to-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-2xl pointer-events-none"></div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FF88] block mb-2 border-b border-[#222] pb-1">
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

          {/* Retrain Tactical Role */}
          <div className="premium-card p-5 border border-[#222]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-2 border-b border-[#222] pb-1">
              Tactical Specialization
            </span>
            <p className="text-xs text-white/60 font-mono mb-4">Adapt your tactical role familiarity for your position (£1,500).</p>
            <button
              onClick={() => setShowRetrainModal(true)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 text-xs uppercase tracking-widest transition-all border border-[#222]"
            >
              Retrain Role
            </button>
          </div>


        </div>
      </div>
      )}

      {/* RETRAIN MODAL */}
      {showRetrainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fade-in">
          <div className="premium-card w-full max-w-md border border-white/15 p-6 bg-[#121216] text-left">
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
                      const balance = state.player!.finances?.balance || 0;
                      if (balance < 1500) {
                        setRetrainError("Insufficient bank balance (£1,500 required).");
                        return;
                      }
                      const updatedPlayer = { ...state.player! };
                      updatedPlayer.finances = updatedPlayer.finances || { balance: 0, expenses: { housing: 0, training: 0, lifestyle: 0, family: 0 } };
                      updatedPlayer.finances.balance -= 1500;
                      updatedPlayer.roleSpecialization = { selectedRoleId: role.id, familiarity: 30, recentMatchesInRole: 0 };
                      updatedPlayer.subPosition = role.name as any;
                      setPlayer(updatedPlayer);
                      setShowRetrainModal(false);
                    }}
                    className={`p-3 rounded border text-left cursor-pointer transition-all ${
                      isCurrent ? 'border-[#00FF88] bg-[#00FF88]/15 opacity-80' : 'border-[#222] bg-white/5 hover:bg-white/10'
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
            <button onClick={() => setShowRetrainModal(false)} className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase">Cancel</button>
          </div>
        </div>
      )}

      {/* SCHEDULE ACTIVITY MODAL INTEGRATION */}
      {selectedDayForModal && (
        <ScheduleActivityModal
          isOpen={!!selectedDayForModal}
          onClose={() => setSelectedDayForModal(null)}
          day={selectedDayForModal}
          week={state.currentWeek}
          currentChoice={getWeeklyActionTracker(state.player, state.currentWeek).choices[selectedDayForModal]}
          onSelectActivity={(action, day) => {
            setDailyAction(action, day);
            setSelectedDayForModal(null);
          }}
          todaysCalendarEntry={state.seasonCalendar?.find(e => e.week === state.currentWeek && e.day === selectedDayForModal)}
        />
      )}
    </div>
  );
}

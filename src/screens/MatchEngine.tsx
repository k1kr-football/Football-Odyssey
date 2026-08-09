import { getFlavorText } from "../utils/matchEngineUtils";
import { generateMatchDecisions, getPositionGroup, DecisionOption, KeyDecision } from "../utils/positionMatchDecisions";
import { RadarChartComparison } from '../components/RadarChartComparison';
import { calculateMatchReputationGain, updateReputationAndPerception } from "../utils/reputation";
import { sfxEngine } from "../utils/sfxEngine";
import { musicEngine } from '../utils/musicEngine';
import { generateWeatherAndPitch } from '../utils/weatherPitch';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { Player, TurningPointEvent } from '../types';
import { CLUBS } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { TurningPointsReview } from '../components/TurningPointsReview';
import { motion, AnimatePresence } from 'motion/react';
import { updateProgressionState } from '../utils/careerSystems';
import { initializeActiveRehab } from '../utils/wellbeingEngine';
import { getClubStaff, getCanonicalSender } from '../utils/clubStaff';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Trophy, CheckCircle2, ArrowRight, Zap, Coins, Users, Award,
  Activity, Flame, Shield, Star, Play, Pause, FastForward, Sparkles,
  Clock, Target, Compass, Crosshair, ChevronRight, MessageSquare, BarChart3, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAPEngine } from '../hooks/useAPEngine';
import { MatchTacticsOverlay } from '../components/MatchTacticsOverlay';
import { PitchTacticalOption } from '../types/matchAP';

interface MatchObjective {
  id: string;
  description: string;
  targetText: string;
  rewardTrust: number;
  rewardXP: number;
  check: (stats: any, rating: number) => boolean;
}

export function MatchEngine() {
  const { state, advanceDay, setScreen, setPlayer, setInbox, settings } = useGame();
  const { apState, setApState } = useAPEngine();
  const p = state.player;

  // Mid-Match Tactical Enhancements
  const [halftimeTactic, setHalftimeTactic] = useState<'HIGH_PRESS_OVERLOAD' | 'PARK_THE_BUS' | null>(null);
  const [touchlineTactic, setTouchlineTactic] = useState<'DEMAND_MORE' | 'PLAY_SAFE' | null>(null);
  const [activeTactics, setActiveTactics] = useState<string[]>([]);

  const handleSelectTactic = (option: PitchTacticalOption) => {
    if (apState.currentAP < option.apCost) return;
    setApState(s => ({ ...s, currentAP: Math.max(0, s.currentAP - option.apCost) }));
    setActiveTactics(prev => prev.includes(option.id) ? prev : [...prev, option.id]);

    if (option.id === 'ht_high_press') {
      setHalftimeTactic('HIGH_PRESS_OVERLOAD');
    } else if (option.id === 'ht_park_bus') {
      setHalftimeTactic('PARK_THE_BUS');
    } else if (option.id === 'shout_demand_more') {
      setTouchlineTactic('DEMAND_MORE');
    } else if (option.id === 'shout_play_safe') {
      setTouchlineTactic('PLAY_SAFE');
    }

    setCommentaryLogs(c => [
      { minute, text: `⚡ TACTICAL SWITCH ACTIVATED: ${option.title} — ${option.description}`, type: 'highlight' },
      ...c
    ]);
  };


  if (!p) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white font-mono">
        <p className="text-xl font-bold mb-4">No Active Player Found</p>
        <button onClick={() => setScreen('HUB', true)} className="px-6 py-2 bg-[#00FF88] text-black font-bold rounded">
          Return to Hub
        </button>
      </div>
    );
  }

  // Identify Opponent and User Club
  const opponentSymbol = state.nextMatch?.opponentSymbol || 'AST';
  const oppClub = CLUBS.find(c => c.symbol.toUpperCase() === opponentSymbol.toUpperCase()) || {
    name: 'Upcoming Opponent',
    symbol: opponentSymbol,
    primaryColor: '#670E36',
    secondaryColor: '#95BFE6',
    ovr: 72
  };

  const userClubSymbol = p.currentClubSymbol || 'BIR';
  const userClub = CLUBS.find(c => c.symbol.toUpperCase() === userClubSymbol.toUpperCase()) || {
    name: 'Your Club',
    symbol: userClubSymbol,
    primaryColor: '#0052CC',
    secondaryColor: '#FFFFFF',
    ovr: 70
  };

  const isHome = state.nextMatch?.venue === 'Home' || true;
  const playerStatus = state.nextMatch?.playerStatus || (p.contract?.status === 'Backup' ? 'SUBSTITUTE' : 'STARTER');

  // In-Match Score State
  const [userScore, setUserScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);

  // Weather & Pitch Condition Generator using generateWeatherAndPitch
  const weatherPreset = useMemo(() => {
    const clubSym = opponentSymbol || p.currentClubSymbol || 'ARS';
    return generateWeatherAndPitch(clubSym, state.currentWeek);
  }, [state.currentWeek, opponentSymbol, p.currentClubSymbol]);

  const { weather, pitch, tempCelsius, commentaryHook } = weatherPreset;

  // Procedural Match Objectives
  const objectives = useMemo<MatchObjective[]>(() => {
    const posGroup = getPositionGroup(p.position || 'ST');

    if (posGroup === 'GK') {
      return [
        {
          id: 'obj_1',
          description: 'Achieve Match Rating >= 7.0',
          targetText: 'Rating >= 7.0',
          rewardTrust: 5,
          rewardXP: 100,
          check: (_, rating) => rating >= 7.0
        },
        {
          id: 'obj_2',
          description: 'Keep a Clean Sheet OR Make 3+ Saves',
          targetText: 'Clean Sheet / 3+ Saves',
          rewardTrust: 6,
          rewardXP: 150,
          check: (s) => (oppScore === 0 || (s.saves || 0) >= 3)
        },
        {
          id: 'obj_3',
          description: 'Complete 10+ Accurate Passes or Throws',
          targetText: '10+ Accurate Passes',
          rewardTrust: 4,
          rewardXP: 90,
          check: (s) => s.passesCompleted >= 10
        }
      ];
    } else if (posGroup === 'DEFENDER') {
      return [
        {
          id: 'obj_1',
          description: 'Achieve Match Rating >= 7.2',
          targetText: 'Rating >= 7.2',
          rewardTrust: 5,
          rewardXP: 100,
          check: (_, rating) => rating >= 7.2
        },
        {
          id: 'obj_2',
          description: 'Win 3+ Defensive Tackles or Interceptions',
          targetText: '3+ Tackles',
          rewardTrust: 6,
          rewardXP: 130,
          check: (s) => s.tackles >= 3
        },
        {
          id: 'obj_3',
          description: 'Maintain >80% Pass Accuracy or Clean Sheet',
          targetText: '>80% Acc. / Clean Sheet',
          rewardTrust: 4,
          rewardXP: 90,
          check: (s) => oppScore === 0 || (s.passesAttempted > 0 && (s.passesCompleted / s.passesAttempted) >= 0.8)
        }
      ];
    } else if (posGroup === 'MIDFIELDER') {
      return [
        {
          id: 'obj_1',
          description: 'Achieve Match Rating >= 7.2',
          targetText: 'Rating >= 7.2',
          rewardTrust: 5,
          rewardXP: 100,
          check: (_, rating) => rating >= 7.2
        },
        {
          id: 'obj_2',
          description: 'Complete 20+ Accurate Passes',
          targetText: '20+ Passes',
          rewardTrust: 5,
          rewardXP: 120,
          check: (s) => s.passesCompleted >= 20
        },
        {
          id: 'obj_3',
          description: 'Deliver 1+ Key Pass or 2+ Tackles',
          targetText: 'Key Pass / 2+ Tackles',
          rewardTrust: 5,
          rewardXP: 110,
          check: (s) => s.keyPasses >= 1 || s.tackles >= 2
        }
      ];
    } else if (posGroup === 'ATTACKING_MID_WING') {
      return [
        {
          id: 'obj_1',
          description: 'Achieve Match Rating >= 7.5',
          targetText: 'Rating >= 7.5',
          rewardTrust: 5,
          rewardXP: 100,
          check: (_, rating) => rating >= 7.5
        },
        {
          id: 'obj_2',
          description: 'Score, Assist, or Deliver 2+ Key Passes',
          targetText: '1 G/A / 2 Key Passes',
          rewardTrust: 6,
          rewardXP: 140,
          check: (s) => (s.goals + s.assists) >= 1 || s.keyPasses >= 2
        },
        {
          id: 'obj_3',
          description: 'Complete 15+ Accurate Passes',
          targetText: '15+ Passes',
          rewardTrust: 4,
          rewardXP: 90,
          check: (s) => s.passesCompleted >= 15
        }
      ];
    } else {
      return [
        {
          id: 'obj_1',
          description: 'Achieve Match Rating >= 7.5',
          targetText: 'Rating >= 7.5',
          rewardTrust: 5,
          rewardXP: 100,
          check: (_, rating) => rating >= 7.5
        },
        {
          id: 'obj_2',
          description: 'Score or Assist at least 1 Goal',
          targetText: '1 Goal/Assist',
          rewardTrust: 6,
          rewardXP: 150,
          check: (s) => (s.goals + s.assists) >= 1
        },
        {
          id: 'obj_3',
          description: 'Record 2+ Shots on Target',
          targetText: '2+ Shots on Target',
          rewardTrust: 4,
          rewardXP: 90,
          check: (s) => s.shotsOnTarget >= 2
        }
      ];
    }
  }, [p.position, oppScore]);

  // Recharts Pitch Heatmap Spatial Activity Data
  const heatmapData = useMemo(() => {
    const points = [];
    const posGroup = getPositionGroup(p.position || 'ST');
    const pos = (p.position || 'ST').toUpperCase();
    
    for (let i = 0; i < 48; i++) {
      let x = Math.random() * 100;
      let y = Math.random() * 100;

      if (posGroup === 'GK') {
        x = 2 + (Math.random() * 16);
        y = 25 + (Math.random() * 50);
      } else if (posGroup === 'DEFENDER') {
        if (pos === 'LB' || pos === 'LWB') {
          x = 20 + (Math.random() * 48);
          y = 5 + (Math.random() * 30);
        } else if (pos === 'RB' || pos === 'RWB') {
          x = 20 + (Math.random() * 48);
          y = 65 + (Math.random() * 30);
        } else {
          x = 12 + (Math.random() * 36);
          y = 20 + (Math.random() * 60);
        }
      } else if (posGroup === 'MIDFIELDER') {
        x = 30 + (Math.random() * 45);
        y = 15 + (Math.random() * 70);
      } else if (posGroup === 'ATTACKING_MID_WING') {
        if (pos === 'LW') {
          x = 50 + (Math.random() * 42);
          y = 5 + (Math.random() * 32);
        } else if (pos === 'RW') {
          x = 50 + (Math.random() * 42);
          y = 63 + (Math.random() * 32);
        } else {
          x = 52 + (Math.random() * 36);
          y = 22 + (Math.random() * 56);
        }
      } else {
        x = 65 + (Math.random() * 32);
        y = 20 + (Math.random() * 60);
      }

      const baseIntensity = Math.floor(Math.random() * 5) + 1;
      const intensity = Math.min(10, baseIntensity + 2);

      points.push({ x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), intensity, zone: x > 65 ? 'Final Third' : x < 35 ? 'Defensive Third' : 'Middle Third' });
    }
    return points;
  }, [p.position]);

  // Match State
  const [phase, setPhase] = useState<'PRE_MATCH' | 'IN_MATCH' | 'HALF_TIME' | 'FULL_TIME'>('PRE_MATCH');
  const [mindset, setMindset] = useState<'ATTACKING' | 'BALANCED' | 'HIGH_PRESS' | 'COUNTER'>('BALANCED');

  // In-Match State
  const [minute, setMinute] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4 | 'PAUSED'>(() => settings?.matchEngineSpeed === 'Fast' ? 4 : (settings?.matchEngineSpeed === 'Skip (Text Only)' ? 4 : 2));

  const [playerStats, setPlayerStats] = useState({
    minutes: 0,
    rating: 6.0,
    goals: 0,
    assists: 0,
    passesCompleted: 0,
    passesAttempted: 0,
    keyPasses: 0,
    tackles: 0,
    saves: 0,
    shots: 0,
    shotsOnTarget: 0,
    distanceCovered: 0.0
  });

  const [stamina, setStamina] = useState<number>(100 - ((typeof p.fatigue === 'number' && !isNaN(p.fatigue) ? p.fatigue : 0) / 2));
  const [momentum, setMomentum] = useState<number>(0); // -10 to +10
  const [activeDecision, setActiveDecision] = useState<KeyDecision | null>(null);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  // Dynamic In-Match Substitution Tracking
  const [isSubbedOff, setIsSubbedOff] = useState<boolean>(false);
  const [subOffMinute, setSubOffMinute] = useState<number | null>(null);
  const [subOffReason, setSubOffReason] = useState<string | null>(null);

  const [isSubbedOn, setIsSubbedOn] = useState<boolean>(playerStatus === 'STARTER');
  const [subOnMinute, setSubOnMinute] = useState<number | null>(playerStatus === 'STARTER' ? 1 : null);

  const benchSubTriggerMin = useMemo(() => Math.floor(Math.random() * 12) + 58, []);

  const [commentaryLogs, setCommentaryLogs] = useState<{ minute: number; text: string; type: 'info' | 'highlight' | 'goal_user' | 'goal_opp' }[]>([
    { minute: 0, text: `Kickoff at ${isHome ? 'Home Ground' : 'Away Stadium'}. High anticipation in the stands!`, type: 'info' }
  ]);

  // Match Turning Points Log (Detailed events, goals, key decisions & turning points)
  const [turningPoints, setTurningPoints] = useState<TurningPointEvent[]>([
    {
      id: 'tp_0',
      minute: 1,
      title: 'Match Kickoff',
      description: `Match begins at ${isHome ? 'Home Ground' : 'Away Stadium'}. Stadium atmosphere electric as kickoff commences.`,
      impact: 'MAJOR',
      team: 'NEUTRAL'
    }
  ]);

  // Pitch radar ball coordinates (0-100 x, 0-100 y)
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [phaseText, setPhaseText] = useState<string>('MIDFIELD BUILD-UP');

  // Media Interview State at end
  const [interviewAnswer, setInterviewAnswer] = useState<number | null>(null);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [matchInjury, setMatchInjury] = useState<{ name: string; weeks: number; severity: string } | null>(null);

  // Scheduled Key Decisions for the match (Generated position-aware)
  const scheduledDecisions = useRef<Record<number, KeyDecision>>({});

  useEffect(() => {
    scheduledDecisions.current = generateMatchDecisions(p.position || 'ST');
  }, [p.position]);

  // Start Simulation


  // Music Engine integration
  useEffect(() => {
    const nextMatch = state.nextMatch;
    const isBigMatch = nextMatch?.isBigMatch || false;
    const matchType = nextMatch?.matchType || 'LEAGUE';
    const pressure = nextMatch?.pressure || 5;

    if (phase === 'PRE_MATCH') {
      musicEngine.playMood('PRE_MATCH');
    } else if (phase === 'IN_MATCH' || phase === 'HALF_TIME') {
      if (isBigMatch || matchType === 'DERBY' || matchType === 'GRUDGE') {
        musicEngine.playMood('DERBY_DAY');
      } else {
        if (momentum < -3 || pressure >= 8) {
          musicEngine.playMood('MATCH_HIGH_PRESSURE');
        } else {
          musicEngine.playMood('MATCH_LOW_PRESSURE');
        }
      }
    } else if (phase === 'FULL_TIME') {
      if (userScore > oppScore) {
        musicEngine.playMood('VICTORY');
      } else if (userScore < oppScore) {
        musicEngine.playMood('DEFEAT');
      } else {
        // Draw, just play MENU or keep current. Let's play MENU.
        musicEngine.playMood('MENU');
      }
    }
  }, [phase, momentum, state.nextMatch, userScore, oppScore]);


  const handleStartMatch = () => {
    sfxEngine.play('WHISTLE_START');
    setPhase('IN_MATCH');
    setMinute(1);
  };

  // Main Simulation Loop
  useEffect(() => {
    if (phase !== 'IN_MATCH' || simSpeed === 'PAUSED' || activeDecision !== null) {
      return;
    }

    // @ts-ignore
    const intervalTime = (settings?.matchEngineSpeed === 'Skip (Text Only)' && simSpeed !== 'PAUSED') ? 5 : (simSpeed === 4 ? 120 : simSpeed === 2 ? 300 : 600);

    const timer = setInterval(() => {
      setMinute((prevMin) => {
        const nextMin = prevMin + 1;

        // Half Time Check
        if (nextMin === 45) {
          sfxEngine.play('WHISTLE_HALF_TIME');
          setPhase('HALF_TIME');
          setSimSpeed('PAUSED');
          setCommentaryLogs(prev => [
            { minute: 45, text: `Half Time whistle! Score: ${userClub.symbol} ${userScore} - ${oppScore} ${oppClub.symbol}`, type: 'info' },
            ...prev
          ]);
          setTurningPoints(prev => [
            ...prev,
            {
              id: 'tp_45',
              minute: 45,
              title: 'Half Time Tactical Shift',
              description: `Interval score: ${userClub.symbol} ${userScore} - ${oppScore} ${oppClub.symbol}. Tactical adjustments delivered in dressing room.`,
              impact: 'TACTICAL',
              team: 'NEUTRAL'
            }
          ]);
          return 45;
        }

        // Full Time Check
        if (nextMin >= 90) {
          sfxEngine.play('WHISTLE_FULL_TIME');
          setPhase('FULL_TIME');
          setSimSpeed('PAUSED');
          setCommentaryLogs(prev => [
            { minute: 90, text: `Full Time whistle! Final Score: ${userClub.symbol} ${userScore} - ${oppScore} ${oppClub.symbol}`, type: 'info' },
            ...prev
          ]);
          setTurningPoints(prev => [
            ...prev,
            {
              id: 'tp_90',
              minute: 90,
              title: 'Full Time Whistle',
              description: `Final whistle sounded. Result: ${userClub.symbol} ${userScore} - ${oppScore} ${oppClub.symbol}. Match turning points compiled.`,
              impact: userScore > oppScore ? 'CRITICAL' : 'MAJOR',
              team: userScore > oppScore ? 'PLAYER' : userScore < oppScore ? 'OPPOSITION' : 'NEUTRAL'
            }
          ]);
          return 90;
        }

        // Check for Bench Substitute Coming On
        if (playerStatus === 'SUBSTITUTE' && !isSubbedOn && !isSubbedOff) {
          if (nextMin >= benchSubTriggerMin) {
            setIsSubbedOn(true);
            setSubOnMinute(nextMin);
            setStamina(Math.max(82, Math.min(100, 100 - ((p.fatigue || 0) / 3))));
            setCommentaryLogs(prev => [
              { minute: nextMin, text: `🔄 SUBSTITUTION: Manager brings on ${p.lastName} from the bench! Fresh energy entering the pitch.`, type: 'goal_user' },
              ...prev
            ]);
          }
        }

        // Check for Scheduled Key Decision Moment (ONLY if on pitch)
        if (scheduledDecisions.current[nextMin] && playerStatus !== 'UNUSED' && isSubbedOn && !isSubbedOff) {
          setActiveDecision(scheduledDecisions.current[nextMin]);
          setSimSpeed('PAUSED');
          return nextMin;
        }

        // Dynamic Pitch Ball Coordinates & Phase updates
        const pitchX = Math.floor(Math.random() * 80) + 10;
        const pitchY = Math.floor(Math.random() * 70) + 15;
        setBallPos({ x: pitchX, y: pitchY });

        if (pitchX > 65) setPhaseText('ATTACKING THIRD PRESS');
        else if (pitchX < 35) setPhaseText('DEFENSIVE THIRD COVERAGE');
        else setPhaseText('MIDFIELD COMBINATION PLAY');

        // Dynamic Passive Simulation Logic per Minute
        let addGoalsUser = 0;
        let addGoalsOpp = 0;

        let oppScoreChance = 0.35;
        if (halftimeTactic === 'PARK_THE_BUS') oppScoreChance = 0.20;

        let userScoreChance = 0.30;
        if (halftimeTactic === 'HIGH_PRESS_OVERLOAD') userScoreChance = 0.40;

        // Random team events
        if (Math.random() < 0.04) {
          if (Math.random() < oppScoreChance) {
            addGoalsOpp = 1;
            setOppScore(s => s + 1);
            setMomentum(m => Math.max(-10, m - 3));
            setCommentaryLogs(prev => [
              { minute: nextMin, text: getFlavorText('goal_opp', '', oppClub.name), type: 'goal_opp' },
              ...prev
            ]);
            setTurningPoints(prev => [
              ...prev,
              {
                id: `tp_${nextMin}_gopp`,
                minute: nextMin,
                title: `GOAL! ${oppClub.name}`,
                description: `Opposition converts scoring attempt in minute ${nextMin}. Defensive structure breached.`,
                impact: 'GOAL',
                team: 'OPPOSITION'
              }
            ]);
          } else {
            setCommentaryLogs(prev => [
              { minute: nextMin, text: getFlavorText('chance_opp', '', oppClub.name), type: 'highlight' },
              ...prev
            ]);
          }
        } else if (Math.random() < 0.05) {
          if (Math.random() < userScoreChance) {
            addGoalsUser = 1;
            setUserScore(s => s + 1);
            setMomentum(m => Math.min(10, m + 3));
            setCommentaryLogs(prev => [
              { minute: nextMin, text: getFlavorText('chance_user', '', userClub.name), type: 'goal_user' },
              ...prev
            ]);
            setTurningPoints(prev => [
              ...prev,
              {
                id: `tp_${nextMin}_guser`,
                minute: nextMin,
                title: `GOAL! ${userClub.name}`,
                description: `Team builds up smoothly from midfield to score crucial goal in minute ${nextMin}!`,
                impact: 'GOAL',
                team: 'PLAYER',
                playerInvolved: `${p.firstName} ${p.lastName}`
              }
            ]);
          }
        } else if (Math.random() < 0.02) {
          // Card / Foul Event
          const cardRisk = touchlineTactic === 'PLAY_SAFE' ? 0.05 : 0.20;
          if (Math.random() < cardRisk) {
             setCommentaryLogs(prev => [
               { minute: nextMin, text: `🟨 YELLOW CARD: Reckless challenge in midfield. Referee goes to the pocket.`, type: 'highlight' },
               ...prev
             ]);
          }
        }

        // Player Stats & Stamina Drain (ONLY IF CURRENTLY ON PITCH)
        if (playerStatus !== 'UNUSED' && isSubbedOn && !isSubbedOff) {
          setPlayerStats(prev => {
            const posGroup = getPositionGroup(p.position || 'ST');
            const passInc = Math.random() < 0.35 ? 1 : 0;
            const passAcc = Math.random() < 0.82 ? passInc : 0;
            const tackleInc = posGroup !== 'GK' && Math.random() < 0.08 ? 1 : 0;
            const saveInc = posGroup === 'GK' && Math.random() < 0.12 ? 1 : 0;

            const ratingDelta = (addGoalsUser ? 0.3 : 0) + (passAcc ? 0.05 : 0) + (saveInc ? 0.25 : 0) - (addGoalsOpp ? (posGroup === 'GK' ? 0.2 : 0.1) : 0);
            const nextRating = Math.min(9.9, Math.max(5.0, Number((prev.rating + ratingDelta).toFixed(1))));

            return {
              ...prev,
              minutes: prev.minutes + 1,
              passesAttempted: prev.passesAttempted + passInc,
              passesCompleted: prev.passesCompleted + passAcc,
              tackles: prev.tackles + tackleInc,
              saves: (prev.saves || 0) + saveInc,
              distanceCovered: Number((prev.distanceCovered + 0.12).toFixed(2)),
              rating: nextRating
            };
          });

          // Drain Stamina & Check Low Stamina Subbing Off Trigger
          const drain = mindset === 'HIGH_PRESS' ? 0.8 : mindset === 'ATTACKING' ? 0.6 : 0.45;
          setStamina(s => {
            const nextStam = Math.max(5, Number((s - drain).toFixed(1)));
            
            // Realistic Match Injury Check (incorporating weather & pitch injury risk modifiers)
            const weatherInjuryMod = (weather.modifiers.injuryRisk || 0) * 0.0006 + (pitch.modifiers.injuryRisk || 0) * 0.0006;
            
            let injuryChance = 0.0002 + (100 - nextStam) * 0.000012 + (p.physicalCondition?.injurySusceptibility || 10) * 0.00003 + weatherInjuryMod;
            if (apState.staff.privatePhysio) {
              injuryChance *= 0.7; // -30% risk
            }

            if (!matchInjury && !isSubbedOff && nextMin >= 15 && Math.random() < injuryChance) {
              const injuries = [
                { name: 'Hamstring Strain', weeks: 2, severity: 'MINOR' },
                { name: 'Medial Ligament Sprain', weeks: 4, severity: 'MODERATE' },
                { name: 'Calf Muscle Tear', weeks: 3, severity: 'MODERATE' },
                { name: 'Groin Pull', weeks: 2, severity: 'MINOR' },
                { name: 'Cruciate Ligament Strain', weeks: 8, severity: 'SEVERE' },
                { name: 'Metatarsal Fracture', weeks: 6, severity: 'SEVERE' }
              ];
              const chosen = injuries[Math.floor(Math.random() * injuries.length)];
              setMatchInjury(chosen);
              setIsSubbedOff(true);
              setSubOffMinute(nextMin);
              setSubOffReason(`🚨 INJURY: ${chosen.name} (${chosen.weeks} wks recovery)`);
              setCommentaryLogs(c => [
                { minute: nextMin, text: `🚨 CRITICAL INJURY INCIDENT: ${p.lastName} goes down clutching their leg in agony! Stretcher called. Medical diagnosis: ${chosen.name} (${chosen.weeks} wks).`, type: 'goal_opp' },
                ...c
              ]);
            }

            // Check if manager hook / substitution should trigger
            if (!isSubbedOff) {
              let triggerSub = false;
              let reason = '';

              if (nextStam <= 22 && nextMin >= 25) {
                triggerSub = true;
                reason = `Low Stamina (${Math.round(nextStam)}%) - Physical Exhaustion`;
              } else if (nextStam <= 32 && nextMin >= 55) {
                triggerSub = true;
                reason = `Fatigue (${Math.round(nextStam)}% Stamina)`;
              } else if (nextMin >= 65 && playerStats.rating < 5.8) {
                triggerSub = true;
                reason = `Tactical Sub (Performance Rating: ${playerStats.rating})`;
              } else if (nextMin >= 72 && nextStam <= 45) {
                triggerSub = true;
                reason = `Routine Tactical Rotation (${Math.round(nextStam)}% Stamina)`;
              }

              if (triggerSub) {
                setIsSubbedOff(true);
                setSubOffMinute(nextMin);
                setSubOffReason(reason);
                setCommentaryLogs(c => [
                  { minute: nextMin, text: `🔄 SUBSTITUTION: Manager takes off ${p.lastName} (${reason}). Replaced by tactical substitute.`, type: 'highlight' },
                  ...c
                ]);
              }
            }
            return nextStam;
          });
        }

        return nextMin;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [phase, simSpeed, activeDecision, playerStatus, isSubbedOn, isSubbedOff, benchSubTriggerMin, userClub.symbol, oppClub.symbol, oppClub.name, userClub.name, mindset]);

  // Handle Interactive Key Moment Option Choice
  const handleMakeDecision = (opt: DecisionOption) => {
    if (!activeDecision) return;

    sfxEngine.play('BALL_KICK');

    const playerAttrVal = (p.attributes as any)[opt.attrKey] || 70;
    const baseChance = playerAttrVal / 100;
    const riskPenalty = opt.risk === 'HIGH' ? 0.25 : opt.risk === 'MED' ? 0.12 : 0.02;

    const finalSuccessChance = Math.max(0.2, Math.min(0.92, baseChance - riskPenalty + (stamina / 500)));
    const isSuccess = Math.random() < finalSuccessChance;
    const posGroup = getPositionGroup(p.position || 'ST');

    if (isSuccess) {
      if (opt.attrKey === 'finishing') {
        // Goal scored!
        sfxEngine.play('GOAL_CROWD');
        setUserScore(s => s + 1);
        setPlayerStats(prev => ({
          ...prev,
          goals: prev.goals + 1,
          shots: prev.shots + 1,
          shotsOnTarget: prev.shotsOnTarget + 1,
          rating: Math.min(9.9, Number((prev.rating + (posGroup === 'GK' ? 1.2 : 0.9)).toFixed(1)))
        }));
        setMomentum(m => Math.min(10, m + 4));
        setCommentaryLogs(prev => [
          { minute: activeDecision.minute, text: getFlavorText('goal_user', p.lastName, '', opt.text, p.position), type: 'goal_user' },
          ...prev
        ]);
        setLastActionResult(`✅ SUCCESSFUL ACTION: GOAL SCORED! (+0.9 Rating)`);
      } else if (opt.attrKey === 'passing' || opt.attrKey === 'vision') {
        if (posGroup === 'GK') {
          setPlayerStats(prev => ({
            ...prev,
            passesCompleted: prev.passesCompleted + 1,
            passesAttempted: prev.passesAttempted + 1,
            rating: Math.min(9.9, Number((prev.rating + 0.4).toFixed(1)))
          }));
          setCommentaryLogs(prev => [
            { minute: activeDecision.minute, text: getFlavorText('distribution', p.lastName, '', opt.text, p.position), type: 'highlight' },
            ...prev
          ]);
          setLastActionResult(`✅ SUCCESSFUL ACTION: ACCURATE DISTRIBUTION! (+0.4 Rating)`);
        } else {
          const isGoalAssist = Math.random() < 0.65;
          if (isGoalAssist) {
            setUserScore(s => s + 1);
            setPlayerStats(prev => ({
              ...prev,
              assists: prev.assists + 1,
              keyPasses: prev.keyPasses + 1,
              passesCompleted: prev.passesCompleted + 1,
              passesAttempted: prev.passesAttempted + 1,
              rating: Math.min(9.9, Number((prev.rating + 0.7).toFixed(1)))
            }));
            setMomentum(m => Math.min(10, m + 3));
            setCommentaryLogs(prev => [
              { minute: activeDecision.minute, text: getFlavorText('assist', p.lastName, '', opt.text, p.position), type: 'goal_user' },
              ...prev
            ]);
            setLastActionResult(`✅ SUCCESSFUL ACTION: ASSIST RECORDED! (+0.7 Rating)`);
          } else {
            setPlayerStats(prev => ({
              ...prev,
              keyPasses: prev.keyPasses + 1,
              passesCompleted: prev.passesCompleted + 1,
              passesAttempted: prev.passesAttempted + 1,
              rating: Math.min(9.9, Number((prev.rating + 0.3).toFixed(1)))
            }));
            setCommentaryLogs(prev => [
              { minute: activeDecision.minute, text: getFlavorText('key_pass', p.lastName, '', opt.text, p.position), type: 'highlight' },
              ...prev
            ]);
            setLastActionResult(`✅ SUCCESSFUL ACTION: KEY PASS DELIVERED! (+0.3 Rating)`);
          }
        }
      } else if (opt.attrKey === 'tackling' || (posGroup === 'GK' && (opt.attrKey === 'composure' || opt.attrKey === 'dribbling'))) {
        if (posGroup === 'GK') {
          setPlayerStats(prev => ({
            ...prev,
            saves: (prev.saves || 0) + 1,
            rating: Math.min(9.9, Number((prev.rating + 0.5).toFixed(1)))
          }));
          setCommentaryLogs(prev => [
            { minute: activeDecision.minute, text: getFlavorText('save', p.lastName, '', opt.text, p.position), type: 'highlight' },
            ...prev
          ]);
          setLastActionResult(`✅ SUCCESSFUL ACTION: CRUCIAL KEEPER SAVE / CLAIM! (+0.5 Rating)`);
        } else {
          setPlayerStats(prev => ({
            ...prev,
            tackles: prev.tackles + 1,
            rating: Math.min(9.9, Number((prev.rating + 0.4).toFixed(1)))
          }));
          setCommentaryLogs(prev => [
            { minute: activeDecision.minute, text: getFlavorText('tackle', p.lastName, '', opt.text, p.position), type: 'highlight' },
            ...prev
          ]);
          setLastActionResult(`✅ SUCCESSFUL ACTION: DISPOSSESSED OPPONENT! (+0.4 Rating)`);
        }
      } else {
        setPlayerStats(prev => ({
          ...prev,
          rating: Math.min(9.9, Number((prev.rating + 0.3).toFixed(1)))
        }));
        setCommentaryLogs(prev => [
          { minute: activeDecision.minute, text: getFlavorText('skill', p.lastName, '', opt.text, p.position), type: 'highlight' },
          ...prev
        ]);
        setLastActionResult(`✅ SUCCESSFUL ACTION: EXCELLENT POSSESSION PLAY! (+0.3 Rating)`);
      }
    } else {
      // Failed Action
      setPlayerStats(prev => ({
        ...prev,
        shots: opt.attrKey === 'finishing' ? prev.shots + 1 : prev.shots,
        passesAttempted: opt.attrKey === 'passing' ? prev.passesAttempted + 1 : prev.passesAttempted,
        rating: Math.max(5.0, Number((prev.rating - 0.2).toFixed(1)))
      }));
      setMomentum(m => Math.max(-10, m - 2));
      setCommentaryLogs(prev => [
        { minute: activeDecision.minute, text: getFlavorText('miss', p.lastName, '', opt.text, p.position), type: 'info' },
        ...prev
      ]);
      setLastActionResult(`⚠️ ATTEMPT UNSUCCESSFUL: Dispossessed / Saved (-0.2 Rating)`);
    }

    // Record Key Turning Point for Decision
    setTurningPoints(prev => [
      ...prev,
      {
        id: `tp_${activeDecision.minute}_dec_${Date.now()}`,
        minute: activeDecision.minute,
        title: `Key Decision: ${activeDecision.title}`,
        description: `Chosen option: "${opt.text}" (${opt.risk} Risk). Result: ${isSuccess ? 'SUCCESSFUL EXECUTION' : 'UNSUCCESSFUL / BLOCKED'}.`,
        impact: isSuccess ? (opt.attrKey === 'finishing' ? 'GOAL' : 'CRITICAL') : 'MAJOR',
        team: 'PLAYER',
        playerInvolved: `${p.firstName} ${p.lastName}`
      }
    ]);

    // Close decision & resume simulation
    setActiveDecision(null);
    setSimSpeed(2);
  };

  // Instant Sim to Full Time
  const handleInstantSim = () => {
    setActiveDecision(null);
    let extraUserGoals = 0;
    let extraOppGoals = 0;

    const remainingMinutes = 90 - minute;
    if (remainingMinutes > 0) {
      const timeRatio = remainingMinutes / 90;
      if (Math.random() < 0.4 * timeRatio) extraUserGoals += 1;
      if (Math.random() < 0.3 * timeRatio) extraOppGoals += 1;
    }

    setUserScore(s => s + extraUserGoals);
    setOppScore(s => s + extraOppGoals);
    setMinute(90);
    setPhase('FULL_TIME');
    setSimSpeed('PAUSED');
  };

  // Claim Rewards and Sync with GameContext
  const handleClaimAndExit = () => {
    if (hasClaimed) return;
    setHasClaimed(true);

    const isBenched = playerStatus === 'UNUSED';
    const isIntl = state.nextMatch?.competitionType === 'INTERNATIONAL';

    const newApps = (isBenched || isIntl) ? p.stats.apps : p.stats.apps + 1;
    const newGoals = (isBenched || isIntl) ? p.stats.goals : p.stats.goals + playerStats.goals;
    const newAssists = (isBenched || isIntl) ? p.stats.assists : p.stats.assists + playerStats.assists;

    const newCaps = (!isBenched && isIntl) ? p.stats.caps + 1 : p.stats.caps;
    const newIntlGoals = (!isBenched && isIntl) ? (p.stats.intlGoals || 0) + playerStats.goals : (p.stats.intlGoals || 0);

    // Calculate Objectives Completed
    let objectivesCompletedCount = 0;
    let totalTrustBonus = 0;
    objectives.forEach(obj => {
      if (obj.check(playerStats, playerStats.rating)) {
        objectivesCompletedCount += 1;
        totalTrustBonus += obj.rewardTrust;
      }
    });

    // Match outcome
    let matchOutcome: 'WON' | 'DREW' | 'LOST' = 'DREW';
    if (userScore > oppScore) matchOutcome = 'WON';
    else if (userScore < oppScore) matchOutcome = 'LOST';

    // Trust & Reputation Gains
    let trustChange = totalTrustBonus;
    if (matchOutcome === 'WON') trustChange += 3;
    else if (matchOutcome === 'LOST') trustChange -= 2;

    const newTrust = Math.max(0, Math.min(100, p.trust + trustChange));

    // Calculate position-aware reputation & fan gain
    const repGains = calculateMatchReputationGain(
      p,
      {
        rating: playerStats.rating,
        goals: playerStats.goals,
        assists: playerStats.assists,
        tackles: playerStats.tackles,
        saves: playerStats.saves,
        passesCompleted: playerStats.passesCompleted,
        passesAttempted: playerStats.passesAttempted,
        cleanSheet: oppScore === 0,
        minutes: playerStats.minutes
      },
      matchOutcome
    );

    let newFans = Math.max(0, Math.min(100, p.fans + repGains.fanGain + (interviewAnswer === 0 ? 5 : 0)));

    const playerWithRep = updateReputationAndPerception(
      p,
      {
        world: repGains.worldDelta,
        media: repGains.mediaDelta,
        peer: repGains.peerDelta
      },
      `Matchday vs ${oppClub.name} (${playerStats.rating} rating)`,
      state.currentWeek,
      state.currentDay
    );

    // Contract bonus earnings
    let appBonus = 0;
    let goalBonus = 0;
    if (!isBenched && !isIntl) {
      if (p.contract?.appearanceBonus) appBonus = p.contract.appearanceBonus;
      if (p.contract?.goalBonus && playerStats.goals > 0) goalBonus = p.contract.goalBonus * playerStats.goals;
    }
    const totalEarnings = appBonus + goalBonus;
    const newBalance = (p.finances?.balance || 0) + totalEarnings;

    // Fatigue & Sharpness
    const fatigueAdd = isBenched ? -2 : Math.min(30, Math.floor((playerStats.minutes / 90) * 22));
    const newFatigue = Math.max(0, Math.min(100, p.fatigue + fatigueAdd));
    const newSharpness = Math.min(100, p.sharpness + (isBenched ? 2 : 12));

    // Progression
    const currentProg = p.progression || {
      gate: 'COMPETENCY',
      gateProgress: 0,
      reputation: 0,
      reputationGrowthHistory: [],
      matchesPlayed: 0,
      averageRating: 6.0,
      totalRatingsSum: 0,
      goalsAndAssists: 0
    };

    const prevRatingsSum = (p.progression?.averageRating || 6.0) * (p.stats.apps || 1);
    const newRatingsSum = prevRatingsSum + (isIntl ? 0 : playerStats.rating);
    const nextAvgRating = newApps > 0 ? Number((newRatingsSum / newApps).toFixed(2)) : playerStats.rating;

    const nextProgResult = updateProgressionState(
      currentProg,
      p.ovr,
      newApps,
      newGoals,
      newAssists,
      0,
      nextAvgRating
    );

    // Add Post-Match News Item to Inbox
    const inboxList = [...state.inbox];
    inboxList.unshift({
      id: `match_news_${Date.now()}`,
      sender: 'SPORTS MEDIA',
      subject: `Matchday Result: ${userClub.symbol} ${userScore} - ${oppScore} ${oppClub.symbol}`,
      content: `You completed the matchday fixture vs ${oppClub.name} with a ${playerStats.rating} rating (${playerStats.goals} Goals, ${playerStats.assists} Assists). ${objectivesCompletedCount}/3 Objectives Completed.`,
      read: false,
      type: 'NEWS',
      timestamp: `${state.currentDay} 18:00`,
      choices: [{ text: 'Acknowledge Result', type: 'ack' }]
    });

    let injuryStateUpdate = {};
    if (matchInjury) {
      injuryStateUpdate = {
        injuryName: matchInjury.name,
        injuryWeeksLeft: matchInjury.weeks,
        rehabProcess: initializeActiveRehab(matchInjury.name, matchInjury.weeks)
      };
      inboxList.unshift({
        id: `injury_report_${Date.now()}`,
        sender: getCanonicalSender(state, 'PHYSIO'),
        subject: `🏥 MEDICAL REPORT: ${matchInjury.name}`,
        content: `${getClubStaff(state).physio.fullName}: "Following today's fixture, ${p.firstName} ${p.lastName} sustained a ${matchInjury.severity.toLowerCase()} ${matchInjury.name}. Estimated recovery timeline is ${matchInjury.weeks} weeks under strict clinical rehabilitation."`,
        read: false,
        type: 'OTHER',
        timestamp: `${state.currentDay} 18:00`,
        choices: [{ text: 'Acknowledge Medical Report', type: 'ack' }]
      });
    }

    // Save state
    setPlayer({
      ...playerWithRep.player,
      trust: newTrust,
      fans: newFans,
      fatigue: newFatigue,
      sharpness: newSharpness,
      stateFlags: {
        ...playerWithRep.player.stateFlags,
        lastMatchPerformance: {
          rating: playerStats.rating,
          goals: playerStats.goals,
          assists: playerStats.assists,
          tackles: playerStats.tackles,
          saves: playerStats.saves,
          cleanSheet: oppScore === 0
        }
      },
      stats: {
        ...p.stats,
        apps: newApps,
        goals: newGoals,
        assists: newAssists,
        caps: newCaps,
        intlGoals: newIntlGoals
      },
      finances: {
        ...p.finances,
        balance: newBalance
      },
      progression: nextProgResult.progression,
      ...injuryStateUpdate
    });

    setInbox(inboxList);

    // Return to Hub and advance calendar day
    setScreen('HUB', true);
    advanceDay(true);
  };

  // ==================== RENDERING PHASES ====================

  // 1. PRE-MATCH BRIEFING
  if (phase === 'PRE_MATCH') {
    return (
      <div className="w-full text-white flex flex-col font-mono select-none space-y-6 pb-8">
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-xl text-[#00FF88]">
              <Trophy size={22} />
            </div>
            <div>
              <span className="text-[10px] text-[#00FF88] font-bold uppercase tracking-widest block">MATCHDAY FIXTURE PREVIEW</span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">PRE-MATCH BRIEFING</h1>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/50 block font-bold">WEEK {state.currentWeek} · {state.currentDay}</span>
            <span className="text-xs text-[#00FF88] font-bold uppercase">{weather.icon} {weather.type} ({tempCelsius}°C) · {pitch.icon} {pitch.type}</span>
          </div>
        </div>

        {/* Fixture Matchup Banner */}
        <div className="relative bg-gradient-to-br from-[#141414] via-[#0e0e0e] to-[#070707] border border-white/15 rounded-2xl p-6 mb-6 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* User Club */}
            <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
              <div className="p-3 bg-black/50 rounded-xl border border-white/10 shrink-0">
                <TeamLogo symbol={userClub.symbol} name={userClub.name} primaryColor={userClub.primaryColor} secondaryColor={userClub.secondaryColor} size={56} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">{userClub.name}</h2>
                <span className="text-xs text-[#00FF88] font-bold uppercase">{isHome ? 'HOME TEAM' : 'AWAY TEAM'}</span>
              </div>
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center justify-center bg-black/80 px-6 py-3 rounded-xl border border-white/10">
              <span className="text-2xl font-black tracking-widest text-[#00FF88]">VS</span>
              <span className="text-[10px] text-white/40 uppercase font-bold mt-1">KICKOFF 15:00</span>
            </div>

            {/* Opponent Club */}
            <div className="flex items-center gap-4 flex-1 justify-center md:justify-end text-right">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">{oppClub.name}</h2>
                <span className="text-xs text-white/40 font-bold uppercase">{!isHome ? 'HOME TEAM' : 'AWAY TEAM'}</span>
              </div>
              <div className="p-3 bg-black/50 rounded-xl border border-white/10 shrink-0">
                <TeamLogo symbol={oppClub.symbol} name={oppClub.name} primaryColor={oppClub.primaryColor} secondaryColor={oppClub.secondaryColor} size={56} />
              </div>
            </div>
          </div>
        </div>

        {/* Grid: Tactical Mindset & Manager Objectives */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tactical Mindset Selector */}
          <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-[#00FF88] font-bold text-xs uppercase tracking-wider border-b border-white/10 pb-3 mb-4">
              <Compass size={16} /> Choose Tactical Mindset
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'BALANCED', name: 'Balanced Playmaker', desc: '+Pass % & Vision', icon: Target },
                { id: 'ATTACKING', name: 'Clinical Finisher', desc: '+Shooting & Finishing', icon: Flame },
                { id: 'HIGH_PRESS', name: 'High Press Workhorse', desc: '+Tackling & Intercepts', icon: Zap },
                { id: 'COUNTER', name: 'Counter-Attack Threat', desc: '+Breakout Pace & Drives', icon: Activity }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = mindset === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMindset(m.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#00FF88]/10 border-[#00FF88] text-white shadow-lg shadow-[#00FF88]/10'
                        : 'bg-black/40 border-white/10 hover:border-white/20 text-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon size={20} className={isSelected ? 'text-[#00FF88]' : 'text-white/40'} />
                      {isSelected && <CheckCircle2 size={16} className="text-[#00FF88]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase block text-white">{m.name}</span>
                      <span className="text-[10px] text-white/50 block mt-0.5">{m.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manager Objectives */}
          <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#00FF88] font-bold text-xs uppercase tracking-wider border-b border-white/10 pb-3 mb-4">
                <Award size={16} /> Manager's Match Objectives
              </div>

              <div className="space-y-3">
                {objectives.map((obj, i) => (
                  <div key={obj.id} className="bg-black/40 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#00FF88] bg-[#00FF88]/10 w-6 h-6 rounded-full flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">{obj.description}</span>
                        <span className="text-[10px] text-white/40 block">Target: {obj.targetText}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#00FF88] font-bold block">+{obj.rewardTrust} Trust</span>
                      <span className="text-[10px] text-amber-400 font-bold block">+{obj.rewardXP} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kickoff CTA */}
            <button
              onClick={handleStartMatch}
              className="w-full mt-6 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black py-4 px-6 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#00FF88]/20 cursor-pointer active:scale-98"
            >
              <Play size={20} className="fill-black" /> KICK OFF MATCH
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. LIVE MATCH SIMULATION VIEW (IN_MATCH)
  if (phase === 'IN_MATCH') {
    return (
      <div className="w-full text-white flex flex-col font-mono select-none relative space-y-4 pb-8">
        {/* Top Header Scoreboard Bar */}
        <div className="bg-[#121212] border border-white/15 rounded-xl p-3 sm:p-4 mb-4 flex items-center justify-between shadow-xl">
          {/* User Club */}
          <div className="flex items-center gap-3">
            <TeamLogo symbol={userClub.symbol} name={userClub.name} primaryColor={userClub.primaryColor} secondaryColor={userClub.secondaryColor} size={38} />
            <span className="text-sm sm:text-base font-black uppercase text-white hidden sm:inline">{userClub.name}</span>
            <span className="text-sm font-black uppercase text-white sm:hidden">{userClub.symbol}</span>
          </div>

          {/* Live Score & Clock */}
          <div className="flex items-center gap-4 bg-black/60 px-5 py-2 rounded-xl border border-white/10">
            <span className="text-2xl sm:text-3xl font-black text-[#00FF88] tracking-widest">
              {userScore} - {oppScore}
            </span>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs sm:text-sm">
              <Clock size={16} className="animate-pulse" />
              <span>{minute}'</span>
            </div>
          </div>

          {/* Opponent Club */}
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-black uppercase text-white hidden sm:inline">{oppClub.name}</span>
            <span className="text-sm font-black uppercase text-white sm:hidden">{oppClub.symbol}</span>
            <TeamLogo symbol={oppClub.symbol} name={oppClub.name} primaryColor={oppClub.primaryColor} secondaryColor={oppClub.secondaryColor} size={38} />
          </div>
        </div>

        {/* Speed Controls & Action Notification */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 font-bold uppercase hidden sm:inline">SPEED:</span>
            {[
              { label: '1x', val: 1 },
              { label: '2x', val: 2 },
              { label: '4x', val: 4 }
            ].map(s => (
              <button
                key={s.val}
                onClick={() => setSimSpeed(s.val as any)}
                className={`px-3 py-1 rounded text-xs font-bold border cursor-pointer ${
                  simSpeed === s.val ? 'bg-[#00FF88] text-black border-[#00FF88]' : 'bg-black/40 text-white/70 border-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>



          <button
            onClick={handleInstantSim}
            className="px-3 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer flex items-center gap-1"
          >
            <FastForward size={14} /> SIM TO END
          </button>
        </div>

        {/* 2D Interactive Pitch Radar Display */}
        <div className="relative w-full h-56 sm:h-64 bg-[#143d22] border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl mb-4 flex flex-col justify-between p-3">
          {/* Pitch Field Markings (Center circle & Lines) */}
          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-25">
            <div className="w-full h-full border border-white" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 -mt-12 -ml-12 border border-white rounded-full" />
            <div className="absolute top-1/4 left-0 w-16 h-1/2 border-r border-t border-b border-white" />
            <div className="absolute top-1/4 right-0 w-16 h-1/2 border-l border-t border-b border-white" />
          </div>

          {/* Top Info Overlay */}
          <div className="relative z-10 flex justify-between items-center text-[10px] font-bold tracking-wider">
            <span className="bg-black/70 px-2.5 py-1 rounded text-[#00FF88] border border-white/10">
              PHASE: {phaseText}
            </span>
            <span className="bg-black/70 px-2.5 py-1 rounded text-white border border-white/10">
              MOMENTUM: {momentum > 0 ? `+${momentum} ${userClub.symbol}` : momentum < 0 ? `${momentum} ${oppClub.symbol}` : 'NEUTRAL'}
            </span>
          </div>

          {/* Animated Pitch Radar Ball Marker */}
          <div
            className="absolute z-20 w-5 h-5 bg-yellow-400 rounded-full border-2 border-black shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out flex items-center justify-center"
            style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
          >
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>

          {/* Bottom Live Player HUD */}
          <div className="relative z-10 bg-black/80 backdrop-blur border border-white/15 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00FF88]/20 text-[#00FF88] rounded-lg font-black text-sm border border-[#00FF88]/30">
                {playerStats.rating}
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  {p.firstName} {p.lastName}
                  {isSubbedOff && (
                    <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-black">
                      SUBBED OFF ({subOffMinute}')
                    </span>
                  )}
                  {playerStatus === 'SUBSTITUTE' && !isSubbedOn && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black">
                      ON BENCH
                    </span>
                  )}
                  {isSubbedOn && !isSubbedOff && playerStatus === 'SUBSTITUTE' && (
                    <span className="text-[9px] bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30 px-2 py-0.5 rounded font-black">
                      SUBBED ON ({subOnMinute}')
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-white/50 block font-bold">
                  G: <span className="text-[#00FF88]">{playerStats.goals}</span> | A: <span className="text-[#00FF88]">{playerStats.assists}</span> | Mins: {playerStats.minutes}'
                </span>
              </div>
            </div>

            <div className="text-right min-w-[110px]">
              <span className="text-[9px] text-white/40 font-bold block mb-1">STAMINA ({Math.round(stamina)}%)</span>
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all ${stamina > 50 ? 'bg-[#00FF88]' : stamina > 25 ? 'bg-amber-400' : 'bg-red-500'}`}
                  style={{ width: `${Math.max(0, Math.min(100, stamina))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subbed Off Notification Banner */}
        {isSubbedOff && (
          <div className="bg-gradient-to-r from-red-950/80 to-black border border-red-500/40 rounded-xl p-3 mb-3 flex items-center gap-3 font-mono shadow-lg">
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg shrink-0">
              <RefreshCw size={18} />
            </div>
            <div className="text-xs">
              <span className="font-bold text-red-300 uppercase block">SUBSTITUTED OFF AT MINUTE {subOffMinute}'</span>
              <span className="text-white/70 text-[11px]">Reason: {subOffReason || 'Low stamina / Physical fatigue'}. Shift ended with {playerStats.minutes} mins played.</span>
            </div>
          </div>
        )}

        {/* Touchline Instructions */}
        {playerStatus !== 'UNUSED' && isSubbedOn && !isSubbedOff && (
          <MatchTacticsOverlay
            mode="TOUCHLINE"
            matchAPAvailable={apState.currentAP}
            activeTactics={activeTactics}
            userScore={userScore}
            oppScore={oppScore}
            userClubName={userClub.name}
            oppClubName={oppClub.name}
            minute={minute}
            onSelectTactic={handleSelectTactic}
          />
        )}

        {/* Live Match Commentary Ticker */}
        <div className="flex-1 bg-[#0e0e0e] border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-3">Live Commentary Feed</span>
          <div className="overflow-y-auto max-h-48 hide-scrollbar">
            <AnimatePresence initial={false}>
              {commentaryLogs.map((log, index) => {
                const uniqueKey = `${index}-${log.minute}-${log.text.substring(0, 20).replace(/\s+/g, '')}`;
                return (
                  <motion.div
                    layout
                    key={uniqueKey}
                    initial={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto', marginBottom: 8 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs font-mono mb-2 ${
                      log.type === 'goal_user' ? 'bg-[#00FF88]/10 border-[#00FF88]/40 text-[#00FF88]' :
                      log.type === 'goal_opp' ? 'bg-red-500/10 border-red-500/40 text-red-400' :
                      log.type === 'highlight' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                      'bg-black/40 border-white/5 text-white/80'
                    }`}
                  >
                    <span className="font-black shrink-0">{log.minute}'</span>
                    <span>{log.text}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* INTERACTIVE KEY MOMENT DECISION OVERLAY MODAL */}
        {activeDecision && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#121212] border-2 border-[#00FF88] rounded-2xl p-6 max-w-lg w-full shadow-2xl font-mono animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2 text-[#00FF88] font-black text-sm uppercase">
                  <Sparkles size={18} /> {activeDecision.title}
                </div>
                <span className="text-xs text-amber-400 font-bold uppercase">KEY DECISION</span>
              </div>

              <p className="text-sm text-white/90 mb-6 bg-black/50 p-4 rounded-xl border border-white/10 leading-relaxed">
                "{activeDecision.situation}"
              </p>

              <div className="space-y-3">
                {activeDecision.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleMakeDecision(opt)}
                    className="w-full bg-black/60 hover:bg-[#00FF88]/10 border border-white/15 hover:border-[#00FF88] p-4 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-white group-hover:text-[#00FF88]">{opt.text}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        opt.risk === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        opt.risk === 'MED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/30'
                      }`}>
                        {opt.risk} RISK
                      </span>
                    </div>
                    <span className="text-xs text-white/50 block">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. HALF-TIME INTERVAL
  if (phase === 'HALF_TIME') {
    return (
      <div className="w-full text-white flex flex-col font-mono select-none items-center justify-center py-6 max-w-4xl mx-auto">
        <MatchTacticsOverlay
          mode="HALFTIME"
          matchAPAvailable={apState.currentAP}
          activeTactics={activeTactics}
          userScore={userScore}
          oppScore={oppScore}
          userClubName={userClub.name}
          oppClubName={oppClub.name}
          minute={45}
          stats={{
            userXg: 1.25 + (halftimeTactic === 'HIGH_PRESS_OVERLOAD' ? 0.25 : 0),
            oppXg: halftimeTactic === 'PARK_THE_BUS' ? 0.45 : 0.85,
            possession: 54
          }}
          onSelectTactic={handleSelectTactic}
          onResumeMatch={() => {
            setPhase('IN_MATCH');
            setSimSpeed(2);
          }}
        />
      </div>
    );
  }

  // 4. FULL TIME POST-MATCH SUMMARY & REWARDS
  return (
    <div className="w-full text-white flex flex-col font-mono select-none space-y-6 pb-12">
      {/* Top Bar Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-xl text-[#00FF88]">
            <Trophy size={22} />
          </div>
          <div>
            <span className="text-[10px] text-[#00FF88] font-bold uppercase tracking-widest block">MATCHDAY FIXTURE RESULT</span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">FULL TIME REPORT</h1>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-white/50 block font-bold">WEEK {state.currentWeek} · {state.currentDay}</span>
          <span className="text-xs text-[#00FF88] font-bold uppercase">FINAL WHISTLE</span>
        </div>
      </div>

      {/* Main Scoreboard Banner Card */}
      <div className="relative bg-gradient-to-br from-[#121212] via-[#0e0e0e] to-[#070707] border border-white/15 rounded-2xl p-6 mb-6 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* User Club */}
          <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
            <div className="p-3 bg-black/40 rounded-xl border border-white/10 shrink-0">
              <TeamLogo symbol={userClub.symbol} name={userClub.name} primaryColor={userClub.primaryColor} secondaryColor={userClub.secondaryColor} size={54} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">{userClub.name}</h2>
              <span className="text-xs text-[#00FF88] font-bold uppercase">{isHome ? 'HOME' : 'AWAY'}</span>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex flex-col items-center justify-center bg-black/60 px-8 py-4 rounded-xl border border-white/20 min-w-[180px]">
            <div className="text-4xl sm:text-5xl font-black tracking-widest text-[#00FF88] flex items-center gap-4">
              <span>{userScore}</span>
              <span className="text-white/20 text-3xl">-</span>
              <span>{oppScore}</span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 px-3 py-0.5 rounded ${
              userScore > oppScore ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30' :
              userScore === oppScore ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {userScore > oppScore ? 'VICTORY' : userScore === oppScore ? 'DRAW' : 'DEFEAT'}
            </span>
          </div>

          {/* Opponent Club */}
          <div className="flex items-center gap-4 flex-1 justify-center md:justify-end text-right">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">{oppClub.name}</h2>
              <span className="text-xs text-white/40 font-bold uppercase">{!isHome ? 'HOME' : 'AWAY'}</span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/10 shrink-0">
              <TeamLogo symbol={oppClub.symbol} name={oppClub.name} primaryColor={oppClub.primaryColor} secondaryColor={oppClub.secondaryColor} size={54} />
            </div>
          </div>
        </div>
      </div>

      {/* Realistic Match Injury Alert Banner if injured */}
      {matchInjury && (
        <div className="bg-red-950/80 border border-red-500/40 rounded-2xl p-5 mb-6 flex items-start gap-4 shadow-xl">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl shrink-0">
            <AlertCircle size={22} />
          </div>
          <div>
            <span className="text-xs font-black text-red-400 uppercase tracking-wider block mb-1">
              🚨 MATCH INJURY SUSTAINED: {matchInjury.name} ({matchInjury.severity})
            </span>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              {getClubStaff(state).physio.fullName}: "{p.lastName} sustained a {matchInjury.severity.toLowerCase()} {matchInjury.name} during match action. Estimated recovery timeline is {matchInjury.weeks} weeks under strict clinical rehabilitation."
            </p>
          </div>
        </div>
      )}

      {/* Match Summary Log & Key Turning Points Section */}
      <div className="mb-6">
        <TurningPointsReview
          turningPoints={turningPoints}
          playerClubName={userClub.name}
          opponentClubName={oppClub.name}
        />
      </div>

      {/* Recharts Pitch Heatmap & Spatial Activity Card */}
      <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2 text-[#00FF88] font-bold text-xs uppercase tracking-wider">
            <Target size={16} /> Pitch Heatmap & Spatial Activity (Match Rating: {playerStats.rating})
          </div>
          <span className="text-[10px] text-white/50 font-mono uppercase">Recharts Spatial Density</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Pitch Canvas with Recharts Scatter Heatmap */}
          <div className="md:col-span-2 relative w-full h-64 bg-[#113820] border border-white/20 rounded-xl overflow-hidden p-2 flex items-center justify-center shadow-inner">
            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-20">
              <div className="w-full h-full border border-white" />
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
              <div className="absolute top-1/2 left-1/2 w-20 h-20 -mt-10 -ml-10 border border-white rounded-full" />
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-black/90 border border-[#00FF88] p-2.5 rounded text-[10px] font-mono text-white shadow-xl">
                          <p className="font-bold text-[#00FF88]">Zone: {data.zone}</p>
                          <p>Activity Intensity: {data.intensity}/10</p>
                          <p>Coords: X: {data.x}%, Y: {data.y}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={heatmapData} shape="circle">
                  {heatmapData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.intensity >= 8 ? '#00FF88' : entry.intensity >= 5 ? '#06b6d4' : '#f59e0b'} 
                      fillOpacity={0.85}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap Insights & Zone Summary */}
          <div className="flex flex-col justify-between space-y-3 font-mono text-xs">
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-white/40 font-bold uppercase block mb-1">PRIMARY ZONE</span>
              <span className="text-sm font-black text-[#00FF88]">
                {p.position === 'ST' || (p.position as string) === 'CF' ? 'Final Third & Box' : p.position === 'CM' ? 'Central Midfield Engine' : 'Defensive Third & Flanks'}
              </span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-white/40 font-bold uppercase block mb-1">DISTANCE COVERED</span>
              <span className="text-sm font-black text-white">{playerStats.distanceCovered} km</span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-white/40 font-bold uppercase block mb-1">SPATIAL EFFICIENCY</span>
              <span className="text-xs text-white/80 leading-relaxed font-sans font-medium">
                {playerStats.rating >= 7.5 ? 'High offensive output and tactical pressing efficiency.' : 'Solid defensive tracking and positional discipline.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      
      {/* Grid: Player Stats & Objectives Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RadarChartComparison playerAttributes={p.attributes} playerPosition={p.position} isMatchContext={true} />
      </div>

      {/* Grid: Player Stats & Objectives Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Column 1 & 2: Detailed Performance Stats */}
        <div className="lg:col-span-2 bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2 text-[#00FF88] font-bold text-xs uppercase tracking-wider">
                <Star size={16} /> Player Performance Card
              </div>
              <span className="text-xs text-white/40 uppercase font-bold">
                ROLE: <span className="text-white font-black">{playerStatus}</span>
              </span>
            </div>

            {/* Rating Box */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="flex flex-col items-center justify-center bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-xl px-6 py-4 shrink-0 text-center w-full sm:w-auto">
                <span className="text-[10px] text-[#00FF88] font-bold uppercase tracking-widest mb-1">MATCH RATING</span>
                <span className="text-4xl font-black text-[#00FF88] tracking-tight">{playerStats.rating}</span>
                <span className="text-[9px] text-white/50 uppercase mt-1">/ 10.0</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                  <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">MINUTES</span>
                  <span className="text-lg font-black text-white">{playerStats.minutes}'</span>
                </div>
                {getPositionGroup(p.position || 'ST') === 'GK' ? (
                  <>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">SAVES</span>
                      <span className="text-lg font-black text-[#00FF88]">{playerStats.saves || 0}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">CLEAN SHEET</span>
                      <span className="text-lg font-black text-[#00FF88]">{oppScore === 0 ? 'YES' : 'NO'}</span>
                    </div>
                  </>
                ) : getPositionGroup(p.position || 'ST') === 'DEFENDER' ? (
                  <>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">TACKLES</span>
                      <span className="text-lg font-black text-[#00FF88]">{playerStats.tackles}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">G / A</span>
                      <span className="text-lg font-black text-[#00FF88]">{playerStats.goals + playerStats.assists}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">GOALS</span>
                      <span className="text-lg font-black text-[#00FF88]">{playerStats.goals}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">ASSISTS</span>
                      <span className="text-lg font-black text-[#00FF88]">{playerStats.assists}</span>
                    </div>
                  </>
                )}
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                  <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">PASS ACC.</span>
                  <span className="text-lg font-black text-white">
                    {playerStats.passesAttempted > 0 ? Math.round((playerStats.passesCompleted / playerStats.passesAttempted) * 100) : 100}%
                  </span>
                </div>
              </div>
            </div>

            {/* Manager Objectives Status */}
            <div>
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-3">Manager Objectives Status</span>
              <div className="space-y-2">
                {objectives.map((obj) => {
                  const passed = obj.check(playerStats, playerStats.rating);
                  return (
                    <div key={obj.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 text-xs">
                      <div className="flex items-center gap-3">
                        {passed ? (
                          <CheckCircle2 size={18} className="text-[#00FF88] shrink-0" />
                        ) : (
                          <AlertCircle size={18} className="text-red-400 shrink-0" />
                        )}
                        <span className="text-white/90">{obj.description}</span>
                      </div>
                      <span className={`font-bold px-2.5 py-0.5 rounded text-[10px] ${passed ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-red-500/20 text-red-400'}`}>
                        {passed ? 'COMPLETED' : 'FAILED'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Rewards & Financial Gains */}
        <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#00FF88] font-bold text-xs uppercase tracking-wider border-b border-white/10 pb-3 mb-4">
              <Award size={16} /> Career Rewards & Impact
            </div>

            <div className="space-y-3.5">
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins size={18} className="text-amber-400" />
                  <div>
                    <span className="text-[10px] text-white/40 font-bold uppercase block">CONTRACT BONUSES</span>
                    <span className="text-xs font-bold text-white">Appearance & Goals</span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#00FF88]">
                  +£{(p.contract?.appearanceBonus || 1500) + (playerStats.goals * (p.contract?.goalBonus || 500))}
                </span>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-[#00FF88]" />
                  <div>
                    <span className="text-[10px] text-white/40 font-bold uppercase block">MANAGER TRUST</span>
                    <span className="text-xs font-bold text-white">Objectives Bonus</span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#00FF88]">
                  +{objectives.filter(o => o.check(playerStats, playerStats.rating)).length * 4 + 3} Trust
                </span>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-purple-400" />
                  <div>
                    <span className="text-[10px] text-white/40 font-bold uppercase block">FAN POPULARITY</span>
                    <span className="text-xs font-bold text-white">Match Impact</span>
                  </div>
                </div>
                <span className="text-xs font-black text-purple-400">
                  +{(playerStats.goals * 6) + 5} Fans
                </span>
              </div>
            </div>

            {/* Quick Post-Match Media Quote */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <span className="text-[10px] text-white/50 font-bold uppercase block mb-2">Flash Press Question</span>
              <p className="text-xs text-white/80 mb-2 font-sans italic">"What are your thoughts on today's performance?"</p>
              <div className="space-y-1.5">
                {[
                  "Gave 100% for the team (+Fans)",
                  "Tactical execution was spot on (+Trust)",
                  "We keep working hard for the next game"
                ].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInterviewAnswer(idx)}
                    className={`w-full text-left text-[11px] p-2 rounded border transition-all cursor-pointer ${
                      interviewAnswer === idx ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88]' : 'bg-black/40 border-white/10 text-white/70'
                    }`}
                  >
                    {ans}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleClaimAndExit}
            disabled={hasClaimed}
            className="w-full mt-6 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black py-4 px-6 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#00FF88]/20 cursor-pointer active:scale-95 disabled:opacity-50 min-h-[44px]"
          >
            CONTINUE TO DASHBOARD <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

import { getFlavorText } from "../utils/matchEngineUtils";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { Player } from '../types';
import { CLUBS } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { motion, AnimatePresence } from 'motion/react';
import { updateProgressionState } from '../utils/careerSystems';
import {
  Trophy, CheckCircle2, ArrowRight, Zap, Coins, Users, Award,
  Activity, Flame, Shield, Star, Play, Pause, FastForward, Sparkles,
  Clock, Target, Compass, Crosshair, ChevronRight, MessageSquare, BarChart3, AlertCircle
} from 'lucide-react';

interface MatchObjective {
  id: string;
  description: string;
  targetText: string;
  rewardTrust: number;
  rewardXP: number;
  check: (stats: any, rating: number) => boolean;
}

interface DecisionOption {
  text: string;
  attrKey: 'finishing' | 'passing' | 'dribbling' | 'composure' | 'pace' | 'tackling' | 'vision';
  attrName: string;
  risk: 'LOW' | 'MED' | 'HIGH';
  description: string;
}

interface KeyDecision {
  minute: number;
  title: string;
  situation: string;
  options: DecisionOption[];
}

export function MatchEngine() {
  const { state, advanceDay, setScreen, setPlayer, setInbox } = useGame();
  const p = state.player;

  if (!p) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white font-mono">
        <p className="text-xl font-bold mb-4">No Active Player Found</p>
        <button onClick={() => setScreen('HUB')} className="px-6 py-2 bg-[#00FF88] text-black font-bold rounded">
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

  // Weather & Pitch Condition Generator
  const weather = useMemo(() => {
    const list = [
      { name: '☀️ SUNNY & CLEAR', desc: 'Optimal pitch conditions for fast passing', temp: '21°C' },
      { name: '🌧️ HEAVY RAIN', desc: 'Slippery pitch, increased shot speed & tackle risks', temp: '12°C' },
      { name: '⛅ PARTLY CLOUDY', desc: 'Mild atmosphere, balanced conditions', temp: '16°C' },
      { name: '❄️ CRISP COLD', desc: 'Chilly afternoon, high intensity required', temp: '6°C' }
    ];
    return list[Math.floor(Math.random() * list.length)];
  }, []);

  // Procedural Match Objectives
  const objectives = useMemo<MatchObjective[]>(() => {
    const pos = p.position || 'ST';
    const isAttacker = ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(pos);

    if (isAttacker) {
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
          description: 'Complete 15+ Accurate Passes',
          targetText: '15+ Passes',
          rewardTrust: 3,
          rewardXP: 80,
          check: (s) => s.passesCompleted >= 15
        }
      ];
    } else {
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
          description: 'Win 2+ Defensive Tackles or Interceptions',
          targetText: '2+ Tackles',
          rewardTrust: 5,
          rewardXP: 120,
          check: (s) => s.tackles >= 2
        },
        {
          id: 'obj_3',
          description: 'Maintain >80% Pass Accuracy',
          targetText: '>80% Pass Acc.',
          rewardTrust: 4,
          rewardXP: 90,
          check: (s) => s.passesAttempted > 0 && (s.passesCompleted / s.passesAttempted) >= 0.8
        }
      ];
    }
  }, [p.position]);

  // Match State
  const [phase, setPhase] = useState<'PRE_MATCH' | 'IN_MATCH' | 'HALF_TIME' | 'FULL_TIME'>('PRE_MATCH');
  const [mindset, setMindset] = useState<'ATTACKING' | 'BALANCED' | 'HIGH_PRESS' | 'COUNTER'>('BALANCED');

  // In-Match State
  const [minute, setMinute] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 4 | 'PAUSED'>(2);
  const [userScore, setUserScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);

  const [playerStats, setPlayerStats] = useState({
    minutes: 0,
    rating: 6.0,
    goals: 0,
    assists: 0,
    passesCompleted: 0,
    passesAttempted: 0,
    keyPasses: 0,
    tackles: 0,
    shots: 0,
    shotsOnTarget: 0,
    distanceCovered: 0.0
  });

  const [stamina, setStamina] = useState<number>(100 - ((typeof p.fatigue === 'number' && !isNaN(p.fatigue) ? p.fatigue : 0) / 2));
  const [momentum, setMomentum] = useState<number>(0); // -10 to +10
  const [activeDecision, setActiveDecision] = useState<KeyDecision | null>(null);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  const [commentaryLogs, setCommentaryLogs] = useState<{ minute: number; text: string; type: 'info' | 'highlight' | 'goal_user' | 'goal_opp' }[]>([
    { minute: 0, text: `Kickoff at ${isHome ? 'Home Ground' : 'Away Stadium'}. High anticipation in the stands!`, type: 'info' }
  ]);

  // Pitch radar ball coordinates (0-100 x, 0-100 y)
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [phaseText, setPhaseText] = useState<string>('MIDFIELD BUILD-UP');

  // Media Interview State at end
  const [interviewAnswer, setInterviewAnswer] = useState<number | null>(null);
  const [hasClaimed, setHasClaimed] = useState(false);

  // Scheduled Key Decisions for the match
  const scheduledDecisions = useRef<Record<number, KeyDecision>>({
    18: {
      minute: 18,
      title: "18' · THROUGH BALL BREAKOUT",
      situation: "You spot an open pocket of space behind the opponent's defensive line!",
      options: [
        { text: "Unleash Power Shot Towards Goal", attrKey: 'finishing', attrName: 'Finishing', risk: 'MED', description: 'Direct strike testing the goalkeeper' },
        { text: "Slide Precise Through Pass", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Set up your teammate for a high-chance shot' },
        { text: "Skill Dribble Past Defender", attrKey: 'dribbling', attrName: 'Dribbling', risk: 'HIGH', description: 'Take on the defender 1-on-1 for maximum glory' }
      ]
    },
    38: {
      minute: 38,
      title: "38' · EDGE OF THE BOX CHANCE",
      situation: "A loose clearance falls right to your feet 20 yards from goal!",
      options: [
        { text: "Curled Finesse Shot", attrKey: 'finishing', attrName: 'Finishing', risk: 'MED', description: 'Aim for the top corner with delicate touch' },
        { text: "Quick One-Two Combination", attrKey: 'vision', attrName: 'Vision', risk: 'LOW', description: 'Quick pass and move into the penalty area' },
        { text: "Drive Forward with Speed", attrKey: 'pace', attrName: 'Pace', risk: 'HIGH', description: 'Sprint past the defender into the 6-yard box' }
      ]
    },
    62: {
      minute: 62,
      title: "62' · HIGH PRESS INTERCEPTION",
      situation: "The opponent defender hesitates under pressure near their penalty box!",
      options: [
        { text: "Aggressive Slide Tackle", attrKey: 'tackling', attrName: 'Tackling', risk: 'HIGH', description: 'Attempt a crunching tackle to dispossess' },
        { text: "Jockey and Intercept Pass", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Read the passing lane calmly' },
        { text: "Sprint Press Keeper", attrKey: 'pace', attrName: 'Pace', risk: 'MED', description: 'Force a rushed kick out of bounds' }
      ]
    },
    82: {
      minute: 82,
      title: "82' · LATE GAME DECISIVE MOMENT",
      situation: "Late match tension! A counter-attack opportunity develops down the flank!",
      options: [
        { text: "Whipped Cross Into Box", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Deliver a high ball for the striker to head' },
        { text: "Cut Inside and Shoot", attrKey: 'finishing', attrName: 'Finishing', risk: 'HIGH', description: 'Search for a dramatic winning goal yourself' },
        { text: "Hold Up Play & Retain Possession", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Manage the game clock safely' }
      ]
    }
  });

  // Start Simulation
  const handleStartMatch = () => {
    setPhase('IN_MATCH');
    setMinute(1);
  };

  // Main Simulation Loop
  useEffect(() => {
    if (phase !== 'IN_MATCH' || simSpeed === 'PAUSED' || activeDecision !== null) {
      return;
    }

    const intervalTime = simSpeed === 4 ? 120 : simSpeed === 2 ? 300 : 600;

    const timer = setInterval(() => {
      setMinute((prevMin) => {
        const nextMin = prevMin + 1;

        // Half Time Check
        if (nextMin === 45) {
          setPhase('HALF_TIME');
          setSimSpeed('PAUSED');
          setCommentaryLogs(prev => [
            { minute: 45, text: `Half Time whistle! Score: ${userClub.symbol} ${userScore} - ${oppScore} ${oppClub.symbol}`, type: 'info' },
            ...prev
          ]);
          return 45;
        }

        // Full Time Check
        if (nextMin >= 90) {
          setPhase('FULL_TIME');
          setSimSpeed('PAUSED');
          setCommentaryLogs(prev => [
            { minute: 90, text: `Full Time whistle! Final Score: ${userClub.symbol} ${userScore} - ${oppScore} ${oppClub.symbol}`, type: 'info' },
            ...prev
          ]);
          return 90;
        }

        // Check for Scheduled Key Decision Moment
        if (scheduledDecisions.current[nextMin] && playerStatus !== 'UNUSED') {
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

        // Random team events
        if (Math.random() < 0.04) {
          // Opponent Goal Chance
          if (Math.random() < 0.35) {
            addGoalsOpp = 1;
            setOppScore(s => s + 1);
            setMomentum(m => Math.max(-10, m - 3));
            setCommentaryLogs(prev => [
              { minute: nextMin, text: getFlavorText('goal_opp', '', oppClub.name), type: 'goal_opp' },
              ...prev
            ]);
          } else {
            setCommentaryLogs(prev => [
              { minute: nextMin, text: getFlavorText('chance_opp', '', oppClub.name), type: 'highlight' },
              ...prev
            ]);
          }
        } else if (Math.random() < 0.05) {
          // Teammate Goal Chance
          if (Math.random() < 0.30) {
            addGoalsUser = 1;
            setUserScore(s => s + 1);
            setMomentum(m => Math.min(10, m + 3));
            setCommentaryLogs(prev => [
              { minute: nextMin, text: getFlavorText('chance_user', '', userClub.name), type: 'goal_user' },
              ...prev
            ]);
          }
        }

        // Player Passive Stats Update
        if (playerStatus !== 'UNUSED') {
          setPlayerStats(prev => {
            const isAtt = pitchX > 50;
            const passInc = Math.random() < 0.35 ? 1 : 0;
            const passAcc = Math.random() < 0.82 ? passInc : 0;
            const tackleInc = Math.random() < 0.08 ? 1 : 0;

            const ratingDelta = (addGoalsUser ? 0.3 : 0) + (passAcc ? 0.05 : 0) - (addGoalsOpp ? 0.1 : 0);
            const nextRating = Math.min(9.9, Math.max(5.0, Number((prev.rating + ratingDelta).toFixed(1))));

            return {
              ...prev,
              minutes: nextMin,
              passesAttempted: prev.passesAttempted + passInc,
              passesCompleted: prev.passesCompleted + passAcc,
              tackles: prev.tackles + tackleInc,
              distanceCovered: Number((prev.distanceCovered + 0.12).toFixed(2)),
              rating: nextRating
            };
          });

          // Drain Stamina
          const drain = mindset === 'HIGH_PRESS' ? 0.8 : mindset === 'ATTACKING' ? 0.6 : 0.45;
          setStamina(s => Math.max(10, Number((s - drain).toFixed(1))));
        }

        return nextMin;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [phase, simSpeed, activeDecision, playerStatus, userClub.symbol, oppClub.symbol, oppClub.name, userClub.name, mindset]);

  // Handle Interactive Key Moment Option Choice
  const handleMakeDecision = (opt: DecisionOption) => {
    if (!activeDecision) return;

    const playerAttrVal = (p.attributes as any)[opt.attrKey] || 70;
    const baseChance = playerAttrVal / 100;
    const riskPenalty = opt.risk === 'HIGH' ? 0.25 : opt.risk === 'MED' ? 0.12 : 0.02;

    const finalSuccessChance = Math.max(0.2, Math.min(0.92, baseChance - riskPenalty + (stamina / 500)));
    const isSuccess = Math.random() < finalSuccessChance;

    if (isSuccess) {
      if (opt.attrKey === 'finishing') {
        // Goal scored!
        setUserScore(s => s + 1);
        setPlayerStats(prev => ({
          ...prev,
          goals: prev.goals + 1,
          shots: prev.shots + 1,
          shotsOnTarget: prev.shotsOnTarget + 1,
          rating: Math.min(9.9, Number((prev.rating + 0.9).toFixed(1)))
        }));
        setMomentum(m => Math.min(10, m + 4));
        setCommentaryLogs(prev => [
          { minute: activeDecision.minute, text: getFlavorText('goal_user', p.lastName, '', opt.text), type: 'goal_user' },
          ...prev
        ]);
        setLastActionResult(`✅ SUCCESSFUL ACTION: GOAL SCORED! (+0.9 Rating)`);
      } else if (opt.attrKey === 'passing' || opt.attrKey === 'vision') {
        // Assist or Key Pass
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
            { minute: activeDecision.minute, text: getFlavorText('assist', p.lastName), type: 'goal_user' },
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
            { minute: activeDecision.minute, text: getFlavorText('key_pass', p.lastName), type: 'highlight' },
            ...prev
          ]);
          setLastActionResult(`✅ SUCCESSFUL ACTION: KEY PASS DELIVERED! (+0.3 Rating)`);
        }
      } else if (opt.attrKey === 'tackling') {
        setPlayerStats(prev => ({
          ...prev,
          tackles: prev.tackles + 1,
          rating: Math.min(9.9, Number((prev.rating + 0.4).toFixed(1)))
        }));
        setCommentaryLogs(prev => [
          { minute: activeDecision.minute, text: getFlavorText('tackle', p.lastName), type: 'highlight' },
          ...prev
        ]);
        setLastActionResult(`✅ SUCCESSFUL ACTION: DISPOSSESSED OPPONENT! (+0.4 Rating)`);
      } else {
        setPlayerStats(prev => ({
          ...prev,
          rating: Math.min(9.9, Number((prev.rating + 0.3).toFixed(1)))
        }));
        setCommentaryLogs(prev => [
          { minute: activeDecision.minute, text: getFlavorText('skill', p.lastName, '', opt.text), type: 'highlight' },
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
        { minute: activeDecision.minute, text: getFlavorText('miss', p.lastName, '', opt.text), type: 'info' },
        ...prev
      ]);
      setLastActionResult(`⚠️ ATTEMPT UNSUCCESSFUL: Dispossessed / Saved (-0.2 Rating)`);
    }

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
      if (Math.random() < 0.4) extraUserGoals += 1;
      if (Math.random() < 0.3) extraOppGoals += 1;
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

    // Trust & Fan Gains
    let trustChange = totalTrustBonus;
    if (matchOutcome === 'WON') trustChange += 3;
    else if (matchOutcome === 'LOST') trustChange -= 2;

    const newTrust = Math.max(0, Math.min(100, p.trust + trustChange));
    let newFans = p.fans + (playerStats.goals * 6) + (playerStats.assists * 4) + (playerStats.rating >= 7.5 ? 8 : 2);

    // Interview Impact
    if (interviewAnswer === 0) newFans += 5; // Fan favorite response
    if (interviewAnswer === 1) trustChange += 3; // Manager loyal response

    newFans = Math.max(0, Math.min(100, newFans));

    // Contract bonus earnings
    let appBonus = 0;
    let goalBonus = 0;
    if (!isBenched && !isIntl) {
      if (p.contract?.appearanceBonus) appBonus = p.contract.appearanceBonus;
      if (p.contract?.goalBonus && playerStats.goals > 0) goalBonus = p.contract.goalBonus * playerStats.goals;
    }
    const totalEarnings = appBonus + goalBonus;
    const newBalance = p.finances.balance + totalEarnings;

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

    // Save state
    setPlayer({
      ...p,
      trust: newTrust,
      fans: newFans,
      fatigue: newFatigue,
      sharpness: newSharpness,
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
      progression: nextProgResult.progression
    });

    setInbox(inboxList);

    // Return to Hub and advance calendar day
    setScreen('HUB');
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
            <span className="text-xs text-[#00FF88] font-bold uppercase">{weather.name}</span>
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
                <span className="text-xs font-bold text-white block">{p.firstName} {p.lastName}</span>
                <span className="text-[10px] text-white/50 block font-bold">
                  G: <span className="text-[#00FF88]">{playerStats.goals}</span> | A: <span className="text-[#00FF88]">{playerStats.assists}</span> | Pass: {playerStats.passesCompleted}/{playerStats.passesAttempted}
                </span>
              </div>
            </div>

            <div className="text-right min-w-[100px]">
              <span className="text-[9px] text-white/40 font-bold block mb-1">STAMINA</span>
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all ${stamina > 50 ? 'bg-[#00FF88]' : stamina > 25 ? 'bg-amber-400' : 'bg-red-500'}`}
                  style={{ width: `${stamina}%` }}
                />
              </div>
            </div>
          </div>
        </div>

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
      <div className="w-full text-white flex flex-col font-mono select-none items-center justify-center py-12">
        <div className="max-w-xl w-full bg-[#0e0e0e] border border-white/15 rounded-2xl p-6 shadow-2xl text-center">
          <span className="text-xs text-[#00FF88] font-bold uppercase tracking-widest block mb-2">45' HALF TIME INTERVAL</span>
          <h2 className="text-3xl font-black text-white mb-6">
            {userClub.symbol} {userScore} - {oppScore} {oppClub.symbol}
          </h2>

          {/* Half time manager feedback */}
          <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-6 text-left">
            <span className="text-[10px] text-white/40 font-bold uppercase block mb-1">MANAGER's TALK</span>
            <p className="text-sm text-white/90">
              {userScore > oppScore
                ? "Excellent first half performance. Keep pressing them in their half and don't lose focus!"
                : userScore === oppScore
                ? "It's tight out there. Pick your moments carefully and control the midfield tempo."
                : "We are behind. We need higher intensity and faster decision-making in the final third!"}
            </p>
          </div>

          <button
            onClick={() => {
              setPhase('IN_MATCH');
              setSimSpeed(2);
            }}
            className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-black py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00FF88]/20"
          >
            RESUME SECOND HALF <ArrowRight size={18} />
          </button>
        </div>
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
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                  <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">GOALS</span>
                  <span className="text-lg font-black text-[#00FF88]">{playerStats.goals}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                  <span className="text-[9px] text-white/40 font-bold uppercase block mb-1">ASSISTS</span>
                  <span className="text-lg font-black text-[#00FF88]">{playerStats.assists}</span>
                </div>
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
            className="w-full mt-6 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black py-4 px-6 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#00FF88]/20 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            Collect Rewards & Exit <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

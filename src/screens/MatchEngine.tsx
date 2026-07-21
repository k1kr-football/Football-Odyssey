import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { CoreFormulas } from '../utils/coreFormulas';
import { Player } from '../types';
import { CLUBS } from '../data/teams';
import { resolveAction, generateCommentary } from '../utils/matchEngine';
import { MATCH_SITUATIONS, MatchSituation } from '../data/matchSituations';
import { TeamLogo } from '../components/TeamLogo';
import { getScaledAttributeGain, updateProgressionState, checkStoryArcProgression } from '../utils/careerSystems';
import { getGatingStatus, getClubInterestScore, initializeInterestTracking } from '../utils/transfers';
import { updateCareerIdentity } from '../utils/managerPhilosophy';
import { applyMatchdayRitual } from '../utils/matchdayRituals';
import { getRoleById, getManagerTacticalFit } from '../data/roles';
import { generateWeatherAndPitch } from '../utils/weatherPitch';
import { initializeActiveRehab } from '../utils/wellbeingEngine';

export function MatchEngine() {
 const { state, advanceDay, setScreen, setPlayer, setInbox } = useGame();

 if (!state.player) return null;

 const [isBenched, setIsBenched] = useState(
   state.nextMatch?.playerStatus === 'SUBSTITUTE' || 
   state.nextMatch?.playerStatus === 'UNUSED' ||
   state.player.contract?.status === 'Backup' ||
   state.player.contract?.status === 'Exile'
 );
 const [hasBeenSubbedOn, setHasBeenSubbedOn] = useState(false);
 const [warmupLevel, setWarmupLevel] = useState(0);
 
 const [minute, setMinute] = useState(0);
 const [matchPhase, setMatchPhase] = useState<'PRE_TALK' | 'PRE' | 'PLAYING' | 'HALF_TIME_TALK' | 'FULL_TIME_TALK' | 'POST_MATCH_SUMMARY' | 'POST'>('PRE_TALK');
 const [preMatchStep, setPreMatchStep] = useState(0);
 
 const [logs, setLogs] = useState<{m: number, text: string, isPlayerFeature: boolean, isOpp: boolean, fail: boolean}[]>([]);
 const [homeScore, setHomeScore] = useState(0);
 const [awayScore, setAwayScore] = useState(0);
 const [teamMomentum, setTeamMomentum] = useState(50);
 const [playerMomentum, setPlayerMomentum] = useState(50);
 const [matchPressure, setMatchPressure] = useState(3);
 
 const [isDecisionFrame, setIsDecisionFrame] = useState(false);
 const [decisionOptions, setDecisionOptions] = useState<any[]>([]);
 const [currentHint, setCurrentHint] = useState<string | null>(null);
 
 // Real-time Match Stats
 const [matchRating, setMatchRating] = useState(6.0);
 const [distanceCovered, setDistanceCovered] = useState(0.0);
 const [passesMade, setPassesMade] = useState(0);
 const [passesCompleted, setPassesCompleted] = useState(0);
 const [shotsAttempted, setShotsAttempted] = useState(0);
 const [dribblesAttempted, setDribblesAttempted] = useState(0);
 const [tacklesAttempted, setTacklesAttempted] = useState(0);
 
 // Heat Map Touch Points & Situation Rotation Buffer
 const [touchPoints, setTouchPoints] = useState<{ x: number, y: number, eventType: string }[]>([]);
 const recentSituationIdsRef = useRef<string[]>([]);
 
 // Helper to record pitch touch points
 const recordTouchPoint = (eventType: string) => {
   const isGK = state.player?.position === 'GK';
   const pos = state.player?.position || 'ST';
   let x = 50;
   let y = 50;

   if (isGK) {
     x = Math.floor(Math.random() * 15) + 5;
     y = Math.floor(Math.random() * 40) + 30;
   } else if (eventType === 'SHOT') {
     x = Math.floor(Math.random() * 20) + 75;
     y = Math.floor(Math.random() * 50) + 25;
   } else if (eventType === 'DRIBBLE' || eventType === 'CROSS') {
     x = Math.floor(Math.random() * 30) + 55;
     y = pos.includes('L') ? Math.floor(Math.random() * 25) + 10 : pos.includes('R') ? Math.floor(Math.random() * 25) + 65 : Math.floor(Math.random() * 40) + 30;
   } else if (eventType === 'TACKLE') {
     x = Math.floor(Math.random() * 40) + 25;
     y = Math.floor(Math.random() * 60) + 20;
   } else {
     x = Math.floor(Math.random() * 40) + 35;
     y = Math.floor(Math.random() * 60) + 20;
   }

   setTouchPoints(prev => [...prev.slice(-15), { x, y, eventType }]);
 };

 // Buffs from Pre-match
 const [activeBuff, setActiveBuff] = useState<string>('NONE');
 const [talkResponse, setTalkResponse] = useState<'POSITIVE' | 'MUTED' | 'FRUSTRATED' | null>(null);

 // Weather & Pitch
 const [weather, setWeather] = useState<any>(null);
 const [pitch, setPitch] = useState<any>(null);
 
 // Half-time
 const [halfTimeMood, setHalfTimeMood] = useState<string>('');
 const [halfTimeMessage, setHalfTimeMessage] = useState<string>('');

 const logsEndRef = useRef<HTMLDivElement>(null);
 
 useEffect(() => {
 logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [logs]);

 // Generate Weather on Mount
 useEffect(() => {
 if (matchPhase === 'PRE_TALK' && !weather) {
  const clubSymbol = state.player?.currentClubSymbol || 'MUN';
  const week = state.currentWeek || 1;
  const conditions = generateWeatherAndPitch(clubSymbol, week);
  
  setWeather(conditions.weather);
  setPitch(conditions.pitch);
  
  // Insert custom match conditions commentary log if possible
  setLogs([{ m: 0, text: `KICKOFF CONDITIONS: ${conditions.commentaryHook} Temperature: ${conditions.tempCelsius}°C.`, isPlayerFeature: false, isOpp: false, fail: false }]);
 }
 }, [matchPhase, weather, state.player?.currentClubSymbol, state.currentWeek]);

 useEffect(() => {
 if (state.player?.isTutorialMode && matchPhase === 'PRE_TALK') {
  // Tutorial specific overrides
  setHomeScore(1);
  setAwayScore(1);
  setMinute(88);
  setMatchPhase('PLAYING');
  setLogs([{ m: 88, text: "TUTORIAL: The game is tied. You've just been subbed on for the dying minutes.", isPlayerFeature: false, isOpp: false, fail: false }]);
 }
 }, [state.player?.isTutorialMode, matchPhase]);

 useEffect(() => {
 if (matchPhase !== 'PLAYING') return;
 
 if (minute === 45 && !state.player?.isTutorialMode) {
  setTeamMomentum(50);
  setPlayerMomentum(50);
  setMatchPhase('HALF_TIME_TALK');
  return;
 }

 if (minute >= 90) {
  setMatchPhase('FULL_TIME_TALK');
  return;
 }
 
 if (isDecisionFrame) return;

 const timer = setTimeout(() => {
  progressMatch();
 }, 1500);
 
 return () => clearTimeout(timer);
 }, [minute, isDecisionFrame, matchPhase]);

 useEffect(() => {
 if (matchPhase !== 'POST') return;

 if (minute >= 90) {
  const timer = setTimeout(() => {
  setMatchPhase('FULL_TIME_TALK');
  }, 2000);
  return () => clearTimeout(timer);
 }

 const timer = setTimeout(() => {
  const nextMinute = Math.min(90, minute + Math.floor(Math.random() * 8) + 4);
  setMinute(nextMinute);

  const roll = Math.random();
  if (roll < 0.10) {
  setAwayScore(s => s + 1);
  setLogs(prev => [...prev, { m: nextMinute, text: "Goal for the opposition! They exploit the space.", isPlayerFeature: false, isOpp: true, fail: false }]);
  } else if (roll < 0.20) {
  setHomeScore(s => s + 1);
  setLogs(prev => [...prev, { m: nextMinute, text: "GOAL! Our team scores a beautiful goal from a counter-attack!", isPlayerFeature: false, isOpp: false, fail: false }]);
  } else {
  const commentaryOptions = [
   "Possession contested heavily in midfield.",
   "Tactical battle intensifies as both managers make adjustments.",
   "Solid defensive clearance blocks an incoming cross.",
   "The referee calls for a foul. Play slows down.",
   "Spectators are on their feet as the tension mounts.",
   "A speculative shot flies wide of the target."
  ];
  const randomComment = commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)];
  setLogs(prev => [...prev, { m: nextMinute, text: randomComment, isPlayerFeature: false, isOpp: false, fail: false }]);
  }

  if (nextMinute >= 90) {
  setLogs(prev => [...prev, { m: 90, text: "Full time whistle blows! The match has concluded.", isPlayerFeature: false, isOpp: false, fail: false }]);
  }
 }, 600);

 return () => clearTimeout(timer);
 }, [minute, matchPhase]);

 const pickRandomEvent = (): import('../types').MatchEventType => {
  const tactic = state.player?.tacticalInstruction?.current?.instruction;
  let weights = [
   { type: 'GENERAL_PLAY', w: 30 }, { type: 'SHOT', w: 15 }, 
   { type: 'DRIBBLE', w: 20 }, { type: 'PASS', w: 15 },
   { type: 'TACKLE', w: 10 }, { type: 'CROSS', w: 5 }, { type: 'SET_PIECE', w: 5 }
  ];

  if (tactic === 'PRESS HIGH' || tactic === 'TRACK BACK') {
   weights = weights.map(item => item.type === 'TACKLE' ? { ...item, w: 25 } : item);
  } else if (tactic === 'CUT INSIDE') {
   weights = weights.map(item => item.type === 'DRIBBLE' || item.type === 'SHOT' ? { ...item, w: item.w + 10 } : item);
  } else if (tactic === 'STAY WIDE' || tactic === 'OVERLAP') {
   weights = weights.map(item => item.type === 'CROSS' || item.type === 'DRIBBLE' ? { ...item, w: item.w + 10 } : item);
  } else if (tactic === 'DROP DEEP' || tactic === 'HOLD POSITION') {
   weights = weights.map(item => item.type === 'PASS' || item.type === 'GENERAL_PLAY' ? { ...item, w: item.w + 10 } : item);
  }

  const total = weights.reduce((acc, curr) => acc + curr.w, 0);
  let roll = Math.random() * total;
  for (const item of weights) {
   if (roll < item.w) return item.type as any;
   roll -= item.w;
  }
  return 'GENERAL_PLAY';
 };

 const progressMatch = () => {
 if (!state.player) return;
 
 let time_increment = Math.floor(Math.random() * 4) + 2; // 2 to 5 minutes
 let nextMinute = minute + time_increment;
 if (minute < 45 && nextMinute >= 45) {
  nextMinute = 45;
  setLogs(prev => [...prev, { m: 45, text: "Half time whistle blows. Players head down the tunnel.", isPlayerFeature: false, isOpp: false, fail: false }]);
 }
 else if (nextMinute >= 90) {
  nextMinute = 90;
  setLogs(prev => [...prev, { m: 90, text: "Full time whistle blows. It's all over.", isPlayerFeature: false, isOpp: false, fail: false }]);
 }
 
 setMinute(nextMinute);

 if (isBenched) {
  setDistanceCovered(d => d + (time_increment / 90) * 1); // minimal distance covered while on bench
  
  const awayClubSymbol = state.nextMatch?.opponentSymbol || 'OPP';
  const roll = Math.random();
  if (roll < 0.08) {
   setAwayScore(s => s + 1);
   setLogs(prev => [...prev, { m: nextMinute, text: `Goal for ${awayClubSymbol}! Their winger finds a gap in our defense.`, isPlayerFeature: false, isOpp: true, fail: false }]);
  } else if (roll < 0.16) {
   setHomeScore(s => s + 1);
   setLogs(prev => [...prev, { m: nextMinute, text: "GOAL! Our striker smashes it into the top corner after a brilliant setup!", isPlayerFeature: false, isOpp: false, fail: false }]);
  } else {
   const benchCommentary = [
    "Midfield battle intensifies with tough tackles flyin' in.",
    "Our captain screams instructions from the pitch.",
    "Opponent manager gestures wildly from his technical area.",
    "The referee blows for a tactical foul. Play slows down.",
    "A stunning save from our goalkeeper denies a certain goal!",
    "We launch a dangerous cross, but their center back clears it away.",
    "The crowd sings and drums echo across the stadium."
   ];
   const comment = benchCommentary[Math.floor(Math.random() * benchCommentary.length)];
   setLogs(prev => [...prev, { m: nextMinute, text: comment, isPlayerFeature: false, isOpp: false, fail: false }]);
  }

  // Substitution happens between 55 and 75 minutes, higher chance if warmed up!
  const subThreshold = 0.35 + (warmupLevel / 200); 
  if (nextMinute >= 55 && nextMinute < 85 && !hasBeenSubbedOn && !isDecisionFrame && Math.random() < subThreshold) {
   setIsDecisionFrame(true);
   setDecisionOptions([
    { text: "RUN ONTO THE PITCH", risk: "low", type: "sub_on_confirm", desc: "Fasten your boots, replace your teammate, and make an impact!" }
   ]);
   setCurrentHint("The manager gestures to you. 'Get your shirt on, you are going on!'");
  }
  return;
 }

 setDistanceCovered(d => d + (time_increment / 90) * 11); // Average ~11km per 90
 
 if (isDecisionFrame) return;

 // Resolve injuries
 const playerFatigue = state.player.fatigue + (minute / 90 * 40);
 const contextRisk = teamMomentum < 30 ? 0.3 : 0.1;
 const injuryRisk = CoreFormulas.calculateInjuryProbability(
   playerFatigue,
   3, // standard susceptibility
   contextRisk,
   state.difficulty || 'STANDARD',
   state.player.age
 );
 if (!state.player.isInjured && Math.random() < injuryRisk) {
  setIsDecisionFrame(true);
  setDecisionOptions([
   { text: "SIGNAL TO COME OFF", risk: "low", type: "sub", desc: "Protect your body, but manager may see you as weak." },
   { text: "WAVE AWAY PHYSIO", risk: "high", type: "play_on", desc: "Play through pain. Massive trust boost, high injury risk." }
  ]);
  setLogs(prev => [...prev, { m: nextMinute, text: "You take a heavy challenge and feel a twinge. The physio is looking over.", isPlayerFeature: false, isOpp: false, fail: false }]);
  return;
 }

 // Determine event
 const eventType = pickRandomEvent();
 const involvementChance = Math.max(10, Math.min(80, (state.player.ovr - 50) + (state.player.form * 2) + 15));
 
 if (Math.random() * 100 <= involvementChance) {
    // Player involved
    const oppClub = CLUBS.find(c => c.symbol === state.nextMatch?.opponentSymbol);
    const oppOVR = oppClub ? oppClub.ovr : 75;

    // Dynamic Pressure rises based on late game closeness and rivalry
    const isDerby = state.nextMatch?.matchType === 'DERBY' || state.nextMatch?.matchType === 'FINAL';
    const closeness = Math.abs(homeScore - awayScore);
    let currentPressure = isDerby ? 5 : 2;
    if (nextMinute > 75 && closeness <= 1) currentPressure += 3;
    if (nextMinute > 85 && closeness === 0) currentPressure += 2;
    setMatchPressure(currentPressure);

    // Filter valid situations with GK isolation & No-repeat buffer
    const isGK = state.player?.position === 'GK';
    const validSits = MATCH_SITUATIONS.filter(s => {
       if (isGK) {
          return s.category === 'GOALKEEPER' || s.validPositions.includes('GK');
       } else {
          if (s.category === 'GOALKEEPER') return false;
          return s.validPositions.includes('ALL') || s.validPositions.includes(state.player?.position || 'ST');
       }
    });

    // Determine event & record touch point
    const eventType = pickRandomEvent();
    recordTouchPoint(eventType);
    
    // 15% chance to trigger a formal decision situation
    if (Math.random() < 0.15 && validSits.length > 0 && !isDecisionFrame) {
        const unplayedSits = validSits.filter(s => !recentSituationIdsRef.current.includes(s.id));
        const pool = unplayedSits.length > 0 ? unplayedSits : validSits;
        const sit = pool[Math.floor(Math.random() * pool.length)];
        recentSituationIdsRef.current = [sit.id, ...recentSituationIdsRef.current].slice(0, 10);

        setIsDecisionFrame(true);
        setDecisionOptions(sit.choices.map(c => ({
            text: c.text,
            risk: c.difficultyMod > 5 ? 'high' : (c.difficultyMod < 0 ? 'low' : 'medium'),
            type: 'SITUATION',
            choiceData: c,
            sitData: sit
        })));
        setCurrentHint(sit.description);
        return; // Pause match engine for decision
    }

    // resolveAction imported globally
    // Setup buffs based on preMatchStep choices
    let preMatchBuffs = {};
    if (minute <= 30 && activeBuff === 'TECHNICAL') {
       preMatchBuffs = { shotBonus: 0.08, dribbleBonus: 0.08 };
    }
    if (state.player.buffs?.setPieceReliability) {
       preMatchBuffs = { ...preMatchBuffs, setPieceBonus: 0.05 };
    }

    const actionResult = resolveAction(eventType, state.player!, { 
       oppOVR, 
       fatigue: playerFatigue, 
       momentum: teamMomentum, 
       isHome: state.nextMatch?.isHome || false,
       pressure: currentPressure,
       squadChemistry: state.player?.squadChemistry || 50,
       minute: nextMinute,
       weather: weather,
       pitch: pitch
    } as any, preMatchBuffs);

    const comment = generateCommentary(eventType, actionResult.outcome, state.player!, {
       oppOVR,
       fatigue: playerFatigue,
       momentum: teamMomentum,
       isHome: state.nextMatch?.isHome || false,
       pressure: currentPressure,
       squadChemistry: state.player?.squadChemistry || 50,
       minute: nextMinute,
       weather: weather,
       pitch: pitch
    } as any);

    const isFail = actionResult.outcome === 'FAILURE' || actionResult.outcome === 'CRITICAL_FAILURE';
    
    if (eventType === 'SHOT') setShotsAttempted(s => s + 1);
    if (eventType === 'DRIBBLE') setDribblesAttempted(s => s + 1);
    if (eventType === 'TACKLE') setTacklesAttempted(s => s + 1);
    if (eventType === 'PASS') {
       setPassesMade(p => p + 1);
       if (!isFail) setPassesCompleted(p => p + 1);
    }
    
    setLogs(prev => [...prev, { m: nextMinute, text: comment, isPlayerFeature: true, isOpp: false, fail: isFail }]);

    // Apply momentum & metrics
    if (actionResult.outcome === 'CRITICAL_SUCCESS' || actionResult.outcome === 'SUCCESS') {
       if (eventType === 'SHOT') { setHomeScore(s => s + 1); setTeamMomentum(m => Math.min(100, m + 15)); setMatchRating(r => Math.min(10.0, r + 0.8)); }
       if (eventType === 'DRIBBLE') { setTeamMomentum(m => Math.min(100, m + 2)); setMatchRating(r => Math.min(10.0, r + 0.2)); }
       if (eventType === 'PASS') { setPassesCompleted(p => p + 1); setTeamMomentum(m => Math.min(100, m + 3)); setMatchRating(r => Math.min(10.0, r + 0.3)); }
       if (eventType === 'TACKLE') { setTeamMomentum(m => Math.min(100, m + 2)); setMatchRating(r => Math.min(10.0, r + 0.2)); }
       if (eventType !== 'SHOT' && eventType !== 'TACKLE' && eventType !== 'DRIBBLE') setPassesMade(p => p + 1);
    } else {
       if (eventType === 'SHOT') { setTeamMomentum(m => Math.max(0, m - 10)); setMatchRating(r => Math.max(4.0, r - 0.5)); }
       if (eventType === 'PASS' || eventType === 'DRIBBLE') { setTeamMomentum(m => Math.max(0, m - 5)); setMatchRating(r => Math.max(4.0, r - 0.2)); }
       if (eventType === 'TACKLE') { setTeamMomentum(m => Math.max(0, m - 3)); setMatchRating(r => Math.max(4.0, r - 0.3)); }
    }
  } else {
  // Teammate / Opponent action
  const oppClubForSim = CLUBS.find(c => c.symbol === state.nextMatch?.opponentSymbol);
  const oppOVRForSim = oppClubForSim ? oppClubForSim.ovr : 75;
  const isStudiedForSim = state.nextMatch?.scoutReportStudied;
  const selectedStrategyForSim = state.nextMatch?.selectedStrategy;
  const hasCorrectCounter = isStudiedForSim && (
    (oppOVRForSim >= 85 && selectedStrategyForSim === 'EXPOSE_HIGH_LINE') ||
    (oppOVRForSim >= 70 && oppOVRForSim < 85 && selectedStrategyForSim === 'TARGET_FLANKS') ||
    (oppOVRForSim < 70 && selectedStrategyForSim === 'HIGH_PRESS')
  );
  const isMismatched = isStudiedForSim && selectedStrategyForSim && selectedStrategyForSim !== 'BALANCED' && !hasCorrectCounter;

  const oppGoalThreshold = hasCorrectCounter ? 0.05 : (isMismatched ? 0.14 : 0.10);
  const teamGoalThreshold = hasCorrectCounter ? 0.15 : (isMismatched ? 0.07 : 0.10);

  if (Math.random() > 0.5) {
    const opRoll = Math.random();
    if (opRoll < oppGoalThreshold) {
     setAwayScore(s => s + 1);
     setTeamMomentum(m => Math.max(0, m - 15));
     setLogs(prev => [...prev, { m: nextMinute, text: "Goal for the opposition. Defense caught sleeping.", isPlayerFeature: false, isOpp: true, fail: false }]);
    } else if (opRoll < 0.3) {
     setTeamMomentum(m => Math.max(0, m - 5));
     setLogs(prev => [...prev, { m: nextMinute, text: "Dangerous attack from the opposition ends with a shot just wide.", isPlayerFeature: false, isOpp: true, fail: false }]);
    } else {
     setLogs(prev => [...prev, { m: nextMinute, text: "Opposition retaining possession well in midfield.", isPlayerFeature: false, isOpp: true, fail: false }]);
    }
  } else {
    const tRoll = Math.random();
    if (tRoll < teamGoalThreshold) {
     setHomeScore(s => s + 1);
     setTeamMomentum(m => Math.min(100, m + 15));
     setLogs(prev => [...prev, { m: nextMinute, text: "GOAL! Brilliant team move finished off nicely by your teammate.", isPlayerFeature: false, isOpp: false, fail: false }]);
    } else {
     const texts = [
     "Teammate makes a strong tackle.",
     "Good sequence of passing from the team.",
     "Cross whipped in, but cleared away.",
     "Midfield battle. Scrappy fouls disrupting the flow."
     ];
     setLogs(prev => [...prev, { m: nextMinute, text: texts[Math.floor(Math.random() * texts.length)], isPlayerFeature: false, isOpp: false, fail: false }]);
    }
  }
 }
 };

 const handleDecision = (option: any) => {
 setIsDecisionFrame(false);
 
 if (option.type === "sub_on_confirm") {
  setLogs(prev => [...prev, { m: minute, text: "SUB ON: You run onto the pitch, replace your teammate, and get a roaring round of applause from the travelling fans!", isPlayerFeature: true, isOpp: false, fail: false }]);
  setIsBenched(false);
  setHasBeenSubbedOn(true);
  return;
 }
 
 if (option.type === "sub") {
  setLogs(prev => [...prev, { m: minute, text: "You signal to the bench. Subbed off to protect your body.", isPlayerFeature: true, isOpp: false, fail: false }]);
  // Immediately end match for player
  setMatchPhase('POST');
  return;
 }
 
 if (option.type === "SITUATION") {
    const oppClub = CLUBS.find(c => c.symbol === state.nextMatch?.opponentSymbol);
    const oppOVR = oppClub ? oppClub.ovr : 75;
    
    // Pass difficultyMod to resolveAction or just adjust pressure
    const eventType = option.choiceData.actionType;
    const actionResult = resolveAction(eventType, state.player!, { 
       oppOVR, 
       fatigue: state.player?.fatigue || 0, 
       momentum: teamMomentum, 
       isHome: state.nextMatch?.isHome || false,
       pressure: matchPressure + (option.sitData.pressureMod || 0) + (option.choiceData.difficultyMod > 0 ? 2 : -2),
       squadChemistry: state.player?.squadChemistry || 50,
       minute: minute,
       weather: weather,
       pitch: pitch
    } as any, {});

    const isSuccess = actionResult.outcome === 'SUCCESS' || actionResult.outcome === 'CRITICAL_SUCCESS';
    const commentTexts = isSuccess ? option.choiceData.successTexts : option.choiceData.failureTexts;
    const comment = commentTexts[Math.floor(Math.random() * commentTexts.length)];
    
    setLogs(prev => [...prev, { m: minute, text: comment, isPlayerFeature: true, isOpp: false, fail: !isSuccess }]);

    if (isSuccess) {
       if (eventType === 'SHOT') { setHomeScore(s => s + 1); setTeamMomentum(m => Math.min(100, m + 15)); setMatchRating(r => Math.min(10.0, r + 0.8)); }
       if (eventType === 'DRIBBLE') { setTeamMomentum(m => Math.min(100, m + 2)); setMatchRating(r => Math.min(10.0, r + 0.2)); }
       if (eventType === 'PASS') { setPassesCompleted(p => p + 1); setTeamMomentum(m => Math.min(100, m + 3)); setMatchRating(r => Math.min(10.0, r + 0.3)); }
       if (eventType === 'TACKLE') { setTeamMomentum(m => Math.min(100, m + 2)); setMatchRating(r => Math.min(10.0, r + 0.2)); }
    } else {
       if (eventType === 'SHOT') { setTeamMomentum(m => Math.max(0, m - 10)); setMatchRating(r => Math.max(4.0, r - 0.5)); }
       if (eventType === 'PASS' || eventType === 'DRIBBLE') { setTeamMomentum(m => Math.max(0, m - 5)); setMatchRating(r => Math.max(4.0, r - 0.2)); }
       if (eventType === 'TACKLE') { setTeamMomentum(m => Math.max(0, m - 3)); setMatchRating(r => Math.max(4.0, r - 0.3)); }
    }
    
    return;
 }

 if (option.type === "play_on") {
  const injureRoll = Math.random() < 0.6;
  if (injureRoll) {
  setLogs(prev => [...prev, { m: minute, text: "You try to play on but pull up instantly. Forced off injured.", isPlayerFeature: true, isOpp: false, fail: true }]);
  if (state.player) {
   setPlayer({ ...state.player, isInjured: true, fatigue: 100, trust: Math.min(100, state.player.trust + 10) });
  }
  setMatchPhase('POST');
  } else {
  setLogs(prev => [...prev, { m: minute, text: "Grit your teeth and run it off! Manager loves the desire.", isPlayerFeature: true, isOpp: false, fail: false }]);
  if (state.player) {
   setPlayer({ ...state.player, trust: Math.min(100, state.player.trust + 15) });
  }
  }
  return;
 }
 
 if (option.type === "sub_reaction") {
  if (option.outcome === "good") {
  setLogs(prev => [...prev, { m: minute, text: "Professional response. High-five the manager.", isPlayerFeature: true, isOpp: false, fail: false }]);
  if (state.player) setPlayer({ ...state.player, trust: Math.min(100, state.player.trust + 5) });
  } else {
  setLogs(prev => [...prev, { m: minute, text: "You kick a water bottle and march down the tunnel. The crowd gasps.", isPlayerFeature: true, isOpp: false, fail: true }]);
  if (state.player) {
   setPlayer({ 
    ...state.player, 
    trust: Math.max(0, state.player.trust - 15),
    reputation: { ...state.player.reputation, world: Math.max(0, state.player.reputation.world - 2) },
    morale: Math.max(0, state.player.morale - 10)

  });
  }
  setMatchPhase('POST');
  return;
 }

 if (option.type === "leadership" || option.type === "freelance" || option.type === "discipline" || option.type === "chemistry") {
  let p = state.player!;
  if (option.type === "chemistry") {
   setLogs(prev => [...prev, { m: minute, text: "Telepathic connection! You completely unpick the defense without even looking.", isPlayerFeature: true, isOpp: false, fail: false }]);
   setPassesCompleted(pts => pts + 1);
   setPlayerMomentum(m => Math.min(10, m + 8));
   setMatchRating(r => Math.min(10.0, r + 0.6));
   return;
  }
  if (option.type === "discipline") {
  setLogs(prev => [...prev, { m: minute, text: "You hold the tactical line. The opposition attack breaks down.", isPlayerFeature: true, isOpp: false, fail: false }]);
  setTeamMomentum(m => Math.min(100, m + 5));
  } else if (option.type === "freelance") {
  if (Math.random() < 0.4) {
   setLogs(prev => [...prev, { m: minute, text: "You drop deep, get the ball, and drive forward! Fantastic initiative.", isPlayerFeature: true, isOpp: false, fail: false }]);
   setPlayerMomentum(m => Math.min(100, m + 10));
   setTeamMomentum(m => Math.min(100, m + 10));
  } else {
   setLogs(prev => [...prev, { m: minute, text: "You abandon shape and lose the ball. Large gaps left behind.", isPlayerFeature: true, isOpp: false, fail: true }]);
   setPlayer({ ...p, trust: Math.max(0, p.trust - 10) });
  }
  } else {
  if (activeBuff === 'LEADERSHIP') {
   setLogs(prev => [...prev, { m: minute, text: "You rally the troops! The whole team lifts their intensity.", isPlayerFeature: true, isOpp: false, fail: false }]);
   setTeamMomentum(100);
  } else {
   setLogs(prev => [...prev, { m: minute, text: "You shout instructions, but no one seems to listen.", isPlayerFeature: true, isOpp: false, fail: true }]);
  }
  }
  return;
 }
 
 // Technical checks
 let p = state.player!;
 const attrVal = p.attributes[option.stat as keyof typeof p.attributes] || 50;
 
 // Match Simulation Realism: Factor player's overall rating difference vs opposition
 const oppClub = CLUBS.find(c => c.symbol === state.nextMatch?.opponentSymbol);
 const oppOVR = oppClub ? oppClub.ovr : 75;
 const playerOVR = p.ovr;
 const ovrDiffModifier = (playerOVR - oppOVR) * 0.01; // e.g., +10 OVR gap = +10% chance
 
 let playerFatigue = p.fatigue + (minute / 90 * 40);
 if (state.nextMatch?.scoutReportStudied && state.nextMatch?.selectedStrategy === 'HIGH_PRESS') {
  playerFatigue += 10; // High Pressing costs more stamina/fatigue
 }
 const fatiguePenalty = playerFatigue > 80 ? 0.2 : (playerFatigue > 60 ? 0.1 : 0);
 
 // Base chances (tuned to increase systemic difficulty)
 let baseChance = option.risk === "high" ? 0.22 : option.risk === "medium" ? 0.42 : 0.62;
 if (activeBuff === 'TECHNICAL') baseChance += 0.10;

 // Tactical Strategy Modifier from Scout Report
 let tacticalStrategyModifier = 0;
 if (state.nextMatch?.scoutReportStudied) {
  tacticalStrategyModifier += 0.03; // baseline preparedness buff
  
  const selectedStrategy = state.nextMatch?.selectedStrategy;
  if (selectedStrategy === 'EXPOSE_HIGH_LINE') {
   if (oppOVR >= 85) {
    if (option.stat === 'pace' || option.stat === 'dribbling') {
     tacticalStrategyModifier += 0.12;
    }
   } else {
    if (option.stat === 'pace' || option.stat === 'dribbling') {
     tacticalStrategyModifier += 0.02;
    }
   }
  } else if (selectedStrategy === 'TARGET_FLANKS') {
   if (oppOVR >= 70 && oppOVR < 85) {
    if (option.stat === 'passing' || option.stat === 'vision') {
     tacticalStrategyModifier += 0.12;
    }
   } else {
    if (option.stat === 'passing' || option.stat === 'vision') {
     tacticalStrategyModifier += 0.02;
    }
   }
  } else if (selectedStrategy === 'HIGH_PRESS') {
   if (oppOVR < 70) {
    if (option.stat === 'tackling' || option.stat === 'positioning') {
     tacticalStrategyModifier += 0.12;
    }
   } else {
    if (option.stat === 'tackling' || option.stat === 'positioning') {
     tacticalStrategyModifier += 0.02;
    }
   }
  }
 }
 baseChance += tacticalStrategyModifier;
 
 // Calculate if player is rested (no match in last 6 days)
 const matchesInLast6Days = state.seasonCalendar?.filter(e => {
  if (e.type !== 'MATCH') return false;
  const diffWeeks = state.currentWeek - e.week;
  if (diffWeeks < 0 || diffWeeks > 1) return false;
  const daysArr = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const currentIdx = daysArr.indexOf(state.currentDay);
  const targetIdx = daysArr.indexOf(e.day);
  const totalDaysDiff = (diffWeeks * 7) + (currentIdx - targetIdx);
  return totalDaysDiff > 0 && totalDaysDiff <= 6; // strictly past 6 days
 }) || [];
 
 const isRested = matchesInLast6Days.length === 0;
 if (isRested) baseChance += 0.05; // 5% rested buff
 
 baseChance -= fatiguePenalty; // Fatigue degrades choice quality
 baseChance += ovrDiffModifier; // Scaling against opposition quality
 
 const formPenalty = p.form < 4 ? 0.15 : (p.form < 6 ? 0.05 : 0);
 baseChance -= formPenalty;
 
 const pressure = state.nextMatch?.pressure || 5;
 
 // Pressure Cooker System - Gameplay Effects
 if (pressure >= 8) {
  // High Pressure: +15% to Composure checks, -20% to mistakes (punished harder)
  // We'll treat high composure players as rising to occasion (+15%), low as struggling
  const composureModifier = p.attributes.composure >= 70 ? 0.15 : -0.15;
  baseChance += composureModifier;
 } else if (pressure <= 3) {
  // Low Pressure: +10% to Flair actions (dribbling, risky passes)
  if (option.stat === 'dribbling' || option.risk === 'high') {
   baseChance += 0.10;
  }
 }
 
 let rivalryMod = 0;
 if (state.nextMatch?.matchType === 'DERBY') {
  if (state.player?.stateFlags?.historyFlags?.hasDerbyHero) rivalryMod = 10;
  else rivalryMod = 5;
 } else if (state.nextMatch?.matchType === 'GRUDGE') {
  rivalryMod = 5;
 }
 
 const baseProb = CoreFormulas.calculateSuccessProbability(
   attrVal + rivalryMod,
   oppOVR + (option.risk === 'high' ? 10 : option.risk === 'low' ? -10 : 0),
   state.difficulty || 'STANDARD',
   {
     pressure: pressure >= 8 ? 'HIGH' : pressure <= 3 ? 'LOW' : 'NORMAL',
     staminaPercent: 100 - p.fatigue
   }
 );
 
 let momentumMod = 0;
 if (teamMomentum > 70) momentumMod = 0.10;
 if (teamMomentum < 30) momentumMod = -0.10;
 
 const successChance = Math.max(0, Math.min(100, (baseProb + momentumMod) * 100)); // clamp
 
 const roll = Math.random() * 100;
 const isSuccess = roll < successChance;
 
 if (option.stat === "finishing") setShotsAttempted(s => s + 1);
 else if (option.stat === "passing" || option.stat === "vision") setPassesMade(p => p + 1);
 else if (option.stat === "dribbling" || option.stat === "pace") setDribblesAttempted(s => s + 1);
 else if (option.stat === "tackling") setTacklesAttempted(s => s + 1);
 
 if (isSuccess) {
  setPlayerMomentum(m => Math.min(100, m + 10));
  setTeamMomentum(m => Math.min(100, m + 10));
  setMatchRating(r => Math.min(10.0, r + 0.4));
  
  let successSuffix = "";
  if (state.nextMatch?.matchType === 'DERBY') {
   successSuffix = " The fans are chanting your name. You're a hero in the derby!";
   p = {
    ...p,
    fans: Math.min(100, p.fans + 15),
    trust: Math.min(100, p.trust + 10),
    mediaPerception: Math.min(100, p.mediaPerception + 10)
   };
   setPlayer(p);

  } else if (pressure >= 8) {
   successSuffix = " The noise is deafening. You're rising to the occasion!";
  } else if (pressure <= 3) {
   successSuffix = " A nice piece of skill in a relaxed atmosphere.";
  }

  if (option.stat === "finishing") {
  setHomeScore(s => s + 1);
  setLogs(prev => [...prev, { m: minute, text: "BRILLIANT! You made the right choice and scored!" + successSuffix, isPlayerFeature: true, isOpp: false, fail: false }]);
  } else if (option.stat === "vision" || option.stat === "passing") {
  setPassesCompleted(pts => pts + 1);
  setLogs(prev => [...prev, { m: minute, text: "Superb vision! You sliced them open." + successSuffix, isPlayerFeature: true, isOpp: false, fail: false }]);
  } else {
  setLogs(prev => [...prev, { m: minute, text: `Great execution. Won the duel and read the game perfectly.` + successSuffix, isPlayerFeature: true, isOpp: false, fail: false }]);
  }
 } else {
  const isHighPressure = pressure >= 8;
  const penaltyMult = isHighPressure ? 1.2 : (pressure <= 3 ? 0.8 : 1.0); // Punished harder or less

  setPlayerMomentum(m => Math.max(0, m - (5 * penaltyMult)));
  setTeamMomentum(m => Math.max(0, m - (5 * penaltyMult)));
  setMatchRating(r => Math.max(4.0, r - (0.4 * penaltyMult)));
  
  let failSuffix = "";

  if (state.nextMatch?.matchType === 'DERBY') {
   p = {
    ...p,
    fans: Math.max(0, p.fans - 10),
    trust: Math.max(0, p.trust - 10),
    mediaPerception: Math.max(0, p.mediaPerception - 10)
   };
   setPlayer(p);
   failSuffix = " The crowd groans. You feel the immense weight of the occasion.";
  } else if (pressure <= 3) {
   failSuffix = " The stakes are low, but the manager is still watching.";
  }

  // Consequence compounding
  if (option.risk === "high" && p.form < 6) {
   failSuffix = " You are trying too hard and the manager is losing patience.";
   p = {
    ...p,
    trust: Math.max(0, p.trust - 5),
    morale: Math.max(0, p.morale - 5)
   };
   setPlayer(p);

  }

  if (option.stat === "finishing") {
   setLogs(prev => [...prev, { m: minute, text: "Poor finish. The chance is wasted." + failSuffix, isPlayerFeature: true, isOpp: false, fail: true }]);
  } else if (option.risk === "high" && option.stat === "tackling") {
   setLogs(prev => [...prev, { m: minute, text: "Foul! You mistimed the sliding tackle completely. Yellow card." + failSuffix, isPlayerFeature: true, isOpp: false, fail: true }]);
   setMatchRating(r => Math.max(4.0, r - 0.8));
  } else {
   setLogs(prev => [...prev, { m: minute, text: "Lost possession. Defender read you easily." + failSuffix, isPlayerFeature: true, isOpp: false, fail: true }]);
  }
 }
 };

 const getPreMatchOptions = () => {
 if (!state.player) return [];
 const pos = state.player.position || 'ST';
 const ovr = state.player.ovr || 60;
 const trust = state.player.trust || 50;

 if (preMatchStep === 0) {
  if (pos === 'GK') {
  return [
   {
   key: 'reflexes',
   title: 'Reflex Reaction Drills',
   desc: 'Perform high-intensity reflex saves against rapid tennis balls. Sharpens reaction times and hand-eye coordination.',
   effects: '+Reflexes & Composure, -Energy',
   bonusText: '+Dexterity / +Composure / +10% Fatigue'
   },
   {
   key: 'kick',
   title: 'Long Kicking & Distribution',
   desc: 'Practice pinging 50-yard passes to outfield runners. Perfect for starting counterattacks.',
   effects: '+Passing & Vision, Light Workload',
   bonusText: '+Passing / +Vision / +5% Fatigue'
   }
  ];
  } else if (pos === 'CB' || pos === 'LB' || pos === 'RB') {
  return [
   {
   key: 'def_aerial',
   title: 'Aerial Challenge Battles',
   desc: 'Practice physical collisions and clearing headers under heavy pressure. Prepared for target-man strikers.',
   effects: '+Strength & Tackling, High Intensity',
   bonusText: '+Strength / +Tackling / +12% Fatigue'
   },
   {
   key: 'def_position',
   title: 'Tactical Positioning Walkthrough',
   desc: 'A light-intensity session focusing on structural defensive shape and offside-trap timing.',
   effects: '+Positioning & Mindset, Conserves Stamina',
   bonusText: '+Positioning / Conserves Energy'
   }
  ];
  } else if (pos === 'CM' || pos === 'LM' || pos === 'RM' || pos === 'AM') {
  return [
   {
   key: 'mid_passing',
   title: 'One-Touch Passing Triangles',
   desc: 'Move in continuous triangles, maintaining high tempo and sharp first-touch control.',
   effects: '+Passing & First Touch, Sharp Control',
   bonusText: '+Passing / +First Touch / +8% Fatigue'
   },
   {
   key: 'mid_shuttle',
   title: 'High-Intensity Shuttle Runs',
   desc: 'Complete rapid bleep tests to build stamina and cover every blade of grass.',
   effects: '+Stamina & Work Rate, High Fatigue',
   bonusText: '+Stamina / +Work Rate / +14% Fatigue'
   }
  ];
  } else { // Forward (ST, LW, RW)
  return [
   {
   key: 'fw_finishing',
   title: 'Finishing from Crosses',
   desc: 'Whip shots into the top corners from crossing wingers. Maximizes clinical goal scoring.',
   effects: '+Finishing & Composure, Focus Clinical',
   bonusText: '+Finishing / +Composure / +10% Fatigue'
   },
   {
   key: 'fw_dribbling',
   title: 'Agility Dribbling Gauntlet',
   desc: 'Weave through speed cones and tight slalom gates to build initial speed off the mark.',
   effects: '+Dribbling & Pace, Sharp Agility',
   bonusText: '+Dribbling / +Pace / +10% Fatigue'
   }
  ];
  }
 } else if (preMatchStep === 1) {
  if (ovr < 65) {
  return [
   {
   key: 'study',
   title: 'Study Senior Veterans',
   desc: 'Listen intently to the tactical instructions of the veteran captain. Safe playstyle.',
   effects: '+Positioning, +Manager Trust',
   bonusText: '+Positioning / +5 Trust'
   },
   {
   key: 'scout',
   title: 'Scout Spotlight Mentality',
   desc: 'Visualize showboating and catching the eye of the scouts in the VIP boxes.',
   effects: '+Morale, +Fans, -Manager Trust (Arrogance)',
   bonusText: '+10 Morale / +200 Followers / -5 Trust'
   }
  ];
  } else if (ovr <= 75) {
  return [
   {
   key: 'reassure',
   title: 'Reassure the Manager',
   desc: 'Look the manager in the eye and guarantee that you will execute the match plan perfectly.',
   effects: '+Manager Trust, +Composure Boost',
   bonusText: '+8 Trust / +1 Composure'
   },
   {
   key: 'isolate',
   title: 'Headphones On & Focus',
   desc: 'Isolate yourself with a pump-up playlist to zone out crowd speculation and press noise.',
   effects: '+Personal Morale, +Composure Boost',
   bonusText: '+12 Morale / +1 Composure'
   }
  ];
  } else { // Superstar OVR > 75
  return [
   {
   key: 'speech',
   title: 'Deliver Pre-Match Hype Speech',
   desc: 'Stand on the locker room bench and fire up the boys with an inspiring, passionate speech.',
   effects: '+Teammate Bond, +Squad Morale',
   bonusText: '+10 Teammate relation / +8 Morale'
   },
   {
   key: 'armband',
   title: 'Demand Captain\'s Armband',
   desc: 'Assert yourself and ask the manager to lead the squad today as captain. Requires High Trust.',
   effects: 'High Trust (>70) Unlocks Armband & Fans. Rejection reduces trust.',
   bonusText: trust > 70 ? 'SUCCESS LIKELY (+500 Followers)' : 'RISKY (Potential -15 Trust)'
   }
  ];
  }
 } else {
  // Step 2: Tactical Instructions
  if (pos === 'GK' || pos === 'CB' || pos === 'LB' || pos === 'RB') {
  return [
   {
   key: 'track_back',
   title: "Manager's Instruction: Stay Disciplined",
   desc: "Focus entirely on maintaining defensive shape and not getting caught out of position.",
   effects: '+Tactical Adaptation, +Manager Trust',
   bonusText: '+5 Tactical Adaptation / +2 Trust'
   },
   {
   key: 'press_high',
   title: "Manager's Instruction: Press Aggressively",
   desc: "Push up and close down space immediately, stepping out of the defensive line.",
   effects: '+Tactical Adaptation, -Stamina',
   bonusText: '+5 Tactical Adaptation / +10% Fatigue'
   }
  ];
  } else if (pos === 'ST') {
  return [
   {
   key: 'drop_deep',
   title: "Manager's Instruction: Drop Deep",
   desc: "Drop into the midfield to link play and drag the center backs out.",
   effects: '+Tactical Adaptation, +Passing',
   bonusText: '+5 Tactical Adaptation / +1 Passing'
   },
   {
   key: 'take_risks',
   title: "Manager's Instruction: Take Risks",
   desc: "Make risky runs in behind the defense, looking for the killer ball.",
   effects: '+Tactical Adaptation, +Pace',
   bonusText: '+5 Tactical Adaptation / +1 Pace'
   }
  ];
  } else {
  return [
   {
   key: 'stay_wide',
   title: "Manager's Instruction: Stay Wide",
   desc: "Hug the touchline to stretch the opposition defense.",
   effects: '+Tactical Adaptation, +Crossing',
   bonusText: '+5 Tactical Adaptation / +1 Crossing'
   },
   {
   key: 'cut_inside',
   title: "Manager's Instruction: Cut Inside",
   desc: "Drive inside into the half-spaces and look to shoot or create centrally.",
   effects: '+Tactical Adaptation, +Dribbling',
   bonusText: '+5 Tactical Adaptation / +1 Dribbling'
   }
  ];
  }
 }
 };

 const handlePreMatchChoice = (type: string) => {
 if (!state.player) return;
 let nextPlayer = { ...state.player } as Player;
 const pos = nextPlayer.position;
 const trust = nextPlayer.trust;

 // We can handle Tactical Instructions here if preMatchStep === 2
 if (preMatchStep === 2) {
  // Let's implement Tactical Instructions
  const instructionMap: Record<string, string> = {
   'stay_wide': 'STAY WIDE',
   'cut_inside': 'CUT INSIDE',
   'track_back': 'TRACK BACK',
   'press_high': 'PRESS HIGH',
   'drop_deep': 'DROP DEEP',
   'overlap': 'OVERLAP',
   'hold_position': 'HOLD POSITION',
   'take_risks': 'TAKE RISKS'
  };

  if (instructionMap[type]) {
   const instruction = instructionMap[type];
   const currentTactics = nextPlayer.tacticalInstruction || { current: null, history: [] };
   
   let adapt = currentTactics.current?.instruction === instruction ? currentTactics.current.adaptation + 5 : 20;
   let status: 'LEARNING' | 'MASTERED' | 'STRUGGLING' = adapt > 80 ? 'MASTERED' : adapt > 40 ? 'LEARNING' : 'STRUGGLING';

   currentTactics.current = {
    instruction,
    adaptation: adapt,
    status
   };
   currentTactics.history.push({
    match: `Week ${state.currentWeek}`,
    instruction,
    success: true, // simplified
    adaptationGain: 5 });

   nextPlayer.tacticalInstruction = currentTactics;

   if (status === 'MASTERED') {
    setActiveBuff('TACTICAL_MASTERCLASS');
   }
  }
 }



 switch(preMatchStep) {
  case 0: // Routine
  if (type === 'reflexes') {
   setActiveBuff('TECHNICAL');
   nextPlayer.attributes.agility = Math.min(99, (nextPlayer.attributes.agility || 50) + 1);
   nextPlayer.attributes.composure = Math.min(99, (nextPlayer.attributes.composure || 50) + 1);
   nextPlayer.fatigue = Math.min(100, nextPlayer.fatigue + 10);
  } else if (type === 'kick') {
   setActiveBuff('TECHNICAL');
   nextPlayer.attributes.passing = Math.min(99, (nextPlayer.attributes.passing || 50) + 1);
   nextPlayer.attributes.vision = Math.min(99, (nextPlayer.attributes.vision || 50) + 1);
   nextPlayer.fatigue = Math.min(100, nextPlayer.fatigue + 5);
  } else if (type === 'def_aerial') {
   setActiveBuff('FITNESS');
   nextPlayer.attributes.strength = Math.min(99, (nextPlayer.attributes.strength || 50) + 1);
   nextPlayer.attributes.tackling = Math.min(99, (nextPlayer.attributes.tackling || 50) + 1);
   nextPlayer.fatigue = Math.min(100, nextPlayer.fatigue + 12);
  } else if (type === 'def_position') {
   setActiveBuff('POSITIONING');
   nextPlayer.attributes.decisionMaking = Math.min(99, (nextPlayer.attributes.decisionMaking || 50) + 1);
   nextPlayer.fatigue = Math.max(0, nextPlayer.fatigue - 5);
  } else if (type === 'mid_passing') {
   setActiveBuff('TECHNICAL');
   nextPlayer.attributes.passing = Math.min(99, (nextPlayer.attributes.passing || 50) + 1);
   nextPlayer.attributes.firstTouch = Math.min(99, (nextPlayer.attributes.firstTouch || 50) + 1);
   nextPlayer.fatigue = Math.min(100, nextPlayer.fatigue + 8);
  } else if (type === 'mid_shuttle') {
   setActiveBuff('FITNESS');
   nextPlayer.attributes.stamina = Math.min(99, (nextPlayer.attributes.stamina || 50) + 1);
   nextPlayer.attributes.determination = Math.min(99, (nextPlayer.attributes.determination || 50) + 1);
   nextPlayer.fatigue = Math.min(100, nextPlayer.fatigue + 14);
  } else if (type === 'fw_finishing') {
   setActiveBuff('TECHNICAL');
   nextPlayer.attributes.finishing = Math.min(99, (nextPlayer.attributes.finishing || 50) + 1);
   nextPlayer.attributes.composure = Math.min(99, (nextPlayer.attributes.composure || 50) + 1);
   nextPlayer.fatigue = Math.min(100, nextPlayer.fatigue + 10);
  } else if (type === 'fw_dribbling') {
   setActiveBuff('TECHNICAL');
   nextPlayer.attributes.dribbling = Math.min(99, (nextPlayer.attributes.dribbling || 50) + 1);
   nextPlayer.attributes.pace = Math.min(99, (nextPlayer.attributes.pace || 50) + 1);
   nextPlayer.fatigue = Math.min(100, nextPlayer.fatigue + 10);
  }
  break;
  case 1: // Mental
  if (type === 'study') {
   setActiveBuff('POSITIONING');
   nextPlayer.attributes.decisionMaking = Math.min(99, (nextPlayer.attributes.decisionMaking || 50) + 1);
   nextPlayer.trust = Math.min(100, nextPlayer.trust + 5);
  } else if (type === 'scout') {
   setActiveBuff('FOCUS');
   nextPlayer.morale = Math.min(100, nextPlayer.morale + 10);
   nextPlayer.socialMedia.followers += 200;
   nextPlayer.trust = Math.max(0, nextPlayer.trust - 5);
  } else if (type === 'reassure') {
   setActiveBuff('FOCUS');
   nextPlayer.trust = Math.min(100, nextPlayer.trust + 8);
   nextPlayer.attributes.composure = Math.min(99, (nextPlayer.attributes.composure || 50) + 1);
  } else if (type === 'isolate') {
   setActiveBuff('FOCUS');
   nextPlayer.morale = Math.min(100, nextPlayer.morale + 12);
   nextPlayer.attributes.composure = Math.min(99, (nextPlayer.attributes.composure || 50) + 1);
  } else if (type === 'speech') {
   setActiveBuff('LEADERSHIP');
   nextPlayer.relationships.teammates = Math.min(100, nextPlayer.relationships.teammates + 10);
   nextPlayer.morale = Math.min(100, nextPlayer.morale + 8);
  } else if (type === 'armband') {
   setActiveBuff('LEADERSHIP');
   if (nextPlayer.trust > 70) {
   nextPlayer.morale = Math.min(100, nextPlayer.morale + 15);
   nextPlayer.socialMedia.followers += 500;
   } else {
   nextPlayer.trust = Math.max(0, nextPlayer.trust - 15);
   }
  }
  break;
  case 2: // Tactical / Set Piece
  if (type === 'mark_star') {
   setActiveBuff('FITNESS');
   nextPlayer.attributes.decisionMaking = Math.min(99, (nextPlayer.attributes.decisionMaking || 50) + 1);
   nextPlayer.attributes.tackling = Math.min(99, (nextPlayer.attributes.tackling || 50) + 1);
   nextPlayer.trust = Math.min(100, nextPlayer.trust + 5);
  } else if (type === 'overlap_instruct') {
   const isGk = nextPlayer.position === 'GK';
   if (isGk) {
   nextPlayer.attributes.composure = Math.min(99, (nextPlayer.attributes.composure || 50) + 1);
   nextPlayer.relationships.teammates = Math.min(100, nextPlayer.relationships.teammates + 5);
   } else {
   nextPlayer.attributes.dribbling = Math.min(99, (nextPlayer.attributes.dribbling || 50) + 1);
   nextPlayer.fatigue = Math.min(100, nextPlayer.fatigue + 10);
   }
  } else if (type === 'demand_set') {
   setActiveBuff('TECHNICAL');
   nextPlayer.attributes.finishing = Math.min(99, (nextPlayer.attributes.finishing || 50) + 1);
   if (nextPlayer.buffs) {
   nextPlayer.buffs.setPieceReliability = true;
   }
  } else if (type === 'beg_set') {
   if (nextPlayer.trust > 65) {
   nextPlayer.attributes.finishing = Math.min(99, (nextPlayer.attributes.finishing || 50) + 1);
   nextPlayer.morale = Math.min(100, nextPlayer.morale + 5);
   if (nextPlayer.buffs) {
    nextPlayer.buffs.setPieceReliability = true;
   }
   } else {
   nextPlayer.trust = Math.max(0, nextPlayer.trust - 10);
   }
  } else if (type === 'linkup') {
   nextPlayer.attributes.passing = Math.min(99, (nextPlayer.attributes.passing || 50) + 1);
   nextPlayer.relationships.teammates = Math.min(100, nextPlayer.relationships.teammates + 5);
  }
  break;
 }
 
 if (preMatchStep < 2) {
  setPlayer(nextPlayer);
  setPreMatchStep(s => s + 1);
 } else {
  let initLogs = [{ m: 0, text: "The whistle blows. Game on.", isPlayerFeature: false, isOpp: false, fail: false }];
  let currentMorale = nextPlayer.morale || 50;
  let currentSharpness = nextPlayer.sharpness || 50;
  
  const todaysCalendarEntry = state.seasonCalendar?.find(e => e.week === state.currentWeek && e.day === state.currentDay);
  const isEuropean = todaysCalendarEntry?.match?.competitionType === 'EUROPEAN';
  const isCup = todaysCalendarEntry?.match?.competitionType === 'DOMESTIC_CUP';

  const pressure = state.nextMatch?.pressure || 5;

  const isBigMatch = pressure >= 8;
  const matchModifier = isBigMatch ? (nextPlayer.attributes.composure > 80 ? 10 : -10) : 0;
  
  if (state.nextMatch?.matchType === 'DERBY' && state.nextMatch.rivalryName) {
   initLogs.push({ m: 1, text: `The stands are electric. This is the ${state.nextMatch.rivalryName}. Bragging rights for a year. Make your mark.`, isPlayerFeature: false, isOpp: false, fail: false });
  } else if (state.nextMatch?.matchType === 'GRUDGE') {
   initLogs.push({ m: 1, text: `You line up against your former club. There is definitely bad blood here.`, isPlayerFeature: true, isOpp: false, fail: false });
  } else if (pressure >= 8) {
   initLogs.push({ m: 1, text: `The stadium is a pressure cooker. The fans are screaming. Your palms are sweating. This is why you play.`, isPlayerFeature: false, isOpp: false, fail: false });
  } else if (pressure <= 3) {
   initLogs.push({ m: 1, text: `The atmosphere is relaxed. A good chance to express yourself.`, isPlayerFeature: false, isOpp: false, fail: false });
  } else if (isEuropean) {
   initLogs.push({ m: 1, text: `The European anthem rings out. The floodlights are bright. This is what you dreamed of.`, isPlayerFeature: false, isOpp: false, fail: false });
  } else if (isCup) {
   initLogs.push({ m: 1, text: `Cup night! The magic of the cup is in the air. Anything can happen.`, isPlayerFeature: false, isOpp: false, fail: false });
  }

  if (nextPlayer.fans < 20) {
  initLogs.push({ m: 1, text: "Wait... a section of the crowd is booing your every touch. The atmosphere is toxic.", isPlayerFeature: true, isOpp: false, fail: true });
  currentMorale = Math.max(0, currentMorale - 10 + matchModifier);
  currentSharpness = Math.max(0, currentSharpness - 5 + matchModifier);
  } else if (nextPlayer.fans > 80) {
  initLogs.push({ m: 1, text: "The stadium erupts as you get on the ball. They absolutely love you here!", isPlayerFeature: true, isOpp: false, fail: false });
  setPlayerMomentum(m => Math.min(10, m + 5));
  currentSharpness = Math.min(100, currentSharpness + 10 + matchModifier);
  }
  
  nextPlayer.morale = currentMorale;
  nextPlayer.sharpness = currentSharpness;

  setPlayer(nextPlayer);
  setLogs(initLogs);
  setMatchPhase('PLAYING');
 }
 };

 const handlePostMatchInterview = (type: string) => {
 if (!state.player) return;
 const p = { ...state.player };
 
 if (type === 'team') {
  p.relationships.teammates = Math.min(100, p.relationships.teammates + 10);
  p.trust = Math.min(100, p.trust + 5);
 } else if (type === 'fans') {
  p.fans = Math.min(100, p.fans + 15);
  p.relationships.teammates = Math.max(0, p.relationships.teammates - 5);
 } else if (type === 'referee') {
  p.fans = Math.min(100, p.fans + 10);
  p.trust = Math.max(0, p.trust - 15); // Manager hates excuses
 }
 
 setPlayer(p);
 finishMatch(p);
 };

 const finishMatch = (updatedPlayer = state.player) => {
 if (updatedPlayer) {
  const p = updatedPlayer;
  const goals = homeScore > 0 ? Math.floor(Math.random() * homeScore) : 0;
  const gameOutcome = homeScore > awayScore ? 'WON' : homeScore === awayScore ? 'DREW' : 'LOST';
  const scoreString = `${homeScore}-${awayScore}`;

  let milestoneTitle = `Match vs ${state.nextMatch?.opponentSymbol || 'OPP'}`;
  let milestoneDescription = `Ended ${scoreString}.`;
  
  if (isBenched) {
  milestoneTitle = `Unused Sub vs ${state.nextMatch?.opponentSymbol || 'OPP'}`;
  milestoneDescription = `Named on the bench, but remained an unused substitute in a ${scoreString} result.`;
  } else if (goals > 0) {
  milestoneTitle = goals === 1 ? `Crucial Match` : `Sensational Display`;
  milestoneDescription = `Bagged a goal in a ${scoreString} result.`;
  } else if (matchRating >= 7.5) {
  milestoneTitle = `Masterclass Display`;
  milestoneDescription = `Dominated the pitch with an immaculate rating of ${matchRating.toFixed(1)}.`;
  }

  const matchTimelineEvent = {
  id: `match_${Date.now()}`,
  week: state.currentWeek,
  day: state.currentDay,
  type: 'MILESTONE' as const,
  title: milestoneTitle,
  description: milestoneDescription,
  clubSymbol: p.startingClubSymbol
  };

  // Check records
  const isIntl = state.nextMatch?.competitionType === 'INTERNATIONAL';
  
  const newApps = (isBenched || isIntl) ? p.stats.apps : p.stats.apps + 1;
  const newGoals = (isBenched || isIntl) ? p.stats.goals : p.stats.goals + goals;
  const newAssists = (isBenched || isIntl) ? p.stats.assists : p.stats.assists + passesCompleted; // Simplification
  
  const newCaps = (!isBenched && isIntl) ? p.stats.caps + 1 : p.stats.caps;
  const newIntlGoals = (!isBenched && isIntl) ? (p.stats.intlGoals || 0) + goals : (p.stats.intlGoals || 0);

  let newTrust = p.trust;
  let newFans = p.fans;

  const newMilestones = [];
  const isCleanSheet = !isBenched && !isIntl && awayScore === 0;
  const currentCleanSheets = p.stateFlags?.cleanSheets || 0;
  const newCleanSheets = currentCleanSheets + (isCleanSheet ? 1 : 0);

  if (!isBenched) {
    if (!isIntl) {
      if (newApps === 1) newMilestones.push("Professional First-Team Debut");
      if (newApps === 50) newMilestones.push("50th Career Appearance");
      if (newApps === 100) newMilestones.push("Centurial 100th Career Appearance");
      if (newApps === 250) newMilestones.push("Legendary 250th Career Appearance");
      
      if (goals > 0 && p.stats.goals === 0) newMilestones.push("First Professional Goal");
      if (newGoals === 10 && p.stats.goals < 10) newMilestones.push("10th Career Goal");
      if (newGoals === 50 && p.stats.goals < 50) newMilestones.push("50th Career Goal");
      if (newGoals === 100 && p.stats.goals < 100) newMilestones.push("Centurial 100th Career Goal");
      if (goals >= 3) newMilestones.push("First Professional Hattrick");

      if (isCleanSheet) {
        if (newCleanSheets === 1 && currentCleanSheets < 1) newMilestones.push("First Professional Clean Sheet");
        if (newCleanSheets === 10 && currentCleanSheets < 10) newMilestones.push("10th Career Clean Sheet");
        if (newCleanSheets === 25 && currentCleanSheets < 25) newMilestones.push("25th Career Clean Sheet");
      }
    } else {
      if (newCaps === 1) newMilestones.push("International Debut");
      if (newCaps === 50) newMilestones.push("50th International Cap");
      if (newCaps === 100) newMilestones.push("100th International Cap");
      if (goals > 0 && (p.stats.intlGoals || 0) === 0) newMilestones.push("First International Goal");
      if (goals >= 3) newMilestones.push("International Hattrick");
    }
  }

  if (newMilestones.length > 0) {
    newFans += 25;
    newTrust = Math.min(100, newTrust + 15);
  }

  const personalMilestoneEvents = newMilestones.map((m, idx) => ({
    id: `ms_${Date.now()}_${idx}`,
    week: state.currentWeek,
    day: state.currentDay,
    type: 'MILESTONE' as const,
    title: `🏆 CAREER MILESTONE: ${m}`,
    description: `Achieved ${m} in a match against ${state.nextMatch?.opponentSymbol || 'OPP'}! (+25 Fans, +15 Board Trust)`,
    clubSymbol: p.startingClubSymbol
  }));

  let newDerbyStats = p.stats.derbyStats || { played: 0, totalRating: 0 };

  const outcomeChar = gameOutcome === 'WON' ? 'W' : gameOutcome === 'DREW' ? 'D' : 'L';
  const currentFormHistory = p.stateFlags?.openThreads?.formHistory || [];
  const updatedFormHistory = isBenched ? currentFormHistory : [outcomeChar, ...currentFormHistory].slice(0, 5);

  let stateFlags: any = { 
   ...p.stateFlags,
   cleanSheets: newCleanSheets,
   openThreads: {
   ...(p.stateFlags?.openThreads || {}),
   formHistory: updatedFormHistory,
   wasBenched: isBenched
   }
  };
  
  if (state.nextMatch?.competitionType === 'FRIENDLY' && stateFlags.preseasonEvaluation && !isBenched) {
    stateFlags.preseasonEvaluation = {
      ...stateFlags.preseasonEvaluation,
      friendlyAppearances: stateFlags.preseasonEvaluation.friendlyAppearances + 1,
      friendlyRatingsSum: stateFlags.preseasonEvaluation.friendlyRatingsSum + matchRating
    };
  } else if (state.nextMatch?.competitionType !== 'FRIENDLY' && !isIntl && stateFlags.midSeasonEvaluation && !isBenched) {
    stateFlags.midSeasonEvaluation = {
      ...stateFlags.midSeasonEvaluation,
      matchesPlayed: stateFlags.midSeasonEvaluation.matchesPlayed + 1,
      ratingsSum: stateFlags.midSeasonEvaluation.ratingsSum + matchRating
    };
  }

  const inboxList = [...state.inbox];
  
  const oldFans = newFans;

  if (!isBenched) {
  if (goals > 0) newFans += goals * 5;
  if (passesCompleted > 0) newFans += passesCompleted * 3;
  if (matchRating < 6.0) newFans -= 5;
  }

  const pressure = state.nextMatch?.pressure || 5;

  // --- SYSTEM 3: PRESSURE COOKER SYSTEM (Trust Impacts) ---
  let trustChange = 0;
  if (isBenched) {
   // Positive trust for staying supportive on the bench, more if warmed up!
   trustChange = 1 + Math.floor(warmupLevel / 35);
  } else {
   if (gameOutcome === 'WON') {
   if (pressure >= 8) trustChange = 10;
   else if (pressure >= 4) trustChange = 3;
   else trustChange = 1;
   } else if (gameOutcome === 'DREW') {
   if (pressure >= 8) trustChange = -5;
   else if (pressure >= 4) trustChange = 0;
   else trustChange = -3;
   } else { // LOST
   if (pressure >= 8) trustChange = -15;
   else if (pressure >= 4) trustChange = -5;
   else trustChange = -5;
   }
  }

  // Multiply by tactical fit bonus
  if (p.managerInfo?.tacticalSystem && p.roleSpecialization?.selectedRoleId) {
      const roleObj = getRoleById(p.roleSpecialization.selectedRoleId);
      if (roleObj) {
          const fit = getManagerTacticalFit(p.managerInfo.tacticalSystem, roleObj);
          if (trustChange > 0 && fit.bonus > 1) trustChange = Math.ceil(trustChange * fit.bonus);
          else if (trustChange < 0 && fit.bonus < 1) trustChange = Math.floor(trustChange / fit.bonus);
      }
  }

  newTrust = Math.max(0, Math.min(100, newTrust + trustChange));

  // --- SYSTEM 1: FORM STREAK SYSTEM (Rating Tracking & Transitions) ---
  const currentRatings = p.formHistory || [];
  const updatedRatings = [matchRating, ...currentRatings].slice(0, 10);
  
  const last3Ratings = updatedRatings.slice(0, 3);
  let nextStreak: 'HOT_STREAK' | 'DROUGHT' | 'NEUTRAL' = 'NEUTRAL';
  if (last3Ratings.length >= 3) {
  if (last3Ratings.every(r => r >= 7.0)) {
   nextStreak = 'HOT_STREAK';
  } else if (last3Ratings.every(r => r <= 6.0)) {
   nextStreak = 'DROUGHT';
  }
  }

  const prevStreak = p.formStreak || 'NEUTRAL';
  let nextStreakDuration = p.formStreakDuration || 0;
  let nextHotStreakCount = p.hotStreakCount || 0;
  let nextDroughtCount = p.droughtCount || 0;

  if (nextStreak === prevStreak) {
  nextStreakDuration += 1;
  } else {
  nextStreakDuration = 1;
  if (nextStreak === 'HOT_STREAK') nextHotStreakCount += 1;
  if (nextStreak === 'DROUGHT') nextDroughtCount += 1;
  }

  // Narrative Transitions
  if (prevStreak === 'DROUGHT' && matchRating >= 7.0) {
  // Break Drought
  p.morale = Math.min(100, p.morale + 20);
  newTrust = Math.min(100, newTrust + 10);
  newFans = Math.min(100, newFans + 10);
  inboxList.push({
   id: `break_drought_${Date.now()}`,
   sender: 'MEDIA',
   subject: "GOAL! He's back! The drought is over!",
   content: `After a disappointing run of matches, you silenced the critics today with an incredible performance of ${matchRating.toFixed(1)}. The fans are back on your side!`,
   read: false,
   type: 'SOCIAL',
   timestamp: 'SUN 10:00',
   choices: [{ text: 'Never doubted myself.', type: 'ack' }]
  });
  } else if (prevStreak === 'HOT_STREAK' && matchRating < 6.0) {
  // End Hot Streak
  p.morale = Math.max(0, p.morale - 10);
  newTrust = Math.min(100, newTrust + 5);
  inboxList.push({
   id: `end_hot_streak_${Date.now()}`,
   sender: 'AGENT',
   subject: "The hot run ends",
   content: "The sensational streak has come to an end today, but don't lose heart. You've proven what you're capable of. Let's get back to work next week.",
   read: false,
   type: 'DM',
   timestamp: 'SUN 10:00',
   choices: [{ text: 'We bounce back.', type: 'ack' }]
  });
  } else if (prevStreak !== 'HOT_STREAK' && nextStreak === 'HOT_STREAK') {
  // Enter Hot Streak
  inboxList.push({
   id: `enter_hot_streak_${Date.now()}`,
   sender: 'AGENT',
   subject: "You're unstoppable right now!",
   content: "Three incredible games in a row! Every touch you take turns to gold. The top-tier clubs are starting to watch very closely. Keep this up!",
   read: false,
   type: 'DM',
   timestamp: 'SUN 10:00',
   choices: [{ text: 'The world is watching.', type: 'ack' }]
  });
  } else if (prevStreak !== 'DROUGHT' && nextStreak === 'DROUGHT') {
  // Enter Drought
  inboxList.push({
   id: `enter_drought_${Date.now()}`,
   sender: 'FAN FORUM',
   subject: "The goals have dried up...",
   content: "Three poor matches in a row. The fans on the forums are starting to whisper, and questions are being asked. You need a performance next week.",
   read: false,
   type: 'SOCIAL',
   timestamp: 'SUN 10:00',
   choices: [{ text: 'I need to focus.', type: 'ack' }]
  });
  }

  // --- SYSTEM 4: RIVALRY PERSONALITY SYSTEM ---
  if (state.nextMatch?.matchType === 'DERBY') {
   newDerbyStats.played += 1;
   newDerbyStats.totalRating += matchRating;
   const avgRating = newDerbyStats.totalRating / newDerbyStats.played;
   
   if (homeScore > awayScore) {
    newFans += 15; // Derby win
   }

   if (matchRating >= 7.5) {
    inboxList.push({
    id: `derby_hero_${Date.now()}`,
    sender: 'MEDIA',
    subject: 'Derby Dominance',
    content: `The media is raving about your performance in the derby. You really showed up when it mattered.`,
    read: false,
    type: 'SOCIAL',
    timestamp: 'SAT 18:00',
    choices: [{ text: 'It was for the fans.', type: 'ack' }]
});
 
    newFans += 10;
   } else if (matchRating < 6.0) {
    inboxList.push({
    id: `derby_fail_${Date.now()}`,
    sender: 'MANAGER',
    subject: 'Derby Disappointment',
    content: `That wasn't good enough today. The fans won't forget this easily. You have to make it right.`,
    read: false,
    type: 'DM',
    timestamp: 'SAT 18:00',
    choices: [{ text: 'I\'ll do better.', type: 'ack' }]
});
 
    newTrust = Math.max(0, newTrust - 10);
   }
   
   if (newDerbyStats.played >= 3 && avgRating >= 7.0 && !stateFlags.hasDerbyHero) {
    stateFlags.hasDerbyHero = true;
    newFans += 20;
    inboxList.push({
    id: `derby_hero_perk_${Date.now()}`,
    sender: 'AGENT',
    subject: 'Derby Hero Status',
    content: `The fans absolutely adore you. You've been officially recognized as a 'Big-Game Player'. The local press are calling you a Derby Hero.`,
    read: false,
    type: 'DM',
    timestamp: 'SUN 10:00',
    choices: [{ text: 'I love these matches.', type: 'ack' }]
});
 
   }

   if (newDerbyStats.played >= 3 && avgRating < 6.0 && !stateFlags.hasDerbyFlop) {
    stateFlags.hasDerbyFlop = true;
    newTrust = Math.max(0, newTrust - 10);
    inboxList.push({
    id: `derby_flop_${Date.now()}`,
    sender: 'FAN CLUB',
    subject: "Derby Disappointment",
    content: `The fans won't forget this. Your performances in local derbies have been poor. You have to make it right in the next matches.`,
    read: false,
    type: 'SOCIAL',
    timestamp: 'SUN 10:00',
    choices: [{ text: 'I will prove them wrong.', type: 'ack' }]
});
 
   }
  }
  
  newFans = Math.max(0, Math.min(100, newFans));
  
  // --- SYSTEM 5: FAN ICON PROGRESSION SYSTEM (Tier Check & Inbox) ---
  const getFanTierEnum = (fans: number) => {
   if (fans >= 95) return 'LEGEND';
   if (fans >= 80) return 'ICON';
   if (fans >= 60) return 'CULT_HERO';
   if (fans >= 40) return 'FAN_FAVOURITE';
   if (fans >= 20) return 'SQUADDIE';
   return 'STRANGER';
  };
  
  const prevFanTier = getFanTierEnum(oldFans);
  const nextFanTier = getFanTierEnum(newFans);
  
  if (prevFanTier !== nextFanTier) {
   if (newFans > oldFans) {
   if (nextFanTier === 'FAN_FAVOURITE') {
    inboxList.push({
     id: `fan_tier_fav_${Date.now()}`,
     sender: 'FAN CLUB',
     subject: 'Fan Favourite Status Unlocked!',
     content: "The fans are starting to notice you. They like what they see. You feel a warmth in the local community.",
     read: false,
     type: 'SOCIAL',
     timestamp: 'SUN 12:00',
     choices: [{ text: 'Thank you for the support.', type: 'ack' }]
});
 
   } else if (nextFanTier === 'CULT_HERO') {
    inboxList.push({
     id: `fan_tier_cult_${Date.now()}`,
     sender: 'SOCIAL MEDIA',
     subject: 'Cult Hero Status!',
     content: "The fans are singing your name. It's been a long time since they loved someone this much.",
     read: false,
     type: 'SOCIAL',
     timestamp: 'SUN 12:00',
     choices: [{ text: 'I play for the badge.', type: 'ack' }]
});
 
   } else if (nextFanTier === 'ICON') {
    inboxList.push({
     id: `fan_tier_icon_${Date.now()}`,
     sender: 'STADIUM FANS',
     subject: 'Club Icon Status!',
     content: `A banner unfurls: '${p.lastName} – Our Icon.' You're etched in history. The crowd will protect you from harsh criticisms.`,
     read: false,
     type: 'NEWS',
     timestamp: 'SUN 12:00',
     choices: [{ text: 'This means everything.', type: 'ack' }]
});
 
   } else if (nextFanTier === 'LEGEND') {
    inboxList.push({
     id: `fan_tier_legend_${Date.now()}`,
     sender: 'CLUB CHAIRMAN',
     subject: 'Club Legend Status Unlocked!',
     content: `A statue is being planned in your honor. You're not just a player. You're a legend. You've earned a permanent +5% performance modifier here.`,
     read: false,
     type: 'NEWS',
     timestamp: 'SUN 12:00',
     choices: [{ text: 'My legacy is secured.', type: 'ack' }]
});
 
   }
   } else {
   inboxList.push({
    id: `fan_tier_loss_${Date.now()}`,
    sender: 'CLUB FORUMS',
    subject: 'Fans Are Turning on You',
    content: "The fans are turning. You hear the boos and critical comments online. It stings. You need to perform to win them back.",
    read: false,
    type: 'SOCIAL',
    timestamp: 'SUN 12:00',
    choices: [{ text: 'I will win them back.', type: 'ack' }]
});

   }
  }

  
  const checkRecord = (current: number, newTotal: number, threshold: number, title: string, content: string) => {
   if (current < threshold && newTotal >= threshold) {
   inboxList.push({
    id: `record_${Date.now()}_${threshold}`,
    sender: 'CLUB CHAIRMAN',
    subject: title,
    content: content,
    read: false,
    type: 'DM',
    timestamp: 'SAT 18:00',
    choices: [{ text: 'It is an honor.', type: 'ack' }]
});

   }
  };

  if (!isIntl) {
      checkRecord(p.stats.apps, newApps, 300, "All-Time Appearances Record Broken!", "Congratulations on etching your name into the history books. 300 appearances is a monumental achievement. You are a true club legend.");
      checkRecord(p.stats.goals, newGoals, 150, "All-Time Goalscorer Record Broken!", "We watched in awe today. 150 goals for this club. You are officially our greatest ever goalscorer.");
      checkRecord(p.stats.assists, newAssists, 100, "All-Time Assists Record Broken!", "100 assists for the club! Your vision and selflessness have set a new gold standard for playmakers here.");
  } else {
      checkRecord(p.stats.caps, newCaps, 100, "All-Time Caps Centurion!", "100 caps for your country. A legendary achievement.");
      checkRecord(p.stats.intlGoals || 0, newIntlGoals, 50, "International Goalscoring Legend!", "50 goals for your country! An incredible milestone on the international stage.");
  }

  // Contract payments!
  let newBalance = p.finances.balance;
  if (!isIntl) {
      if (!isBenched && p.contract.appearanceBonus) newBalance += p.contract.appearanceBonus;
      if (!isBenched && p.contract.goalBonus && goals > 0) newBalance += (p.contract.goalBonus * goals);
      
      // Loyalty Bonus Milestones
      if (!isBenched && p.contract.bonuses && newApps > 0 && (newApps % 50 === 0)) { // Milestone every 50 apps
       newBalance += p.contract.bonuses;
       inboxList.push({
        id: `loyalty_${Date.now()}`,
        sender: 'AGENT',
        subject: 'Loyalty Bonus Triggered',
        content: `Your contract included a loyalty bonus for hitting ${newApps} appearances. £${p.contract.bonuses.toLocaleString()} has hit the account. Drinks on you.`,
        read: false,
        type: 'DM',
        timestamp: 'SUN 10:00',
        choices: [{ text: 'Nice.', type: 'ack' }]
});
    
      }
  }

  const sharpnessGain = isBenched 
  ? Math.floor(warmupLevel / 20)
  : Math.min(100, Math.floor((minute / 90) * 15));
  const newSharpness = Math.min(100, p.sharpness + sharpnessGain);

  if (inboxList.length !== state.inbox.length) {
   setInbox(inboxList);
  }

  const newTacticalAwareness = p.attributes.tacticalAwareness !== undefined 
  ? Math.min(99, Math.round((p.attributes.tacticalAwareness + (isBenched ? 0.01 : (minute / 90) * 0.1)) * 100) / 100)
  : 50;

  // Fixture congestion fatigue & injury risk
  const upcomingMatchesIn7Days = state.seasonCalendar?.filter(e => {
  if (e.type !== 'MATCH') return false;
  const diffWeeks = e.week - state.currentWeek;
  if (diffWeeks < 0 || diffWeeks > 1) return false;
  const daysArr = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const currentIdx = daysArr.indexOf(state.currentDay);
  const targetIdx = daysArr.indexOf(e.day);
  const totalDaysDiff = (diffWeeks * 7) + (targetIdx - currentIdx);
  return totalDaysDiff >= 0 && totalDaysDiff <= 7;
  }) || [];
  const fixtureCongestion = upcomingMatchesIn7Days.length >= 3;
  let pitchFatigueMultiplier = 1.0;
  if (pitch?.type === 'MUDDY' || pitch?.type === 'WATERLOGGED' || pitch?.type === 'FROZEN') {
    pitchFatigueMultiplier = 1.35;
  }
  const fatigueMultiplier = (fixtureCongestion ? 1.5 : 1.0) * pitchFatigueMultiplier;

  let isInjured = p.isInjured;
  let nextFatigue = p.fatigue;

  // Track bench vs playing state for recovery debt calculations
  if (!p.stateFlags) p.stateFlags = {};
  if (!p.stateFlags.openThreads) p.stateFlags.openThreads = {};
  p.stateFlags.openThreads.wasBenched = isBenched;

  // Dynamic values
  const currentMF = p.physicalCondition?.matchFitness ?? 70;
  const currentRD = p.physicalCondition?.recoveryDebt ?? 0;
  const currentIS = p.physicalCondition?.injurySusceptibility ?? 5;

  let addedRD = isBenched ? 5 : 25;
  let nextRD = Math.min(100, currentRD + addedRD);

  if (isBenched) {
   nextFatigue = Math.max(0, p.fatigue - 5); // Rest on the bench
  } else {
   nextFatigue = Math.min(100, p.fatigue + (30 * fatigueMultiplier));

   if (nextFatigue >= 100) {
    isInjured = true;
    p.injuryWeeksLeft = Math.floor(Math.random() * 3) + 4; // 4 to 6 weeks
    p.injuryName = "Grade 2 Hamstring Tear (Blown Engine)";
    p.rehabProcess = initializeActiveRehab(p.injuryName, p.injuryWeeksLeft);
    nextFatigue = 50; // set to 50
    nextRD = Math.min(100, nextRD + 30);
    inboxList.push({
     id: `blown_engine_${Date.now()}`,
     sender: 'PHYSIO',
     subject: 'BLOWN ENGINE: Hamstring Tear',
     content: `Your body completely gave out today due to severe physical exhaustion. You have suffered a Grade 2 Hamstring Tear and will be sidelined for 4 to 6 weeks. Active rehab is required.`,
     read: false,
     type: 'SPORTING',
     timestamp: 'SUN 10:00',
     choices: [{ text: 'Begin rehab protocol.', type: 'ack' }]
});
 
   } else if (!isInjured) {
    // Injury risk driven by our 3-part Physical Condition / Injury Susceptibility metric, and modified by pitch/weather!
    const pitchInjuryMod = (pitch?.modifiers?.injuryRisk || 0) + (weather?.modifiers?.injuryRisk || 0);
    let injuryRisk = ((currentIS + pitchInjuryMod) / 100) * 0.15; // base risk from rolling susceptibility + pitch/weather risk
    if (fixtureCongestion) injuryRisk += ((upcomingMatchesIn7Days.length - 2) * 0.06); // +6% per extra match
    
    const fatigueMultiplierRisk = p.fatigue > 80 ? 3.0 : (p.fatigue > 50 ? 1.5 : 1.0);
    injuryRisk *= fatigueMultiplierRisk;

    if (Math.random() < injuryRisk) {
     isInjured = true;
     p.injuryWeeksLeft = Math.floor(Math.random() * 2) + 1; // 1 to 2 weeks
     p.injuryName = "Minor Hamstring Strain";
     p.rehabProcess = initializeActiveRehab(p.injuryName, p.injuryWeeksLeft);
     nextRD = Math.min(100, nextRD + 15);
     inboxList.push({
      id: `minor_injury_${Date.now()}`,
      sender: 'PHYSIO',
      subject: 'Physio Report: Hamstring Strain',
      content: `You felt a twinge during today's match. Tests confirm a minor hamstring strain. You will be out for ${p.injuryWeeksLeft} week(s). Follow your active rehab program to return safely.`,
      read: false,
      type: 'SPORTING',
      timestamp: 'SUN 10:00',
      choices: [{ text: 'Begin rehab.', type: 'ack' }]
});
  
    }
   }
  }

  // Update physicalCondition object post-match so it reflects immediate exhaustion
  p.physicalCondition = {
    value: Math.max(10, Math.min(100, Math.round(currentMF * 0.6 + (100 - nextRD) * 0.4 - (nextFatigue * 0.2)))),
    tier: (nextFatigue > 65 ? 'EXHAUSTED' : nextFatigue > 45 ? 'FATIGUED' : nextFatigue > 25 ? 'TIRED' : nextRD > 40 ? 'FIT' : 'PEAK') as any,
    effects: {
      statPenalty: Math.max(0, Math.floor(nextFatigue / 15) + Math.floor(nextRD / 20)),
      injuryRisk: Math.round(currentIS)
    },
    matchFitness: currentMF,
    recoveryDebt: nextRD,
    injurySusceptibility: currentIS
  };

  p.isInjured = isInjured;
  p.fatigue = nextFatigue;

  // Attribute growth from match
  let newAttributes = { ...p.attributes, tacticalAwareness: newTacticalAwareness };
  let ovrGrowth = 0;
  
  if (!isBenched) {
   if (matchRating >= 9.0) ovrGrowth = 5;
   else if (matchRating >= 8.0) ovrGrowth = 3;
   else if (matchRating >= 7.0) ovrGrowth = 1;
   else if (matchRating < 4.0) ovrGrowth = -5;
   else if (matchRating < 5.0) ovrGrowth = -3;
   else if (matchRating < 6.0) ovrGrowth = -1;
   
   const attrGrowthBase = 0.1 + (matchRating - 6.0) * 0.1;
   const attrGrowth = getScaledAttributeGain(p.ovr, attrGrowthBase, true, p.difficulty || 'STANDARD');
   if (attrGrowth > 0) {
    if (dribblesAttempted >= 10) newAttributes.dribbling = Math.min(99, Math.round((newAttributes.dribbling || 50) + attrGrowth * 2));
    if (passesMade >= 10) newAttributes.passing = Math.min(99, Math.round((newAttributes.passing || 50) + attrGrowth * 2));
    if (shotsAttempted >= 5) newAttributes.finishing = Math.min(99, Math.round((newAttributes.finishing || 50) + attrGrowth * 2));
    if (tacklesAttempted >= 5) newAttributes.tackling = Math.min(99, Math.round((newAttributes.tackling || 50) + attrGrowth * 2));
    if (distanceCovered >= 10) newAttributes.stamina = Math.min(99, Math.round((newAttributes.stamina || 50) + attrGrowth * 2));
   }
  }

  // Update Progression State (reputation and gates)
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

  const previousTotalRatingSum = (p.progression?.averageRating || 6.0) * (p.stats.apps || 1);
  const newTotalRatingSum = previousTotalRatingSum + (isIntl ? 0 : matchRating);
  const nextAverageRating = newApps > 0 ? Number((newTotalRatingSum / newApps).toFixed(2)) : matchRating;

  const nextProgResult = updateProgressionState(
  currentProg,
  p.ovr,
  newApps,
  newGoals,
  newAssists,
  0, // trophies count
  nextAverageRating
  );

  const nextProgression = nextProgResult.progression;

  if (nextProgResult.newGate) {
   inboxList.push({
   id: `gate_unlocked_${Date.now()}`,
   sender: 'SPORTS JOURNALIST',
   subject: 'BREAKING: Career Milestone Unlocked!',
   content: nextProgResult.gateUnlockedMessage || `Journalists are writing stories about your recent rise. You have unlocked the ${nextProgResult.newGate} progression tier! New doors of opportunity, agent offers, and high-tier club deals are on the horizon.`,
   read: false,
   type: 'NEWS',
   timestamp: 'SUN 09:00',
   choices: [{ text: 'Sensational.', type: 'ack' }]
});

  }

  // Story Arc Progression
  const arcProgression = checkStoryArcProgression(p, newApps);
  let updatedStoryArc = arcProgression.updatedArc;
  if (arcProgression.inboxMessage) {
  inboxList.push({ ...arcProgression.inboxMessage, timestamp: 'SUN 10:00' });
  }

  // --- POST-MATCH SCOUTING PRECURSOR SYSTEM ---
  let nextStateFlags = { ...stateFlags };
  if (!nextStateFlags.openThreads) {
    nextStateFlags.openThreads = {};
  } else {
    nextStateFlags.openThreads = { ...nextStateFlags.openThreads };
  }
  if (!nextStateFlags.openThreads.scoutAttendance) {
    nextStateFlags.openThreads.scoutAttendance = {};
  } else {
    nextStateFlags.openThreads.scoutAttendance = { ...nextStateFlags.openThreads.scoutAttendance };
  }
  if (!nextStateFlags.openThreads.interestProgress) {
    nextStateFlags.openThreads.interestProgress = {};
  } else {
    nextStateFlags.openThreads.interestProgress = { ...nextStateFlags.openThreads.interestProgress };
  }

  // Find eligible clubs for scouting
  const possibleScoutClubs = CLUBS.filter(c => {
    if (c.symbol === p.currentClubSymbol) return false;
    const gateStatus = getGatingStatus(p, c);
    return gateStatus === null;
  });

  if (possibleScoutClubs.length > 0 && !isBenched && matchRating >= 6.0) {
    // Better match rating means higher chance of scout attendance!
    const scoutChance = matchRating >= 8.0 ? 0.6 : (matchRating >= 7.0 ? 0.4 : 0.2);
    if (Math.random() < scoutChance) {
      const chosenClub = possibleScoutClubs[Math.floor(Math.random() * possibleScoutClubs.length)];
      
      const currentVisits = nextStateFlags.openThreads.scoutAttendance[chosenClub.symbol] || 0;
      const nextVisits = currentVisits + 1;
      nextStateFlags.openThreads.scoutAttendance[chosenClub.symbol] = nextVisits;
      
      const interestGrowth = Math.round(matchRating * 3.0); // e.g. 8.0 rating -> +24% interest
      const currentInterest = nextStateFlags.openThreads.interestProgress[chosenClub.symbol] || getClubInterestScore(p, chosenClub);
      const nextInterest = Math.min(100, currentInterest + interestGrowth);
      nextStateFlags.openThreads.interestProgress[chosenClub.symbol] = nextInterest;

      inboxList.push({
        id: `scout_visit_${Date.now()}`,
        sender: 'CHIEF SCOUT',
        subject: `Scouts Watching: ${chosenClub.name}`,
        content: `I can confirm that ${chosenClub.name} sent their lead scout to analyze your performance in today's match. Your rating of ${matchRating} has been noted in their database.\n\n` +
          `Interest Level: ${nextInterest}% (${nextVisits}/3 Visits recorded)\n\n` +
          `Once we reach 100% interest and at least 2 scout visits, they will consider making an official bid!`,
        read: false,
        type: 'NEWS',
        timestamp: 'SUN 10:00',
        choices: [{ text: 'Understood.', type: 'ack' }]
});
   
    }
  }

  stateFlags = nextStateFlags;

  // --- POTENTIAL CEILING BREAKTHROUGH SYSTEM ---
  let nextCeiling = p.ceiling || 80;
  let breakthroughTriggered = false;
  let breakthroughTitle = "";
  let breakthroughDesc = "";

  if (!isBenched && matchRating >= 8.5 && p.age < 26) {
    // 15% chance on masterclass ratings for young players
    if (Math.random() < 0.15 && nextCeiling < 99) {
      const increment = Math.floor(Math.random() * 3) + 2; // +2 to +4 ceiling
      nextCeiling = Math.min(99, nextCeiling + increment);
      breakthroughTriggered = true;
      breakthroughTitle = "✨ CAREER BREAKTHROUGH!";
      breakthroughDesc = `Your dazzling match rating of ${matchRating.toFixed(1)} against ${state.nextMatch?.opponentSymbol || 'OPP'} has sparked deep developmental breakthroughs. Coaches report your natural performance ceiling has expanded (+${increment} Potential Ceiling)!`;
    }
  } else if (!isBenched && newGoals > 0 && newGoals % 10 === 0 && p.stats.goals < newGoals && p.age < 26) {
    // Breakthrough on goal milestones
    if (nextCeiling < 99) {
      const increment = 2;
      nextCeiling = Math.min(99, nextCeiling + increment);
      breakthroughTriggered = true;
      breakthroughTitle = "🏆 GOALSCORER BREAKTHROUGH!";
      breakthroughDesc = `Hitting ${newGoals} career goals has unlocked brand new confidence levels. Your positional intelligence is maturing, permanently raising your development ceiling (+2 Potential Ceiling)!`;
    }
  }

  if (breakthroughTriggered) {
    inboxList.push({
      id: `breakthrough_${Date.now()}`,
      sender: 'CHIEF COACH',
      subject: breakthroughTitle,
      content: breakthroughDesc,
      read: false,
      type: 'SPORTING',
      timestamp: 'SUN 09:00',
      choices: [{ text: 'I am only getting started.', type: 'ack' }]
});
 
  }

  let finalContract = p.contract;
  if (stateFlags.midSeasonEvaluation && stateFlags.midSeasonEvaluation.matchesPlayed >= stateFlags.midSeasonEvaluation.targetMatches) {
    const evaluation = stateFlags.midSeasonEvaluation;
    let avgRating = evaluation.ratingsSum / evaluation.matchesPlayed;
    
    let finalStatus: import('../types').SquadHierarchyTier = 'Rotation';
    if (avgRating >= 8.0) finalStatus = 'Key Player';
    else if (avgRating >= 7.0) finalStatus = 'First Teamer';
    else if (avgRating < 6.0) finalStatus = 'Backup';
    
    finalContract = {
      ...finalContract,
      status: finalStatus
    };
    
    inboxList.push({
        id: `midseason_eval_${Date.now()}`,
        sender: 'MANAGER',
        subject: 'Trial Period Concluded',
        content: `You've completed your first ${evaluation.matchesPlayed} matches since joining us. Your average rating was ${avgRating.toFixed(1)}. Based on this, I see you as a ${finalStatus} for the rest of the campaign.`,
        read: false,
        type: 'DM',
        timestamp: 'MON 08:00',
        choices: [{ text: 'Understood, Boss.', type: 'ack' }]
});
 
    
    delete stateFlags.midSeasonEvaluation;
  }

  // Set final inbox state with any added messages
  if (inboxList.length !== state.inbox.length) {
    setInbox(inboxList);
  }


  // Organic Reputation Growth
  const clubTier = CLUBS.find(c => c.symbol === state.player?.currentClubSymbol).tier || 'Lower';
  const tierMultiplier = clubTier === 'Elite' ? 1.5 : clubTier === 'Strong' ? 1.2 : clubTier === 'Mid' ? 1.0 : clubTier === 'Lower' ? 0.8 : 0.6;
  
  let worldDelta = 0;
  let peerDelta = 0;
  let mediaDelta = 0;
  if (!isBenched) {
    if (matchRating >= 8.5) {
      worldDelta = 2 * tierMultiplier;
      peerDelta = 3;
      mediaDelta = 2;
    } else if (matchRating >= 7.5) {
      worldDelta = 1 * tierMultiplier;
      peerDelta = 1;
      mediaDelta = 1;
    } else if (matchRating <= 5.5) {
      worldDelta = -1 * tierMultiplier;
      peerDelta = -2;
      mediaDelta = -2;
    }
  }
  
  const currentRep = p.reputation || { club: 50, league: 50, world: 50, peerRespect: 50, skill: 50, attitude: 50, media: 50, fans: 50, global: 50, legacy: 50 };
  const currentMedia = p.mediaPerception || 50;
  
  const nextRep = {
    ...currentRep,
    world: Math.max(0, Math.min(100, Math.round(currentRep.world + worldDelta))),
    peerRespect: Math.max(0, Math.min(100, Math.round((currentRep.peerRespect || 50) + peerDelta)))
  };
  const nextMedia = Math.max(0, Math.min(100, Math.round(currentMedia + mediaDelta)));
  let updatedPlayerForSet = p;
  const clubData = state.worldState?.clubs[p.currentClubSymbol];
  if (clubData?.manager?.philosophy) {
     updatedPlayerForSet = updateCareerIdentity(p, clubData.manager.philosophy, matchRating);
  }

  setPlayer({
  ...updatedPlayerForSet,
  reputation: nextRep,
  mediaPerception: nextMedia,

  contract: finalContract,
  ceiling: nextCeiling,
  ovr: Math.max(30, Math.min(99, p.ovr + ovrGrowth)),
  attributes: newAttributes,
  progression: nextProgression,
  storyArc: updatedStoryArc,
  trust: newTrust,
  fans: newFans,
  fanTier: nextFanTier,
  formHistory: updatedRatings,
  formStreak: nextStreak,
  formStreakDuration: nextStreakDuration,
  hotStreakCount: nextHotStreakCount,
  droughtCount: nextDroughtCount,
  stateFlags,
  finances: {
   ...p.finances,
   balance: newBalance
  },
  stats: {
   ...p.stats,
   apps: newApps,
   goals: newGoals,
   assists: newAssists,
   caps: newCaps,
   intlGoals: newIntlGoals,
   derbyStats: newDerbyStats
  },
  timeline: [
    ...(isInjured && !p.isInjured ? [{
      id: `injury_${Date.now()}`,
      week: state.currentWeek,
      day: state.currentDay,
      type: 'INJURY' as const,
      title: `🏥 INJURED: ${p.injuryName || 'Hamstring strain'}`,
      description: `Sidelined with a ${p.injuryName || 'hamstring strain'} for ${p.injuryWeeksLeft || 1} week(s).`,
      clubSymbol: p.currentClubSymbol
    }] : []),
    ...personalMilestoneEvents,
    matchTimelineEvent,
    ...(p.timeline || [])
  ],
  fatigue: nextFatigue,
  sharpness: newSharpness,
  isInjured,
  isTutorialMode: false,
  });
 }
 
 // Do NOT advanceDay here, we advance day AFTER the press conference.
 setScreen('PRESS');
 };

 const handleTeamTalkResponse = (response: 'POSITIVE' | 'MUTED' | 'FRUSTRATED' | 'CONTINUE') => {
 // Determine effect based on personality & trust
 if (!state.player) return;
 const p = { ...state.player };
 
 if (response !== 'CONTINUE') {
  setTalkResponse(response);
  if (response === 'POSITIVE') {
   p.trust = Math.min(100, p.trust + 5);
   p.morale = Math.min(100, p.morale + 5);
  } else if (response === 'FRUSTRATED') {
   p.trust = Math.max(0, p.trust - 10);
   p.morale = Math.max(0, p.morale - 5);
  }
  setPlayer(p);
  setTimeout(() => {
  setTalkResponse(null);
  if (matchPhase === 'PRE_TALK') {
      const ritualedPlayer = applyMatchdayRitual(p);
      setPlayer(ritualedPlayer);
      setMatchPhase('PRE');
  }
  else if (matchPhase === 'HALF_TIME_TALK') {
   setMinute(46);
   setMatchPhase('PLAYING');
  }
  else if (matchPhase === 'FULL_TIME_TALK') setMatchPhase('POST_MATCH_SUMMARY');
  }, 1000);
 } else {
  if (matchPhase === 'PRE_TALK') {
      const ritualedPlayer = applyMatchdayRitual(p);
      setPlayer(ritualedPlayer);
      setMatchPhase('PRE');
  }
  else if (matchPhase === 'HALF_TIME_TALK') {
   setMinute(46);
   setMatchPhase('PLAYING');
  }
  else if (matchPhase === 'FULL_TIME_TALK') setMatchPhase('POST_MATCH_SUMMARY');
 }
 };

 const handlePostMatchSummaryContinue = () => {
  finishMatch();
 };

 if (matchPhase === 'PRE_TALK' || matchPhase === 'FULL_TIME_TALK') {
 const isWin = homeScore > awayScore;
 const isLoss = homeScore < awayScore;
 let message = "";
 let tone = "";
 if (matchPhase === 'PRE_TALK') {
  tone = state.nextMatch?.isBigMatch ? "Rousing" : "Calm";
  message = state.nextMatch?.isBigMatch ? "This is what we play for. Go out there and make yourselves legends!" : "Stick to the plan. Do your jobs. We have enough quality to win this.";
 } else {
  tone = isLoss ? "Disappointed" : (isWin ? "Praising" : "Muted");
  message = isLoss ? "That was completely unacceptable." : (isWin ? "Brilliant performance. I'm proud of every single one of you." : "We should be winning these. Point taken, but we need more.");
 }

 return (
  <div className="flex flex-col items-center justify-center h-full gap-8 p-12 text-center premium-card w-full">
   <h2 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest">{tone} Team Talk</h2>
   <h1 className="text-white text-3xl font-bold italic tracking-tight">"{message}"</h1>
   
   <div className="flex gap-4 mt-8">
   {talkResponse === null ? (
    <>
    <button onClick={() => handleTeamTalkResponse('POSITIVE')} className="px-6 py-3 border border-white/10 glass-panel hover:border-[#00FF88] hover:text-[#00FF88] text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">Visible Nod</button>
    <button onClick={() => handleTeamTalkResponse('MUTED')} className="px-6 py-3 border border-white/10 glass-panel hover:border-white hover:text-white text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">Listen Mutely</button>
    <button onClick={() => handleTeamTalkResponse('FRUSTRATED')} className="px-6 py-3 border border-white/10 glass-panel hover:border-red-500 hover:text-red-500 text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">Look Frustrated</button>
    <button onClick={() => handleTeamTalkResponse('CONTINUE')} className="px-6 py-3 bg-[#00FF88] text-black font-bold uppercase tracking-widest text-xs hover:bg-white border border-[#00FF88] hover:border-white transition-colors">Skip</button>
    </>
   ) : (
    <div className="text-sm font-bold uppercase tracking-widest text-[#00FF88] animate-pulse">Reaction Registered</div>
   )}
   </div>
  </div>
 );
 }

 if (matchPhase === 'HALF_TIME_TALK') {
 const isWin = homeScore > awayScore;
 const isLoss = homeScore < awayScore;
 const isDraw = homeScore === awayScore;
 const goalDiff = homeScore - awayScore;
 
 let tone = "";
 let message = "";
 let options: {text: string, type: string}[] = [];

 if (isLoss && goalDiff <= -2) {
  tone = "Furious";
  message = "This is unacceptable! You're embarrassing the badge!";
  options = [
  { text: "Fight back", type: "FIGHT_BACK" },
  { text: "Stay calm", type: "STAY_CALM" },
  { text: "Defensive", type: "DEFENSIVE" }
  ];
 } else if (isLoss && goalDiff === -1) {
  tone = "Encouraging";
  message = "We're still in this. One goal changes everything.";
  options = [
  { text: "Attack", type: "ATTACK" },
  { text: "Stay disciplined", type: "STAY_DISCIPLINED" },
  { text: "Take risks", type: "TAKE_RISKS" }
  ];
 } else if (isWin || (isDraw && homeScore > 0)) {
  tone = "Satisfied";
  message = "Good half. But we need more.";
  options = [
  { text: "Push on", type: "PUSH_ON" },
  { text: "Hold shape", type: "HOLD_SHAPE" },
  { text: "Conserve energy", type: "CONSERVE_ENERGY" }
  ];
 } else {
  tone = "Intense";
  message = "This game is there for the taking. Who wants it?";
  options = [
  { text: "Be aggressive", type: "BE_AGGRESSIVE" },
  { text: "Stay patient", type: "STAY_PATIENT" },
  { text: "Take control", type: "TAKE_CONTROL" }
  ];
 }

 const handleHalfTimeResponse = (type: string) => {
  if (!state.player) return;
  const p = { ...state.player };
  
  let tChange = 0;
  let mChange = 0;
  
  if (type === 'FIGHT_BACK') { mChange += 10; tChange -= (homeScore > awayScore) ? 0 : 5; }
  if (type === 'STAY_CALM') { mChange += 5; tChange += 5; }
  if (type === 'DEFENSIVE') { } // effects applied in game via state, but we'll do simple stats here
  if (type === 'STAY_DISCIPLINED') { mChange += 5; tChange += 10; }
  if (type === 'PUSH_ON') { mChange += 5; tChange += 5; }
  if (type === 'CONSERVE_ENERGY') { p.fatigue = Math.max(0, p.fatigue - 10); }

  p.trust = Math.min(100, Math.max(0, p.trust + tChange));
  p.morale = Math.min(100, Math.max(0, p.morale + mChange));
  
  setPlayer(p);
  setHalfTimeMood(type);
  
  setTimeout(() => {
   setHalfTimeMood('');
   setMinute(46);
   setMatchPhase('PLAYING');
  }, 1500);
 };

 return (
  <div className="flex flex-col items-center justify-center h-full gap-8 p-12 text-center premium-card w-full">
   <h2 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest">{tone} Manager</h2>
   <h1 className="text-white text-3xl font-bold italic tracking-tight">"{message}"</h1>
   
   <div className="flex gap-4 mt-8">
   {halfTimeMood === '' ? (
    <>
    {options.map(opt => (
     <button key={opt.type} onClick={() => handleHalfTimeResponse(opt.type)} className="px-6 py-3 border border-white/10 glass-panel hover:border-[#00FF88] hover:text-[#00FF88] text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">
     {opt.text}
     </button>
    ))}
    </>
   ) : (
    <div className="text-sm font-bold uppercase tracking-widest text-[#00FF88] animate-pulse">Tactical Switch Made</div>
   )}
   </div>
  </div>
 );
 }

 if (matchPhase === 'POST_MATCH_SUMMARY') {
  return (
  <div className="flex flex-col items-center justify-center h-full gap-8 p-12 text-center premium-card w-full overflow-y-auto">
   <h2 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest">Full Time Summary</h2>
   <h1 className="text-white text-5xl font-black uppercase tracking-tighter">{homeScore} - {awayScore}</h1>
   
   <div className="grid grid-cols-2 gap-8 mt-4 w-full max-w-3xl">
    <div className="glass-panel p-6 text-left">
    <div className="text-white/50 text-[10px] uppercase tracking-widest mb-2 font-bold">Key Stats</div>
    <div className="flex justify-between font-mono text-sm border-b border-white/10 py-2">
     <span className="text-[#ccc]">Match Rating</span><span className="text-white">{isBenched ? 'N/A' : matchRating.toFixed(1)}</span>
    </div>
    <div className="flex justify-between font-mono text-sm border-b border-white/10 py-2">
     <span className="text-[#ccc]">Distance</span><span className="text-white">{isBenched ? `${(warmupLevel / 200 * 2).toFixed(1)} km (Warmup)` : `${distanceCovered.toFixed(1)} km`}</span>
    </div>
    <div className="flex justify-between font-mono text-sm border-b border-white/10 py-2">
     <span className="text-[#ccc]">Passes</span><span className="text-white">{isBenched ? '0/0' : `${passesCompleted}/${passesMade}`}</span>
    </div>
    <div className="flex justify-between font-mono text-sm border-b border-white/10 py-2">
     <span className="text-[#ccc]">Shots / Dribbles / Tackles</span><span className="text-white">{isBenched ? '0 / 0 / 0' : `${shotsAttempted} / ${dribblesAttempted} / ${tacklesAttempted}`}</span>
    </div>
    </div>

    <div className="glass-panel p-6 text-left">
    <div className="text-white/50 text-[10px] uppercase tracking-widest mb-2 font-bold">Condition Impacts</div>
    <div className="flex justify-between font-mono text-sm border-b border-white/10 py-2">
     <span className="text-[#ccc]">Sharpness</span><span className="text-emerald-500 font-bold">+{isBenched ? Math.floor(warmupLevel / 20) : Math.min(100, Math.floor((minute / 90) * 15))}%</span>
    </div>
    <div className="flex justify-between font-mono text-sm border-b border-white/10 py-2">
     <span className="text-[#ccc]">Form Shift</span><span className={isBenched ? 'text-white/50' : (matchRating >= 7.0 ? 'text-emerald-500 font-bold' : (matchRating < 6.0 ? 'text-red-500 font-bold' : 'text-white'))}>{isBenched ? 'N/A' : (matchRating >= 7.0 ? 'Positive' : (matchRating < 6.0 ? 'Negative' : 'Neutral'))}</span>
    </div>
    <div className="flex justify-between font-mono text-sm border-b border-white/10 py-2">
     <span className="text-[#ccc]">Fatigue</span><span className={isBenched ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>{isBenched ? '-5% (Rest)' : '+30%'}</span>
    </div>
    </div>

    {!isBenched && (
    <div className="col-span-2 glass-panel p-6 text-left flex flex-col items-center">
     <div className="text-white/50 text-[10px] uppercase tracking-widest mb-4 font-bold w-full text-center">🔥 Heat Map – Real Touch Positioning ({touchPoints.length} Touches)</div>
     <div className="w-full max-w-sm aspect-[4/3] bg-emerald-950 border border-emerald-700/60 relative overflow-hidden flex flex-col mb-4 rounded-lg shadow-inner">
      {/* Pitch markings */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/30 z-10"></div>
      <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full border border-white/30 -translate-x-1/2 -translate-y-1/2 z-10"></div>
      <div className="absolute top-1/4 bottom-1/4 left-0 w-12 border-r border-t border-b border-white/30 z-10"></div>
      <div className="absolute top-1/4 bottom-1/4 right-0 w-12 border-l border-t border-b border-white/30 z-10"></div>

      {/* Touch Point Heat Blobs */}
      {touchPoints.length > 0 ? (
       touchPoints.map((tp, idx) => (
        <div 
         key={idx}
         className="absolute w-8 h-8 rounded-full bg-red-500/60 blur-md -translate-x-1/2 -translate-y-1/2 animate-pulse pointer-events-none"
         style={{ left: `${tp.x}%`, top: `${tp.y}%` }}
        />
       ))
      ) : (
       state.player?.position.includes('W') || state.player?.position.includes('M') ? (
        <>
         <div className="absolute top-1/4 left-1/4 w-28 h-28 bg-red-500/50 blur-xl rounded-full"></div>
         <div className="absolute top-1/2 left-1/3 w-32 h-20 bg-orange-500/40 blur-xl rounded-full"></div>
        </>
       ) : state.player?.position === 'ST' || state.player?.position === 'AM' ? (
        <>
         <div className="absolute top-1/4 right-1/4 w-28 h-28 bg-red-500/60 blur-2xl rounded-full"></div>
         <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-yellow-500/50 blur-xl rounded-full"></div>
        </>
       ) : (
        <>
         <div className="absolute bottom-1/4 left-1/4 w-32 h-28 bg-red-500/50 blur-xl rounded-full"></div>
         <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-orange-500/40 blur-xl rounded-full"></div>
        </>
       )
      )}
     </div>

     <div className="flex flex-col gap-2 w-full mt-4">
      <div className="text-white text-[10px] font-bold uppercase tracking-widest text-left border-b border-white/10 pb-1 flex justify-between">
       <span>Comprehensive Match Analysis</span>
       <span className="text-[#00FF88]">Pass Acc: {passesMade > 0 ? Math.round((passesCompleted / passesMade) * 100) : 100}%</span>
      </div>
      
      <div className="flex items-start gap-3 mt-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] mt-1.5"></div>
      <div className="text-left flex-1">
       <div className="text-[10px] text-[#00FF88] font-bold uppercase tracking-widest">Manager's Assessment</div>
       <div className="text-white/50 text-xs font-mono">
        {matchRating >= 8.0 ? 'Magnificent display. Followed the game plan perfectly.' : 
        matchRating >= 6.5 ? 'Solid shift. Did what was asked.' : 
        'Disappointing. Expected a lot more from you today.'}
       </div>
      </div>
      </div>

      <div className="flex items-start gap-3 mt-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
      <div className="text-left flex-1">
       <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Tactical Execution</div>
       <div className="text-white/50 text-xs font-mono">
        {state.player?.tacticalInstruction?.current ? 
        `Instruction: ${state.player.tacticalInstruction.current.instruction}. ${state.player.tacticalInstruction.current.status === 'MASTERED' ? 'Executed flawlessly.' : state.player.tacticalInstruction.current.status === 'LEARNING' ? 'Showing signs of understanding.' : 'Struggled to adapt to the required role.'}` :
        'Standard role played.'}
       </div>
      </div>
      </div>

      <div className="flex items-start gap-3 mt-2">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5"></div>
      <div className="text-left flex-1">
       <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Targeted Training Recommendation</div>
       <div className="text-white/90 text-xs font-mono font-semibold">
        💡 {
         passesMade >= 2 && passesCompleted / passesMade < 0.65 ? 'One-Touch Passing Triangles (Target: Vision & Passing)' :
         shotsAttempted >= 2 && homeScore === 0 ? 'Finishing from Crosses (Target: Finishing & Composure)' :
         tacklesAttempted >= 2 ? 'Defensive Stance & Sliding Tackles (Target: Tackling & Strength)' :
         distanceCovered > 10.5 || state.player?.fatigue > 60 ? 'High-Intensity Shuttle Runs (Target: Stamina & Conditioning)' :
         'Tactical Positioning Walkthrough (Target: Decision Making)'
        }
       </div>
      </div>
      </div>

      <div className="flex items-start gap-3 mt-2">
      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5"></div>
      <div className="text-left flex-1">
       <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Positional Analysis</div>
       <div className="text-white/50 text-xs font-mono">
        {state.player?.position === 'GK' ? "Guarded the goalmouth, commanded six-yard box effectively." :
        state.player?.position === 'ST' ? "Most active in the attacking third, seeking out spaces." :
        state.player?.position.includes('W') ? "Maintained width and isolated fullbacks." :
        "Controlled central areas, acting as a pivot."}
       </div>
      </div>
      </div>
     </div>
    </div>
    )}
   </div>

   <p className="max-w-xl text-white/50 italic text-sm mt-4">
    {isBenched 
    ? `"You stayed on the bench today, keeping positive and staying professional. Your fitness is preserved and the manager values your loyalty."`
    : `"A hard fought shift. The data reflects a steady individual performance."`}
   </p>

   <button onClick={handlePostMatchSummaryContinue} className="mt-4 px-12 py-4 bg-[#00FF88] text-black font-bold uppercase tracking-widest hover:bg-white border border-[#00FF88] hover:border-white transition-colors">
    Continue to Press
   </button>
  </div>
  );
 }

 if (matchPhase === 'PRE') {
 const pressure = state.nextMatch?.pressure || 5;
 let matchTypeText: string = state.nextMatch?.matchType || 'REGULAR';
 if (state.seasonCalendar?.find(e => e.week === state.currentWeek && e.day === state.currentDay)?.match?.competitionType === 'DOMESTIC_CUP') {
  matchTypeText = 'CUP TIE';
 }
 
 return (
  <div className="flex flex-col items-center justify-center h-full gap-8 p-12 text-center premium-card w-full relative overflow-hidden">
  <div className="flex flex-col items-center gap-2 relative z-10">
   <h2 className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest">Pre-Match Preparation</h2>
   
   {state.nextMatch?.rivalryName ? (
    <div className="px-4 py-1.5 border border-red-500/30 bg-red-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">
     🔥 RIVALRY MATCH: {state.nextMatch.rivalryName}
    </div>
   ) : null}

   {state.nextMatch?.matchType === 'DERBY' && (
    <div className="px-4 py-1.5 border border-amber-500/30 bg-amber-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">
     ⚽ DERBY CLASH: HIGH VOLTAGE
    </div>
   )}

   <div className={`px-4 py-1.5 border rounded-full text-[10px] font-bold uppercase tracking-widest ${pressure >= 8 ? 'bg-red-950/50 border-red-900/50 text-red-500' : pressure <= 3 ? 'bg-blue-950/50 border-blue-900/50 text-blue-400' : 'bg-white/10 border-white/10 text-white/50'}`}>
    PRESSURE RATING: {pressure}/10 - {matchTypeText}
   </div>
  </div>
  <h1 className="text-white text-5xl font-black uppercase tracking-tighter relative z-10">
   {preMatchStep === 0 ? "Warm-Up Routine" : preMatchStep === 1 ? "Mental Focus" : "Final Instructions"}
  </h1>
  <p className="text-white/50 max-w-lg mb-4 uppercase tracking-widest text-xs font-bold leading-relaxed relative z-10">
   {preMatchStep === 0 ? "Choose your physical approach prior to kickoff." : 
   preMatchStep === 1 ? "How are you mentally preparing in the tunnel?" : 
   "The manager is going over set pieces. What's your move?"}
  </p>
  
  <div className="grid grid-cols-2 gap-6 w-full max-w-3xl relative z-10">
   {preMatchStep === 0 && (
   <div className="col-span-2 flex justify-between items-center bg-[#111] border border-white/5 rounded-lg p-4 mb-4 mt-2">
     <div className="flex flex-col text-left">
       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Match Conditions</span>
       <div className="flex items-center gap-4 mt-1 text-xs font-bold text-white">
         <span className="flex items-center gap-1.5">{weather?.icon} {weather?.type}</span>
         <span className="w-px h-3 bg-white/20"></span>
         <span className="flex items-center gap-1.5">{pitch?.icon} {pitch?.type} Pitch</span>
       </div>
     </div>
     <div className="flex flex-col text-right">
       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Tactical Setup</span>
       <span className="text-emerald-400 font-mono font-black text-sm tracking-widest mt-1">4-3-3</span>
     </div>
   </div>
   )}
   {getPreMatchOptions().map((opt) => (
    <button 
    key={opt.key} 
    onClick={() => handlePreMatchChoice(opt.key)} 
    className="p-8 border border-white/10 hover:border-[#00FF88] bg-white/5 hover:bg-white/10 glass-panel transition-all group flex flex-col items-center text-center rounded-xl"
    >
    <div className="text-white font-bold text-lg uppercase tracking-wider mb-2 group-hover:text-[#00FF88]">
     {opt.title}
    </div>
    <div className="text-white/50 text-xs font-sans mb-4 max-w-md">
     {opt.desc}
    </div>
    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex flex-col gap-1 items-center">
     <span className="text-amber-500 font-mono">{opt.effects}</span>
     <span className="text-emerald-500 font-mono font-black">{opt.bonusText}</span>
    </div>
    </button>
   ))}
  </div>
  </div>
 );
 }

 const isIntlMatch = state.nextMatch?.competitionType === 'INTERNATIONAL';
 const homeClubSymbol = isIntlMatch ? (state.player?.nationality.substring(0, 3).toUpperCase() || 'NAT') : (state.player?.currentClubSymbol || 'BIR');
 const awayClubSymbol = state.nextMatch?.opponentSymbol || 'OPP';
 const homeClub = isIntlMatch ? { name: state.player?.nationality || 'National Team', primaryColor: '#ffffff', secondaryColor: '#000000', symbol: homeClubSymbol } : CLUBS.find(c => c.symbol.toUpperCase() === homeClubSymbol.toUpperCase());
 const awayClub = isIntlMatch ? { name: awayClubSymbol, primaryColor: '#222222', secondaryColor: '#555555', symbol: awayClubSymbol } : CLUBS.find(c => c.symbol.toUpperCase() === awayClubSymbol.toUpperCase());

 return (
 <div className="h-full flex gap-6 w-full mx-auto">
  {/* Left side: Engine logs and decisions */}
  <div className="flex-1 flex flex-col gap-6">
  {/* Top Banner */}
  <div className="premium-card p-8 flex flex-col gap-8 shrink-0">
   <div className="flex justify-between items-center px-8">
    <div className="text-center w-28 flex flex-col items-center gap-2">
    <TeamLogo
     symbol={homeClubSymbol}
     name={homeClub?.name}
     primaryColor={homeClub?.primaryColor}
     secondaryColor={homeClub?.secondaryColor}
     size={56}
    />
    <div className="text-white text-lg font-bold font-mono tracking-widest mt-1">{homeClubSymbol}</div>
    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">HOME</div>
    </div>
    
    <div className="text-center">
    <div className="text-[#00FF88] text-[80px] leading-none font-mono font-black tracking-tighter">
     {homeScore} <span className="text-[#333] font-normal mx-4">-</span> {awayScore}
    </div>
    <div className="text-white/50 text-sm font-bold font-mono tracking-widest uppercase mt-4">
     {minute}' <span className="mx-2 text-[#444]">·</span> {matchPhase === 'POST' ? 'FULL TIME' : 'LIVE'}
    </div>
    </div>

    <div className="text-center w-28 flex flex-col items-center gap-2">
    <TeamLogo
     symbol={awayClubSymbol}
     name={awayClub?.name}
     primaryColor={awayClub?.primaryColor}
     secondaryColor={awayClub?.secondaryColor}
     size={56}
    />
    <div className="text-white text-lg font-bold font-mono tracking-widest mt-1">{awayClubSymbol}</div>
    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">AWAY</div>
    </div>
   </div>
   
   <div className="space-y-4 pt-4">
    <div>
     <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
     <span>Match Control</span>
     </div>
     <div className="w-full h-1.5 bg-white/10 relative overflow-hidden rounded-full">
     <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#111] z-10"></div>
     <div className={`absolute top-0 bottom-0 transition-all duration-300 ${teamMomentum < 50 ? 'bg-red-500' : 'bg-[#00FF88]'}`}
       style={{
        left: teamMomentum < 50 ? `${teamMomentum}%` : '50%',
       right: teamMomentum > 50 ? `${100 - teamMomentum}%` : '50%'
       }}
     ></div>
     </div>
    </div>
    
    <div>
     <div className="flex justify-between items-center text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
       <span>Match Pressure</span>
       <span className="font-mono text-white/80">{matchPressure}/10</span>
     </div>
     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
       <div 
          className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${matchPressure > 7 ? 'bg-red-500' : matchPressure > 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${(matchPressure / 10) * 100}%` }}
       />
     </div>
    </div>
   </div>
  </div>
  
  {/* Scrollable Commentary Log */}
  <div className="flex-1 premium-card p-8 overflow-y-auto font-mono text-sm leading-relaxed no-scrollbar relative">
   <div className="space-y-2 pb-10">
    {logs.map((log, i) => (
    <div key={i} className={`flex gap-6 py-3 border-b border-white/10/50 last:border-0
     ${log.isPlayerFeature ? (log.fail ? 'text-orange-500 bg-orange-500/5 -mx-4 px-4' : 'text-[#00FF88] bg-[#00FF88]/5 -mx-4 px-4') : (log.isOpp ? 'text-red-400' : 'text-[#cccccc]')}
    `}>
     <div className="text-white/40 font-bold w-8 shrink-0">{log.m}'</div>
     <div className={log.isPlayerFeature ? 'font-bold tracking-wide' : ''}>{log.text}</div>
    </div>
    ))}
    <div ref={logsEndRef} />
   </div>
   {/* Fade out bottom overlay */}
   <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#111] to-transparent pointer-events-none"></div>
  </div>

  {/* Decision / Action Area */}
  <div className="min-h-[160px] border border-[#00FF88] p-6 glass-panel flex flex-col justify-center shrink-0">
   {isDecisionFrame ? (
    <div className="flex flex-col h-full justify-center">
    <div className="text-[#00FF88] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
     <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
     CRITICAL DECISION
    </div>
    {currentHint && (
     <div className="mb-4 text-xs font-mono text-emerald-400">
     {currentHint}
     </div>
    )}
    <div className="grid grid-cols-3 gap-4">
     {decisionOptions.map((opt, i) => (
     <button 
      key={i}
      onClick={() => handleDecision(opt)}
      className="p-4 border border-white/10 hover:border-[#00FF88] bg-[#111] hover:bg-[#161616] transition-all flex flex-col group items-start text-left rounded-lg shadow-lg hover:shadow-[#00FF88]/5"
     >
      <span className="text-xs font-bold font-mono tracking-wider uppercase mb-1">{opt.text}</span>
      {opt.desc && <span className="text-white/50 font-sans text-[10px] leading-tight">{opt.desc}</span>}
     </button>
     ))}
    </div>
    </div>
   ) : (
    <div className="flex items-center justify-center h-full text-[#555555] font-mono text-xs font-bold uppercase tracking-widest flex-col gap-3">
    <div className="w-4 h-4 border-2 border-[#555] border-t-[#00FF88] rounded-full animate-spin"></div>
    {isBenched ? (
     <div className="flex items-center justify-between w-full gap-8 px-4 text-left">
     <div className="flex-1">
      <div className="text-amber-400 text-xs font-black tracking-widest uppercase mb-1 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
      ON THE BENCH
      </div>
      <div className="text-white/50 text-[10px] font-sans">Keep warming up to increase sub-on chance!</div>
     </div>
     <div className="w-48 premium-card p-2.5 border border-[#252525] rounded shrink-0 flex flex-col gap-1.5">
      <div className="flex justify-between text-[8px] font-mono uppercase tracking-wider text-white/50">
      <span>Warmup:</span>
      <span className="text-amber-400 font-bold">{warmupLevel}%</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-amber-400" style={{ width: `${warmupLevel}%` }}></div>
      </div>
      <button
      onClick={() => {
       const nextLvl = Math.min(100, warmupLevel + 25);
       setWarmupLevel(nextLvl);
       setLogs(prev => [...prev, { m: minute, text: `WARMUP: You stretch and jog down the touchline. (+Sub-On Chance)`, isPlayerFeature: true, isOpp: false, fail: false }]);
      }}
      disabled={warmupLevel >= 100}
      className="w-full py-1 bg-amber-500 hover:bg-amber-600 disabled:bg-white/10 disabled:text-[#555] text-black font-black uppercase text-[8px] rounded transition-colors"
      >
      {warmupLevel >= 100 ? 'READY' : 'WARM UP'}
      </button>
     </div>
     </div>
    ) : (
     <span>{matchPhase === 'POST' ? (state.player?.isInjured ? 'Watching from Tunnel (Injured)...' : 'Watching from Bench...') : 'Simulating Pitch Events'}</span>
     )}
    </div>
   )}
  </div>
  </div>

  {/* Right side: Player Live Stats */}
  <div className="w-[320px] flex flex-col gap-6">
  <div className="glass-panel p-6 flex flex-col items-center justify-center shrink-0">
   <div className="flex justify-between items-center w-full mb-2">
     <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Match Rating</h3>
     <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></div>
   </div>
   <div className={`text-5xl font-black font-mono tracking-tighter transition-colors mt-2 ${matchRating >= 7.5 ? 'text-emerald-400' : matchRating < 6.5 ? 'text-red-400' : 'text-white'}`}>
    {matchRating.toFixed(1)}
   </div>
  </div>

  <div className="premium-card p-6 flex-1 flex flex-col">
   <div className="text-[#00FF88] text-xs font-bold tracking-widest uppercase mb-6 pb-4 border-b border-white/10">Live Player Metrics</div>
   
   <div className="space-y-6">
    <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Distance Covered</span>
     <span className="text-white">{distanceCovered.toFixed(1)} km</span>
    </div>
    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-[#555] transition-all duration-300" style={{ width: `${Math.min(100, distanceCovered * 8)}%`}}></div>
    </div>
    </div>
    
    <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Passes Completed</span>
     <span className="text-white">{passesCompleted} / {passesMade}</span>
    </div>
    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-[#00FF88] transition-all duration-300" style={{ width: `${passesMade > 0 ? (passesCompleted/passesMade)*100 : 0}%`}}></div>
    </div>
    </div>

    <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Live Condition // Fatigue</span>
     <span className={`text-${(state.player?.fatigue || 0) + (minute / 90 * 40) > 80 ? 'red-500' : 'white'}`}>
      {Math.min(100, Math.floor((state.player?.fatigue || 0) + (minute / 90 * 40)))}%
     </span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.min(100, (state.player?.fatigue || 0) + (minute / 90 * 40))}%`}}></div>
    </div>
    </div>
   </div>
   
   {activeBuff !== 'NONE' && (
    <div className="mt-8 p-4 glass-panel ">
    <div className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1">Active Buff</div>
    <div className="text-[#00FF88] text-xs font-bold uppercase tracking-wider">{activeBuff} FOCUSED</div>
    </div>
   )}
  </div>
  </div>

 </div>
 );
}
}
export default MatchEngine;

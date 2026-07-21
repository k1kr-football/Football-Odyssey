const fs = require('fs');
let file = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');

if (!file.includes('MATCH_SITUATIONS')) {
    file = file.replace("import { resolveAction, generateCommentary } from '../utils/matchEngine';",
    "import { resolveAction, generateCommentary } from '../utils/matchEngine';\nimport { MATCH_SITUATIONS, MatchSituation } from '../data/matchSituations';");
}

const targetStart = file.indexOf('if (Math.random() * 100 <= involvementChance) {');
const targetEndString = "} else {\n  // Teammate / Opponent action";
const targetEnd = file.indexOf(targetEndString, targetStart);

if (targetStart !== -1 && targetEnd !== -1) {
let newLogic = `if (Math.random() * 100 <= involvementChance) {
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

    // Filter valid situations
    const validSits = MATCH_SITUATIONS.filter(s => s.validPositions.includes('ALL') || s.validPositions.includes(state.player?.position || 'ST'));
    
    // Determine event
    const eventType = pickRandomEvent();
    
    // 15% chance to trigger a formal decision situation
    if (Math.random() < 0.15 && validSits.length > 0 && !isDecisionFrame) {
        const sit = validSits[Math.floor(Math.random() * validSits.length)];
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
  `;
  file = file.substring(0, targetStart) + newLogic + file.substring(targetEnd);
  fs.writeFileSync('src/screens/MatchEngine.tsx', file);
  console.log("Patched MatchEngine.tsx");
} else {
  console.log("Could not find the target range");
}

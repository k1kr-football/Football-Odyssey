const fs = require('fs');
let file = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');

const targetStr = `if (option.type === "play_on") {`;
const insertLogic = `
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
`;

if (file.includes(targetStr)) {
   file = file.replace(targetStr, insertLogic + "\n " + targetStr);
   fs.writeFileSync('src/screens/MatchEngine.tsx', file);
   console.log("Patched handleDecision");
} else {
   console.log("Could not find play_on in handleDecision");
}

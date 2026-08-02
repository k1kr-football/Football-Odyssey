const fs = require('fs');
let code = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');

const replacement = `
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
`;

code = code.replace(
  /  \/\/ Music Engine integration[\s\S]*?\}, \[phase, momentum, isBigMatch, matchType, userScore, oppScore, pressure\]\);/g,
  replacement
);

fs.writeFileSync('src/screens/MatchEngine.tsx', code);

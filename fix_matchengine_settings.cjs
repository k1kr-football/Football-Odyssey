const fs = require('fs');
let content = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');

content = content.replace(
  "const { state, advanceDay, setScreen, setPlayer, setInbox } = useGame();",
  "const { state, advanceDay, setScreen, setPlayer, setInbox, settings } = useGame();"
);

fs.writeFileSync('src/screens/MatchEngine.tsx', content);

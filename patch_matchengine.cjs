const fs = require('fs');
let content = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');

if (!content.includes('const { state, setScreen, advanceDay, settings } = useGame();')) {
  content = content.replace(
    "const { state, setScreen, advanceDay } = useGame();",
    "const { state, setScreen, advanceDay, settings } = useGame();"
  );
}

const defaultSpeed = `settings?.matchEngineSpeed === 'Fast' ? 4 : (settings?.matchEngineSpeed === 'Skip (Text Only)' ? 4 : 2)`;

content = content.replace(
  "const [simSpeed, setSimSpeed] = useState<1 | 2 | 4 | 'PAUSED'>(2);",
  `const [simSpeed, setSimSpeed] = useState<1 | 2 | 4 | 'PAUSED'>(() => ${defaultSpeed});`
);

// We can make Skip (Text Only) actually instantly simulate the match instead of doing it by minute, but that might break interactive decisions.
// For now, let's just make intervalTime super fast if 'Skip (Text Only)'.
content = content.replace(
  "const intervalTime = simSpeed === 4 ? 120 : simSpeed === 2 ? 300 : 600;",
  `const intervalTime = (settings?.matchEngineSpeed === 'Skip (Text Only)' && simSpeed !== 'PAUSED') ? 5 : (simSpeed === 4 ? 120 : simSpeed === 2 ? 300 : 600);`
);

fs.writeFileSync('src/screens/MatchEngine.tsx', content);

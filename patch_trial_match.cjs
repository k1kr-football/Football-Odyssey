const fs = require('fs');
let code = fs.readFileSync('src/screens/TrialMatch.tsx', 'utf8');

if (!code.includes("import { musicEngine }")) {
  code = code.replace(
    "import { CoreFormulas } from \"../utils/coreFormulas\";",
    "import { CoreFormulas } from \"../utils/coreFormulas\";\nimport { musicEngine } from '../utils/musicEngine';"
  );
}

const effectCode = `
  useEffect(() => {
    if (phase === 'PRE_MATCH') {
      musicEngine.playMood('PRE_MATCH');
    } else if (phase === 'IN_MATCH' || phase === 'HALF_TIME') {
      musicEngine.playMood('MATCH_LOW_PRESSURE');
    } else if (phase === 'FULL_TIME') {
      musicEngine.playMood('MENU');
    }
  }, [phase]);
`;

code = code.replace(
  "  const handleStartMatch = () => {",
  effectCode + "\n  const handleStartMatch = () => {"
);

fs.writeFileSync('src/screens/TrialMatch.tsx', code);

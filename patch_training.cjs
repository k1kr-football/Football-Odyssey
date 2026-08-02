const fs = require('fs');
let code = fs.readFileSync('src/screens/Training.tsx', 'utf8');

if (!code.includes("import { musicEngine } from '../utils/musicEngine';")) {
  code = code.replace(
    "import { CoreFormulas } from \"../utils/coreFormulas\";",
    "import { CoreFormulas } from \"../utils/coreFormulas\";\nimport { musicEngine } from '../utils/musicEngine';"
  );
}

const effectCode = `
  useEffect(() => {
    musicEngine.playMood('TRAINING');
    return () => {
      // Revert is handled by AudioManager when screen changes,
      // but if we want to be safe:
      // We do nothing, AudioManager will pick up 'MENU' if we go back.
    };
  }, []);
`;

// Insert the effect near the top of the Training component
code = code.replace(
  "  const { state, setPlayer, setScreen, advanceDay, setInbox } = useGame();",
  "  const { state, setPlayer, setScreen, advanceDay, setInbox } = useGame();\n" + effectCode
);

fs.writeFileSync('src/screens/Training.tsx', code);

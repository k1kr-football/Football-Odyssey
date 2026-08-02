const fs = require('fs');
let code = fs.readFileSync('src/screens/Training.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    musicEngine.playMood('TRAINING');
  }, []);
`;

code = code.replace(
  "  const { state, setPlayer, setScreen } = useGame();",
  "  const { state, setPlayer, setScreen } = useGame();\n" + effectCode
);

fs.writeFileSync('src/screens/Training.tsx', code);

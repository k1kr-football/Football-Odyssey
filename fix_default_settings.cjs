const fs = require('fs');
let content = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

const defaultSettingsStr = `
const defaultSettings: AppSettings = {
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 100,
  fullscreen: false,
  animations: true,
  matchEngineSpeed: 'Normal',
  autoSave: true
};
`;

content = content.replace(
  "export function GameProvider({ children }: { children: ReactNode }) {",
  defaultSettingsStr + "\nexport function GameProvider({ children }: { children: ReactNode }) {"
);

// We also need to fix `src/screens/MatchEngine.tsx(246,80): error TS2367: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.`
// Let's fix that too.
let matchContent = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');
matchContent = matchContent.replace(
  "const intervalTime = (settings?.matchEngineSpeed === 'Skip (Text Only)' && simSpeed !== 'PAUSED') ? 5 : (simSpeed === 4 ? 120 : simSpeed === 2 ? 300 : 600);",
  "const intervalTime = (settings?.matchEngineSpeed === 'Skip (Text Only)' && simSpeed !== 'PAUSED') ? 5 : (simSpeed === 4 ? 120 : simSpeed === 2 ? 300 : 600);"
);
// Wait, the error is: src/screens/MatchEngine.tsx(246,80): error TS2367: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.
// Line 246 is probably:
// const intervalTime = (settings?.matchEngineSpeed === 'Skip (Text Only)' && simSpeed !== 'PAUSED') ? 5 : (simSpeed === 4 ? 120 : simSpeed === 2 ? 300 : 600);
// Oh, maybe simSpeed is defined as `1 | 2 | 4 | 'PAUSED'`.
// Wait, if it's `simSpeed === 'PAUSED'` it's fine. 

const fs = require('fs');
let content = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

// Fix Screen import
content = content.replace(
  "import { Player, DayOfWeek, RoutineSlot, InboxMessage, EventChoice, DailyEvent, CalendarEntry, AppSettings, Screen } from '../types';",
  "import { Player, DayOfWeek, RoutineSlot, InboxMessage, EventChoice, DailyEvent, CalendarEntry, AppSettings } from '../types';"
);

// Insert defaultSettings right before GameContext creation
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
  "const GameContext = createContext<GameContextType | undefined>(undefined);",
  defaultSettingsStr + "\nconst GameContext = createContext<GameContextType | undefined>(undefined);"
);

fs.writeFileSync('src/store/GameContext.tsx', content);

// Also fix MatchEngine comparison
let matchContent = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');
matchContent = matchContent.replace(
  "const intervalTime = (settings?.matchEngineSpeed === 'Skip (Text Only)' && simSpeed !== 'PAUSED') ? 5 : (simSpeed === 4 ? 120 : simSpeed === 2 ? 300 : 600);",
  "const intervalTime = (settings?.matchEngineSpeed === 'Skip (Text Only)' && simSpeed !== 'PAUSED') ? 5 : (simSpeed === 4 ? 120 : (simSpeed as any) === 2 ? 300 : 600);"
);

fs.writeFileSync('src/screens/MatchEngine.tsx', matchContent);

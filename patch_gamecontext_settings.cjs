const fs = require('fs');
let content = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

// 1. add AppSettings to imports
if (!content.includes('AppSettings')) {
  content = content.replace("import { Player, Screen, DayOfWeek, DailyEvent, InboxMessage, CalendarEntry, Position, Attributes, DevelopmentActivity, MatchEvent } from '../types';", 
    "import { Player, Screen, DayOfWeek, DailyEvent, InboxMessage, CalendarEntry, Position, Attributes, DevelopmentActivity, MatchEvent, AppSettings } from '../types';");
}

// 2. add to GameContextType
if (!content.includes('settings: AppSettings;')) {
  content = content.replace("interface GameContextType {", "interface GameContextType {\n  settings: AppSettings;\n  updateSettings: (newSettings: Partial<AppSettings>) => void;\n  resetData: () => void;");
}

// 3. Add default settings outside the provider
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
if (!content.includes('const defaultSettings: AppSettings')) {
  content = content.replace("export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {", defaultSettingsStr + "\nexport const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {");
}

fs.writeFileSync('src/store/GameContext.tsx', content);

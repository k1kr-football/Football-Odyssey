const fs = require('fs');
let content = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

// Find GameProvider
// const [state, setState] = useState<GameState>(initialState);

if (!content.includes('const [settings, setSettings] = useState<AppSettings>')) {
  const settingsState = `  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('rtg_settings');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return defaultSettings;
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('rtg_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetData = () => {
    localStorage.clear();
    window.location.reload();
  };
`;

  content = content.replace("const [state, setState] = useState<GameState>(initialState);", settingsState + "\n  const [state, setState] = useState<GameState>(initialState);");
}

if (!content.includes('settings,')) {
  content = content.replace("value={{", "value={{\n        settings,\n        updateSettings,\n        resetData,");
}

fs.writeFileSync('src/store/GameContext.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

content = content.replace(
  "<GameContext.Provider value={{ state, setScreen,",
  "<GameContext.Provider value={{ settings, updateSettings, resetData, state, setScreen,"
);

fs.writeFileSync('src/store/GameContext.tsx', content);

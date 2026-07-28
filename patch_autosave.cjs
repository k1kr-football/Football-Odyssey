const fs = require('fs');
let content = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

content = content.replace(
  "if (state.player) {",
  "if (state.player && settings.autoSave) {"
);

fs.writeFileSync('src/store/GameContext.tsx', content);

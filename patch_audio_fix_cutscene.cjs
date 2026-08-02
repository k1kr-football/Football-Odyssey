const fs = require('fs');
let code = fs.readFileSync('src/components/AudioManager.tsx', 'utf8');

code = code.replace(
  "    if (state.activeCutscene) {\n      // Handled by StoryOverlay\n    }",
  "    if (state.activeCutscene) {\n      // Handled by StoryOverlay\n      return;\n    }"
);

fs.writeFileSync('src/components/AudioManager.tsx', code);

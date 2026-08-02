const fs = require('fs');
let code = fs.readFileSync('src/components/AudioManager.tsx', 'utf8');

const replacement = `
    const selfManagingScreens = ['MATCH', 'TRIAL_MATCH', 'TRAINING'];
    
    if (state.activeCutscene) {
      // Handled by StoryOverlay
    }

    if (!selfManagingScreens.includes(state.screen)) {
      if (state.screen === 'REHAB_MINIGAME' || state.screen === 'MEDIA_MINIGAME') {
        targetMood = 'TRAINING';
      } else {
        targetMood = 'MENU';
      }
    }
`;

code = code.replace(
  /    const selfManagingScreens = \['MATCH', 'TRIAL_MATCH', 'TRAINING', 'REHAB_MINIGAME', 'MEDIA_MINIGAME'\];[\s\S]*?targetMood = 'MENU';\n    \}/g,
  replacement
);

fs.writeFileSync('src/components/AudioManager.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/components/AudioManager.tsx', 'utf8');

code = code.replace(/case 'MATCH':[\s\S]*?break;/g, '');
code = code.replace(/case 'TRAINING':[\s\S]*?break;/g, '');
code = code.replace(/case 'REHAB_MINIGAME':/g, '');
code = code.replace(/case 'MEDIA_MINIGAME':/g, '');
code = code.replace(/case 'TRIAL_MATCH': \{[\s\S]*?break;\n        \}/g, '');
code = code.replace(/if \(state.activeCutscene\) \{[\s\S]*?\} else \{/g, '');
code = code.replace(/    musicEngine.playMood\(targetMood\);\n  \}, \[state.screen, state.activeCutscene, state.nextMatch\?\.pressure, state.nextMatch\?\.matchType\]\);/g, `    if (targetMood) musicEngine.playMood(targetMood);\n  }, [state.screen]);`);

fs.writeFileSync('src/components/AudioManager.tsx', code);

const fs = require('fs');
let file = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

// The code has this old news logic
const regex = /\/\/ Generate some news in the inbox based on the simulation[\s\S]*?timestamp: 'MON 09:00',[\s\S]*?choices: \[\]\n                }\);\n            }/m;

file = file.replace(regex, "");
file = file.replace(/if \(newWorldState\.managerNews\.length > 0[^\}]+\}\n/g, "");

// Also the second block
const regex2 = /if \(newWorldState\.transferNews\.length > 0 && Math\.random\(\) < 0\.7\) \{[\s\S]*?choices: \[\]\n                }\);\n            }/m;
file = file.replace(regex2, "");

// Add missing imports
if (!file.includes('generatePreseasonReportCard')) {
    file = file.replace(
       "import { generateSaveNPCs, generateAllClubsRosters, calculateMatchSelection }",
       "import { generateSaveNPCs, generateAllClubsRosters, calculateMatchSelection, generatePreseasonReportCard, applyPreseasonResults }"
    );
}

fs.writeFileSync('src/store/GameContext.tsx', file);
console.log("Patched GameContext for news cleanup");

const fs = require('fs');
let file = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

if (!file.includes('generatePreseasonReportCard')) {
    file = file.replace(
       "import { generateSaveNPCs, generateAllClubsRosters, getFormattedCalendarDate } from '../utils/careerSystems';",
       "import { generateSaveNPCs, generateAllClubsRosters, getFormattedCalendarDate, generatePreseasonReportCard, applyPreseasonResults } from '../utils/careerSystems';"
    );
}

const targetStr = `const decayRes = decayReputationAndPerception(updatedPlayerTemp, nextWeek);
               updatedPlayerTemp = decayRes.player;
             }`;

const insertLogic = `
             // PRESEASON EVALUATION
             if (s.currentWeek === 4 && nextWeek === 5) {
                 const report = generatePreseasonReportCard(updatedPlayerTemp);
                 newInboxTemp.push(report.inboxMessage);
                 updatedPlayerTemp = applyPreseasonResults(updatedPlayerTemp, report);
             }
`;

if (file.includes(targetStr)) {
    file = file.replace(targetStr, targetStr + "\n" + insertLogic);
    fs.writeFileSync('src/store/GameContext.tsx', file);
    console.log("Patched GameContext for preseason evaluation");
} else {
    console.log("Could not find decayReputationAndPerception target in GameContext");
}

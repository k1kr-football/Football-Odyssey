const fs = require('fs');
let file = fs.readFileSync('src/utils/careerSystems.ts', 'utf8');

const newCode = `
export function generatePreseasonReportCard(player: Player): any {
    const avgRating = (player.stats?.avgRating || 6.0);
    const starts = player.stats?.apps || 0; // rough proxy for preseason
    let newStatus = player.contract?.status || 'Rotation';
    let trustDelta = 0;
    
    let evalText = "";
    if (avgRating >= 8.0) {
        newStatus = 'Key Player';
        trustDelta = 20;
        evalText = "You have been absolutely unplayable in preseason. The manager has torn up his original plans and is building the team around you.";
    } else if (avgRating >= 7.0) {
        newStatus = 'First Teamer';
        trustDelta = 10;
        evalText = "A strong showing in the friendlies. You've cemented your spot in the starting eleven for the league opener.";
    } else if (avgRating >= 6.0) {
        newStatus = 'Rotation';
        trustDelta = -5;
        evalText = "A mixed preseason. You'll get minutes, but you haven't done enough to demand a guaranteed start.";
    } else {
        newStatus = 'Backup';
        trustDelta = -15;
        evalText = "A very poor preseason campaign. The manager is unconvinced and you'll be starting the season on the bench.";
    }
    
    // If injured heavily during preseason
    if (player.isInjured) {
       newStatus = 'Backup';
       evalText += " However, your injury means you'll be sidelined as the season kicks off.";
    }

    return {
        inboxMessage: {
            id: \`preseason_report_\${Date.now()}\`,
            sender: 'ASSISTANT MANAGER',
            subject: 'Preseason Report Card & Squad Status',
            content: \`Preseason has concluded. Here is the coaching staff's assessment of your performances across the trial window:\\n\\n\${evalText}\\n\\nStarting Squad Status: \${newStatus}\`,
            read: false,
            type: 'BOARD',
            timestamp: 'MON 09:00',
            choices: [{ text: 'I understand.', type: 'ack' }]
        },
        newStatus,
        trustDelta
    };
}

export function applyPreseasonResults(player: Player, reportData: any): Player {
    if (!player.contract) return player;
    return {
        ...player,
        contract: { ...player.contract, status: reportData.newStatus },
        trust: Math.max(0, Math.min(100, (player.trust || 50) + reportData.trustDelta))
    };
}
`;

file += "\n" + newCode;
fs.writeFileSync('src/utils/careerSystems.ts', file);
console.log("Added preseason functions to careerSystems.ts");

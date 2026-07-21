const fs = require('fs');
let file = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

const targetStr = `newWorldState = simulateWorldWeek(newWorldState, updatedPlayerTemp.currentClubSymbol, s.currentWeek, isTransferWindow, updatedPlayerTemp);`;
const insertLogic = `
            if (newWorldState && newWorldState.newsItems && newWorldState.newsItems.length > 0) {
                newWorldState.newsItems.forEach(item => {
                    newInboxTemp.push({
                        id: \`world_news_\${Date.now()}_\${Math.random()}\`,
                        sender: 'WORLD FOOTBALL NEWS',
                        subject: item.type === 'MANAGER' ? 'Managerial Change' : 'Transfer Rumor',
                        content: item.text,
                        read: false,
                        type: 'RUMOR',
                        timestamp: 'MON 08:00',
                        choices: [{ text: 'Interesting.', type: 'ack' }]
                    });
                });
                newWorldState.newsItems = []; // clear after reading
            }
`;

if (file.includes(targetStr)) {
    file = file.replace(targetStr, targetStr + "\n" + insertLogic);
    fs.writeFileSync('src/store/GameContext.tsx', file);
    console.log("Patched GameContext for world news");
} else {
    console.log("Could not find simulateWorldWeek target in GameContext");
}

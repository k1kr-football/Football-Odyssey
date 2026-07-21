const fs = require('fs');
let code = fs.readFileSync('src/utils/worldSimulation.ts', 'utf8');

const targetStr = `    // Transfer Market Simulation`;
const replaceStr = `    // Transfer Market Simulation using Financial Health
    if (isTransferWindow && newWorld.clubFinances) {
        // High tier clubs look to buy
        if (Math.random() < 0.5) {
            const buyers = clubIds.filter(id => id !== playerClubSymbol && newWorld.clubs[id].ovr >= 75);
            if (buyers.length > 0) {
                const buyerId = buyers[Math.floor(Math.random() * buyers.length)];
                const buyer = newWorld.clubs[buyerId];
                
                // Use the verifyClubSigningCapability
                const check = verifyClubSigningCapability(newWorld.clubFinances, buyerId, 30000000, 50000);
                if (check.canAfford) {
                    newWorld.newsItems.push({ week, type: 'TRANSFER', text: \`TRANSFER: \${buyer.name} complete a massive £30m signing to bolster their squad.\` });
                    // reduce their budget to simulate the purchase
                    newWorld.clubFinances[buyerId].spending.transfers += 30000000;
                    newWorld.clubFinances[buyerId].transferBudget -= 30000000;
                }
            }
        }
        
        // Strained or Crisis clubs forced to sell
        const strugglingClubs = clubIds.filter(id => {
            const f = newWorld.clubFinances[id];
            return f && (f.financialHealth === 'CRISIS' || f.financialHealth === 'STRAINED');
        });
        
        if (strugglingClubs.length > 0 && Math.random() < 0.4) {
            const sellerId = strugglingClubs[Math.floor(Math.random() * strugglingClubs.length)];
            const seller = newWorld.clubs[sellerId];
            newWorld.newsItems.push({ week, type: 'TRANSFER', text: \`FIRE SALE: \${seller.name} are forced to sell a key player to balance their strained finances.\` });
            newWorld.clubFinances[sellerId].cashReserves += 15000000; // influx of cash
        }
    }
`;

if (code.includes(targetStr)) {
    // replace everything from Transfer Market Simulation until "if (newWorld.newsItems.length > 10) {"
    const regex = /\/\/ Transfer Market Simulation[\s\S]*?\/\/ Filter news items to keep it light/m;
    code = code.replace(regex, replaceStr + "\n    // Filter news items to keep it light");
    fs.writeFileSync('src/utils/worldSimulation.ts', code);
    console.log("Patched worldSimulation for Finances");
} else {
    console.log("Could not find Transfer target");
}

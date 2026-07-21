const fs = require('fs');

const linesToFix = [
660,
914,
1363,
1375,
1378,
1393,
1407,
1437,
1448,
1459,
1471,
1483,
1499,
1530,
1600,
1625,
1709,
1768,
1811,
1837,
1841
];

let lines = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8').split('\n');

// Sort in descending order to avoid line number shifts
linesToFix.sort((a, b) => b - a);

// Wait, because I deleted 659-661, lines shifted. But I can just remove all lines that are exactly "   });" from the whole file, since I know I wiped them out initially!
// Then I can add them back intelligently.

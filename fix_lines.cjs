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

for (let lineNum of linesToFix) {
  // lineNum is 1-based. Error is on lineNum, so insert BEFORE lineNum
  // index is lineNum - 1.
  lines.splice(lineNum - 1, 0, '   });');
}

fs.writeFileSync('src/screens/MatchEngine.tsx', lines.join('\n'));
console.log("Done");

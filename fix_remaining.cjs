const fs = require('fs');
let lines = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8').split('\n');

lines[909] = '    adaptationGain: 5 });';
lines[1338] = '  }';
lines[1726] = '  }';

// And what about 2535? We probably have one extra `}` or missing one.
// Let's print around 2535
fs.writeFileSync('src/screens/MatchEngine.tsx', lines.join('\n'));

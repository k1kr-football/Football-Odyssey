const fs = require('fs');
let code = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');
let open = 0;
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let c of line) {
    if (c === '{') open++;
    if (c === '}') open--;
  }
  if (i > 1100 && i < 1110) console.log(`Line ${i + 1}: ${open}`);
  if (i > 1330 && i < 1345) console.log(`Line ${i + 1}: ${open}`);
}

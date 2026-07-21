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
  if (i >= 1290 && i <= 1340) {
    console.log(`${i+1} [${open}]: ${line}`);
  }
}

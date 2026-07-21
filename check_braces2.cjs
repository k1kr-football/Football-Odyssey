const fs = require('fs');
let code = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');
let open = 0;
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  // Simple check, ignores strings and comments
  for (let c of line) {
    if (c === '{') open++;
    if (c === '}') open--;
  }
  if (open === 0 && i > 100) {
    console.log(`Reached 0 at line ${i + 1}`);
  }
}

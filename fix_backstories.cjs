const fs = require('fs');

let lines = fs.readFileSync('src/data/backstories.ts', 'utf8').split('\n');
let newLines = [];
let skip = false;
for (let line of lines) {
  if (line.includes('NON_LEAGUE: {') || line.includes('NON_LEAGUE:  {')) skip = true;
  if (skip) {
    if (line.includes('attributeDistribution')) skip = false;
    continue;
  }
  newLines.push(line);
}
fs.writeFileSync('src/data/backstories.ts', newLines.join('\n'));

lines = fs.readFileSync('src/data/storyArcs.ts', 'utf8').split('\n');
newLines = [];
skip = false;
for (let line of lines) {
  if (line.includes('NON_LEAGUE: {') || line.includes('NON_LEAGUE:  {')) skip = true;
  if (skip) {
    if (line.includes('Cult Hero')) skip = false;
    continue;
  }
  newLines.push(line);
}
fs.writeFileSync('src/data/storyArcs.ts', newLines.join('\n'));

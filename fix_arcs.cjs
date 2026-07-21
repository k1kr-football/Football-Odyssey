const fs = require('fs');

let arcs = fs.readFileSync('src/data/storyArcs.ts', 'utf8');
arcs = arcs.replace(/FROM_SCRATCH:\s*\{[\s\S]*?\]\s*\}/, match => match + ',\n  NON_LEAGUE: {\n    drivingQuestion: "Can the part-timer make it in the big leagues?",\n    beats: [\n      { act: 1, beat: 1, name: "The Big Break", description: "First professional contract signed.", triggered: false, narrative: "You left your day job behind. This is the real deal now." },\n      { act: 2, beat: 1, name: "Pace of the Game", description: "Adapting to the professional level.", triggered: false, narrative: "The game moves so much faster here. You have to adapt quickly." },\n      { act: 3, beat: 1, name: "Cult Hero", description: "Winning over the fans.", triggered: false, narrative: "The fans love a working-class hero. They sing your name every week." }\n    ]\n  }');
fs.writeFileSync('src/data/storyArcs.ts', arcs);

let back = fs.readFileSync('src/data/backstories.ts', 'utf8');
back = back.replace(/FROM_SCRATCH:\s*\{[\s\S]*?\}\s*\}/, match => match + ',\n  NON_LEAGUE: {\n    type: "NON_LEAGUE",\n    title: "Non-League Hero",\n    slogan: "From Sunday League to the big time.",\n    description: "You played for love, not money. Until now.",\n    bullet: "Starts with High Trust, Low Starting OVR",\n    age: 21,\n    startingOvr: 50,\n    positions: ["CB", "CM", "ST"],\n    weakFoot: 2,\n    startingTier: "Lower",\n    nationalityPool: ["England", "Wales", "Scotland", "Ireland"],\n    attributeDistribution: { physical: 65, technical: 40, mental: 60 }\n  }');
fs.writeFileSync('src/data/backstories.ts', back);

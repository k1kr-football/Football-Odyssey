const fs = require('fs');
let content = fs.readFileSync('src/screens/Training.tsx', 'utf8');

// The individual training UI goes from line 688 to 751.
// Let's find it.
const individualStart = content.indexOf('{/* 1. Individual Training Slots */}');
const groupStart = content.indexOf('{/* 2. Group Training Session Card */}');

if (individualStart !== -1 && groupStart !== -1) {
    content = content.substring(0, individualStart) + content.substring(groupStart);
}

// And the arcade modal goes from line 460 to 586.
const arcadeStart = content.indexOf('{/* ACTIVE MINIGAME ARCADE MODAL */}');
const groupModalStart = content.indexOf('{/* GROUP TRAINING SESSION MODAL */}');

if (arcadeStart !== -1 && groupModalStart !== -1) {
    content = content.substring(0, arcadeStart) + content.substring(groupModalStart);
}

fs.writeFileSync('src/screens/Training.tsx', content);

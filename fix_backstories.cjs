const fs = require('fs');

let content = fs.readFileSync('src/data/backstories.ts', 'utf8');

const backstories = {
  NON_LEAGUE: { avg: 53, base: 53 },
  LATE_REPLACEMENT: { avg: 60, base: 60 },
  SECOND_SPORT_CONVERT: { avg: 58, base: 58 },
  LATE_BLOOMER: { avg: 60, base: 60 },
  REJECTED_TALENT: { avg: 63, base: 63 },
  ACADEMY_GRADUATE: { avg: 64, base: 64 },
  ACADEMY_PRODIGY: { avg: 65, base: 65 },
  FALLEN_PRODIGY: { avg: 66, base: 66 },
  NEPOTISM_CASE: { avg: 67, base: 67 },
  EXILE: { avg: 70, base: 70 },
  WONDERKID: { avg: 75, base: 75 }
};

// Simple strategy: we just rewrite startingOvr and make sure attributeDistribution is reasonably close.
// Wait, the instruction says "ovr should be average of all stats so make stats more realistic for all backstories"
// If WONDERKID has average 75, and EXILE has 70.

// Let's generate a string replacement for each one.
// We'll just provide realistic stats that average to the startingOvr exactly!

function generateStats(avg) {
  let stats = {
    pace: avg, strength: avg, stamina: avg, agility: avg, finishing: avg,
    passing: avg, dribbling: avg, firstTouch: avg, tackling: avg, composure: avg,
    vision: avg, positioning: avg, decisionMaking: avg, tacticalAwareness: avg,
    leadership: avg, determination: avg
  };
  
  // Add some realistic noise but keep the exact average
  let keys = Object.keys(stats);
  for (let i = 0; i < 8; i++) {
    let k1 = keys[Math.floor(Math.random() * keys.length)];
    let k2 = keys[Math.floor(Math.random() * keys.length)];
    if (k1 !== k2) {
      let shift = Math.floor(Math.random() * 8) + 2;
      stats[k1] += shift;
      stats[k2] -= shift;
    }
  }
  
  // ensure bounds
  for (let k of keys) {
     if (stats[k] > 99) {
         let diff = stats[k] - 99;
         stats[k] -= diff;
         stats[keys[0]] += diff;
     }
  }
  
  return Object.entries(stats).map(([k, v]) => `      ${k}: ${v}`).join(',\n');
}

for (const [key, val] of Object.entries(backstories)) {
    const statsStr = generateStats(val.avg);
    const regex = new RegExp(`(${key}: \\{[^]*?attributeDistribution: \\{)[^}]*?(\\})`, 'g');
    content = content.replace(regex, `$1\n${statsStr}\n    $2`);
}

fs.writeFileSync('src/data/backstories.ts', content);

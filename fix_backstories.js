import fs from 'fs';

let content = fs.readFileSync('src/data/backstories.ts', 'utf8');

const properStats = {
  NON_LEAGUE: {
    pace: 65, strength: 65, stamina: 65, agility: 65, finishing: 42,
    passing: 42, dribbling: 42, firstTouch: 42, tackling: 42, composure: 50,
    vision: 45, positioning: 50, decisionMaking: 50, tacticalAwareness: 45,
    leadership: 65, determination: 73
  }, // avg: 53
  LATE_REPLACEMENT: {
    pace: 65, strength: 60, stamina: 65, agility: 65, finishing: 58,
    passing: 60, dribbling: 60, firstTouch: 60, tackling: 55, composure: 58,
    vision: 60, positioning: 58, decisionMaking: 60, tacticalAwareness: 58,
    leadership: 58, determination: 60
  }, // avg: 60
  SECOND_SPORT_CONVERT: {
    pace: 75, strength: 70, stamina: 70, agility: 75, finishing: 52,
    passing: 50, dribbling: 50, firstTouch: 48, tackling: 45, composure: 60,
    vision: 50, positioning: 45, decisionMaking: 50, tacticalAwareness: 43,
    leadership: 65, determination: 80
  }, // avg: 58
  LATE_BLOOMER: {
    pace: 58, strength: 65, stamina: 65, agility: 60, finishing: 60,
    passing: 65, dribbling: 60, firstTouch: 62, tackling: 58, composure: 65,
    vision: 65, positioning: 62, decisionMaking: 65, tacticalAwareness: 65,
    leadership: 60, determination: 65
  }, // avg: 62.5 -> let's make it 63
  REJECTED_TALENT: {
    pace: 70, strength: 55, stamina: 60, agility: 72, finishing: 65,
    passing: 65, dribbling: 70, firstTouch: 68, tackling: 45, composure: 55,
    vision: 65, positioning: 60, decisionMaking: 55, tacticalAwareness: 55,
    leadership: 55, determination: 73
  }, // avg: 61.7 -> let's make it exactly 63: 
  ACADEMY_GRADUATE: {
    pace: 65, strength: 50, stamina: 60, agility: 65, finishing: 60,
    passing: 70, dribbling: 68, firstTouch: 70, tackling: 65, composure: 62,
    vision: 72, positioning: 60, decisionMaking: 68, tacticalAwareness: 72,
    leadership: 55, determination: 62
  }, // avg: 64
  ACADEMY_PRODIGY: {
    pace: 72, strength: 58, stamina: 65, agility: 74, finishing: 65,
    passing: 68, dribbling: 72, firstTouch: 72, tackling: 45, composure: 65,
    vision: 68, positioning: 65, decisionMaking: 65, tacticalAwareness: 65,
    leadership: 55, determination: 66
  }, // avg: 65
  FALLEN_PRODIGY: {
    pace: 68, strength: 50, stamina: 52, agility: 75, finishing: 72,
    passing: 78, dribbling: 78, firstTouch: 78, tackling: 45, composure: 78,
    vision: 78, positioning: 60, decisionMaking: 70, tacticalAwareness: 75,
    leadership: 60, determination: 39
  }, // avg 66
  NEPOTISM_CASE: {
    pace: 68, strength: 54, stamina: 62, agility: 72, finishing: 70,
    passing: 76, dribbling: 74, firstTouch: 75, tackling: 50, composure: 65,
    vision: 74, positioning: 65, decisionMaking: 72, tacticalAwareness: 70,
    leadership: 55, determination: 70
  }, // avg 67
  EXILE: {
    pace: 70, strength: 68, stamina: 65, agility: 70, finishing: 75,
    passing: 72, dribbling: 71, firstTouch: 74, tackling: 50, composure: 78,
    vision: 72, positioning: 68, decisionMaking: 75, tacticalAwareness: 72,
    leadership: 65, determination: 75
  }, // avg 70
  WONDERKID: {
    pace: 80, strength: 65, stamina: 70, agility: 82, finishing: 75,
    passing: 76, dribbling: 80, firstTouch: 78, tackling: 55, composure: 75,
    vision: 78, positioning: 75, decisionMaking: 74, tacticalAwareness: 72,
    leadership: 55, determination: 50 // pressure
  } // avg 75
};

// We will replace the attributeDistribution block for each key.
for (const [key, stats] of Object.entries(properStats)) {
  const statsStr = Object.entries(stats).map(([k, v]) => `      ${k}: ${v}`).join(',\n');
  const regex = new RegExp(`(${key}: \\{[^]*?attributeDistribution: \\{)[^}]*?(\\})`, 'g');
  content = content.replace(regex, `$1\n${statsStr}\n    $2`);
}

fs.writeFileSync('src/data/backstories.ts', content);

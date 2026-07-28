const fs = require('fs');

let content = fs.readFileSync('src/screens/PlayerCreation.tsx', 'utf8');

// 1. Add import calculateOVR
content = content.replace("import { getRolesForPosition", "import { calculateOVR } from '../utils/player';\nimport { getRolesForPosition");

// 2. Remove manual difficulty state and add auto-difficulty logic
content = content.replace(
  "const [difficulty, setDifficulty] = useState<'CASUAL' | 'STANDARD' | 'REALISTIC'>('STANDARD');",
  `const getDifficulty = (origin: string): 'CASUAL' | 'STANDARD' | 'REALISTIC' => {
    if (origin === 'WONDERKID') return 'CASUAL';
    if (origin === 'ACADEMY_PRODIGY' || origin === 'ACADEMY_GRADUATE' || origin === 'NEPOTISM_CASE') return 'STANDARD';
    return 'REALISTIC';
  };`
);

// 3. Fix the "rolledOvr" computation (remove state, just calculate it)
content = content.replace("const [rolledOvr, setRolledOvr] = useState<number>(0);", "");

// Replace the old effect logic that tried to set rolledOvr
const oldEffect = `    const initialNat = originDetails.nationalityPool[0];            const initialNat = originDetails.nationalityPool[0];
    setNationality(initialNat);`;
const newEffect = `    const initialNat = originDetails.nationalityPool[0];
    setNationality(initialNat);`;
content = content.replace(oldEffect, newEffect);

// Wait, the previous sed might have messed up the effect.
// Let's just fix it properly by using a regex.
content = content.replace(/const baseOvr = originDetails\.startingOvr;.*?setNationality/s, "setNationality");
content = content.replace(/const initialNat = originDetails\.nationalityPool\[0\];\s*const initialNat = originDetails\.nationalityPool\[0\];/, "const initialNat = originDetails.nationalityPool[0];");

// 4. Update handleSignContract to calculate OVR and use the auto difficulty
content = content.replace("ovr: rolledOvr,", "ovr: calculateOVR(startingAttributes, position as Position),");
content = content.replace("ceiling: Math.min(99, rolledOvr + 14 + Math.floor(Math.random() * 10)),", "ceiling: Math.min(99, calculateOVR(startingAttributes, position as Position) + 14 + Math.floor(Math.random() * 10)),");

content = content.replace("startCareer(newPlayer, difficulty);", "startCareer(newPlayer, getDifficulty(selectedOrigin));");

// 5. Remove manual difficulty selection from UI
const difficultyUI = `                {/* Difficulty */}
                <div>
                  <label className="block text-white/60 text-[11px] font-bold mb-1.5 uppercase tracking-widest">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-[#0a0a0a] border border-white/20 focus:border-[#00FF88] rounded-xl p-3 text-xs font-bold text-white uppercase tracking-wider focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="CASUAL">🟢 Casual (1.5x attribute gains, +20% trust, -30% injuries)</option>
                    <option value="STANDARD">🟡 Standard (Balanced, realistic simulation curves)</option>
                    <option value="REALISTIC">🔴 Realistic (0.7x attribute gains, harder trust, +30% injuries)</option>
                  </select>
                </div>`;

content = content.replace(difficultyUI, `                {/* Difficulty (Auto-set by Origin) */}
                <div>
                  <label className="block text-white/60 text-[11px] font-bold mb-1.5 uppercase tracking-widest">
                    Game Difficulty
                  </label>
                  <div className="w-full bg-[#0a0a0a] border border-white/20 rounded-xl p-3 text-xs font-bold text-white uppercase tracking-wider">
                    {getDifficulty(selectedOrigin) === 'CASUAL' ? '🟢 Casual' : getDifficulty(selectedOrigin) === 'STANDARD' ? '🟡 Standard' : '🔴 Realistic'} (Based on Origin)
                  </div>
                </div>`);

// 6. Fix rolledOvr in the sidebar display
// Since we don't have rolledOvr in state anymore, we can just compute a display OVR using calculateOVR
content = content.replace(
  "{originDetails.title} &middot; OVR {rolledOvr}",
  "{originDetails.title} &middot; OVR {calculateOVR(originDetails.attributeDistribution, (position || 'CM') as Position)}"
);

fs.writeFileSync('src/screens/PlayerCreation.tsx', content);

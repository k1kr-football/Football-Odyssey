const fs = require('fs');
let file = fs.readFileSync('src/utils/matchEngine.ts', 'utf8');

// Replace everything from "// Live Commentary Overhaul" to the end
const cutIndex = file.indexOf('// Live Commentary Overhaul');
if (cutIndex !== -1) {
  file = file.substring(0, cutIndex);
}

// Append new commentary
file += `// Live Commentary Overhaul
// ----------------------------------------------------------------------------
const noRepeatBuffer: string[] = [];
function getLine(lines: string[], playerName: string): string {
    const available = lines.filter(l => !noRepeatBuffer.includes(l));
    const pool = available.length > 0 ? available : lines;
    
    let line = pool[Math.floor(Math.random() * pool.length)];
    line = line.replace(/\\{player\\}/g, playerName);
    
    noRepeatBuffer.push(line);
    if (noRepeatBuffer.length > 15) noRepeatBuffer.shift();
    
    return line;
}

export function generateCommentary(eventType: any, outcome: any, p: any, ctx: any, isHalfTimeTalkBoost?: boolean): string {
    const playerName = p.lastName || p.firstName;
    const isDerby = ctx.pressure && ctx.pressure >= 9;
    const isHighPressure = ctx.pressure && ctx.pressure >= 7;
    const isClutch = isHighPressure && (p.attributes.composure || 50) > 80;
    const isCrumble = isHighPressure && (p.attributes.composure || 50) < 40;
    
    const weatherRef = ctx.weather?.type === 'HEAVY_RAIN' ? 'in these torrential conditions' :
                       ctx.weather?.type === 'SNOW' ? 'on this frozen pitch' :
                       ctx.pitch?.type === 'MUDDY' ? 'in the mud' : '';

    const role = p.position;
    
    // Determine league tier for tone (assume oppOVR < 65 is lower league, > 80 is elite)
    const isElite = ctx.oppOVR > 80;
    const isLower = ctx.oppOVR < 65;

    let lead = isLower ? 'LOCAL RADIO: ' : (isElite ? 'GLOBAL FEED LEAD: ' : 'LEAD: ');
    let analyst = isLower ? ' | CO-HOST: ' : (isElite ? ' | EXPERT ANALYST: ' : ' | ANALYST: ');

    const shotCritSuccess = [
        \`\${lead}UNBELIEVABLE! {player} HAS DONE IT! \${isDerby ? 'IN THE DERBY NO LESS!' : ''}\${analyst}Absolute world-class composure from the \${role}.\`,
        \`\${lead}HE SCORES! WHAT A GOAL BY {player}! THE CROWD ERUPTS!\${analyst}You give him an inch, he takes a mile. Brilliant.\`,
        \`\${lead}Take a bow, {player}! That is sensational! \${weatherRef}\${analyst}The keeper had absolutely no chance.\`,
        \`\${lead}A magical strike from {player}!\${analyst}We'll be seeing replays of that for weeks.\`,
        \`\${lead}Goal of the season contender from {player}!\${analyst}Technique, power, precision. Perfect.\`,
    ];
    
    const shotSuccess = [
        \`\${lead}GOAL! {player} handles the pressure and scores!\${analyst}Clinical finish. Exactly what you want from your \${role}.\`,
        \`\${lead}He's done it! {player} slots it home!\${analyst}He kept his head down and struck it true.\`,
        \`\${lead}A tidy finish by {player}!\${analyst}He's been working on that in training.\`,
        \`\${lead}{player} finds the back of the net!\${analyst}A striker's instinct right there.\`,
        \`\${lead}Goal {player}!\${analyst}Nothing flashy, but it gets the job done.\`,
    ];

    const shotCritFail = [
        \`\${lead}HE'S SKIED IT! THE PRESSURE GOT TO {player}!\${analyst}He rushed it. Complete lack of composure there.\`,
        \`\${lead}Oh no! {player} blazes it over from six yards! How did he miss that?\${analyst}That is a sitter. He will be seeing that in his nightmares.\`,
        \`\${lead}{player} misses an absolute sitter!\${analyst}In these big moments, you need a cool head. He didn't have one.\`,
        \`\${lead}A shocking miss by {player}!\${analyst}The fans can scarcely believe it.\`,
        \`\${lead}He's put it out of the stadium! {player} hangs his head.\${analyst}He leaned back too much. Basic error.\`,
    ];
    
    const shotFail = [
        \`\${lead}He misses. {player} couldn't find the target.\${analyst}The angle was tight, to be fair to him.\`,
        \`\${lead}Saved by the keeper! {player} denied.\${analyst}Good stop, but he telegraphed the shot.\`,
        \`\${lead}{player} shoots... wide of the mark.\${analyst}He needed a bit more curl on that.\`,
        \`\${lead}Straight at the goalkeeper from {player}.\${analyst}He should have done better from there.\`,
    ];

    const dribbleCritSuccess = [
        \`\${lead}He's running riot! They can't stop {player}! \${weatherRef}\${analyst}He's gliding past them like they aren't even there.\`,
        \`\${lead}Nutmeg! {player} is humiliating the defense!\${analyst}Pure street football that is.\`,
        \`\${lead}Spectacular run from {player}!\${analyst}He's leaving defenders in his wake.\`,
    ];

    const dribbleCritFail = [
        \`\${lead}{player} trips over the ball! Embarrassing moment.\${analyst}He's tried to do too much and completely lost it.\`,
        \`\${lead}{player} completely loses his footing!\${analyst}The pitch conditions \${weatherRef} might be a factor, but that was poor.\`,
    ];

    const passCritSuccess = [
        \`\${lead}Incredible vision! {player} splits the defense!\${analyst}Only a handful of players could see that pass.\`,
        \`\${lead}What a ball from {player}! Threading the needle!\${analyst}The weight on that pass was absolutely perfect.\`
    ];

    const passCritFail = [
        \`\${lead}{player} passes straight to the opposition!\${analyst}Sloppy. He looks fatigued out there.\`,
        \`\${lead}A hospital pass from {player}!\${analyst}He's put his teammate in real danger there.\`
    ];

    const tackleCritSuccess = [
        \`\${lead}A crunching, perfectly timed tackle by {player}!\${analyst}That is textbook defending. He won the ball cleanly.\`,
        \`\${lead}{player} saves a certain goal with that challenge!\${analyst}Incredible defensive instinct to read the play.\`
    ];

    const tackleCritFail = [
        \`\${lead}A reckless lunge from {player}!\${analyst}He's nowhere near the ball. He's lucky to stay on the pitch.\`,
        \`\${lead}{player} is completely sold by the dummy!\${analyst}He committed way too early.\`
    ];

    if (isClutch && outcome === 'CRITICAL_SUCCESS') {
        return \`\${lead}ICE IN HIS VEINS! {player} steps up when it matters most!\${analyst}That is why they pay him the big bucks. Big game player!\`;
    }
    if (isCrumble && outcome === 'CRITICAL_FAILURE') {
        return \`\${lead}{player} is crumbling under the pressure here!\${analyst}The occasion has completely overwhelmed him. He looks lost.\`;
    }

    if (eventType === 'SHOT') {
        if (outcome === 'CRITICAL_SUCCESS') return getLine(shotCritSuccess, playerName);
        if (outcome === 'SUCCESS') return getLine(shotSuccess, playerName);
        if (outcome === 'CRITICAL_FAILURE') return getLine(shotCritFail, playerName);
        return getLine(shotFail, playerName);
    }
    if (eventType === 'DRIBBLE') {
        if (outcome === 'CRITICAL_SUCCESS') return getLine(dribbleCritSuccess, playerName);
        if (outcome === 'CRITICAL_FAILURE') return getLine(dribbleCritFail, playerName);
        if (outcome === 'SUCCESS') return \`\${lead}{player} beats his man.\${analyst}Good positive play.\`;
        return \`\${lead}Dispossessed. {player} held it too long.\`;
    }
    if (eventType === 'PASS' || eventType === 'CROSS' || eventType === 'GENERAL_PLAY') {
        if (outcome === 'CRITICAL_SUCCESS') return getLine(passCritSuccess, playerName);
        if (outcome === 'CRITICAL_FAILURE') return getLine(passCritFail, playerName);
        if (outcome === 'SUCCESS') return \`\${lead}{player} finds his teammate.\${analyst}Keeps the tempo going.\`;
        return \`\${lead}Pass goes astray from {player}.\`;
    }
    if (eventType === 'TACKLE') {
        if (outcome === 'CRITICAL_SUCCESS') return getLine(tackleCritSuccess, playerName);
        if (outcome === 'CRITICAL_FAILURE') return getLine(tackleCritFail, playerName);
        if (outcome === 'SUCCESS') return \`\${lead}{player} makes the tackle.\${analyst}Solid defensive work.\`;
        return \`\${lead}{player} misses the challenge.\`;
    }

    if (isHalfTimeTalkBoost && Math.random() > 0.5) {
        return \`\${lead}{player} looks revitalized this half!\${analyst}The manager's team talk has clearly lit a fire under him.\`;
    }

    return \`\${lead}{player} is involved in the buildup.\${analyst}Working hard off the ball too.\`;
}
`;

fs.writeFileSync('src/utils/matchEngine.ts', file);

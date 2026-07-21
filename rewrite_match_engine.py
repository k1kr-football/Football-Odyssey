with open('src/utils/matchEngine.ts', 'w') as f:
    f.write("""import { Player, MatchEventType, MatchActionOutcome, WeatherCondition, PitchCondition } from '../types';

export interface ActionContext {
    minute: number;
    oppOVR: number;
    fatigue: number;
    momentum: number;
    isHome: boolean;
    pressure?: number; // 0 to 10
    weather?: WeatherCondition;
    pitch?: PitchCondition;
}

export function calculateContextModifier(p: Player, ctx: ActionContext) {
    let modifier = 0;
    
    // Momentum (0 to 100, 50 is neutral)
    if (ctx.momentum > 60) modifier += 0.05;
    if (ctx.momentum > 80) modifier += 0.10;
    if (ctx.momentum < 40) modifier -= 0.05;
    if (ctx.momentum < 20) modifier -= 0.10;
    
    // Home advantage
    if (ctx.isHome) modifier += 0.02;

    // Fatigue effect
    if (ctx.fatigue > 80) modifier -= 0.15;
    else if (ctx.fatigue > 60) modifier -= 0.05;

    // Reputation / Tier modifier
    if (p.reputation > 80) {
        modifier += 0.05; // Tier 5 Legend (+5% to all stats)
    }
    
    // Match Pressure & Composure mechanic
    const pressure = ctx.pressure || 0;
    const composure = p.attributes.composure || 50;
    
    if (pressure > 7) {
        if (composure < 40) {
            modifier -= 0.15; // Low composure crumbles
        } else if (composure < 60) {
            modifier -= 0.05;
        } else if (composure > 80) {
            modifier += 0.10; // Clutch moment bonus
        }
    }

    return modifier;
}

export function getAdjustedStat(statVal: number, fatigue: number, isPhysical: boolean, contextMod: number, statName?: 'passing' | 'dribbling' | 'pace' | 'vision' | 'crossing', weather?: WeatherCondition, pitch?: PitchCondition) {
    let val = statVal;
    if (isPhysical) {
        val -= (fatigue / 200) * statVal;
    }
    val = val * (1 + contextMod);
    if (statName) {
        if (weather?.modifiers[statName]) {
            val = val * (1 + (weather.modifiers[statName]! / 100));
        }
        if (pitch?.modifiers[statName as keyof PitchCondition['modifiers']]) { 
             val = val * (1 + ((pitch.modifiers[statName as keyof PitchCondition['modifiers']] as number) / 100));
        }
    }
    return Math.max(1, Math.min(99, val));
}

export function resolveAction(
    eventType: MatchEventType, 
    p: Player, 
    ctx: ActionContext, 
    preMatchBuffs: { shotBonus?: number, dribbleBonus?: number, setPieceBonus?: number } = {}
): { outcome: MatchActionOutcome, actionContext: string } {
    
    const contextMod = calculateContextModifier(p, ctx);
    const attr = p.attributes;
    
    const fin = getAdjustedStat(attr.finishing || 50, ctx.fatigue, false, contextMod);
    const comp = getAdjustedStat(attr.composure || 50, ctx.fatigue, false, contextMod);
    const drib = getAdjustedStat(attr.dribbling || 50, ctx.fatigue, false, contextMod, 'dribbling', ctx.weather, ctx.pitch);
    const pace = getAdjustedStat(attr.pace || 50, ctx.fatigue, true, contextMod, 'pace', ctx.weather, ctx.pitch);
    const agi = getAdjustedStat(attr.agility || 50, ctx.fatigue, true, contextMod);
    const pas = getAdjustedStat(attr.passing || 50, ctx.fatigue, false, contextMod, 'passing', ctx.weather, ctx.pitch);
    const vis = getAdjustedStat(attr.vision || 50, ctx.fatigue, false, contextMod, 'vision', ctx.weather, ctx.pitch);
    const tac = getAdjustedStat(attr.tackling || 50, ctx.fatigue, false, contextMod);
    const pos = getAdjustedStat(attr.positioning || 50, ctx.fatigue, false, contextMod);
    const sta = getAdjustedStat(attr.stamina || 50, ctx.fatigue, true, contextMod);

    let attackRating = 50;
    let defRating = ctx.oppOVR;
    let actionContext = "NORMAL";

    switch (eventType) {
        case 'SHOT':
            attackRating = (fin * 0.6) + (comp * 0.4);
            defRating = ctx.oppOVR;
            if (preMatchBuffs.shotBonus) attackRating *= (1 + preMatchBuffs.shotBonus);
            if (Math.random() < 0.3) actionContext = "ONE_ON_ONE";
            break;
        case 'DRIBBLE':
            attackRating = (drib * 0.5) + (pace * 0.3) + (agi * 0.2);
            if (preMatchBuffs.dribbleBonus) attackRating *= (1 + preMatchBuffs.dribbleBonus);
            if (Math.random() < 0.2) actionContext = "FINAL_THIRD";
            break;
        case 'PASS':
            attackRating = (pas * 0.6) + (vis * 0.3) + (comp * 0.1);
            break;
        case 'TACKLE':
            attackRating = (tac * 0.5) + (sta * 0.3) + (pos * 0.2);
            break;
        case 'CROSS':
            attackRating = (pas * 0.4) + (vis * 0.3) + (pace * 0.3);
            break;
        case 'SET_PIECE':
            attackRating = (pas * 0.5) + (fin * 0.5); 
            if (preMatchBuffs.setPieceBonus) attackRating *= (1 + preMatchBuffs.setPieceBonus);
            actionContext = "DIRECT_FREE_KICK";
            break;
        default:
            attackRating = (pas * 0.4) + (drib * 0.3) + (pos * 0.3);
            break;
    }

    let success_threshold = (attackRating / (attackRating + defRating)) * 100;
    
    const oppQualityAdjust = ((ctx.oppOVR - p.ovr) / 100) * 10; 
    success_threshold -= oppQualityAdjust;
    
    // Add some random variation
    const diceRoll = Math.random() * 100;
    
    let outcome: MatchActionOutcome = 'FAILURE';
    
    if (diceRoll <= success_threshold) {
        outcome = 'SUCCESS';
        if (diceRoll <= success_threshold * 0.25) {
            outcome = 'CRITICAL_SUCCESS';
        }
    } else {
        outcome = 'FAILURE';
        if (diceRoll >= success_threshold + ((100 - success_threshold) * 0.8)) {
            outcome = 'CRITICAL_FAILURE';
        }
    }
    
    return { outcome, actionContext };
}

// ----------------------------------------------------------------------------
// Live Commentary Overhaul
// ----------------------------------------------------------------------------

const noRepeatBuffer: string[] = [];
function getLine(lines: string[], playerName: string): string {
    const available = lines.filter(l => !noRepeatBuffer.includes(l));
    const pool = available.length > 0 ? available : lines;
    
    let line = pool[Math.floor(Math.random() * pool.length)];
    line = line.replace(/\{player\}/g, playerName);
    
    noRepeatBuffer.push(line);
    if (noRepeatBuffer.length > 10) noRepeatBuffer.shift();
    
    return line;
}

export function generateCommentary(eventType: MatchEventType, outcome: MatchActionOutcome, p: Player, ctx: ActionContext, isHalfTimeTalkBoost?: boolean): string {
    const playerName = p.lastName || p.firstName;
    const isDerby = ctx.pressure && ctx.pressure >= 9;
    const isHighPressure = ctx.pressure && ctx.pressure >= 7;
    const isClutch = isHighPressure && (p.attributes.composure || 50) > 80;
    const isCrumble = isHighPressure && (p.attributes.composure || 50) < 40;
    
    const weatherRef = ctx.weather?.type === 'HEAVY_RAIN' ? 'in these torrential conditions' : 
                       ctx.weather?.type === 'SNOW' ? 'on this frozen pitch' : 
                       ctx.pitch?.type === 'MUDDY' ? 'in the mud' : '';

    const role = p.position; // ST, CAM, etc.
    const lead = 'LEAD: ';
    const analyst = ' | ANALYST: ';

    // Commentary Banks
    const shotCritSuccess = [
        `${lead}UNBELIEVABLE! {player} HAS DONE IT! ${isDerby ? 'IN THE DERBY NO LESS!' : ''}${analyst}Absolute world-class composure from the ${role}.`,
        `${lead}HE SCORES! WHAT A GOAL BY {player}! THE CROWD ERUPTS!${analyst}You give him an inch, he takes a mile. Brilliant.`,
        `${lead}Take a bow, {player}! That is sensational! ${weatherRef}${analyst}The keeper had absolutely no chance.`,
    ];
    
    const shotSuccess = [
        `${lead}GOAL! {player} handles the pressure and scores!${analyst}Clinical finish. Exactly what you want from your ${role}.`,
        `${lead}He's done it! {player} slots it home!${analyst}He kept his head down and struck it true.`,
        `${lead}A tidy finish by {player}!${analyst}He's been working on that in training.`
    ];

    const shotCritFail = [
        `${lead}HE'S SKIED IT! THE PRESSURE GOT TO {player}!${analyst}He rushed it. Complete lack of composure there.`,
        `${lead}Oh no! {player} blazes it over from six yards! How did he miss that?${analyst}That is a sitter. He will be seeing that in his nightmares.`,
        `${lead}{player} misses an absolute sitter!${analyst}In these big moments, you need a cool head. He didn't have one.`
    ];
    
    const shotFail = [
        `${lead}He misses. {player} couldn't find the target.${analyst}The angle was tight, to be fair to him.`,
        `${lead}Saved by the keeper! {player} denied.${analyst}Good stop, but he telegraphed the shot.`
    ];

    // Clutch & Crumble specific lines
    if (isClutch && outcome === 'CRITICAL_SUCCESS') {
        return `${lead}ICE IN HIS VEINS! {player} steps up when it matters most!${analyst}That is why they pay him the big bucks. Big game player!`;
    }
    if (isCrumble && outcome === 'CRITICAL_FAILURE') {
        return `${lead}{player} is crumbling under the pressure here!${analyst}The occasion has completely overwhelmed him. He looks lost.`;
    }

    if (eventType === 'SHOT') {
        if (outcome === 'CRITICAL_SUCCESS') return getLine(shotCritSuccess, playerName);
        if (outcome === 'SUCCESS') return getLine(shotSuccess, playerName);
        if (outcome === 'CRITICAL_FAILURE') return getLine(shotCritFail, playerName);
        return getLine(shotFail, playerName);
    }
    
    const dribbleCritSuccess = [
        `${lead}He's running riot! They can't stop {player}! ${weatherRef}${analyst}He's gliding past them like they aren't even there.`,
        `${lead}Nutmeg! {player} is humiliating the defense!${analyst}Pure street football that is.`
    ];
    const dribbleCritFail = [
        `${lead}{player} trips over the ball! Embarrassing moment.${analyst}He's tried to do too much and completely lost it.`
    ];

    if (eventType === 'DRIBBLE') {
        if (outcome === 'CRITICAL_SUCCESS') return getLine(dribbleCritSuccess, playerName);
        if (outcome === 'CRITICAL_FAILURE') return getLine(dribbleCritFail, playerName);
        if (outcome === 'SUCCESS') return `${lead}{player} beats his man.${analyst}Good positive play.`;
        return `${lead}Dispossessed. {player} held it too long.`;
    }

    if (eventType === 'PASS' || eventType === 'CROSS') {
        if (outcome === 'CRITICAL_SUCCESS') return `${lead}Incredible vision! {player} splits the defense!${analyst}Only a handful of players could see that pass.`;
        if (outcome === 'CRITICAL_FAILURE') return `${lead}{player} passes straight to the opposition!${analyst}Sloppy. He looks fatigued out there.`;
        if (outcome === 'SUCCESS') return `${lead}{player} finds his teammate.${analyst}Keeps the tempo going.`;
        return `${lead}Pass goes astray from {player}.`;
    }

    if (isHalfTimeTalkBoost && Math.random() > 0.5) {
        return `${lead}{player} looks revitalized this half!${analyst}The manager's team talk has clearly lit a fire under him.`;
    }

    return `${lead}{player} is involved in the buildup.${analyst}Working hard off the ball too.`;
}
""");

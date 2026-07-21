import { Player, MatchEventType, MatchActionOutcome, WeatherCondition, PitchCondition } from '../types';
import { getRoleById } from '../data/roles';

export interface ActionContext {
    minute: number;
    oppOVR: number;
    fatigue: number;
    momentum: number;
    isHome: boolean;
    pressure?: number; // 0 to 10
    weather?: WeatherCondition;
    pitch?: PitchCondition;
    squadChemistry?: number;
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
    if (p.reputation.world > 80) {
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

    // Mental Fatigue & Burnout effect
    const mf = p.mentalFatigue || 0;
    if (mf > 75) {
        modifier -= 0.15; // Critical burnout penalty
    } else if (mf > 50) {
        modifier -= 0.08; // High mental fatigue penalty
    } else if (mf > 25) {
        modifier -= 0.03; // Mild mental stress
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
        if ((statName === 'passing' || statName === 'vision') && (weather as any)?.__squadChemistry && (weather as any).__squadChemistry > 70) {
            val = val * 1.05;
        }
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
    
    // Role Specialization Synergy
    let roleWeights: Partial<Record<keyof import('../types').Attributes, number>> = {};
    let familiarityMod = 0;
    if (p.roleSpecialization?.selectedRoleId) {
        const roleObj = getRoleById(p.roleSpecialization.selectedRoleId);
        if (roleObj) {
            roleWeights = roleObj.attributeWeights;
            // 0% familiarity = 0 effect, 100% familiarity = 100% effect of the weight modifier.
            // (weight - 1) * familiarity. E.g., weight 1.5, fam 100% -> multiplier 1.5. fam 50% -> multiplier 1.25.
            familiarityMod = p.roleSpecialization.familiarity / 100.0;
        }
    }

    const applyRoleMod = (stat: number, key: keyof import('../types').Attributes) => {
        const weight = roleWeights[key];
        if (weight !== undefined) {
            const boost = 1.0 + ((weight - 1.0) * familiarityMod);
            return Math.max(1, Math.min(99, stat * boost));
        }
        return stat;
    };
    
    const fin = applyRoleMod(getAdjustedStat(attr.finishing || 50, ctx.fatigue, false, contextMod), 'finishing');
    const comp = applyRoleMod(getAdjustedStat(attr.composure || 50, ctx.fatigue, false, contextMod), 'composure');
    const drib = applyRoleMod(getAdjustedStat(attr.dribbling || 50, ctx.fatigue, false, contextMod, 'dribbling', ctx.weather, ctx.pitch), 'dribbling');
    const pace = applyRoleMod(getAdjustedStat(attr.pace || 50, ctx.fatigue, true, contextMod, 'pace', ctx.weather, ctx.pitch), 'pace');
    const agi = applyRoleMod(getAdjustedStat(attr.agility || 50, ctx.fatigue, true, contextMod), 'agility');
    let pas = applyRoleMod(getAdjustedStat(attr.passing || 50, ctx.fatigue, false, contextMod, 'passing', ctx.weather, ctx.pitch), 'passing');
    if (ctx.squadChemistry && ctx.squadChemistry > 70) pas *= 1.05;
    let vis = applyRoleMod(getAdjustedStat(attr.vision || 50, ctx.fatigue, false, contextMod, 'vision', ctx.weather, ctx.pitch), 'vision');
    if (ctx.squadChemistry && ctx.squadChemistry > 70) vis *= 1.05;
    const tac = applyRoleMod(getAdjustedStat(attr.tackling || 50, ctx.fatigue, false, contextMod), 'tackling');
    const pos = applyRoleMod(getAdjustedStat(attr.positioning || 50, ctx.fatigue, false, contextMod), 'positioning');
    const sta = applyRoleMod(getAdjustedStat(attr.stamina || 50, ctx.fatigue, true, contextMod), 'stamina');

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

    if (p.mentalFatigue && p.mentalFatigue >= 60 && (outcome === 'CRITICAL_FAILURE' || outcome === 'FAILURE')) {
        analyst = (isLower ? ' | CO-HOST (Burnout Notice): ' : ' | ANALYST (Burnout Notice): ');
    }

    const shotCritSuccess = [
        `${lead}UNBELIEVABLE! {player} HAS DONE IT! ${isDerby ? 'IN THE DERBY NO LESS!' : ''}${analyst}Absolute world-class composure from the ${role}.`,
        `${lead}HE SCORES! WHAT A GOAL BY {player}! THE CROWD ERUPTS!${analyst}You give him an inch, he takes a mile. Brilliant.`,
        `${lead}Take a bow, {player}! That is sensational! ${weatherRef}${analyst}The keeper had absolutely no chance.`,
        `${lead}A magical strike from {player}!${analyst}We'll be seeing replays of that for weeks.`,
        `${lead}Goal of the season contender from {player}!${analyst}Technique, power, precision. Perfect.`,
    ];
    
    const shotSuccess = [
        `${lead}GOAL! {player} handles the pressure and scores!${analyst}Clinical finish. Exactly what you want from your ${role}.`,
        `${lead}He's done it! {player} slots it home!${analyst}He kept his head down and struck it true.`,
        `${lead}A tidy finish by {player}!${analyst}He's been working on that in training.`,
        `${lead}{player} finds the back of the net!${analyst}A striker's instinct right there.`,
        `${lead}Goal {player}!${analyst}Nothing flashy, but it gets the job done.`,
    ];

    const shotCritFail = [
        `${lead}HE'S SKIED IT! THE PRESSURE GOT TO {player}!${analyst}He rushed it. Complete lack of composure there.`,
        `${lead}Oh no! {player} blazes it over from six yards! How did he miss that?${analyst}That is a sitter. He will be seeing that in his nightmares.`,
        `${lead}{player} misses an absolute sitter!${analyst}In these big moments, you need a cool head. He didn't have one.`,
        `${lead}A shocking miss by {player}!${analyst}The fans can scarcely believe it.`,
        `${lead}He's put it out of the stadium! {player} hangs his head.${analyst}He leaned back too much. Basic error.`,
    ];
    
    const shotFail = [
        `${lead}He misses. {player} couldn't find the target.${analyst}The angle was tight, to be fair to him.`,
        `${lead}Saved by the keeper! {player} denied.${analyst}Good stop, but he telegraphed the shot.`,
        `${lead}{player} shoots... wide of the mark.${analyst}He needed a bit more curl on that.`,
        `${lead}Straight at the goalkeeper from {player}.${analyst}He should have done better from there.`,
    ];

    const dribbleCritSuccess = [
        `${lead}He's running riot! They can't stop {player}! ${weatherRef}${analyst}He's gliding past them like they aren't even there.`,
        `${lead}Nutmeg! {player} is humiliating the defense!${analyst}Pure street football that is.`,
        `${lead}Spectacular run from {player}!${analyst}He's leaving defenders in his wake.`,
    ];

    const dribbleCritFail = [
        `${lead}{player} trips over the ball! Embarrassing moment.${analyst}He's tried to do too much and completely lost it.`,
        `${lead}{player} completely loses his footing!${analyst}The pitch conditions ${weatherRef} might be a factor, but that was poor.`,
    ];

    const passCritSuccess = [
        `${lead}Incredible vision! {player} splits the defense!${analyst}Only a handful of players could see that pass.`,
        `${lead}What a ball from {player}! Threading the needle!${analyst}The weight on that pass was absolutely perfect.`
    ];

    const passCritFail = [
        `${lead}{player} passes straight to the opposition!${analyst}Sloppy. He looks fatigued out there.`,
        `${lead}A hospital pass from {player}!${analyst}He's put his teammate in real danger there.`
    ];

    const tackleCritSuccess = [
        `${lead}A crunching, perfectly timed tackle by {player}!${analyst}That is textbook defending. He won the ball cleanly.`,
        `${lead}{player} saves a certain goal with that challenge!${analyst}Incredible defensive instinct to read the play.`
    ];

    const tackleCritFail = [
        `${lead}A reckless lunge from {player}!${analyst}He's nowhere near the ball. He's lucky to stay on the pitch.`,
        `${lead}{player} is completely sold by the dummy!${analyst}He committed way too early.`
    ];

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
    if (eventType === 'DRIBBLE') {
        if (outcome === 'CRITICAL_SUCCESS') return getLine(dribbleCritSuccess, playerName);
        if (outcome === 'CRITICAL_FAILURE') return getLine(dribbleCritFail, playerName);
        if (outcome === 'SUCCESS') return `${lead}{player} beats his man.${analyst}Good positive play.`;
        return `${lead}Dispossessed. {player} held it too long.`;
    }
    if (eventType === 'PASS' || eventType === 'CROSS' || eventType === 'GENERAL_PLAY') {
        if (outcome === 'CRITICAL_SUCCESS') return getLine(passCritSuccess, playerName);
        if (outcome === 'CRITICAL_FAILURE') return getLine(passCritFail, playerName);
        if (outcome === 'SUCCESS') return `${lead}{player} finds his teammate.${analyst}Keeps the tempo going.`;
        return `${lead}Pass goes astray from {player}.`;
    }
    if (eventType === 'TACKLE') {
        if (outcome === 'CRITICAL_SUCCESS') return getLine(tackleCritSuccess, playerName);
        if (outcome === 'CRITICAL_FAILURE') return getLine(tackleCritFail, playerName);
        if (outcome === 'SUCCESS') return `${lead}{player} makes the tackle.${analyst}Solid defensive work.`;
        return `${lead}{player} misses the challenge.`;
    }

    if (isHalfTimeTalkBoost && Math.random() > 0.5) {
        return `${lead}{player} looks revitalized this half!${analyst}The manager's team talk has clearly lit a fire under him.`;
    }

    return `${lead}{player} is involved in the buildup.${analyst}Working hard off the ball too.`;
}

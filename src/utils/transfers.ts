import { Player, TransferOffer, AgentTier, Club } from '../types';
import { CLUBS } from '../data/teams';
import { CoreFormulas } from './coreFormulas';

export type WindowPacingState = 'CLOSED' | 'EARLY' | 'MID' | 'LATE' | 'DEADLINE_DAY';

export function getTransferWindowPacingState(week: number, day: string): WindowPacingState {
    const isTransferWindow = [1,2,3,4,25,26,27,28].includes(week);
    if (!isTransferWindow) return 'CLOSED';
    
    if ([1, 2, 25, 26].includes(week)) return 'EARLY';
    if ([3, 27].includes(week)) return 'MID';
    if ([4, 28].includes(week)) {
        if (day === 'SUN') return 'DEADLINE_DAY';
        return 'LATE';
    }
    return 'CLOSED';
}

export function getAgentMultiplier(tier: AgentTier): number {
    switch (tier) {
        case 'Rookie': return 0.5;
        case 'Hungry': return 1.0;
        case 'Shark': return 1.5;
        case 'Super Agent': return 2.0;
        case 'Legend': return 2.5;
        default: return 1.0;
    }
}

/**
 * Categorizes a club into one of five realistic career tiers.
 * Tier 1: European Giants / Elite (OVR >= 84 or Elite tier)
 * Tier 2: Premier League Mid/Lower, Top Continental
 * Tier 3: EFL Championship
 * Tier 4: EFL League One
 * Tier 5: EFL League Two / National League
 */
export function getClubTier(club: Club): number {
    if (club.league === 'EFL League Two') return 5;
    if (club.league === 'EFL League One') return 4;
    if (club.league === 'EFL Championship') return 3;
    
    const topLeagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];
    if (topLeagues.includes(club.league)) {
        if (club.tier === 'Elite' || club.ovr >= 84) {
            return 1;
        }
        return 2;
    }
    return 3; // Fallback
}

/**
 * Initializes scout attendance and interest progress maps in player state.
 */
export function initializeInterestTracking(player: Player): Player {
    if (!player.stateFlags) {
        player.stateFlags = { historyFlags: {}, openThreads: {}, eventCooldowns: {} };
    }
    if (!player.stateFlags.openThreads) {
        player.stateFlags.openThreads = {};
    }
    if (!player.stateFlags.openThreads.scoutAttendance) {
        player.stateFlags.openThreads.scoutAttendance = {};
    }
    if (!player.stateFlags.openThreads.interestProgress) {
        player.stateFlags.openThreads.interestProgress = {};
    }
    return player;
}

/**
 * Evaluates whether a player is eligible to generate interest/bids from a club based on dual-gating.
 * Returns null if eligible, or a string code explaining why they are gated.
 */
export function getGatingStatus(player: Player, club: Club): 'CURRENT_CLUB' | 'TIER_GAP' | 'OVR_GAP' | 'REP_GAP' | 'AGENT_LOCK' | null {
    if (club.symbol === player.currentClubSymbol) return 'CURRENT_CLUB';

    const targetTier = getClubTier(club);
    const currentClub = CLUBS.find(c => c.symbol === player.currentClubSymbol);
    const currentTier = currentClub ? getClubTier(currentClub) : 5;

    // 1. Agent Caps Rule
    const agentCap = player.agentTier || 'Rookie';
    if (agentCap === 'Rookie' && targetTier <= 3) {
        return 'AGENT_LOCK'; // Rookie agents can only deal with Tiers 4 and 5
    }
    if (agentCap === 'Hungry' && targetTier <= 2) {
        return 'AGENT_LOCK'; // Hungry agents can only deal with Tiers 3, 4, and 5
    }
    if (agentCap === 'Shark' && targetTier === 1) {
        return 'AGENT_LOCK'; // Shark agents cannot deal with Tier 1 (Elite)
    }

    // 1.5. Appearance-Based & Reputation-Based Gating Rule (Credible-rumor gating)
    const playerApps = player.stats?.apps || 0;
    const mediaPercep = player.mediaPerception || 50;
    const peerRes = player.reputation?.peerRespect || 50;

    if (targetTier <= 3) {
        // Requires at least 5 apps AND at least 45 Media Perception or Peer Respect to generate credible interest
        if (playerApps < 5 || (mediaPercep < 45 && peerRes < 45)) {
            return 'REP_GAP';
        }
    }
    if (targetTier <= 2) {
        // Requires at least 12 apps AND at least 55 Media Perception or Peer Respect
        if (playerApps < 12 || (mediaPercep < 55 && peerRes < 55)) {
            return 'REP_GAP';
        }
    }

    // Calculate rolling rating average to check form
    const ratings = player.formHistory || [];
    const rollingRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : 6.0;

    // 2. Wonderkid Exception check
    let isWonderkidBypass = false;
    if (player.age < 21 && player.ovr >= 78 && (player.reputation?.world || 0) >= 50 && rollingRating >= 7.8) {
        isWonderkidBypass = true;
    }

    // 3. Tiered Gating Rule (Max 2 tiers jump)
    if (!isWonderkidBypass) {
        if (currentTier - targetTier > 2) {
            return 'TIER_GAP'; // Gated: cannot jump from League Two (5) to Prem Lower (2) or Elite (1)
        }
    }

    // 4. OVR & Reputation world dual-gates
    let minOvr = 30;
    let minRep = 0;

    if (targetTier === 4) {
        minOvr = 55;
        minRep = 10;
    } else if (targetTier === 3) {
        minOvr = 65;
        minRep = 25;
    } else if (targetTier === 2) {
        minOvr = 75;
        minRep = 45;
    } else if (targetTier === 1) {
        minOvr = 82;
        minRep = 65;
    }

    if (player.ovr < minOvr) return 'OVR_GAP';
    if ((player.reputation?.world || 0) < minRep) return 'REP_GAP';

    return null; // Free to proceed
}

/**
 * Calculates the dynamic interest level percentage (0 to 100) for a club.
 */
export function getClubInterestScore(player: Player, club: Club): number {
    const gateStatus = getGatingStatus(player, club);
    if (gateStatus) return 0; // Gated clubs have 0% interest

    const p = initializeInterestTracking(player);
    const savedProgress = p.stateFlags.openThreads.interestProgress?.[club.symbol];
    if (savedProgress !== undefined) {
        return Math.max(5, Math.min(100, Math.round(savedProgress)));
    }

    // Calculate baseline score if no saved progress exists
    const ovrDiff = player.ovr - club.ovr;
    let baseline = 30 + (ovrDiff * 1.5);

    // Apply agent bonuses
    const agentMultiplier = getAgentMultiplier(player.agentTier);
    baseline *= agentMultiplier;

    // Apply current form
    baseline += (player.form - 50) * 0.25;

    // Apply reputation
    baseline += (player.reputation?.world || 0) * 0.15;

    if (player.transferListed) baseline += 15;

    return Math.max(5, Math.min(85, Math.round(baseline))); // Cap initial baseline before scouts visit
}

/**
 * Generates transfer offers during the transfer window.
 * Offers are generated from clubs that are NOT gated, have an interest score >= 90%, 
 * and have scouted the player at least 2 times.
 */
export function generateTransferOffers(player: Player, week: number, day: string): TransferOffer[] {
    const offers: TransferOffer[] = [];
    const p = initializeInterestTracking(player);

    if (p.contract.yearsLeft >= 4 && Math.random() < 0.7) return []; // Recently signed
    if (p.loanInfo) return []; // On loan

    const currentClub = CLUBS.find(c => c.symbol === p.currentClubSymbol);
    if (!currentClub) return offers;

    const possibleClubs = CLUBS.filter(c => c.symbol !== p.currentClubSymbol);
    const scoutAttendance = p.stateFlags.openThreads.scoutAttendance || {};
    const interestProgress = p.stateFlags.openThreads.interestProgress || {};
    const targetHomeClub = p.stateFlags?.openThreads?.homecomingTour;
    if (targetHomeClub) {
        const homeClub = CLUBS.find(c => c.symbol === targetHomeClub);
        if (homeClub && p.currentClubSymbol !== targetHomeClub) {
            // Generate guaranteed homecoming offer
            offers.push({
                id: `offer_${homeClub.symbol}_${Date.now()}_homecoming`,
                clubSymbol: homeClub.symbol,
                wage: Math.max(1000, Math.floor((p.contract.wage) * 0.5)),
                bonus: 0,
                length: 1,
                status: 'PENDING',
                isHomecoming: true
            });
            
            // clear the thread
            delete p.stateFlags.openThreads.homecomingTour;
        }
    }
    
    const pacing = getTransferWindowPacingState(week, day);

    for (const club of possibleClubs) {
        const gate = getGatingStatus(p, club);
        if (gate) continue; // Skip gated clubs

        const visits = scoutAttendance[club.symbol] || 0;
        const interest = interestProgress[club.symbol] || getClubInterestScore(p, club);
        
        let requiredVisits = 2;
        let requiredInterest = 90;
        
        // Pacing adjustments
        if (pacing === 'EARLY') {
            requiredInterest = 95; // Harder to get an offer early
        } else if (pacing === 'LATE') {
            requiredInterest = 85; // Easier to get an offer late
        } else if (pacing === 'DEADLINE_DAY') {
            requiredVisits = 1; // Can get an offer with fewer visits
            requiredInterest = 75; // Panic buys
        }

        // Required: at least X scout visits, and interest >= Y%
        if (visits >= requiredVisits && interest >= requiredInterest) {
            let agentBonus = 0;
            if (p.agentTier === 'Hungry') agentBonus = 0.05;
            if (p.agentTier === 'Shark') agentBonus = 0.15;
            if (p.agentTier === 'Super Agent') agentBonus = 0.30;
            if (p.agentTier === 'Legend') agentBonus = 0.50;

            let formulaTier = 'MID_TABLE';
            if (club.tier === 'Elite') formulaTier = 'ELITE';
            else if (club.tier === 'Strong') formulaTier = 'TITLE_CONTENDER';
            else if (club.tier === 'Mid') formulaTier = 'UPPER_MID_TABLE';
            else if (club.tier === 'Lower') formulaTier = 'MID_TABLE';
            else if (club.tier === 'Foundation') formulaTier = 'LOWER_LEAGUE';

            const baseWage = CoreFormulas.calculateWageOffer(p.ovr, formulaTier as any, p.progression?.reputation || 50);
            const wage = Math.round(baseWage * (1 + agentBonus) * (Math.random() * 0.2 + 0.9));
            const bonus = Math.round((wage * 52) * (0.2 + agentBonus));
            const length = Math.floor(Math.random() * 4) + 2; // 2 to 5 years

            let releaseClause = undefined;
            if (['Shark', 'Super Agent', 'Legend'].includes(p.agentTier) && Math.random() > 0.5) {
                if (p.agentTier !== 'Super Agent' && p.agentTier !== 'Legend') {
                    releaseClause = Math.round((Math.random() * 60 + 20)) * 1000000;
                }
            }

            offers.push({
                id: `offer_${club.symbol}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                clubSymbol: club.symbol,
                wage,
                bonus,
                length,
                releaseClause,
                status: 'PENDING',
                isHomecoming: club.symbol === p.hometownClubSymbol
            });

            // Reset interest and scout visits so they don't spam multiple offers
            p.stateFlags.openThreads.scoutAttendance[club.symbol] = 0;
            p.stateFlags.openThreads.interestProgress[club.symbol] = 30; // resets to baseline

            if (offers.length >= 2) break; // Max 2 generated offers at once
        }
    }

    return offers;
}

/**
 * Handles agent negotiation multipliers and outcome determinations.
 */
export function negotiateTransfer(offer: TransferOffer, player: Player, action: 'WAGE' | 'BONUS' | 'CLAUSE' | 'SHORTER'): { success: boolean, newOffer?: TransferOffer } {
    let agentSkill = 0;
    if (player.agentTier === 'Hungry') agentSkill = 20;
    if (player.agentTier === 'Shark') agentSkill = 50;
    if (player.agentTier === 'Super Agent') agentSkill = 80;
    if (player.agentTier === 'Legend') agentSkill = 100;

    const targetClub = CLUBS.find(c => c.symbol === offer.clubSymbol);
    const targetTier = targetClub ? getClubTier(targetClub) : 3;

    // Manager/board realism check modifier
    let boardDesire = 50;
    if (player.ovr > (targetClub?.ovr || 50) + 5) boardDesire = 80;
    else if (player.ovr < (targetClub?.ovr || 50) - 5) boardDesire = 30;

    const successChance = (agentSkill * 0.4) + ((player.reputation?.world || 50) * 0.3) + (boardDesire * 0.3);

    if (Math.random() * 100 <= successChance) {
        const newOffer = { ...offer };
        if (action === 'WAGE') {
            newOffer.wage = Math.round(newOffer.wage * (1 + (Math.random() * 0.10 + 0.05)));
        } else if (action === 'BONUS') {
            newOffer.bonus = Math.round(newOffer.bonus * (1 + (Math.random() * 0.10 + 0.10)));
            if (!newOffer.contractBonus) {
                newOffer.contractBonus = { type: player.position === 'ST' || player.position === 'AM' || player.position === 'LW' || player.position === 'RW' ? 'GOAL' : 'APPEARANCE', amount: Math.round(newOffer.wage * 0.2) };
            } else {
                newOffer.contractBonus.amount += Math.round(newOffer.wage * 0.1);
            }
        } else if (action === 'CLAUSE') {
            newOffer.releaseClause = Math.round((Math.random() * 60 + 20)) * 1000000;
        } else if (action === 'SHORTER') {
            newOffer.length = Math.max(1, newOffer.length - 1);
        }
        return { success: true, newOffer };
    }
    
    return { success: false };
}

/**
 * Generates initial late panic transfer offers specifically for Deadline Day.
 */
export function generateDeadlineDayOffers(player: Player): TransferOffer[] {
    const eligibleClubs = CLUBS.filter(c => c.symbol !== player.currentClubSymbol && c.ovr >= player.ovr - 8 && c.ovr <= player.ovr + 12);
    
    // Sort randomly
    const shuffled = [...eligibleClubs].sort(() => Math.random() - 0.5);
    const deadlineOffers: TransferOffer[] = [];
    
    const count = Math.min(2, shuffled.length);
    for (let i = 0; i < count; i++) {
        const club = shuffled[i];
        const multiplier = club.ovr > player.ovr ? 1.25 : club.ovr < player.ovr ? 0.85 : 1.0;
        const wage = Math.round((player.ovr * 180 + Math.random() * 1000) * multiplier);
        const bonus = Math.round(wage * 3.5);
        const length = Math.floor(Math.random() * 3) + 2; // 2-4 years
        
        deadlineOffers.push({
            id: `deadline_${club.symbol}_${Date.now()}_${i}`,
            clubSymbol: club.symbol,
            wage,
            bonus,
            length,
            status: 'PENDING'
        });
    }
    
    return deadlineOffers;
}

/**
 * Simulates a single-hour progression tick on Deadline Day, generating late events,
 * such as unexpected bids or improved terms.
 */
export function simulateDeadlineDayTicking(player: Player, hoursRemaining: number): { offer: TransferOffer | null; text: string; mode: 'NEW_OFFER' | 'IMPROVEMENT' | 'WITHDRAW' | 'QUIET' } {
    const roll = Math.random();
    
    if (roll < 0.28 && hoursRemaining > 2) {
        // Late panic bid from another club!
        const possibleClubs = CLUBS.filter(c => c.symbol !== player.currentClubSymbol);
        const club = possibleClubs[Math.floor(Math.random() * possibleClubs.length)];
        const multiplier = club.ovr > player.ovr ? 1.4 : club.ovr < player.ovr ? 0.95 : 1.15; // Deadline desperation markup!
        const wage = Math.round((player.ovr * 190 + Math.random() * 1200) * multiplier);
        const bonus = Math.round(wage * 4.5);
        const length = Math.floor(Math.random() * 3) + 2;

        const newOffer: TransferOffer = {
            id: `deadline_panic_${club.symbol}_${Date.now()}`,
            clubSymbol: club.symbol,
            wage,
            bonus,
            length,
            status: 'PENDING'
        };

        return {
            offer: newOffer,
            text: `🚨 LATE PANIC BID! ${club.name} are desperate and have submitted an eleventh-hour offer with a major wage markup!`,
            mode: 'NEW_OFFER'
        };
    } else if (roll < 0.48 && hoursRemaining > 1) {
        // Improved terms on an existing bid (desperation)
        return {
            offer: null,
            text: `📈 IMPROVED TERMS! One of your active suitors has increased their wage offer by 15% to try and speed up negotiations before the clock strikes zero!`,
            mode: 'IMPROVEMENT'
        };
    } else if (roll < 0.60 && hoursRemaining > 1) {
        // Suitor pulls out due to patience loss
        return {
            offer: null,
            text: `⚠️ SUITOR WALKS AWAY! Frustrated by delayed negotiations, one of the interested clubs has pulled out to sign an alternative target!`,
            mode: 'WITHDRAW'
        };
    }
    
    const quietPhrases = [
        "Sky Sports News reports busy activity at training grounds across Europe.",
        "Your agent is furiously pacing back and forth on the phone with club reps.",
        "A quiet hour. Fans on social media are refreshing transfer logs frantically.",
        "Faxes are being sent and personal terms processed as the final deadline looms."
    ];
    const phrase = quietPhrases[Math.floor(Math.random() * quietPhrases.length)];

    return {
        offer: null,
        text: `⏳ ${phrase}`,
        mode: 'QUIET'
    };
}


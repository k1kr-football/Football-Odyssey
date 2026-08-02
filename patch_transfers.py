import re
with open('src/utils/transfers.ts', 'r') as f:
    content = f.read()

replacement = """        // Pacing adjustments
        if (pacing === 'EARLY') {
            requiredInterest = 95; // Harder to get an offer early
        } else if (pacing === 'LATE') {
            requiredInterest = 85; // Easier to get an offer late
        } else if (pacing === 'DEADLINE_DAY') {
            requiredVisits = 1; // Can get an offer with fewer visits
            requiredInterest = 75; // Panic buys
        }

        // Agent focus adjustments
        const agentFocus = p.stateFlags?.agentFocus;
        if (agentFocus === 'TRANSFER') {
            requiredInterest -= 15; // Much easier to get offers
        } else if (agentFocus === 'LOYALTY') {
            requiredInterest += 50; // Very hard to get offers
        }

        // Required: at least X scout visits, and interest >= Y%
        if (visits >= requiredVisits && interest >= requiredInterest) {
            let agentBonus = 0;
            if (p.agentTier === 'Hungry') agentBonus = 0.05;
            if (p.agentTier === 'Shark') agentBonus = 0.15;
            if (p.agentTier === 'Super Agent') agentBonus = 0.30;
            if (p.agentTier === 'Legend') agentBonus = 0.50;

            if (agentFocus === 'WAGES') {
                agentBonus += 0.20; // Massive boost to base wage
            } else if (agentFocus === 'BONUSES') {
                agentBonus -= 0.10; // Lower base wage but we'll buff bonus later
            }

            let formulaTier = 'MID_TABLE';
            if (club.tier === 'Elite') formulaTier = 'ELITE';
            else if (club.tier === 'Strong') formulaTier = 'TITLE_CONTENDER';
            else if (club.tier === 'Mid') formulaTier = 'UPPER_MID_TABLE';
            else if (club.tier === 'Lower') formulaTier = 'MID_TABLE';
            else if (club.tier === 'Foundation') formulaTier = 'LOWER_LEAGUE';

            const baseWage = CoreFormulas.calculateWageOffer(p.ovr, formulaTier as any, p.progression?.reputation || 50);
            const wage = Math.max(500, Math.round(baseWage * (1 + agentBonus) * (Math.random() * 0.2 + 0.9)));
            
            let bonusMulti = (0.2 + agentBonus);
            if (agentFocus === 'BONUSES') {
                bonusMulti += 0.50; // Massive boost to signing/performance bonus
            }
            const bonus = Math.round((wage * 52) * bonusMulti);
"""

content = re.sub(
    r"        // Pacing adjustments.*?const bonus = Math\.round\(\(wage \* 52\) \* \(0\.2 \+ agentBonus\)\);",
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/utils/transfers.ts', 'w') as f:
    f.write(content)

import { Club } from '../types';
import { CLUBS } from '../data/teams';
import { getClubStadiumCapacity, getClubPrestigeScore } from './clubPrestige';

export interface ClubFinancials {
  clubSymbol: string;
  clubName: string;
  revenue: {
    matchday: number;
    tvRights: number;
    sponsorship: number;
    transferTrading: number;
    total: number;
  };
  spending: {
    wages: number;
    transfers: number;
    infrastructure: number;
    total: number;
  };
  cashReserves: number;
  debt: number;
  financialHealth: 'SECURE' | 'STABLE' | 'STRAINED' | 'CRISIS';
  transferBudget: number;
  wageCeiling: number; // Maximum weekly wage they can offer a player
  ffpRatio: number; // wages / total revenue (target <= 70%)
  consecutiveFfpBreaches: number;
  activeEmbargo: boolean;
  pointsDeductionNextSeason: number;
  forcedFireSaleActive: boolean;
  seasonsInHistory: {
    season: number;
    revenue: number;
    spending: number;
    ffpRatio: number;
    financialHealth: string;
  }[];
}

// Map of club symbols to their financial details
export type ClubFinancesMap = Record<string, ClubFinancials>;

/**
 * Returns baseline values for a club based on its tier and name
 */
export function getClubFinancialBaseline(club: Club) {
  const tier = club.tier || 'Mid';
  const capacity = club.stadiumCapacity || 30000;

  let baseWages = 600000; // weekly
  let baseCash = 15000000;
  let baseDebt = 5000000;

  switch (tier) {
    case 'Elite':
      baseWages = 3500000 + (club.ovr - 85) * 200000;
      baseCash = 120000000;
      baseDebt = 20000000;
      break;
    case 'Strong':
      baseWages = 1500000 + (club.ovr - 75) * 100000;
      baseCash = 45000000;
      baseDebt = 15000000;
      break;
    case 'Mid':
      baseWages = 650000 + (club.ovr - 65) * 50000;
      baseCash = 15000000;
      baseDebt = 8000000;
      break;
    case 'Lower':
      baseWages = 250000 + (club.ovr - 55) * 20000;
      baseCash = 4000000;
      baseDebt = 2000000;
      break;
    case 'Foundation':
      baseWages = 75000 + (club.ovr - 40) * 5000;
      baseCash = 800000;
      baseDebt = 200000;
      break;
  }

  // Particular modifications for specific rich/poor clubs
  if (club.symbol === 'MCY' || club.symbol === 'PSG' || club.symbol === 'RMD') {
    baseCash += 100000000;
    baseWages *= 1.15;
  }
  if (club.symbol === 'FCB') {
    baseDebt += 80000000; // Historical debt
    baseCash = 5000000; // Tight liquid liquidity
    baseWages *= 1.1; // Still have high wages
  }

  return { baseWages, baseCash, baseDebt };
}

/**
 * Initialize financial stats for all clubs if they don't exist
 */
export function initializeAllClubFinances(existingFinances?: ClubFinancesMap): ClubFinancesMap {
  const finances: ClubFinancesMap = existingFinances ? { ...existingFinances } : {};

  CLUBS.forEach((club) => {
    if (finances[club.symbol]) return;

    const { baseWages, baseCash, baseDebt } = getClubFinancialBaseline(club);

    // Initial revenue streams scaled by real/derived stadium capacity and prestige score
    let tvWeekly = 400000;
    let baseSponsorWeekly = 200000;
    const ticketPrice = club.tier === 'Elite' ? 55 : club.tier === 'Strong' ? 40 : club.tier === 'Mid' ? 28 : club.tier === 'Lower' ? 18 : 12;
    const capacity = getClubStadiumCapacity(club);
    const prestige = getClubPrestigeScore(club);
    
    const weeklyMatchday = Math.round(capacity * 0.92 * ticketPrice * 0.5); // 0.5 because home games are every other week on average

    const leagueName = club.league.toLowerCase();
    if (leagueName.includes('premier') || leagueName.includes('liga') || leagueName.includes('serie a') || leagueName.includes('bundesliga') || leagueName.includes('ligue 1') || leagueName.includes('série a')) {
      if (club.tier === 'Elite') {
        tvWeekly = 2200000;
        baseSponsorWeekly = 1800000;
      } else if (club.tier === 'Strong') {
        tvWeekly = 1300000;
        baseSponsorWeekly = 900000;
      } else {
        tvWeekly = 800000;
        baseSponsorWeekly = 400000;
      }
    } else if (leagueName.includes('championship') || leagueName.includes('segunda') || leagueName.includes('serie b') || leagueName.includes('2.') || leagueName.includes('ligue 2')) {
      tvWeekly = 250000;
      baseSponsorWeekly = 150000;
    } else {
      // Tiers 3 & 4
      tvWeekly = leagueName.includes('one') ? 60000 : 30000;
      baseSponsorWeekly = leagueName.includes('one') ? 40000 : 20000;
    }

    // Commercial/Sponsorship revenue scales with club prestige score (brand weight)
    const sponsorMultiplier = 0.5 + (prestige / 100);
    const sponsorWeekly = Math.round(baseSponsorWeekly * sponsorMultiplier);

    const transferTrading = club.tier === 'Elite' ? 400000 : club.tier === 'Strong' ? 250000 : club.tier === 'Mid' ? 120000 : 40000;

    const totalRev = weeklyMatchday + tvWeekly + sponsorWeekly + transferTrading;
    const squadWages = baseWages;
    const infrastructure = Math.round(totalRev * 0.04);
    const transfersSpending = Math.round(totalRev * 0.15);

    const totalSpending = squadWages + transfersSpending + infrastructure;

    const ffpRatio = squadWages / totalRev;
    let health: 'SECURE' | 'STABLE' | 'STRAINED' | 'CRISIS' = 'STABLE';
    if (ffpRatio <= 0.62 && baseCash > 20000000) health = 'SECURE';
    else if (ffpRatio > 0.85 || baseCash < -5000000) health = 'CRISIS';
    else if (ffpRatio > 0.70 || baseCash < 2000000) health = 'STRAINED';

    // Set budgets
    let transferBudget = Math.round(baseCash * 0.35);
    if (health === 'CRISIS') transferBudget = 0;

    let wageCeiling = Math.round(totalRev * 0.15); // max contract offer

    finances[club.symbol] = {
      clubSymbol: club.symbol,
      clubName: club.name,
      revenue: {
        matchday: weeklyMatchday,
        tvRights: tvWeekly,
        sponsorship: sponsorWeekly,
        transferTrading,
        total: totalRev,
      },
      spending: {
        wages: squadWages,
        transfers: transfersSpending,
        infrastructure,
        total: totalSpending,
      },
      cashReserves: baseCash,
      debt: baseDebt,
      financialHealth: health,
      transferBudget,
      wageCeiling,
      ffpRatio,
      consecutiveFfpBreaches: 0,
      activeEmbargo: health === 'CRISIS',
      pointsDeductionNextSeason: 0,
      forcedFireSaleActive: health === 'CRISIS',
      seasonsInHistory: [
        {
          season: 1,
          revenue: totalRev * 48,
          spending: totalSpending * 48,
          ffpRatio,
          financialHealth: health,
        }
      ]
    };
  });

  return finances;
}

/**
 * Weekly update logic for all simulated club finances
 */
export function simulateClubFinancesWeekly(
  finances: ClubFinancesMap,
  playerClubSymbol: string,
  currentWeek: number,
  playerWages: number,
  isHomeMatch: boolean,
  currentSeason: number
): { updatedFinances: ClubFinancesMap; alerts: string[] } {
  const updatedFinances = { ...finances };
  const alerts: string[] = [];

  CLUBS.forEach((club) => {
    const cf = updatedFinances[club.symbol];
    if (!cf) return;

    // 1. Dynamic Matchday Revenue based on Home/Away status
    let matchdayRev = 0;
    const ticketPrice = club.tier === 'Elite' ? 55 : club.tier === 'Strong' ? 40 : club.tier === 'Mid' ? 28 : club.tier === 'Lower' ? 18 : 12;
    const capacity = getClubStadiumCapacity(club);

    // Simulate whether this club played a home game this week
    // For the player club, we know for sure via isHomeMatch
    let didPlayHome = Math.random() > 0.5;
    if (club.symbol === playerClubSymbol) {
      didPlayHome = isHomeMatch;
    }

    if (didPlayHome) {
      // High attendance based on financial health (fans boycott during crisis)
      let attRate = 0.94 + Math.random() * 0.05;
      if (cf.financialHealth === 'CRISIS') attRate = 0.65 + Math.random() * 0.15; // boycotts
      else if (cf.financialHealth === 'STRAINED') attRate = 0.82 + Math.random() * 0.12;

      matchdayRev = Math.round(capacity * attRate * ticketPrice);
    } else {
      // Small stadium tour, food and beverage, or merchandising income
      matchdayRev = Math.round(capacity * 1.5 * (club.tier === 'Elite' ? 3.5 : 1.5));
    }

    // 2. Adjust dynamic revenue streams slightly
    const tvRights = cf.revenue.tvRights;
    const sponsorship = Math.round(cf.revenue.sponsorship * (1.0 + (Math.random() * 0.04 - 0.02))); // small market fluctuations
    const transferTrading = Math.round(cf.revenue.transferTrading * (1.0 + (Math.random() * 0.10 - 0.05)));

    const totalRev = matchdayRev + tvRights + sponsorship + transferTrading;

    // Update player wages specifically if simulating the player's club
    let squadWages = cf.spending.wages;
    if (club.symbol === playerClubSymbol) {
      // Ensure squad wages includes player wages, adjust if player renewed contract
      const baselineWithoutPlayer = Math.round(cf.spending.wages * 0.95);
      squadWages = baselineWithoutPlayer + playerWages;
    }

    // 3. Simulated Transfers Spending (higher in transfer windows Weeks 1-8, 26-30)
    const isTransferWindow = currentWeek <= 9 || (currentWeek >= 27 && currentWeek <= 30);
    let transfersSpending = 0;
    if (isTransferWindow && cf.financialHealth !== 'CRISIS' && !cf.activeEmbargo) {
      transfersSpending = Math.round(totalRev * (0.2 + Math.random() * 0.3));
    } else if (isTransferWindow && cf.financialHealth === 'CRISIS') {
      // Crisis clubs spend almost nothing
      transfersSpending = 0;
    } else {
      transfersSpending = Math.round(totalRev * (0.02 + Math.random() * 0.04));
    }

    // 4. Facility and Infrastructure (stadium capacity upgrade!)
    let infrastructure = 0;
    let seatsUpgraded = 0;
    if (cf.financialHealth === 'SECURE') {
      infrastructure = Math.round(totalRev * 0.08); // high reinvestment
      if (Math.random() < 0.1 && (club.stadiumCapacity || 0) < 95000) {
        seatsUpgraded = Math.round(250 + Math.random() * 450);
        club.stadiumCapacity = (club.stadiumCapacity || 25000) + seatsUpgraded;
        if (club.symbol === playerClubSymbol) {
          alerts.push(`🏗️ STADIUM UPGRADE: Your club expanded stadium capacity by ${seatsUpgraded} seats! New capacity: ${club.stadiumCapacity.toLocaleString()}`);
        }
      }
    } else if (cf.financialHealth === 'STABLE') {
      infrastructure = Math.round(totalRev * 0.04);
      if (Math.random() < 0.04 && (club.stadiumCapacity || 0) < 80000) {
        seatsUpgraded = Math.round(100 + Math.random() * 200);
        club.stadiumCapacity = (club.stadiumCapacity || 25000) + seatsUpgraded;
      }
    } else {
      infrastructure = Math.round(totalRev * 0.01); // neglect facilities
    }

    const totalSpending = squadWages + transfersSpending + infrastructure;

    // 5. Cash Reserves update
    const netWeeklyProfit = totalRev - totalSpending;
    cf.cashReserves += netWeeklyProfit;

    // Slowly pay off debt or accumulate interest
    if (cf.debt > 0) {
      if (cf.cashReserves > 5000000) {
        const debtPaid = Math.min(cf.debt, Math.round(cf.cashReserves * 0.02));
        cf.debt -= debtPaid;
        cf.cashReserves -= debtPaid;
      } else {
        // Accrue interest on debt (0.05% weekly)
        const interest = Math.round(cf.debt * 0.0005);
        cf.debt += interest;
      }
    }

    // 6. FFP Checks and Financial Health derivation
    const ffpRatio = squadWages / totalRev;
    cf.ffpRatio = ffpRatio;

    let health: 'SECURE' | 'STABLE' | 'STRAINED' | 'CRISIS' = 'STABLE';
    if (ffpRatio <= 0.60 && cf.cashReserves > 25000000) {
      health = 'SECURE';
    } else if (ffpRatio > 0.85 || cf.cashReserves < -25000000) {
      health = 'CRISIS';
    } else if (ffpRatio > 0.70 || cf.cashReserves < 1500000) {
      health = 'STRAINED';
    }

    cf.financialHealth = health;

    // 7. FFP Breaches and Real Penalty Engine
    if (ffpRatio > 0.70) {
      cf.consecutiveFfpBreaches += 1;
    } else {
      cf.consecutiveFfpBreaches = Math.max(0, cf.consecutiveFfpBreaches - 1);
    }

    // FFP rules trigger penalties
    if (health === 'CRISIS') {
      cf.activeEmbargo = true;
      cf.forcedFireSaleActive = true;
      cf.transferBudget = 0;
      cf.wageCeiling = Math.round(totalRev * 0.06); // drastically restricted

      // Trigger alerts and forced fire sale if it's the player's club
      if (club.symbol === playerClubSymbol && currentWeek % 10 === 1) {
        alerts.push(`⚠️ CLUB FINANCIAL CRISIS: FFP breaches have forced an absolute TRANSFER EMBARGO on ${club.name}. The board is actively fire-selling assets to avoid insolvency!`);
      }
    } else if (health === 'STRAINED') {
      cf.activeEmbargo = cf.consecutiveFfpBreaches > 12;
      cf.forcedFireSaleActive = false;
      cf.transferBudget = Math.round(Math.max(0, cf.cashReserves) * 0.15);
      cf.wageCeiling = Math.round(totalRev * 0.10);
      
      if (cf.activeEmbargo && club.symbol === playerClubSymbol && currentWeek % 12 === 1) {
        alerts.push(`🚨 REGULATORY EMBARGO: Persistent FFP spending overruns (wages at ${(ffpRatio * 100).toFixed(1)}% of revenue) have triggered a registration block.`);
      }
    } else {
      // STABLE or SECURE
      cf.activeEmbargo = false;
      cf.forcedFireSaleActive = false;
      cf.transferBudget = Math.round(Math.max(0, cf.cashReserves) * 0.40);
      cf.wageCeiling = Math.round(totalRev * 0.18);
    }

    // Points Deduction Rule: If CRISIS for 8 weeks consecutively, deduct points
    if (cf.consecutiveFfpBreaches >= 8 && cf.consecutiveFfpBreaches % 8 === 0) {
      cf.pointsDeductionNextSeason += 6;
      if (club.symbol === playerClubSymbol) {
        alerts.push(`⚖️ FFP POINTS DEDUCTION: Due to severe financial misconduct, regulatory boards have imposed a direct -6 PTS DEDUCTION!`);
      } else if (club.tier === 'Elite' || club.tier === 'Strong') {
        alerts.push(`📢 SPORTS NEWS: ${club.name} hit with a -6 point FFP penalty for continuous overspending!`);
      }
    }

    // Recovering from Crisis: if cash reserves become positive and FFP ratio clears, health can restore
    if (cf.cashReserves > 0 && cf.ffpRatio <= 0.70) {
      if (health === 'CRISIS') {
        cf.financialHealth = 'STRAINED';
        cf.activeEmbargo = false;
        cf.forcedFireSaleActive = false;
        if (club.symbol === playerClubSymbol) {
          alerts.push(`🎉 DEBT RECOVERY: Your club has successfully generated enough cash to exit administration! The embargo has been lifted.`);
        }
      }
    }

    // Update object references
    cf.revenue = {
      matchday: matchdayRev,
      tvRights,
      sponsorship,
      transferTrading,
      total: totalRev,
    };
    cf.spending = {
      wages: squadWages,
      transfers: transfersSpending,
      infrastructure,
      total: totalSpending,
    };
  });

  return { updatedFinances, alerts };
}

/**
 * Checks if a club can realistically sign a player based on simulated Finances
 */
export function verifyClubSigningCapability(
  finances: ClubFinancesMap,
  clubSymbol: string,
  transferFee: number,
  playerWage: number
): { canAfford: boolean; reason: string } {
  const cf = finances[clubSymbol];
  if (!cf) return { canAfford: true, reason: "" }; // Fallback

  if (cf.activeEmbargo) {
    return { canAfford: false, reason: "The club is currently under a strict transfer embargo due to Financial Fair Play violations." };
  }

  if (cf.financialHealth === 'CRISIS') {
    return { canAfford: false, reason: "The club is in extreme financial crisis and cannot register any major signings." };
  }

  // Check Transfer Budget
  if (cf.transferBudget < transferFee) {
    return { 
      canAfford: false, 
      reason: `Offered transfer fee (£${transferFee.toLocaleString()}) exceeds the club's remaining transfer budget cap (£${cf.transferBudget.toLocaleString()}).` 
    };
  }

  // Check Wage Cap
  if (cf.wageCeiling < playerWage) {
    return { 
      canAfford: false, 
      reason: `Proposed wage contract (£${playerWage.toLocaleString()}/w) exceeds the board's strict wage ceiling limits (£${cf.wageCeiling.toLocaleString()}/w).` 
    };
  }

  // Check FFP threshold projection: if this contract tips them into FFP CRISIS
  const projectedWages = cf.spending.wages + playerWage;
  const projectedRatio = projectedWages / cf.revenue.total;
  if (projectedRatio > 0.90) {
    return {
      canAfford: false,
      reason: "Registering this player's salary would immediately violate league FFP caps, risking severe points deductions."
    };
  }

  return { canAfford: true, reason: "" };
}

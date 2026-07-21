import { Player } from '../types';

export type FinancialTier = 'Rookie' | 'Breakthrough' | 'Established' | 'Star' | 'Icon';

export const TIER_ORDER: FinancialTier[] = ['Rookie', 'Breakthrough', 'Established', 'Star', 'Icon'];

export const TIER_THRESHOLDS = {
  Rookie: { netWorth: 0, rep: 0 },
  Breakthrough: { netWorth: 50000, rep: 25 },
  Established: { netWorth: 250000, rep: 45 },
  Star: { netWorth: 1000000, rep: 65 },
  Icon: { netWorth: 5000000, rep: 85 },
};

/**
 * Calculates the player's net worth based on balances and asset holdings.
 */
export function calculateNetWorth(player: Player): number {
  const openThreads = player.stateFlags?.openThreads || {};
  const investments = openThreads.investments || { properties: [], startups: [], shibaFc: { tokens: 0, avgPrice: 0 } };
  const cryptoPrice = openThreads.shibaFcPrice || 1.25;

  const realEstateValue = (investments.properties || []).reduce((sum: number, prop: any) => sum + ((prop.qty || 1) * (prop.cost || 0)), 0);
  const vcValue = (investments.startups || []).reduce((sum: number, start: any) => sum + (start.val || 0), 0);
  const cryptoValue = (investments.shibaFc?.tokens || 0) * cryptoPrice;

  return player.finances.balance + realEstateValue + vcValue + cryptoValue;
}

/**
 * Resolves the raw financial tier of a player based on net worth and reputation.
 */
export function getRawFinancialTier(netWorth: number, worldRep: number): FinancialTier {
  if (netWorth >= TIER_THRESHOLDS.Icon.netWorth || worldRep >= TIER_THRESHOLDS.Icon.rep) return 'Icon';
  if (netWorth >= TIER_THRESHOLDS.Star.netWorth || worldRep >= TIER_THRESHOLDS.Star.rep) return 'Star';
  if (netWorth >= TIER_THRESHOLDS.Established.netWorth || worldRep >= TIER_THRESHOLDS.Established.rep) return 'Established';
  if (netWorth >= TIER_THRESHOLDS.Breakthrough.netWorth || worldRep >= TIER_THRESHOLDS.Breakthrough.rep) return 'Breakthrough';
  return 'Rookie';
}

/**
 * Gets the current active financial tier. Ensures that a tier-up is irreversible.
 */
export function getActiveFinancialTier(player: Player): FinancialTier {
  const storedTier = player.stateFlags?.highestFinancialTier as FinancialTier || 'Rookie';
  const netWorth = calculateNetWorth(player);
  const worldRep = player.reputation?.world || 0;
  const rawTier = getRawFinancialTier(netWorth, worldRep);

  const storedIdx = TIER_ORDER.indexOf(storedTier);
  const rawIdx = TIER_ORDER.indexOf(rawTier);

  return rawIdx > storedIdx ? rawTier : storedTier;
}

/**
 * Checks for a financial tier-up and returns the new tier + celebration message if a tier-up happened.
 */
export function checkFinancialTierUp(player: Player): { upgraded: boolean; nextTier: FinancialTier; message?: string } {
  const storedTier = player.stateFlags?.highestFinancialTier as FinancialTier || 'Rookie';
  const netWorth = calculateNetWorth(player);
  const worldRep = player.reputation?.world || 0;
  const rawTier = getRawFinancialTier(netWorth, worldRep);

  const storedIdx = TIER_ORDER.indexOf(storedTier);
  const rawIdx = TIER_ORDER.indexOf(rawTier);

  if (rawIdx > storedIdx) {
    const nextTier = rawTier;
    let unlockedFeatures = '';
    if (nextTier === 'Breakthrough') {
      unlockedFeatures = '- Private Chef nutrition\n- Pro fitness programs\n- Designer PR and styling\n- Startups and seed venture rounds\n- ShibaFC cryptocurrency trading';
    } else if (nextTier === 'Established') {
      unlockedFeatures = '- Mansion housing\n- Elite fitness training programs\n- Suburban Townhouses & Commercial City offices\n- Global Wealth Advisory trust setup';
    } else if (nextTier === 'Star') {
      unlockedFeatures = '- Iconic Global PR & image representation\n- Ultra-Modern Retail Plazas';
    } else if (nextTier === 'Icon') {
      unlockedFeatures = '- High-society luxury investments';
    }

    const message = `🎉 FINANCIAL TIER UP: ${nextTier.toUpperCase()} STATUS UNLOCKED! 🎉\n\nYour soaring net worth (£${netWorth.toLocaleString()}) and reputation (${worldRep}%) have elevated you to a new social class. Your financial empire expands with new doors open:\n\n${unlockedFeatures}\n\nKeep building your legacy!`;

    return { upgraded: true, nextTier, message };
  }

  return { upgraded: false, nextTier: storedTier };
}

/**
 * Helper to determine if a specific asset/empire level is locked based on the active financial tier.
 */
export function checkAssetLock(player: Player, assetId: string): { locked: boolean; reason: string } {
  const activeTier = getActiveFinancialTier(player);
  const activeIdx = TIER_ORDER.indexOf(activeTier);

  // 1. Physical Properties
  if (assetId === 'studio') {
    return { locked: false, reason: '' };
  }
  if (assetId === 'townhouse') {
    const reqIdx = TIER_ORDER.indexOf('Breakthrough');
    if (activeIdx < reqIdx) {
      return { locked: true, reason: 'LOCKED — Requires Breakthrough status' };
    }
  }
  if (assetId === 'office') {
    const reqIdx = TIER_ORDER.indexOf('Established');
    if (activeIdx < reqIdx) {
      return { locked: true, reason: 'LOCKED — Requires Established status' };
    }
  }
  if (assetId === 'plaza') {
    const reqIdx = TIER_ORDER.indexOf('Star');
    if (activeIdx < reqIdx) {
      return { locked: true, reason: 'LOCKED — Requires Star status' };
    }
  }

  // 2. Startups Seed Rounds & Crypto exchange
  if (['startup_seed', 'shiba_crypto'].includes(assetId)) {
    const reqIdx = TIER_ORDER.indexOf('Breakthrough');
    if (activeIdx < reqIdx) {
      return { locked: true, reason: 'LOCKED — Requires Breakthrough status' };
    }
  }

  // 3. Financial Empire/Trust setup
  if (assetId === 'financial_empire') {
    const reqIdx = TIER_ORDER.indexOf('Established');
    if (activeIdx < reqIdx) {
      return { locked: true, reason: 'LOCKED — Requires Established status' };
    }
  }

  return { locked: false, reason: '' };
}

/**
 * Helper to check lifestyle level lock based on the active financial tier.
 */
export function checkLifestyleLock(player: Player, category: string, level: string): { locked: boolean; reason: string } {
  const activeTier = getActiveFinancialTier(player);
  const activeIdx = TIER_ORDER.indexOf(activeTier);

  if (category === 'housing') {
    if (level === 'Apartment') {
      const reqIdx = TIER_ORDER.indexOf('Breakthrough');
      if (activeIdx < reqIdx) return { locked: true, reason: 'LOCKED — Requires Breakthrough status' };
    }
    if (level === 'Mansion') {
      const reqIdx = TIER_ORDER.indexOf('Established');
      if (activeIdx < reqIdx) return { locked: true, reason: 'LOCKED — Requires Established status' };
    }
  }

  if (category === 'training') {
    if (level === 'Pro') {
      const reqIdx = TIER_ORDER.indexOf('Breakthrough');
      if (activeIdx < reqIdx) return { locked: true, reason: 'LOCKED — Requires Breakthrough status' };
    }
    if (level === 'Elite') {
      const reqIdx = TIER_ORDER.indexOf('Established');
      if (activeIdx < reqIdx) return { locked: true, reason: 'LOCKED — Requires Established status' };
    }
  }

  if (category === 'nutrition') {
    if (level === 'Private Chef') {
      const reqIdx = TIER_ORDER.indexOf('Breakthrough');
      if (activeIdx < reqIdx) return { locked: true, reason: 'LOCKED — Requires Breakthrough status' };
    }
  }

  if (category === 'image') {
    if (level === 'Designer') {
      const reqIdx = TIER_ORDER.indexOf('Breakthrough');
      if (activeIdx < reqIdx) return { locked: true, reason: 'LOCKED — Requires Breakthrough status' };
    }
    if (level === 'Iconic') {
      const reqIdx = TIER_ORDER.indexOf('Star');
      if (activeIdx < reqIdx) return { locked: true, reason: 'LOCKED — Requires Star status' };
    }
  }

  return { locked: false, reason: '' };
}

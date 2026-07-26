import { Player, ScoutReport, DressingRoomEvent, Rival, Trophy, FinancialEmpire, InvestmentAsset, PreconditionsMet, RetirementData } from '../types';
import { UnifiedNPCEngine, NPCRegistry } from './npcEngine';
import { CLUBS } from '../data/teams';

// ==========================================
// SYSTEM 1: SCOUT REPORT GENERATOR
// ==========================================
export function generateMonthlyScoutReport(player: Player, week: number, season: number): ScoutReport {
  const date = `Season ${season}, Week ${week}`;
  
  // Sort attributes to find strengths and weaknesses
  const attrs = player.attributes;
  const sortedAttrs = Object.entries(attrs)
    .filter(([_, val]) => typeof val === 'number')
    .sort((a, b) => (b[1] as number) - (a[1] as number));
    
  const strengths = sortedAttrs.slice(0, 3).map(([key, val]) => `${key.replace(/([A-Z])/g, ' $1').toUpperCase()} (${val})`);
  const weaknesses = sortedAttrs.slice(-3).reverse().map(([key, val]) => `${key.replace(/([A-Z])/g, ' $1').toUpperCase()} (${val})`);

  // Calculate True Potential / Ceiling Stars
  // Map ceiling OVR range:
  // >=90 -> 5 stars
  // 80-89 -> 4 stars
  // 70-79 -> 3 stars
  // <70 -> 2 stars
  let trueCeilingStars = 2;
  if (player.ceiling >= 90) trueCeilingStars = 5;
  else if (player.ceiling >= 80) trueCeilingStars = 4;
  else if (player.ceiling >= 70) trueCeilingStars = 3;
  
  // Noise based on World Reputation (0-100)
  const rep = player.reputation.world;
  let noise = 0;
  if (rep <= 15) {
    // ±2 stars noise
    const roll = Math.floor(Math.random() * 5) - 2; // -2 to +2
    noise = roll;
  } else if (rep <= 60) {
    // ±1 star noise
    const roll = Math.floor(Math.random() * 3) - 1; // -1 to +1
    noise = roll;
  }
  
  const displayedStars = Math.max(1, Math.min(5, trueCeilingStars + noise));

  // Reputation tier at time of report
  let reputationTier = 'Regional Talent';
  if (rep > 75) reputationTier = 'Global Superstar';
  else if (rep > 50) reputationTier = 'National Icon';
  else if (rep > 25) reputationTier = 'Rising Star';

  // Transfer Value Formula
  const ageMultiplier = player.age < 23 ? 1.5 : player.age < 28 ? 1.2 : player.age < 32 ? 0.9 : 0.5;
  const reputationMultiplier = 1 + (player.reputation.world / 50);
  const calculatedVal = Math.floor((player.ovr ** 1.6) * ageMultiplier * reputationMultiplier * 350);
  
  // Format as a realistic band
  const lowBand = Math.max(100000, Math.floor(calculatedVal * 0.85));
  const highBand = Math.floor(calculatedVal * 1.15);
  
  const formatValue = (num: number) => {
    if (num >= 1000000) {
      return `£${(num / 1000000).toFixed(1)}M`;
    }
    return `£${Math.floor(num / 1000).toLocaleString()}k`;
  };
  
  const transferValue = `${formatValue(lowBand)} - ${formatValue(highBand)}`;

  // Comparison based on position
  let comparison = 'A solid player';
  const pos = player.position;
  if (pos === 'ST' || pos === 'LW' || pos === 'RW') {
    comparison = 'A dangerous inside forward in the mold of standard elite wingers, looking to cut inside and shoot.';
    if (player.ceiling >= 88) comparison = 'Unbelievable potential. Possesses the explosive stride of Kylian Mbappé paired with raw clinical insticts.';
  } else if (pos === 'AM' || pos === 'CM' || pos === 'LM' || pos === 'RM') {
    comparison = 'A neat midfielder focusing on links and steady progression.';
    if (player.ceiling >= 88) comparison = 'Generational maestro. Reads the pitch like Kevin De Bruyne, capable of defence-splitting direct line balls.';
  } else if (pos === 'CB' || pos === 'LB' || pos === 'RB') {
    comparison = 'A reliable defensive presence playing a physical game.';
    if (player.ceiling >= 88) comparison = 'Commanding defensive colossus styled in the legacy of Virgil van Dijk, calm under the press.';
  } else {
    comparison = 'An athletic goalkeeper focusing on angles and solid distribution.';
  }

  // Recommended focus: find the position's primary but lowest attribute
  let recommendedFocus = 'Tactical Awareness';
  const lowestAttr = sortedAttrs.slice(-1)[0];
  if (lowestAttr) {
    recommendedFocus = lowestAttr[0].replace(/([A-Z])/g, ' $1').toUpperCase();
  }

  // Find current club to assess coaching level
  const facilityLevel = player.lifestyleTier?.training || 'Basic';
  const isEliteCoaching = facilityLevel === 'Elite' || player.reputation.world >= 70;
  const isProCoaching = facilityLevel === 'Pro' || player.reputation.world >= 40;

  let coachingQualityDesc = "our basic youth scout network";
  if (isEliteCoaching) coachingQualityDesc = "the club's state-of-the-art Elite Performance Hub and chief data analyst";
  else if (isProCoaching) coachingQualityDesc = "our senior coaching staff's tactical assessments";

  // Generate dynamic assessment text based on detail level gated by reputation & coaching facilities
  let assessment = '';
  
  let potentialNarrative = "";
  if (player.ceiling >= 88) {
    if (isEliteCoaching) {
      potentialNarrative = "Our analytical modeling projects an absolute world-class ceiling. They are a rough diamond with the rare physical and cognitive capacity to contest the Ballon d'Or in their prime.";
    } else if (isProCoaching) {
      potentialNarrative = "Senior scouts are highly excited. They believe the player has a sky-high developmental peak and has the capacity to mature into a marquee elite first-teamer in the top flight.";
    } else {
      potentialNarrative = "Local scout whispers indicate a massive, highly-touted ceiling. There is a sense of untapped, special quality in their raw style, though precise projection is difficult.";
    }
  } else if (player.ceiling >= 78) {
    if (isEliteCoaching) {
      potentialNarrative = "Our quantitative tracking suggests a highly reliable, solid top-tier ceiling. While unlikely to reach generational superstardom, they possess the metrics to anchor a Champions League roster in their peak years.";
    } else if (isProCoaching) {
      potentialNarrative = "The coaching staff report a strong, healthy progression curve. They project the player becoming a key piece of a standard top-flight league roster with steady, dependable limits.";
    } else {
      potentialNarrative = "He shows promising signs of a dependable professional. There is solid room to grow if they maintain a disciplined training focus.";
    }
  } else {
    if (isEliteCoaching) {
      potentialNarrative = "Metrics suggest the player is rapidly approaching the finished product. Remaining development margin is slim; we project they are very close to their natural performance ceiling.";
    } else if (isProCoaching) {
      potentialNarrative = "The developmental staff believe they are a useful, steady squad option who is mostly finding his level now. Growth from this point will be incremental.";
    } else {
      potentialNarrative = "Scouts predict they have found a comfortable level in the squad, with a natural plateau likely in the near future.";
    }
  }

  if (rep < 25) {
    // Low detail
    assessment = `Scouts have been tracking your progression at ${player.currentClubSymbol}. Your current form rating sits at ${player.form}/100. Based on a quick assessment by ${coachingQualityDesc}, ${potentialNarrative} We require more high-intensity game data to confirm this ceiling.`;
  } else if (rep < 60) {
    // Medium detail
    assessment = `Detailed scout summary: Your technical growth is steady. Based on reviews from ${coachingQualityDesc}, ${potentialNarrative} Your physical data is solid, though tactical discipline can still be refined to maximize these limits.`;
  } else {
    // High detail
    assessment = `ELITE PROSPECT DOSSIER: You have evolved into one of the most exciting young talents. Based on highly detailed telemetry from ${coachingQualityDesc}, ${potentialNarrative} Analysts highlight your mental composure under pressure, recommending strict adherence to customized nutritional plans to reach this peak.`;
  }

  return {
    date,
    assessment,
    strengths,
    weaknesses,
    potentialRating: {
      displayedStars,
      trueCeilingStars,
      noiseApplied: noise,
      reputationTierAtTimeOfReport: reputationTier
    },
    transferValue,
    comparison,
    recommendedFocus
  };
}

// ==========================================
// SYSTEM 2: DRESSING ROOM RUMBLE
// ==========================================
export const RUMBLE_SCENARIOS = [
  {
    id: 'RUMBLE_THE_CLASH',
    type: 'The Clash',
    description: 'A physical training session boils over. Your veteran captain, Marcus Reilly, completely wipes out the young prospect, Mason Saka. Mason gets up furious and shoves Marcus. They have to be held back by staff. In the changing rooms, teammates are divided and pointing fingers.',
    choices: [
      'Back Marcus: Side with the veteran Captain to enforce old-school discipline.',
      'Defend Mason: Support the young academy lad against unnecessary dressing room bullying.',
      'Mediate: Urge them both to shake hands and remind them it is a team effort (Requires Leadership).',
      'Ignore: Walk away and ignore the childish drama entirely.'
    ],
    preconditionDesc: 'Triggered when Squad Cohesion drops below 50 (representing growing dressing room fractures).'
  },
  {
    id: 'RUMBLE_THE_LEAK',
    type: 'The Leak',
    description: 'An anonymous tabloid publishes our exact tactical team-sheet and a summary of our tactical meeting, hours before our match. The manager is absolutely livid, pacing around the locker room demanding to know who leaked it to the press.',
    choices: [
      'Stay Silent: Keep your head down and hope the storm blows over.',
      'Accuse the Reserves: Suggest to the boss that the fringe players are unhappy and probably responsible.',
      'Own Up to Carelessness: Explain you mistakenly left your tactics sheet in the player lounge (Manager trust up, teammates respect you).',
      'Demand an Internal Inquiry: Speak up to request a full dressing-room search to clean our name.'
    ],
    preconditionDesc: 'Triggered when you are flagged as knowing sensitive club info or media attention is high.'
  },
  {
    id: 'RUMBLE_THE_ARGUMENT',
    type: 'The Argument',
    description: 'The manager has introduced a rigid new tactical discipline system. Several senior players are grumbling in the corner, claiming the tactics are too conservative and are strangling our attacking creativity.',
    choices: [
      'Support the Boss: Openly defend the manager’s tactics, arguing that tactical structure wins trophies.',
      'Side with the Rebels: Agree with the veterans, complaining that we should be playing with more freedom.',
      'Offer Tactical Compromise: Suggest minor adjustments to the team leaders to present to the boss.',
      'Keep Out of It: Stay out of tactical politics and focus purely on your game.'
    ],
    preconditionDesc: 'Triggered when a tactical shift occurs and squad cohesion decays.'
  },
  {
    id: 'RUMBLE_THE_SCAPEGOAT',
    type: 'The Scapegoat',
    description: 'After a bad loss, the squad is heavily criticizing the performance of our centre-back, Tomas Brandt, claiming he was entirely at fault for the goals. Tomas is sitting in his stall with his head in his hands, completely isolated.',
    choices: [
      'Defend Tomas: Put your arm around him and tell the squad that we win and lose as a team.',
      'Join the Criticism: Tell Tomas he needs to step up, as his errors are costing everyone bonuses.',
      'Say Nothing: Say nothing and let the manager address the performance in the review.',
      'Change the Subject: Try to diffuse the tension by talking about our next training session.'
    ],
    preconditionDesc: 'Triggered after a heavy loss where a teammate performed poorly.'
  },
  {
    id: 'RUMBLE_THE_PARTY',
    type: 'The Party',
    description: 'A few teammates are organizing an unauthorized late-night party in London, mid-week. They invite you, but our next training session is scheduled early tomorrow morning under the manager’s strict watch.',
    choices: [
      'Go and Party: Drink, socialize, and build great teammate chemistry (Teammates rapport +15, Morale +10, Fatigue +15, Manager trust -12).',
      'Stay Home and Rest: Decline politely and get a full eight hours of sleep (Fatigue -10, Teammates rapport -5, Manager trust +5).',
      'Go briefly: Show your face for an hour, then slip out quietly to balance both worlds (Rapport +5, Fatigue +5).',
      'Snitch to Manager: Report the plan to the boss to show extreme discipline (Manager trust +20, Teammates rapport -25).'
    ],
    preconditionDesc: 'Triggered when rapport with team is high, on non-matchday eves.'
  },
  {
    id: 'RUMBLE_THE_TRANSFER',
    type: 'The Transfer',
    description: 'Your close teammate approaches you in private. He reveals that his agent is orchestrating a big money move to a rival club and he intends to force a transfer by skipping training. He asks you to keep his secret.',
    choices: [
      'Encourage Him: Support his career move, telling him to chase the bag and the spotlight.',
      'Convince Him to Stay: Tell him he is crucial to our project here and should reject the move.',
      'Report Him: Go directly to the Manager or Sporting Director to protect club interests (Manager trust +15, Teammate rapport -20).',
      'Stay Neutral: Tell him it is his career and you want no part of the decision.'
    ],
    preconditionDesc: 'Triggered when a teammate is in an open transfer thread.'
  }
];

export function checkAndTriggerDressingRoomRumble(player: Player, week: number): { event: DressingRoomEvent | null } {
  // Cooldown checking
  const cooldown = player.stateFlags.eventCooldowns.dressingRoomRumble || 0;
  if (cooldown > 0) return { event: null };

  // Determine eligible rumbles based on simulated state
  let eligibleIdx = 0;
  
  if (player.squadDynamics.cohesion < 50) {
    eligibleIdx = 0; // The Clash
  } else if (player.mediaPerception < 45) {
    eligibleIdx = 1; // The Leak
  } else if (player.relationships.manager < 50) {
    eligibleIdx = 2; // The Argument
  } else if (player.morale < 60) {
    eligibleIdx = 3; // The Scapegoat
  } else if (player.relationships.teammates >= 60) {
    eligibleIdx = 4; // The Party
  } else {
    eligibleIdx = 5; // The Transfer
  }

  const scenario = RUMBLE_SCENARIOS[eligibleIdx];
  
  const event: DressingRoomEvent = {
    date: `Week ${week}`,
    type: scenario.type,
    description: scenario.description,
    choices: scenario.choices
  };

  return { event };
}

// ==========================================
// SYSTEM 4: RIVALS SYSTEM
// ==========================================
export function generateRival(player: Player, registry?: NPCRegistry): { rival: Rival; registry: NPCRegistry } {
  const engine = new UnifiedNPCEngine(registry);
  const nationality = player.nationality || 'England';
  const targetOVR = Math.max(50, Math.min(99, (player.ovr || 65) + (Math.floor(Math.random() * 5) - 2)));
  const age = player.age || 18;
  const position = player.position || 'ST';

  // Find player's club or starting club to assign a realistic rival club in same league or comparable tier
  const playerClubSymbol = player.currentClubSymbol || player.startingClubSymbol || 'FA';
  const playerClub = CLUBS.find(c => c.symbol === playerClubSymbol);

  let candidateClubs = playerClub
    ? CLUBS.filter(c => c.league === playerClub.league && c.symbol !== playerClubSymbol)
    : CLUBS.filter(c => c.symbol !== playerClubSymbol);

  if (candidateClubs.length === 0) {
    candidateClubs = CLUBS.filter(c => c.symbol !== playerClubSymbol);
  }

  const rivalClub = candidateClubs[Math.floor(Math.random() * candidateClubs.length)] || CLUBS[0];

  const npc = engine.generatePlayer('RIVAL', nationality, targetOVR, age, position, rivalClub.symbol);
  const rivalName = `${npc.firstName} ${npc.lastName}`;

  const types: ('POSITIONAL_RIVAL' | 'AWARD_RIVAL' | 'GRUDGE_RIVAL')[] = ['POSITIONAL_RIVAL', 'AWARD_RIVAL', 'GRUDGE_RIVAL'];
  const rivalType = types[Math.floor(Math.random() * types.length)];

  const rivalGoals = Math.max(0, Math.floor(((player.stats?.goals) || 0) * 0.9) + Math.floor(Math.random() * 4));
  const playerForm = player.form || 70;
  const playerRating = playerForm / 10;
  const rivalRating = parseFloat((6.8 + Math.random() * 1.4).toFixed(1));

  const rival: Rival = {
    name: rivalName,
    club: rivalClub.symbol,
    position: npc.position,
    type: rivalType,
    escalatedTypes: [],
    headToHead: [],
    seasonComparison: {
      yourGoals: player.stats?.goals || 0,
      theirGoals: rivalGoals,
      yourRating: Math.floor(playerRating * 10) / 10,
      theirRating: rivalRating
    },
    mediaNarrative: `The press are drawing intense head-to-head comparisons between you and ${rivalName} of ${rivalClub.name}. This is a defining rivalry.`
  };

  return {
    rival,
    registry: engine.getRegistry()
  };
}

export function progressRivals(
  player: Player, 
  week: number, 
  registry?: NPCRegistry
): { player: Player; rivalMessage?: string; registry?: NPCRegistry } {
  if (!player.rivals || player.rivals.length === 0) {
    // Generate their first rival through UnifiedNPCEngine!
    const { rival: newR, registry: updatedRegistry } = generateRival(player, registry);
    const updated = {
      ...player,
      rivals: [newR]
    };
    return {
      player: updated,
      rivalMessage: `MEDIA ALERT: Factional battle lines are being drawn. ${newR.name} (${newR.club}) has been singled out as your arch-rival. Keep an eye on his stats weekly!`,
      registry: updatedRegistry
    };
  }

  // Progress stats of the existing rival
  const rivals = player.rivals.map(r => {
    // Rival scores or progresses
    const goalsRoll = Math.random() < 0.3 ? (Math.random() < 0.1 ? 2 : 1) : 0;
    const ratingRoll = 6.0 + (Math.random() * 3.0);
    
    // Check if head-to-head happens (e.g. playing their club this week)
    const isH2H = player.currentClubSymbol === r.club || (Math.random() < 0.08); // simple simulation or actual match
    const h2hRecord = [...r.headToHead];
    if (isH2H && h2hRecord.length < 5) {
      const yourG = Math.floor(Math.random() * 3);
      const theirG = Math.floor(Math.random() * 3);
      const result = yourG > theirG ? 'WIN' as const : yourG < theirG ? 'LOSS' as const : 'DRAW' as const;
      h2hRecord.push({
        date: `Week ${week}`,
        yourGoals: yourG,
        theirGoals: theirG,
        result
      });
    }

    const nextComparison = {
      yourGoals: player.stats?.goals || 0,
      theirGoals: r.seasonComparison.theirGoals + goalsRoll,
      yourRating: Math.floor((player.form || 70) / 10 * 10) / 10,
      theirRating: Math.floor(((r.seasonComparison.theirRating * (week - 1) + ratingRoll) / week) * 10) / 10
    };

    let narrative = r.mediaNarrative;
    if (nextComparison.theirGoals > nextComparison.yourGoals + 3) {
      narrative = `${r.name} is completely overshadowing your performances in public polls. Tabloids are asking if you have what it takes to catch him.`;
    } else if (nextComparison.yourGoals > nextComparison.theirGoals + 3) {
      narrative = `You have taken the absolute upper hand! The media are praising your clinical dominance over ${r.name}.`;
    } else {
      narrative = `Neck and neck. The pundits are split 50/50 on who will finish higher in the player of the year standings.`;
    }

    return {
      ...r,
      headToHead: h2hRecord,
      seasonComparison: nextComparison,
      mediaNarrative: narrative
    };
  });

  return {
    player: { ...player, rivals },
    rivalMessage: undefined,
    registry
  };
}

// ==========================================
// SYSTEM 5: TROPHY CABINET SYSTEM
// ==========================================
export function checkAndLogTrophies(player: Player, week: number, season: number, leaguePosition: number): { player: Player; trophyMessage?: string } {
  if (week !== 40) return { player }; // League ends at Week 40

  const trophies = player.trophies || [];
  
  if (leaguePosition === 1) {
    const trophyId = `league_s${season}_${Date.now()}`;
    const newTrophy: Trophy = {
      id: trophyId,
      name: 'Domestic League Champions',
      competition: 'EFL Championship',
      year: 2025 + season,
      story: `An unbelievable triumph! You secured the League Championship title with ${player.currentClubSymbol}. Spurred by your tactical growth and ${player.stats.goals} league goals, the squad celebrated on the final matchday in front of a packed stadium!`
    };

    const updatedTimeline = [
      {
        id: trophyId,
        week,
        day: 'SUN' as const,
        type: 'MILESTONE' as const,
        title: `🏆 LEAGUE CHAMPION!`,
        description: `Won the EFL Championship with ${player.currentClubSymbol}! Celebrations in the city are expected to last for days.`,
        clubSymbol: player.currentClubSymbol
      },
      ...(player.timeline || [])
    ];

    return {
      player: {
        ...player,
        trophies: [...trophies, newTrophy],
        timeline: updatedTimeline
      },
      trophyMessage: `🏆 TROPHY COLLECTED! You won the League Title! Check your profile tab to view the detailed chronicle.`
    };
  }

  return { player };
}

// ==========================================
// SYSTEM 6: FINANCIAL EMPIRE INVESTMENTS
// ==========================================
export function processFinancialEmpireWeekly(player: Player, week: number): { player: Player; payoutLog: string[] } {
  if (!player.financialEmpire) return { player, payoutLog: [] };

  const empire = { ...player.financialEmpire };
  let cash = player.finances.balance;
  const payoutLog: string[] = [];

  // 1. Process Property yields
  let propertyPayout = 0;
  empire.investments.forEach((inv) => {
    if (inv.type === 'PROPERTY') {
      const variance = (Math.random() * inv.varianceBand * 2) - inv.varianceBand; // flat percentage variance
      const payout = Math.floor(inv.baseWeeklyYield * (1 + variance));
      propertyPayout += payout;
    }
  });
  if (propertyPayout > 0) {
    cash += propertyPayout;
    payoutLog.push(`🏠 Property yield received: +£${propertyPayout.toLocaleString()}`);
  }

  // 2. Process Business dividends
  let businessPayout = 0;
  empire.investments.forEach((inv) => {
    if (inv.type === 'BUSINESS') {
      const variance = (Math.random() * inv.varianceBand * 2) - inv.varianceBand;
      const payout = Math.floor(inv.baseWeeklyYield * (1 + variance));
      businessPayout += payout;
    }
  });
  if (businessPayout > 0) {
    cash += businessPayout;
    payoutLog.push(`💼 Business Dividends received: +£${businessPayout.toLocaleString()}`);
  }

  // 3. Process Stock market growth
  const stockGrowth = Math.floor(empire.stocks.value * (empire.stocks.annualReturnRate / 52));
  empire.stocks.value += stockGrowth;
  if (stockGrowth > 0) {
    payoutLog.push(`📈 Stocks increased by +£${stockGrowth.toLocaleString()}`);
  }

  // 4. Process Cryptocurrency volatility
  // High variance (-15% to +15%)
  const cryptoVolatility = (Math.random() * 0.3) - 0.15;
  const oldPrice = empire.crypto.currentPrice;
  const newPrice = Math.max(0.01, Math.floor(oldPrice * (1 + cryptoVolatility) * 100) / 100);
  empire.crypto.currentPrice = newPrice;
  empire.crypto.value = Math.floor(empire.crypto.coinsHeld * newPrice);

  if (cryptoVolatility < -0.05) {
    empire.crypto.rollingFourWeekDrawdown = Math.min(1.0, empire.crypto.rollingFourWeekDrawdown + Math.abs(cryptoVolatility));
    payoutLog.push(`🚨 Crypto market crash: value down ${(Math.abs(cryptoVolatility) * 100).toFixed(1)}%!`);
  } else if (cryptoVolatility > 0.05) {
    empire.crypto.rollingFourWeekDrawdown = Math.max(0.0, empire.crypto.rollingFourWeekDrawdown - 0.1);
    payoutLog.push(`🚀 Crypto market surge: value up ${(cryptoVolatility * 100).toFixed(1)}%!`);
  }

  // Recalculate net worth: Cash Balance + Properties/Businesses cost + Stocks + Crypto
  const investmentsValue = empire.investments.reduce((sum, inv) => sum + inv.cost, 0);
  const totalNetWorth = cash + investmentsValue + empire.stocks.value + empire.crypto.value;

  empire.netWorth = totalNetWorth;
  empire.cashBalance = cash;
  empire.lastPayoutDate = `Week ${week}`;

  // Process Stage
  if (totalNetWorth >= 10000000) empire.stage = 'EMPEROR';
  else if (totalNetWorth >= 1000000) empire.stage = 'TYCOON';
  else if (totalNetWorth >= 100000) empire.stage = 'INVESTOR';
  else empire.stage = 'ROOKIE';

  return {
    player: {
      ...player,
      finances: {
        ...player.finances,
        balance: cash
      },
      financialEmpire: empire
    },
    payoutLog
  };
}

// ==========================================
// SYSTEM 8: SQUAD CHEMISTRY MAP
// ==========================================
export function getSquadHarmony(player: Player): number {
  return Math.min(100, Math.max(0, Math.round(
    (player.relationships.teammates * 0.5) +
    (player.squadDynamics.cohesion * 0.3) +
    (player.relationships.manager * 0.2)
  )));
}

export function getCliqueDetails(player: Player) {
  const teammatesRapport = player.relationships.teammates;
  
  if (teammatesRapport > 75) {
    return {
      dominantClique: 'United Front',
      description: 'The locker room is completely unified. Players train hard together, socialize off the pitch, and stand together as a collective. Excellent for morale.',
      cliques: [
        { name: 'Core Standard', size: 12, rapport: 88, alignment: 'Extremely Aligned' },
        { name: 'Foreign Contingent', size: 6, rapport: 80, alignment: 'Aligned' }
      ]
    };
  } else if (teammatesRapport < 40) {
    return {
      dominantClique: 'Fractured Front',
      description: 'Deep divisions exist between the senior roster players and the foreign transfers. Pockets of resentment are visible during drills. High risk of leak events.',
      cliques: [
        { name: 'The Old Guard', size: 8, rapport: 45, alignment: 'Rebellious' },
        { name: 'Foreign Contingent', size: 7, rapport: 32, alignment: 'Isolated' },
        { name: 'The Outcasts', size: 3, rapport: 15, alignment: 'Hostile' }
      ]
    };
  } else {
    return {
      dominantClique: 'Core Standard',
      description: 'Typical professional atmosphere. Sub-groups exist based on nationality and age, but they cooperate effectively during matchdays.',
      cliques: [
        { name: 'Core Standard', size: 10, rapport: 65, alignment: 'Neutral' },
        { name: 'Foreign Contingent', size: 6, rapport: 58, alignment: 'Neutral' },
        { name: 'Academy Prospects', size: 4, rapport: 60, alignment: 'Eager' }
      ]
    };
  }
}

// ==========================================
// SYSTEM 9: LEGACY SCORE CALCULATOR
// ==========================================
export function calculateLegacyScore(player: Player): RetirementData {
  const trophiesCount = player.trophies?.length || 0;
  const goals = player.stats.goals || 0;
  const assists = player.stats.assists || 0;
  const apps = player.stats.apps || 0;
  const worldRep = player.reputation.world;
  
  // Calculate Legacy Categories
  const trophiesWon = trophiesCount * 250;
  const individualAwards = Math.floor(worldRep * 20) + Math.floor(goals * 5);
  const longevity = apps * 15;
  const loyalty = (player.currentClubSymbol === player.startingClubSymbol ? 500 : 100);
  const internationalSuccess = player.stats.caps ? player.stats.caps * 100 : 0;
  
  // Tabulate statue adjustment
  let legacyStatue = 0;
  if (trophiesCount >= 3 && loyalty >= 500 && worldRep >= 80) {
    legacyStatue = 2000;
  }
  
  const total = trophiesWon + individualAwards + longevity + loyalty + internationalSuccess + legacyStatue;
  
  // Legacy Tiers
  let legacyTier = 'Local Hero';
  if (total >= 10000) legacyTier = 'Immortal Legend (Ballon d’Or Icon)';
  else if (total >= 5000) legacyTier = 'Continental Giant';
  else if (total >= 2500) legacyTier = 'National Treasure';

  // Secret Story Arc Legacy Tiers
  if (player.storyArc) {
    if (player.backstory === 'ACADEMY_GRADUATE' && player.currentClubSymbol === player.startingClubSymbol && trophiesCount > 0) {
       legacyTier = 'Academy Legend (Secret Unlock)';
       player.storyArc.legacyTierUnlocked = legacyTier;
    } else if (player.backstory === 'FALLEN_PRODIGY' && trophiesCount > 0 && worldRep >= 80) { // proxy for CL/WC
       legacyTier = 'Resurrection (Secret Unlock)';
       player.storyArc.legacyTierUnlocked = legacyTier;
    } else if (player.backstory === 'LATE_BLOOMER' && player.age >= 35 && trophiesCount > 0) {
       legacyTier = 'Never Too Late (Secret Unlock)';
       player.storyArc.legacyTierUnlocked = legacyTier;
    } else if (player.backstory === 'STREET_PRODIGY' && trophiesCount > 0 && player.attributes.dribbling >= 80) {
       legacyTier = 'Untamed (Secret Unlock)';
       player.storyArc.legacyTierUnlocked = legacyTier;
    } else if (player.backstory === 'EXILE' && trophiesCount > 0) {
       legacyTier = 'Redemption (Secret Unlock)';
       player.storyArc.legacyTierUnlocked = legacyTier;
    } else if (player.backstory === 'FROM_SCRATCH' && worldRep >= 60) {
       legacyTier = 'From Nothing (Secret Unlock)';
       player.storyArc.legacyTierUnlocked = legacyTier;
    }
  }

  return {
    date: `Year ${new Date().getFullYear()}`,
    age: player.age,
    finalClub: player.currentClubSymbol,
    careerStats: {
      appearances: apps,
      goals,
      assists,
      trophies: trophiesCount
    },
    legacyScoreBreakdown: {
      trophiesWon,
      individualAwards,
      longevity,
      loyalty,
      internationalSuccess,
      legacyStatue,
      interviewAdjustment: 0,
      total
    },
    legacyScore: total,
    legacyTier,
    lastInterview: [],
    clubs: [
      { club: player.startingClubSymbol, years: '2025-2028', legacy: loyalty >= 500 ? 'Immortal Captain' : 'Former Youth Prospect', appearances: apps, goals: goals }
    ],
    timeline: [
      { year: 2025, event: `Signed your first professional contract at ${player.startingClubSymbol}` }
    ]
  };
}

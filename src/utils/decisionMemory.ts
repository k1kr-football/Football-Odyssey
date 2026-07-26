import { TimelineEvent } from '../types';
import { GameState } from '../store/GameContext';

export interface DecisionEntry {
  id: string;
  choiceText: string;
  system: string; // e.g. 'Calendar Event', 'Cutscene', 'PR Control Desk', 'Contract Negotiation', 'Transfer Request', 'Player Council'
  week: number;
  season: number;
  age: number;
  npcsInvolved: string[]; // e.g. ["Journalist X", "Manager", "Agent"]
  entitiesInvolved: string[]; // clubs or sponsor brand symbols (e.g. "ARS", "VictorySwoosh")
  significance: 'MINOR' | 'MODERATE' | 'MAJOR' | 'DEFINING';
  description: string; // narrative explanation of what they did
  statConsequences?: string; // e.g. "+10 Rep, -5 Morale"
  timestamp: string; // "MON 14:00" format
}

export type DecisionMemoryLog = DecisionEntry[];

/**
 * Filter and query rules based on significance and "narrative cooling" periods.
 * - MINOR: cools down and stops being retrieved after 1 full season.
 * - MODERATE: cools down and stops being retrieved after 3 full seasons.
 * - MAJOR & DEFINING: never cool down and can be retrieved at any time (even 10 seasons later).
 */
export function isDecisionNarrativelyHot(entry: DecisionEntry, currentSeason: number): boolean {
  const ageInSeasons = currentSeason - entry.season;
  if (entry.significance === 'MINOR') {
    return ageInSeasons <= 1;
  }
  if (entry.significance === 'MODERATE') {
    return ageInSeasons <= 3;
  }
  return true; // MAJOR and DEFINING remain hot indefinitely (unlimited range)
}

/**
 * Adds a new decision entry to the shared persistent memory log.
 * Also feeds the Career Timeline directly if the entry is MAJOR or DEFINING.
 */
export function addDecision(
  state: GameState,
  choiceText: string,
  system: string,
  significance: 'MINOR' | 'MODERATE' | 'MAJOR' | 'DEFINING',
  npcsInvolved: string[],
  entitiesInvolved: string[],
  description: string,
  statConsequences?: string
): GameState {
  if (!state.player) return state;

  // Lightweight check: skip recording MINOR entries if they have no consequences or meaning
  if (significance === 'MINOR' && !statConsequences && npcsInvolved.length === 0) {
    return state; // skip logging to prevent database/log bloat
  }

  const timestamp = `${state.currentDay} 12:00`;
  const entry: DecisionEntry = {
    id: `decision_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    choiceText,
    system,
    week: state.currentWeek,
    season: state.season,
    age: state.player.age || 18,
    npcsInvolved,
    entitiesInvolved,
    significance,
    description,
    statConsequences,
    timestamp
  };

  const currentLog: DecisionMemoryLog = (state.player as any).decisionMemory || [];
  const updatedLog = [...currentLog, entry];

  // Auto-populate Career Timeline directly if MAJOR or DEFINING
  let updatedTimeline = [...(state.player.timeline || [])];
  if (significance === 'MAJOR' || significance === 'DEFINING') {
    const symbolText = significance === 'DEFINING' ? '👑 DEFINING MOMENT' : '🏆 KEY DECISION';
    const timelineEntry: TimelineEvent = {
      id: `timeline_${entry.id}`,
      week: state.currentWeek,
      day: state.currentDay,
      type: 'MILESTONE',
      title: `${symbolText}: ${system}`,
      description: entry.description,
      clubSymbol: state.player.currentClubSymbol
    };
    updatedTimeline = [timelineEntry, ...updatedTimeline];
  }

  return {
    ...state,
    player: {
      ...state.player,
      timeline: updatedTimeline,
      // Store the log directly inside player state flags for deep save-file persistence
      stateFlags: {
        ...state.player.stateFlags,
        decisionMemory: updatedLog
      }
    }
  };
}

/**
 * General cross-system query engine for historical decisions.
 * Supports filtering by system, NPC, club/sponsor, and automatically applies significance cooling rules.
 */
export function queryDecisionMemory(
  state: GameState,
  filters: {
    system?: string;
    npc?: string;
    entity?: string;
    minSignificance?: 'MINOR' | 'MODERATE' | 'MAJOR' | 'DEFINING';
    onlyHot?: boolean; // whether to apply the "narrative cooling" filters
  } = {}
): DecisionEntry[] {
  if (!state.player) return [];
  
  const log: DecisionMemoryLog = (state.player.stateFlags as any)?.decisionMemory || [];
  const currentSeason = state.season;

  return log.filter((entry) => {
    // 1. Filter by system
    if (filters.system && entry.system.toLowerCase() !== filters.system.toLowerCase()) {
      return false;
    }

    // 2. Filter by involved NPC name
    if (filters.npc && !(entry.npcsInvolved || []).some(name => name.toLowerCase().includes(filters.npc!.toLowerCase()))) {
      return false;
    }

    // 3. Filter by involved entity (club or sponsor)
    if (filters.entity && !(entry.entitiesInvolved || []).some(ent => ent.toLowerCase() === filters.entity!.toLowerCase())) {
      return false;
    }

    // 4. Filter by minimum significance level
    if (filters.minSignificance) {
      const significanceOrder = ['MINOR', 'MODERATE', 'MAJOR', 'DEFINING'];
      const entryIndex = significanceOrder.indexOf(entry.significance);
      const minIndex = significanceOrder.indexOf(filters.minSignificance);
      if (entryIndex < minIndex) return false;
    }

    // 5. Apply Narrative Cooling filter
    if (filters.onlyHot !== false && !isDecisionNarrativelyHot(entry, currentSeason)) {
      return false;
    }

    return true;
  });
}

/**
 * Derives a clean, dynamic relationship-level text summary and tone modifier for any NPC based on accumulated log entries
 */
export function deriveRelationshipSummary(
  npcName: string,
  state: GameState
): {
  summary: string;
  tone: 'WARM' | 'CORDIAL' | 'SKEPTICAL' | 'CONFLICT';
  count: number;
} {
  const log: DecisionMemoryLog = (state.player?.stateFlags as any)?.decisionMemory || [];
  const relevant = log.filter(d => (d.npcsInvolved || []).some(name => name.toLowerCase().includes(npcName.toLowerCase())));

  if (relevant.length === 0) {
    return {
      summary: "No formal history of notable interactions.",
      tone: "CORDIAL",
      count: 0
    };
  }

  const definingDef = relevant.find(d => d.significance === 'DEFINING');
  const majorDef = relevant.filter(d => d.significance === 'MAJOR');

  const hasConflict = relevant.some(d => {
    const text = (d.choiceText || '').toLowerCase();
    return text.includes('dispute') || 
      text.includes('angry') || 
      text.includes('argue') || 
      text.includes('refuse') || 
      text.includes('skip') ||
      text.includes('leak');
  });

  const hasWarmth = relevant.some(d => {
    const text = (d.choiceText || '').toLowerCase();
    return text.includes('back') || 
      text.includes('defend') || 
      text.includes('support') || 
      text.includes('agree') || 
      text.includes('mingle') ||
      text.includes('loyalty');
  });

  let summary = "";
  let tone: 'WARM' | 'CORDIAL' | 'SKEPTICAL' | 'CONFLICT' = 'CORDIAL';

  if (definingDef) {
    summary = `Career-defining history: "${definingDef.description}"`;
    tone = hasConflict ? 'CONFLICT' : 'WARM';
  } else if (majorDef.length > 0) {
    summary = `Significant milestone: "${majorDef[0].description}"`;
    tone = hasConflict ? 'CONFLICT' : (hasWarmth ? 'WARM' : 'SKEPTICAL');
  } else {
    if (hasConflict && hasWarmth) {
      summary = "A turbulent history of both key agreements and high-tension disputes.";
      tone = 'SKEPTICAL';
    } else if (hasConflict) {
      summary = "A strained record marked by clashes or uncooperative choices.";
      tone = 'CONFLICT';
    } else if (hasWarmth) {
      summary = "Generally professional, collaborative, and supportive in your dealings.";
      tone = 'WARM';
    } else {
      summary = "Standard professional relationship with typical routine dealings.";
      tone = 'CORDIAL';
    }
  }

  return { summary, tone, count: relevant.length };
}

/**
 * Compiles a stakeholder map summarizing relationship standings derived from choices.
 */
export function deriveRelationshipMap(state: GameState): Record<string, { status: 'WARM' | 'CORDIAL' | 'SKEPTICAL' | 'CONFLICT'; summary: string }> {
  const categories = ["Manager", "Agent", "Journalists", "Teammates", "Fans"];
  const map: Record<string, { status: 'WARM' | 'CORDIAL' | 'SKEPTICAL' | 'CONFLICT'; summary: string }> = {};

  for (const cat of categories) {
    const result = deriveRelationshipSummary(cat, state);
    map[cat] = {
      status: result.tone,
      summary: result.summary
    };
  }

  return map;
}

/**
 * Returns a list of mock worked example decisions to seed the system or showcase
 * retrieval behavior under different seasons.
 */
export function getSeededDecisionExamples(currentAge: number): DecisionEntry[] {
  return [
    {
      id: "seeded_ex_1",
      choiceText: "Mingle at Team Bonding Dinner",
      system: "Calendar Event",
      week: 12,
      season: 1,
      age: Math.max(18, currentAge - 7),
      npcsInvolved: ["Alex Sterling"],
      entitiesInvolved: ["EVE"],
      significance: "MINOR",
      description: "Decided to mingle and socialise at the team dinner instead of paying for luxury private tables.",
      statConsequences: "+5 Teammates, -0 Wages",
      timestamp: "WED 20:00"
    },
    {
      id: "seeded_ex_2",
      choiceText: "Refuse Contract Offer & Request Transfer",
      system: "Contract Negotiation",
      week: 28,
      season: 3,
      age: Math.max(18, currentAge - 5),
      npcsInvolved: ["Journalist X", "Manager", "Agent"],
      entitiesInvolved: ["ARS"],
      significance: "MAJOR",
      description: "Triggered a public contract standoff with the board, demanding an immediate transfer listing after wages were undervalued.",
      statConsequences: "-20 Manager Trust, +15 Brand Fame",
      timestamp: "FRI 11:30"
    }
  ];
}

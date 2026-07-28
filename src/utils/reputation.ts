import { Player } from '../types';

export interface ReputationTag {
  id: string;
  name: string;
  description: string;
  badgeColor: string; // Tailwind color classes
  triggerDesc: string;
  effectDesc: string;
}

export const REPUTATION_TAGS: ReputationTag[] = [
  {
    id: 'BIG_GAME_PLAYER',
    name: 'Big Game Player',
    description: 'Saves their best performances for high-pressure finals, derbies, and crucial matches.',
    badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    triggerDesc: 'World Reputation >= 45, Peer Respect >= 55, and solid matches played.',
    effectDesc: '+5 boost to all mental attributes during Matchday Derbies and Cup Finals.'
  },
  {
    id: 'MODEL_PROFESSIONAL',
    name: 'Model Professional',
    description: 'A manager\'s dream. Exceptional work ethic, discipline, and commitment to the squad.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    triggerDesc: 'Peer Respect >= 75 and Manager Trust >= 75.',
    effectDesc: 'Passive +10% Training XP gain; dressing room unrest scenarios never trigger.'
  },
  {
    id: 'FAN_FAVOURITE',
    name: 'Fan Favourite',
    description: 'Adored by the supporters. Your name is chanted in the terraces every single week.',
    badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    triggerDesc: 'World Reputation >= 35, Media Perception >= 65, and Fan Relationship >= 65%.',
    effectDesc: 'Multiplies organic social media follower growth by 1.5x; higher baseline merchandise revenues.'
  },
  {
    id: 'INCONSISTENT',
    name: 'Inconsistent',
    description: 'Capable of pure magic or complete disappearance. Kept on a short leash.',
    badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    triggerDesc: 'World Reputation >= 25, but Media Perception is highly volatile.',
    effectDesc: 'Match rating impact on Manager Trust is doubled in both directions.'
  },
  {
    id: 'DISRUPTIVE_INFLUENCE',
    name: 'Disruptive Influence',
    description: 'A lightning rod for drama. Demanding, combative, and quick to vent to the press.',
    badgeColor: 'bg-red-500/10 text-red-400 border border-red-500/30',
    triggerDesc: 'Peer Respect < 35 and Manager Trust < 40.',
    effectDesc: 'Reduces overall Squad Chemistry by 10%; manager trust recovers 50% slower.'
  },
  {
    id: 'BOTTLER',
    name: 'Bottler',
    description: 'Prone to cracking under heavy media pressure or in big matches.',
    badgeColor: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    triggerDesc: 'Media Perception < 35 and Peer Respect < 35.',
    effectDesc: '-5 penalty to composure and finishing attributes in matches with pressure >= 7.'
  },
  {
    id: 'MEDIA_DARLING',
    name: 'Media Darling',
    description: 'The golden child of the tabloids and pundits. Can do no wrong in the press.',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    triggerDesc: 'Media Perception >= 80.',
    effectDesc: 'Negative press conference choices have 50% less penalty; raises weekly sponsor base fees.'
  },
  {
    id: 'UNSUNG_HERO',
    name: 'Unsung Hero',
    description: 'Criminally underrated by the public but immensely valued by teammates and coach.',
    badgeColor: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
    triggerDesc: 'Peer Respect >= 70, but World Reputation < 45 and Media Perception < 50.',
    effectDesc: 'Teammates play 10% more defensive cover for you; interested managers value you more.'
  },
  {
    id: 'MERCENARY',
    name: 'Mercenary',
    description: 'Motivated primarily by bank balance, luxury flexes, and the next big transfer contract.',
    badgeColor: 'bg-lime-500/10 text-lime-400 border border-lime-500/30',
    triggerDesc: 'World Reputation >= 30, owning >= 2 properties or high-end lifestyle, and teammates relationship < 45.',
    effectDesc: 'Reduces contract negotiation resistance at new clubs; increases transfer demand force.'
  }
];

/**
 * Returns the active tags for a player based on their stats and dimensions.
 */
export function getReputationTags(player: Player): string[] {
  const tags: string[] = [];
  const world = player.reputation?.world || 0;
  const media = player.mediaPerception || 0;
  const peer = player.reputation?.peerRespect || 50;
  const trust = player.trust || 50;
  const teammatesRel = player.relationships?.teammates || 50;
  const fans = player.fans || 50;
  
  // 1. Model Professional
  if (peer >= 75 && trust >= 75) {
    tags.push('MODEL_PROFESSIONAL');
  }
  
  // 2. Disruptive Influence
  if (peer < 35 && trust < 40) {
    tags.push('DISRUPTIVE_INFLUENCE');
  }
  
  // 3. Fan Favourite
  if (world >= 35 && media >= 65 && fans >= 65) {
    tags.push('FAN_FAVOURITE');
  }
  
  // 4. Media Darling
  if (media >= 80) {
    tags.push('MEDIA_DARLING');
  }
  
  // 5. Bottler
  if (media < 35 && peer < 35) {
    tags.push('BOTTLER');
  }
  
  // 6. Unsung Hero
  if (peer >= 70 && world < 45 && media < 50) {
    tags.push('UNSUNG_HERO');
  }
  
  // 7. Mercenary
  const propertiesOwnedCount = (player.stateFlags?.openThreads as any)?.investments?.properties?.length || 0;
  const hasLuxuryLifestyle = player.lifestyleTier?.housing === 'Mansion' || player.lifestyleTier?.image === 'Iconic';
  if (world >= 30 && (propertiesOwnedCount >= 1 || hasLuxuryLifestyle) && teammatesRel < 45) {
    tags.push('MERCENARY');
  }
  
  // 8. Big Game Player
  const apps = player.stats?.apps || 0;
  if (world >= 45 && peer >= 55 && apps >= 10 && (player.stats?.goals || 0) + (player.stats?.assists || 0) >= 4) {
    tags.push('BIG_GAME_PLAYER');
  }
  
  // 9. Inconsistent
  if (world >= 25 && media >= 30 && (player.form || 50) < 55) {
    if (!tags.includes('MODEL_PROFESSIONAL') && !tags.includes('BIG_GAME_PLAYER') && !tags.includes('DISRUPTIVE_INFLUENCE')) {
      tags.push('INCONSISTENT');
    }
  }

  // Fallback defaults
  if (tags.length === 0) {
    if (world < 25) {
      tags.push('THE_HOT_PROSPECT');
    } else {
      tags.push('SOLID_CONTRIBUTOR');
    }
  }
  
  return tags;
}

/**
 * Returns human-readable label for a tag
 */
export function getTagName(tagId: string): string {
  if (tagId === 'THE_HOT_PROSPECT') return 'The Hot Prospect';
  if (tagId === 'SOLID_CONTRIBUTOR') return 'Solid Contributor';
  const tag = REPUTATION_TAGS.find(t => t.id === tagId);
  return tag ? tag.name : tagId;
}

/**
 * Helper to update dimensions with logs.
 */
export function updateReputationAndPerception(
  player: Player,
  deltas: { world?: number; media?: number; peer?: number },
  reason: string,
  currentWeek: number,
  currentDay: string
): { player: Player; changeLog: string } {
  const updated = { ...player };
  if (!updated.reputation) {
    updated.reputation = {
      club: 50, league: 50, world: 50, peerRespect: 50,
      skill: 50, attitude: 50, media: 50, fans: 50, global: 50, legacy: 50
    };
  }
  if (updated.reputation.peerRespect === undefined) {
    updated.reputation.peerRespect = 50;
  }

  const dWorld = deltas.world || 0;
  const dMedia = deltas.media || 0;
  const dPeer = deltas.peer || 0;

  // Apply with clamping
  updated.reputation.world = Math.max(0, Math.min(100, updated.reputation.world + dWorld));
  updated.mediaPerception = Math.max(0, Math.min(100, updated.mediaPerception + dMedia));
  updated.reputation.peerRespect = Math.max(0, Math.min(100, updated.reputation.peerRespect + dPeer));

  // Sync relationships to Peer Respect / Media Perception where appropriate
  if (dPeer !== 0) {
    updated.relationships.teammates = Math.max(0, Math.min(100, updated.relationships.teammates + Math.round(dPeer * 0.8)));
  }

  // Log inside state history
  if (!updated.stateFlags) {
    updated.stateFlags = { historyFlags: {}, openThreads: {}, eventCooldowns: {} } as any;
  }
  const stateFlagsAny = updated.stateFlags as any;
  if (!stateFlagsAny.reputationHistory) {
    stateFlagsAny.reputationHistory = [];
  }

  const dateStr = `Wk ${currentWeek} ${currentDay}`;
  stateFlagsAny.reputationHistory.unshift({
    date: dateStr,
    deltaWorld: dWorld,
    deltaMedia: dMedia,
    deltaPeer: dPeer,
    reason
  });

  // Keep history size reasonable
  if (stateFlagsAny.reputationHistory.length > 20) {
    stateFlagsAny.reputationHistory.pop();
  }

  // Format a friendly notification changeLog
  const parts: string[] = [];
  if (dWorld !== 0) parts.push(`World Rep ${dWorld > 0 ? '+' : ''}${dWorld}`);
  if (dMedia !== 0) parts.push(`Media Perception ${dMedia > 0 ? '+' : ''}${dMedia}`);
  if (dPeer !== 0) parts.push(`Peer Respect ${dPeer > 0 ? '+' : ''}${dPeer}`);

  const changeLog = parts.length > 0 ? `${parts.join(', ')} (${reason})` : '';
  return { player: updated, changeLog };
}

/**
 * Handles decay and recency weighting (run weekly).
 * Media Perception decays toward neutral 50. World Reputation is sticky. Peer Respect decays very slightly.
 */
export function decayReputationAndPerception(
  player: Player,
  currentWeek: number
): { player: Player; decayMsgs: string[] } {
  const updated = { ...player };
  if (!updated.reputation) return { player, decayMsgs: [] };
  if (updated.reputation.peerRespect === undefined) {
    updated.reputation.peerRespect = 50;
  }

  const decayMsgs: string[] = [];

  // Media Perception is highly volatile, decays 3% toward 50 weekly
  const mediaDiff = updated.mediaPerception - 50;
  if (Math.abs(mediaDiff) > 1) {
    const decayAmount = Math.round(mediaDiff * 0.05) || (mediaDiff > 0 ? 1 : -1);
    updated.mediaPerception = updated.mediaPerception - decayAmount;
    decayMsgs.push(`Media Perception recency decay toward 50 (changed by ${-decayAmount > 0 ? '+' : ''}${-decayAmount})`);
  }

  // Peer Respect decays very slowly toward 50 (1% decay)
  const peerDiff = updated.reputation.peerRespect - 50;
  if (Math.abs(peerDiff) > 2) {
    const decayAmount = Math.round(peerDiff * 0.02) || (peerDiff > 0 ? 1 : -1);
    updated.reputation.peerRespect = updated.reputation.peerRespect - decayAmount;
  }

  // World Reputation decays only if benched or injured, otherwise is sticky. We handle it here as a very minor baseline shift toward 30 (representing career baseline drift) if they have high fame but aren't playing, but normally it's extremely sticky.
  
  return { player: updated, decayMsgs };
}

/**
 * Calculates Team Chemistry based on player interactions in the Social section,
 * teammate relationships, form consistency, mentoring, and hierarchy role.
 */
export function calculateSquadChemistry(player: Player): number {
  if (!player) return 50;
  const teammateRel = player.relationships?.teammates ?? 50;
  const form = player.form ?? 50;
  const trust = player.trust ?? 50;
  
  // Mentoring active count
  const mentees = (player.stateFlags as any)?.openThreads?.mentees || [];
  const activeMenteesCount = mentees.filter((m: any) => m.isMentored).length;
  const mentoringBonus = activeMenteesCount * 8; // +8% per active mentee

  let chemistry = Math.round((teammateRel * 0.45) + (form * 0.30) + (trust * 0.15) + mentoringBonus);
  
  // Hierarchy role bonus
  if (player.hierarchyRole === 'Captain') chemistry += 8;
  else if (player.hierarchyRole === 'Vice-Captain') chemistry += 5;
  else if (player.hierarchyRole === 'Core') chemistry += 3;

  return Math.max(10, Math.min(100, chemistry));
}


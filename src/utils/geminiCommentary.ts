export interface CommentaryRequestPayload {
  eventType: 'GOAL_USER' | 'GOAL_OPP' | 'KEY_DECISION' | 'TACTICAL_SWITCH' | 'INJURY' | 'CARD' | 'HALF_TIME' | 'FULL_TIME' | string;
  minute: number;
  playerName: string;
  playerPosition?: string;
  playerReputation?: {
    club?: number;
    league?: number;
    world?: number;
    global?: number;
    peerRespect?: number;
  };
  userClub?: {
    name: string;
    symbol: string;
    ovr?: number;
  };
  oppClub?: {
    name: string;
    symbol: string;
    ovr?: number;
  };
  score?: {
    userScore: number;
    oppScore: number;
  };
  decisionText?: string;
  decisionOutcome?: string;
  tacticalName?: string;
}

export interface CommentaryResponse {
  success: boolean;
  commentary: string;
  isAiGenerated: boolean;
}

export async function requestGeminiMatchCommentary(payload: CommentaryRequestPayload): Promise<CommentaryResponse> {
  try {
    const res = await fetch('/api/match-commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return {
      success: data.success ?? true,
      commentary: data.commentary || generateLocalFallbackCommentary(payload),
      isAiGenerated: !!data.isAiGenerated
    };
  } catch (err) {
    console.warn("Failed to fetch live Gemini commentary, using local fallback:", err);
    return {
      success: false,
      commentary: generateLocalFallbackCommentary(payload),
      isAiGenerated: false
    };
  }
}

export function generateLocalFallbackCommentary(p: CommentaryRequestPayload): string {
  const name = p.playerName || 'The player';
  const worldRep = p.playerReputation?.world || p.playerReputation?.global || 30;
  const repTag = worldRep >= 75 ? 'global superstar' : worldRep >= 50 ? 'marquee talent' : 'promising prospect';
  const clubName = p.userClub?.name || 'Home Club';
  const oppName = p.oppClub?.name || 'Visitors';

  switch (p.eventType) {
    case 'GOAL_USER':
      return `GOAL! ${name}, the ${repTag} for ${clubName}, sparks absolute delirium in the stands with an incredible finish!`;
    case 'GOAL_OPP':
      return `STUNNER! ${oppName} carve open ${clubName}'s defense and score to alter the momentum of this high-stakes clash!`;
    case 'KEY_DECISION':
      return `HIGH LEVERAGE MOMENT: ${name} steps up in minute ${p.minute}'. Every spectator is watching as the ${repTag} takes charge!`;
    case 'TACTICAL_SWITCH':
      return `TACTICAL INSTRUCTION: ${clubName} shift system to ${p.tacticalName || 'new setup'}. ${name} adapts position immediately!`;
    case 'INJURY':
      return `MEDICAL INCIDENT: Play stops as ${name} goes down under pressure. Concerned looks from the ${clubName} bench!`;
    case 'HALF_TIME':
      return `HALF TIME: The referee blows for the interval. ${clubName} ${p.score?.userScore ?? 0}-${p.score?.oppScore ?? 0} ${oppName}. High strategic drama ahead!`;
    case 'FULL_TIME':
      return `FULL TIME: The final whistle sounds! ${clubName} ${p.score?.userScore ?? 0}-${p.score?.oppScore ?? 0} ${oppName}. A memorable chapter in ${name}'s career!`;
    default:
      return `Intense pressure on the pitch as ${name} drives ${clubName} forward against ${oppName}!`;
  }
}

import { GameState } from '../store/GameContext';
import { Player } from '../types';
import { addDecision } from './decisionMemory';

export type AgentMeetingTopic = 'TRANSFER_AMBITION' | 'CONTRACT_DEMANDS' | 'PR_STRATEGY';

export interface AgentMeetingOption {
  id: string;
  topic: AgentMeetingTopic;
  title: string;
  description: string;
}

export const AGENT_MEETING_OPTIONS: AgentMeetingOption[] = [
  // TRANSFER AMBITION
  {
    id: 'PUSH_FOR_MOVE',
    topic: 'TRANSFER_AMBITION',
    title: 'Push for a Big Move',
    description: 'Instruct your agent to start working back channels for a move to a bigger club.'
  },
  {
    id: 'STAY_LOYAL',
    topic: 'TRANSFER_AMBITION',
    title: 'Commit to Current Club',
    description: 'Tell your agent to shut down any transfer rumors and focus on your legacy here.'
  },
  // CONTRACT DEMANDS
  {
    id: 'DEMAND_WAGE_PARITY',
    topic: 'CONTRACT_DEMANDS',
    title: 'Demand Wage Parity',
    description: 'Complain that you are underpaid compared to squad peers. Demand an immediate renegotiation strategy.'
  },
  {
    id: 'FOCUS_ON_BONUSES',
    topic: 'CONTRACT_DEMANDS',
    title: 'Focus on Performance Bonuses',
    description: 'Tell your agent you back yourself. Ask them to prioritize goal/assist bonuses in future talks.'
  },
  // PR STRATEGY
  {
    id: 'AGGRESSIVE_PR',
    topic: 'PR_STRATEGY',
    title: 'Aggressive Media Strategy',
    description: 'Tell your agent to use the media to hype you up and put pressure on the manager.'
  },
  {
    id: 'LOW_PROFILE',
    topic: 'PR_STRATEGY',
    title: 'Keep a Low Profile',
    description: 'Instruct your agent to keep your name out of the papers so you can focus on football.'
  }
];

export interface AgentMeetingResult {
  updatedState: GameState;
  agentDialog: string;
  relationshipChange: number;
  summary: string;
}

export function processAgentMeeting(state: GameState, optionId: string): AgentMeetingResult {
  const player = { ...state.player } as Player;
  const option = AGENT_MEETING_OPTIONS.find(o => o.id === optionId) || AGENT_MEETING_OPTIONS[0];
  
  const currentAgentName = player.agentName || 'Your Agent';
  
  let agentDialog = '';
  let relationshipChange = 0;
  let summary = '';
  
  if (optionId === 'PUSH_FOR_MOVE') {
      agentDialog = `"I hear you loud and clear. I'll start making some discreet calls to top sporting directors. But you need to keep delivering on the pitch to make this happen."`;
      summary = "Agent instructed to seek transfer opportunities.";
      relationshipChange = 2;
      player.stateFlags = { ...player.stateFlags, agentFocus: 'TRANSFER' };
  } else if (optionId === 'STAY_LOYAL') {
      agentDialog = `"Loyalty is rare these days, but it builds legends. I'll put out a brief to the press that you are fully committed to the project here."`;
      summary = "Agent instructed to reject external interest.";
      relationshipChange = 5;
      player.stateFlags = { ...player.stateFlags, agentFocus: 'LOYALTY' };
  } else if (optionId === 'DEMAND_WAGE_PARITY') {
      agentDialog = `"You deserve it. The market dictates you should be on parity with the top earners. I'll prepare a dossier for the board."`;
      summary = "Agent instructed to aggressively push for higher base wages.";
      relationshipChange = 0;
      player.stateFlags = { ...player.stateFlags, agentFocus: 'WAGES' };
  } else if (optionId === 'FOCUS_ON_BONUSES') {
      agentDialog = `"I like the confidence. We'll structure the next deal to heavily reward your direct goal contributions. It's a win-win for the club if you produce."`;
      summary = "Agent instructed to focus on performance bonuses in negotiations.";
      relationshipChange = 4;
      player.stateFlags = { ...player.stateFlags, agentFocus: 'BONUSES' };
  } else if (optionId === 'AGGRESSIVE_PR') {
      agentDialog = `"We'll get your name trending. A few well-placed leaks about training ground heroics and 'unnamed suitors' should do the trick."`;
      summary = "Agent instructed to push an aggressive media PR strategy.";
      relationshipChange = 3;
      player.stateFlags = { ...player.stateFlags, agentFocus: 'PR_HYPE' };
      if (player.reputation) {
          player.reputation.media = Math.min(100, player.reputation.media + 5);
      }
  } else if (optionId === 'LOW_PROFILE') {
      agentDialog = `"Understood. We'll decline the interviews and let your boots do the talking. I'll keep the noise away from you."`;
      summary = "Agent instructed to minimize press and focus on football.";
      relationshipChange = 2;
      player.stateFlags = { ...player.stateFlags, agentFocus: 'FOOTBALL' };
  }
  
  if (player.relationships) {
      player.relationships.agent = Math.min(100, Math.max(0, (player.relationships.agent || 50) + relationshipChange));
  }

  // Set cooldown
  player.stateFlags = {
      ...player.stateFlags,
      lastAgentMeetingWeek: state.currentWeek
  };

  let updatedState = { ...state, player };
  updatedState = addDecision(
      updatedState,
      `Agent Meeting: ${option.title}`,
      'Agent',
      'MODERATE',
      [currentAgentName],
      [player.currentClubSymbol],
      `Discussed ${option.topic.toLowerCase()} with agent. Outcome: ${summary}`,
      `Agent Relationship +${relationshipChange}`
  );

  return {
      updatedState,
      agentDialog,
      relationshipChange,
      summary
  };
}

export function canRequestAgentMeeting(state: GameState): { allowed: boolean; remainingWeeks: number } {
  const lastWeek = state.player?.stateFlags?.lastAgentMeetingWeek;
  if (lastWeek === undefined || lastWeek === null) {
    return { allowed: true, remainingWeeks: 0 };
  }
  const diff = state.currentWeek - lastWeek;
  if (diff >= 4) {
    return { allowed: true, remainingWeeks: 0 };
  }
  return { allowed: false, remainingWeeks: 4 - diff };
}

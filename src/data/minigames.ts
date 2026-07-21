import { Position, SubPosition } from "../types";

export type IntensityLevel = 'Light' | 'Standard' | 'Intense' | 'Recovery';

export interface MinigameConfig {
  id: string;
  title: string;
  description: string;
  engine: 'TIMING' | 'DECISION' | 'SEQUENCE' | 'INTENSITY' | 'RECOVERY';
  category: 'UNIVERSAL' | Position | 'DM' | 'LWB' | 'RWB' | 'SS' | 'MENTAL';
  targetAttributes: string[];
  injuryRiskBase: number; // e.g. 0.05
}

export const UNIVERSAL_MINIGAMES: MinigameConfig[] = [
  { id: 'RONDO', title: 'Rondo (5v2)', description: 'Keep possession against two pressing defenders.', engine: 'TIMING', category: 'UNIVERSAL', targetAttributes: ['passing', 'composure'], injuryRiskBase: 0.02 },
  { id: 'FIT_COND', title: 'Fitness & Conditioning', description: 'Manage your intensity across interval blocks. Match the target heart rate.', engine: 'INTENSITY', category: 'UNIVERSAL', targetAttributes: ['stamina'], injuryRiskBase: 0.05 },
  { id: 'TAC_SHAPE', title: 'Tactical Shape', description: 'Pattern recognition. Choose the correct positional response fast.', engine: 'DECISION', category: 'UNIVERSAL', targetAttributes: ['decisionMaking', 'tacticalAwareness'], injuryRiskBase: 0.02 },
  { id: 'SET_PIECE', title: 'Set Piece Rehearsal', description: 'Take a free-kick or corner. Choose your delivery and execute.', engine: 'DECISION', category: 'UNIVERSAL', targetAttributes: ['vision', 'passing'], injuryRiskBase: 0.02 },
  { id: 'RECOVERY', title: 'Recovery Session', description: 'Light stretching and pool work. Zero skill required. Clears fatigue.', engine: 'RECOVERY', category: 'UNIVERSAL', targetAttributes: [], injuryRiskBase: 0.0 }
];

export const MENTAL_MINIGAMES: MinigameConfig[] = [
  { id: 'PATTERN_REC', title: 'Pattern Recognition', description: 'Watch footage and identify opposition formations.', engine: 'DECISION', category: 'MENTAL', targetAttributes: ['tacticalAwareness'], injuryRiskBase: 0.0 },
  { id: 'VIDEO_ANALYSIS', title: 'Video Analysis', description: 'Study your own past performances.', engine: 'DECISION', category: 'MENTAL', targetAttributes: ['tacticalAwareness', 'composure'], injuryRiskBase: 0.0 }
];

export const POSITION_MINIGAMES: MinigameConfig[] = [
  // GK
  { id: 'GK_SHOT_STOP', title: 'Shot Stopping', description: 'React quickly to shots from varying angles.', engine: 'SEQUENCE', category: 'GK', targetAttributes: ['agility'], injuryRiskBase: 0.03 },
  { id: 'GK_CROSS_CLAIM', title: 'Cross Claiming', description: 'Time your jump to pluck crosses out of the air.', engine: 'TIMING', category: 'GK', targetAttributes: ['agility'], injuryRiskBase: 0.04 },
  { id: 'GK_DIST', title: 'Distribution', description: 'Pick out the target with a timed release.', engine: 'TIMING', category: 'GK', targetAttributes: ['passing'], injuryRiskBase: 0.01 },
  { id: 'GK_1V1', title: 'One-on-One', description: 'Read the attacker and choose your action.', engine: 'DECISION', category: 'GK', targetAttributes: ['decisionMaking'], injuryRiskBase: 0.05 },
  { id: 'GK_PENALTY', title: 'Penalty Saving', description: 'Read the taker\'s body shape.', engine: 'DECISION', category: 'GK', targetAttributes: ['agility'], injuryRiskBase: 0.02 },

  // CB
  { id: 'CB_AERIAL', title: 'Aerial Duels', description: 'Time your jump against a simulated striker.', engine: 'TIMING', category: 'CB', targetAttributes: ['strength'], injuryRiskBase: 0.05 },
  { id: 'CB_TACKLE', title: 'Tackling', description: 'Select the correct tackle type under pressure.', engine: 'DECISION', category: 'CB', targetAttributes: ['tackling'], injuryRiskBase: 0.06 },
  { id: 'CB_BALL_PLAY', title: 'Ball-Playing Drill', description: 'Find the outlet under heavy press.', engine: 'DECISION', category: 'CB', targetAttributes: ['passing', 'composure'], injuryRiskBase: 0.02 },
  { id: 'CB_DEF_POS', title: 'Defensive Positioning', description: 'Shadow the correct runner to maintain shape.', engine: 'SEQUENCE', category: 'CB', targetAttributes: ['decisionMaking'], injuryRiskBase: 0.03 },

  // FB (LB, RB)
  { id: 'FB_CROSSING', title: 'Crossing', description: 'Time your overlap and select the right delivery.', engine: 'TIMING', category: 'LB', targetAttributes: ['passing'], injuryRiskBase: 0.04 },
  { id: 'FB_TRACKING', title: 'Defensive Tracking', description: 'Stay tight using sequence inputs.', engine: 'SEQUENCE', category: 'LB', targetAttributes: ['stamina', 'decisionMaking'], injuryRiskBase: 0.05 },
  { id: 'FB_COMBO', title: 'Combination Play', description: 'Simulate automatic link-up down the wing.', engine: 'SEQUENCE', category: 'LB', targetAttributes: ['passing'], injuryRiskBase: 0.03 },

  // DM (Mapped to CM with Defensive Midfielder sub-position)
  { id: 'DM_INTERCEPT', title: 'Interception Reading', description: 'Predict the passing pattern.', engine: 'DECISION', category: 'DM', targetAttributes: ['decisionMaking'], injuryRiskBase: 0.04 },
  { id: 'DM_PRESS', title: 'Pressing Triggers', description: 'Identify when to break the line and press.', engine: 'DECISION', category: 'DM', targetAttributes: ['determination'], injuryRiskBase: 0.04 },
  { id: 'DM_SHIELD', title: 'Shielding Retention', description: 'Retain the ball against multiple pressers.', engine: 'TIMING', category: 'DM', targetAttributes: ['strength', 'composure'], injuryRiskBase: 0.05 },

  // CM
  { id: 'CM_PASS_COMBO', title: 'Passing Combinations', description: 'Execute a memory-based passing sequence.', engine: 'SEQUENCE', category: 'CM', targetAttributes: ['passing', 'vision'], injuryRiskBase: 0.02 },
  { id: 'CM_BOX2BOX', title: 'Box-to-Box Running', description: 'Manage intervals and make late box runs.', engine: 'INTENSITY', category: 'CM', targetAttributes: ['stamina', 'determination'], injuryRiskBase: 0.06 },
  { id: 'CM_RETENTION', title: 'Ball Retention', description: 'Hold the ball in tight spaces.', engine: 'SEQUENCE', category: 'CM', targetAttributes: ['dribbling'], injuryRiskBase: 0.04 },

  // AM
  { id: 'AM_THROUGH', title: 'Through-Ball Threading', description: 'Time the perfect ball into the channel.', engine: 'TIMING', category: 'AM', targetAttributes: ['vision', 'passing'], injuryRiskBase: 0.02 },
  { id: 'AM_TIGHT_DRIB', title: 'Dribbling (Tight Spaces)', description: 'Beat the block with sequence inputs.', engine: 'SEQUENCE', category: 'AM', targetAttributes: ['dribbling'], injuryRiskBase: 0.04 },
  { id: 'AM_LONG_SHOT', title: 'Long-Range Shooting', description: 'Set power and placement from distance.', engine: 'TIMING', category: 'AM', targetAttributes: ['finishing'], injuryRiskBase: 0.03 },

  // Winger (LM, RM, LW, RW)
  { id: 'W_1V1', title: 'One-on-One Dribbling', description: 'Read defender archetypes and beat them.', engine: 'SEQUENCE', category: 'LW', targetAttributes: ['dribbling', 'pace'], injuryRiskBase: 0.05 },
  { id: 'W_CROSS_BYLINE', title: 'Byline Crossing', description: 'Beat the man and time the cross.', engine: 'TIMING', category: 'LW', targetAttributes: ['dribbling', 'passing'], injuryRiskBase: 0.04 },
  { id: 'W_CUT_INSIDE', title: 'Cutting Inside', description: 'Time the cut and wrap the shot.', engine: 'TIMING', category: 'LW', targetAttributes: ['finishing', 'dribbling'], injuryRiskBase: 0.04 },
  { id: 'W_SPRINT', title: 'Sprint Endurance', description: 'High-intensity interval bursts.', engine: 'INTENSITY', category: 'LW', targetAttributes: ['stamina', 'pace'], injuryRiskBase: 0.07 },

  // Striker (ST)
  { id: 'ST_FINISHING', title: 'Finishing', description: 'Core finishing variants (1v1, Volley, Header).', engine: 'TIMING', category: 'ST', targetAttributes: ['finishing', 'composure'], injuryRiskBase: 0.03 },
  { id: 'ST_AERIAL', title: 'Aerial Attacking', description: 'Time run, jump, and header placement.', engine: 'TIMING', category: 'ST', targetAttributes: ['finishing', 'strength'], injuryRiskBase: 0.05 },
  { id: 'ST_HOLDUP', title: 'Hold-up Play', description: 'Back to goal against a physical CB.', engine: 'TIMING', category: 'ST', targetAttributes: ['strength'], injuryRiskBase: 0.05 },
  { id: 'ST_MOVEMENT', title: 'Movement & Runs', description: 'Read delivery situations correctly.', engine: 'DECISION', category: 'ST', targetAttributes: ['decisionMaking'], injuryRiskBase: 0.03 },
  { id: 'ST_PENALTY', title: 'Penalty Taking', description: 'Placement and power under pressure.', engine: 'TIMING', category: 'ST', targetAttributes: ['finishing', 'composure'], injuryRiskBase: 0.01 },

  // Second Striker / CF (Mapped to SS)
  { id: 'SS_COMBO_FINISH', title: 'Combination Finishing', description: 'Read lay-offs and finish from tight angles.', engine: 'DECISION', category: 'SS', targetAttributes: ['finishing', 'vision'], injuryRiskBase: 0.03 },
  { id: 'SS_LINKUP', title: 'Link-up Passing', description: 'Receive, one-two, and spin in behind.', engine: 'SEQUENCE', category: 'SS', targetAttributes: ['passing'], injuryRiskBase: 0.03 }
];

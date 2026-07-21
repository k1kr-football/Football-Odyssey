import { Attributes, Position } from '../types';

export interface PlayerRole {
  id: string; // unique ID
  name: string;
  description: string;
  keyAttributes: (keyof Attributes)[];
  attributeWeights: Partial<Record<keyof Attributes, number>>; // Multipliers: e.g. 1.5, 1.3
  recommendedDrills: string[]; // Minigame IDs (e.g. 'ST_FINISHING')
  tacticalDescription: string;
  synergyTrait: string; // Existing or new trait
  synergyReason: string;
  preferredTacticalSystems: ('Gegenpress' | 'Tiki-Taka' | 'Low Block' | 'Direct Counter')[];
}

export const POSITION_GROUPS: Record<Position, string> = {
  ST: 'Striker',
  LW: 'Winger',
  RW: 'Winger',
  LM: 'Winger',
  RM: 'Winger',
  LB: 'Full-Back',
  RB: 'Full-Back',
  LWB: 'Full-Back',
  RWB: 'Full-Back',
  DM: 'Central Midfielder',
  CM: 'Central Midfielder',
  AM: 'Central Midfielder',
  SS: 'Striker',
  CB: 'Center Back',
  GK: 'Goalkeeper'
};

export const ROLES_BY_GROUP: Record<string, PlayerRole[]> = {
  'Striker': [
    {
      id: 'poacher',
      name: 'Poacher',
      description: 'A dedicated goalscorer who rarely joins build-up play, waiting on the shoulder of the last defender to snatch goals.',
      keyAttributes: ['finishing', 'positioning', 'composure', 'firstTouch'],
      attributeWeights: {
        finishing: 1.5,
        positioning: 1.4,
        composure: 1.3,
        firstTouch: 1.2
      },
      recommendedDrills: ['ST_FINISHING', 'ST_MOVEMENT', 'ST_PENALTY'],
      tacticalDescription: 'Requires high finishing, positioning, and composure to capitalize on loose balls and pinpoint crosses in the box.',
      synergyTrait: 'Fox in the Box',
      synergyReason: 'Complements the Poacher\'s close-range instincts, boosting success rates of close-range reactions.',
      preferredTacticalSystems: ['Direct Counter', 'Low Block']
    },
    {
      id: 'advanced_forward',
      name: 'Advanced Forward',
      description: 'The spearhead of the attack. Runs in behind, chases long balls, and initiates high presses on opposing defenders.',
      keyAttributes: ['pace', 'dribbling', 'stamina', 'finishing'],
      attributeWeights: {
        pace: 1.5,
        dribbling: 1.3,
        stamina: 1.3,
        finishing: 1.2
      },
      recommendedDrills: ['ST_FINISHING', 'ST_MOVEMENT', 'W_SPRINT'],
      tacticalDescription: 'Relies on blistering pace and stamina to run channels, pull CBs out of position, and drive towards goal.',
      synergyTrait: 'Speed Merchant',
      synergyReason: 'Supercharges physical breakaway animations and stamina retention on counter-attacks.',
      preferredTacticalSystems: ['Gegenpress', 'Direct Counter']
    },
    {
      id: 'false_9',
      name: 'False 9',
      description: 'A deep-lying attacker who drops into midfield spaces, dragging center-backs out of line and supplying winger runs.',
      keyAttributes: ['passing', 'vision', 'firstTouch', 'composure', 'decisionMaking'],
      attributeWeights: {
        passing: 1.4,
        vision: 1.4,
        firstTouch: 1.3,
        composure: 1.3,
        decisionMaking: 1.2
      },
      recommendedDrills: ['SS_LINKUP', 'RONDO', 'CM_PASS_COMBO'],
      tacticalDescription: 'Trades box presence for deep playmaker capability, requiring elite vision, passing, and first touch.',
      synergyTrait: 'Tries Killer Balls Often',
      synergyReason: 'Matches dropping deep perfectly, giving the False 9 extra playmaking options during buildup situatons.',
      preferredTacticalSystems: ['Tiki-Taka', 'Gegenpress']
    }
  ],
  'Winger': [
    {
      id: 'inside_forward',
      name: 'Inside Forward',
      description: 'An inverted winger who cuts inside onto their stronger foot to shoot or combine, operating like an extra striker.',
      keyAttributes: ['dribbling', 'finishing', 'pace', 'agility'],
      attributeWeights: {
        dribbling: 1.4,
        finishing: 1.4,
        pace: 1.3,
        agility: 1.3
      },
      recommendedDrills: ['W_CUT_INSIDE', 'W_1V1', 'ST_FINISHING'],
      tacticalDescription: 'Unlocks shooting situations from wide, relying on finishing and dribbling to weave inside full-backs.',
      synergyTrait: 'Trickster',
      synergyReason: 'Increases the likelihood of clean cut-inside dribbling checks.',
      preferredTacticalSystems: ['Tiki-Taka', 'Gegenpress']
    },
    {
      id: 'traditional_winger',
      name: 'Traditional Winger',
      description: 'Stays glued to the touchline, beats their marker with pace, and whips crosses into the box for the striker.',
      keyAttributes: ['pace', 'passing', 'dribbling', 'stamina'],
      attributeWeights: {
        pace: 1.5,
        passing: 1.4,
        dribbling: 1.3,
        stamina: 1.2
      },
      recommendedDrills: ['W_CROSS_BYLINE', 'W_SPRINT', 'W_1V1'],
      tacticalDescription: 'Focuses on touchline width and pinpoint delivery, benefiting from high pace, passing, and stamina.',
      synergyTrait: 'Pinpoint Crosser',
      synergyReason: 'Whips in dangerous, high-value crosses that raise target striker ratings and goal outcomes.',
      preferredTacticalSystems: ['Direct Counter', 'Gegenpress']
    }
  ],
  'Full-Back': [
    {
      id: 'wing_back',
      name: 'Wing-Back',
      description: 'An attacking flank player who overlaps continuously, providing crossing outlets and wide passing options.',
      keyAttributes: ['stamina', 'pace', 'passing', 'agility'],
      attributeWeights: {
        stamina: 1.5,
        pace: 1.4,
        passing: 1.3,
        agility: 1.2
      },
      recommendedDrills: ['FB_CROSSING', 'FB_COMBO', 'FIT_COND'],
      tacticalDescription: 'Hugs the flanks on high overlaps, requiring elite stamina to cover both defensive and attacking bounds.',
      synergyTrait: 'Iron Lungs',
      synergyReason: 'Mitigates the extreme stamina decay of high-intensity overlap schedules.',
      preferredTacticalSystems: ['Gegenpress', 'Direct Counter']
    },
    {
      id: 'inverted_full_back',
      name: 'Inverted Full-Back',
      description: 'A defensive-minded full-back who tucks inside into central midfield during build-up to form a solid back three or extra pivot.',
      keyAttributes: ['passing', 'vision', 'tackling', 'positioning', 'decisionMaking'],
      attributeWeights: {
        passing: 1.4,
        vision: 1.3,
        tackling: 1.3,
        positioning: 1.2,
        decisionMaking: 1.2
      },
      recommendedDrills: ['CB_BALL_PLAY', 'RONDO', 'FB_TRACKING'],
      tacticalDescription: 'Tucks inside centrally to fortify build-up channels and block counters, requiring intelligence and clean passing.',
      synergyTrait: 'Tactical Brain',
      synergyReason: 'Boosts positioning and spatial awareness ratings when acting as a pivot helper.',
      preferredTacticalSystems: ['Tiki-Taka', 'Low Block']
    }
  ],
  'Central Midfielder': [
    {
      id: 'box_to_box',
      name: 'Box-to-Box Midfielder',
      description: 'A dynamic, high-energy midfielder who contributes equally to breaking up play and making late attacking runs.',
      keyAttributes: ['stamina', 'strength', 'tackling', 'passing', 'finishing'],
      attributeWeights: {
        stamina: 1.4,
        strength: 1.3,
        tackling: 1.3,
        passing: 1.2,
        finishing: 1.2
      },
      recommendedDrills: ['CM_BOX2BOX', 'FIT_COND', 'CB_TACKLE'],
      tacticalDescription: 'Maintains presence across both boxes. Requires outstanding all-round physical and technical stamina.',
      synergyTrait: 'Engine Room',
      synergyReason: 'Ensures the midfielder retains high physical performance across both offensive and defensive transitions.',
      preferredTacticalSystems: ['Gegenpress', 'Direct Counter']
    },
    {
      id: 'deep_lying_playmaker',
      name: 'Deep-Lying Playmaker',
      description: 'Coordinates play from deep midfield, shielding the backline while carving open defenses with vision and long passes.',
      keyAttributes: ['vision', 'passing', 'composure', 'decisionMaking', 'firstTouch'],
      attributeWeights: {
        vision: 1.5,
        passing: 1.5,
        composure: 1.3,
        decisionMaking: 1.2,
        firstTouch: 1.1
      },
      recommendedDrills: ['AM_THROUGH', 'RONDO', 'CM_PASS_COMBO'],
      tacticalDescription: 'Sits deep to dictate the tempo of matches. Demands world-class vision, passing range, and press resistance.',
      synergyTrait: 'Tries Killer Balls Often',
      synergyReason: 'Dramatically raises final pass completion and assist creation rates from deep pockets.',
      preferredTacticalSystems: ['Tiki-Taka', 'Low Block']
    },
    {
      id: 'ball_winning_midfielder',
      name: 'Ball-Winning Midfielder',
      description: 'The defensive destroyer in midfield. Charges down opponents, makes vital tackles, and cycles possession quickly.',
      keyAttributes: ['tackling', 'strength', 'decisionMaking', 'determination', 'stamina'],
      attributeWeights: {
        tackling: 1.5,
        strength: 1.4,
        decisionMaking: 1.2,
        determination: 1.2,
        stamina: 1.1
      },
      recommendedDrills: ['DM_SHIELD', 'CB_TACKLE', 'DM_PRESS'],
      tacticalDescription: 'Neutralizes attacking transitions before they hit the defense, leveraging aggressive strength and precise tackling.',
      synergyTrait: 'Enforcer',
      synergyReason: 'Increases tackling win rate and intimidates opposing playmakers, reducing their composure.',
      preferredTacticalSystems: ['Low Block', 'Gegenpress']
    }
  ],
  'Center Back': [
    {
      id: 'stopper',
      name: 'Stopper CB',
      description: 'An aggressive, physical center-back who steps up early to challenge attackers, win headers, and clear the lines.',
      keyAttributes: ['strength', 'tackling', 'positioning', 'determination'],
      attributeWeights: {
        strength: 1.5,
        tackling: 1.4,
        positioning: 1.3,
        determination: 1.2
      },
      recommendedDrills: ['CB_AERIAL', 'CB_TACKLE', 'CB_DEF_POS'],
      tacticalDescription: 'Dominates aerial duels and physical contact, acting as a direct defensive shield against robust target men.',
      synergyTrait: 'Brick Wall',
      synergyReason: 'Gives high-value defensive blocks and tackles an extra momentum boost.',
      preferredTacticalSystems: ['Low Block', 'Direct Counter']
    },
    {
      id: 'ball_playing_cb',
      name: 'Ball-Playing CB',
      description: 'A modern defender comfortable in possession, building attacks from the back and launching accurate long balls.',
      keyAttributes: ['passing', 'composure', 'vision', 'firstTouch', 'decisionMaking'],
      attributeWeights: {
        passing: 1.4,
        composure: 1.4,
        vision: 1.3,
        firstTouch: 1.2,
        decisionMaking: 1.2
      },
      recommendedDrills: ['CB_BALL_PLAY', 'RONDO', 'CM_PASS_COMBO'],
      tacticalDescription: 'Takes on high press-resistance duties inside the box, distributing with composure and vision.',
      synergyTrait: 'Calm under Pressure',
      synergyReason: 'Prevents critical errors when being pressed deep inside the defensive third.',
      preferredTacticalSystems: ['Tiki-Taka', 'Gegenpress']
    }
  ],
  'Goalkeeper': [
    {
      id: 'traditional_keeper',
      name: 'Traditional Keeper',
      description: 'Focuses on elite positioning, shot-stopping reflex speed, and imposing dominance in the six-yard box.',
      keyAttributes: ['agility', 'positioning', 'composure', 'strength'],
      attributeWeights: {
        agility: 1.5,
        positioning: 1.4,
        composure: 1.3,
        strength: 1.2
      },
      recommendedDrills: ['GK_SHOT_STOP', 'GK_CROSS_CLAIM', 'GK_PENALTY'],
      tacticalDescription: 'Sits deep to guard the line, maximizing pure reactive save capabilities and tight positioning.',
      synergyTrait: 'Cat-like Reflexes',
      synergyReason: 'Raises standard save rates and penalty saving success rates during clutch moments.',
      preferredTacticalSystems: ['Low Block', 'Direct Counter']
    },
    {
      id: 'sweeper_keeper',
      name: 'Sweeper Keeper',
      description: 'A proactive goalkeeper who rushes off their line to clear long balls, and initiates attacks with fine passing range.',
      keyAttributes: ['vision', 'passing', 'pace', 'decisionMaking', 'agility'],
      attributeWeights: {
        vision: 1.4,
        passing: 1.4,
        pace: 1.3,
        decisionMaking: 1.3,
        agility: 1.2
      },
      recommendedDrills: ['GK_DIST', 'GK_1V1', 'RONDO'],
      tacticalDescription: 'Acts as an eleven-man sweeping outlet outside the box, utilizing vision and fast pace to control space.',
      synergyTrait: 'Tries Killer Balls Often',
      synergyReason: 'Triggers long-range direct counter launches from GK distributions.',
      preferredTacticalSystems: ['Tiki-Taka', 'Gegenpress']
    }
  ]
};

export function getRoleById(roleId: string): PlayerRole | undefined {
  for (const group of Object.keys(ROLES_BY_GROUP)) {
    const found = ROLES_BY_GROUP[group].find(r => r.id === roleId);
    if (found) return found;
  }
  return undefined;
}

export function getRolesForPosition(position: Position): PlayerRole[] {
  const group = POSITION_GROUPS[position] || 'Striker';
  return ROLES_BY_GROUP[group] || [];
}

export function getManagerTacticalFit(managerTacticalSystem: string, role: PlayerRole): {
  rating: 'PERFECT' | 'COMPATIBLE' | 'AWKWARD';
  note: string;
  bonus: number; // multiplier for trust, selection odds, etc.
} {
  const system = managerTacticalSystem as any;
  if (role.preferredTacticalSystems.includes(system)) {
    return {
      rating: 'PERFECT',
      note: 'Ideal fit for the gaffer\'s tactical system',
      bonus: 1.15
    };
  }
  
  // Generic compatibility
  const compatSystems: Record<string, string[]> = {
    'Gegenpress': ['poacher', 'traditional_winger', 'wing_back', 'box_to_box', 'ball_winning_midfielder', 'ball_playing_cb', 'sweeper_keeper'],
    'Tiki-Taka': ['false_9', 'inside_forward', 'inverted_full_back', 'deep_lying_playmaker', 'ball_playing_cb', 'sweeper_keeper'],
    'Low Block': ['poacher', 'traditional_winger', 'inverted_full_back', 'ball_winning_midfielder', 'deep_lying_playmaker', 'stopper', 'traditional_keeper'],
    'Direct Counter': ['advanced_forward', 'traditional_winger', 'wing_back', 'box_to_box', 'stopper', 'traditional_keeper']
  };

  const isCompatible = (compatSystems[system] || []).includes(role.id);

  if (isCompatible) {
    return {
      rating: 'COMPATIBLE',
      note: 'Tactically viable under this setup',
      bonus: 1.0
    };
  } else {
    return {
      rating: 'AWKWARD',
      note: 'Doesn\'t fit the gaffer\'s tactical system',
      bonus: 0.85
    };
  }
}

export function getDefaultRoleForPositionAndTrait(pos: Position, trait: string): string {
  if (pos === 'ST') {
    if (trait === 'Tries Killer Balls Often') return 'false_9';
    if (trait === 'Flicks & Tricks' || trait === 'Big Match Player') return 'advanced_forward';
    return 'poacher';
  }
  if (pos === 'CM' || pos === 'AM') {
    if (trait === 'Tries Killer Balls Often') return 'deep_lying_playmaker';
    if (trait === 'Leadership Presence') return 'ball_winning_midfielder';
    return 'box_to_box';
  }
  if (['LW', 'RW', 'LM', 'RM'].includes(pos)) {
    if (['Curls Shots', 'Flicks & Tricks', 'Long Shot Taker'].includes(trait)) return 'inside_forward';
    return 'traditional_winger';
  }
  if (['LB', 'RB'].includes(pos)) {
    if (['Tries Killer Balls Often', 'Leadership Presence'].includes(trait)) return 'inverted_full_back';
    return 'wing_back';
  }
  if (pos === 'CB') {
    if (trait === 'Tries Killer Balls Often') return 'ball_playing_cb';
    return 'stopper';
  }
  if (pos === 'GK') {
    if (trait === 'Tries Killer Balls Often') return 'sweeper_keeper';
    return 'traditional_keeper';
  }
  return '';
}

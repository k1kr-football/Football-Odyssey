export type PositionGroup = 'GK' | 'DEFENDER' | 'MIDFIELDER' | 'ATTACKING_MID_WING' | 'STRIKER';

export interface DecisionOption {
  text: string;
  attrKey: 'finishing' | 'passing' | 'dribbling' | 'composure' | 'pace' | 'tackling' | 'vision';
  attrName: string;
  risk: 'LOW' | 'MED' | 'HIGH';
  description: string;
}

export interface KeyDecision {
  minute: number;
  title: string;
  situation: string;
  options: DecisionOption[];
}

export interface SituationTemplate {
  titleTemplate: string; // e.g. "1v1 BREAKAWAY BATTLE"
  situation: string;
  options: DecisionOption[];
}

export function getPositionGroup(pos: string = 'ST'): PositionGroup {
  const p = (pos || 'ST').toUpperCase();
  if (p === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].includes(p)) return 'DEFENDER';
  if (['DM', 'CDM', 'CM', 'LM', 'RM', 'MID'].includes(p)) return 'MIDFIELDER';
  if (['AM', 'CAM', 'LW', 'RW', 'SS', 'WING'].includes(p)) return 'ATTACKING_MID_WING';
  return 'STRIKER';
}

const GK_SITUATIONS: SituationTemplate[] = [
  {
    titleTemplate: '1v1 BREAKAWAY DANGER',
    situation: "An opposition winger breaks past the high defensive line and surges into the box 1-on-1 with you!",
    options: [
      { text: "Rush Out & Smother Ball", attrKey: 'tackling', attrName: '1v1 Reflexes', risk: 'MED', description: 'Dive aggressively at their feet to strip possession' },
      { text: "Hold Line & Stand Tall", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Maintain your ground to narrow the shooting angle' },
      { text: "Sweep Outside Penalty Box", attrKey: 'pace', attrName: 'Pace / Sweeping', risk: 'HIGH', description: 'Sprint out of the box to kick the ball out of play' }
    ]
  },
  {
    titleTemplate: 'CORNER KICK INSWINGER',
    situation: "A dangerous whipped inswinging corner bends towards your 6-yard box through a sea of bodies!",
    options: [
      { text: "Leap & High Claim", attrKey: 'composure', attrName: 'Handling / Composure', risk: 'MED', description: 'Rise above incoming strikers to snatch ball cleanly' },
      { text: "Power Punch Outside Box", attrKey: 'tackling', attrName: 'Punching / Tackling', risk: 'LOW', description: 'Box the delivery clear away from goal' },
      { text: "Quick Distribution Throw", attrKey: 'passing', attrName: 'Passing / Vision', risk: 'HIGH', description: 'Catch and instantly throw long to launch counter' }
    ]
  },
  {
    titleTemplate: 'STINGING LONG RANGE SHOT',
    situation: "A fierce knuckleball volley rockets toward the top corner from 25 yards out!",
    options: [
      { text: "Fingertip Push Round Post", attrKey: 'composure', attrName: 'Reflexes / Composure', risk: 'LOW', description: 'Safely tip the ball wide for a corner kick' },
      { text: "Catch & Hold Cleanly", attrKey: 'composure', attrName: 'Catching / Composure', risk: 'HIGH', description: 'Absorb the heavy strike to stifle opposition momentum' },
      { text: "Parry Forward to Counter", attrKey: 'vision', attrName: 'Distribution / Vision', risk: 'MED', description: 'Parry ball into space to start a rapid break' }
    ]
  },
  {
    titleTemplate: 'HIGH PRESS UNDER PRESSURE',
    situation: "Backpass under heavy pressure from two sprinting opposition attackers near your goal line!",
    options: [
      { text: "First-Time Long Boot", attrKey: 'passing', attrName: 'Kicking / Passing', risk: 'LOW', description: 'Clear lines upfield into opposition territory' },
      { text: "Dummied Touch & Turn", attrKey: 'dribbling', attrName: 'Footwork / Dribbling', risk: 'HIGH', description: 'Side-step the presser inside your 6-yard box' },
      { text: "Thread Low Line-Breaker", attrKey: 'vision', attrName: 'Vision', risk: 'MED', description: 'Pass to the central midfielder dropping deep' }
    ]
  },
  {
    titleTemplate: 'PENALTY BOX SCRAMBLE',
    situation: "A deflected shot rebounds off the post and bounces loose in a crowded 6-yard box!",
    options: [
      { text: "Pounce & Cover Ball", attrKey: 'composure', attrName: 'Reflex / Composure', risk: 'LOW', description: 'Smother the loose ball with your body' },
      { text: "Quick Reaction Block", attrKey: 'tackling', attrName: 'Shot-Stopping', risk: 'MED', description: 'Throw out a leg to block the follow-up strike' },
      { text: "Voice Direction to Clear", attrKey: 'vision', attrName: 'Command / Vision', risk: 'HIGH', description: 'Bellow at center-back to boot it clear' }
    ]
  },
  {
    titleTemplate: 'COUNTER-ATTACK DISTRIBUTION',
    situation: "You catch a tame header and spot your winger sprinting into open grass!",
    options: [
      { text: "Precision Overhand Throw", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Hit the winger accurately in stride' },
      { text: "Booming Side-Volley Kick", attrKey: 'vision', attrName: 'Vision / Kicking', risk: 'MED', description: 'Launch a 60-yard ball directly into striker path' },
      { text: "Roll Ball to Center-Back", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Build calmly from the back line' }
    ]
  },
  {
    titleTemplate: 'LATE GAME DEFENSIVE COMMAND',
    situation: "Late match tension! Opponents flood 5 attackers into your penalty box for a long throw!",
    options: [
      { text: "Organize Zonal Back Line", attrKey: 'vision', attrName: 'Command / Vision', risk: 'LOW', description: 'Direct team positioning to block passing lanes' },
      { text: "Aggressive Aerial Claim", attrKey: 'composure', attrName: 'Handling / Composure', risk: 'MED', description: 'Claim the high ball to crush their pressure' },
      { text: "Tactical Game Management", attrKey: 'composure', attrName: 'Game Management', risk: 'LOW', description: 'Waste key seconds on goal kick to kill momentum' }
    ]
  }
];

const DEFENDER_SITUATIONS: SituationTemplate[] = [
  {
    titleTemplate: 'LAST-MAN RECOVERY RACE',
    situation: "The opposition striker breaks the offside trap and sprints toward your penalty box!",
    options: [
      { text: "Recovery Sprint & Slide Tackle", attrKey: 'pace', attrName: 'Pace', risk: 'HIGH', description: 'Go all-in on a last-ditch slide tackle to dispossess' },
      { text: "Jockey & Channel Away", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Force the striker out wide away from goal' },
      { text: "Standing Dispossession Challenge", attrKey: 'tackling', attrName: 'Tackling', risk: 'MED', description: 'Time a precise standing challenge to steal ball' }
    ]
  },
  {
    titleTemplate: 'DANGEROUS WIDE CROSS',
    situation: "An opposition winger whips a curling cross toward the back post for a surging runner!",
    options: [
      { text: "Dominant Power Header Clear", attrKey: 'tackling', attrName: 'Aerial / Tackling', risk: 'LOW', description: 'Header ball safely up and out of dangerous area' },
      { text: "Chest Down & Play Out", attrKey: 'composure', attrName: 'Composure', risk: 'MED', description: 'Control the ball and initiate build-up play' },
      { text: "Shield Ball Out for Goal Kick", attrKey: 'pace', attrName: 'Pace / Shielding', risk: 'LOW', description: 'Use your body to shield striker away' }
    ]
  },
  {
    titleTemplate: 'OVERLAPPING FLANK RUN',
    situation: "Your team breaks forward and open space appears down the flank for an overlap!",
    options: [
      { text: "Whipped Curved Cross", attrKey: 'passing', attrName: 'Crossing / Passing', risk: 'MED', description: 'Deliver a low trajectory cross into penalty box' },
      { text: "Cut Inside to Midfield", attrKey: 'dribbling', attrName: 'Dribbling', risk: 'MED', description: 'Drive inside to create numerical overload' },
      { text: "Recycle Possession Safely", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Retain structure and pass back to midfield' }
    ]
  },
  {
    titleTemplate: 'HIGH PRESS IN CORNER',
    situation: "Opponent double-teams you near your own corner flag with no obvious exit pass!",
    options: [
      { text: "Power Clearance Up Touchline", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Hoof the ball up the line into opposition half' },
      { text: "Silky Turn & Dribble Out", attrKey: 'dribbling', attrName: 'Dribbling', risk: 'HIGH', description: 'Spin past two pressers into central space' },
      { text: "Shield & Draw Foul", attrKey: 'composure', attrName: 'Composure', risk: 'MED', description: 'Shield ball with body to win defensive free kick' }
    ]
  },
  {
    titleTemplate: 'EDGE OF BOX SHOT BLOCK',
    situation: "An opposition midfielder prepares a heavy strike from 20 yards central!",
    options: [
      { text: "Brave Diving Block", attrKey: 'tackling', attrName: 'Tackling / Courage', risk: 'MED', description: 'Throw your body directly into the shooting lane' },
      { text: "Close Down Angle Rapidly", attrKey: 'pace', attrName: 'Pace', risk: 'LOW', description: 'Squeeze space before shot can be unleashed' },
      { text: "Step Up for Offside Trap", attrKey: 'vision', attrName: 'Tactical Vision', risk: 'HIGH', description: 'Step up to catch attacking runner offside' }
    ]
  },
  {
    titleTemplate: 'CORNER KICK HEADER CHANCE',
    situation: "Your team earns an attacking corner! You step into the box for the set piece.",
    options: [
      { text: "Power Header at Goal", attrKey: 'finishing', attrName: 'Heading / Finishing', risk: 'MED', description: 'Leap above defenders to head toward goal' },
      { text: "Flick-On to Far Post", attrKey: 'vision', attrName: 'Vision', risk: 'LOW', description: 'Guide header into path of incoming teammate' },
      { text: "Screen Goalkeeper Vision", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Obstruct keeper movement on delivery' }
    ]
  },
  {
    titleTemplate: 'LATE DEFENSIVE HOLD OUT',
    situation: "Opponents throwing desperate long balls into your box in stoppage time!",
    options: [
      { text: "No-Nonsense Clearance", attrKey: 'tackling', attrName: 'Defensive Tackling', risk: 'LOW', description: 'Boot ball clear into the stadium stands' },
      { text: "Calm Header to Keeper", attrKey: 'composure', attrName: 'Composure', risk: 'MED', description: 'Cushion header safely into keeper hands' },
      { text: "Kickstart Counter Pass", attrKey: 'passing', attrName: 'Passing', risk: 'HIGH', description: 'Break press with a long diagonal ball' }
    ]
  }
];

const MIDFIELDER_SITUATIONS: SituationTemplate[] = [
  {
    titleTemplate: 'MIDFIELD TRANSITION INTERCEPTION',
    situation: "Opposition attempts a central line-breaking pass through the midfield pivot!",
    options: [
      { text: "Anticipate & Intercept", attrKey: 'vision', attrName: 'Vision / Reading', risk: 'LOW', description: 'Step into passing lane and steal possession' },
      { text: "Crunching Central Tackle", attrKey: 'tackling', attrName: 'Tackling', risk: 'MED', description: 'Dispossess midfielder with a firm challenge' },
      { text: "Tactical Disruption Foul", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Break up dangerous break before it develops' }
    ]
  },
  {
    titleTemplate: 'PRESS RESISTANCE IN MIDFIELD',
    situation: "Two opposition midfielders swarm you as you receive the ball on the turn!",
    options: [
      { text: "Quick One-Touch Layoff", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Release pass immediately to open teammate' },
      { text: "Turn Away Under Pressure", attrKey: 'dribbling', attrName: 'Dribbling', risk: 'MED', description: 'Spin past press into open central space' },
      { text: "Burst Forward Through Gap", attrKey: 'pace', attrName: 'Pace', risk: 'HIGH', description: 'Burst out of midfield trap at full speed' }
    ]
  },
  {
    titleTemplate: 'SWITCH OF PLAY OPPORTUNITY',
    situation: "Pitch is congested on your flank, but winger is unmarked on opposite wing!",
    options: [
      { text: "50-Yard Diagonal Switch", attrKey: 'passing', attrName: 'Long Passing', risk: 'MED', description: 'Ping aerial ball to far winger in stride' },
      { text: "Thread Central Through Ball", attrKey: 'vision', attrName: 'Vision', risk: 'HIGH', description: 'Risk direct pass through heart of defense' },
      { text: "Maintain Possession Rhythm", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Short horizontal pass to keep momentum' }
    ]
  },
  {
    titleTemplate: '25-YARD LONG SHOT CHANCE',
    situation: "A cleared corner bounces invitingly to your feet 25 yards out central!",
    options: [
      { text: "Thunderbolt Power Strike", attrKey: 'finishing', attrName: 'Long Shots / Finishing', risk: 'MED', description: 'Unleash heavy strike toward goal' },
      { text: "Chipped Pass Over Top", attrKey: 'vision', attrName: 'Vision', risk: 'HIGH', description: 'Loft gentle chip over backline for striker' },
      { text: "Spread Out to Wing", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Set up winger for crossing opportunity' }
    ]
  },
  {
    titleTemplate: 'BOX-TO-BOX RECOVERY RUN',
    situation: "Opposition counter-attack catches your defense outnumbered 3-on-2!",
    options: [
      { text: "Track Back & Slide Block", attrKey: 'pace', attrName: 'Pace / Stamina', risk: 'MED', description: 'Sprint back to make a crucial defensive block' },
      { text: "Tactical Positioning Lock", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Shield central passing lane calmly' },
      { text: "Break Up Play with Tackle", attrKey: 'tackling', attrName: 'Tackling', risk: 'HIGH', description: 'Attempt bold dispossession challenge' }
    ]
  },
  {
    titleTemplate: 'TEMPO CONTROL DECISION',
    situation: "Game is chaotic with end-to-end frantic transitions and high fatigue!",
    options: [
      { text: "Calm Game Down & Circulate", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Dictate slow tempo with short passes' },
      { text: "Quick Vertical Through Pass", attrKey: 'vision', attrName: 'Vision', risk: 'HIGH', description: 'Capitalize on stretched opposition' },
      { text: "Dribble Into Attacking Third", attrKey: 'dribbling', attrName: 'Dribbling', risk: 'MED', description: 'Carry ball forward to draw defenders' }
    ]
  },
  {
    titleTemplate: 'EDGE OF BOX SECOND BALL',
    situation: "Loose ball drops on the edge of the box after aerial duel!",
    options: [
      { text: "First-Time Volley Strike", attrKey: 'finishing', attrName: 'Finishing', risk: 'HIGH', description: 'Strike volley cleanly through crowd' },
      { text: "Head / Pass to Winger", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Recycle possession to flank' },
      { text: "Shield & Draw Foul", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Win dangerous free kick outside box' }
    ]
  }
];

const ATTACKING_MID_WING_SITUATIONS: SituationTemplate[] = [
  {
    titleTemplate: '1v1 WIDE ISOLATION',
    situation: "You receive the ball wide on the flank with the fullback backing off!",
    options: [
      { text: "Explosive Dribble Past Fullback", attrKey: 'dribbling', attrName: 'Dribbling', risk: 'HIGH', description: 'Step-over and knock ball past defender' },
      { text: "Early Whipped Cross Into Box", attrKey: 'passing', attrName: 'Crossing / Passing', risk: 'LOW', description: 'Deliver curling ball to target striker' },
      { text: "Cut Inside for Curved Shot", attrKey: 'finishing', attrName: 'Finishing', risk: 'MED', description: 'Bend effort toward top far corner' }
    ]
  },
  {
    titleTemplate: 'POCKET OF SPACE BETWEEN LINES',
    situation: "You find open space right in the hole between opposition midfield and defense!",
    options: [
      { text: "Killer Line-Breaking Through Ball", attrKey: 'vision', attrName: 'Vision', risk: 'HIGH', description: 'Slip striker through on goal' },
      { text: "Turn & Shoot From Distance", attrKey: 'finishing', attrName: 'Finishing', risk: 'MED', description: 'Take quick shot before closed down' },
      { text: "One-Two Wall Pass Combination", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Quick give-and-go into penalty area' }
    ]
  },
  {
    titleTemplate: '3v2 COUNTER-ATTACK BREAKOUT',
    situation: "Your team launches a lightning 3-on-2 counter-attack with defenders backpedaling!",
    options: [
      { text: "Thread Pass to Free Runner", attrKey: 'vision', attrName: 'Vision', risk: 'LOW', description: 'Pick out overlapping runner' },
      { text: "Drive Speed & Shoot", attrKey: 'pace', attrName: 'Pace', risk: 'MED', description: 'Sprint past defender and fire shot' },
      { text: "Feint Pass & Cut Inside", attrKey: 'dribbling', attrName: 'Dribbling', risk: 'HIGH', description: 'Fake pass to defender then shoot' }
    ]
  },
  {
    titleTemplate: 'BYLINE CUTBACK CHANCE',
    situation: "You beat your man and reach the goal line inside the penalty box!",
    options: [
      { text: "Low Hard Cutback Pass", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Slide ball to trailing midfielder' },
      { text: "Tight-Angle Strike at Near Post", attrKey: 'finishing', attrName: 'Finishing', risk: 'HIGH', description: 'Blaze shot past keeper near post' },
      { text: "Lofted Chip to Back Post", attrKey: 'vision', attrName: 'Vision', risk: 'MED', description: 'Float ball over keeper for far-post header' }
    ]
  },
  {
    titleTemplate: 'HIGH ATTACKING PRESS INTERCEPTION',
    situation: "Opposition defender hesitates with the ball 25 yards from their goal!",
    options: [
      { text: "Sprint Press & Rob Ball", attrKey: 'pace', attrName: 'Pace', risk: 'MED', description: 'Pounce on defender mistake' },
      { text: "Aggressive Tackling Challenge", attrKey: 'tackling', attrName: 'Tackling', risk: 'HIGH', description: 'Dispossess defender directly' },
      { text: "Block Passing Angle Calmly", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Force rushed kick out of bounds' }
    ]
  },
  {
    titleTemplate: 'DEAD BALL FREE KICK MOMENT',
    situation: "A dangerous free kick opportunity 22 yards out in central position!",
    options: [
      { text: "Curled Dip Over Wall Shot", attrKey: 'finishing', attrName: 'Free Kick / Finishing', risk: 'MED', description: 'Bend ball over wall into top corner' },
      { text: "Whipped Delivery to Back Post", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Target tall defenders for header' },
      { text: "Clever Short Layoff Pass", attrKey: 'vision', attrName: 'Vision', risk: 'LOW', description: 'Roll ball to teammate for power drive' }
    ]
  },
  {
    titleTemplate: 'TRICKY TOUCHLINE SKILL',
    situation: "Surrounded by two defenders near the touchline!",
    options: [
      { text: "Audacious Skill Move Out", attrKey: 'dribbling', attrName: 'Dribbling', risk: 'HIGH', description: 'Nutmeg defender to burst clear' },
      { text: "Shield & Backpass Out", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Safely recycle play to midfield' },
      { text: "Sprint Acceleration Touch", attrKey: 'pace', attrName: 'Pace', risk: 'MED', description: 'Knock ball into space and outrun defender' }
    ]
  }
];

const STRIKER_SITUATIONS: SituationTemplate[] = [
  {
    titleTemplate: 'THROUGH BALL BREAKAWAY',
    situation: "You break the offside trap and sprint clear 1-on-1 with the keeper!",
    options: [
      { text: "Clinical Power Strike", attrKey: 'finishing', attrName: 'Finishing', risk: 'MED', description: 'Blaze shot high into roof of net' },
      { text: "Rounded Dribble Past Keeper", attrKey: 'dribbling', attrName: 'Dribbling', risk: 'HIGH', description: 'Round the goalkeeper for an empty net finish' },
      { text: "Delicate Finesse Placement", attrKey: 'composure', attrName: 'Composure / Placement', risk: 'LOW', description: 'Place ball low into far corner' }
    ]
  },
  {
    titleTemplate: '6-YARD BOX CROSS',
    situation: "A brilliant whipped cross lands right in the 6-yard box!",
    options: [
      { text: "Power Diving Header", attrKey: 'finishing', attrName: 'Heading / Finishing', risk: 'MED', description: 'Throw yourself at the ball to head past keeper' },
      { text: "Acrobatic First-Time Volley", attrKey: 'finishing', attrName: 'Finishing', risk: 'HIGH', description: 'Strike volley on the fly into net' },
      { text: "Cushion Header Layoff", attrKey: 'passing', attrName: 'Passing / Vision', risk: 'LOW', description: 'Set up incoming midfielder for open tap-in' }
    ]
  },
  {
    titleTemplate: 'BACK-TO-GOAL HOLD UP PLAY',
    situation: "Strong center-back tight on your back as you receive a floor pass!",
    options: [
      { text: "Power Turn & Shoot", attrKey: 'finishing', attrName: 'Finishing', risk: 'HIGH', description: 'Roll defender and shoot on turn' },
      { text: "Cushion Wall Pass Layoff", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Lay ball off to attacking midfielder' },
      { text: "Shield & Draw Penalty / Foul", attrKey: 'composure', attrName: 'Composure', risk: 'MED', description: 'Use body strength to draw tackle foul' }
    ]
  },
  {
    titleTemplate: 'REBOUND SCRAMBLE IN BOX',
    situation: "The keeper parries a heavy shot into a congested 6-yard box!",
    options: [
      { text: "Instinctive Scramble Toe-Poke", attrKey: 'finishing', attrName: 'Finishing', risk: 'LOW', description: 'Poke loose ball over line' },
      { text: "Burst Pace Ahead of Defender", attrKey: 'pace', attrName: 'Pace', risk: 'MED', description: 'Pounce on ball a split second first' },
      { text: "Composed Sidestep & Tap-In", attrKey: 'composure', attrName: 'Composure', risk: 'HIGH', description: 'Fake shot to committed keeper then tap in' }
    ]
  },
  {
    titleTemplate: 'FAST BREAKOUT CHANNEL RUN',
    situation: "Sprinting through the channel on a fast counter-attack!",
    options: [
      { text: "Curled Strike Far Corner", attrKey: 'finishing', attrName: 'Finishing', risk: 'MED', description: 'Bend shot into far side netting' },
      { text: "Cross to Unmarked Teammate", attrKey: 'passing', attrName: 'Passing', risk: 'LOW', description: 'Square ball for unselfish goal' },
      { text: "Sprint Drive into Penalty Area", attrKey: 'pace', attrName: 'Pace', risk: 'HIGH', description: 'Outpace center-back to get closer to goal' }
    ]
  },
  {
    titleTemplate: 'HIGH BALL PENALTY SCRAMBLE',
    situation: "Ball bobbles high inside the penalty area in a crowded box!",
    options: [
      { text: "Overhead Bicycle Kick", attrKey: 'finishing', attrName: 'Finishing', risk: 'HIGH', description: 'Audacious acrobatic effort for glory' },
      { text: "Controlled Volley Strike", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Control on chest and take clean shot' },
      { text: "Nod Down to Teammate", attrKey: 'vision', attrName: 'Vision', risk: 'LOW', description: 'Header down for trailing midfielder' }
    ]
  },
  {
    titleTemplate: 'PRESSING CENTER BACK',
    situation: "Opposition center-back receives a weak backpass under pressure!",
    options: [
      { text: "Aggressive Sliding Tackle", attrKey: 'tackling', attrName: 'Tackling', risk: 'HIGH', description: 'Rob ball in front of penalty box' },
      { text: "Sprint Press & Block Kick", attrKey: 'pace', attrName: 'Pace', risk: 'MED', description: 'Block clearance attempt' },
      { text: "Force Error into Touch", attrKey: 'composure', attrName: 'Composure', risk: 'LOW', description: 'Force rushed kick out of bounds' }
    ]
  }
];

export function generateMatchDecisions(position: string = 'ST'): Record<number, KeyDecision> {
  const group = getPositionGroup(position);
  let pool: SituationTemplate[];

  switch (group) {
    case 'GK':
      pool = GK_SITUATIONS;
      break;
    case 'DEFENDER':
      pool = DEFENDER_SITUATIONS;
      break;
    case 'MIDFIELDER':
      pool = MIDFIELDER_SITUATIONS;
      break;
    case 'ATTACKING_MID_WING':
      pool = ATTACKING_MID_WING_SITUATIONS;
      break;
    case 'STRIKER':
    default:
      pool = STRIKER_SITUATIONS;
      break;
  }

  // Shuffle pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  // Pick 4 situations
  const chosen = shuffled.slice(0, 4);

  // Pick 4 minute windows
  const min1 = Math.floor(Math.random() * 8) + 15; // 15-22
  const min2 = Math.floor(Math.random() * 8) + 34; // 34-41
  const min3 = Math.floor(Math.random() * 8) + 58; // 58-65
  const min4 = Math.floor(Math.random() * 8) + 78; // 78-85

  const minutes = [min1, min2, min3, min4];
  const decisions: Record<number, KeyDecision> = {};

  chosen.forEach((tpl, idx) => {
    const min = minutes[idx];
    decisions[min] = {
      minute: min,
      title: `${min}' · ${tpl.titleTemplate}`,
      situation: tpl.situation,
      options: tpl.options
    };
  });

  return decisions;
}

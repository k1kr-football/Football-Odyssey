export type MatchEventCategory = 
  | 'goal_user' 
  | 'goal_opp' 
  | 'assist' 
  | 'key_pass' 
  | 'tackle' 
  | 'skill' 
  | 'miss' 
  | 'chance_opp' 
  | 'chance_user' 
  | 'foul' 
  | 'shot'
  | 'save'
  | 'distribution'
  | 'claim_cross'
  | 'one_on_one_save'
  | 'clean_sheet';

const commentaryPools: Record<MatchEventCategory, string[]> = {
  goal_user: [
    `GOAL! Spectacular execution by {player}! {detail} beats the keeper clean!`,
    `WHAT A GOAL! {player} finds the back of the net with an unstoppable {detail}!`,
    `It's in! {player} silences the critics with a clinical finish!`,
    `GOAL! Brilliant individual brilliance from {player}!`,
    `He scores! {player} makes no mistake and blasts it home!`,
    `Pure class! {player} slots it perfectly into the corner.`
  ],
  goal_opp: [
    `GOAL! {team} scores with a clinical finish into the bottom corner!`,
    `They've conceded! {team} breaks through and smashes it past the keeper.`,
    `GOAL for {team}! The defense was caught napping there.`,
    `Heartbreak! {team} takes their chance and finds the net.`,
    `A defensive lapse allows {team} to score an easy one.`,
    `It's a goal for {team}. The keeper had absolutely no chance.`
  ],
  chance_user: [
    `GOAL! {team} breaks the deadlock with a brilliant team goal!`,
    `Fantastic play by {team} leading to a well-deserved goal!`,
    `They've scored! {team} finishes off a beautiful sequence of passes.`,
    `GOAL! {team} catches them on the counter-attack!`,
    `An unstoppable header! {team} asserts their dominance.`,
    `Clinical! {team} takes advantage of a defensive error.`
  ],
  assist: [
    `ASSIST! Magnificent pass by {player}! Teammate taps it home!`,
    `What vision from {player}! He sets it up on a plate for his teammate.`,
    `Brilliant unselfish play! {player} gets the assist!`,
    `Threaded the needle! {player} registers a crucial assist.`,
    `Perfect delivery from {player}! That's an assist for the history books.`,
    `A sublime cross by {player} leads directly to a goal!`
  ],
  key_pass: [
    `KEY PASS! {player} delivers a sharp pass creating a dangerous moment!`,
    `Incredible vision! {player} splits the defense wide open.`,
    `Great awareness from {player} to pick out that pass.`,
    `{player} dictates the tempo with a perfectly weighted ball.`,
    `A lovely through ball by {player}, putting the defense on their heels.`,
    `{player} unlocks the defense with a clever flick!`
  ],
  tackle: [
    `GREAT TACKLE! {player} dispossesses the opponent clean and ignites a break!`,
    `Crucial intervention! {player} makes a massive tackle at the right moment.`,
    `A crunching challenge by {player}! He wins the ball brilliantly.`,
    `{player} reads the play perfectly and steps in for the interception.`,
    `Textbook defending! {player} leaves no breathing room.`,
    `Not today! {player} shuts down the attack with a firm challenge.`
  ],
  skill: [
    `BRILLIANT SKILL! {player} executes {detail} to perfection!`,
    `Oh, that's cheeky! {player} beats his man with {detail}.`,
    `Silky smooth! {player} leaves the defender in the dust.`,
    `Magic feet from {player}! The crowd loves {detail}!`,
    `Absolute tekkers! {player} pulls off an audacious move.`,
    `{player} shows great close control and dances past the opposition.`
  ],
  miss: [
    `MISSED CHANCE: {player} attempted {detail} but couldn't pull it off.`,
    `So close! {player} tries {detail} but the keeper is equal to it.`,
    `A wasted opportunity as {player}'s effort goes wide.`,
    `{player} looks disappointed. That {detail} didn't go as planned.`,
    `Saved! The keeper denies {player} after a bold attempt.`,
    `Over the bar! {player} leaned back a bit too much on that one.`
  ],
  chance_opp: [
    `CHANCE! {team} hits a powerful shot just wide of the post!`,
    `Danger! {team} tests the goalkeeper with a stinging effort.`,
    `Let off the hook! {team} almost finds a breakthrough.`,
    `The post is rattled! {team} comes agonizingly close.`,
    `Scramble in the box! {team} applies massive pressure.`,
    `A brilliant save keeps {team} from taking the lead!`
  ],
  foul: [
    `FOUL! {player} goes in too hard and the referee blows the whistle.`,
    `A cynical foul by {player} to stop the counter attack.`,
    `Clumsy challenge from {player}, that's a clear free kick.`,
    `The referee didn't like that tackle by {player}. Foul given.`,
    `{player} catches the opponent late. Deserved foul.`,
    `Reckless from {player}! That could have been a booking.`
  ],
  shot: [
    `SHOT! {player} unleashes a strike from distance!`,
    `{player} decides to have a go!`,
    `A stinging shot from {player} tests the keeper.`,
    `{player} creates space and fires a shot!`,
    `Ambitious effort by {player}!`,
    `{player} pulls the trigger!`
  ],
  save: [
    `STUNNING SAVE! {player} dives full-length to tip the shot past the post!`,
    `DENIED! {player} displays lightning reflexes to palm the ball away!`,
    `Incredible shot-stopping! {player} stands tall and pushes it clear!`,
    `WHAT A SAVE by {player}! Pure instinct keeping the ball out of the net!`,
    `Crucial intervention! {player} reacts instantly to deny a certain goal!`
  ],
  distribution: [
    `GREAT DISTRIBUTION! {player} spots the winger and launches a pinpoint 60-yard throw!`,
    `DISTRIBUTION MASTERCLASS! {player} acts as an extra outfield player with a line-breaking pass!`,
    `QUICK THINKING! {player} catches the ball and instantly launches a booming kick!`,
    `Sublime footwork by {player}, coolly spreading play to the flank under pressure.`
  ],
  claim_cross: [
    `HIGH CLAIM! {player} rises above everyone to pluck the cross out of the air!`,
    `COMMANDING PRESENCE! {player} comes off their line and punches the corner clear!`,
    `TOTAL AUTHORITY! {player} snatches the dangerous cross cleanly.`,
    `DOMINANT BOX CONTROL! {player} claims the high ball with ease to calm down defense.`
  ],
  one_on_one_save: [
    `HEROIC 1-ON-1 SAVE! {player} charges out and smothers the striker's effort!`,
    `NOT TODAY! {player} spreads wide and makes a massive block in the 1-on-1 duel!`,
    `SENSATIONAL BRAVERY! {player} dives at the attacker's feet to strip the ball cleanly!`,
    `BATTLE OF WITS WON! {player} makes a stunning 1-on-1 save keeping the match level!`
  ],
  clean_sheet: [
    `WALL OF GRANITE! {player} commands the penalty area to earn a spotless clean sheet!`,
    `UNBEATABLE TODAY! {player} leads the backline to secure a clean sheet victory!`
  ]
};

const gkSkillLines = [
  `CHEEKY FOOTWORK! {player} calmly sidesteps the pressing striker inside their own box!`,
  `COMPOSED KEEPER! {player} pulls off a Cruyff turn on the goal line under heavy pressure!`,
  `QUICK REFLEXES! {player} dummies the striker and clears cleanly!`
];

const usedHistory: Record<string, string[]> = {};

export function getFlavorText(
  category: MatchEventCategory,
  playerName: string = '',
  teamName: string = '',
  detail: string = '',
  position?: string
): string {
  const isGK = position && position.toUpperCase() === 'GK';

  // If GK and category is 'skill', use goalkeeper footwork lines
  if (isGK && category === 'skill') {
    const line = gkSkillLines[Math.floor(Math.random() * gkSkillLines.length)];
    return line.replace(/\{player\}/g, playerName).replace(/\{detail\}/g, detail);
  }

  const pool = commentaryPools[category];
  if (!pool || pool.length === 0) return '';

  if (!usedHistory[category]) {
    usedHistory[category] = [];
  }

  // Filter out recently used lines
  let available = pool.filter(line => !usedHistory[category].includes(line));
  
  // If we've exhausted all lines, reset history for this category
  if (available.length === 0) {
    usedHistory[category] = [];
    available = pool;
  }

  // Pick a random line
  const randomIndex = Math.floor(Math.random() * available.length);
  const selectedLine = available[randomIndex];

  // Update history
  usedHistory[category].push(selectedLine);
  if (usedHistory[category].length > Math.floor(pool.length / 2)) {
    usedHistory[category].shift();
  }

  // Format the line
  return selectedLine
    .replace(/\{player\}/g, playerName)
    .replace(/\{team\}/g, teamName)
    .replace(/\{detail\}/g, detail);
}

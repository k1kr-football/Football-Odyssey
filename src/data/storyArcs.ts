import { StoryArc, BackstoryType } from '../types';

export const STORY_ARCS: Record<BackstoryType, Omit<StoryArc, 'progress' | 'currentAct' | 'currentBeat' | 'resolution'>> = {
  ACADEMY_GRADUATE: {
    drivingQuestion: "Can they handle the weight of the badge?",
    beats: [
      { act: 1, beat: 1, name: "The Debut", description: "Your first appearance for the senior team.", triggered: false, narrative: "You've dreamed of this moment since you were a kid." },
      { act: 2, beat: 1, name: "The Mistake", description: "A high-profile error.", triggered: false, narrative: "The media is turning on you. You need to bounce back." },
      { act: 3, beat: 1, name: "The Derby Hero", description: "Winning a derby match.", triggered: false, narrative: "You're one of them. A true club legend in the making." }
    ]
  },
  FALLEN_PRODIGY: {
    drivingQuestion: "Can they rediscover their magic?",
    beats: [
      { act: 1, beat: 1, name: "The New Start", description: "First match for your new club.", triggered: false, narrative: "This is your chance to prove the doubters wrong." },
      { act: 2, beat: 1, name: "The Reunion", description: "Facing your former club.", triggered: false, narrative: "They let you go. Show them what they're missing." },
      { act: 3, beat: 1, name: "The Resurgence", description: "Winning a major trophy.", triggered: false, narrative: "You're back on top of the world." }
    ]
  },
  LATE_BLOOMER: {
    drivingQuestion: "Is it too late to make a mark?",
    beats: [
      { act: 1, beat: 1, name: "The Big Move", description: "Signing for a top-tier club.", triggered: false, narrative: "You've worked hard for this. Now don't mess it up." },
      { act: 2, beat: 1, name: "The Call-Up", description: "First international cap.", triggered: false, narrative: "You're representing your country. Make them proud." },
      { act: 3, beat: 1, name: "The Golden Boot", description: "Winning the Golden Boot.", triggered: false, narrative: "You're the best striker in the league." }
    ]
  },
  STREET_PRODIGY: {
    drivingQuestion: "Can the flair player adapt to the tactical game?",
    beats: [
      { act: 1, beat: 1, name: "The Showboat", description: "A dazzling piece of skill.", triggered: false, narrative: "The fans love it, but the manager is furious." },
      { act: 2, beat: 1, name: "The Sacrifice", description: "A tactical masterclass.", triggered: false, narrative: "You've learned to play for the team." },
      { act: 3, beat: 1, name: "The Maestro", description: "Pulling the strings in a final.", triggered: false, narrative: "You're the complete package now." }
    ]
  },
  EXILE: {
    drivingQuestion: "Can they find a home?",
    beats: [
      { act: 1, beat: 1, name: "The Outsider", description: "First match in a new country.", triggered: false, narrative: "You don't speak the language, but football is universal." },
      { act: 2, beat: 1, name: "The Cult Hero", description: "Winning over the local fans.", triggered: false, narrative: "They chant your name in the stands." },
      { act: 3, beat: 1, name: "The Captain", description: "Taking the armband.", triggered: false, narrative: "You're the leader now. Lead them to glory." }
    ]
  },
  FROM_SCRATCH: {
    drivingQuestion: "Can they make it from the bottom?",
    beats: [
      { act: 1, beat: 1, name: "The Struggle", description: "A tough start.", triggered: false, narrative: "This is going to be harder than you thought." },
      { act: 2, beat: 1, name: "The Breakthrough", description: "A match-winning performance.", triggered: false, narrative: "You're starting to believe you can do this." },
      { act: 3, beat: 1, name: "The Legend", description: "Winning the league.", triggered: false, narrative: "You've made history." }
    ]
  },
  NON_LEAGUE: {
    drivingQuestion: "Can the part-timer make it in the big leagues?",
    beats: [
      { act: 1, beat: 1, name: "The Big Break", description: "First professional contract signed.", triggered: false, narrative: "You left your day job behind. This is the real deal now." },
      { act: 2, beat: 1, name: "Pace of the Game", description: "Adapting to the professional level.", triggered: false, narrative: "The game moves so much faster here. You have to adapt quickly." },
      { act: 3, beat: 1, name: "Cult Hero", description: "Winning over the fans.", triggered: false, narrative: "The fans love a working-class hero. They sing your name every week." }
    ]
  },
  ACADEMY_PRODIGY: {
    drivingQuestion: "Can the protégé surpass the shadow of their mentor?",
    beats: [
      { act: 1, beat: 1, name: "Inherited Expectations", description: "First match under the mentor's watch.", triggered: false, narrative: "The crowd expects the same flair and magic your mentor produced." },
      { act: 2, beat: 1, name: "Breakthrough Statement", description: "A decisive match-winning contribution.", triggered: false, narrative: "You proved you're not just a name; you belong on this stage." },
      { act: 3, beat: 1, name: "Dynasty Unlocked", description: "Lifting major silverware.", triggered: false, narrative: "You've written your own chapter in club history." }
    ]
  },
  WONDERKID: {
    drivingQuestion: "Can you survive the crushing weight of generational hype?",
    beats: [
      { act: 1, beat: 1, name: "The Next Big Thing", description: "Your highly anticipated debut.", triggered: false, narrative: "Every camera in the stadium was pointed at you. The pressure is already immense." },
      { act: 2, beat: 1, name: "First True Test", description: "Facing adversity against elite opposition.", triggered: false, narrative: "They tried to kick you off the park, but you showed you have the grit to match the talent." },
      { act: 3, beat: 1, name: "The Crown Attained", description: "Delivering on the impossible promise.", triggered: false, narrative: "The hype was real. You have arrived at the summit of world football." }
    ]
  },
  NEPOTISM_CASE: {
    drivingQuestion: "Can you become your own name, not just a shadow of someone else's?",
    beats: [
      { act: 1, beat: 1, name: "In the Shadow", description: "First televised appearance under intense scrutiny.", triggered: false, narrative: "Every mistake is met with murmurs of nepotism in the stands." },
      { act: 2, beat: 1, name: "The Statement Goal", description: "Scoring a decisive match-winner.", triggered: false, narrative: "You pointed to your own name on the shirt. The doubters went quiet." },
      { act: 3, beat: 1, name: "Your Own Identity", description: "Winning a major honor on merit.", triggered: false, narrative: "Nobody talks about your family name anymore. They talk about yours." }
    ]
  },
  THE_REFUGEE: {
    drivingQuestion: "Can this game finally give you the home that circumstance took away?",
    beats: [
      { act: 1, beat: 1, name: "Sanctuary Pitch", description: "First professional match in your host country.", triggered: false, narrative: "After everything you've survived, stepping onto this pitch feels like a miracle." },
      { act: 2, beat: 1, name: "International Calling", description: "Reaching a major international tournament choice.", triggered: false, narrative: "Representing your people on the world stage brings tears to your eyes." },
      { act: 3, beat: 1, name: "A Place of Belonging", description: "Securing a long-term contract and trophy.", triggered: false, narrative: "You didn't just survive—you conquered. Football is your permanent home." }
    ]
  },
  LATE_REPLACEMENT: {
    drivingQuestion: "What happens when the accident becomes the opportunity?",
    beats: [
      { act: 1, beat: 1, name: "The Unplanned Debut", description: "Thrust into match action after an unexpected injury.", triggered: false, narrative: "Nobody planned for you to play, but you grabbed the opportunity with both hands." },
      { act: 2, beat: 1, name: "Holding the Spot", description: "Keeping your place in the starting XI over returning seniors.", triggered: false, narrative: "The manager had no choice but to keep picking you based on performance." },
      { act: 3, beat: 1, name: "Undisputed Pillar", description: "Becoming the core star of the first team.", triggered: false, narrative: "From an emergency bench-warmer to the first name on the team sheet." }
    ]
  },
  SECOND_SPORT_CONVERT: {
    drivingQuestion: "Can raw talent from another world actually translate to this one?",
    beats: [
      { act: 1, beat: 1, name: "Cross-Code Shock", description: "First competitive match displaying raw athleticism.", triggered: false, narrative: "Your physical speed and power shocked the defenders, even if your positioning was raw." },
      { act: 2, beat: 1, name: "Tactical Awakening", description: "Executing a complex tactical role flawlesly.", triggered: false, narrative: "The hours spent studying match tape paid off—you're reading the game like a veteran." },
      { act: 3, beat: 1, name: "The Complete Athlete", description: "Dominating at the highest level as a refined footballer.", triggered: false, narrative: "You proved that elite multi-sport drive creates unstoppable world-class footballers." }
    ]
  }
};

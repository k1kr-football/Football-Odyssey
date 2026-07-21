/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GlossaryEntry {
  term: string;
  category: 'Performance' | 'Relationships' | 'Financial' | 'Career';
  definition: string;
  raisesLoweres: string;
  unlocksGates: string;
  seeAlso: string[];
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: "Manager Trust",
    category: "Relationships",
    definition: "Reflects how much your manager believes in your tactical and professional abilities.",
    raisesLoweres: "Raised by strong match performances, meeting training instructions, and showing humility; lowered by poor match ratings, skipped training sessions, or public outbursts.",
    unlocksGates: "Higher trust guarantees first-team starting spots and prevents you from being benched, dropped, or sent on loan.",
    seeAlso: ["Match Sharpness", "Tactical Familiarity"]
  },
  {
    term: "Match Sharpness",
    category: "Performance",
    definition: "Represents your match readiness, physical conditioning, and tactical focus.",
    raisesLoweres: "Increased by playing competitive matches and completing intensive training drills; decays gradually when sidelined, rested, or benched.",
    unlocksGates: "High sharpness dramatically boosts the success rates of your attributes during critical match decision points.",
    seeAlso: ["Fatigue", "Manager Trust"]
  },
  {
    term: "Fatigue",
    category: "Performance",
    definition: "Measures physical and mental exhaustion accumulated over the season.",
    raisesLoweres: "Rises when playing full 90-minute fixtures and running high-workrate training sessions; reduced by resting or receiving physical therapy in the Rehab clinic.",
    unlocksGates: "High fatigue (above 75%) increases injury risk and imposes physical penalties on all decision-point attribute checks.",
    seeAlso: ["Match Sharpness"]
  },
  {
    term: "Squad Chemistry",
    category: "Relationships",
    definition: "Measures your synchronization, synergy, and connection with teammates on and off the pitch.",
    raisesLoweres: "Built through assists, unselfish match plays, positive social choices, and group leisure; damaged by selfish match decisions, ego-driven press comments, or demanding transfers.",
    unlocksGates: "High chemistry triggers stronger on-pitch passing options, boosts teammate support in key highlights, and unlocks locker-room leadership.",
    seeAlso: ["Peer Respect"]
  },
  {
    term: "Peer Respect",
    category: "Relationships",
    definition: "Indicates how highly your fellow squad members value your work ethic and character.",
    raisesLoweres: "Earned by working hard in training, putting team goals above personal glory, and supporting teammates during events; lowered by controversial behavior or slacking off.",
    unlocksGates: "High respect prevents dressing room unrest, improves team-talk effects, and makes you a candidate for the captain's armband.",
    seeAlso: ["Squad Chemistry"]
  },
  {
    term: "World Reputation",
    category: "Career",
    definition: "Measures your global stature, popularity, and commercial appeal as a professional athlete.",
    raisesLoweres: "Grown by scoring match-winning goals, signing with higher-tier agents, giving engaging interviews, and maintaining a massive fan following; decays with prolonged poor form.",
    unlocksGates: "Unlocks tier-locked commercial sponsorships, high-value brand deals, elite lifestyle assets, and interest from world-class clubs.",
    seeAlso: ["Agent Tier", "Cancel Risk"]
  },
  {
    term: "Release Clause Trigger",
    category: "Financial",
    definition: "A contractually-set transfer fee that allows any external club to instantly buy out your current contract.",
    raisesLoweres: "Determined during agent negotiations when signing new contracts; can be lowered to force an exit or raised to demonstrate loyalty.",
    unlocksGates: "Protects you from being blocked by your current club when an elite side wants to buy you, bypassing tedious negotiation stages.",
    seeAlso: ["Agent Tier", "World Reputation"]
  },
  {
    term: "Starting Trust",
    category: "Relationships",
    definition: "The base manager confidence rating you receive when arriving at a brand-new club.",
    raisesLoweres: "Influenced by your OVR, current reputation tier, and your agent's negotiation power.",
    unlocksGates: "A high starting trust gives you a major head start in breaking into the starting XI immediately upon transfer.",
    seeAlso: ["Manager Trust"]
  },
  {
    term: "Cancel Risk",
    category: "Career",
    definition: "The danger of having active commercial sponsorships or brand deals terminated prematurely.",
    raisesLoweres: "Increased by public controversies, fine-inducing disciplinary issues, poor match performances, or dropping in World Reputation.",
    unlocksGates: "High risk leads to immediate contract terminations, loss of weekly commercial income, and penalties to future endorsement offers.",
    seeAlso: ["World Reputation"]
  },
  {
    term: "Form Coefficient",
    category: "Performance",
    definition: "A dynamic modifier based on your performance quality and ratings over your last 5 match appearances.",
    raisesLoweres: "Rises with consecutive 7.5+ match ratings; plummets with lackluster ratings (under 6.0) or benched outings.",
    unlocksGates: "A high coefficient provides bonus multipliers on attribute growth during weekly training and accelerates scouting attention.",
    seeAlso: ["Scouting Activity", "Match Sharpness"]
  },
  {
    term: "Scouting Activity",
    category: "Career",
    definition: "The depth of interest and frequency of scouts sent by external clubs to watch you play.",
    raisesLoweres: "Accumulates slowly when you play first-team matches, especially when your Form Coefficient is high; decays if benched or sidelined by injury.",
    unlocksGates: "Must be built up before concrete transfer rumors are sparked on social media or formal transfer offers arrive in your Inbox.",
    seeAlso: ["Form Coefficient", "Agent Tier"]
  },
  {
    term: "Agent Tier",
    category: "Career",
    definition: "The professional pedigree and circle of influence of your active sports representative.",
    raisesLoweres: "Can be upgraded by paying higher agency retainer percentages or hitting world reputation milestones.",
    unlocksGates: "Caps the maximum level of clubs you can directly pitch a transfer to, and unlocks higher-wage contract templates.",
    seeAlso: ["World Reputation", "Release Clause Trigger"]
  },
  {
    term: "Tactical Familiarity",
    category: "Performance",
    definition: "Your deep understanding of the team's active tactical blueprint, shape, and instructions.",
    raisesLoweres: "Boosted by tactical drills in weekly training and playing in your natural position; reduced by major tactical shifts or playing out of position.",
    unlocksGates: "High familiarity reduces positioning errors during matches, resulting in better automatic ratings and manager satisfaction.",
    seeAlso: ["Manager Trust"]
  },
  {
    term: "Media Exposure",
    category: "Career",
    definition: "Your visibility, presence, and narrative weight in news headlines and television.",
    raisesLoweres: "Increased by attending press conferences, giving bold media remarks, or pursuing iconic lifestyle investments.",
    unlocksGates: "A high level of exposure accelerates fan growth and sponsorships, but increases the fallout and cancel risk of any controversy.",
    seeAlso: ["World Reputation", "Cancel Risk"]
  },
  {
    term: "Morale",
    category: "Performance",
    definition: "Your mental state, confidence, and competitive drive.",
    raisesLoweres: "Raised by winning matches, playing well, signing lucrative sponsorships, or choosing positive lifestyle options. Lowered by benched streaks, transfer saga stress, or public outbursts.",
    unlocksGates: "High morale increases training attribute gains and unlocks positive response trees during critical event highlights.",
    seeAlso: ["Match Sharpness", "Tactical Familiarity"]
  },
  {
    term: "Tactical Fit",
    category: "Performance",
    definition: "How well your playstyle matches your current club's tactical system.",
    raisesLoweres: "Calculated based on your role specialization compared to the manager's active system design.",
    unlocksGates: "High fit guarantees a starting role; awkward fit creates penalties to starting trust and rating checks.",
    seeAlso: ["Tactical Familiarity", "Manager Trust"]
  },
  {
    term: "Agent Reputation",
    category: "Career",
    definition: "The professional prestige of your active sports representative.",
    raisesLoweres: "Upgraded by investing career earnings to hire elite sports lawyers, PR teams, and marketing specialists.",
    unlocksGates: "Unlocks elite contract options, high-value brand sponsorships, and frequent scouting invitations from top-tier teams.",
    seeAlso: ["Agent Tier", "World Reputation"]
  },
  {
    term: "Scout Report",
    category: "Performance",
    definition: "Tactical assessment of the next opponent team.",
    raisesLoweres: "Offered in the Scout Reports panel of the Hub screen based on your club's scouting department.",
    unlocksGates: "Provides specific match advice and reduces opponent defensive check ratings when correctly utilized.",
    seeAlso: ["Tactical Familiarity", "Form Coefficient"]
  }
];

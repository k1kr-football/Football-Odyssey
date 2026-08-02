/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherCondition {
  type: 'SUNNY' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'SNOW' | 'WINDY' | 'FOG';
  icon: string;
  description: string;
  modifiers: {
    passing: number;
    dribbling: number;
    pace: number;
    injuryRisk: number;
    vision?: number;
    crossing?: number;
  };
}

export interface PitchCondition {
  type: 'PERFECT' | 'SLIGHTLY_WET' | 'WATERLOGGED' | 'MUDDY' | 'FROZEN';
  icon: string;
  modifiers: {
    pace: number;
    dribbling: number;
    passing: number;
    injuryRisk: number;
  };
}

export interface Sponsorship {
  id: string;
  brand: string;
  tier: 'BASIC' | 'MID' | 'PREMIUM' | 'ELITE' | 'LEGENDARY';
  baseFee: number;
  performanceBonus: number;
  imageRights: number;
  length: number;
  clauses: string[];
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'REJECTED';
}

export interface Journalist {
  id: string;
  name: string;
  type: 'FAN' | 'CRITIC' | 'PROVOCATEUR' | 'INSIDER' | 'JOKER';
  relationship: number; // 0-100
  tier: 'ENEMY' | 'NEUTRAL' | 'FRIEND' | 'ALLY';
  history: string[];
}

export interface Milestone {
  id: string;
  type: string;
  date: string;
  description: string;
  reward: string;
  completed: boolean;
}

export interface MatchFormation {
  team: string;
  formation: string;
  yourPosition?: string;
  opposition: string;
  oppositionFormation: string;
}

export interface HeatMapData {
  zones: {
    leftWing: number;
    center: number;
    rightWing: number;
    defensiveThird: number;
    middleThird: number;
    attackingThird: number;
  };
  distanceCovered: number;
  analysis: string;
}

export interface HalfTimeTalk {
  managerMood: 'FURIOUS' | 'ENCOURAGING' | 'SATISFIED' | 'INTENSE';
  message: string;
  score: string;
  selectedResponse?: string;
  effect?: {
    statBonus: number;
    trustChange: number;
    moraleChange: number;
  };
}

export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB' | 'DM' | 'CM' | 'LM' | 'RM' | 'AM' | 'LW' | 'RW' | 'SS' | 'ST';

export type SubPosition =
  | 'Sweeper Keeper'
  | 'Traditional Keeper'
  | 'Distribution Keeper'
  | 'Ball-Playing CB'
  | 'Stopper'
  | 'Libero'
  | 'Attacking Full-back'
  | 'Defensive Full-back'
  | 'Inverted Full-back'
  | 'Deep-Lying Playmaker'
  | 'Box-to-Box'
  | 'Defensive Midfielder'
  | 'Wide Midfielder'
  | 'Defensive Wide Mid'
  | 'Advanced Wide Mid'
  | 'Shadow Striker'
  | 'Classic Number 10'
  | 'Deep-Lying AM'
  | 'Inside Forward'
  | 'Traditional Winger'
  | 'Pressing Winger'
  | 'Poacher'
  | 'Target Man'
  | 'Deep-Lying Forward'
  | 'Advanced Forward';

export type BackstoryType =
  | 'STREET_PRODIGY'
  | 'FALLEN_PRODIGY'
  | 'LATE_BLOOMER'
  | 'ACADEMY_GRADUATE'
  | 'EXILE'
  | 'FROM_SCRATCH'
  | 'NON_LEAGUE'
  | 'ACADEMY_PRODIGY'
  | 'WONDERKID'
  | 'NEPOTISM_CASE'
  | 'THE_REFUGEE'
  | 'LATE_REPLACEMENT'
  | 'SECOND_SPORT_CONVERT';

export interface BackstoryDetails {
  region?: string;
  formativeFrame?: string;
  dualNationality?: string;
  originatingSport?: string;
  reputationTag?: string;
  familySituation?: {
    optionId: string;
    title: string;
    description: string;
    npcName: string;
    startingRelationship: number;
  };
  rivalOrMentor?: {
    choiceType: 'RIVAL' | 'MENTOR';
    name: string;
    roleOrPosition: string;
    title: string;
    description: string;
  };
  coreWound?: {
    id: string;
    tag: string;
    drivingQuestion: string;
    description: string;
  };
}

export interface StoryBeat {
  act: number;
  beat: number;
  name: string;
  description: string;
  triggered: boolean;
  narrative: string;
}

export interface StoryArc {
  drivingQuestion: string;
  currentAct: number;
  currentBeat: number;
  progress: number;
  beats: StoryBeat[];
  resolution: string | null;
  legacyTierUnlocked?: string;
}

export interface ManagerPromise {
  id: string;
  type: 'MINUTES' | 'POSITION' | 'TRANSFER' | 'CONTINENTAL';
  status: 'ACTIVE' | 'BROKEN' | 'KEPT';
  weekMade: number;
  deadlineWeek: number;
  description: string;
}

export interface MentoringRelationship {
  isMentor: boolean;
  partnerName: string;
  weeksRemaining: number;
  focusAttribute: string;
}

export interface SquadGroup {
  name: string;
  members: string[];
  influence: number;
}
export interface SquadDynamicsEvent {
  type: string;
  date: string;
  status: 'PENDING' | 'RESOLVED';
  resolution?: string;
}
export interface SquadDynamics {
  cohesion: number; // 0-100
  dominantClique: string;
  dressingRoomLeaders: string[];
  unity: number; // 0-100
  faultLines: string[];
  groups?: SquadGroup[];
  personalities?: Record<string, 'LEADER' | 'MENTOR' | 'JOKER' | 'GRINDER' | 'CLIQUE_MEMBER' | 'LONER' | 'COMPLAINER' | 'STAR'>;
  events?: SquadDynamicsEvent[];
}

export interface Attributes {
  // Physical
  pace: number;
  strength: number;
  stamina: number;
  agility: number;

  // Technical
  finishing: number;
  shooting?: number;
  passing: number;
  dribbling: number;
  firstTouch: number;
  tackling: number;
  heading?: number;
  crossing?: number;
  shortPassing?: number;
  longPassing?: number;
  ballControl?: number;
  balance?: number;
  jumping?: number;

  // Mental
  composure: number;
  vision: number;
  positioning: number;
  decisionMaking: number;
  tacticalAwareness: number;
  leadership: number;
  determination: number;
}

export interface PlayerStats {
  apps: number;
  goals: number;
  assists: number;
  caps: number;
  intlGoals?: number;
  cleanSheets?: number;
  averageRating?: number;
  derbyStats?: {
    played: number;
    totalRating: number;
  };
}

export type SquadHierarchyTier = 'Exile' | 'Squad Player' | 'Backup' | 'Rotation' | 'First Teamer' | 'Key Player' | 'Star Player' | 'Club Legend' | 'Youth' | 'Fringe';

export type MoraleTier = 'Confident' | 'Settled' | 'Uncertain' | 'Unhappy' | 'Miserable';

export type AgentTier = 'Rookie' | 'Hungry' | 'Shark' | 'Super Agent' | 'Legend';

export interface TransferOffer {
  id: string;
  clubSymbol: string;
  wage: number;
  bonus: number;
  length: number; // years
  releaseClause?: number;
  contractBonus?: { type: 'GOAL' | 'CLEAN_SHEET' | 'APPEARANCE', amount: number };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  isHomecoming?: boolean;
  isTrial?: boolean;
}

export interface PlayerRoleSpecialization {
  selectedRoleId: string;
  familiarity: number; // 0-100
  recentMatchesInRole: number;
}

export type PlayerPersonality = 'Professional' | 'Ambitious' | 'Temperamental' | 'Loyal' | 'Media-Friendly' | 'Introvert' | 'Party Animal' | 'Model Citizen';

export interface Player {
  hierarchyRole?: 'Youth' | 'Fringe' | 'Core' | 'Vice-Captain' | 'Captain';
  squadStatus?: SquadHierarchyTier;
  careerHistory?: any[];
  squadChemistry?: number;
  firstName: string;
  lastName: string;
  agentName?: string;
  nationality: string;
  backstory: BackstoryType;
  backstoryDetails?: BackstoryDetails;
  position: Position;
  subPosition: SubPosition;
  roleSpecialization?: PlayerRoleSpecialization;
  dominantFoot: 'Right' | 'Left' | 'Both';
  weakFoot: number; // 1-5 stars
  startingClubSymbol: string;
  currentClubSymbol: string;
  hometownClubSymbol?: string;
  preMatchRitual?: 'LUCKY_SOCKS' | 'TAP_BOOTS' | 'CHECK_PITCH' | 'LOCKER_STALL' | 'NONE';
  ovr: number;
  age: number;
  form: number; // 0-100
  sharpness: number; // 0-100
  tacticalFamiliarity: number; // 0-100
  trust: number; // 0-100 (Manager trust)
  fatigue: number; // 0-100
  morale: number; // 0-100
  fans: number; // 0-100
  fanTier?: string;
  mediaPerception: number; // 0-100
  reputationTags?: string[];
  storyArc?: StoryArc;
  reputation: {
    club: number; // 0-100
    league: number; // 0-100
    world: number; // 0-100
    peerRespect: number; // 0-100 (Peer/Professional Respect)
    skill: number;
    attitude: number;
    media: number;
    fans: number;
  fanTier?: string;
    global: number;
    legacy: number;
  };
  perception?: string;
  perceptionHistory?: { date: string; perception: string; trigger: string }[];
  matchAnalysis?: MatchAnalysis[];
  tacticalInstruction?: TacticalInstructions;
  physicalCondition?: PhysicalCondition;
  recoveryProfile?: RecoveryProfile;
  contract: {
    wage: number; // per week
    expires: string; // e.g. "June 2028"
    yearsLeft: number;
    status: SquadHierarchyTier;
    bonuses: number;
    parentClub?: string; // If on loan
    releaseClause?: number; 
    appearanceBonus?: number;
    goalBonus?: number;
  };
  agentTier: AgentTier;
  transferOffers: TransferOffer[];
  transferRequestStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  loanInfo?: {
    hostClub: string;
    playingTimeGuarantee: boolean;
    recallClause: boolean;
    wagePercentage: number;
  };
  transferListed?: boolean;
  relationships: {
    manager: number; // replaces trust? or links to it
    manager_discipline: number; // For dual-axis trust (Performance vs Discipline)
    teammates: number;
    agent: number;
    family: number;
    intlManager?: number;
  };
  managerInfo: {
    name: string;
    assessmentWeeksLeft: number;
    pressure: number; // 0-100, at 100 they get sacked
    personality?: 'Demanding' | 'Nurturing' | 'Tactical' | 'Pragmatic';
    tacticalSystem?: 'Gegenpress' | 'Tiki-Taka' | 'Low Block' | 'Direct Counter';
    valuedAttributes?: string[];
    attitudeText?: string;
  };
  socialMedia: {
    followers: number;
    cancelRisk: number; // 0-100
  };
  attributes: Attributes;
  stats: PlayerStats;
  careerIdentity?: import("./utils/managerPhilosophy").PhilosophyRecord[];
  matchdayRitual?: { name: string; active: boolean; effect: string };
  buffs?: {
    setPieceReliability: boolean;
    tacticalAdvantage: boolean;
    charismatic: boolean;
  };
  partnerships: {
    striker: number; // 0-100 familiarity
    midfield: number;
    winger: number;
  };
  finances: {
    balance: number; // in £
    expenses: {
      housing: number;
      training: number;
      lifestyle: number; // clothing, cars, PR
      family: number;
    };
  };
  lifestyleTier: {
    housing: 'Digs' | 'Apartment' | 'Mansion';
    training: 'Basic' | 'Pro' | 'Elite';
    nutrition: 'Club' | 'Private Chef';
    image: 'Standard' | 'Designer' | 'Iconic';
  };
  sponsors: number;
  playstyleIdentity: string;
  characterType: string;
  personality: PlayerPersonality;
  traits: string[];
  timeline: TimelineEvent[];
  mentalFatigue?: number; // 0-100 mental burnout meter
  mentalFatigueDetails?: MentalFatigueDetails;
  rehabProcess?: ActiveRehabProcess;
  isInjured: boolean;
  injuryName?: string;
  injuryWeeksLeft?: number;
  isRetired?: boolean;
  promises: ManagerPromise[];
  mentoring: MentoringRelationship | null;
  squadDynamics: SquadDynamics;
  isTutorialMode?: boolean;
  training?: {
    weeklySessions: {
      clubOrganized: number;
      individual: number;
      recovery: number;
      trainingMatch: number;
    };
    sessionHistory: {
      date: string;
      type: string;
      performance: number;
      attributeGained: string;
      gainAmount: number;
    }[];
    trainingMatchHistory: {
      date: string;
      rating: number;
      goals: number;
      assists: number;
    }[];
  };
  stateFlags: {
    historyFlags?: Record<string, boolean>;
    openThreads?: Record<string, any>;
    eventCooldowns?: Record<string, number>;
    decisionMemory?: any[];
    digestEnabled?: boolean;
    verbosity?: 'ALL' | 'IMPORTANT_AND_CRITICAL' | 'CRITICAL_ONLY';
    notificationVerbosity?: 'ALL' | 'IMPORTANT_AND_CRITICAL' | 'CRITICAL_ONLY';
    reputationHistory?: any[];
    skippedTrainingThisWeek?: boolean;
    retired?: boolean;
    agentFocus?: 'TRANSFER' | 'LOYALTY' | 'WAGES' | 'BONUSES' | 'PR_HYPE' | 'FOOTBALL' | string;
    lastAgentMeetingWeek?: number;
    highestFinancialTier?: string;
    intlStatus?: 'Uncapped' | 'Youth' | 'Senior Fringe' | 'Senior Regular' | 'Senior Captain' | 'Retired';
    intlCampaign?: 'Qualifiers' | 'Tournament' | 'None';
    intlCampaignStage?: string;
    intlCampaignPoints?: number;
    activeIntlWindow?: number;
    preseasonEvaluation?: {
        friendlyAppearances: number;
        friendlyRatingsSum: number;
        provisionalStatus: SquadHierarchyTier;
        originalStatus: SquadHierarchyTier;
        injuries: number;
    };
    midSeasonEvaluation?: {
        matchesPlayed: number;
        ratingsSum: number;
        provisionalStatus: SquadHierarchyTier;
        targetMatches: number;
    };
    activeSponsorship?: {
        sponsor: string;
        wage: number;
        signedWeek: number;
    };
    cleanSheets?: number;
    stadiumMilestones?: {
      hasNamedStand?: boolean;
      standName?: string;
      hasBronzeStatue?: boolean;
      statueLocation?: string;
      hasHallOfFame?: boolean;
      hallOfFameYear?: number;
      unlockedWeek?: number;
    };
    mediaProfile?: number;
    completedMediaActivities?: string[];
    academyProspects?: any[];
    academyLegacyScore?: number;
    currentWeek?: number;
    testimonialHosted?: boolean;
    predecessorLegend?: any;
    [key: string]: any;
  };
  ceiling: number;
  scoutReports?: ScoutReport[];
  dressingRoomEvents?: DressingRoomEvent[];
  rivals?: Rival[];
  trophies?: Trophy[];
  financialEmpire?: FinancialEmpire;
  retirement?: RetirementData;
  agentType?: 'SHARK' | 'PROTECTOR' | 'NEGOTIATOR' | 'CELEBRITY';
  progression?: PlayerProgression;
  difficulty?: 'CASUAL' | 'STANDARD' | 'REALISTIC';
  activeNegotiation?: ActiveNegotiation | null;
  savedAgent?: SavedAgent | null;
  sponsorshipsList?: Sponsorship[];
  journalists?: Journalist[];
  milestones?: Milestone[];
  loan?: {
    status: 'ACTIVE' | 'PENDING' | 'NONE';
    loanClub: string;
    duration: number; // months
    monthRemaining: number;
    appearances: number;
    goals: number;
  };
  formHistory?: number[];
  formStreak?: 'HOT_STREAK' | 'DROUGHT' | 'NEUTRAL';
  formStreakDuration?: number;
  hotStreakCount?: number;
  droughtCount?: number;
  seasonObjective?: {
    type: 'avoid_relegation' | 'mid_table' | 'top_half' | 'promotion' | 'playoffs' | 'europe' | 'silverware';
    title: string;
    targetText: string;
    targetPos: number;
    metric: 'position';
    status: 'ACTIVE' | 'MET' | 'EXCEEDED' | 'MISSED';
    ambition: 'LOW' | 'MEDIUM' | 'HIGH';
    pointsOffset: number;
    midSeasonCheckpointPassed?: boolean;
    thirdSeasonCheckpointPassed?: boolean;
  };
  newManagerBounce?: {
    active: boolean;
    matchesLeft: number;
    trustMultiplier: number;
    performanceBonus: number;
    originalTrust: number;
  };
  customAvatarUrl?: string;
  avatarConfig?: {
    hairStyle?: string;
    facialHair?: string;
    skinTone?: string;
    kitStyle?: string;
    bgStyle?: string;
    cardTitle?: string;
    customPrompt?: string;
  };
  dailyObjectives?: DailyObjective[];
  lastDailyObjectiveDate?: string;
  decisionMemory?: {
    id: string;
    week: number;
    choiceType: string;
    choiceText: string;
    description: string;
    timestamp: number;
  }[];
}

export type ProgressionGate = 'COMPETENCY' | 'RECOGNITION' | 'BREAKTHROUGH' | 'ESTABLISHED' | 'STAR' | 'LEGEND';

export interface PlayerProgression {
  gate: ProgressionGate;
  gateProgress: number; // 0-100
  reputation: number; // 0-100
  reputationGrowthHistory: { date: string; event: string; gain: number }[];
  matchesPlayed: number;
  averageRating: number;
  totalRatingsSum: number;
  goalsAndAssists: number;
}

export interface SavedAgent {
  id: string;
  name: string;
  nationality: string;
  archetype: 'FIERY' | 'CALM' | 'JOKER' | 'SHARK' | 'PROTECTOR' | 'INTENSE' | 'CHARISMATIC' | 'SKEPTICAL' | 'MENTOR' | 'ENIGMATIC';
  agenda: 'MONEY' | 'CAREER' | 'REPUTATION' | 'LOYALTY';
  commission: number;
  tier: 'Rookie' | 'Hungry' | 'Shark' | 'Super Agent' | 'Legend';
  relationship: number;
}

export interface ActiveNegotiation {
  clubSymbol: string;
  clubName: string;
  proposedWage: number;
  proposedLength: number; // 1-5 years
  proposedBonus: number; // signing bonus
  proposedReleaseClause: number; // buyout amount (0 if none)
  proposedLoyaltyBonus: number; // annual loyalty (0 if none)
  proposedAppearanceFee: number; // per appearance (0 if none)
  minimumAcceptableWage: number;
  clubBudgetLimit: number;
  roundsRemaining: number;
  agentAdvice: string;
}

export interface ScoutReport {
  date: string;
  assessment: string;
  strengths: string[];
  weaknesses: string[];
  potentialRating: {
    displayedStars: number;
    trueCeilingStars: number;
    noiseApplied: number;
    reputationTierAtTimeOfReport: string;
  };
  transferValue: string;
  comparison: string;
  recommendedFocus: string;
}

export interface PreconditionsMet {
  teammateA: string;
  teammateB: string;
  theirMutualRapport: number;
}

export interface DressingRoomEvent {
  date: string;
  type: string;
  preconditionsMet?: PreconditionsMet;
  description: string;
  choices: string[];
  selectedChoice?: string;
  consequenceDate?: string;
  consequence?: string;
}

export interface RivalSeasonComparison {
  yourGoals: number;
  theirGoals: number;
  yourRating: number;
  theirRating: number;
}

export interface Rival {
  name: string;
  club: string;
  position: string;
  type: 'POSITIONAL_RIVAL' | 'AWARD_RIVAL' | 'GRUDGE_RIVAL';
  escalatedTypes: string[];
  headToHead: {
    date: string;
    yourGoals: number;
    theirGoals: number;
    result: 'WIN' | 'LOSS' | 'DRAW';
  }[];
  seasonComparison: RivalSeasonComparison;
  mediaNarrative: string;
}

export interface Trophy {
  id: string;
  name: string;
  competition: string;
  year: number;
  story: string;
}

export interface InvestmentAsset {
  type: 'PROPERTY' | 'BUSINESS' | 'STOCKS' | 'CRYPTO';
  name: string;
  cost: number;
  baseWeeklyYield: number;
  varianceBand: number;
  purchaseDate: string;
}

export interface FinancialEmpire {
  netWorth: number;
  cashBalance: number;
  investments: InvestmentAsset[];
  businesses: {
    name: string;
    cost: number;
    baseWeeklyYield: number;
    varianceBand: number;
    purchaseDate: string;
  }[];
  stocks: { value: number; annualReturnRate: number };
  crypto: {
    value: number;
    currentPrice: number;
    coinsHeld: number;
    rollingFourWeekDrawdown: number;
  };
  stage: 'ROOKIE' | 'INVESTOR' | 'TYCOON' | 'EMPEROR';
  lastPayoutDate: string;
}

export interface RetirementData {
  date: string;
  age: number;
  finalClub: string;
  careerStats: {
    appearances: number;
    goals: number;
    assists: number;
    trophies: number;
  };
  legacyScoreBreakdown: {
    trophiesWon: number;
    individualAwards: number;
    longevity: number;
    loyalty: number;
    internationalSuccess: number;
    legacyStatue: number;
    interviewAdjustment: number;
    total: number;
  };
  legacyScore: number;
  legacyTier: string;
  lastInterview: { question: string; answer: string }[];
  clubs: { club: string; years: string; legacy: string; appearances: number; goals: number }[];
  timeline: { year: number; event: string }[];
}

export interface TimelineEvent {
  id: string;
  week: number;
  day: DayOfWeek;
  type: 'MILESTONE' | 'INJURY' | 'TRANSFER';
  title: string;
  description: string;
  clubSymbol?: string;
}

export interface Club {
  name: string;
  symbol: string;
  ovr: number;
  tier: 'Elite' | 'Strong' | 'Mid' | 'Lower' | 'Foundation';
  league: string;
  country: string;
  reputationTier?: string;
  wageBudget?: string;
  transferBudget?: string;
  stadiumCapacity?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export type RelationshipStatus = 'WARM' | 'CORDIAL' | 'SKEPTICAL' | 'CONFLICT';

export interface SquadRelationship {
  id: string;
  name: string;
  role: string;
  archetype: string;
  relationship: RelationshipStatus;
  talks: number;
  quote: string;
}

export type NotificationPriority = 'CRITICAL' | 'IMPORTANT' | 'ROUTINE' | 'AMBIENT';

export interface InboxMessage {
  id: string;
  sender: string;
  subject: string;
  content: string;
  read: boolean;
  handled?: boolean;
  actionTaken?: string;
  type: 'NEWS' | 'DM' | 'TRANSFER' | 'QUEST' | 'CONTRACT' | 'OTHER' | 'SOCIAL' | 'RUMOR' | 'OFFER' | 'SPORTING';
  timestamp: string;
  choices: { text: string; type: string; clubSymbol?: string; bonus?: number; wage?: number; wagePerc?: number; sponsorName?: string }[];
  socialPost?: {
    authorHandle: string;
    likes: number;
    retweets: number;
  };
  priority?: NotificationPriority;
  digestItems?: InboxMessage[];
}

export interface Fixture {
  week: number;
  opponentSymbol: string;
  location: 'HOME' | 'AWAY';
  competition: 'LGE' | 'CUP' | 'INT';
  played: boolean;
  scoreFinished?: string; // e.g. "2 - 1"
  playerRating?: number; // e.g. 7.2
  playerGoals?: number;
  playerAssists?: number;
  turningPoints?: TurningPointEvent[];
}

export interface LeagueTableEntry {
  symbol: string;
  name: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: ('W' | 'D' | 'L')[];
}

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type RoutineSlot = 'MORNING' | 'TRAINING' | 'AFTERNOON' | 'EVENING';

export interface RoutineOption {
  id: string;
  name: string;
  description: string;
  effects: {
    sharpness?: number;
    trust?: number;
    fatigue?: number;
    morale?: number;
    finishing?: number;
    passing?: number;
    dribbling?: number;
    tackling?: number;
    firstTouch?: number;
    pace?: number;
    stamina?: number;
    strength?: number;
    agility?: number;
    composure?: number;
    vision?: number;
    decisionMaking?: number;
    leadership?: number;
  };
}

export interface WeeklyTrainingPlan {
  MON: string; // drill / Focus
  TUE: string;
  WED: string;
  THU: string;
  FRI: string;
  intensities: Record<DayOfWeek, 'L' | 'N' | 'H'>;
}

export interface DailyObjective {
  id: string;
  title: string;
  description: string;
  category: 'DRILLS' | 'TACTICAL' | 'FITNESS' | 'RECOVERY' | 'BONDING' | 'MENTAL';
  timeLimited?: boolean;
  statBoost: {
    attribute?: keyof Attributes;
    amount?: number;
    sharpness?: number;
    morale?: number;
    trust?: number;
    fatigue?: number;
  };
  durationText: string;
  completed: boolean;
  dateAssigned: string;
}

export interface TurningPointEvent {
  id: string;
  minute: number;
  title: string;
  description: string;
  impact: 'CRITICAL' | 'MAJOR' | 'GOAL' | 'RED_CARD' | 'VAR' | 'TACTICAL';
  team?: 'PLAYER' | 'OPPOSITION' | 'NEUTRAL';
  playerInvolved?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'WEAK_FOOT' | 'POSITION_MASTERY' | 'TRUST' | 'REDEMPTION' | 'LEGACY';
  progress: number;
  target: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  rarity: 'BRONZE' | 'SILVER' | 'GOLD';
}

export interface DailyActivityState {
  completedSlots: Record<DayOfWeek, Record<RoutineSlot, boolean>>;
  dayLogs: Record<DayOfWeek, string[]>;
}

export interface MatchEngineState {
  playerClubSymbol: string;
  opponentClubSymbol: string;
  minute: number;
  playerScore: number;
  opponentScore: number;
  teamMomentum: number; // -10 to +10
  playerMomentum: number; // -10 to +10
  logs: { minute: number; text: string; type: 'info' | 'highlight' | 'goal_player' | 'goal_opp' }[];
  turningPoints?: TurningPointEvent[];
  weather?: WeatherCondition;
  pitch?: PitchCondition;
  formation?: MatchFormation;
  heatMap?: HeatMapData;
  halfTimeTalk?: HalfTimeTalk;
  currentDecision?: {
    minute: number;
    situation: string;
    options: {
      text: string;
      risk: 'high' | 'medium' | 'low';
      effects: {
        successRateModifier: number;
        goalsWeight: number; // weighting of goal probability on success
        assistsWeight: number;
        momentumBonus: number;
      };
    }[];
  };
  teamTalk?: {
    phase: 'PRE_MATCH' | 'HALF_TIME' | 'FULL_TIME';
    managerTone: string;
    message: string;
    playerResponse?: string;
  };
  postMatchStats?: {
    rating: number;
    ratingChange: number;
    sharpnessChange: number;
    events: string[];
    narrative: string;
  };
}

export interface EventChoice {
  text: string;
  actionType: string;
}

export interface DailyEvent {
  id: string;
  title: string;
  description: string;
  category: 'PRESS' | 'TEAMMATE' | 'MANAGER' | 'AGENT' | 'SPONSOR' | 'PHYSIO' | 'FANS' | 'TRAINING';
  choices: EventChoice[];
}

export type CompetitionType = 'LEAGUE' | 'DOMESTIC_CUP' | 'EUROPEAN' | 'INTERNATIONAL' | 'FRIENDLY';

export interface CalendarMatch {
  id: string;
  opponentSymbol: string;
  competition: string; 
  competitionType: CompetitionType;
  isHome: boolean;
  round?: string;
  status: 'SCHEDULED' | 'PLAYED';
}

export interface CalendarSpecialEvent {
  id: string;
  type: 'MEDIA_DAY' | 'FAN_EVENT' | 'CHARITY' | 'TEAM_BONDING' | 'TRAINING_CAMP' | 'AWARD_CEREMONY' | 'SPONSOR_SHOOT' | 'INTERNATIONAL' | 'INJURY_SCARE';
  description: string;
  status: 'PENDING' | 'RESOLVED';
  choice?: string;
  impact?: string;
}

export interface CalendarEntry {
  week: number;
  day: DayOfWeek;
  type: 'MATCH' | 'REST' | 'TRAINING' | 'INTERNATIONAL_BREAK' | 'EVENT';
  match?: CalendarMatch;
  specialEvent?: CalendarSpecialEvent;
}

export interface MatchAnalysis {
  date: string;
  rating: number;
  tacticalFeedback: string;
  stats: {
    shots: number;
    shotsOnTarget: number;
    passes: number;
    passesCompleted: number;
    dribbles: number;
    dribblesCompleted: number;
    tackles: number;
    tacklesWon: number;
  };
  managerFeedback: string;
  fanFeedback: string;
  mediaFeedback: string;
  areaForImprovement: string;
  momentOfMatch: string;
  ratingTrend: string;
}

export interface TacticalInstructions {
  current: {
    instruction: string;
    adaptation: number;
    status: 'LEARNING' | 'MASTERED' | 'STRUGGLING';
  } | null;
  history: {
    match: string;
    instruction: string;
    success: boolean;
    adaptationGain: number;
  }[];
}

export interface PhysicalCondition {
  value: number;
  tier: 'PEAK' | 'FIT' | 'TIRED' | 'FATIGUED' | 'EXHAUSTED';
  effects: {
    statPenalty: number;
    injuryRisk: number;
  };
  matchFitness: number; // 0-100, readiness for full-intensity match minutes
  recoveryDebt: number; // 0-100, accumulated physical strain not yet recovered
  injurySusceptibility: number; // 0-100, dynamic rolling injury risk modifier
}

export interface RecoveryProfile {
  tier: 'ELITE' | 'PRO' | 'STANDARD' | 'BASIC' | 'FRESH' | 'NORMAL' | 'FATIGUED';
  speed: number; // amount of Recovery Debt cleared per week
  daysToPeak: number;
  activeBonuses?: string[]; // list of active recovery aids (e.g., hyperbaric chamber, massage parlor)
}

export type MatchEventType = 'SHOT' | 'DRIBBLE' | 'PASS' | 'TACKLE' | 'CROSS' | 'SET_PIECE' | 'OFF_BALL_RUN' | 'POSITIONAL_BLOCK' | 'RECOVERY' | 'INTERCEPTION' | 'HEADER' | 'SUPPORT_RUN' | 'PRESSING' | 'OPPOSITION_THREAT' | 'DUMMY' | 'STRETCH' | 'WARMUP' | 'BENCH_REACTION' | 'FOUL' | 'CARD' | 'HALF_TIME' | 'GENERAL_PLAY';

export interface RehabStage {
  id: 'REST' | 'LIGHT_REHAB' | 'FULL_TRAINING' | 'MATCH_FITNESS';
  name: string;
  description: string;
  targetWeeks: number;
  completedWeeks: number;
}

export interface ActiveRehabProcess {
  injuryId: string;
  injuryName: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  totalWeeksEstimated: number;
  weeksElapsed: number;
  currentStage: 'REST' | 'LIGHT_REHAB' | 'FULL_TRAINING' | 'MATCH_FITNESS';
  stages: RehabStage[];
  treatmentSelected?: boolean;
  treatmentType?: 'SURGERY' | 'CONSERVATIVE' | 'INJECTION';
  pacingChoice?: 'PUSH_HARD' | 'RECOMMENDED' | 'CAUTIOUS';
  reInjuryRisk: number; // 0-100 percentage
  relapseCount: number;
  medicalAdvice: string;
  history: {
    week: number;
    pacingChoice: 'PUSH_HARD' | 'RECOMMENDED' | 'CAUTIOUS';
    stage: string;
    result: string;
  }[];
}

export interface MentalFatigueDetails {
  level: 'FRESH' | 'MILD_STRESS' | 'HIGH_BURNOUT' | 'CRITICAL_EXHAUSTION';
  statPenalty: number;
  factors: string[];
}
export type MatchActionOutcome = 'SUCCESS' | 'FAILURE' | 'CRITICAL_SUCCESS' | 'CRITICAL_FAILURE';



export interface AppSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  fullscreen: boolean;
  animations: boolean;
  matchEngineSpeed: 'Normal' | 'Fast' | 'Skip (Text Only)';
  autoSave: boolean;
}

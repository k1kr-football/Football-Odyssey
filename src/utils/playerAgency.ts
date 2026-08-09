import { GameState } from '../store/GameContext';
import { Player } from '../types';
import { addDecision } from './decisionMemory';
import { getClubStaff, getCanonicalSender } from './clubStaff';
import { verifyClubSigningCapability } from './clubFinances';

export type MeetingTopic = 'PLAYING_TIME' | 'TACTICAL_ROLE' | 'AMBITION';

export interface MeetingOption {
  id: string;
  topic: MeetingTopic;
  title: string;
  description: string;
}

export const MEETING_OPTIONS: MeetingOption[] = [
  // PLAYING TIME
  {
    id: 'EXPRESS_FRUSTRATION',
    topic: 'PLAYING_TIME',
    title: 'Express Frustration with Minutes',
    description: 'Demand more starting appearances based on your recent training effort and performances.'
  },
  {
    id: 'ASK_IMPROVEMENT_PATH',
    topic: 'PLAYING_TIME',
    title: 'Ask for a Path to Regular Starts',
    description: 'Constructively ask what specific areas you need to improve to earn a regular starting spot.'
  },
  {
    id: 'EXPRESS_SATISFACTION',
    topic: 'PLAYING_TIME',
    title: 'Affirm Role & Patience',
    description: 'Reassure the manager that you understand your current squad status and are ready when called upon.'
  },

  // TACTICAL ROLE
  {
    id: 'RAISE_FIT_CONCERN',
    topic: 'TACTICAL_ROLE',
    title: 'Raise Tactical System Fit Concern',
    description: 'Express concern that the team’s current tactical instructions don’t play to your core strengths.'
  },
  {
    id: 'OFFER_SYSTEM_ADAPTATION',
    topic: 'TACTICAL_ROLE',
    title: 'Commit to Tactical Instructions',
    description: 'Affirm your willingness to adapt your game and learn new tactical roles for the team.'
  },

  // AMBITION
  {
    id: 'PUSH_BIGGER_ROLE',
    topic: 'AMBITION',
    title: 'Push for Leadership & Focal Role',
    description: 'State your ambition to become a core leader and focal point of the squad.'
  },
  {
    id: 'HINT_STEP_UP',
    topic: 'AMBITION',
    title: 'Hint at Seeking a Step-Up',
    description: 'Warn that if the club cannot match your career ambitions, you may need to look for a transfer.'
  },
  {
    id: 'AFFIRM_LOYALTY',
    topic: 'AMBITION',
    title: 'Pledge Unwavering Long-Term Loyalty',
    description: 'State your dream of building a lasting legacy at this club regardless of short-term challenges.'
  }
];

export interface MeetingResult {
  updatedState: GameState;
  managerDialog: string;
  trustChange: number;
  reputationTagAdded?: string;
  summary: string;
}

/**
 * Checks if the player can initiate a manager meeting (3-week cooldown).
 */
export function canRequestManagerMeeting(state: GameState): { allowed: boolean; remainingWeeks: number } {
  const lastWeek = state.player?.stateFlags?.lastManagerMeetingWeek;
  if (lastWeek === undefined || lastWeek === null) {
    return { allowed: true, remainingWeeks: 0 };
  }
  const diff = state.currentWeek - lastWeek;
  if (diff >= 3) {
    return { allowed: true, remainingWeeks: 0 };
  }
  return { allowed: false, remainingWeeks: 3 - diff };
}

/**
 * Executes a proactive manager meeting and computes manager AI reaction.
 */
export function processManagerMeeting(state: GameState, optionId: string): MeetingResult {
  if (!state.player) {
    return {
      updatedState: state,
      managerDialog: 'There is no active player to hold this meeting for.',
      trustChange: 0,
      summary: 'No active career in progress.'
    };
  }
  const player = { ...state.player };
  const currentClubSymbol = player.currentClubSymbol;
  const worldClub = state.worldState?.clubs?.[currentClubSymbol];
  const managerName = worldClub?.manager?.name || player.managerInfo?.name || "The Gaffer";
  const archetype = worldClub?.manager?.archetype || 'PRAGMATIST';
  const philosophy = worldClub?.manager?.philosophy || 'TACTICAL_RIGID';

  const option = MEETING_OPTIONS.find(o => o.id === optionId) || MEETING_OPTIONS[0];

  let trustChange = 0;
  let managerDialog = '';
  let reputationTagAdded: string | undefined = undefined;

  // Calculate recent stats & rating for pragmatist/performance checks
  const apps = player.stats?.apps || 0;
  const avgRating = player.stats?.averageRating || 6.8;
  const squadStatus = player.squadStatus || 'Rotation';

  switch (archetype) {
    case 'LOYALIST':
      if (optionId === 'AFFIRM_LOYALTY' || optionId === 'OFFER_SYSTEM_ADAPTATION') {
        trustChange = 8;
        managerDialog = `"Loyalty is rare in modern football, ${player.lastName}. Hearing your commitment to this club and our tactical philosophy means the world to me. You'll always have a strong place in my plans."`;
      } else if (optionId === 'HINT_STEP_UP' || optionId === 'EXPRESS_FRUSTRATION') {
        trustChange = -8;
        managerDialog = `"Nobody is bigger than this football club. Demanding minutes or questioning your future here shows a lack of respect for your teammates. Put the team first!"`;
        
        // Check for repeated playing time complaints
        const complaints = (player.stateFlags?.playingTimeComplaints || 0) + 1;
        player.stateFlags = { ...player.stateFlags, playingTimeComplaints: complaints };
        if (complaints >= 2 && avgRating < 7.0) {
          reputationTagAdded = "Difficult to Manage";
        }
      } else if (optionId === 'ASK_IMPROVEMENT_PATH') {
        trustChange = 4;
        managerDialog = `"I appreciate an honest, hard-working attitude. Show me discipline in training every day and your opportunity will come."`;
      } else {
        trustChange = 3;
        managerDialog = `"I hear what you're saying, ${player.lastName}. As long as you stay committed to the squad, we'll keep moving forward together."`;
      }
      break;

    case 'PRAGMATIST':
      // Ruthless Pragmatist evaluates based strictly on performance numbers
      if (optionId === 'EXPRESS_FRUSTRATION' || optionId === 'PUSH_BIGGER_ROLE') {
        if (avgRating >= 7.2 || apps >= 5) {
          trustChange = 5;
          managerDialog = `"The match data doesn't lie. You've been producing high ratings on the pitch, so you deserve to be in the starting conversation."`;
        } else {
          trustChange = -6;
          managerDialog = `"You haven't posted the numbers to demand anything. Earn your starting shirt on the pitch before coming into my office to complain."`;
          const complaints = (player.stateFlags?.playingTimeComplaints || 0) + 1;
          player.stateFlags = { ...player.stateFlags, playingTimeComplaints: complaints };
          if (complaints >= 2) {
            reputationTagAdded = "Difficult to Manage";
          }
        }
      } else if (optionId === 'HINT_STEP_UP') {
        trustChange = -7;
        managerDialog = `"If an offer arrives that meets our valuation, we'll evaluate it. Until then, execute your tactical assignments without distraction."`;
      } else if (optionId === 'ASK_IMPROVEMENT_PATH' || optionId === 'OFFER_SYSTEM_ADAPTATION') {
        trustChange = 4;
        managerDialog = `"Good. Focus on your pass efficiency and physical tracking metrics. Results govern who plays in my squad."`;
      } else {
        trustChange = 2;
        managerDialog = `"Words don't earn points. Deliver consistency on matchday and the rest takes care of itself."`;
      }
      break;

    case 'PROJECT_BUILDER':
      // Project Builder encourages development, learning, and tactical fit
      if (optionId === 'ASK_IMPROVEMENT_PATH' || optionId === 'OFFER_SYSTEM_ADAPTATION') {
        trustChange = 8;
        managerDialog = `"That is exactly the growth mindset I want in this squad! Let's work closely with the coaching staff to refine your tactical positioning."`;
      } else if (optionId === 'RAISE_FIT_CONCERN') {
        trustChange = 4;
        managerDialog = `"I appreciate you bringing this to me openly. Let's adjust your individual tactical instructions so you can express your core strengths better."`;
      } else if (optionId === 'PUSH_BIGGER_ROLE' || optionId === 'AFFIRM_LOYALTY') {
        trustChange = 6;
        managerDialog = `"I want leaders who strive to take this project forward. Step up during training sessions and you'll be central to our long-term blueprint."`;
      } else if (optionId === 'EXPRESS_FRUSTRATION') {
        trustChange = -3;
        managerDialog = `"Development requires patience, ${player.lastName}. Rushing your progression before you're fully prepared hurts your long-term ceiling."`;
      } else {
        trustChange = -4;
        managerDialog = `"Our project relies on collective trust. Threatening to leave or demanding quick shortcuts destabilizes the room."`;
      }
      break;

    case 'VOLATILE':
      // Volatile manager reacts strongly based on recent club form / mood
      const recentForm = worldClub?.form || [1];
      const lastForm = recentForm.length > 0 ? recentForm[recentForm.length - 1] : 1;
      if (lastForm >= 1) {
        // Winning streak / happy mood
        if (optionId === 'HINT_STEP_UP') {
          trustChange = -10;
          managerDialog = `"We are winning matches right now! If you're not on board with our momentum, I'll drop you to the reserves immediately!"`;
        } else {
          trustChange = 7;
          managerDialog = `"I love the passion! We are flying right now — bring that intensity to the pitch and you'll get your reward!"`;
        }
      } else {
        // Loss or poor form / explosive reaction
        if (optionId === 'EXPRESS_FRUSTRATION' || optionId === 'RAISE_FIT_CONCERN' || optionId === 'HINT_STEP_UP') {
          trustChange = -10;
          managerDialog = `"We just dropped points on matchday and you come into my office crying about your personal agenda?! Get out of my face and get back to training!"`;
          reputationTagAdded = "Difficult to Manage";
        } else {
          trustChange = 3;
          managerDialog = `"At least someone in this squad has the fire to fight. We need to turn this form around starting this weekend."`;
        }
      }
      break;
  }

  // Update player trust
  const newTrust = Math.min(100, Math.max(0, (player.trust || 50) + trustChange));
  player.trust = newTrust;

  // Add reputation tag if triggered
  if (reputationTagAdded) {
    const existingTags = player.reputationTags || [];
    if (!existingTags.includes(reputationTagAdded)) {
      player.reputationTags = [...existingTags, reputationTagAdded];
    }
  }

  // Record meeting week
  player.stateFlags = {
    ...player.stateFlags,
    lastManagerMeetingWeek: state.currentWeek
  };

  let updatedState: GameState = {
    ...state,
    player
  };

  // Log to Decision Memory
  const isAmbition = option.topic === 'AMBITION';
  updatedState = addDecision(
    updatedState,
    `Meeting with ${managerName}: ${option.title}`,
    'Manager Meeting',
    isAmbition ? 'MAJOR' : 'MODERATE',
    [managerName],
    [currentClubSymbol],
    `Initiated a private meeting regarding ${option.topic.toLowerCase().replace('_', ' ')}. Manager (${archetype}) responded: "${managerDialog}".`,
    `Trust ${trustChange >= 0 ? '+' : ''}${trustChange}%`
  );

  return {
    updatedState,
    managerDialog,
    trustChange,
    reputationTagAdded,
    summary: `Meeting concluded with ${managerName}. Manager Trust ${trustChange >= 0 ? '+' : ''}${trustChange}%.`
  };
}


// --- SUGGEST A SIGNING (DIRECTOR OF FOOTBALL) ---

export interface TargetCandidate {
  id: string;
  name: string;
  position: string;
  age: number;
  club: string;
  clubSymbol: string;
  ovr: number;
  value: number; // transfer fee
  weeklyWage: number;
  candidateType: 'Youth Rival' | 'Former Teammate' | 'Scouted Talent';
  reasoning: string;
}

export interface DoFResponseResult {
  updatedState: GameState;
  status: 'ACCEPTED_AND_SIGNED' | 'ADDED_TO_SHORTLIST' | 'DECLINED_FINANCIAL' | 'DECLINED_TACTICAL';
  dofDialog: string;
  trustChange: number;
  peerRespectChange: number;
  inboxMsg?: any;
}

/**
 * Checks if player can suggest a signing to DoF (6-week cooldown).
 */
export function canSuggestSigningToDoF(state: GameState): { allowed: boolean; remainingWeeks: number } {
  const lastWeek = state.player?.stateFlags?.lastDoFSuggestionWeek;
  if (lastWeek === undefined || lastWeek === null) {
    return { allowed: true, remainingWeeks: 0 };
  }
  const diff = state.currentWeek - lastWeek;
  if (diff >= 6) {
    return { allowed: true, remainingWeeks: 0 };
  }
  return { allowed: false, remainingWeeks: 6 - diff };
}

/**
 * Generates a pool of plausible transfer target candidates to suggest.
 */
export function getSuggestedSigningCandidates(state: GameState): TargetCandidate[] {
  const candidates: TargetCandidate[] = [];
  const player = state.player;
  if (!player) return candidates;
  const playerClub = player.currentClubSymbol;

  // 1. Rivals from Youth Prodigy / Positional Rivalry
  if (player.rivals && player.rivals.length > 0) {
    player.rivals.forEach((r, idx) => {
      if (r.club && r.club !== playerClub) {
        const clubObj = state.worldState?.clubs?.[r.club];
        candidates.push({
          id: `target_rival_${idx}_${Date.now()}`,
          name: r.name,
          position: r.position || 'ST',
          age: 19 + (idx % 3),
          club: clubObj?.name || r.club,
          clubSymbol: r.club,
          ovr: Math.min(88, Math.max(68, player.ovr + (idx % 2 === 0 ? 2 : -1))),
          value: 12000000 + idx * 3000000,
          weeklyWage: 25000,
          candidateType: 'Youth Rival',
          reasoning: `Your direct positional rival at ${clubObj?.name || r.club}. Signing him would strengthen our squad while weakening a key competitor.`
        });
      }
    });
  }

  // 2. Former Teammates from previous clubs
  if (player.careerHistory && player.careerHistory.length > 0) {
    const prevClub = player.careerHistory[player.careerHistory.length - 1];
    if (prevClub && prevClub.clubSymbol !== playerClub) {
      candidates.push({
        id: `target_teammate_${Date.now()}`,
        name: `Mateo Silva`,
        position: 'CM',
        age: 22,
        club: prevClub.clubName || prevClub.clubSymbol,
        clubSymbol: prevClub.clubSymbol,
        ovr: Math.min(85, player.ovr + 1),
        value: 14000000,
        weeklyWage: 28000,
        candidateType: 'Former Teammate',
        reasoning: `Your trusted former midfield partner from your time at ${prevClub.clubName || prevClub.clubSymbol}. Excellent chemistry potential.`
      });
    }
  }

  // 3. Fallback Scouted League Targets
  const otherClubs = Object.values(state.worldState?.clubs || {}).filter(c => c.symbol !== playerClub);
  const sampleNames = ['Lucas Paqueta Jr', 'Viktor Gyokeres', 'Gabriel Veiga', 'Amadou Onana', 'Nico Williams', 'Tino Livramento'];

  otherClubs.slice(0, 3).forEach((club, idx) => {
    const name = sampleNames[idx % sampleNames.length];
    const posList = ['RW', 'LW', 'CAM', 'CB', 'LB', 'ST'];
    const pos = posList[idx % posList.length];
    const targetOvr = Math.min(86, Math.max(68, player.ovr + (idx === 0 ? 3 : idx === 1 ? 0 : -2)));
    const targetVal = 10000000 + targetOvr * 300000;

    candidates.push({
      id: `target_scouted_${idx}_${Date.now()}`,
      name,
      position: pos,
      age: 20 + idx,
      club: club.name,
      clubSymbol: club.symbol,
      ovr: targetOvr,
      value: targetVal,
      weeklyWage: Math.round(targetVal * 0.002),
      candidateType: 'Scouted Talent',
      reasoning: `High-performing young prospect currently starring for ${club.name}. Has proven quality against top opposition.`
    });
  });

  return candidates;
}

/**
 * Evaluates a suggested signing with Director of Football, factoring in:
 * - Player Standing (HierarchyRole & Peer Respect)
 * - Financial Simulation (verifyClubSigningCapability)
 * - DoF/Scout assessment
 */
export function evaluateDoFSigningSuggestion(state: GameState, target: TargetCandidate): DoFResponseResult {
  if (!state.player) {
    return {
      updatedState: state,
      status: 'DECLINED_TACTICAL',
      dofDialog: 'There is no active player to evaluate this signing suggestion for.',
      trustChange: 0,
      peerRespectChange: 0
    };
  }
  const player = { ...state.player };
  const playerClub = player.currentClubSymbol;
  const staff = getClubStaff(state);
  const dofName = staff.chiefScout.fullName || "Director of Football";

  // Check financial capability
  const finances = state.worldState?.clubFinances;
  const finCheck = finances
    ? verifyClubSigningCapability(finances, playerClub, target.value, target.weeklyWage)
    : { canAfford: true, reason: '' };

  if (!finCheck.canAfford) {
    // Financial refusal
    player.stateFlags = { ...player.stateFlags, lastDoFSuggestionWeek: state.currentWeek };
    return {
      updatedState: { ...state, player },
      status: 'DECLINED_FINANCIAL',
      dofDialog: `"Thank you for bringing ${target.name} to our attention, ${player.lastName}. However, our current transfer budget and wage structure cannot support a £${(target.value/1000000).toFixed(1)}M deal right now. Financial health must come first."`,
      trustChange: 0,
      peerRespectChange: 0
    };
  }

  // Weight by Player Standing
  const hierarchyRole = player.hierarchyRole || 'Fringe';
  let standingBonus = 0;
  if (hierarchyRole === 'Captain') standingBonus += 25;
  else if (hierarchyRole === 'Vice-Captain') standingBonus += 15;
  else if (hierarchyRole === 'Core') standingBonus += 5;
  else if (hierarchyRole === 'Youth') standingBonus -= 15;
  else if (hierarchyRole === 'Fringe') standingBonus -= 20;

  const peerRespect = player.reputation?.peerRespect || 50;
  standingBonus += (peerRespect - 50) * 0.3; // up to +15

  const trust = player.trust || 50;
  if (trust >= 75) standingBonus += 10;
  if (trust <= 40) standingBonus -= 10;

  // Base score + standing + slight random roll
  const score = 45 + standingBonus + (Math.random() * 20 - 10);

  let status: DoFResponseResult['status'];
  let dofDialog = '';
  let trustChange = 0;
  let peerRespectChange = 0;
  let inboxMsg: any = null;

  if (score >= 60) {
    status = 'ACCEPTED_AND_SIGNED';
    trustChange = 6;
    peerRespectChange = 8;
    dofDialog = `"Outstanding eye, ${player.lastName}! Our scouting network ran deep analytical reports on ${target.name} and agreed. Given your leadership standing in this dressing room, we made a formal bid and completed the deal!"`;

    // Deduct from club finances if active
    if (finances && finances[playerClub]) {
      finances[playerClub].transferBudget = Math.max(0, finances[playerClub].transferBudget - target.value);
      finances[playerClub].spending.transfers += target.value;
    }

    inboxMsg = {
      id: `dof_signing_${Date.now()}`,
      sender: getCanonicalSender(state, 'SCOUT'),
      subject: `TRANSFER COMPLETED: ${target.name.toUpperCase()}`,
      content: `Official Announcement: Following your scouting recommendation, ${target.name} (£${(target.value/1000000).toFixed(1)}M from ${target.club}) has officially signed a contract with us!\n\nThe Director of Football praised your exceptional squad-building vision. ${target.candidateType === 'Youth Rival' ? 'Your former rival is now your teammate on the training pitch!' : target.candidateType === 'Former Teammate' ? 'Your former teammate has arrived to bolster our squad!' : 'He has integrated immediately into squad training.'}`,
      date: `Week ${state.currentWeek}, Season ${state.season}`,
      read: false
    };

  } else if (score >= 40) {
    status = 'ADDED_TO_SHORTLIST';
    trustChange = 2;
    peerRespectChange = 3;
    dofDialog = `"Good recommendation, ${player.lastName}. We've officially added ${target.name} to our recruitment shortlist for the upcoming transfer window. We'll monitor his progress closely."`;
  } else {
    status = 'DECLINED_TACTICAL';
    trustChange = 0;
    peerRespectChange = 0;
    dofDialog = `"We appreciate your suggestion, but our recruitment department believes ${target.name} doesn't align with our manager's tactical profile at this time."`;
  }

  // Update player trust & peer respect
  player.trust = Math.min(100, Math.max(0, (player.trust || 50) + trustChange));
  if (player.reputation) {
    player.reputation = {
      ...player.reputation,
      peerRespect: Math.min(100, Math.max(0, (player.reputation.peerRespect || 50) + peerRespectChange))
    };
  }

  player.stateFlags = {
    ...player.stateFlags,
    lastDoFSuggestionWeek: state.currentWeek
  };

  let updatedState: GameState = {
    ...state,
    player
  };

  if (inboxMsg) {
    updatedState.inbox = [inboxMsg, ...updatedState.inbox];
  }

  // Log to Decision Memory
  updatedState = addDecision(
    updatedState,
    `Suggested signing: ${target.name}`,
    'Director of Football',
    status === 'ACCEPTED_AND_SIGNED' ? 'MAJOR' : 'MODERATE',
    [dofName],
    [target.clubSymbol, playerClub],
    `Recommended ${target.name} (${target.candidateType}) to the Director of Football. Decision outcome: ${status}.`,
    `Trust +${trustChange}, Peer Respect +${peerRespectChange}`
  );

  return {
    updatedState,
    status,
    dofDialog,
    trustChange,
    peerRespectChange,
    inboxMsg
  };
}

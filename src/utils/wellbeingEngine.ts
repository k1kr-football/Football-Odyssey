import { Player, ActiveRehabProcess, RehabStage, MentalFatigueDetails, TimelineEvent } from '../types';

/**
 * Evaluates Mental Fatigue status and returns penalties and factors.
 */
export function getMentalFatigueLevel(val: number): MentalFatigueDetails {
  const value = Math.max(0, Math.min(100, Math.round(val)));
  if (value <= 25) {
    return {
      level: 'FRESH',
      statPenalty: 0,
      factors: ['Optimal cognitive readiness', 'Unburdened mental state']
    };
  } else if (value <= 50) {
    return {
      level: 'MILD_STRESS',
      statPenalty: 2,
      factors: ['Standard fixture pressure', 'Routine press obligations']
    };
  } else if (value <= 75) {
    return {
      level: 'HIGH_BURNOUT',
      statPenalty: 6,
      factors: ['Fixture congestion overload', 'Heavy press conference strain', 'Dressing room friction']
    };
  } else {
    return {
      level: 'CRITICAL_EXHAUSTION',
      statPenalty: 12,
      factors: ['Severe mental burnout', 'Unrelenting media pressure', 'High blunder risk under pressure']
    };
  }
}

/**
 * Updates player's mental fatigue each week based on schedule, media, and squad friction.
 */
export function processWeeklyMentalFatigue(
  player: Player,
  options: {
    matchesThisWeek?: number;
    pressCountThisWeek?: number;
    hadLoss?: boolean;
    hasPRWeek?: boolean;
  } = {}
): Player {
  let mf = player.mentalFatigue ?? 15;
  const matches = options.matchesThisWeek ?? 1;
  const pressCount = options.pressCountThisWeek ?? 0;
  const hadLoss = options.hadLoss ?? false;
  const hasPRWeek = options.hasPRWeek ?? false;

  let delta = 0;

  // 1. Fixture Congestion
  if (matches >= 2) {
    delta += 10;
  } else if (matches === 1) {
    delta += 2;
  } else {
    delta -= 6; // Rest week
  }

  // 2. Media Load & Press Conferences
  if (pressCount >= 2) {
    delta += 8;
  } else if (pressCount === 1) {
    delta += 3;
  }

  // 3. Match Outcomes & Pressure
  if (hadLoss) {
    delta += 5;
  }

  // 4. PR / Cancel Risk / Commercial Overload
  if (hasPRWeek) {
    delta += 8;
  }

  // 5. Squad Dynamics Friction
  const teamRel = player.relationships?.teammates ?? 50;
  if (teamRel < 40) {
    delta += 6;
  } else if (teamRel > 75) {
    delta -= 2; // Support from teammates helps mental recovery
  }

  // 6. Lifestyle / Housing Passive Mental Recovery
  const housing = player.lifestyleTier?.housing || 'Digs';
  if (housing === 'Mansion') {
    delta -= 6;
  } else if (housing === 'Apartment') {
    delta -= 3;
  }

  const updatedMF = Math.max(0, Math.min(100, Math.round(mf + delta)));
  const details = getMentalFatigueLevel(updatedMF);

  return {
    ...player,
    mentalFatigue: updatedMF,
    mentalFatigueDetails: details
  };
}

/**
 * Reduces mental fatigue directly from active Lifestyle / Wellness decisions.
 */
export function applyLifestyleMentalFatigueRecovery(
  player: Player,
  amount: number,
  activityName: string
): Player {
  const currentMF = player.mentalFatigue ?? 15;
  const updatedMF = Math.max(0, currentMF - amount);
  const details = getMentalFatigueLevel(updatedMF);

  return {
    ...player,
    mentalFatigue: updatedMF,
    mentalFatigueDetails: details
  };
}

/**
 * Initializes a multi-stage active rehab process for an injured player.
 */
export function initializeActiveRehab(
  injuryName: string,
  weeksEstimated: number
): ActiveRehabProcess {
  const estWeeks = Math.max(1, weeksEstimated);
  let severity: 'MINOR' | 'MODERATE' | 'SEVERE' = 'MINOR';

  if (estWeeks <= 2) severity = 'MINOR';
  else if (estWeeks <= 5) severity = 'MODERATE';
  else severity = 'SEVERE';

  let stages: RehabStage[] = [];

  if (severity === 'MINOR') {
    const stage1Weeks = 1;
    const stage2Weeks = Math.max(1, estWeeks - 1);
    stages = [
      {
        id: 'REST',
        name: 'Acute Inflammation & Rest',
        description: 'Reduce tissue swelling, ice therapy, and targeted bed rest.',
        targetWeeks: stage1Weeks,
        completedWeeks: 0
      },
      {
        id: 'MATCH_FITNESS',
        name: 'Light Ball Work & Return',
        description: 'Individual ball drills and rapid reintegration to full match squad.',
        targetWeeks: stage2Weeks,
        completedWeeks: 0
      }
    ];
  } else if (severity === 'MODERATE') {
    const rWeeks = 1;
    const lWeeks = Math.max(1, Math.floor((estWeeks - 2) / 2));
    const fWeeks = Math.max(1, Math.ceil((estWeeks - 2) / 2));
    const mWeeks = 1;

    stages = [
      {
        id: 'REST',
        name: 'Acute Cryotherapy & Rest',
        description: 'Immobilization and targeted ultrasound physical therapy.',
        targetWeeks: rWeeks,
        completedWeeks: 0
      },
      {
        id: 'LIGHT_REHAB',
        name: 'Hydrotherapy & Mobility',
        description: 'Low-impact swimming, resistance bands, and joint mobility.',
        targetWeeks: lWeeks,
        completedWeeks: 0
      },
      {
        id: 'FULL_TRAINING',
        name: 'Pitch Agility & Squad Drills',
        description: 'Non-contact tactical positioning and sprint mechanics.',
        targetWeeks: fWeeks,
        completedWeeks: 0
      },
      {
        id: 'MATCH_FITNESS',
        name: 'Full Contact & Sub Fitness',
        description: 'Intense 11v11 session and bench readiness.',
        targetWeeks: mWeeks,
        completedWeeks: 0
      }
    ];
  } else {
    // SEVERE
    const rWeeks = 2;
    const lWeeks = Math.max(2, Math.floor((estWeeks - 3) / 2));
    const fWeeks = Math.max(2, Math.ceil((estWeeks - 3) / 2));
    const mWeeks = 1;

    stages = [
      {
        id: 'REST',
        name: 'Post-Op / Immobilization',
        description: 'Strict clinical monitoring, surgical site healing, and brace rest.',
        targetWeeks: rWeeks,
        completedWeeks: 0
      },
      {
        id: 'LIGHT_REHAB',
        name: 'Isokinetic Gym Strength',
        description: 'Weight-bearing exercises, isometric load, and indoor bike work.',
        targetWeeks: lWeeks,
        completedWeeks: 0
      },
      {
        id: 'FULL_TRAINING',
        name: 'Tactical Reintegration',
        description: 'High-speed directional drills with medical supervisor monitoring.',
        targetWeeks: fWeeks,
        completedWeeks: 0
      },
      {
        id: 'MATCH_FITNESS',
        name: 'Reserve Match Minutes & Clearance',
        description: '30-minute test fixture and full competitive medical sign-off.',
        targetWeeks: mWeeks,
        completedWeeks: 0
      }
    ];
  }

  const medicalAdvice = getStageAdvice(stages[0].id, injuryName);

  return {
    injuryId: `injury_${Date.now()}`,
    injuryName,
    severity,
    totalWeeksEstimated: estWeeks,
    weeksElapsed: 0,
    currentStage: stages[0].id,
    stages,
    reInjuryRisk: 5,
    relapseCount: 0,
    medicalAdvice,
    history: []
  };
}

function getStageAdvice(stageId: 'REST' | 'LIGHT_REHAB' | 'FULL_TRAINING' | 'MATCH_FITNESS', injuryName: string): string {
  switch (stageId) {
    case 'REST':
      return `Dr. Sarah Jenkins: "Focus entirely on swelling reduction and ice therapy for your ${injuryName}. Do not test the joint prematurely."`;
    case 'LIGHT_REHAB':
      return `Dr. Sarah Jenkins: "Tissue regeneration is progressing well. We are moving into low-impact hydrotherapy to rebuild muscle fiber stability."`;
    case 'FULL_TRAINING':
      return `Dr. Sarah Jenkins: "You are cleared for non-contact squad drills. Listen to your body and report any stiffness immediately."`;
    case 'MATCH_FITNESS':
      return `Dr. Sarah Jenkins: "Final stage before competitive match clearance. We need to verify full explosive output under controlled contact."`;
  }
}

/**
 * Advances the active rehab process by 1 week tick based on the player's pacing choice.
 */
export function processWeeklyRehabStep(
  player: Player,
  pacingChoice: 'PUSH_HARD' | 'RECOMMENDED' | 'CAUTIOUS'
): {
  updatedPlayer: Player;
  inboxMessages: any[];
  timelineEvents: TimelineEvent[];
  resultSummary: string;
} {
  if (!player.isInjured || !player.rehabProcess) {
    // If injured but process missing, initialize now
    const process = initializeActiveRehab(player.injuryName || 'Muscle Strain', player.injuryWeeksLeft || 2);
    player = { ...player, rehabProcess: process };
  }

  let process: ActiveRehabProcess = JSON.parse(JSON.stringify(player.rehabProcess!));
  let weeksToAdd = 1.0;
  let riskPercent = 5;
  let sharpnessDelta = 0;
  let inboxMessages: any[] = [];
  let timelineEvents: TimelineEvent[] = [];
  let resultSummary = '';
  let sufferedRelapse = false;

  if (pacingChoice === 'PUSH_HARD') {
    weeksToAdd = 1.6;
    riskPercent = 38 + (player.fatigue > 50 ? 12 : 0);
    // Roll relapse
    if (Math.random() * 100 < riskPercent) {
      sufferedRelapse = true;
    }
  } else if (pacingChoice === 'RECOMMENDED') {
    weeksToAdd = 1.0;
    riskPercent = 4;
  } else if (pacingChoice === 'CAUTIOUS') {
    weeksToAdd = 0.85;
    riskPercent = 1;
    sharpnessDelta = 8;
  }

  if (sufferedRelapse) {
    process.relapseCount += 1;
    process.totalWeeksEstimated += 2;
    process.reInjuryRisk = 50;
    
    resultSummary = `RELAPSE SETBACK: You pushed too hard in gym drills. Muscle twinge added +2 weeks to your recovery timeline.`;
    
    inboxMessages.push({
      id: `relapse_${Date.now()}`,
      sender: 'MEDICAL CHIEF',
      subject: `🚨 MEDICAL SETBACK: ${process.injuryName}`,
      content: `Dr. Sarah Jenkins: "We warned you against rushing the rehab protocol. High-intensity loading caused a relapse in your ${process.injuryName}. We are forced to extend your recovery timeline by 2 weeks."`,
      read: false,
      type: 'MEDICAL',
      timestamp: 'MON 09:00',
      choices: [{ text: 'Understood, Dr. Jenkins.', type: 'ack' }]
    });

    process.history.push({
      week: process.weeksElapsed + 1,
      pacingChoice,
      stage: process.currentStage,
      result: `Setback / Relapse: +2 weeks added.`
    });
  } else {
    process.weeksElapsed += weeksToAdd;
    process.reInjuryRisk = riskPercent;

    if (pacingChoice === 'PUSH_HARD') {
      resultSummary = `Accelerated rehab week completed. Recovery speed boosted (+1.6 wks progress).`;
    } else if (pacingChoice === 'RECOMMENDED') {
      resultSummary = `Disciplined rehab week completed according to medical protocol (+1.0 wk progress).`;
    } else {
      resultSummary = `Cautious rehab week completed. Tissue strength built safely with zero risk.`;
    }

    process.history.push({
      week: Math.round(process.weeksElapsed),
      pacingChoice,
      stage: process.currentStage,
      result: resultSummary
    });
  }

  // Update current stage target completion
  let currentStageIdx = process.stages.findIndex(s => s.id === process.currentStage);
  if (currentStageIdx === -1) currentStageIdx = 0;

  let cumulativeNeeded = 0;
  for (let i = 0; i <= currentStageIdx; i++) {
    cumulativeNeeded += process.stages[i].targetWeeks;
  }

  // Check if advancing stage
  if (!sufferedRelapse && process.weeksElapsed >= cumulativeNeeded && currentStageIdx < process.stages.length - 1) {
    const oldStage = process.stages[currentStageIdx];
    currentStageIdx += 1;
    const newStage = process.stages[currentStageIdx];
    process.currentStage = newStage.id;
    process.medicalAdvice = getStageAdvice(newStage.id, process.injuryName);

    inboxMessages.push({
      id: `stage_clearance_${Date.now()}`,
      sender: 'MEDICAL CHIEF',
      subject: `📋 STAGE CLEARANCE: ${newStage.name}`,
      content: `Dr. Sarah Jenkins: "Great news! Your physical tests pass all criteria. You are now cleared to advance from ${oldStage.name} to Stage ${currentStageIdx + 1}: ${newStage.name}."`,
      read: false,
      type: 'MEDICAL',
      timestamp: 'MON 09:00',
      choices: [{ text: 'Great news!', type: 'ack' }]
    });
  }

  const remainingWeeks = Math.max(0, Math.ceil(process.totalWeeksEstimated - process.weeksElapsed));

  let updatedPlayer: Player = {
    ...player,
    injuryWeeksLeft: remainingWeeks,
    sharpness: Math.min(100, player.sharpness + sharpnessDelta),
    rehabProcess: process
  };

  // Check full clearance
  if (process.weeksElapsed >= process.totalWeeksEstimated) {
    updatedPlayer.isInjured = false;
    updatedPlayer.injuryWeeksLeft = 0;
    updatedPlayer.rehabProcess = undefined;

    const comebackTitle = `ACHIEVED MEDICAL CLEARANCE: ${process.injuryName}`;
    const comebackDesc = process.relapseCount === 0
      ? `Successfully completed all 4 rehab stages with flawless medical discipline. Returned to full competitive selection.`
      : `Overcame rehab setbacks (${process.relapseCount} relapse) and earned full clearance.`;

    timelineEvents.push({
      id: `rehab_cleared_${Date.now()}`,
      week: player.stats.apps, // or current week
      day: 'MON',
      type: 'MILESTONE',
      title: comebackTitle,
      description: comebackDesc,
      clubSymbol: player.currentClubSymbol
    });

    if (process.relapseCount === 0) {
      updatedPlayer.mediaPerception = Math.min(100, updatedPlayer.mediaPerception + 10);
      updatedPlayer.fans = Math.min(100, updatedPlayer.fans + 10);

      inboxMessages.push({
        id: `full_clearance_praise_${Date.now()}`,
        sender: 'PHYSICAL PERFORMANCE TEAM',
        subject: `🏆 FULL MEDICAL CLEARANCE: Return to Pitch`,
        content: `Dr. Sarah Jenkins: "You have passed all biomechanical, explosive power, and pitch-agility tests. You are 100% cleared for competitive first-team selection!"`,
        read: false,
        type: 'MEDICAL',
        timestamp: 'MON 09:00',
        choices: [{ text: 'Time to play.', type: 'ack' }]
      });
    } else {
      updatedPlayer.mediaPerception = Math.max(0, updatedPlayer.mediaPerception - 5);
      inboxMessages.push({
        id: `full_clearance_relapse_note_${Date.now()}`,
        sender: 'MEDICAL CHIEF',
        subject: `📋 MEDICAL CLEARANCE: Cleared After Relapses`,
        content: `Dr. Sarah Jenkins: "You are finally cleared for selection, though the relapses made the process longer than necessary. Take care of your body."`,
        read: false,
        type: 'MEDICAL',
        timestamp: 'MON 09:00',
        choices: [{ text: 'Understood.', type: 'ack' }]
      });
    }
  }

  return {
    updatedPlayer,
    inboxMessages,
    timelineEvents,
    resultSummary
  };
}

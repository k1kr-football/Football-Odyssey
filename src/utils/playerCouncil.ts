import { Player, DailyEvent } from '../types';

export function checkAndTriggerPlayerCouncil(player: Player, week: number): { event: DailyEvent | null; updatedPlayer?: Player } {
  // A Core Player / Vice-Captain / Captain gets Player Council events occasionally
  const isCoreOrHigher = ['Key Player', 'Star Player', 'Club Legend'].includes(player.contract.status);
  const isCaptain = !!player.stateFlags?.historyFlags?.['is_captain'];
  const isViceCaptain = !!player.stateFlags?.historyFlags?.['is_vice_captain'];

  const canParticipate = isCoreOrHigher || isCaptain || isViceCaptain;
  
  if (!canParticipate) return { event: null };

  // 5% chance per week
  if (Math.random() > 0.05) return { event: null };

  const councilEvents: DailyEvent[] = [
    {
      id: `council_tactical_${Date.now()}`,
      title: "Player Council: Tactical Concerns",
      description: "The senior players have called a closed-door meeting. They feel the manager's current tactical setup leaves the midfield completely exposed, and they want to present a unified front to ask for a change in shape. As a respected voice in the dressing room, they ask for your backing.",
      category: 'TEAMMATE',
      choices: [
        {
          text: "Back the senior players. We need to confront the manager.",
          actionType: "RUMBLE_CHOICE_council_back_players"
        },
        {
          text: "Defend the manager. We just need to execute the system better.",
          actionType: "RUMBLE_CHOICE_council_defend_manager"
        },
        {
          text: "Stay neutral. Tell them you'll focus on your own game.",
          actionType: "RUMBLE_CHOICE_council_neutral"
        }
      ]
    },
    {
      id: `council_bonus_${Date.now()}`,
      title: "Player Council: Win Bonus Dispute",
      description: "The club board has decided to alter the squad's collective win bonus structure for the upcoming cup run, effectively reducing the payout for younger fringe players while protecting the stars. The dressing room is furious. The captain wants to threaten a media leak.",
      category: 'TEAMMATE',
      choices: [
        {
          text: "Support the captain's threat. Protect the young players.",
          actionType: "RUMBLE_CHOICE_council_support_threat"
        },
        {
          text: "Propose a compromise. Let's negotiate quietly with the Sporting Director.",
          actionType: "RUMBLE_CHOICE_council_negotiate"
        },
        {
          text: "Tell them to shut up and play. We earn our money on the pitch.",
          actionType: "RUMBLE_CHOICE_council_shut_up"
        }
      ]
    }
  ];

  return { event: councilEvents[Math.floor(Math.random() * councilEvents.length)] };
}

export function checkCaptaincyProgression(player: Player, week: number): { updatedPlayer: Player; log: string[] } {
  let p = { ...player };
  let log: string[] = [];

  const peerRespect = p.reputation?.peerRespect || 50;
  const isKeyOrStar = ['Key Player', 'Star Player', 'Club Legend'].includes(p.contract.status);
  const tenure = (p.stats.apps || 0);

  const isCaptain = !!p.stateFlags?.historyFlags?.['is_captain'];
  const isViceCaptain = !!p.stateFlags?.historyFlags?.['is_vice_captain'];

  if (!isCaptain && !isViceCaptain && isKeyOrStar && peerRespect >= 70 && tenure >= 50 && Math.random() < 0.1) {
    p.stateFlags = {
      ...p.stateFlags,
      historyFlags: { ...(p.stateFlags?.historyFlags || {}), 'is_vice_captain': true }
    };
    log.push("You have been officially named the club's Vice-Captain, recognizing your growing leadership presence!");
    if (!p.timeline) p.timeline = [];
    p.timeline.push({
      id: `vice_captain_${Date.now()}`,
      week,
      day: 'MON',
      type: 'MILESTONE',
      title: '🎖️ Named Vice-Captain',
      description: `Appointed as Vice-Captain of ${p.currentClubSymbol} due to strong peer respect and consistent performances.`,
      clubSymbol: p.currentClubSymbol
    });
  } else if (isViceCaptain && !isCaptain && peerRespect >= 85 && p.trust >= 85 && tenure >= 100 && Math.random() < 0.05) {
    p.stateFlags = {
      ...p.stateFlags,
      historyFlags: { ...(p.stateFlags?.historyFlags || {}), 'is_captain': true }
    };
    log.push("The manager has handed you the Captain's armband permanently. You are now the leader of the squad!");
    if (!p.timeline) p.timeline = [];
    p.timeline.push({
      id: `captain_${Date.now()}`,
      week,
      day: 'MON',
      type: 'MILESTONE',
      title: '👑 Named Club Captain',
      description: `Given the permanent captain's armband at ${p.currentClubSymbol}. A massive career milestone.`,
      clubSymbol: p.currentClubSymbol
    });
  }

  // Captaincy loss
  if (isCaptain && (peerRespect < 50 || p.trust < 40) && Math.random() < 0.2) {
    p.stateFlags = {
      ...p.stateFlags,
      historyFlags: { ...(p.stateFlags?.historyFlags || {}), 'is_captain': false, 'lost_captaincy': true }
    };
    log.push("You have been stripped of the Captaincy due to poor relationships or trust.");
    if (!p.timeline) p.timeline = [];
    p.timeline.push({
      id: `lost_captain_${Date.now()}`,
      week,
      day: 'MON',
      type: "MILESTONE",
      title: '❌ Stripped of Captaincy',
      description: `The manager has removed you as club captain amid dressing room tension.`,
      clubSymbol: p.currentClubSymbol
    });
  }

  return { updatedPlayer: p, log };
}

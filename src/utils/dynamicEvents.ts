import { Player, TimelineEvent } from '../types';

export interface DynamicChoice {
  text: string;
  consequencesText: string;
  significance: 'MINOR' | 'MODERATE' | 'MAJOR' | 'DEFINING';
  impact: {
    fatigue?: number;
    morale?: number;
    trust?: number; // Manager trust
    fans?: number;
    mediaPerception?: number;
    cash?: number;
    relationships?: {
      manager?: number;
      teammates?: number;
      agent?: number;
      family?: number;
    };
    attributes?: {
      stamina?: number;
      strength?: number;
      pace?: number;
      passing?: number;
      firstTouch?: number;
      vision?: number;
      composure?: number;
      finishing?: number;
      dribbling?: number;
      tacticalAwareness?: number;
      decisionMaking?: number;
    };
    timelineEntry?: {
      title: string;
      description: string;
      type: 'MILESTONE' | 'TRANSFER' | 'INJURY';
    };
  };
}

export interface DynamicEvent {
  id: string;
  category: 'CLUB' | 'PERSONAL' | 'LEAGUE' | 'RANDOM';
  title: string;
  description: string;
  rarityWeight: number; // 1-10, with 10 being very common and 1 being extremely rare
  cooldownWeeks: number;
  triggerCondition: (player: Player, week: number) => boolean;
  choices: DynamicChoice[];
}

export const DYNAMIC_EVENT_POOL: DynamicEvent[] = [
  {
    id: 'evt_boot_deal',
    category: 'PERSONAL',
    title: 'Custom Boot Deal Approach',
    description: 'An up-and-coming domestic sportswear brand "Vortex Athletics" approaches your agent. They are offering a mid-tier boots endorsement contract, but they want you to wear their neon green boots which have a controversial reputation for poor traction.',
    rarityWeight: 8,
    cooldownWeeks: 20,
    triggerCondition: (player) => (player.reputation?.world || 0) >= 30 && player.finances?.balance !== undefined,
    choices: [
      {
        text: 'Accept deal (£5,000 upfront, but risk slippery matches)',
        consequencesText: 'You pocket the cash but teammates mock the style and you might feel slight traction loss in wet weather. (+£5k, +Teammates, -Focus)',
        significance: 'MODERATE',
        impact: {
          cash: 5000,
          morale: 5,
          relationships: { teammates: -4 },
          attributes: { firstTouch: -1 }
        }
      },
      {
        text: 'Hold out for a Tier-1 brand',
        consequencesText: 'You decline. Your agent is slightly annoyed, but your market purity remains intact. (+Agent relation decay, +Professional image)',
        significance: 'MINOR',
        impact: {
          relationships: { agent: -5 },
          mediaPerception: 5
        }
      }
    ]
  },
  {
    id: 'evt_gaming_session',
    category: 'PERSONAL',
    title: 'Late Night Gaming Stream',
    description: 'Some young prospects in the squad invite you to join their live Twitch gaming stream at midnight before a minor weekday tactical meeting. It would be great for teammate chemistry, but sleep will be cut short.',
    rarityWeight: 9,
    cooldownWeeks: 8,
    triggerCondition: (player) => (player.relationships?.teammates || 50) >= 40,
    choices: [
      {
        text: 'Join the stream and play till 3 AM',
        consequencesText: 'Teammate chemistry surges! However, you show up sleepy to tactical drills, irritating the manager. (+15 Teammates, -10 Manager Trust, +15 Fatigue)',
        significance: 'MODERATE',
        impact: {
          fatigue: 15,
          relationships: { teammates: 15 },
          trust: -10,
          attributes: { tacticalAwareness: -1 }
        }
      },
      {
        text: 'Decline and sleep early',
        consequencesText: 'You get a flawless night of rest. The prospects call you a "boomer" in the group chat, but your tactical prep is flawless. (-10 Fatigue, -5 Teammate Rapport)',
        significance: 'MINOR',
        impact: {
          fatigue: -10,
          relationships: { teammates: -5 },
          trust: 5
        }
      }
    ]
  },
  {
    id: 'evt_tactical_quiz',
    category: 'CLUB',
    title: 'The Gaffer\'s Quiz',
    description: 'The manager calls you into his office and hands you a tablet containing a deep-dive questionnaire about our transition shapes and defensive press lines. It\'s an unexpected test of your tactical focus.',
    rarityWeight: 7,
    cooldownWeeks: 12,
    triggerCondition: (player) => (player.relationships?.manager || 50) >= 30,
    choices: [
      {
        text: 'Stay up late studying and answer perfectly',
        consequencesText: 'The manager is thoroughly impressed with your cerebral approach to the game. (+12 Manager Trust, +2 Tactical Awareness, +10 Fatigue)',
        significance: 'MODERATE',
        impact: {
          fatigue: 10,
          trust: 12,
          attributes: { tacticalAwareness: 2 }
        }
      },
      {
        text: 'Wing it using generic answers',
        consequencesText: 'He sees right through it, sighing at your "lack of tactical discipline." (-8 Manager Trust, +5 Morale)',
        significance: 'MINOR',
        impact: {
          trust: -8,
          morale: 5
        }
      }
    ]
  },
  {
    id: 'evt_charity_marathon',
    category: 'CLUB',
    title: 'Hometown Charity Run',
    description: 'The club\'s foundation invites you to attend a local charity 5k fun-run. It is a fantastic PR opportunity, but it occurs on your scheduled day off and could cause mild physical strain.',
    rarityWeight: 6,
    cooldownWeeks: 16,
    triggerCondition: (player) => (player.reputation?.world || 0) >= 20,
    choices: [
      {
        text: 'Run the 5k with the local community',
        consequencesText: 'Fans absolutely adore the humble hometown gesture. Local papers run a lovely story. (+10 Fans, +5 Media, +12 Fatigue)',
        significance: 'MODERATE',
        impact: {
          fatigue: 12,
          fans: 10,
          mediaPerception: 5,
          timelineEntry: {
            title: '🏃 Charity Ambassador',
            description: 'Participated in a local charity community run, gaining massive respect.',
            type: 'MILESTONE'
          }
        }
      },
      {
        text: 'Attend but only stand in the greeting tent',
        consequencesText: 'You support the cause without running. Minimal fatigue, but the PR impact is modest. (+4 Fans, +2 Fatigue)',
        significance: 'MINOR',
        impact: {
          fatigue: 2,
          fans: 4
        }
      },
      {
        text: 'Politely decline to rest',
        consequencesText: 'You preserve full stamina, but the foundation director feels snubbed. (-5 Fans)',
        significance: 'MINOR',
        impact: {
          fans: -5
        }
      }
    ]
  },
  {
    id: 'evt_fan_confrontation',
    category: 'RANDOM',
    title: 'Car Park Confrontation',
    description: 'As you leave the training facility, an aggressive fan stands by your car, filming you on his phone. He heckles you, claiming your recent performances do not justify your wages.',
    rarityWeight: 5,
    cooldownWeeks: 10,
    triggerCondition: (player) => player.form < 50,
    choices: [
      {
        text: 'Ignore him, drive away silently',
        consequencesText: 'A disciplined, media-trained response. Keeps you clear of tabloid drama. (+4 Media, +5 Composure)',
        significance: 'MINOR',
        impact: {
          mediaPerception: 4,
          attributes: { composure: 1 }
        }
      },
      {
        text: 'Stop and explain your tactical role calmly',
        consequencesText: 'The fan is surprised by your humble, rational response. He stops filming, shakes your hand, and posts a positive viral clip. (+10 Fans, +8 Morale)',
        significance: 'MODERATE',
        impact: {
          fans: 10,
          morale: 8,
          attributes: { decisionMaking: 1 }
        }
      },
      {
        text: 'Snatch his phone and yell back',
        consequencesText: 'A PR disaster. Tabloids splash the video of the scuffle everywhere. The manager is furious with your lack of restraint. (-15 Manager Trust, -15 Media, -20 Fans)',
        significance: 'MAJOR',
        impact: {
          trust: -15,
          mediaPerception: -15,
          fans: -20,
          morale: -10,
          timelineEntry: {
            title: '🚨 Parking Lot Altercation',
            description: 'A clip went viral of you reacting aggressively to an internet heckler outside the grounds.',
            type: 'MILESTONE'
          }
        }
      }
    ]
  },
  {
    id: 'evt_tiktok_locker',
    category: 'PERSONAL',
    title: 'Viral Dressing Room Dance',
    description: 'A teammate wants to film you doing a trending dance on TikTok in the locker room using the club\'s official training kit as a prop.',
    rarityWeight: 8,
    cooldownWeeks: 6,
    triggerCondition: (player) => player.age < 26,
    choices: [
      {
        text: 'Do the dance with high energy',
        consequencesText: 'The video goes viral, earning you thousands of younger followers and expanding your fan brand. However, old-school pundits and the manager shake their heads at your "immaturity." (+15 Fans, -5 Manager Trust, +5 Morale)',
        significance: 'MODERATE',
        impact: {
          fans: 15,
          trust: -5,
          morale: 5,
          mediaPerception: -3
        }
      },
      {
        text: 'Decline and keep focus on the upcoming game',
        consequencesText: 'You maintain your serious, no-nonsense professional reputation. (+5 Manager Trust, -3 Fans)',
        significance: 'MINOR',
        impact: {
          trust: 5,
          fans: -3
        }
      }
    ]
  },
  {
    id: 'evt_pundit_slam',
    category: 'LEAGUE',
    title: 'Pundit\'s Scathing Critique',
    description: 'A highly respected former English Captain turned TV pundit analyzes your play on a popular Monday night show. He slams your defensive work rate, calling you a "luxury player who goes missing under pressure."',
    rarityWeight: 6,
    cooldownWeeks: 14,
    triggerCondition: (player) => (player.reputation?.world || 0) >= 40,
    choices: [
      {
        text: 'Post a fiery retort on Twitter',
        consequencesText: 'You defend your style aggressively. Fans love the drama, but the press feast on the feud. The manager tells you to log off. (-10 Media, +8 Fans, -5 Manager Trust)',
        significance: 'MODERATE',
        impact: {
          mediaPerception: -10,
          fans: 8,
          trust: -5
        }
      },
      {
        text: 'Stay silent and request extra defensive drill logs',
        consequencesText: 'You translate the criticism into grit. The manager is highly pleased with this professional response. (+10 Manager Trust, +1 Work Rate/Stamina, -5 Morale)',
        significance: 'MODERATE',
        impact: {
          trust: 10,
          morale: -5,
          attributes: { stamina: 1, composure: 1 }
        }
      }
    ]
  },
  {
    id: 'evt_tapped_restaurant',
    category: 'PERSONAL',
    title: 'Tapped Up in Mayfair',
    description: 'While dining at a high-end restaurant in London, an unregistered scout linked to a stronger division rival sits at your table. He slips you a napkin with a phone number, whispering about a backup striker role starting next window.',
    rarityWeight: 5,
    cooldownWeeks: 24,
    triggerCondition: (player) => (player.reputation?.world || 0) >= 50 && player.contract?.status !== 'Star Player',
    choices: [
      {
        text: 'Pocket the number and nod',
        consequencesText: 'You keep your options open. However, rumors of your dinner leak, causing mild friction in our dressing room. (+10 Agent relation, -10 Teammate Rapport)',
        significance: 'MODERATE',
        impact: {
          relationships: { agent: 10, teammates: -10 }
        }
      },
      {
        text: 'Politely refuse and tell him you are committed here',
        consequencesText: 'Extreme loyalty. Word gets back to your manager, cementing your reputation as a club standard-bearer. (+15 Manager Trust, +10 Teammates)',
        significance: 'MAJOR',
        impact: {
          trust: 15,
          relationships: { teammates: 10 },
          timelineEntry: {
            title: '🤝 Loyalty Declared',
            description: 'Refused a covert tapped-up approach from a rival club scout.',
            type: 'MILESTONE'
          }
        }
      }
    ]
  },
  {
    id: 'evt_extra_shooting',
    category: 'CLUB',
    title: 'The Golden Hour Drills',
    description: 'After standard drills are completed, several teammates challenge you to an extra, intensive cross-and-volley tournament. It\'s a fun chance to polish finishing, but your legs are already stiff.',
    rarityWeight: 10,
    cooldownWeeks: 4,
    triggerCondition: (player) => player.fatigue < 45,
    choices: [
      {
        text: 'Stay and drill (Gain Finishing/Pace, +15 Fatigue)',
        consequencesText: 'You smash several brilliant half-volleys into the top bin. Your shooting sharpness increases, but you feel heavy lactic acid. (+1 Finishing, +15 Fatigue, +5 Teammate Rapport)',
        significance: 'MODERATE',
        impact: {
          fatigue: 15,
          relationships: { teammates: 5 },
          attributes: { finishing: 1 }
        }
      },
      {
        text: 'Head straight to the ice bath',
        consequencesText: 'You prioritize physical preservation. Sensible, long-term discipline. (-8 Fatigue, -2 Teammate Rapport)',
        significance: 'MINOR',
        impact: {
          fatigue: -8,
          relationships: { teammates: -2 }
        }
      }
    ]
  },
  {
    id: 'evt_team_paintball',
    category: 'CLUB',
    title: 'High-Velocity Paintball',
    description: 'The squad organizes an unsanctioned Wednesday afternoon paintball outing to settle some dressing room debates. It\'s a brilliant bonding exercise, but the physical combat could lead to bruises.',
    rarityWeight: 4,
    cooldownWeeks: 18,
    triggerCondition: (player) => (player.relationships?.teammates || 50) >= 50,
    choices: [
      {
        text: 'Go all-out: Hunt down the Captain',
        consequencesText: 'You pull off a thrilling tactical flank, tagging the captain Reilly. The team roars with laughter. (+15 Teammate Rapport, +10 Morale, +8 Fatigue)',
        significance: 'MODERATE',
        impact: {
          fatigue: 8,
          morale: 10,
          relationships: { teammates: 15 }
        }
      },
      {
        text: 'Stay back as a sniper and chill',
        consequencesText: 'Safe play. You bond with the quiet reserve goalkeeper. (+5 Teammate Rapport)',
        significance: 'MINOR',
        impact: {
          relationships: { teammates: 5 }
        }
      },
      {
        text: 'Skip it to study team game tape',
        consequencesText: 'You stay in the tactical theater. Teammates call you a party-pooper, but the manager notices your diligence. (+5 Manager Trust, -5 Teammates)',
        significance: 'MINOR',
        impact: {
          trust: 5,
          relationships: { teammates: -5 }
        }
      }
    ]
  },
  {
    id: 'evt_school_talk',
    category: 'CLUB',
    title: 'Primary School Visit',
    description: 'The club PR officer asks you to visit a local inner-city school to speak to the kids about nutrition and determination. It\'s an early morning slot on your scheduled rest day.',
    rarityWeight: 7,
    cooldownWeeks: 10,
    triggerCondition: (player) => (player.reputation?.world || 0) >= 15,
    choices: [
      {
        text: 'Attend and inspire the kids',
        consequencesText: 'You sign autographs and give an elegant talk on fitness. The kids go wild. The club board is delighted with your community efforts. (+12 Fans, +6 Media, +5 Fatigue)',
        significance: 'MODERATE',
        impact: {
          fatigue: 5,
          fans: 12,
          mediaPerception: 6
        }
      },
      {
        text: 'Send a signed shirt instead',
        consequencesText: 'Saves your morning off, but has only a marginal community impact. (+3 Fans)',
        significance: 'MINOR',
        impact: {
          fans: 3
        }
      }
    ]
  },
  {
    id: 'evt_cryptic_like',
    category: 'PERSONAL',
    title: 'The Cryptic Twitter "Like"',
    description: 'You are scrolling social media late at night and accidentally double-tap a meme mocking the board\'s stingy transfer budget. It\'s screenshotted by a fan account before you can unlike it.',
    rarityWeight: 5,
    cooldownWeeks: 12,
    triggerCondition: (player) => player.morale < 65,
    choices: [
      {
        text: 'Issue a formal statement blaming your cousin',
        consequencesText: 'A clumsy excuse that the tabloids giggle at, but it defuses official board anger. (-4 Media, +2 Manager Trust)',
        significance: 'MINOR',
        impact: {
          mediaPerception: -4,
          trust: 2
        }
      },
      {
        text: 'Leave it. Say nothing.',
        consequencesText: 'The media interprets this as silent defiance. Fans love the attitude, but the manager is highly tense. (+10 Fans, -10 Manager Trust, -5 Media)',
        significance: 'MODERATE',
        impact: {
          fans: 10,
          trust: -10,
          mediaPerception: -5
        }
      }
    ]
  },
  {
    id: 'evt_hometown_meet',
    category: 'PERSONAL',
    title: 'Hometown Civic Honor',
    description: 'Your childhood grassroots club, "Clayton Rovers," invites you to open their new artificial mini-pitch. It is a heartwarming homecoming, but it involves a long train ride.',
    rarityWeight: 4,
    cooldownWeeks: 24,
    triggerCondition: (player) => (player.reputation?.world || 0) >= 30,
    choices: [
      {
        text: 'Travel home and open the pitch',
        consequencesText: 'An emotional, beautiful day. You take photos with the local kids. A massive boost to your core organic following. (+15 Fans, +8 Morale, +10 Fatigue)',
        significance: 'MODERATE',
        impact: {
          fatigue: 10,
          morale: 8,
          fans: 15,
          timelineEntry: {
            title: '🏡 Roots Remembered',
            description: 'Returned to open a new artificial grass facility at your boyhood grassroots club.',
            type: 'MILESTONE'
          }
        }
      },
      {
        text: 'Send a video message greeting',
        consequencesText: 'They are still very grateful, and you save yourself the physical travel. (+5 Fans)',
        significance: 'MINOR',
        impact: {
          fans: 5
        }
      }
    ]
  },
  {
    id: 'evt_unwanted_podcast',
    category: 'LEAGUE',
    title: 'The Unfiltered Podcast Pitch',
    description: 'A highly viral, controversial football podcast hosted by former banter-heavy players invites you for an hours-long live episode. They promise raw questions, a massive viewer spike, and no media filters.',
    rarityWeight: 5,
    cooldownWeeks: 16,
    triggerCondition: (player) => (player.reputation?.world || 0) >= 45,
    choices: [
      {
        text: 'Do the episode: Speak completely raw',
        consequencesText: 'You drop several hilarious locker room anecdotes. Standard media networks are stunned; younger fans make thousands of TikTok clips. (+25 Fans, -15 Media, -10 Manager Trust, +5 Fatigue)',
        significance: 'MAJOR',
        impact: {
          fatigue: 5,
          fans: 25,
          mediaPerception: -15,
          trust: -10,
          morale: 10,
          timelineEntry: {
            title: '🎙️ Unfiltered Podcast Appearance',
            description: 'Appeared on an unfiltered live podcast, causing a major public stir.',
            type: 'MILESTONE'
          }
        }
      },
      {
        text: 'Politely refuse: Suggest a standard club interview',
        consequencesText: 'You keep to clean, safe corporate channels. Pundits praise your maturity. (+8 Media, +5 Manager Trust, -5 Fans)',
        significance: 'MODERATE',
        impact: {
          mediaPerception: 8,
          trust: 5,
          fans: -5
        }
      }
    ]
  },
  {
    id: 'evt_supercar_shoot',
    category: 'PERSONAL',
    title: 'The Supercar Photo Shoot',
    description: 'A luxury car hire agency wants you to pose next to their customized gold Lamborghini for an Instagram campaign, offering £3,000 and free weekend rental.',
    rarityWeight: 6,
    cooldownWeeks: 14,
    triggerCondition: (player) => (player.reputation?.world || 0) >= 35,
    choices: [
      {
        text: 'Pose with the Lambo (£3,000 + Morale)',
        consequencesText: 'A highly flashy, flashy lifestyle post. It increases your glamorous appeal, but old-school supporters roll their eyes. (+£3,000, +10 Fans, -5 Media, +8 Morale)',
        significance: 'MODERATE',
        impact: {
          cash: 3000,
          fans: 10,
          mediaPerception: -5,
          morale: 8
        }
      },
      {
        text: 'Refuse the shoot: Avoid "flashy player" labels',
        consequencesText: 'You avoid the superficial hype machine, keeping a focused image. (+5 Composure)',
        significance: 'MINOR',
        impact: {
          attributes: { composure: 1 }
        }
      }
    ]
  }
];

/**
 * Triggers a context-aware calendar event based on current player state and cooldown checks.
 */
export function checkAndTriggerDynamicEvent(player: Player, week: number): { event: DynamicEvent | null } {
  // 1. Check event cooldowns
  const lastEventWeek = player.stateFlags?.eventCooldowns?.lastDynamicEventWeek || 0;
  if (week - lastEventWeek < 3) {
    // Rigid cooldown: no more than one major dynamic event every 3 weeks
    return { event: null };
  }

  // 2. Filter eligible events
  const eligibleEvents = DYNAMIC_EVENT_POOL.filter(evt => {
    // Check specific event cooldown
    const eventCooldown = player.stateFlags?.eventCooldowns?.[evt.id] || 0;
    if (eventCooldown > 0) return false;

    // Evaluate trigger condition
    try {
      return evt.triggerCondition(player, week);
    } catch (err) {
      return false;
    }
  });

  if (eligibleEvents.length === 0) {
    return { event: null };
  }

  // 3. Roll based on rarity weightings
  const totalWeight = eligibleEvents.reduce((sum, e) => sum + e.rarityWeight, 0);
  let roll = Math.random() * totalWeight;
  
  let selectedEvent: DynamicEvent = eligibleEvents[0];
  for (const evt of eligibleEvents) {
    roll -= evt.rarityWeight;
    if (roll <= 0) {
      selectedEvent = evt;
      break;
    }
  }

  return { event: selectedEvent };
}

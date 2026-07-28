import { DailyEvent } from '../../types';
import { GameState } from '../../store/GameContext';

export interface TrainingDramaChoice {
  text: string;
  description: string;
  effect: (s: GameState) => Partial<GameState>;
}

export interface TrainingDramaEvent {
  id: string;
  title: string;
  description: string;
  choices: TrainingDramaChoice[];
}

export const TRAINING_DRAMA_EVENTS: TrainingDramaEvent[] = [
  {
    id: "dram_vet_tackle",
    title: "⚔️ Training Ground Drama: The Veteran's Challenge",
    description: "During tactical 11v11 shadow play, senior center-back Craig Morrison lunges in with a late sliding challenge on wet turf, sending you flying into the mud. He stands over you: 'Get up, kid. Men's football is played on your feet.'",
    choices: [
      {
        text: "Square up and shove him back",
        description: "Stand your ground. Show the squad you won't be intimidated.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.morale = Math.min(100, p.morale + 10);
          p.relationships = {
            ...p.relationships,
            teammates: Math.max(0, p.relationships.teammates - 5),
            manager_discipline: Math.max(0, (p.relationships?.manager_discipline || 50) - 5)
          };
          p.stateFlags = {
            ...p.stateFlags,
            feudWithMorrison: true,
            confrontedVeteran: true,
            drama_done_dram_vet_tackle: true
          };
          const newInbox = [...s.inbox, {
            id: `drama_vet_${Date.now()}`,
            sender: 'ASSISTANT MANAGER',
            subject: 'Training Ground Scuffle ⚔️',
            content: `You squared up to Craig Morrison after a heavy challenge. The boys respected your fight, but the coaching staff noted the lack of restraint. Expect extra eyes on your discipline.`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 16:30`,
            choices: [{ text: 'Noted.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      },
      {
        text: "Spring up, offer a hand, and win the next 50/50 ball cleanly",
        description: "Keep your composure and let your performance answer.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.trust = Math.min(100, p.trust + 8);
          p.relationships = {
            ...p.relationships,
            teammates: Math.min(100, p.relationships.teammates + 6),
            manager: Math.min(100, p.relationships.manager + 5)
          };
          p.attributes = {
            ...p.attributes,
            composure: Math.min(99, Number(((p.attributes.composure || 50) + 0.5).toFixed(2)))
          };
          p.stateFlags = {
            ...p.stateFlags,
            respectedByVeterans: true,
            drama_done_dram_vet_tackle: true
          };
          const newInbox = [...s.inbox, {
            id: `drama_vet_${Date.now()}`,
            sender: 'COACHING STAFF',
            subject: 'Outstanding Professionalism in Training 📈',
            content: `Brilliant reaction to Morrison's late tackle. You bounced right up, shook it off, and won the ball cleanly on the next play. The Manager loved the pro mentality! (+8 Manager Trust, +6 Teammate Chemistry, +0.5 Composure).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 16:30`,
            choices: [{ text: 'Focus on the team.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      },
      {
        text: "Stay down to catch your breath and protect your joints",
        description: "Avoid escalation and conserve energy.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.fatigue = Math.max(0, p.fatigue - 8);
          p.morale = Math.max(0, p.morale - 4);
          p.stateFlags = { ...p.stateFlags, drama_done_dram_vet_tackle: true };
          const newInbox = [...s.inbox, {
            id: `drama_vet_${Date.now()}`,
            sender: 'PHYSIO ROOM',
            subject: 'Knock Monitored (-8% Fatigue)',
            content: `You rested for a moment after the heavy contact. Ankle is fine, and physical fatigue was saved (-8%), though the senior players bantered you on the bench.`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 16:30`,
            choices: [{ text: 'All good.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      }
    ]
  },
  {
    id: "dram_freestyle_bet",
    title: "⚽ Training Ground Drama: Locker Room Freestyle Wager",
    description: "Before warm-ups, squad wingers are playing head-volleys over a bench. Jordan Cole winks: 'A hundred quid says the new boy can't pull off 5 around-the-world juggles right now. You up for a flutter?'",
    choices: [
      {
        text: "Accept the £100 wager",
        description: "Test your skill and win over the squad (£100 bet).",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          const hasSkill = (p.attributes?.dribbling || 50) > 58 || p.backstory === "STREET_PRODIGY";
          p.finances = { ...p.finances, expenses: p.finances.expenses || { housing: 0, training: 0, lifestyle: 0, family: 0 } };
          
          if (hasSkill) {
            p.finances.balance += 100;
            p.morale = Math.min(100, p.morale + 15);
            p.relationships = {
              ...p.relationships,
              teammates: Math.min(100, p.relationships.teammates + 10)
            };
            p.attributes = {
              ...p.attributes,
              dribbling: Math.min(99, Number(((p.attributes.dribbling || 50) + 0.5).toFixed(2)))
            };
            p.stateFlags = { ...p.stateFlags, freestyleMaster: true, drama_done_dram_freestyle_bet: true };
            const newInbox = [...s.inbox, {
              id: `drama_freestyle_${Date.now()}`,
              sender: 'DRESSING ROOM CHAT',
              subject: 'Freestyle Wager Won! 💰',
              content: `You flicked the ball up and effortlessly executed five around-the-world tricks! The squad went wild. You pocketed £100 from Jordan Cole and earned huge dressing room respect (+10 Teammate Chemistry, +15 Morale).`,
              read: false,
              type: 'DM' as const,
              timestamp: `${s.currentDay} 10:15`,
              choices: [{ text: 'Easy money!', type: 'ack' as const }]
            }];
            return { player: p, inbox: newInbox };
          } else {
            p.finances.balance -= 100;
            p.morale = Math.max(0, p.morale - 8);
            p.stateFlags = { ...p.stateFlags, freestyleFailed: true, drama_done_dram_freestyle_bet: true };
            const newInbox = [...s.inbox, {
              id: `drama_freestyle_${Date.now()}`,
              sender: 'DRESSING ROOM CHAT',
              subject: 'Freestyle Wager Lost 💸',
              content: `You dropped the ball on the third juggle! The squad roasted you and Jordan Cole collected your £100. (-£100, -8 Morale).`,
              read: false,
              type: 'DM' as const,
              timestamp: `${s.currentDay} 10:15`,
              choices: [{ text: 'Practice more.', type: 'ack' as const }]
            }];
            return { player: p, inbox: newInbox };
          }
        }
      },
      {
        text: "Decline and head straight for the ice baths",
        description: "Focus strictly on professional recovery.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.fatigue = Math.max(0, p.fatigue - 8);
          p.attributes = {
            ...p.attributes,
            composure: Math.min(99, Number(((p.attributes.composure || 50) + 0.5).toFixed(2)))
          };
          p.stateFlags = { ...p.stateFlags, disciplinedRecovery: true, drama_done_dram_freestyle_bet: true };
          const newInbox = [...s.inbox, {
            id: `drama_freestyle_${Date.now()}`,
            sender: 'PHYSIO ROOM',
            subject: 'Recovery Routine Focus (-8% Fatigue)',
            content: `You skipped the dressing room bet and completed cold-water recovery instead (-8% Fatigue, +0.5 Composure).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 10:15`,
            choices: [{ text: 'Recovery comes first.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      }
    ]
  },
  {
    id: "dram_tactical_dispute",
    title: "📋 Training Ground Drama: Manager's Tactical Callout",
    description: "During 11v11 shadow play, the Manager blows the whistle and points at you: 'You're drifting out of position! Stay disciplined in your tactical channel or sit on the bench!'",
    choices: [
      {
        text: "Apologize and strictly adhere to your assigned zone",
        description: "Show tactical discipline and compliance.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.trust = Math.min(100, p.trust + 10);
          p.attributes = {
            ...p.attributes,
            positioning: Math.min(99, Number(((p.attributes.positioning || 50) + 0.5).toFixed(2)))
          };
          p.stateFlags = { ...p.stateFlags, tacticalDisciplined: true, drama_done_dram_tactical_dispute: true };
          const newInbox = [...s.inbox, {
            id: `drama_tactical_${Date.now()}`,
            sender: 'TACTICAL BOARD',
            subject: 'Tactical Compliance Noted 📋',
            content: `The Manager noted your quick adjustment in training. Your positional discipline was praised during video review (+10 Manager Trust, +0.5 Positioning).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 15:00`,
            choices: [{ text: 'Understood, Boss.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      },
      {
        text: "Respectfully explain that roaming creates passing overloads",
        description: "Share your tactical vision with the gaffer.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          const highVision = (p.attributes?.vision || 50) > 60 || (p.attributes?.passing || 50) > 60;
          if (highVision) {
            p.trust = Math.min(100, p.trust + 6);
            p.relationships = {
              ...p.relationships,
              teammates: Math.min(100, p.relationships.teammates + 5)
            };
            p.attributes = {
              ...p.attributes,
              vision: Math.min(99, Number(((p.attributes.vision || 50) + 0.5).toFixed(2)))
            };
            p.stateFlags = { ...p.stateFlags, tacticalMastermind: true, drama_done_dram_tactical_dispute: true };
            const newInbox = [...s.inbox, {
              id: `drama_tactical_${Date.now()}`,
              sender: 'MANAGER',
              subject: 'Tactical Discussion Outcome 💡',
              content: `'Good point, son.' The Manager listened to your reasoning about spatial overloads and modified the pressing line to accommodate your movement (+6 Manager Trust, +5 Teammates, +0.5 Vision).`,
              read: false,
              type: 'DM' as const,
              timestamp: `${s.currentDay} 15:00`,
              choices: [{ text: 'Glad we agree.', type: 'ack' as const }]
            }];
            return { player: p, inbox: newInbox };
          } else {
            p.trust = Math.max(0, p.trust - 10);
            p.relationships = {
              ...p.relationships,
              manager: Math.max(0, p.relationships.manager - 8)
            };
            p.stateFlags = { ...p.stateFlags, managerClash: true, drama_done_dram_tactical_dispute: true };
            const newInbox = [...s.inbox, {
              id: `drama_tactical_${Date.now()}`,
              sender: 'MANAGER',
              subject: 'Reprimand for Tactical Disobedience ⚠️',
              content: `The Manager didn't appreciate backtalk during drills. 'When I tell you to hold your zone, you hold it!' (-10 Manager Trust).`,
              read: false,
              type: 'DM' as const,
              timestamp: `${s.currentDay} 15:00`,
              choices: [{ text: 'Apologize.', type: 'ack' as const }]
            }];
            return { player: p, inbox: newInbox };
          }
        }
      }
    ]
  },
  {
    id: "dram_academy_rookie",
    title: "🤝 Training Ground Drama: Academy Prospect Mentorship",
    description: "17-year-old academy prospect Liam Vance is visibly shaking during crossing drills after misplacing three passes under the head coach's watchful eyes.",
    choices: [
      {
        text: "Stay back 20 mins after training to practice crossing with him",
        description: "Invest time to mentor the young prospect.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.relationships = {
            ...p.relationships,
            teammates: Math.min(100, p.relationships.teammates + 10)
          };
          p.trust = Math.min(100, p.trust + 8);
          p.morale = Math.min(100, p.morale + 12);
          p.fatigue = Math.min(100, p.fatigue + 5);
          p.attributes = {
            ...p.attributes,
            passing: Math.min(99, Number(((p.attributes.passing || 50) + 0.5).toFixed(2)))
          };
          p.stateFlags = { ...p.stateFlags, mentoredVance: true, drama_done_dram_academy_rookie: true };
          const newInbox = [...s.inbox, {
            id: `drama_vance_${Date.now()}`,
            sender: 'LIAM VANCE (ACADEMY)',
            subject: 'Thank You Mate! 🙌',
            content: `'Mate, thank you so much for staying late with me today. My crossing felt way cleaner after your pointers. I won't forget it!' (+10 Teammate Chemistry, +8 Manager Trust, +12 Morale).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 17:00`,
            choices: [{ text: 'Keep working hard, kid.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      },
      {
        text: "Focus strictly on your personal recovery protocol",
        description: "Prioritize your own physical preparation.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.fatigue = Math.max(0, p.fatigue - 5);
          p.stateFlags = { ...p.stateFlags, drama_done_dram_academy_rookie: true };
          const newInbox = [...s.inbox, {
            id: `drama_vance_${Date.now()}`,
            sender: 'PHYSIO ROOM',
            subject: 'Post-Training Recovery Complete',
            content: `You completed your planned muscle stretches and ice therapy on schedule (-5% Fatigue).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 17:00`,
            choices: [{ text: 'Good session.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      }
    ]
  },
  {
    id: "dram_scout_fence",
    title: "🕵️‍♂️ Training Ground Drama: The Trench-Coat Scout",
    description: "As training wraps up, a man in a dark coat taking notes behind the fence catches your eye. You recognize him—a senior scout for a division rival.",
    choices: [
      {
        text: "Put on a flashy solo shooting display in front of him",
        description: "Give him something to report back to his sporting director.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.reputation = {
            ...p.reputation,
            league: Math.min(100, (p.reputation?.league || 50) + 15)
          };
          p.trust = Math.max(0, p.trust - 8);
          p.attributes = {
            ...p.attributes,
            finishing: Math.min(99, Number(((p.attributes.finishing || 50) + 0.5).toFixed(2)))
          };
          p.stateFlags = { ...p.stateFlags, scoutImpressed: true, drama_done_dram_scout_fence: true };
          const newInbox = [...s.inbox, {
            id: `drama_scout_${Date.now()}`,
            sender: 'AGENT / MEDIA RADAR',
            subject: 'Scouting Attention Heightened 📡',
            content: `You smashed five absolute screamers into the top corner while the rival scout took notes! Gained +15 League Reputation, though your Manager frowned at the showboating (-8 Trust).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 16:30`,
            choices: [{ text: 'Let them watch.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      },
      {
        text: "Execute team passing patterns impeccably",
        description: "Show pro-level tactical maturity and work rate.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.trust = Math.min(100, p.trust + 12);
          p.relationships = {
            ...p.relationships,
            teammates: Math.min(100, p.relationships.teammates + 8)
          };
          p.attributes = {
            ...p.attributes,
            passing: Math.min(99, Number(((p.attributes.passing || 50) + 0.5).toFixed(2)))
          };
          p.stateFlags = { ...p.stateFlags, modelProfessional: true, drama_done_dram_scout_fence: true };
          const newInbox = [...s.inbox, {
            id: `drama_scout_${Date.now()}`,
            sender: 'COACHING STAFF',
            subject: 'Flawless Application in Drills 🌟',
            content: `You ignored the outside distraction and executed defensive transitions to perfection. The Manager pulled you aside: 'Love the pro mindset today.' (+12 Manager Trust, +8 Teammate Chemistry).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 16:30`,
            choices: [{ text: 'Team comes first.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      }
    ]
  },
  {
    id: "dram_freekick_challenge",
    title: "🎯 Training Ground Drama: Post-Training Free-Kick Duel",
    description: "The team captain sets up a wall of mannequins at 25 yards: 'Best of three free-kicks over the wall. Winner takes £250 and dibs on matchday set-pieces.'",
    choices: [
      {
        text: "Take on the Captain in the set-piece duel",
        description: "Challenge the captain for set-piece dominance (£250 bet).",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          const isDeadly = (p.attributes?.finishing || 50) > 62 || (p.attributes?.passing || 50) > 62;
          p.finances = { ...p.finances, expenses: p.finances.expenses || { housing: 0, training: 0, lifestyle: 0, family: 0 } };

          if (isDeadly) {
            p.finances.balance += 250;
            p.morale = Math.min(100, p.morale + 15);
            p.relationships = {
              ...p.relationships,
              teammates: Math.min(100, p.relationships.teammates + 10)
            };
            p.stateFlags = { ...p.stateFlags, setPieceKing: true, drama_done_dram_freekick_challenge: true };
            const newInbox = [...s.inbox, {
              id: `drama_fk_${Date.now()}`,
              sender: 'TEAM CAPTAIN',
              subject: 'Set-Piece Duel Defeat 🎯',
              content: `'Unbelievable technique, mate!' You curled two absolute postage-stamp free-kicks past the keeper to beat the Captain! Won £250 and earned set-piece respect (+10 Teammate Chemistry, +15 Morale).`,
              read: false,
              type: 'DM' as const,
              timestamp: `${s.currentDay} 17:15`,
              choices: [{ text: 'I take the free-kicks now.', type: 'ack' as const }]
            }];
            return { player: p, inbox: newInbox };
          } else {
            p.finances.balance -= 250;
            p.morale = Math.max(0, p.morale - 5);
            p.relationships = {
              ...p.relationships,
              teammates: Math.min(100, p.relationships.teammates + 5)
            };
            p.stateFlags = { ...p.stateFlags, drama_done_dram_freekick_challenge: true };
            const newInbox = [...s.inbox, {
              id: `drama_fk_${Date.now()}`,
              sender: 'TEAM CAPTAIN',
              subject: 'Set-Piece Duel Victory 🎯',
              content: `The Captain clipped two clean free-kicks into the top corner while your second effort hit the wall. You lost £250, but the Captain slapped your back: 'Fair play for stepping up, kid.' (+5 Teammate Chemistry).`,
              read: false,
              type: 'DM' as const,
              timestamp: `${s.currentDay} 17:15`,
              choices: [{ text: 'Next time.', type: 'ack' as const }]
            }];
            return { player: p, inbox: newInbox };
          }
        }
      },
      {
        text: "Defer respectfully to the Captain's experience",
        description: "Maintain squad hierarchy harmony.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.relationships = {
            ...p.relationships,
            teammates: Math.min(100, p.relationships.teammates + 5),
            manager_discipline: Math.min(100, (p.relationships?.manager_discipline || 50) + 5)
          };
          p.stateFlags = { ...p.stateFlags, drama_done_dram_freekick_challenge: true };
          const newInbox = [...s.inbox, {
            id: `drama_fk_${Date.now()}`,
            sender: 'TEAM CAPTAIN',
            subject: 'Respectful Hierarchy',
            content: `You watched the Captain practice his set-pieces and offered ball-retrieval help. The senior leadership appreciated your humility (+5 Teammate Chemistry).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 17:15`,
            choices: [{ text: 'Team unity.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      }
    ]
  },
  {
    id: "dram_rain_sliding",
    title: "🌧️ Training Ground Drama: Rain-Soaked Sliding Challenge",
    description: "Torrential downpours turn the training pitch into a mudbath. The fitness coach orders double-sprint sliding tackles across the wet turf.",
    choices: [
      {
        text: "Go 100% full-throttle in the mud",
        description: "Give everything despite the rain and mud.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.trust = Math.min(100, p.trust + 10);
          p.morale = Math.min(100, p.morale + 8);
          p.fatigue = Math.min(100, p.fatigue + 10);
          p.attributes = {
            ...p.attributes,
            strength: Math.min(99, Number(((p.attributes.strength || 50) + 0.5).toFixed(2)))
          };
          p.stateFlags = { ...p.stateFlags, mudWarrior: true, drama_done_dram_rain_sliding: true };
          const newInbox = [...s.inbox, {
            id: `drama_mud_${Date.now()}`,
            sender: 'FITNESS COACH',
            subject: 'Relentless Work Ethic 🌧️',
            content: `The fitness coach hailed your warrior mentality in torrential conditions! You slid through every challenge with 100% commitment (+10 Manager Trust, +8 Morale, +0.5 Strength).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 16:00`,
            choices: [{ text: 'No rain stops us.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      },
      {
        text: "Pace yourself carefully to avoid muscle strain",
        description: "Protect your body in slippery conditions.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.fatigue = Math.max(0, p.fatigue - 5);
          p.trust = Math.max(0, p.trust - 3);
          p.stateFlags = { ...p.stateFlags, drama_done_dram_rain_sliding: true };
          const newInbox = [...s.inbox, {
            id: `drama_mud_${Date.now()}`,
            sender: 'PHYSIO ROOM',
            subject: 'Cautious Session Completion',
            content: `You completed the wet session cautiously to prevent muscle pulls (-5% Fatigue).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 16:00`,
            choices: [{ text: 'Stay safe.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      }
    ]
  },
  {
    id: "dram_media_leak",
    title: "📱 Training Ground Drama: Dressing Room TikTok Blooper",
    description: "A teammate captured video of you tripping over a cone during warmups and threatens to post the hilarious clip online.",
    choices: [
      {
        text: "Embrace it with self-deprecating humor and repost it",
        description: "Show your personality and connect with fans.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.fans = Math.min(100, (p.fans || 50) + 10);
          p.relationships = {
            ...p.relationships,
            teammates: Math.min(100, p.relationships.teammates + 8)
          };
          p.reputation = {
            ...p.reputation,
            media: Math.min(100, (p.reputation?.media || 50) + 8)
          };
          p.stateFlags = { ...p.stateFlags, viralMeme: true, drama_done_dram_media_leak: true };
          const newInbox = [...s.inbox, {
            id: `drama_tiktok_${Date.now()}`,
            sender: 'SOCIAL MEDIA TEAM',
            subject: 'Viral Humor Hit! 📱',
            content: `The fans loved your self-deprecating caption on the warmup blooper! The clip racked up 500k views and boosted your popularity (+10 Fan favor, +8 Teammate Chemistry, +8 Media perception).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 18:00`,
            choices: [{ text: 'Gotta laugh at yourself!', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      },
      {
        text: "Tell him sternly to delete it before the Manager sees",
        description: "Maintain a strict professional image.",
        effect: (s: GameState) => {
          if (!s.player) return {};
          const p = { ...s.player };
          p.trust = Math.min(100, p.trust + 5);
          p.relationships = {
            ...p.relationships,
            teammates: Math.max(0, p.relationships.teammates - 4)
          };
          p.stateFlags = { ...p.stateFlags, drama_done_dram_media_leak: true };
          const newInbox = [...s.inbox, {
            id: `drama_tiktok_${Date.now()}`,
            sender: 'COACHING STAFF',
            subject: 'Strict Discipline Maintained',
            content: `You kept dressing room footage off social media. The Manager values high operational privacy (+5 Manager Trust).`,
            read: false,
            type: 'DM' as const,
            timestamp: `${s.currentDay} 18:00`,
            choices: [{ text: 'Keep focus on pitch.', type: 'ack' as const }]
          }];
          return { player: p, inbox: newInbox };
        }
      }
    ]
  }
];

export function getRandomTrainingDramaEvent(s: GameState): DailyEvent | null {
  if (!s.player) return null;
  const eligible = TRAINING_DRAMA_EVENTS.filter(evt => {
    const doneKey = `drama_done_${evt.id}`;
    return !s.player?.stateFlags?.[doneKey];
  });

  const pool = eligible.length > 0 ? eligible : TRAINING_DRAMA_EVENTS;
  const drama = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `TRAINING_DRAMA_${drama.id}`,
    title: drama.title,
    description: drama.description,
    category: 'TRAINING',
    choices: drama.choices.map((c, idx) => ({
      text: c.text,
      actionType: `ENGINE_CHOICE_TRAINING_DRAMA_${drama.id}_${idx}`
    }))
  };
}

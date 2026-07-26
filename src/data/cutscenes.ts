import { GameState } from '../store/GameContext';
import { Player } from '../types';

export type CutsceneCategory = 'ORIGIN' | 'MILESTONE' | 'ARC';

export interface CutsceneLine {
  speaker?: string;
  text: string;
}

export interface CutsceneChoice {
  text: string;
  description?: string;
  onSelect: (updatePlayer: (updates: Partial<Player>) => void, setFlag: (key: string, val: any) => void) => void;
}

export interface CutsceneDef {
  id: string;
  title: string;
  category: CutsceneCategory;
  checkTrigger: (state: GameState) => boolean;
  getLines: (state: GameState) => CutsceneLine[];
  getChoices?: (state: GameState) => CutsceneChoice[];
}

export const CUTSCENES: CutsceneDef[] = [
  // 1. ORIGIN CUTSCENE: ACADEMY GRADUATE
  {
    id: 'origin_academy_graduate',
    title: 'The Weight of the Shirt',
    category: 'ORIGIN',
    checkTrigger: (state) => (state.player?.stats?.apps || 0) >= 1 && state.player?.backstory === 'ACADEMY_GRADUATE' && !(state.unlockedCutscenes || []).some(c => c.id === 'origin_academy_graduate'),
    getLines: (state) => {
      const p = state.player!;
      const pos = p.position;
      return [
        { text: `You've been walking these same corridors since you were nine years old.` },
        { text: `The smell of deep heat in the dressing room. The familiar scuff marks on the tunnel walls.` },
        { speaker: 'Youth Coach Davies', text: `"You're not a kid anymore, ${p.lastName}. They're watching you out there today. The gaffer needs to know if you're ready for men's football, or if you're just another academy ghost."` },
        { text: `Your first professional contract is signed. The ink is barely dry.` },
        { speaker: 'Youth Coach Davies', text: `"Play your game. Show them why you were the best ${pos} in the under-21s. Don't let the occasion play you."` }
      ];
    },
    getChoices: (state) => [
      {
        text: '"I am ready. I\'ll show them."',
        description: 'Start with higher Morale and Confidence, but slightly lower Teammate relationship.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ morale: Math.min(100, (state.player?.morale || 50) + 15) });
          setFlag('origin_academy_attitude', 'confident');
        }
      },
      {
        text: '"I\'ll keep my head down and work hard."',
        description: 'Gain immediate Manager Trust and Teammate respect, but average Morale.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ trust: Math.min(100, (state.player?.trust || 50) + 10) });
          setFlag('origin_academy_attitude', 'humble');
        }
      }
    ]
  },

  // 1b. ORIGIN CUTSCENE: STREET PRODIGY
  {
    id: 'origin_street_prodigy',
    title: 'Tarmac to Turf',
    category: 'ORIGIN',
    checkTrigger: (state) => (state.player?.stats?.apps || 0) >= 1 && state.player?.backstory === 'STREET_PRODIGY' && !(state.unlockedCutscenes || []).some(c => c.id === 'origin_street_prodigy'),
    getLines: (state) => {
      const p = state.player!;
      return [
        { text: `Your first professional appearance is in the books. The stadium lights are nothing like the streetlamps of Accra or Lagos.` },
        { text: `The grass was perfectly manicured, the boots brand new. No dust in your eyes. No concrete scraped knees.` },
        { speaker: 'Senior Midfielder Kane', text: `"You've got some serious trickery, kid. Passing makes the ball travel faster than any run. Release it quicker."` },
        { text: `You look down at your boots. You can still hear the voices of the neighborhood betting on your 1v1s.` },
        { speaker: 'Manager', text: `"Play with flair, but respect the system. We win together, not through solo exhibitions."` }
      ];
    },
    getChoices: (state) => [
      {
        text: '"My style is what got me here. I\'m not changing."',
        description: 'Gain Morale, but slightly drop Manager Trust.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ 
            morale: Math.min(100, (state.player?.morale || 50) + 15),
            trust: Math.max(0, (state.player?.trust || 50) - 10)
          });
          setFlag('origin_street_attitude', 'rebel');
        }
      },
      {
        text: '"I\'ll adapt. I want to win."',
        description: 'Gain Manager Trust and improve relationship with teammates.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ 
            trust: Math.min(100, (state.player?.trust || 50) + 12)
          });
          setFlag('origin_street_attitude', 'team_player');
        }
      }
    ]
  },

  // 1c. ORIGIN CUTSCENE: FALLEN PRODIGY
  {
    id: 'origin_fallen_prodigy',
    title: 'The Ghost of Sixteen',
    category: 'ORIGIN',
    checkTrigger: (state) => (state.player?.stats?.apps || 0) >= 1 && state.player?.backstory === 'FALLEN_PRODIGY' && !(state.unlockedCutscenes || []).some(c => c.id === 'origin_fallen_prodigy'),
    getLines: (state) => {
      const p = state.player!;
      return [
        { text: `As you walk out of the tunnel after your debut, a local journalist holds a microphone to your face.` },
        { speaker: 'Journalist', text: `"${p.lastName}! Five years ago, you were training with national youth squads. Does playing in this stadium feel like a second chance, or a step down?"` },
        { text: `The question cuts through the noise of the stadium. Your knee throbbed slightly under your ice pack, a ghost of the old injury.` },
        { speaker: 'Physio', text: `"Ignore him, kid. Focus on your recovery. The leg held up beautifully today, and that's all that matters."` }
      ];
    },
    getChoices: (state) => [
      {
        text: '"This is a clean slate. I\'m here to build, not look back."',
        description: 'Increase determination and humility. Boost Manager Trust.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ 
            trust: Math.min(100, (state.player?.trust || 50) + 10),
            morale: Math.min(100, (state.player?.morale || 50) + 10)
          });
          setFlag('origin_fallen_attitude', 'focused');
        }
      },
      {
        text: '"I still belong at the very top. I\'ll prove it soon."',
        description: 'Massive increase in Morale, but a slight hit to Manager Trust.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ 
            morale: Math.min(100, (state.player?.morale || 50) + 20),
            trust: Math.max(0, (state.player?.trust || 50) - 5)
          });
          setFlag('origin_fallen_attitude', 'ambitious');
        }
      }
    ]
  },

  // 1d. ORIGIN CUTSCENE: LATE_BLOOMER
  {
    id: 'origin_late_bloomer',
    title: 'Hammer and Tongs',
    category: 'ORIGIN',
    checkTrigger: (state) => (state.player?.stats?.apps || 0) >= 1 && state.player?.backstory === 'LATE_BLOOMER' && !(state.unlockedCutscenes || []).some(c => c.id === 'origin_late_bloomer'),
    getLines: (state) => {
      const p = state.player!;
      return [
        { text: `Your first pro appearance. A few years ago, you were clocking in at 7 AM, carrying bricks in the freezing rain.` },
        { text: `Today, you ran 12 kilometers in front of thousands of screaming supporters. Your lungs burned with the pace of professional play.` },
        { speaker: 'Assistant Coach', text: `"You've got the engine of a freight train, ${p.lastName}. But your positional discipline was all over the shop. You can't just chase the ball."` },
        { speaker: 'Manager', text: `"Easy, coach. The boy's got hunger. You can teach tactics, but you can't teach that kind of heart."` }
      ];
    },
    getChoices: (state) => [
      {
        text: '"I\'ll stay late every day. Teach me the shape."',
        description: 'Significantly increase tactical awareness and gain massive Manager Trust.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ 
            trust: Math.min(100, (state.player?.trust || 50) + 15),
            tacticalFamiliarity: Math.min(100, (state.player?.tacticalFamiliarity || 30) + 15)
          });
          setFlag('origin_late_attitude', 'hard_worker');
        }
      },
      {
        text: '"I\'ll use my strength. Let them try and get past me."',
        description: 'Increase Morale and physical presence, but slower tactical growth.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ 
            morale: Math.min(100, (state.player?.morale || 50) + 15)
          });
          setFlag('origin_late_attitude', 'enforcer');
        }
      }
    ]
  },

  // 2. MILESTONE CUTSCENE: FIRST GOAL
  {
    id: 'milestone_first_goal',
    title: 'Off the Mark',
    category: 'MILESTONE',
    checkTrigger: (state) => (state.player?.stats?.goals || 0) > 0 && !(state.unlockedCutscenes || []).some(c => c.id === 'milestone_first_goal'),
    getLines: (state) => {
      const p = state.player!;
      const isAttacker = ['ST', 'LW', 'RW', 'CAM'].includes(p.position);
      const isDefender = ['CB', 'LB', 'RB'].includes(p.position);

      let variantLines: CutsceneLine[] = [];

      if (isDefender) {
        variantLines = [
          { text: `A rare foray forward. The ball breaks to you.` },
          { text: `It's not your primary job, but when the net ripples, the stadium doesn't care if you're a defender.` },
          { text: `Your teammates mob you. It's a collector's item, and you've savored every second of it.` }
        ];
      } else if (isAttacker) {
        variantLines = [
          { text: `That's what they pay you for.` },
          { text: `The instinct takes over. The connection is pure, and as soon as it leaves your boot, you know it's in.` },
          { text: `The relief is palpable. The monkey is off your back.` }
        ];
      } else {
        variantLines = [
          { text: `A perfectly timed arrival in the box. The finish is emphatic.` },
          { text: `Your first professional goal. The noise from the stands is a physical wave hitting you.` }
        ];
      }

      return [
        { text: `The whistle blows, and the realization finally sinks in.` },
        ...variantLines,
        { speaker: 'Manager', text: `"Great strike, kid. That's the first of many if you keep your head right."` }
      ];
    },
    getChoices: (state) => [
      {
        text: 'Celebrate wildly with the fans.',
        description: 'Massive boost to Fans, minor loss of Manager Discipline.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ fans: (state.player?.fans || 0) + 50 });
        }
      },
      {
        text: 'Point to the player who assisted you.',
        description: 'Boost to Teammates relationship.',
        onSelect: (updatePlayer, setFlag) => {
           // We'll just boost squad chemistry or trust
           updatePlayer({ trust: Math.min(100, (state.player?.trust || 50) + 5) });
        }
      }
    ]
  },

  // 3. ARC CUTSCENE: FALLEN PRODIGY - CHAPTER 1
  {
    id: 'arc_fallen_prodigy_ch1',
    title: 'Ghosts of the Past',
    category: 'ARC',
    checkTrigger: (state) => state.player?.backstory === 'FALLEN_PRODIGY' && state.currentWeek > 2 && !(state.unlockedCutscenes || []).some(c => c.id === 'arc_fallen_prodigy_ch1'),
    getLines: (state) => {
      return [
        { text: `The training ground is quiet. You are out doing extra drills after the rest of the squad has headed in.` },
        { text: `A sleek black car pulls up near the touchline. A familiar face steps out.` },
        { speaker: 'Marco (Former Agent)', text: `"Look at you. Scraping the barrel in the lower leagues. Remember when we had half of Europe chasing your signature?"` },
        { text: `Marco was the agent who pushed for that disastrous move three years ago. The one that stalled your career.` },
        { speaker: 'Marco', text: `"I still have contacts, you know. I can get you out of this mud-pit. Just sign back with me. We'll get you a real contract."` }
      ];
    },
    getChoices: (state) => [
      {
        text: '"I\'m done with shortcuts. I\'m earning my way back."',
        description: 'Reject him. Boosts Manager Trust and Morale, but closes a potential future transfer path.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ trust: Math.min(100, (state.player?.trust || 50) + 15), morale: Math.min(100, (state.player?.morale || 50) + 10) });
          setFlag('arc_fallen_prodigy_agent', 'rejected');
        }
      },
      {
        text: '"...What kind of contacts?"',
        description: 'Hear him out. Massive boost to Reputation, but massive hit to Manager Trust and Squad Chemistry.',
        onSelect: (updatePlayer, setFlag) => {
          updatePlayer({ 
              reputation: {
                ...(state.player?.reputation || { club: 50, league: 50, world: 50, peerRespect: 50, skill: 50, attitude: 50, media: 50, fans: 50, global: 50, legacy: 50 }),
                world: Math.min(100, (state.player?.reputation?.world || 50) + 15),
                club: Math.min(100, (state.player?.reputation?.club || 50) + 15)
              }, 
              trust: Math.max(0, (state.player?.trust || 50) - 20)
          });
          setFlag('arc_fallen_prodigy_agent', 'interested');
        }
      }
    ]
  }
];

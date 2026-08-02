import { GameState } from '../store/GameContext';
import { CLUBS } from '../data/teams';

export type PressTone = 'deflect' | 'defend' | 'criticise' | 'combative' | 'praise';

export interface PressQuestionEffect {
  trust?: number;
  morale?: number;
  fans?: number;
  mediaPerception?: number;
  teammates?: number;
}

export interface PressQuestionOption {
  text: string;
  tone: PressTone;
  effects: PressQuestionEffect;
}

export interface PressQuestion {
  journalist: string;
  journalistType: 'Friendly Local' | 'Aggressive Tabloid' | 'Tactical Nerd';
  text: string;
  options: PressQuestionOption[];
}

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function generatePressQuestions(state: GameState): PressQuestion[] {
  const p = state.player;
  if (!p) return [];

  const questions: PressQuestion[] = [];
  const club = CLUBS.find(c => c.symbol === p.currentClubSymbol) || CLUBS[0];
  const isNewArrival = p.stats.apps < 5 && p.stats.goals === 0 && p.stats.assists === 0;
  const wasBenched = p.stateFlags?.openThreads?.wasBenched || false;

  const jLocal = { name: "Dave Local", type: "Friendly Local" as const };
  const jTabloid = { name: "Tom Scolder", type: "Aggressive Tabloid" as const };
  const jTactical = { name: "Sarah Insight", type: "Tactical Nerd" as const };

  // 1. WELCOME / NEW ARRIVAL ENCOUNTERS (Hundreds of combinations)
  if (isNewArrival) {
    const openings = [
      "The fans are incredibly excited to see you here in the shirt.",
      "There was a lot of competition for your signature this window.",
      "You've finally arrived after weeks of intense speculation.",
      `It's a big step in your career to join ${club.name}.`,
      "Many didn't expect this move to happen so quickly.",
      "Your arrival has generated a massive buzz around the city.",
      `Welcome to ${club.name}. The expectations here are massive.`,
      "It's great to finally see you presented as a player here.",
      "The manager pushed really hard to get this deal over the line.",
      "Supporters have been tracking your flight online all week."
    ];
    
    const questionsList = [
      "What are your initial thoughts on the club's facilities?",
      "How do you plan to win over the supporters in your first few matches?",
      "Are you fully prepared for the pressure of playing here?",
      "What did the manager say to convince you this was the right project?",
      "How are you settling into the city and the new dressing room?",
      "Do you feel you can immediately break into the starting XI?",
      "What personal targets have you set for this debut season?",
      "Is there a particular teammate you are looking forward to playing with?",
      "How would you describe your playstyle to fans who haven't seen you play?",
      "Can you promise the fans total commitment to the badge?"
    ];

    const opening = getRandomItem(openings);
    const questionText = getRandomItem(questionsList);

    questions.push({
      journalist: jLocal.name,
      journalistType: jLocal.type,
      text: `${opening} ${questionText}`,
      options: [
        { text: "Praise: The club is magnificent. I can't wait to give everything for the fans.", tone: "praise", effects: { fans: 15, trust: 5, morale: 5 } },
        { text: "Defend: I'm here to work hard and earn my place on the pitch.", tone: "defend", effects: { trust: 10, mediaPerception: 5, teammates: 5 } },
        { text: "Combative: I came here to win trophies and be the best player on the pitch.", tone: "combative", effects: { fans: 10, mediaPerception: 10, teammates: -5 } }
      ]
    });
  }

  // 2. FORM & PERFORMANCE ENCOUNTERS
  if (p.form >= 80) {
    const openings = [
      "You are in the form of your life right now.",
      "The supporters are singing your name every week.",
      "You've been unplayable in the last few matches.",
      "Your recent performances have been nothing short of spectacular.",
      "Pundits are running out of superlatives for you."
    ];
    const questionsList = [
      "What is the secret behind this incredible run?",
      "Do you feel you are currently the best player in the league?",
      "Can you maintain this level for the rest of the season?",
      "How much of this form is down to the manager's tactical setup?",
      "Are you worried about burning out after pushing so hard?"
    ];
    questions.push({
      journalist: jTactical.name,
      journalistType: jTactical.type,
      text: `${getRandomItem(openings)} ${getRandomItem(questionsList)}`,
      options: [
        { text: "Praise: It's all thanks to my teammates and the manager's system.", tone: "praise", effects: { teammates: 15, trust: 10, mediaPerception: 5 } },
        { text: "Defend: I just keep my head down and work hard in training.", tone: "defend", effects: { trust: 5, mediaPerception: 5 } },
        { text: "Combative: I've always known how good I am. This is just the beginning.", tone: "combative", effects: { fans: 15, mediaPerception: 15, trust: -5 } }
      ]
    });
  } else if (p.form <= 30) {
    const openings = [
      "It's been a really difficult spell for you recently.",
      "You seem to be lacking your usual sharpness and confidence.",
      "The fans have started to voice their frustrations with your performances.",
      "Statistically, this is one of your worst runs of form.",
      "You looked completely lost on the pitch today."
    ];
    const questionsList = [
      "Are you struggling to understand the manager's tactical demands?",
      "Is the pressure of playing for this club getting to you?",
      "Do you fear you might be dropped for the next match?",
      "Are there issues behind the scenes affecting your focus?",
      "How do you plan to turn this terrible situation around?"
    ];
    questions.push({
      journalist: jTabloid.name,
      journalistType: jTabloid.type,
      text: `${getRandomItem(openings)} ${getRandomItem(questionsList)}`,
      options: [
        { text: "Deflect: Every player goes through bad patches. I will bounce back.", tone: "deflect", effects: { mediaPerception: 5, trust: 5 } },
        { text: "Criticise: The service hasn't been there. I can't do it all on my own.", tone: "criticise", effects: { teammates: -15, trust: -10, mediaPerception: 10 } },
        { text: "Defend: I am working tirelessly behind the scenes to fix this.", tone: "defend", effects: { trust: 10, fans: 5 } }
      ]
    });
  } else {
    // Normal form
    questions.push({
      journalist: jLocal.name,
      journalistType: jLocal.type,
      text: "A solid shift from you today. How are you feeling physically after a grueling match like that?",
      options: [
        { text: "Praise: The fitness coaches prepare us well. I feel great.", tone: "praise", effects: { trust: 5, morale: 5 } },
        { text: "Defend: It was tough, but we gave everything for the badge.", tone: "defend", effects: { fans: 10, mediaPerception: 5 } },
        { text: "Deflect: I'm just focused on recovering for the next fixture.", tone: "deflect", effects: { trust: 5 } }
      ]
    });
  }

  // 3. BENCHED / OMISSION ENCOUNTERS
  if (wasBenched) {
    const openings = [
      "You spent the entire 90 minutes watching from the sidelines today.",
      "Many were surprised to see you left out of the starting XI.",
      "It must be incredibly frustrating to be dropped for such a big game."
    ];
    const questionsList = [
      "Has the manager explained his reasoning to you?",
      "Are you considering your future if this lack of game time continues?",
      "Do you feel you deserved to start today based on training?"
    ];
    questions.push({
      journalist: jTabloid.name,
      journalistType: jTabloid.type,
      text: `${getRandomItem(openings)} ${getRandomItem(questionsList)}`,
      options: [
        { text: "Deflect: The boss has to make hard choices. I respect his decision.", tone: "deflect", effects: { trust: 5, teammates: 5, morale: -5 } },
        { text: "Combative: It is incredibly frustrating. I feel I should be on that pitch.", tone: "combative", effects: { trust: -10, fans: 10, mediaPerception: 10 } },
        { text: "Criticise: No explanation was given. I was completely blindsided.", tone: "criticise", effects: { trust: -15, teammates: -5, mediaPerception: 15 } }
      ]
    });
  } else {
    // Manager Relationship
    if (p.trust > 80) {
      questions.push({
        journalist: jTactical.name,
        journalistType: jTactical.type,
        text: "You seem to be one of the manager's most trusted lieutenants on the pitch. How much do you enjoy working under this system?",
        options: [
          { text: "Praise: We have a great relationship. I am learning so much every day.", tone: "praise", effects: { trust: 15, mediaPerception: 5, fans: -5 } },
          { text: "Defend: I just try to execute the game plan exactly as requested.", tone: "defend", effects: { trust: 5, mediaPerception: 5 } },
          { text: "Combative: He knows I'm the best option he has. We respect each other.", tone: "combative", effects: { trust: -5, mediaPerception: 10, fans: 10 } }
        ]
      });
    } else {
      questions.push({
        journalist: jTabloid.name,
        journalistType: jTabloid.type,
        text: "There are whispers that you and the manager don't always see eye to eye tactically. Is there friction behind the scenes?",
        options: [
          { text: "Deflect: What we discuss in the dressing room stays private.", tone: "deflect", effects: { mediaPerception: 5, trust: 5 } },
          { text: "Defend: We are both professionals working for the good of the club.", tone: "defend", effects: { trust: 10, mediaPerception: -5 } },
          { text: "Criticise: Sometimes his tactics restrict my natural game, yes.", tone: "criticise", effects: { trust: -20, fans: 10, mediaPerception: 15 } }
        ]
      });
    }
  }

  // Ensure we have exactly 3 questions
  return questions.slice(0, 3);
}

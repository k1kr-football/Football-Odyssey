const fs = require('fs');

const categories = ['BUILDUP', 'ATTACKING', 'DEFENSIVE', 'TRANSITION', 'SET_PIECE', 'GOALKEEPER'];
const situations = [];

function addSit(id, cat, validPositions, desc, pressureMod, choices) {
    situations.push({ id, category: cat, validPositions, description: desc, pressureMod, choices });
}

// Generate 15+ per category
let count = 0;
categories.forEach(cat => {
    for (let i=0; i<18; i++) {
        let positions = ['ALL'];
        if (cat === 'GOALKEEPER') positions = ['GK'];
        else if (cat === 'ATTACKING') positions = ['ST', 'CF', 'W', 'LM', 'RM', 'CAM'];
        else if (cat === 'DEFENSIVE') positions = ['CB', 'FB', 'WB', 'CDM'];

        let choices = [
            {
                text: `Safe Option ${i}`,
                actionType: cat === 'DEFENSIVE' ? 'TACKLE' : (cat === 'ATTACKING' ? 'SHOT' : 'PASS'),
                difficultyMod: -5,
                successTexts: [`Routine success.`, `Handles it well.`],
                failureTexts: [`Sloppy execution.`, `Made a mess of it.`]
            },
            {
                text: `Aggressive Option ${i}`,
                actionType: cat === 'DEFENSIVE' ? 'TACKLE' : (cat === 'ATTACKING' ? 'DRIBBLE' : 'PASS'),
                difficultyMod: 10,
                successTexts: [`Brilliant aggressive play!`, `Pulled it off spectacularly.`],
                failureTexts: [`Lost it under pressure.`, `Terrible decision.`]
            }
        ];

        addSit(`SIT_${cat}_${i}`, cat, positions, `${cat} scenario ${i}: The match develops and a moment arrives.`, i % 3, choices);
    }
});

// Let's make some specific handwritten ones to ensure quality, and append the generic ones
const specificSituations = [
  {
    id: "SIT_ATTACKING_0",
    category: "ATTACKING",
    validPositions: ["ST", "CF", "W", "LM", "RM", "CAM"],
    description: "A brilliant lofted ball is played over the high defensive line. You are one-on-one with the advancing goalkeeper.",
    pressureMod: 3,
    choices: [
      {
        text: "Attempt a precise chip over the keeper",
        actionType: "SHOT",
        difficultyMod: 15,
        successTexts: ["A sublime chip floats perfectly over the keeper and into the net!", "Incredible audacity! The keeper is left stranded."],
        failureTexts: ["The chip is weak and easily caught.", "You overhit it, sending the ball into the stands."]
      },
      {
        text: "Drive a low, hard shot into the bottom corner",
        actionType: "SHOT",
        difficultyMod: 0,
        successTexts: ["A clinical finish! Hard and low, giving the keeper no chance.", "You slot it away perfectly. textbook finishing."],
        failureTexts: ["The shot is too close to the keeper.", "You drag the shot wide of the post."]
      },
      {
        text: "Try to dribble around the keeper",
        actionType: "DRIBBLE",
        difficultyMod: 5,
        successTexts: ["You drop the shoulder, round the keeper, and tap it into the empty net!", "Brilliant footwork! The keeper is on the floor."],
        failureTexts: ["The keeper anticipates the move and smothers the ball.", "You take too heavy a touch and the ball rolls out of play."]
      }
    ]
  },
  {
    id: "SIT_DEFENSIVE_0",
    category: "DEFENSIVE",
    validPositions: ["CB", "FB", "WB", "CDM"],
    description: "The opposition striker is breaking clear on a counter-attack. You are the last defender between them and the goal.",
    pressureMod: 4,
    choices: [
      {
        text: "Commit to a sliding tackle",
        actionType: "TACKLE",
        difficultyMod: 10,
        successTexts: ["A perfectly timed slide tackle! Cleanly wins the ball.", "Incredible last-ditch defending! You hook the ball away safely."],
        failureTexts: ["You mistime it completely. The striker skips past you.", "A desperate lunge! You miss the ball and bring the man down... penalty!"]
      },
      {
        text: "Jockey and delay the attacker",
        actionType: "TACKLE",
        difficultyMod: -5,
        successTexts: ["You force them wide, slowing the break and allowing the defense to recover.", "Excellent positioning. The striker runs out of options."],
        failureTexts: ["You give them too much space and they unleash a lethal shot.", "The attacker easily shifts the ball past you and shoots."]
      }
    ]
  },
  {
    id: "SIT_GOALKEEPER_0",
    category: "GOALKEEPER",
    validPositions: ["GK"],
    description: "A dangerous inswinging corner is whipped into the six-yard box through a crowd of bodies.",
    pressureMod: 2,
    choices: [
      {
        text: "Come out and punch the ball clear",
        actionType: "TACKLE", // using tackle/positioning roughly for GK actions
        difficultyMod: 5,
        successTexts: ["A commanding punch clears the danger emphatically!", "You rise above the crowd and punch it to safety."],
        failureTexts: ["You miss the ball completely! It's chaos in the box.", "A weak punch drops the ball right at an attacker's feet."]
      },
      {
        text: "Stay on the line and react to the header",
        actionType: "TACKLE",
        difficultyMod: -5,
        successTexts: ["A brilliant reflex save tips the resulting header over the bar!", "You read the header perfectly and smother the ball."],
        failureTexts: ["You're rooted to the spot as the header flashes past you.", "The header is too powerful, you can only parry it into the net."]
      }
    ]
  }
];

const finalSituations = [...specificSituations, ...situations];

let out = `import { MatchEventType } from '../types';

export interface MatchSituationChoice {
  text: string;
  actionType: MatchEventType;
  difficultyMod: number;
  successTexts: string[];
  failureTexts: string[];
}

export interface MatchSituation {
  id: string;
  category: 'BUILDUP' | 'ATTACKING' | 'DEFENSIVE' | 'TRANSITION' | 'SET_PIECE' | 'GOALKEEPER';
  validPositions: string[];
  description: string;
  pressureMod: number;
  choices: MatchSituationChoice[];
}

export const MATCH_SITUATIONS: MatchSituation[] = ${JSON.stringify(finalSituations, null, 2)};
`;

fs.writeFileSync('src/data/matchSituations.ts', out);

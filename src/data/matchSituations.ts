import { MatchEventType } from '../types';

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

export const MATCH_SITUATIONS: MatchSituation[] = [
  {
    "id": "SIT_ATTACKING_0",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "A brilliant lofted ball is played over the high defensive line. You are one-on-one with the advancing goalkeeper.",
    "pressureMod": 3,
    "choices": [
      {
        "text": "Attempt a precise chip over the keeper",
        "actionType": "SHOT",
        "difficultyMod": 15,
        "successTexts": [
          "A sublime chip floats perfectly over the keeper and into the net!",
          "Incredible audacity! The keeper is left stranded."
        ],
        "failureTexts": [
          "The chip is weak and easily caught.",
          "You overhit it, sending the ball into the stands."
        ]
      },
      {
        "text": "Drive a low, hard shot into the bottom corner",
        "actionType": "SHOT",
        "difficultyMod": 0,
        "successTexts": [
          "A clinical finish! Hard and low, giving the keeper no chance.",
          "You slot it away perfectly. textbook finishing."
        ],
        "failureTexts": [
          "The shot is too close to the keeper.",
          "You drag the shot wide of the post."
        ]
      },
      {
        "text": "Try to dribble around the keeper",
        "actionType": "DRIBBLE",
        "difficultyMod": 5,
        "successTexts": [
          "You drop the shoulder, round the keeper, and tap it into the empty net!",
          "Brilliant footwork! The keeper is on the floor."
        ],
        "failureTexts": [
          "The keeper anticipates the move and smothers the ball.",
          "You take too heavy a touch and the ball rolls out of play."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_0",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "The opposition striker is breaking clear on a counter-attack. You are the last defender between them and the goal.",
    "pressureMod": 4,
    "choices": [
      {
        "text": "Commit to a sliding tackle",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "A perfectly timed slide tackle! Cleanly wins the ball.",
          "Incredible last-ditch defending! You hook the ball away safely."
        ],
        "failureTexts": [
          "You mistime it completely. The striker skips past you.",
          "A desperate lunge! You miss the ball and bring the man down... penalty!"
        ]
      },
      {
        "text": "Jockey and delay the attacker",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "You force them wide, slowing the break and allowing the defense to recover.",
          "Excellent positioning. The striker runs out of options."
        ],
        "failureTexts": [
          "You give them too much space and they unleash a lethal shot.",
          "The attacker easily shifts the ball past you and shoots."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_0",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "A dangerous inswinging corner is whipped into the six-yard box through a crowd of bodies.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Come out and punch the ball clear",
        "actionType": "TACKLE",
        "difficultyMod": 5,
        "successTexts": [
          "A commanding punch clears the danger emphatically!",
          "You rise above the crowd and punch it to safety."
        ],
        "failureTexts": [
          "You miss the ball completely! It's chaos in the box.",
          "A weak punch drops the ball right at an attacker's feet."
        ]
      },
      {
        "text": "Stay on the line and react to the header",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "A brilliant reflex save tips the resulting header over the bar!",
          "You read the header perfectly and smother the ball."
        ],
        "failureTexts": [
          "You're rooted to the spot as the header flashes past you.",
          "The header is too powerful, you can only parry it into the net."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_0",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 0: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 0",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 0",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_1",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 1: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 1",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 1",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_2",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 2: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 2",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 2",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_3",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 3: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 3",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 3",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_4",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 4: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 4",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 4",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_5",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 5: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 5",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 5",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_6",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 6: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 6",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 6",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_7",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 7: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 7",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 7",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_8",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 8: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 8",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 8",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_9",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 9: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 9",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 9",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_10",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 10: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 10",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 10",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_11",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 11: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 11",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 11",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_12",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 12: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 12",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 12",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_13",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 13: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 13",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 13",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_14",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 14: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 14",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 14",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_15",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 15: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 15",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 15",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_16",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 16: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 16",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 16",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_BUILDUP_17",
    "category": "BUILDUP",
    "validPositions": [
      "ALL"
    ],
    "description": "BUILDUP scenario 17: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 17",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 17",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_0",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 0: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 0",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 0",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_1",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 1: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 1",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 1",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_2",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 2: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 2",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 2",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_3",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 3: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 3",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 3",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_4",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 4: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 4",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 4",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_5",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 5: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 5",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 5",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_6",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 6: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 6",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 6",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_7",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 7: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 7",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 7",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_8",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 8: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 8",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 8",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_9",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 9: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 9",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 9",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_10",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 10: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 10",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 10",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_11",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 11: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 11",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 11",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_12",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 12: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 12",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 12",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_13",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 13: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 13",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 13",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_14",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 14: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 14",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 14",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_15",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 15: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 15",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 15",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_16",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 16: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 16",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 16",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_ATTACKING_17",
    "category": "ATTACKING",
    "validPositions": [
      "ST",
      "CF",
      "W",
      "LM",
      "RM",
      "CAM"
    ],
    "description": "ATTACKING scenario 17: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 17",
        "actionType": "SHOT",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 17",
        "actionType": "DRIBBLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_0",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 0: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 0",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 0",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_1",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 1: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 1",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 1",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_2",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 2: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 2",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 2",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_3",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 3: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 3",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 3",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_4",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 4: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 4",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 4",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_5",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 5: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 5",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 5",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_6",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 6: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 6",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 6",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_7",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 7: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 7",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 7",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_8",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 8: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 8",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 8",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_9",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 9: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 9",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 9",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_10",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 10: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 10",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 10",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_11",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 11: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 11",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 11",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_12",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 12: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 12",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 12",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_13",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 13: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 13",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 13",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_14",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 14: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 14",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 14",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_15",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 15: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 15",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 15",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_16",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 16: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 16",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 16",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_DEFENSIVE_17",
    "category": "DEFENSIVE",
    "validPositions": [
      "CB",
      "FB",
      "WB",
      "CDM"
    ],
    "description": "DEFENSIVE scenario 17: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 17",
        "actionType": "TACKLE",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 17",
        "actionType": "TACKLE",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_0",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 0: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 0",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 0",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_1",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 1: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 1",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 1",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_2",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 2: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 2",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 2",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_3",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 3: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 3",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 3",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_4",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 4: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 4",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 4",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_5",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 5: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 5",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 5",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_6",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 6: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 6",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 6",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_7",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 7: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 7",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 7",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_8",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 8: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 8",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 8",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_9",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 9: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 9",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 9",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_10",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 10: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 10",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 10",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_11",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 11: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 11",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 11",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_12",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 12: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 12",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 12",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_13",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 13: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 13",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 13",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_14",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 14: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 14",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 14",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_15",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 15: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 15",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 15",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_16",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 16: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 16",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 16",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_TRANSITION_17",
    "category": "TRANSITION",
    "validPositions": [
      "ALL"
    ],
    "description": "TRANSITION scenario 17: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 17",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 17",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_0",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 0: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 0",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 0",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_1",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 1: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 1",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 1",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_2",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 2: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 2",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 2",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_3",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 3: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 3",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 3",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_4",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 4: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 4",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 4",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_5",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 5: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 5",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 5",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_6",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 6: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 6",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 6",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_7",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 7: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 7",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 7",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_8",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 8: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 8",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 8",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_9",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 9: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 9",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 9",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_10",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 10: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 10",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 10",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_11",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 11: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 11",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 11",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_12",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 12: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 12",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 12",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_13",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 13: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 13",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 13",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_14",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 14: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 14",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 14",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_15",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 15: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 15",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 15",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_16",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 16: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 16",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 16",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_SET_PIECE_17",
    "category": "SET_PIECE",
    "validPositions": [
      "ALL"
    ],
    "description": "SET_PIECE scenario 17: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 17",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 17",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_0",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 0: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 0",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 0",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_1",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 1: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 1",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 1",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_2",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 2: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 2",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 2",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_3",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 3: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 3",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 3",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_4",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 4: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 4",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 4",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_5",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 5: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 5",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 5",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_6",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 6: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 6",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 6",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_7",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 7: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 7",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 7",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_8",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 8: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 8",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 8",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_9",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 9: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 9",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 9",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_10",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 10: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 10",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 10",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_11",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 11: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 11",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 11",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_12",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 12: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 12",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 12",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_13",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 13: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 13",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 13",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_14",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 14: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 14",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 14",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_15",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 15: The match develops and a moment arrives.",
    "pressureMod": 0,
    "choices": [
      {
        "text": "Safe Option 15",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 15",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_16",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 16: The match develops and a moment arrives.",
    "pressureMod": 1,
    "choices": [
      {
        "text": "Safe Option 16",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 16",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  },
  {
    "id": "SIT_GOALKEEPER_17",
    "category": "GOALKEEPER",
    "validPositions": [
      "GK"
    ],
    "description": "GOALKEEPER scenario 17: The match develops and a moment arrives.",
    "pressureMod": 2,
    "choices": [
      {
        "text": "Safe Option 17",
        "actionType": "PASS",
        "difficultyMod": -5,
        "successTexts": [
          "Routine success.",
          "Handles it well."
        ],
        "failureTexts": [
          "Sloppy execution.",
          "Made a mess of it."
        ]
      },
      {
        "text": "Aggressive Option 17",
        "actionType": "PASS",
        "difficultyMod": 10,
        "successTexts": [
          "Brilliant aggressive play!",
          "Pulled it off spectacularly."
        ],
        "failureTexts": [
          "Lost it under pressure.",
          "Terrible decision."
        ]
      }
    ]
  }
];

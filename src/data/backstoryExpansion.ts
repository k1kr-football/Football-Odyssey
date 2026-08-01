import { BackstoryType } from '../types';

export interface FormativeMomentChoice {
  id: string;
  label: string;
  text: string;
  frameTag: string;
  decisionMemoryText: string;
}

export interface FormativeMomentScene {
  title: string;
  sceneText: string;
  choices: [FormativeMomentChoice, FormativeMomentChoice];
}

export interface RegionOption {
  city: string;
  description: string;
}

export interface FamilyOption {
  id: string;
  title: string;
  description: string;
  npcName: string;
  startingRelationship: number;
}

export interface RivalOrMentorOption {
  type: 'RIVAL' | 'MENTOR';
  name: string;
  roleOrPosition: string;
  title: string;
  description: string;
}

export interface DrivingQuestionVariant {
  id: string;
  tag: string;
  question: string;
  description: string;
}

export interface BackstoryExpansionConfig {
  formativeMoment: FormativeMomentScene;
  regions: Record<string, RegionOption[]>;
  familyOptions: FamilyOption[];
  rivalMentorOptions: {
    rival: RivalOrMentorOption;
    mentor: RivalOrMentorOption;
  };
  drivingQuestionVariants: [DrivingQuestionVariant, DrivingQuestionVariant];
}

// Fallback regions for any nationality not specifically defined
export const DEFAULT_REGIONS: RegionOption[] = [
  { city: 'Capital District', description: 'Metropolitan center with competitive youth circuits.' },
  { city: 'Northern Province', description: 'Gritty industrial football corridor.' },
  { city: 'Coastal Region', description: 'Port city with passionate local supporters.' }
];

export const BACKSTORY_EXPANSIONS: Record<BackstoryType, BackstoryExpansionConfig> = {
  STREET_PRODIGY: {
    formativeMoment: {
      title: "The Scout's Phone Camera",
      sceneText: "It's 38°C on the sun-baked concrete pitch. A European scout in clean sneakers stands at the fence, filming on his phone. You have the ball on the edge of the box with two defenders closing in fast.",
      choices: [
        {
          id: 'showman',
          label: 'Option A: The Rainbow Flick',
          text: 'Perform an outrageous rainbow flick over both defenders to ignite the crowd.',
          frameTag: 'Showman',
          decisionMemoryText: 'Ignited the crowds on the tarmac with a daredevil rainbow flick under scout observation.'
        },
        {
          id: 'professional',
          label: 'Option B: The One-Two Finish',
          text: 'Execute a crisp one-two and slot an ice-cold finish into the bottom corner.',
          frameTag: 'Pure Efficiency',
          decisionMemoryText: 'Demonstrated cold, clinical efficiency under scout observation.'
        }
      ]
    },
    regions: {
      Nigeria: [
        { city: 'Lagos', description: 'Bustling megacity tarmac cages in Surulere & Yaba.' },
        { city: 'Kano', description: 'Northern street pitches known for rapid technical play.' },
        { city: 'Port Harcourt', description: 'Oil city leagues played on gritty industrial lots.' },
        { city: 'Ibadan', description: 'Historic southwestern city with passionate grassroots leagues.' },
        { city: 'Benin City', description: 'Ancient kingdom hub with rapid technical youth talents.' }
      ],
      Ghana: [
        { city: 'Accra', description: 'Bukom neighborhood cage tournaments near the coast.' },
        { city: 'Kumasi', description: 'Ashanti region dirt pitches with intense rivalries.' },
        { city: 'Tamale', description: 'Northern district dust bowls forging physical stamina.' },
        { city: 'Cape Coast', description: 'Coastal historic pitch with fierce regional pride.' },
        { city: 'Sekondi', description: 'Industrial port town grassroots tournaments.' }
      ],
      Brazil: [
        { city: 'São Paulo', description: 'Favela concrete courts under high-voltage streetlights.' },
        { city: 'Rio de Janeiro', description: 'Copacabana beach cages and North Zone alleyways.' },
        { city: 'Salvador', description: 'Pelourinho street games fueled by samba rhythm.' },
        { city: 'Belo Horizonte', description: 'Minas Gerais hilly street courts and technical duels.' },
        { city: 'Curitiba', description: 'Southern urban pitches with crisp passing culture.' }
      ],
      Argentina: [
        { city: 'Buenos Aires', description: 'Potrero dirt fields in the outer barrios.' },
        { city: 'Rosario', description: 'Riverbank street courts that bred global legends.' },
        { city: 'Córdoba', description: 'Mountain district street games with fierce tackle culture.' },
        { city: 'Mendoza', description: 'Western vineyard district grassroots football.' },
        { city: 'La Plata', description: 'University city rivalries and technical street play.' }
      ],
      'Ivory Coast': [
        { city: 'Abidjan', description: 'Treichville street tournaments with packed sidelines.' },
        { city: 'Bouaké', description: 'Central town square games with raw physical duel intensity.' },
        { city: 'San-Pédro', description: 'Port city street pitch where sand meets concrete.' },
        { city: 'Yamoussoukro', description: 'Capital district open-air technical pitches.' },
        { city: 'Korhogo', description: 'Northern savanna town endurance games.' }
      ]
    },
    familyOptions: [
      {
        id: 'single_parent',
        title: 'Sacrificing Parent',
        description: 'A hardworking single parent who pulled extra shifts so you had real boots.',
        npcName: 'Mama / Father',
        startingRelationship: 85
      },
      {
        id: 'loud_family',
        title: 'Boisterous Household',
        description: 'A large, loud family that fills the living room shouting at every match.',
        npcName: 'The Family House',
        startingRelationship: 75
      },
      {
        id: 'older_sibling',
        title: 'Protective Older Sibling',
        description: 'An older sibling who gave up their own sports dreams to fund your trials.',
        npcName: 'Older Sibling',
        startingRelationship: 90
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Tunde "The Flash" Okafor',
        roleOrPosition: 'RW',
        title: 'Street Rival: Tunde Okafor',
        description: 'The street king who claimed you only got scouted because the camera was rolling.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Coach "Uncle" Ben',
        roleOrPosition: 'Street Mentor',
        title: 'Street Mentor: Uncle Ben',
        description: 'The local organizer who taped your boots and kept you focused when street life tried to pull you away.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'tactical_adaptation',
        tag: 'Tactical Refinement',
        question: 'Can the raw street flair player adapt to the ruthless tactical demands of pro football?',
        description: 'Focuses on your transition from individual street magician to disciplined team player.'
      },
      {
        id: 'family_salvation',
        tag: 'Family Provider',
        question: 'Can you drag your family out of hardship before your window of opportunity closes?',
        description: 'Focuses on the emotional weight of providing for those who sacrificed everything for you.'
      }
    ]
  },

  FALLEN_PRODIGY: {
    formativeMoment: {
      title: "The Rehabilitation Room Solitude",
      sceneText: "It's late November in the empty academy gym, 14 months after knee surgery. While your former teammates celebrate a youth derby win downstairs, you stare at the leg press machine.",
      choices: [
        {
          id: 'obsessive',
          label: 'Option A: Gritted Teeth Workout',
          text: 'Push through tears to complete three extra painful sets of squats in silence.',
          frameTag: 'Relentless Obsessive',
          decisionMemoryText: 'Gritted teeth in solitude to complete late-night knee rehab alone.'
        },
        {
          id: 'tactical_study',
          label: 'Option B: Match Tape Analysis',
          text: 'Step outside onto the cold balcony to study match tape on a tablet, analyzing positional mistakes.',
          frameTag: 'Tactical Analyst',
          decisionMemoryText: 'Studied match tape till midnight during injury rehabilitation.'
        }
      ]
    },
    regions: {
      Spain: [
        { city: 'Madrid', description: 'Valdebebas academy roots surrounded by elite expectation.' },
        { city: 'Barcelona', description: 'La Masia system where possession dogma was ingrained early.' },
        { city: 'Seville', description: 'Andalusian academy known for intense derby pressure.' },
        { city: 'Valencia', description: 'Mediterranean coast academy with sharp technical wing play.' },
        { city: 'Bilbao', description: 'Basque academy system known for fierce combativeness.' }
      ],
      France: [
        { city: 'Paris', description: 'Banlieue elite academy pipeline with fierce competition.' },
        { city: 'Marseille', description: 'Southern coast academy with passionate, demanding fans.' },
        { city: 'Lyon', description: 'Rhône valley youth system famous for technical excellence.' },
        { city: 'Nice', description: 'French Riviera youth ranks with tactical sophistication.' },
        { city: 'Bordeaux', description: 'Aquitaine development hub focused on discipline.' }
      ],
      Portugal: [
        { city: 'Lisbon', description: 'Alcochete academy grounds that produced Ballon d\'Or winners.' },
        { city: 'Porto', description: 'Olival youth center focused on tactical toughness.' },
        { city: 'Braga', description: 'Minho region development hub known for sharp technical training.' },
        { city: 'Coimbra', description: 'Historic university city academy circuit.' },
        { city: 'Faro', description: 'Algarve coastal development ranks.' }
      ],
      Italy: [
        { city: 'Milan', description: 'Milanello academy grounds built on defensive perfection.' },
        { city: 'Rome', description: 'Trigoria youth ranks where passion and pressure collide.' },
        { city: 'Naples', description: 'Campania youth circuit under the shadow of footballing gods.' },
        { city: 'Turin', description: 'Piedmont academy grounds emphasizing tactical discipline.' },
        { city: 'Florence', description: 'Tuscan youth setup known for creative flair.' }
      ],
      Netherlands: [
        { city: 'Amsterdam', description: 'De Toekomst academy emphasizing Total Football principles.' },
        { city: 'Rotterdam', description: 'Varkenoord grounds built on working-class grit.' },
        { city: 'Eindhoven', description: 'De Herdgang facility with cutting-edge sport science.' },
        { city: 'Utrecht', description: 'Central development hub with technical focus.' },
        { city: 'The Hague', description: 'Randstad regional academy circuit.' }
      ]
    },
    familyOptions: [
      {
        id: 'athlete_parents',
        title: 'Ex-Athlete Parents',
        description: 'Parents who were former pro athletes and understand the mental toll of major injuries.',
        npcName: 'Parent (Ex-Athlete)',
        startingRelationship: 85
      },
      {
        id: 'anxious_family',
        title: 'Anxious Family',
        description: 'An overbearing family who panicked when your ACL tore and constantly worry about relapses.',
        npcName: 'Anxious Household',
        startingRelationship: 65
      },
      {
        id: 'loyal_partner',
        title: 'Loyal Companion',
        description: 'A steadfast partner/friend who stayed by your hospital bed when scouts vanished.',
        npcName: 'Loyal Companion',
        startingRelationship: 90
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Julian Vance',
        roleOrPosition: 'CAM',
        title: 'Academy Rival: Julian Vance',
        description: 'The former academy teammate who took your starting shirt while you were in surgery.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Dr. Arthur Vance',
        roleOrPosition: 'Rehab Specialist',
        title: 'Physio Mentor: Dr. Arthur Vance',
        description: 'The veteran physio who spent 18 months rebuilding your knee ligaments and taught you sports physiology.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'prove_doubters',
        tag: 'Defy Skeptics',
        question: 'Can you prove to the European elite that your body and mind are not broken?',
        description: 'Focuses on reclaiming your reputation and silencing doctors and scouts who wrote you off.'
      },
      {
        id: 'self_forgiveness',
        tag: 'Internal Healing',
        question: 'Can you forgive yourself for the lost years and rediscover the pure joy of playing?',
        description: 'Focuses on overcoming mental fear of injury and finding peace with your career arc.'
      }
    ]
  },

  LATE_BLOOMER: {
    formativeMoment: {
      title: "The 5:00 AM Shift Alarm",
      sceneText: "Your alarm rings at 5:00 AM on a freezing rainy morning. You have an 8-hour shift at the warehouse before a 100-mile drive to play a semi-pro cup tie.",
      choices: [
        {
          id: 'iron_will',
          label: 'Option A: Hit the Pre-Shift Gym',
          text: 'Lace up your boots, hit the gym before the warehouse shift, and embrace the grind.',
          frameTag: 'Iron Will Worker',
          decisionMemoryText: 'Embraced the 5 AM pre-shift workout before Sunday League matches.'
        },
        {
          id: 'tactical_study',
          label: 'Option B: Study Opponent Movement',
          text: 'Spend your lunch break studying tactical videos on your phone to outsmart academy-bred opponents.',
          frameTag: 'Self-Taught Student',
          decisionMemoryText: 'Studied opposition movement during warehouse lunch breaks.'
        }
      ]
    },
    regions: {
      Norway: [
        { city: 'Oslo', description: 'Grassroots Eastside district leagues with snowy turf games.' },
        { city: 'Bergen', description: 'Coastal West region leagues played in torrential rains.' },
        { city: 'Trondheim', description: 'Trøndelag amateur circuit forging tough physical defenders.' }
      ],
      Sweden: [
        { city: 'Stockholm', description: 'Suburb division teams battling on synthetic winter pitches.' },
        { city: 'Gothenburg', description: 'Docks local teams known for uncompromising physical play.' },
        { city: 'Malmö', description: 'South coast amateur leagues producing resilient talents.' }
      ],
      Poland: [
        { city: 'Warsaw', description: 'District league matches on gravel and hard dirt pitches.' },
        { city: 'Kraków', description: 'Małopolska regional division with intense local rivalries.' },
        { city: 'Gdańsk', description: 'Baltic coast regional teams forged in harsh sea winds.' }
      ],
      Egypt: [
        { city: 'Cairo', description: 'Dense urban amateur leagues under blazing desert heat.' },
        { city: 'Alexandria', description: 'Mediterranean dockyard teams with passionate working fans.' },
        { city: 'Giza', description: 'Pyramids district Sunday league with fierce community pride.' }
      ],
      Morocco: [
        { city: 'Casablanca', description: 'Hay Mohammadi regional league with packed touchlines.' },
        { city: 'Marrakech', description: 'Atlas mountain district teams built on endurance.' },
        { city: 'Tangier', description: 'Strait region amateur circuit mixing physical and coastal flair.' }
      ],
      Nigeria: [
        { city: 'Lagos', description: 'Industrial district Sunday league teams.' },
        { city: 'Kano', description: 'City regional league forging resilient athletes.' },
        { city: 'Port Harcourt', description: 'Refinery amateur teams built on pure power.' }
      ]
    },
    familyOptions: [
      {
        id: 'supportive_spouse',
        title: 'Pragmatic Partner',
        description: 'A supportive partner who manages the household budget while you juggle work and trials.',
        npcName: 'Supportive Partner',
        startingRelationship: 85
      },
      {
        id: 'blue_collar_parents',
        title: 'Blue-Collar Parents',
        description: 'Working-class parents who taught you the value of honest labor and zero entitlement.',
        npcName: 'Work Ethic Parents',
        startingRelationship: 80
      },
      {
        id: 'self_reliant',
        title: 'Self-Reliant Solitary',
        description: 'Self-funded every pair of boots, gym passes, and physio tape out of your own wage packet.',
        npcName: 'Self-Made Circle',
        startingRelationship: 65
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Darren "The Tank" Smith',
        roleOrPosition: 'CB',
        title: 'Grudge Rival: Darren Smith',
        description: 'The veteran Sunday league defender who tried to bully you off the park in regional cup ties.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Garry "Mac" MacIntyre',
        roleOrPosition: 'Sunday Captain',
        title: 'Sunday Mentor: Garry MacIntyre',
        description: 'The grizzled 42-year-old amateur captain who saw your raw power and taught you positioning.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'working_class_ascent',
        tag: 'Working Class Pride',
        question: 'Is it too late for a blue-collar worker to reach the top flights of professional football?',
        description: 'Focuses on proving that late starters can compete with pampered academy products.'
      },
      {
        id: 'physical_dominance',
        tag: 'Grit vs Finesse',
        question: 'Can pure physical power and relentless work ethic conquer pampered tactical systems?',
        description: 'Focuses on using your raw strength and engine to overpower technical opposition.'
      }
    ]
  },

  ACADEMY_GRADUATE: {
    formativeMoment: {
      title: "The Contract Review Evaluation",
      sceneText: "You sit across from the Academy Director in a glass-walled office at the £50m training complex. Your GPS tracking data and pass completion metrics (89.4%) are displayed on an iPad screen.",
      choices: [
        {
          id: 'extra_duels',
          label: 'Option A: Request Contact Drills',
          text: 'Politely speak up to request extra physical contact sessions with senior U21 defenders.',
          frameTag: 'Determined Professional',
          decisionMemoryText: 'Requested extra physical contact sessions during academy contract review.'
        },
        {
          id: 'tactical_analysis',
          label: 'Option B: Present Pressing Diagram',
          text: 'Present your own video breakdown of team pressing triggers to demonstrate tactical leadership.',
          frameTag: 'Tactical Captain',
          decisionMemoryText: 'Presented self-analyzed tactical pressing triggers to academy directors.'
        }
      ]
    },
    regions: {
      England: [
        { city: 'London', description: 'Cobham / Colney catchment with elite facility standards.' },
        { city: 'Manchester', description: 'Carrington / Etihad Campus youth pipeline with global reach.' },
        { city: 'Birmingham', description: 'Midlands youth ranks known for producing battle-ready midfielders.' }
      ],
      Germany: [
        { city: 'Berlin', description: 'Capital city academy system focused on athletic intelligence.' },
        { city: 'Munich', description: 'Säbener Straße development with relentless winning mindset.' },
        { city: 'Dortmund', description: 'Westfalen youth academy famous for high-intensity pressing.' }
      ],
      Spain: [
        { city: 'Madrid', description: 'La Fábrica system built on high technical composure.' },
        { city: 'Barcelona', description: 'La Masia positional play academy.' },
        { city: 'Seville', description: 'Andalusia youth system emphasizing fiery competitive spirit.' }
      ],
      France: [
        { city: 'Paris', description: 'Clairefontaine corridor supplying top European leagues.' },
        { city: 'Lyon', description: 'Groupama academy renowned for tactical versatility.' },
        { city: 'Marseille', description: 'Southern development hub under intense local pressure.' }
      ],
      Netherlands: [
        { city: 'Amsterdam', description: 'De Toekomst youth academy.' },
        { city: 'Rotterdam', description: 'Varkenoord academy.' },
        { city: 'Eindhoven', description: 'De Herdgang sports science center.' }
      ]
    },
    familyOptions: [
      {
        id: 'dedicated_family',
        title: 'Dedicated Youth Family',
        description: 'A supportive family who drove you thousands of miles to youth tournaments every weekend.',
        npcName: 'Dedicated Family',
        startingRelationship: 85
      },
      {
        id: 'ex_pro_father',
        title: 'Ex-Professional Father',
        description: 'An ex-pro father whose high standards and post-match critiques hang over every session.',
        npcName: 'Ex-Pro Father',
        startingRelationship: 70
      },
      {
        id: 'academic_parents',
        title: 'Academic Parents',
        description: 'Parents who insisted on top school grades alongside academy training to keep you balanced.',
        npcName: 'Academic Parents',
        startingRelationship: 80
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Ethan Sterling',
        roleOrPosition: 'CM',
        title: 'Academy Rival: Ethan Sterling',
        description: 'The hyped fellow graduate who received all the club media spotlight and early senior calls.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'David Hirst',
        roleOrPosition: 'Club Captain',
        title: 'First-Team Mentor: David Hirst',
        description: 'The senior first-team captain who pulled you aside during senior training to guide your positioning.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'handle_badge_weight',
        tag: 'Badge Weight',
        question: 'Can you handle the weight of the club badge and prove you have the grit to survive senior football?',
        description: 'Focuses on transitioning from smooth academy prospect to battle-tested senior professional.'
      },
      {
        id: 'father_shadow',
        tag: 'Personal Identity',
        question: 'Can you step out of the shadow of your ex-pro family to forge your own legacy?',
        description: 'Focuses on defining your own style and name independent of family expectations.'
      }
    ]
  },

  FROM_SCRATCH: {
    formativeMoment: {
      title: "The One-Way Bus Ticket",
      sceneText: "You stand at the windy bus station with your entire life packed into a worn duffel bag and £40 in your pocket. The trial match is 200 miles away. If you fail, you have no money for the trip home.",
      choices: [
        {
          id: 'hungry_fighter',
          label: 'Option A: Terminal Park Laps',
          text: 'Spend your last few coins on a cheap energy bar and run park laps near the terminal to warm up.',
          frameTag: 'Hungry Fighter',
          decisionMemoryText: 'Ran park laps at the bus terminal with £40 left to prepare for trial.'
        },
        {
          id: 'stoic_focus',
          label: 'Option B: Mental Visualization',
          text: 'Sit quietly on the bus bench, visualizing every pitch scenario with intense focus.',
          frameTag: 'Stoic Survivor',
          decisionMemoryText: 'Visualized trial match scenarios on a cold bus station bench.'
        }
      ]
    },
    regions: {
      Brazil: [
        { city: 'São Paulo', description: 'Outer favela district with zero margin for error.' },
        { city: 'Rio de Janeiro', description: 'North zone urban sprawl where survival comes first.' },
        { city: 'Salvador', description: 'Coastal municipality street leagues.' }
      ],
      England: [
        { city: 'London', description: 'East London housing estate pitches.' },
        { city: 'Manchester', description: 'Industrial outskirts with gritty Sunday leagues.' },
        { city: 'Birmingham', description: 'Inner city district leagues.' }
      ],
      Spain: [
        { city: 'Madrid', description: 'Outer suburb clay courts.' },
        { city: 'Barcelona', description: 'Besòs neighbourhood local games.' },
        { city: 'Seville', description: 'Polígono district amateur pitches.' }
      ],
      Senegal: [
        { city: 'Dakar', description: 'Pikine township sandy pitches.' },
        { city: 'Thiès', description: 'Central province grassroots tournaments.' },
        { city: 'Saint-Louis', description: 'Northern river city community grounds.' }
      ],
      Mexico: [
        { city: 'Mexico City', description: 'Iztapalapa district street games.' },
        { city: 'Guadalajara', description: 'Outer barrio amateur leagues.' },
        { city: 'Monterrey', description: 'Industrial valley concrete courts.' }
      ]
    },
    familyOptions: [
      {
        id: 'lone_wolf',
        title: 'Lone Wolf',
        description: 'Completely on your own with no safety net or family calls, relying on pure self-preservation.',
        npcName: 'Self-Made Lone Wolf',
        startingRelationship: 50
      },
      {
        id: 'grandmother',
        title: 'Devoted Grandmother',
        description: 'A struggling grandmother who gave you her blessing and a hand-knitted scarf for warmth.',
        npcName: 'Grandmother',
        startingRelationship: 75
      },
      {
        id: 'estate_friends',
        title: 'Neighborhood Circle',
        description: 'A group of childhood friends who pooled their meager savings to buy your bus ticket.',
        npcName: 'Estate Friends',
        startingRelationship: 85
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Nico "El Duro" Gomez',
        roleOrPosition: 'ST',
        title: 'Trialist Rival: Nico Gomez',
        description: 'The ruthless local trialist who tried to intimidate you in the changing room before kick-off.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Old Sam',
        roleOrPosition: 'Grassroots Kitman',
        title: 'Kitman Mentor: Old Sam',
        description: 'The former lower-league kitman who gave you free tea and advised you on what scouts look for.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'zero_to_hero',
        tag: 'Absolute Ascent',
        question: 'Can you rise from absolute zero to force the footballing world to recognize your name?',
        description: 'Focuses on the heroic climb from rock bottom to elite professional status.'
      },
      {
        id: 'security_first',
        tag: 'Building Security',
        question: 'Can you build financial security for yourself and your neighborhood so you never go hungry again?',
        description: 'Focuses on using football as a vehicle to escape poverty and secure your future.'
      }
    ]
  },

  EXILE: {
    formativeMoment: {
      title: "The Departure Lounge Statement",
      sceneText: "You hold a boarding pass to Europe in one hand and contract termination paperwork in the other. Online fans back home posted angry comments calling you ungrateful for walking away from comfort.",
      choices: [
        {
          id: 'defiant_post',
          label: 'Option A: Bold Public Statement',
          text: 'Post a short, confident statement online: "I came to test myself against the best. No regrets."',
          frameTag: 'Unapologetic Competitor',
          decisionMemoryText: 'Posted a bold farewell statement before flying to European trial.'
        },
        {
          id: 'silent_focus',
          label: 'Option B: Mute Social Channels',
          text: 'Turn off your phone, put on headphones, and focus entirely on adapting to European football.',
          frameTag: 'Focused Exile',
          decisionMemoryText: 'Muted media channels to prepare for European football integration.'
        }
      ]
    },
    regions: {
      Japan: [
        { city: 'Tokyo', description: 'J-League capital circuit with high tactical discipline.' },
        { city: 'Osaka', description: 'Kansai region club known for passionate attacking football.' },
        { city: 'Yokohama', description: 'Bay area club with international coaching influences.' }
      ],
      'South Korea': [
        { city: 'Seoul', description: 'K-League capital powerhouse with relentless stamina expectations.' },
        { city: 'Busan', description: 'Southern port city club focused on direct physical duels.' },
        { city: 'Incheon', description: 'West coast team known for tactical fighting spirit.' }
      ],
      'United States': [
        { city: 'New York', description: 'Metropolitan MLS academy system.' },
        { city: 'Los Angeles', description: 'SoCal youth circuit with high technical flair.' },
        { city: 'Chicago', description: 'Midwest MLS pipeline emphasizing athletic power.' }
      ],
      'Saudi Arabia': [
        { city: 'Riyadh', description: 'Capital Pro League club with elite international stars.' },
        { city: 'Jeddah', description: 'Red Sea powerhouse with intense derby atmospheres.' },
        { city: 'Dammam', description: 'Eastern province team known for disciplined tactical setup.' }
      ],
      Australia: [
        { city: 'Sydney', description: 'A-League harbor city club emphasizing physical fitness.' },
        { city: 'Melbourne', description: 'Victorian football hub with rich European roots.' },
        { city: 'Brisbane', description: 'Queensland league team playing high-intensity pressing.' }
      ],
      Senegal: [
        { city: 'Dakar', description: 'Génération Foot roots supplying European top tiers.' },
        { city: 'Thiès', description: 'Pro regional development center.' },
        { city: 'Saint-Louis', description: 'Northern river city club with technical roots.' }
      ]
    },
    familyOptions: [
      {
        id: 'overseas_family',
        title: '3 AM Streaming Family',
        description: 'A supportive family back home who wake up at 3:00 AM local time to stream your matches live.',
        npcName: 'Overseas Family',
        startingRelationship: 85
      },
      {
        id: 'entourage_circle',
        title: 'Home Entourage',
        description: 'An entourage of childhood friends and advisors who moved with you to handle logistics.',
        npcName: 'Inner Circle',
        startingRelationship: 70
      },
      {
        id: 'intl_agent',
        title: 'Ambition Agent',
        description: 'A demanding agent who engineered this European jump to prove your true international value.',
        npcName: 'International Agent',
        startingRelationship: 75
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Kenji Sato',
        roleOrPosition: 'CAM',
        title: 'Domestic Rival: Kenji Sato',
        description: 'The star back home who stayed on a lucrative contract and publicly questioned your European ambitions.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Hidetoshi Tanaka',
        roleOrPosition: 'Ex-International Star',
        title: 'Exile Mentor: Hidetoshi Tanaka',
        description: 'An older international icon who made the same jump a decade ago and gave you his playbook on European football.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'prove_elite_belonging',
        tag: 'European Validation',
        question: 'Can you prove that your talents belong in Europe\'s elite leagues rather than lucrative comfort?',
        description: 'Focuses on winning respect in Europe after leaving financial security behind.'
      },
      {
        id: 'silence_pundits',
        tag: 'Outsider Respect',
        question: 'Can you earn the respect of a skeptical media that views you as a soft outsider?',
        description: 'Focuses on overcoming prejudice against non-European league backgrounds.'
      }
    ]
  },

  NON_LEAGUE: {
    formativeMoment: {
      title: "The FA Cup Muddy Pitch Battle",
      sceneText: "It's the 88th minute of a rainy FA Cup Qualifier on a muddy pitch. An opposing veteran defender elbows you in the ribs on a corner kick and whispers: 'Welcome to real football, lad.'",
      choices: [
        {
          id: 'power_header',
          label: 'Option A: Power Header Goal',
          text: 'Hold your ground, win the header with sheer aggression, and score the match winner.',
          frameTag: 'Enforcer Striker',
          decisionMemoryText: 'Powered through a physical elbow to score the FA Cup qualifier winner.'
        },
        {
          id: 'slick_feint',
          label: 'Option B: Crafty Body Feint',
          text: 'Use a slick body feint to leave him slipping in the mud and deliver a pin-point assist.',
          frameTag: 'Crafty Craftsman',
          decisionMemoryText: 'Outmaneuvered non-league defenders in heavy mud with sharp footwork.'
        }
      ]
    },
    regions: {
      England: [
        { city: 'London', description: 'Isthmian league district with passionate neighborhood crowds.' },
        { city: 'Manchester', description: 'Northern Premier circuit played on unforgiving winter turf.' },
        { city: 'Birmingham', description: 'Midland Alliance with fierce local derby rivalries.' },
        { city: 'Newcastle', description: 'Northern League forged in industrial cold.' }
      ],
      Wales: [
        { city: 'Cardiff', description: 'Welsh League district with passionate terrace support.' },
        { city: 'Swansea', description: 'South Wales league playing along the windy coast.' },
        { city: 'Wrexham', description: 'North Wales circuit built on community tradition.' }
      ],
      Scotland: [
        { city: 'Glasgow', description: 'West of Scotland league famous for intense physical duels.' },
        { city: 'Edinburgh', description: 'East of Scotland division with storied local clubs.' },
        { city: 'Aberdeen', description: 'Highland league played on frozen northern grounds.' }
      ],
      Ireland: [
        { city: 'Dublin', description: 'Leinster Senior League forging tough box-to-box players.' },
        { city: 'Cork', description: 'Munster Senior League with intense local pride.' },
        { city: 'Galway', description: 'Western circuit known for relentless match tempos.' }
      ]
    },
    familyOptions: [
      {
        id: 'canteen_family',
        title: 'Grassroots Canteen Family',
        description: 'A working-class family who volunteer at the local club canteen and matchday raffle every weekend.',
        npcName: 'Grassroots Family',
        startingRelationship: 85
      },
      {
        id: 'workplace_mates',
        title: 'Workplace Supporters',
        description: 'Work colleagues from your 9-to-5 job who attend your matches with homemade banners.',
        npcName: 'Workplace Mates',
        startingRelationship: 80
      },
      {
        id: 'community_club',
        title: 'Local Supporters Club',
        description: 'A supportive neighborhood community that chipped in to buy your modern lightweight boots.',
        npcName: 'Community Supporters Club',
        startingRelationship: 75
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Big Dave Mickles',
        roleOrPosition: 'CB',
        title: 'Non-League Rival: Dave Mickles',
        description: 'The terrifying 34-year-old non-league defender who vowed no Sunday league player would outshine him.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Bertie Smith',
        roleOrPosition: 'Non-League Gaffer',
        title: 'Non-League Mentor: Bertie Smith',
        description: 'The legendary 60-year-old manager who gave you your semi-pro debut and taught you how to survive physical duels.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'keep_working_class_soul',
        tag: 'Working Class Soul',
        question: 'Can a working-class non-league hero transition to professional football without losing their soul?',
        description: 'Focuses on keeping your authenticity and link to working-class roots in pro football.'
      },
      {
        id: 'technical_refinement',
        tag: 'Technical Adaptation',
        question: 'Can you bridge the technical gap to prove non-league players belong on big stadium pitches?',
        description: 'Focuses on polishing your technical game to prove you are more than just a hard runner.'
      }
    ]
  },

  ACADEMY_PRODIGY: {
    formativeMoment: {
      title: "The Legend's Private Session",
      sceneText: "The retired club icon mentoring you invites you to a private pitch after dark. He places five cones on the edge of the box and throws a ball at your chest at high speed.",
      choices: [
        {
          id: 'chest_volley',
          label: 'Option A: Instant Top-Corner Volley',
          text: 'Control it on your chest and volley it instantly into the top corner without hesitation.',
          frameTag: 'Instant Instinct',
          decisionMemoryText: 'Executed a flawless chest-volley in night training with club legend.'
        },
        {
          id: 'measured_placement',
          label: 'Option B: Cushion & Side-Netting Bend',
          text: 'Cushion it softly, look up to check the goalkeeper, and bend it into the side netting.',
          frameTag: 'Clinical Precision',
          decisionMemoryText: 'Demonstrated measured technique during private session with club legend.'
        }
      ]
    },
    regions: {
      England: [
        { city: 'London', description: 'Capital city academy catchment with intense scout interest.' },
        { city: 'Manchester', description: 'North West football hub with world-class facilities.' },
        { city: 'Birmingham', description: 'Midlands youth grounds with strong physical traditions.' }
      ],
      France: [
        { city: 'Paris', description: 'Capital academy grounds producing elite international talent.' },
        { city: 'Lyon', description: 'Rhône valley academy famed for technical development.' },
        { city: 'Marseille', description: 'Mediterranean port club with passionate support.' }
      ],
      Germany: [
        { city: 'Munich', description: 'Bavarian youth development built on tactical mastery.' },
        { city: 'Dortmund', description: 'Ruhr valley youth center with high-tempo football culture.' },
        { city: 'Berlin', description: 'Metropolitan academy system.' }
      ],
      Spain: [
        { city: 'Madrid', description: 'Royal academy grounds with relentless pressure to win.' },
        { city: 'Barcelona', description: 'Catalan youth system focused on positional game.' },
        { city: 'Seville', description: 'Andalusian youth academy.' }
      ],
      Italy: [
        { city: 'Milan', description: 'Lombardy football capital youth grounds.' },
        { city: 'Rome', description: 'Capital youth ranks with deep emotional fan connections.' },
        { city: 'Turin', description: 'Piedmont academy built on tactical discipline.' }
      ],
      Brazil: [
        { city: 'São Paulo', description: 'Paulista youth championship circuit.' },
        { city: 'Rio de Janeiro', description: 'Carioca youth system.' },
        { city: 'Porto Alegre', description: 'Southern academy system.' }
      ],
      Argentina: [
        { city: 'Buenos Aires', description: 'Capital youth divisions.' },
        { city: 'Rosario', description: 'Santa Fe region youth hub.' },
        { city: 'Córdoba', description: 'Central academy circuit.' }
      ]
    },
    familyOptions: [
      {
        id: 'dynasty_family',
        title: 'Football Dynasty',
        description: 'A storied sports dynasty family with generations of professional athletic experience.',
        npcName: 'Dynasty Family',
        startingRelationship: 85
      },
      {
        id: 'grounding_family',
        title: 'Grounding Family',
        description: 'A humble family who ban football talk at the dinner table to keep your life balanced.',
        npcName: 'Grounding Household',
        startingRelationship: 80
      },
      {
        id: 'protective_guardians',
        title: 'Protective Guardians',
        description: 'A protective guardian team managed by trusted advisors to shield you from tabloid media.',
        npcName: 'Guardian Circle',
        startingRelationship: 75
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Gabriel Moreau',
        roleOrPosition: 'LW',
        title: 'Prodigy Rival: Gabriel Moreau',
        description: 'The rival academy wonderkid who claims you only received mentorship because of your family name.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'El Maestro',
        roleOrPosition: 'Retired Club Icon',
        title: 'Iconic Mentor: El Maestro',
        description: 'The legendary retired club icon who hand-picked you for private sessions and passed down his jersey number.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'surpass_mentor',
        tag: 'Surpassing Legacy',
        question: 'Can the protégé surpass the shadow of their legendary mentor to write a unique chapter?',
        description: 'Focuses on exceeding the achievements of the icon who guided your early development.'
      },
      {
        id: 'earned_merit',
        tag: 'Merit vs Privilege',
        question: 'Can you prove that your place at the top is earned through raw desire rather than inherited name?',
        description: 'Focuses on silencing whispers of favoritism through undeniable pitch performances.'
      }
    ]
  },

  WONDERKID: {
    formativeMoment: {
      title: "The $50M Debut Press Conference",
      sceneText: "At age 16, 40 journalists flash cameras in your face as the club president presents your senior contract. A senior reporter asks: 'Do you truly believe a 16-year-old can carry this club?'",
      choices: [
        {
          id: 'audacious_response',
          label: 'Option A: "I Was Born Ready"',
          text: 'Look him dead in the eye and reply: "I was born ready. Age is just a number."',
          frameTag: 'Audacious Prodigy',
          decisionMemoryText: 'Declared "I was born ready" in viral debut press conference at age 16.'
        },
        {
          id: 'composed_response',
          label: 'Option B: Composed Maturity',
          text: 'Smile calmly and answer: "I\'m here to learn from the senior players and work hard every day."',
          frameTag: 'Composed Phenom',
          decisionMemoryText: 'Handled intense 16-year-old press spotlight with calm maturity.'
        }
      ]
    },
    regions: {
      Brazil: [
        { city: 'São Paulo', description: 'Paulista youth circuit where scouts from 20 European clubs attend every match.' },
        { city: 'Rio de Janeiro', description: 'Carioca youth grounds surrounded by media hype.' },
        { city: 'Santos', description: 'Coastal academy grounds that bred iconic wonderkids.' }
      ],
      England: [
        { city: 'London', description: 'Capital city youth ranks under constant tabloid spotlight.' },
        { city: 'Manchester', description: 'North West youth system with multi-million pound development facilities.' },
        { city: 'Liverpool', description: 'Merseyside academy known for passionate local support.' }
      ],
      Spain: [
        { city: 'Madrid', description: 'Capital club youth ranks with global media coverage.' },
        { city: 'Barcelona', description: 'Catalan youth academy.' },
        { city: 'Bilbao', description: 'Basque region youth pipeline.' }
      ],
      France: [
        { city: 'Paris', description: 'Île-de-France talent hotbed with scout frenzies.' },
        { city: 'Lyon', description: 'Rhône valley youth system.' },
        { city: 'Monaco', description: 'Riviera development system.' }
      ],
      Argentina: [
        { city: 'Buenos Aires', description: 'Capital youth championship.' },
        { city: 'Rosario', description: 'Santa Fe region youth center.' }
      ],
      Germany: [
        { city: 'Munich', description: 'Bavarian youth setup.' },
        { city: 'Dortmund', description: 'Ruhr valley youth center.' }
      ],
      Portugal: [
        { city: 'Lisbon', description: 'Lisbon academy system.' },
        { city: 'Porto', description: 'Porto youth grounds.' }
      ]
    },
    familyOptions: [
      {
        id: 'family_management',
        title: 'Family Brand Team',
        description: 'A tight-knit family management team that protects your brand, media, and mental wellbeing.',
        npcName: 'Family Management Team',
        startingRelationship: 85
      },
      {
        id: 'protective_parent',
        title: 'Digital Detox Parent',
        description: 'A protective parent who strictly limits social media access to keep your focus on football.',
        npcName: 'Protective Parent',
        startingRelationship: 80
      },
      {
        id: 'celebrity_household',
        title: 'Media-Savvy Household',
        description: 'A high-profile household comfortable with red-carpet publicity and camera spotlights.',
        npcName: 'Media-Savvy Household',
        startingRelationship: 70
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Mateo Fernandez',
        roleOrPosition: 'ST',
        title: 'Wonderkid Rival: Mateo Fernandez',
        description: 'The rival $50m teenage sensation at a rival club whose stats are constantly compared to yours.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Superstar Mentor',
        roleOrPosition: 'World Class Star',
        title: 'Superstar Mentor',
        description: 'The international superstar who adopted you as his protégé on your first day at senior training.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'survive_global_hype',
        tag: 'Generational Hype',
        question: 'Can you survive the crushing weight of global generational hype to become a world-class great?',
        description: 'Focuses on delivering on impossible external expectations and world-class potential.'
      },
      {
        id: 'love_for_game',
        tag: 'Purity of Sport',
        question: 'Can you maintain your pure love for football when everyone around you treats you as a commodity?',
        description: 'Focuses on preserving your human passion for the game amidst commercialization.'
      }
    ]
  },

  NEPOTISM_CASE: {
    formativeMoment: {
      title: "The Tunnel Whisper",
      sceneText: "You step into the tunnel before a televised youth final. A veteran spectator calls out: 'He's only starting because of his old man!' The cameras zoom in on your reaction.",
      choices: [
        {
          id: 'silence_crowd',
          label: 'Option A: Silence the Crowd',
          text: 'Score a curling free-kick and point to your own name on the back of your jersey.',
          frameTag: 'Defiant Independence',
          decisionMemoryText: 'Pointed to your own name on the shirt after a curling free-kick to silence nepotism chants.'
        },
        {
          id: 'unselfish_assist',
          label: 'Option B: Unselfish Assist',
          text: 'Play an unselfish squared pass for an unheralded teammate to tap in, prioritizing the team win.',
          frameTag: 'Unselfish Team Player',
          decisionMemoryText: 'Chose an unselfish squared pass over personal glory to prove team-first commitment.'
        }
      ]
    },
    regions: {
      England: [
        { city: 'London', description: 'Metropolitan hub with high-profile media exposure.' },
        { city: 'Manchester', description: 'Historic footballing city with deep legacy roots.' },
        { city: 'Birmingham', description: 'Midlands traditional academy circuit.' }
      ],
      France: [
        { city: 'Paris', description: 'Banlieue and central Parisian elite private coaching.' },
        { city: 'Lyon', description: 'Rhône valley system known for technical refinement.' },
        { city: 'Marseille', description: 'Southern coast intense footballing culture.' }
      ],
      Spain: [
        { city: 'Madrid', description: 'Capital city elite setup where legacy pressure is immense.' },
        { city: 'Barcelona', description: 'Catalan technical tradition with high media scrutiny.' },
        { city: 'Valencia', description: 'Coastal academy grounds with rich professional heritage.' }
      ],
      Italy: [
        { city: 'Milan', description: 'Fashion and football capital with legendary club dynasties.' },
        { city: 'Turin', description: 'Piedmont tactical grounds built on defensive rigor.' },
        { city: 'Rome', description: 'Passionate Roman football culture with family legacies.' }
      ],
      Netherlands: [
        { city: 'Amsterdam', description: 'Total Football academy system emphasizing technical perfection.' },
        { city: 'Rotterdam', description: 'Working-class port city academy with high work ethic.' },
        { city: 'Eindhoven', description: 'High-tech training center with modern analytics.' }
      ],
      Brazil: [
        { city: 'Rio de Janeiro', description: 'Fame and football crossover in iconic coastal academies.' },
        { city: 'São Paulo', description: 'Financial center elite academies with private training.' },
        { city: 'Porto Alegre', description: 'Gaucho football grounds known for fierce rivalries.' }
      ],
      Argentina: [
        { city: 'Buenos Aires', description: 'Barrio academies where family names carry legendary weight.' },
        { city: 'Rosario', description: 'Cradle of world football geniuses and technical maestros.' },
        { city: 'Córdoba', description: 'Central academy hub producing tenacious stars.' }
      ]
    },
    familyOptions: [
      {
        id: 'legend_parent',
        title: 'The Legend Parent',
        description: 'An iconic former national team star who offers elite tactical critique but casts a massive shadow.',
        npcName: 'Legend Senior',
        startingRelationship: 70
      },
      {
        id: 'agent_uncle',
        title: 'The Well-Connected Uncle',
        description: 'A powerful football agent who arranged top-tier trials and expects high financial returns.',
        npcName: 'Uncle Marcus',
        startingRelationship: 60
      },
      {
        id: 'grounding_parent',
        title: 'The Grounding Parent',
        description: 'Reminds you daily that you are your own person beyond the family name.',
        npcName: 'Parent / Guardian',
        startingRelationship: 85
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Dominic Thorne',
        roleOrPosition: 'AM/CM',
        title: 'Academy Rival: Dominic Thorne',
        description: 'A self-made academy standout who believes you stole his starting spot through family politics.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Coach Frank Vance',
        roleOrPosition: 'Veteran Youth Director',
        title: 'Mentor: Coach Vance',
        description: 'Your parent\'s former teammate who promised to treat you like any other player—with brutally honest feedback.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'own_identity',
        tag: 'Individual Legacy',
        question: 'Can you become your own name, not just a shadow of someone else\'s?',
        description: 'Focuses on overcoming the "Nepo Pick" label and carving out an independent identity.'
      },
      {
        id: 'peer_respect',
        tag: 'Earning Respect',
        question: 'Can you win over a locker room that assumes you were handed everything?',
        description: 'Focuses on locker room cohesion, leadership, and earning authentic peer respect.'
      }
    ]
  },

  THE_REFUGEE: {
    formativeMoment: {
      title: "The Floodlit Dust Field",
      sceneText: "It's dusk in a transit sanctuary city. Local youth players challenged your group of refugee teenagers to a 5v5 match under streetlamps.",
      choices: [
        {
          id: 'ferocious_grit',
          label: 'Option A: Unyielding Tenacity',
          text: 'Throw yourself into every tackle and carry the ball through three challenges to score.',
          frameTag: 'Ferocious Grit',
          decisionMemoryText: 'Out-fought local opponents on a transit dust field through sheer unyielding tenacity.'
        },
        {
          id: 'cold_composure',
          label: 'Option B: Cold Composure',
          text: 'Calmly dictate the tempo, drawing defenders out and threading a needle-pass to split the defense.',
          frameTag: 'Cold Composure',
          decisionMemoryText: 'Displayed ice-cold calmness under pressure on the transit pitch.'
        }
      ]
    },
    regions: {
      Ukraine: [
        { city: 'Kyiv', description: 'Capital city transit hubs with vibrant grassroots tournaments.' },
        { city: 'Lviv', description: 'Western cultural center fostering resilient young talents.' },
        { city: 'Kharkiv', description: 'Eastern industrial city pitches where grit was forged.' }
      ],
      Syria: [
        { city: 'Damascus', description: 'Historic city courts where street games brought community together.' },
        { city: 'Aleppo', description: 'Resilient neighbourhood pitches built amid urban hardship.' },
        { city: 'Homs', description: 'Central city youth leagues played on dusty concrete.' }
      ],
      Somalia: [
        { city: 'Mogadishu', description: 'Coastal city beach games and street tournaments.' },
        { city: 'Hargeisa', description: 'Northern plateau fields known for rapid physical counter-attacks.' },
        { city: 'Kismayo', description: 'Southern port city games with relentless energy.' }
      ],
      Sudan: [
        { city: 'Khartoum', description: 'Nile confluence sand pitches forged under intense heat.' },
        { city: 'Omdurman', description: 'Historic footballing quarter with passionate local games.' },
        { city: 'Port Sudan', description: 'Red Sea coast leagues played on open harbour fields.' }
      ],
      Afghanistan: [
        { city: 'Kabul', description: 'Mountain basin street leagues with fierce competitive spirit.' },
        { city: 'Herat', description: 'Western valley pitches blending technical flair and stamina.' },
        { city: 'Mazar-i-Sharif', description: 'Northern province grounds where youth tournaments flourished.' }
      ],
      'DR Congo': [
        { city: 'Kinshasa', description: 'Sprawling megacity pitches brimming with raw physical talent.' },
        { city: 'Goma', description: 'Lakeside district fields where sports provided solace and hope.' },
        { city: 'Lubumbashi', description: 'Southern mining province leagues with intense local derbies.' }
      ],
      Colombia: [
        { city: 'Medellín', description: 'Mountain barrio turf pitches surrounded by passionate fans.' },
        { city: 'Cali', description: 'Salsa and football capital known for explosive pace and trickery.' },
        { city: 'Bogotá', description: 'High-altitude capital pitches forging remarkable lung capacity.' }
      ]
    },
    familyOptions: [
      {
        id: 'community_elder',
        title: 'Transit Sanctuary Elder',
        description: 'An elder who organized local football games in refugee camps to keep youth hopeful.',
        npcName: 'Elder Tariq',
        startingRelationship: 90
      },
      {
        id: 'resilient_family',
        title: 'Reunited Family',
        description: 'Family members who sacrificed everything so you could pursue a professional football trial.',
        npcName: 'Family Circle',
        startingRelationship: 85
      },
      {
        id: 'host_guardian',
        title: 'Host Country Mentor',
        description: 'A local community worker who provided housing and sponsored your first club registration.',
        npcName: 'Guardian Alex',
        startingRelationship: 80
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Viktor Vance',
        roleOrPosition: 'CB/DM',
        title: 'Resentful Defender: Viktor Vance',
        description: 'A local player who resented you taking his trial spot after you arrived in the host league.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Coach Hassan El-Amin',
        roleOrPosition: 'Camp Football Coordinator',
        title: 'Mentor: Coach Hassan',
        description: 'A former semi-pro player in transit who taught you composure when the world was in chaos.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'found_home',
        tag: 'Sanctuary & Purpose',
        question: 'Can this game finally give you the home that circumstance took away?',
        description: 'Focuses on finding stability, belonging, and a permanent home in football.'
      },
      {
        id: 'representation',
        tag: 'Dual Representation',
        question: 'Which nation\'s colors will you wear when international glory calls?',
        description: 'Focuses on the emotional decision between your birth country and host sanctuary nation.'
      }
    ]
  },

  LATE_REPLACEMENT: {
    formativeMoment: {
      title: "The 10th Minute Emergency Call",
      sceneText: "Pre-season friendly at a rain-soaked stadium. The star midfielder clutches his knee in pain in the 10th minute. The manager turns down the bench, looks past three seniors, and snaps: 'Kid! Warm up. You're on.'",
      choices: [
        {
          id: 'tidy_anchor',
          label: 'Option A: Play It Safe & Tidy',
          text: 'Keep passes simple and accurate, ensuring zero errors while holding the team structure.',
          frameTag: 'Reliable Anchor',
          decisionMemoryText: 'Delivered a mistake-free, tidy display when thrown in as a 10th-minute emergency substitute.'
        },
        {
          id: 'fearless_risk',
          label: 'Option B: Take the Audacious Risk',
          text: 'Attempt a 40-yard pinged switch of play on your first touch to spark an attack.',
          frameTag: 'Fearless Gambler',
          decisionMemoryText: 'Attempted an audacious switch of play on your very first touch as an emergency sub.'
        }
      ]
    },
    regions: {
      England: [
        { city: 'London', description: 'South London grass pitches and reserve fixtures.' },
        { city: 'Yorkshire', description: 'Gritty Northern reserve leagues played in harsh weather.' },
        { city: 'West Midlands', description: 'Industrial belt reserve circuits with fierce competition.' }
      ],
      Germany: [
        { city: 'Ruhr Valley', description: 'Working-class football region with intense team work ethics.' },
        { city: 'Bavaria', description: 'Southern reserve system with structured, disciplined play.' },
        { city: 'North Rhine', description: 'Dense football corridor with numerous professional academies.' }
      ],
      Spain: [
        { city: 'Basque Country', description: 'Rainy northern pitches forged on physical determination.' },
        { city: 'Galicia', description: 'Rugged coastal reserve leagues with uncompromising battles.' },
        { city: 'Valencia', description: 'Eastern coast academy reserves fighting for sparse senior slots.' }
      ],
      France: [
        { city: 'Normandy', description: 'Northern coast reserve circuits where discipline is tested.' },
        { city: 'Brittany', description: 'Passionate regional leagues with stubborn local pride.' },
        { city: 'Alsace', description: 'Eastern borderland reserves known for rigid tactical structure.' }
      ],
      Italy: [
        { city: 'Lombardy', description: 'Northern reserve leagues with tactical defensive emphasis.' },
        { city: 'Campania', description: 'Southern reserve fields played under intense emotional heat.' },
        { city: 'Tuscany', description: 'Central Italian reserve leagues focusing on positional discipline.' }
      ],
      Portugal: [
        { city: 'Porto', description: 'Northern coastal reserves forged on relentless competitive hunger.' },
        { city: 'Minho', description: 'Traditional football province with tough grassroots leagues.' },
        { city: 'Algarve', description: 'Southern region developmental leagues.' }
      ]
    },
    familyOptions: [
      {
        id: 'pragmatic_parents',
        title: 'Pragmatic Blue-Collar Parents',
        description: 'Remind you to keep your day job skills sharp in case football doesn\'t pan out.',
        npcName: 'Parents',
        startingRelationship: 80
      },
      {
        id: 'supportive_partner',
        title: 'Long-term Partner',
        description: 'Was there when you sat on the bench for 30 straight games without playing a minute.',
        npcName: 'Partner Jordan',
        startingRelationship: 85
      },
      {
        id: 'fringe_roommate',
        title: 'Fellow Bench-Warmer',
        description: 'A reserve teammate who shares your hunger to prove the coaches wrong.',
        npcName: 'Teammate Sam',
        startingRelationship: 75
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Julian "The Star" Sterling',
        roleOrPosition: 'ST/AM',
        title: 'Incumbent Starter: Julian Sterling',
        description: 'The injured star player whose spot you inherited, eager to reclaim his place and push you back to the bench.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Coach Dave Miller',
        roleOrPosition: 'Reserve Team Coach',
        title: 'Mentor: Coach Miller',
        description: 'The quiet reserve coach who secretly stayed after hours to train you when nobody else cared.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'accident_to_opportunity',
        tag: 'Seizing Chance',
        question: 'What happens when the accident becomes the opportunity?',
        description: 'Focuses on turning an unexpected emergency sub appearance into a permanent career breakthrough.'
      },
      {
        id: 'defying_expectations',
        tag: 'Overcoming Doubt',
        question: 'Can a player nobody planned for become a player nobody can drop?',
        description: 'Focuses on rising from lowest manager trust to an indispensable squad cornerstone.'
      }
    ]
  },

  SECOND_SPORT_CONVERT: {
    formativeMoment: {
      title: "The Cross-Code Testing Day",
      sceneText: "You're at the club's training ground testing session. In the 30-meter sprint and vertical jump, you shatter all-time academy records. But during the 11v11 match, a tactical pass flies past you because you didn't anticipate the run.",
      choices: [
        {
          id: 'raw_powerhouse',
          label: 'Option A: Physical Dominance',
          text: 'Use your monstrous power to overpower the defender and smash a 25-yard shot into the net.',
          frameTag: 'Raw Powerhouse',
          decisionMemoryText: 'Shattered physical testing records and used raw power to score a trial screamer.'
        },
        {
          id: 'tactical_student',
          label: 'Option B: Tactical Absorption',
          text: 'Immediately seek out the head coach after the whistle to ask for tactical positioning diagrams.',
          frameTag: 'Obsessive Student',
          decisionMemoryText: 'Stayed behind after physical trials to study tactical positioning diagrams with the coach.'
        }
      ]
    },
    regions: {
      'United States': [
        { city: 'New York', description: 'Metropolitan multi-sport collegiate pipeline.' },
        { city: 'Texas', description: 'High-school Friday night lights physical training grounds.' },
        { city: 'California', description: 'West coast beach and track athletic incubators.' }
      ],
      Ireland: [
        { city: 'Dublin', description: 'Dual Gaelic games and football athletic circuit.' },
        { city: 'Cork', description: 'Munster multi-sport heartland forged on stamina and power.' },
        { city: 'Galway', description: 'Western province cross-code athletic corridor.' }
      ],
      Australia: [
        { city: 'Melbourne', description: 'AFL and rugby cross-code athletic powerhouse.' },
        { city: 'Sydney', description: 'Harbour city multisport high-performance institutes.' },
        { city: 'Brisbane', description: 'Queensland rugby and athletics development grounds.' }
      ],
      England: [
        { city: 'London', description: 'Capital city track & field and rugby union talent pool.' },
        { city: 'North West', description: 'Industrial belt multi-sport athletic centers.' },
        { city: 'Yorkshire', description: 'Rugby league and sprint athletic strongholds.' }
      ],
      Jamaica: [
        { city: 'Kingston', description: 'World-famous sprinting grounds producing unparalleled acceleration.' },
        { city: 'Montego Bay', description: 'Coastal athletic trials and multi-sport tournaments.' },
        { city: 'St. Ann', description: 'Rural hills athletic circuit forged on raw physical endurance.' }
      ],
      'South Africa': [
        { city: 'Johannesburg', description: 'High-altitude multisport academy testing centers.' },
        { city: 'Cape Town', description: 'Coastal rugby and athletics elite school pipelines.' },
        { city: 'Durban', description: 'Subtropical coastal sports academies.' }
      ],
      'New Zealand': [
        { city: 'Auckland', description: 'Pacific athletic and rugby cross-code development.' },
        { city: 'Wellington', description: 'Windy capital sports institutes emphasizing endurance.' },
        { city: 'Christchurch', description: 'South Island physical testing centers.' }
      ],
      France: [
        { city: 'Paris', description: 'National athletics center and multi-sport academies.' },
        { city: 'Toulouse', description: 'Rugby heartland cross-code physical talent pool.' },
        { city: 'Bordeaux', description: 'Southwest multi-sport athletic grounds.' }
      ]
    },
    familyOptions: [
      {
        id: 'former_coach',
        title: 'Former Sport Coach',
        description: 'Your previous athletics/rugby/futsal coach who supports your code-switch but checks on your progress.',
        npcName: 'Coach Brody',
        startingRelationship: 80
      },
      {
        id: 'competitive_family',
        title: 'Athletic Dynasty Family',
        description: 'A family filled with collegiate or professional track/rugby athletes who hold you to high physical standards.',
        npcName: 'The Dynasty',
        startingRelationship: 75
      },
      {
        id: 'grassroots_friend',
        title: 'Grassroots Football Friend',
        description: 'A friend who played football since age six and helps you practice first-touch drills in the park.',
        npcName: 'Friend Leo',
        startingRelationship: 85
      }
    ],
    rivalMentorOptions: {
      rival: {
        type: 'RIVAL',
        name: 'Kieran Rossi',
        roleOrPosition: 'CB/RB',
        title: 'Purist Rival: Kieran Rossi',
        description: 'A football purist who resents "athletes" coming into the game and tries to expose your tactical ignorance.'
      },
      mentor: {
        type: 'MENTOR',
        name: 'Coach Alan "The Professor" Wright',
        roleOrPosition: 'Development Specialist',
        title: 'Mentor: Coach Wright',
        description: 'A specialist development coach hired by the club to turn physical freaks into tactically sound footballers.'
      }
    },
    drivingQuestionVariants: [
      {
        id: 'code_switch_success',
        tag: 'Cross-Sport Transition',
        question: 'Can raw talent from another world actually translate to this one?',
        description: 'Focuses on proving that elite multi-sport athleticism can conquer football\'s technical demands.'
      },
      {
        id: 'mastering_technique',
        tag: 'Technical Mastery',
        question: 'Will you remain a physical gimmick or refine yourself into a complete footballer?',
        description: 'Focuses on the grind to raise your technical attributes from bottom tier to professional standard.'
      }
    ]
  }
};
export interface ActChapterChoice {
  id: string;
  label: string;
  text: string;
  consequencesText: string;
  significance: 'MODERATE' | 'MAJOR' | 'DEFINING';
  decisionMemoryText: string;
}

export interface OriginActChapter {
  id: string;
  title: string;
  act: 1 | 2 | 3;
  triggerCondition: string;
  sceneText: string;
  choices: ActChapterChoice[];
}

export interface OriginNarrativeArc {
  origin: string; // BackstoryType
  act1: OriginActChapter[];
  act2: OriginActChapter[];
  act3: OriginActChapter[];
  outline?: {
    act1Summary: string;
    act2Summary: string;
    act3Summary: string;
    resolutionRange: string;
  };
}
export const ORIGIN_NARRATIVE_ARCS: Record<string, OriginNarrativeArc> = {
  FALLEN_PRODIGY: {
    origin: 'FALLEN_PRODIGY',
    act1: [
      {
        id: 'fp_a1_c1',
        title: 'The First Real Tackle',
        act: 1,
        triggerCondition: 'Triggered upon making first competitive appearance (not trial).',
        sceneText: 'The whistle blows. Five minutes into your debut, a rugged holding midfielder leaves his studs in on your knee—the same knee that stole two years of your life. The crack echoes. You fall. The stadium holds its breath. As you sit up, you realize... it holds. The joint is stable. The ghost is challenged, but the Driving Question remains: [Driving Question]',
        choices: [
          {
            id: 'fp_a1_c1_a',
            label: 'Jump up and confront him.',
            text: 'Let the adrenaline take over. Show them you aren\'t fragile anymore.',
            consequencesText: '+10 Form, +5 Teammate Relation, -2 Manager Trust (Hot-headed).',
            significance: 'MODERATE',
            decisionMemoryText: 'Reacted with fire when the reconstructed knee was tested in your debut.'
          },
          {
            id: 'fp_a1_c1_b',
            label: 'Smile and get back into position.',
            text: 'Ice in your veins. The surgery worked. You are ready to play football again.',
            consequencesText: '+5 Form, +5 Manager Trust, +5 Media Perception.',
            significance: 'MODERATE',
            decisionMemoryText: 'Remained stoic and completely unfazed after the first big tackle on your bad knee.'
          }
        ]
      },
      {
        id: 'fp_a1_c2',
        title: 'The Post-Match Ice Bath',
        act: 1,
        triggerCondition: 'Triggered after the first string of 3+ consecutive match appearances without injury.',
        sceneText: 'The physio hands you a bag of ice. "How is it?" he asks. For the first time in years, the ache is just normal fatigue, not a warning siren. You look at your phone. A text from your old youth coach, the one who said you were done: "Saw the highlights. Not bad." Your mentor/rival [Mentor/Rival Name] also weighed in publicly.',
        choices: [
          {
            id: 'fp_a1_c2_a',
            label: 'Ignore the noise, focus on the ice.',
            text: 'Keep your circle small. This is about physical survival, not vengeance.',
            consequencesText: 'Mental Fatigue significantly reduced. -5 Media Perception.',
            significance: 'MAJOR',
            decisionMemoryText: 'Prioritized physical longevity over settling scores with old youth coaches.'
          },
          {
            id: 'fp_a1_c2_b',
            label: 'Send a screenshot to your agent.',
            text: 'Time to leverage this. You want a better contract. You earned this comeback.',
            consequencesText: 'Agent begins demanding a new contract (+Wage potential). +10 Media Perception.',
            significance: 'MAJOR',
            decisionMemoryText: 'Used early comeback momentum to immediately push for better financial compensation.'
          }
        ]
      }
    ],
    act2: [
      {
        id: 'fp_a2_c1',
        title: 'The Medical Department\'s Warning',
        act: 2,
        triggerCondition: 'Triggered upon reaching Established or Star tier, or taking a major Role Specialization.',
        sceneText: 'You are now an established name. The manager wants to build the tactical system around you. But the Head of Medical pulls you into a private meeting. "The scans show fluid buildup. If you play the full 90 every week in this intense role, the knee will degrade. You need to manage your minutes, or risk a catastrophic relapse." [Driving Question]',
        choices: [
          {
            id: 'fp_a2_c1_a',
            label: 'Defy the medical team. Play every minute.',
            text: 'You didn\'t come back to sit on the bench. You will risk the relapse for glory.',
            consequencesText: '+15 Form, +10 Manager Trust. Injury Susceptibility massively increased.',
            significance: 'MAJOR',
            decisionMemoryText: 'Ignored medical advice to play every minute at the peak of your career.'
          },
          {
            id: 'fp_a2_c1_b',
            label: 'Adapt your game. Become a deep-lying playmaker.',
            text: 'Change your Role Specialization. Let the ball do the running.',
            consequencesText: 'Role Specialization shifts to deep-lying/less mobile. Pace/Stamina cap drops, Passing/Vision boosts. Injury Susceptibility stabilized.',
            significance: 'DEFINING',
            decisionMemoryText: 'Evolved your playstyle to protect your body, prioritizing longevity over explosive highlights.'
          }
        ]
      }
    ],
    act3: [
      {
        id: 'fp_a3_c1',
        title: 'The Final Verdict',
        act: 3,
        triggerCondition: 'Triggered upon reaching Icon tier or Age 32+.',
        sceneText: 'The twilight of your career. The media is writing your retrospective. A prominent journalist asks you point-blank in a sit-down interview: "Looking back at the injury that almost ended it before it began... was it a curse, or the making of you?" This is the resolution to: [Driving Question]',
        choices: [
          {
            id: 'fp_a3_c1_a',
            label: '"It made me who I am."',
            text: 'Embrace the journey. The pain forged a stronger mentality.',
            consequencesText: 'Massive World Reputation boost. Legacy secured as an inspirational figure.',
            significance: 'DEFINING',
            decisionMemoryText: 'Publicly embraced your early-career injury as the defining crucible that forged your success.'
          },
          {
            id: 'fp_a3_c1_b',
            label: '"I proved them all wrong."',
            text: 'Let the vindication show. You defied the skeptics through sheer willpower.',
            consequencesText: 'Huge boost to Peer Respect. You are feared and respected. Minor hit to Media Perception for arrogance.',
            significance: 'DEFINING',
            decisionMemoryText: 'Used your career retrospective to take a final victory lap over the doctors and scouts who doubted you.'
          }
        ]
      }
    ]
  },
  THE_REFUGEE: {
    origin: 'THE_REFUGEE',
    act1: [
      {
        id: 'ref_a1_c1',
        title: 'The First Paycheck',
        act: 1,
        triggerCondition: 'Triggered upon signing first professional contract / earning first real wage.',
        sceneText: 'You stare at your bank balance on your phone. It is more money than your family saw in a year back home. The temptation is to send it all back immediately, but your agent advises you to invest in a nutritionist and better housing to secure your long-term athletic future. [Driving Question]',
        choices: [
          {
            id: 'ref_a1_c1_a',
            label: 'Wire 90% of it to your family.',
            text: 'This is why you play. Their immediate comfort is worth more than sports science.',
            consequencesText: 'Family Relationship maxed. Mental Fatigue drops. Physical decay risk slightly increased due to poor recovery setup.',
            significance: 'MODERATE',
            decisionMemoryText: 'Sent your entire first professional paycheck home to support your family.'
          },
          {
            id: 'ref_a1_c1_b',
            label: 'Invest in your athletic setup.',
            text: 'To truly help them, you must reach the elite tier. You need your body to be perfect.',
            consequencesText: 'Gains 1 tier in Recovery Facilities. Family Relationship slightly strains. Training gains boosted.',
            significance: 'MODERATE',
            decisionMemoryText: 'Prioritized investing your early wages into your own athletic recovery to secure long-term success.'
          }
        ]
      }
    ],
    act2: [
      {
        id: 'ref_a2_c1',
        title: 'The Eligibility Call',
        act: 2,
        triggerCondition: 'Triggered upon reaching Star tier and entering a major International cycle.',
        sceneText: 'Your phone rings. It\'s the head coach of your host nation—the country that gave you sanctuary. They want to call you up for the qualifiers. Ten minutes later, your birth nation\'s federation calls. They are rebuilding, and they want you to be the face of their footballing renaissance. The dual representation question is here. [Driving Question]',
        choices: [
          {
            id: 'ref_a2_c1_a',
            label: 'Accept the host nation call-up.',
            text: 'Repay the country that gave you safety and a platform.',
            consequencesText: 'Locks international eligibility to host nation. Massive boost to local fan base and domestic sponsorships.',
            significance: 'DEFINING',
            decisionMemoryText: 'Pledged international allegiance to your adopted host nation in gratitude for sanctuary.'
          },
          {
            id: 'ref_a2_c1_b',
            label: 'Accept the birth nation call-up.',
            text: 'Honor your roots. Be a beacon of hope for those back home.',
            consequencesText: 'Locks international eligibility to birth nation. Massive boost to World Reputation and international respect. Minor local media backlash.',
            significance: 'DEFINING',
            decisionMemoryText: 'Chose to represent the nation of your birth, becoming a global symbol of hope.'
          }
        ]
      }
    ],
    act3: [
      {
        id: 'ref_a3_c1',
        title: 'The Foundation',
        act: 3,
        triggerCondition: 'Triggered upon reaching Icon tier or Age 32+.',
        sceneText: 'Your playing days are winding down. A major global NGO approaches you to start a football foundation bearing your name. They want to build academies, either in the neighborhood where you found refuge, or back in the war-torn region you fled. [Driving Question]',
        choices: [
          {
            id: 'ref_a3_c1_a',
            label: 'Build it in the neighborhood that took you in.',
            text: 'Cement your legacy in the community that raised you in exile.',
            consequencesText: 'Unlocks "Local Legend" retirement ending. Maximum club/city affinity.',
            significance: 'DEFINING',
            decisionMemoryText: 'Established your legacy foundation in the local neighborhoods that sheltered you.'
          },
          {
            id: 'ref_a3_c1_b',
            label: 'Build it back in your birth country.',
            text: 'Give the next generation the chances you had to flee to find.',
            consequencesText: 'Unlocks "Global Ambassador" retirement ending. Maximum World Reputation.',
            significance: 'DEFINING',
            decisionMemoryText: 'Dedicated your wealth and legacy to building football academies in your war-torn homeland.'
          }
        ]
      }
    ]
  },
  STREET_PRODIGY: {
    origin: 'STREET_PRODIGY',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1 (Breaking In): Triggered by first competitive starts. Focuses on the clash between raw street flair and rigid professional tactics. Choices involve defying the manager for a highlight reel moment or conforming to tactical discipline.',
      act2Summary: 'Act 2 (Establishing Yourself): Triggered at Star tier. Focuses on the entourage. Childhood friends want to be on the payroll. Choices involve keeping the old crew close (loyalty, but media drama) or cutting ties for a corporate agency (clean image, but emotional isolation).',
      act3Summary: 'Act 3 (Legacy-Defining): Triggered at age 32+. Resolves whether you remained an entertainer or became a ruthless winner. Legacy options include retiring as a beloved cult hero trickster or a decorated, disciplined captain.',
      resolutionRange: 'Ranges from "Loved by the streets, zero trophies" to "Decorated champion who lost their flair".'
    }
  },
  LATE_BLOOMER: {
    origin: 'LATE_BLOOMER',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: First top-flight match. Dealing with imposter syndrome and the physical shock of elite pacing compared to part-time football.',
      act2Summary: 'Act 2: First major contract negotiation. The tension of maximizing earning window vs. playing for a prestigious, demanding club, knowing time is short.',
      act3Summary: 'Act 3: Age 34+. The body breaks down. Do you drop back down the leagues for the love of the game, or retire at the top to protect the fairytale narrative?',
      resolutionRange: 'Ranges from "Secured the bag and retired early" to "Played until 40 in the lower leagues".'
    }
  },
  ACADEMY_GRADUATE: {
    origin: 'ACADEMY_GRADUATE',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: The loan spell dilemma. Accept a gritty loan to build character, or demand to stay and fight for a spot in a crowded elite midfield.',
      act2Summary: 'Act 2: The boyhood club vs. foreign giants. When a massive bid comes in, do you remain a one-club icon or chase Champions League glory abroad?',
      act3Summary: 'Act 3: Mentoring the next generation. A young wonderkid arrives to take your spot. Do you freeze them out, or teach them the academy way?',
      resolutionRange: 'Ranges from "One-Club Legend" to "Mercenary Superstar".'
    }
  },
  FROM_SCRATCH: {
    origin: 'FROM_SCRATCH',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: Earning the first contract out of a public trial. Facing sheer physical exhaustion and the reality of non-league facilities.',
      act2Summary: 'Act 2: The media narrative. Journalists discover your total lack of pedigree. Do you lean into the underdog story, or resent the constant questions about your past?',
      act3Summary: 'Act 3: The autobiography. Framing your impossible rise. Are you a testament to hard work, or a freak statistical anomaly?',
      resolutionRange: 'Ranges from "Inspirational Everyman" to "Intensely private professional".'
    }
  },
  EXILE: {
    origin: 'EXILE',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: First return to the country you were exiled from (e.g. continental competition). Dealing with hostile crowds and media smear campaigns.',
      act2Summary: 'Act 2: The apology demand. Your old national federation offers a truce if you publicly apologize. Do you swallow pride for international football, or stand your ground?',
      act3Summary: 'Act 3: Forgiveness vs. Spite. At the end of your career, do you let go of the anger that fueled you, or carry the grudge into retirement?',
      resolutionRange: 'Ranges from "Reconciled Hero" to "Unforgiving Outcast".'
    }
  },
  NON_LEAGUE: {
    origin: 'NON_LEAGUE',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: Surviving the step up. The tactical complexity of professional football is overwhelming. Do you stick to your physical, direct non-league roots, or try to reinvent yourself?',
      act2Summary: 'Act 2: The financial culture shock. Dealing with wealthy teammates who don\'t understand the value of money. Do you assimilate or remain the grounded dressing-room enforcer?',
      act3Summary: 'Act 3: Buying your old club. You have the wealth to save the non-league side where you started. Do you become an owner-player, or leave the past behind?',
      resolutionRange: 'Ranges from "Non-league savior" to "Fully assimilated elite".'
    }
  },
  ACADEMY_PRODIGY: {
    origin: 'ACADEMY_PRODIGY',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: The hype train. Dealing with massive early expectations. Do you feed the media hype or shut down social media entirely?',
      act2Summary: 'Act 2: The plateau. The first season where you don\'t improve. Panic sets in. Do you fire your staff, or trust the process?',
      act3Summary: 'Act 3: The Golden Ball. Whether you achieved the ultimate individual prize or fell short, how do you define a career that was supposed to be perfect?',
      resolutionRange: 'Ranges from "Fulfilled the Prophecy" to "The Greatest What-If".'
    }
  },
  WONDERKID: {
    origin: 'WONDERKID',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: The bidding war. Every top club wants you at age 18. Do you choose guaranteed playing time at a mid-tier club, or take the massive payday at a superclub where you might be benched?',
      act2Summary: 'Act 2: Burnout. The physical toll of playing 60 games a season as a teenager hits. Managing injuries and mental exhaustion.',
      act3Summary: 'Act 3: The next wonderkid. You are now 33. The media has found the "next you." Do you pass the torch gracefully or fight to keep your crown?',
      resolutionRange: 'Ranges from "Generational Great" to "Burned out at 25".'
    }
  },
  NEPOTISM_CASE: {
    origin: 'NEPOTISM_CASE',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: The locker room freeze-out. Senior players refuse to pass to you, assuming you are only there because of your family name. Do you snap back, or win them over with work rate?',
      act2Summary: 'Act 2: The transfer request. Do you deliberately leave your family\'s sphere of influence to prove yourself abroad, or stay and inherit the club captaincy?',
      act3Summary: 'Act 3: Surpassing the legacy. Have you eclipsed your famous father/uncle, or are you just a footnote in their biography?',
      resolutionRange: 'Ranges from "Escaped the Shadow" to "The Heir Apparent".'
    }
  },
  LATE_REPLACEMENT: {
    origin: 'LATE_REPLACEMENT',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: The guilt of opportunity. The player whose injury/misfortune gave you a spot returns to fitness. Do you ruthlessly keep them out of the team, or step aside?',
      act2Summary: 'Act 2: Proving it wasn\'t a fluke. The second season syndrome hits hard. The element of surprise is gone. Reinventing your game to stay relevant.',
      act3Summary: 'Act 3: The mentor role. You are now the veteran, and a lucky youngster takes your spot through a fluke. The cycle completes.',
      resolutionRange: 'Ranges from "Opportunist Survivor" to "Legitimate Legend".'
    }
  },
  SECOND_SPORT_CONVERT: {
    origin: 'SECOND_SPORT_CONVERT',
    act1: [], act2: [], act3: [],
    outline: {
      act1Summary: 'Act 1: The technical deficit. Your raw athleticism is elite, but your touch lets you down. Do you spend extra hours with the technical coaches, or rely purely on physical dominance?',
      act2Summary: 'Act 2: The cross-sport endorsement. Sponsors from your old sport want to use your unique story. Does it distract from your football focus?',
      act3Summary: 'Act 3: The dual-sport legacy. Will you be remembered as a freak athlete who played football, or a true footballer who happened to play another sport first?',
      resolutionRange: 'Ranges from "Physical Phenomenon" to "Master Footballer".'
    }
  }
};

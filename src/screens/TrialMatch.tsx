import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { CLUBS } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { Player } from '../types';
import { GlossaryTooltip } from '../components/GlossaryTooltip';
import { generateTrialContractOffers, getTrialNarrativeIntro } from '../utils/careerSystems';
import { generateSeasonCalendar } from '../utils/calendar';
import { generateSeasonObjective, generateRandomNewManager } from '../utils/seasonObjectives';

interface ScenarioOption {
 text: string;
 attribute: string;
 successText: string;
 failText: string;
 ratingImpact: number;
}

interface Scenario {
 title: string;
 situation: string;
 options: ScenarioOption[];
}

export function TrialMatch() {
 const { state, setPlayer, setInbox, setScreen, updateCalendar } = useGame();
 const player = state.player;

 if (!player) return null;

 const [currentStage, setCurrentStage] = useState<number>(0);
 const [matchRating, setMatchRating] = useState<number>(6.0);
 const [outcomes, setOutcomes] = useState<string[]>([]);
 const [selectedOption, setSelectedOption] = useState<number | null>(null);
 const [resolvedText, setResolvedText] = useState<string>('');
 const [isResolved, setIsResolved] = useState<boolean>(false);
 const [chosenClubSymbol, setChosenClubSymbol] = useState<string>('');

 // Position groupings for scenarios
 const isGk = player.position === 'GK';
 const isDef = ['CB', 'LB', 'RB'].includes(player.position);
 const isMid = ['CM', 'AM', 'LM', 'RM'].includes(player.position);
 const isFw = ['ST', 'LW', 'RW'].includes(player.position);

 // Custom position-based scenarios
 const getScenarios = (): Scenario[] => {
 if (isGk) {
  return [
  {
   title: "Stage 1: Opening Jitters",
   situation: "The match kicks off and the opposition winger breaks down the flank, unleashing a vicious dipping effort toward your near post.",
   options: [
   {
    text: "Rush out and make yourself big",
    attribute: "agility",
    successText: "With outstanding reflexes, you tip the ball around the post! The scouts nod.",
    failText: "You hesitate and get chipped, leaving you stranded as it hits the back of the net.",
    ratingImpact: 1.5,
   },
   {
    text: "Hold your line and react to the bounce",
    attribute: "composure",
    successText: "You remain perfectly calm, matching the ball's flight and clutching it with secure handling.",
    failText: "The bounce catches you off-guard; you spill it, forcing a frantic goal-line clearance.",
    ratingImpact: 0.8,
   }
   ]
  },
  {
   title: "Stage 2: Heavy Press",
   situation: "Your center-back plays a short backpass under heavy pressure. An opposition striker is sprinting directly at you.",
   options: [
   {
    text: "Launch a quick, accurate pass to the fullback",
    attribute: "passing",
    successText: "You play a beautiful, low side-volley pass that cleanly bypasses the press.",
    failText: "Your pass is hurried and goes out of bounds, drawing groans from your defender.",
    ratingImpact: 1.2,
   },
   {
    text: "Anticipate the tackle and clear it long",
    attribute: "decisionMaking",
    successText: "You read the striker's lunging tackle, side-stepping neatly and clearing it safely past midfield.",
    failText: "Your clearance is blocked by the onrushing striker; it deflects dangerously just wide of the post.",
    ratingImpact: 0.9,
   }
   ]
  },
  {
   title: "Stage 3: High Cross Climax",
   situation: "90th minute. A corner is swung deep into your six-yard box. A physical target man is leaping to meet it.",
   options: [
   {
    text: "Punch through the crowd to clear",
    attribute: "strength",
    successText: "You leap high, fist-punching the ball away to safety through a wall of players.",
    failText: "You get outmuscled in the air; the striker wins the header, putting it over your line.",
    ratingImpact: 1.6,
   },
   {
    text: "Time your jump and catch it cleanly",
    attribute: "agility",
    successText: "You rise high above the target man, plucking the ball clean out of the air to end the match.",
    failText: "You misjudge the flight; the ball slips through your fingers, leading to a tap-in.",
    ratingImpact: 1.8,
   }
   ]
  }
  ];
 } else if (isDef) {
  return [
  {
   title: "Stage 1: Flank Containment",
   situation: "An explosive opposition winger tries to blow past you down the sideline with a sudden burst of pace.",
   options: [
   {
    text: "Dive into a crunching sliding tackle",
    attribute: "tackling",
    successText: "Perfect timing! You cleanly sweep the ball away, leaving the winger on the turf.",
    failText: "You miss completely, earning a warning from the referee and letting the winger cross.",
    ratingImpact: 1.4,
   },
   {
    text: "Jockey and shepherd him to the corner flag",
    attribute: "decisionMaking",
    successText: "You position yourself perfectly, matching his strides and forcing him to play it backward.",
    failText: "You get sucked in; he cuts inside with a clever step-over and lets fly.",
    ratingImpact: 1.0,
   }
   ]
  },
  {
   title: "Stage 2: Direct Counter",
   situation: "A long ball is floated over the top, and you find yourself in a footrace with a rapid striker.",
   options: [
   {
    text: "Match him for speed and recover",
    attribute: "pace",
    successText: "Your acceleration is phenomenal! You catch up and shield the ball back to your goalkeeper.",
    failText: "The striker easily pulls away, leaving you trailing as he takes a shot.",
    ratingImpact: 1.5,
   },
   {
    text: "Use your physical strength to body him off the ball",
    attribute: "strength",
    successText: "You lean into him, using your upper-body strength to cleanly isolate him from the ball.",
    failText: "He spins off your shoulder, leaving you unbalanced as he breaks on goal.",
    ratingImpact: 1.1,
   }
   ]
  },
  {
   title: "Stage 3: Box Protection Climax",
   situation: "89th minute. A low cross is drilled into your penalty area. You must clear it under immense physical pressure.",
   options: [
   {
    text: "Execute a block-tackle to intercept",
    attribute: "tackling",
    successText: "Outstanding! You stick a leg out, deadening the ball and clearing it out of the box.",
    failText: "You miss the ball, deflecting it dangerously toward your own goalkeeper.",
    ratingImpact: 1.6,
   },
   {
    text: "Show composure to control and play it out",
    attribute: "composure",
    successText: "A class act. You chest the cross down calmly and play a crisp pass to your midfielder.",
    failText: "You freeze under pressure; the ball bounces off your shin into the path of an attacker.",
    ratingImpact: 1.8,
   }
   ]
  }
  ];
 } else if (isMid) {
  return [
  {
   title: "Stage 1: Press Resistance",
   situation: "You receive the ball in a congested center circle. Two high-pressing opponents converge on you instantly.",
   options: [
   {
    text: "Beat them with quick agility and tight control",
    attribute: "agility",
    successText: "You turn on a dime, dropping your shoulder to leave both pressers chasing shadows.",
    failText: "You get caught in possession, starting a dangerous counter-attack for the opposition.",
    ratingImpact: 1.4,
   },
   {
    text: "Execute a first-time pass to the outlet winger",
    attribute: "passing",
    successText: "Superb vision! You release the ball with a crisp, side-footed pass that starts an attack.",
    failText: "Your pass lacks weight and is intercepted, putting your defense under pressure.",
    ratingImpact: 1.1,
   }
   ]
  },
  {
   title: "Stage 2: Through-Ball Opening",
   situation: "The play shifts left. You find a pocket of space between the lines. Your striker makes a run.",
   options: [
   {
    text: "Thread a daring, low-driven through-pass",
    attribute: "vision",
    successText: "What a ball! You thread it between three defenders right into the striker's path.",
    failText: "The pass is too heavy, sailing directly into the goalkeeper's safe hands.",
    ratingImpact: 1.6,
   },
   {
    text: "Drive forward with the ball to draw defenders",
    attribute: "dribbling",
    successText: "You drive aggressively into the gap, pulling defenders toward you before laying it off.",
    failText: "You take a heavy touch; a defender steps out and dispossesses you cleanly.",
    ratingImpact: 1.1,
   }
   ]
  },
  {
   title: "Stage 3: Central Counter Climax",
   situation: "88th minute. The opposition is counters at speed. You are the lone defensive screen in front of your back four.",
   options: [
   {
    text: "Break up the play with a tactical sliding tackle",
    attribute: "tackling",
    successText: "An elite tackle! You slide cleanly and win the ball, immediately launching a break.",
    failText: "You mistime it completely, committing a clumsy foul that earns you a yellow card.",
    ratingImpact: 1.5,
   },
   {
    text: "Track the overlapping runner to intercept",
    attribute: "decisionMaking",
    successText: "A masterclass in tracking. You block the passing lane and intercept the ball.",
    failText: "You follow the wrong runner, leaving the center wide open for a direct shot on goal.",
    ratingImpact: 1.7,
   }
   ]
  }
  ];
 } else {
  // Forwards (ST, LW, RW)
  return [
  {
   title: "Stage 1: Behind the Line",
   situation: "A brilliant lofted ball is played over the high defensive line. You race to catch up with it.",
   options: [
   {
    text: "Sprint past the centerback using raw pace",
    attribute: "pace",
    successText: "You explode forward, leaving the defender behind and controlling the ball with ease.",
    failText: "The defender matches your sprint, using his body to force you wide and out of play.",
    ratingImpact: 1.3,
   },
   {
    text: "Use your first touch to kill the ball instantly",
    attribute: "firstTouch",
    successText: "Incredible! You cushion the ball perfectly on your instep, turning the defender inside-out.",
    failText: "Your touch is heavy, letting the ball bounce directly to the rushing goalkeeper.",
    ratingImpact: 1.5,
   }
   ]
  },
  {
   title: "Stage 2: 1v1 Opportunity",
   situation: "You receive the ball at the edge of the box. Only one physical center-back stands between you and the goal.",
   options: [
   {
    text: "Beat him with sharp, quick dribbling",
    attribute: "dribbling",
    successText: "You execute a lightning-fast step-over, driving past him on the outside into the box.",
    failText: "The defender stands his ground, cleanly blocking your path and stealing the ball.",
    ratingImpact: 1.4,
   },
   {
    text: "Hold him off with strength and shield the ball",
    attribute: "strength",
    successText: "You use your body beautifully, backing into him and laying it off for a teammate.",
    failText: "He muscles you off the ball, easily dispossesing you from behind.",
    ratingImpact: 1.0,
   }
   ]
  },
  {
   title: "Stage 3: The Match Winner",
   situation: "89th minute. A low cross is whipped across the face of the goal. You have a split second to finish.",
   options: [
   {
    text: "Shoot first-time into the bottom corner",
    attribute: "finishing",
    successText: "Sensational! You sweep it first-time past the keeper's outstretched arms and into the net!",
    failText: "You slice the shot, sending it high over the crossbar into the empty stands.",
    ratingImpact: 1.8,
   },
   {
    text: "Cushion the ball under pressure and curl it",
    attribute: "composure",
    successText: "Ice-cold! You take a touch to freeze the keeper, then curl it effortlessly into the far post.",
    failText: "You hesitate too long; a defender lunges in to block the shot at the last second.",
    ratingImpact: 1.9,
   }
   ]
  }
  ];
 }
 };

 const currentScenario = getScenarios()[currentStage];

 const handleSelectOption = (idx: number) => {
 if (isResolved) return;
 setSelectedOption(idx);
 
 const option = currentScenario.options[idx];
 // Check player's starting attribute value (scale 100)
 const attributeVal = (player.attributes as any)[option.attribute] || 50;
 
 // Dice roll factor: 1-100.
 const roll = Math.floor(Math.random() * 40) + 30; // 30-70 variance
 const successThreshold = 60; // 60 is standard threshold
 const successPercent = (attributeVal * 0.6) + (roll * 0.4);
 
 const success = successPercent >= successThreshold;
 let text = '';
 let ratingChange = 0;

 if (success) {
  text = option.successText;
  ratingChange = option.ratingImpact;
 } else {
  text = option.failText;
  ratingChange = -option.ratingImpact * 0.6;
 }

 setResolvedText(text);
 setMatchRating(prev => Math.max(4.0, Math.min(10.0, prev + ratingChange)));
 setOutcomes(prev => [...prev, `${currentScenario.title}: ${success ? '✅ Success' : '❌ Failure'}`]);
 setIsResolved(true);
 };

 const handleNextStage = () => {
 if (currentStage < 2) {
  setCurrentStage(prev => prev + 1);
  setSelectedOption(null);
  setResolvedText('');
  setIsResolved(false);
 } else {
  // Go to Scout offers stage!
  setCurrentStage(3);
 }
 };

 // Generate 3 custom contract offers based on the trial rating
 const getOffers = () => {
 const trialHost = CLUBS.find(c => c.symbol.toUpperCase() === player.startingClubSymbol.toUpperCase()) || CLUBS[0];
 const generatedOffers = generateTrialContractOffers(player.backstory, matchRating, trialHost);
 
 return generatedOffers.map(o => {
  const clubObj = CLUBS.find(c => c.symbol === o.clubSymbol) || trialHost;
  return {
  ...o,
  club: clubObj,
  status: o.squadRole, // mapping for JSX compatibility
  trust: o.trust,  // mapping for JSX compatibility
  ovrAdjustment: o.ovrAdjustment, // mapping for JSX compatibility
  };
 });
 };

 const handleAcceptOffer = (offer: ReturnType<typeof getOffers>[0]) => {
 const finalPlayer: Player = {
  ...player,
  startingClubSymbol: offer.clubSymbol,
  currentClubSymbol: offer.clubSymbol,
  ovr: Math.min(99, player.ovr + offer.ovrAdjustment),
  trust: offer.trust,
  contract: {
  ...player.contract,
  wage: offer.wage,
  status: offer.squadRole as any,
  yearsLeft: offer.length,
  appearanceBonus: Math.round(offer.wage * 0.1),
  goalBonus: Math.round(offer.wage * 0.2),
  releaseClause: offer.wage * 250,
  },
  finances: {
  ...player.finances,
  balance: player.finances.balance + (offer.wage * 4), // 4-week signing bonus
  },
  relationships: {
  ...player.relationships,
  manager: offer.trust,
  },
  managerInfo: generateRandomNewManager(offer.clubSymbol),
  seasonObjective: generateSeasonObjective(CLUBS.find(c => c.symbol === offer.clubSymbol) || CLUBS[0], player.ovr + offer.ovrAdjustment),
  stateFlags: {
  ...player.stateFlags,
  historyFlags: {
   ...player.stateFlags.historyFlags,
   isTrialOngoing: false
  }
  }
 };

 // Regenerate calendar for the signed club
 const selectedClub = CLUBS.find(c => c.symbol === offer.clubSymbol) || CLUBS[0];
 const seasonCalendar = generateSeasonCalendar(selectedClub);
 updateCalendar(seasonCalendar);

 let sender = 'DIRECTOR OF FOOTBALL';
 if (player.backstory === 'ACADEMY_GRADUATE') sender = 'ACADEMY DIRECTOR';
 else if (player.backstory === 'LATE_BLOOMER') sender = 'CHIEF SCOUT';

 const finalInbox = [
  {
  id: `msg_1`,
  sender: sender,
  subject: 'Welcome to the First Team',
  content: `Your professional agreement is finalized. ${offer.description} We are paying a weekly wage of £${offer.wage} with a signing-on bonus of £${(offer.wage * 4).toLocaleString()}. Make us proud.`,
  read: false,
  type: 'DM' as const,
  timestamp: 'MON 09:00',
  choices: [
   { text: 'Understood.', type: 'ack' }
  ]
  }
 ];

 setPlayer(finalPlayer);
 setInbox(finalInbox);
 setScreen('HUB', true);
 };

 const rating = parseFloat(matchRating.toFixed(1));
 let ratingColor = 'text-[#eab308]'; // Yellow
 if (rating >= 8.0) ratingColor = 'text-[#22c55e]'; // Green
 else if (rating < 6.5) ratingColor = 'text-[#ef4444]'; // Red

 return (
 <div className="flex flex-col h-full bg-black text-[#cccccc] font-sans overflow-y-auto w-full p-8">
  <div className="max-w-[1000px] w-full mx-auto flex flex-col gap-8 h-full">
  
  {/* Header */}
  <div className="border-b border-[#222] pb-6">
   <div className="text-[#00FF88] text-xs font-bold tracking-widest uppercase mb-2">Step 02 &middot; Trial Showcase</div>
   <h1 className="text-white text-4xl font-black uppercase tracking-tight">The Trial Match</h1>
  </div>

  {currentStage < 3 ? (
   /* Active Scenario Block */
   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
   <div className="md:col-span-2 flex flex-col gap-6">
    
    <div className="premium-card p-8 rounded flex flex-col gap-6">
    <div>
     <span className="text-[#00FF88] text-xs font-bold uppercase tracking-widest block mb-1">Situation</span>
     <h2 className="text-white text-xl font-bold uppercase tracking-wider mb-4">{currentScenario.title}</h2>
     <p className="text-gray-300 text-sm leading-relaxed">{currentScenario.situation}</p>
    </div>

    {!isResolved ? (
     <div className="flex flex-col gap-3 mt-4">
     {currentScenario.options.map((option, idx) => (
      <button
      key={idx}
      onClick={() => handleSelectOption(idx)}
      className="w-full glass-panel hover:border-[#00FF88] text-left p-4 rounded text-xs uppercase tracking-wider font-bold transition-all text-white flex justify-between items-center group"
      >
      <span>⚡ {option.text}</span>
      <span className="text-white/50 group-hover:text-[#00FF88] font-mono text-[10px]">[{option.attribute}]</span>
      </button>
     ))}
     </div>
    ) : (
     <div className="mt-4 p-4 bg-[#141414] border border-[#2d2d2d] rounded flex flex-col gap-4">
     <div>
      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest block mb-1">Result</span>
      <p className="text-white text-sm leading-relaxed">{resolvedText}</p>
     </div>
     <button
      onClick={handleNextStage}
      className="self-end px-6 py-2 bg-[#00FF88] text-white text-xs font-bold uppercase tracking-widest hover:bg-white rounded transition-colors"
     >
      {currentStage === 2 ? "See Scouting Results ➔" : "Continue Match ➔"}
     </button>
     </div>
    )}
    </div>
   </div>

   {/* Sidebar Stats & Status */}
   <div className="flex flex-col gap-6">
    <div className="premium-card p-6 rounded flex flex-col gap-6 text-center">
    <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Match Rating</span>
    <span className={`text-6xl font-black ${ratingColor}`}>{rating.toFixed(1)}</span>
    
    <div className="border-t border-[#222] pt-4 text-left">
     <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest block mb-2">My Attributes Checked</span>
     <div className="grid grid-cols-2 gap-2 text-xs font-mono">
     {currentScenario.options.map((opt, i) => (
      <div key={i} className="bg-[#151515] p-2 rounded flex justify-between items-center text-white">
      <span className="uppercase text-[9px] text-white/50">{opt.attribute}</span>
      <span className="font-bold text-[#00FF88]">{(player.attributes as any)[opt.attribute] || 50}</span>
      </div>
     ))}
     </div>
    </div>
    </div>

    <div className="premium-card p-6 rounded flex flex-col gap-4">
    <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Match Timeline</span>
    <div className="space-y-2 text-[11px] font-mono">
     {outcomes.length === 0 ? (
     <div className="text-[#555] italic">Kick-off approaching...</div>
     ) : (
     outcomes.map((out, idx) => (
      <div key={idx} className="text-white pb-1.5 border-b border-[#222] last:border-0">{out}</div>
     ))
     )}
    </div>
    </div>
   </div>
   </div>
  ) : (
   /* Scouting Offers Screen */
   <div className="flex flex-col gap-6">
   <div className="premium-card p-8 rounded flex flex-col gap-6">
    <div className="text-center pb-6 border-b border-[#222]">
    <h2 className="text-white text-2xl font-bold uppercase tracking-wider mb-2">Trial Match Concluded</h2>
    <div className="flex justify-center items-baseline gap-2">
     <span className="text-gray-400 text-sm">Final Scout Rating:</span>
     <span className={`text-4xl font-black ${ratingColor}`}>{rating.toFixed(1)}</span>
     <span className="text-xs font-mono uppercase text-gray-500">
     ({rating >= 8.0 ? 'Sensational' : (rating < 6.5 ? 'Struggling' : 'Solid')})
     </span>
    </div>
    </div>

    <div>
    <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-4">Professional Contract Offers</h3>
    <p className="text-gray-400 text-xs mb-6 uppercase tracking-wider">Scouts in attendance have put forward the following contract deals based on your trial performance:</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
     {getOffers().map((offer, idx) => (
     <div key={idx} className="glass-panel border border-[#2a2a2a] hover:border-[#00FF88] p-6 rounded flex flex-col gap-4 transition-all">
      <div className="flex justify-between items-center">
      <span className="text-white font-bold uppercase tracking-wider text-sm">{offer.club.name}</span>
      <TeamLogo
       symbol={offer.club.symbol}
       name={offer.club.name}
       primaryColor={offer.club.primaryColor}
       secondaryColor={offer.club.secondaryColor}
       size={32}
      />
      </div>
      
      <div className="flex flex-col gap-1.5 border-t border-[#2a2a2a] pt-3 text-xs font-mono">
      <div className="flex justify-between text-gray-400">
       <span>Wage:</span>
       <span className="text-white font-bold">£{offer.wage}/wk</span>
      </div>
      <div className="flex justify-between text-gray-400">
       <span>Squad Role:</span>
       <span className="text-[#00FF88] font-bold uppercase">{offer.status}</span>
      </div>
      <div className="flex justify-between text-gray-400">
       <span><GlossaryTooltip term="Starting Trust">Starting Trust:</GlossaryTooltip></span>
       <span className="text-white">{offer.trust}/100</span>
      </div>
      <div className="flex justify-between text-gray-400">
       <span>OVR Effect:</span>
       <span className={offer.ovrAdjustment >= 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
       {offer.ovrAdjustment >= 0 ? `+${offer.ovrAdjustment}` : offer.ovrAdjustment} OVR
       </span>
      </div>
      </div>

      <p className="text-gray-400 text-xs leading-relaxed italic">{offer.description}</p>

      <button
      onClick={() => handleAcceptOffer(offer)}
      className="mt-auto py-2.5 bg-[#00FF88] hover:bg-white text-white text-xs font-bold uppercase tracking-widest rounded transition-colors"
      >
      Sign Contract &rarr;
      </button>
     </div>
     ))}
    </div>
    </div>
   </div>
   </div>
  )}
  </div>
 </div>
 );
}

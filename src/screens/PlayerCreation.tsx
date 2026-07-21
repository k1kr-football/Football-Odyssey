/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { BACKSTORIES, BackstoryConfig, NATIONALITY_NAMES } from '../data/backstories';
import { getClubsByTier, CLUBS } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { Player, BackstoryType, Position } from '../types';
import { generateSeasonCalendar } from '../utils/calendar';
import { getTrialHostClubByOrigin } from '../utils/careerSystems';
import { getRolesForPosition, getDefaultRoleForPositionAndTrait, PlayerRole } from '../data/roles';

export function PlayerCreation() {
 const { startCareer, setInbox, setScreen } = useGame();
 
 const [selectedOrigin, setSelectedOrigin] = useState<BackstoryType>('STREET_PRODIGY');
 const [firstName, setFirstName] = useState('');
 const [lastName, setLastName] = useState('');
 const [nationality, setNationality] = useState('');
 const [position, setPosition] = useState<Position | ''>('');
 const [difficulty, setDifficulty] = useState<'CASUAL' | 'STANDARD' | 'REALISTIC'>('STANDARD');

 const [rolledOvr, setRolledOvr] = useState<number>(0);
 const [pathwayChoice, setPathwayChoice] = useState<'U21' | 'LOAN' | null>(null);

 const [personality, setPersonality] = useState<'Professional' | 'Ambitious' | 'Temperamental' | 'Loyal' | 'Media-Friendly' | 'Introvert' | 'Party Animal' | 'Model Citizen'>('Professional');
 const [startingTrait, setStartingTrait] = useState<string>('Big Match Player');
 const [selectedRoleId, setSelectedRoleId] = useState<string>('');

 // Auto-set recommended role when position or starting trait changes
 React.useEffect(() => {
  if (position) {
   const defRole = getDefaultRoleForPositionAndTrait(position as Position, startingTrait);
   setSelectedRoleId(defRole);
  }
 }, [position, startingTrait]);

 const originDetails = BACKSTORIES[selectedOrigin];
 
 // React to origin changes
 React.useEffect(() => {
 const baseOvr = originDetails.startingOvr;
 const roll = baseOvr + (Math.floor(Math.random() * 5) - 2); // +/- 2 variance
 setRolledOvr(roll);

 setNationality(originDetails.nationalityPool[0]);
 setPosition(originDetails.positions[0]);
 
 if (selectedOrigin === 'STREET_PRODIGY' || selectedOrigin === 'ACADEMY_GRADUATE') {
  setPathwayChoice('U21');
 } else {
  setPathwayChoice(null);
 }
 }, [selectedOrigin]);

 const handleGenerateName = () => {
 if (!nationality) return;
 const names = NATIONALITY_NAMES[nationality];
 if (names) {
  const first = names.first[Math.floor(Math.random() * names.first.length)];
  const last = names.last[Math.floor(Math.random() * names.last.length)];
  setFirstName(first);
  setLastName(last);
 }
 };

 const handleSignContract = () => {
 if (!firstName || !lastName || !nationality || !position) return;

 const trialHostClub = getTrialHostClubByOrigin(selectedOrigin);
 const clubSymbol = trialHostClub.symbol;

 let initialStatus: import('../types').SquadHierarchyTier = 'Backup';
 if (selectedOrigin === 'FALLEN_PRODIGY') initialStatus = 'Exile';
 else if (selectedOrigin === 'EXILE') initialStatus = 'Exile';
 else if (pathwayChoice === 'U21') initialStatus = 'Exile'; // Representing U21
 else if (selectedOrigin === 'LATE_BLOOMER') initialStatus = 'Squad Player';

 const startingAttributes = { ...originDetails.attributeDistribution };
 if (startingTrait === 'Injury Prone') {
  startingAttributes.finishing = Math.min(99, startingAttributes.finishing + 6);
  startingAttributes.passing = Math.min(99, startingAttributes.passing + 6);
  startingAttributes.dribbling = Math.min(99, startingAttributes.dribbling + 6);
 }

 const newPlayer: Player = {
  firstName,
  lastName,
  nationality,
  backstory: selectedOrigin,
  position: position as Position,
  subPosition: selectedRoleId ? (getRolesForPosition(position as Position).find(r => r.id === selectedRoleId)?.name || 'Advanced Forward') as any : 'Advanced Forward',
  roleSpecialization: {
   selectedRoleId: selectedRoleId || getDefaultRoleForPositionAndTrait(position as Position, startingTrait),
   familiarity: 100,
   recentMatchesInRole: 0
  },
  dominantFoot: originDetails.weakFoot > 3 ? 'Both' : 'Right', // Simple default
  weakFoot: originDetails.weakFoot,
  startingClubSymbol: clubSymbol,
  currentClubSymbol: clubSymbol, // Start at trial host club
  hometownClubSymbol: (() => {
    const potential = CLUBS.filter(c => c.symbol !== clubSymbol);
    const startClub = CLUBS.find(c => c.symbol === clubSymbol);
    const matched = potential.find(c => c.league === startClub?.league) || potential[0] || CLUBS[0];
    return matched.symbol;
  })(),
  ovr: rolledOvr,
  age: originDetails.age,
  form: 60,
  sharpness: 50,
  trust: 50,
  tacticalFamiliarity: 30,
  fatigue: 0,
  morale: 75,
  fans: 0,
  mediaPerception: 50,
  attributes: startingAttributes,
  stats: { apps: 0, goals: 0, assists: 0, caps: 0 },
  buffs: { setPieceReliability: false, tacticalAdvantage: false, charismatic: selectedOrigin === 'NON_LEAGUE' },
  finances: {
  balance: 0, 
  expenses: {
   housing: 200,  
   training: 0,  
   lifestyle: 0,  
   family: 0
  }
  },
  lifestyleTier: {
  housing: 'Digs',
  training: 'Basic',
  nutrition: 'Club',
  image: 'Standard'
  },
  sponsors: 0,
  reputation: {
  club: 0, // Starts at 0
  league: 0,
  world: 0,
  peerRespect: 50,
  skill: 50,
  attitude: 50,
  media: 50,
  fans: 20,
  global: 0,
  legacy: 0
  },
  perception: 'THE_HOT_PROSPECT',
  perceptionHistory: [],
  matchAnalysis: [],
  tacticalInstruction: {
  current: null,
  history: []
  },
  physicalCondition: {
  value: 100,
  tier: 'PEAK',
  effects: { statPenalty: 0, injuryRisk: 0 },
  matchFitness: 70,
  recoveryDebt: 0,
  injurySusceptibility: 5
  },
  recoveryProfile: {
  tier: 'BASIC',
  speed: 15,
  daysToPeak: 0,
  activeBonuses: []
  },
  contract: {
  wage: 500, // Zero-resources start
  parentClub: pathwayChoice === 'LOAN' ? clubSymbol : undefined,
  expires: 'June 2027',
  yearsLeft: 3,
  status: initialStatus,
  bonuses: 0,
  appearanceBonus: 50,
  goalBonus: 100,
  releaseClause: undefined
  },
  loanInfo: pathwayChoice === 'LOAN' ? {
  hostClub: getClubsByTier('Lower')[0].symbol,
  playingTimeGuarantee: true,
  recallClause: true,
  wagePercentage: 100
  } : undefined,
  transferOffers: [],
  agentTier: 'Rookie',
  relationships: {
  manager: 50,
  manager_discipline: 50,
  teammates: 50, 
  agent: selectedOrigin === 'STREET_PRODIGY' ? 10 : (selectedOrigin === 'FROM_SCRATCH' ? 0 : 30), 
  family: 80,
  },
  squadDynamics: {
  cohesion: 50,
  dominantClique: 'The Young Guns',
  dressingRoomLeaders: [],
  unity: 50,
  faultLines: [],
  groups: [
   { name: 'The Young Guns', members: [], influence: 30 },
   { name: 'The Veterans', members: [], influence: 70 }
  ],
  personalities: {},
  events: []
  },
  managerInfo: {
  name: 'Gaffer',
  assessmentWeeksLeft: 0,
  pressure: 0,
  },

  mentoring: undefined,
  promises: [],
  socialMedia: {
  followers: selectedOrigin === 'FROM_SCRATCH' ? 0 : (selectedOrigin === 'FALLEN_PRODIGY' ? 25000 : 50),
  cancelRisk: 0,
  },
  partnerships: {
  striker: 0,
  midfield: 0,
  winger: 0,
  },
  playstyleIdentity: 'Unknown',
  characterType: 'Unknown',
  personality: personality,
  traits: [startingTrait],
  isInjured: false,
  isTutorialMode: true,
  ceiling: (() => {
    let basePotentialBonus = 12;
    let randomPotentialBonus = 10;
    
    if (selectedOrigin === 'STREET_PRODIGY') {
      basePotentialBonus = 14;
      randomPotentialBonus = 12;
    } else if (selectedOrigin === 'ACADEMY_GRADUATE') {
      basePotentialBonus = 12;
      randomPotentialBonus = 12;
    } else if (selectedOrigin === 'FALLEN_PRODIGY') {
      basePotentialBonus = 13;
      randomPotentialBonus = 14;
    } else if (selectedOrigin === 'LATE_BLOOMER') {
      basePotentialBonus = 8;
      randomPotentialBonus = 10;
    } else if (selectedOrigin === 'EXILE') {
      basePotentialBonus = 10;
      randomPotentialBonus = 12;
    } else { // FROM_SCRATCH or others
      basePotentialBonus = 10;
      randomPotentialBonus = 10;
    }
    
    return Math.min(99, rolledOvr + basePotentialBonus + Math.floor(Math.random() * randomPotentialBonus));
  })(),
  scoutReports: [],
  dressingRoomEvents: [],
  rivals: [],
  trophies: [],
  agentType: (['SHARK', 'PROTECTOR', 'NEGOTIATOR', 'CELEBRITY'] as const)[Math.floor(Math.random() * 4)],
  financialEmpire: {
  netWorth: 0,
  cashBalance: 0,
  investments: [],
  businesses: [],
  stocks: { value: 0, annualReturnRate: 0.06 },
  crypto: {
   value: 0,
   currentPrice: 1.25,
   coinsHeld: 0,
   rollingFourWeekDrawdown: 0.0
  },
  stage: 'ROOKIE',
  lastPayoutDate: ''
  },
  training: {
  weeklySessions: {
   clubOrganized: 0,
   individual: 0,
   recovery: 0,
   trainingMatch: 0
  },
  sessionHistory: [],
  trainingMatchHistory: []
  },
  stateFlags: {
  historyFlags: {
   isTrialOngoing: true
  },
  openThreads: {},
  eventCooldowns: {}
  },
  timeline: [
  {
   id: 'trial_match_invite',
   week: 1,
   day: 'MON',
   type: 'TRANSFER',
   title: 'Trial Match Invitation',
   description: `You have been invited for a critical trial match with ${trialHostClub.name}. Stand out on the pitch to secure a professional contract offer!`,
   clubSymbol: clubSymbol
  }
  ]
 };
 
 startCareer(newPlayer, difficulty);
 };

 return (
 <div className="flex flex-col h-full bg-[#0E0E0E] text-[#cccccc] font-mono overflow-y-auto w-full p-8">
  <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-8 h-full">
  
  {/* Header */}
  <div className="mb-4">
   <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-4">Step 01 &middot; Player Creation</div>
   <h1 className="text-white text-5xl font-black uppercase tracking-tight mb-4">Choose Your Origin.</h1>
   <p className="text-white/50 text-sm max-w-3xl leading-relaxed">
   Your backstory is not cosmetic. It locks who you are — where you're from, what you can play, how the world sees you, and which dressing room is willing to take a chance on you.
   </p>
  </div>

  <div className="flex gap-8 flex-1">
   {/* Origin Selection List */}
   <div className="w-1/2 flex flex-col gap-4">
   <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-2">Five Origins &middot; Pick One</div>
   
   <div className="flex flex-col gap-3 overflow-y-auto hide-scrollbar pb-8">
    {(Object.keys(BACKSTORIES) as BackstoryType[]).map((key) => {
    const config = BACKSTORIES[key];
    const isActive = selectedOrigin === key;
    return (
     <button
     key={key}
     onClick={() => setSelectedOrigin(key)}
     className={`text-left p-6 border transition-all duration-200 relative overflow-hidden
      ${isActive 
      ? 'bg-[#151515] border-[#00FF88]' 
      : 'premium-card border-white/10 hover:border-[#444444]'
      }`}
     >
     <div className="flex justify-between items-baseline mb-4">
      <h3 className={`font-bold text-lg uppercase tracking-wider ${isActive ? 'text-white' : 'text-white/50'}`}>
      {config.title}
      </h3>
      <div className="uppercase text-xs tracking-widest text-white/40">
      Age {config.age} &middot; OVR {config.startingOvr}
      </div>
     </div>
     
     <p className={`italic text-sm mb-4 ${isActive ? 'text-[#00FF88]' : 'text-white/40'}`}>
      {config.slogan}
     </p>
     
     <p className="text-sm text-white/50 leading-relaxed mb-6">
      {config.description}
     </p>
     
     <div className={`pl-3 border-l-2 text-xs font-medium ${isActive ? 'border-[#00FF88] text-[#aaaaaa]' : 'border-white/10 text-[#555]'}`}>
      {config.bullet}
     </div>

     {/* Summary Stats Grid */}
     {isActive && (
      <div className="mt-6 pt-6 border-t border-[#2a2a2a] grid grid-cols-2 gap-y-4 gap-x-8 text-xs uppercase tracking-widest">
      <div>
       <div className="text-white/40 mb-1">Positions</div>
       <div className="text-white">{config.positions.join(' · ')}</div>
      </div>
      <div>
       <div className="text-white/40 mb-1">Weak Foot</div>
       <div className="text-white">{config.weakFoot}/5</div>
      </div>
      <div>
       <div className="text-white/40 mb-1">Nationality</div>
       <div className="text-white">{config.nationalityPool.length} locked</div>
      </div>
      <div>
       <div className="text-white/40 mb-1">Starting Tier</div>
       <div className="text-white">{config.startingTier}</div>
      </div>
      </div>
     )}
     </button>
    );
    })}
   </div>
   </div>

   {/* Configuration Form */}
   <div className="w-1/2 p-8 premium-card flex flex-col h-fit sticky top-0">
   <h2 className="text-white text-xl font-bold uppercase tracking-wider mb-2">
    {originDetails.title}
   </h2>
   <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-8 pb-4 border-b border-white/10">
    Origin Locked &middot; Adjust the rest
   </div>

   <div className="flex gap-4 mb-3">
    <div className="flex-1">
    <label className="block text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">First Name</label>
    <input 
     type="text" 
     value={firstName}
     onChange={(e) => setFirstName(e.target.value)}
     className="w-full bg-transparent p-3 text-white focus:border-[#00FF88] focus:outline-none placeholder-[#444]"
     placeholder="Enter name"
    />
    </div>
    <div className="flex-1">
    <label className="block text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">Last Name</label>
    <input 
     type="text" 
     value={lastName}
     onChange={(e) => setLastName(e.target.value)}
     className="w-full bg-transparent p-3 text-white focus:border-[#00FF88] focus:outline-none placeholder-[#444]"
     placeholder="Enter last name"
    />
    </div>
   </div>

   <button 
    onClick={handleGenerateName}
    className="w-full py-2 mb-8 bg-transparent text-white/50 text-xs uppercase tracking-widest hover:border-[#666] transition-colors"
   >
    🎲 Generate {NATIONALITY_NAMES[nationality]?.isStyle || `${nationality}-Style`} Name
   </button>

   <div className="mb-6">
    <label className="block text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">
    Nationality &middot; {originDetails.nationalityPool.length} Options
    </label>
    <select 
    value={nationality}
    onChange={(e) => setNationality(e.target.value)}
    className="w-full bg-[#1A1A1A] p-3 text-white focus:border-[#00FF88] focus:outline-none appearance-none"
    >
    {originDetails.nationalityPool.map((nat) => (
     <option key={nat} value={nat}>{nat}</option>
    ))}
    </select>
    <div className="text-[#555] text-xs mt-2 uppercase tracking-widest">Pool locked by your backstory.</div>
   </div>

   <div className="mb-6">
    <label className="block text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">
    Position &middot; {originDetails.positions.length} Options
    </label>
    <div className="flex ">
    {originDetails.positions.map((pos) => (
     <button
     key={pos}
     onClick={() => setPosition(pos)}
     className={`flex-1 py-3 text-sm font-bold uppercase transition-colors border-r border-white/10 last:border-0
      ${position === pos ? 'text-[#00FF88] glass-panel' : 'text-white/40 hover:text-white/50'}`}
     >
     {pos}
     </button>
    ))}
    </div>
    <div className="text-[#555] text-xs mt-2 uppercase tracking-widest">Beat your man. Cut inside or hit the byline.</div>
   </div>

   {position && (
    <div className="mb-6 p-4 rounded-lg bg-black/40 border border-white/10 text-left">
     <label className="block text-white/40 text-[10px] font-bold mb-2 uppercase tracking-widest text-[#00FF88]">
      Tactical Role Specialization
     </label>
     <div className="space-y-3">
      {getRolesForPosition(position as Position).map((role) => {
       const isRecommended = role.id === getDefaultRoleForPositionAndTrait(position as Position, startingTrait);
       const isSelected = selectedRoleId === role.id;
       return (
        <div
         key={role.id}
         onClick={() => setSelectedRoleId(role.id)}
         className={`p-3 rounded border text-left cursor-pointer transition-all ${
          isSelected 
           ? 'border-[#00FF88] bg-[#00FF88]/10' 
           : 'border-white/10 bg-[#121212] hover:bg-white/5'
         }`}
        >
         <div className="flex justify-between items-center mb-1">
          <div className="font-bold text-white text-sm flex items-center gap-2">
           {role.name}
           {isRecommended && (
            <span className="text-[9px] bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">
             Recommended
            </span>
           )}
          </div>
          <div className="text-[9px] text-white/40 font-mono uppercase">
           {role.preferredTacticalSystems.join(' / ')}
          </div>
         </div>
         <p className="text-xs text-white/60 mb-2 leading-relaxed">{role.description}</p>
         <div className="flex flex-wrap gap-1 mb-2 items-center">
          <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider mr-1">Key attributes:</span>
          {role.keyAttributes.map((attr) => (
           <span key={attr} className="text-[8px] bg-white/5 text-white/70 px-1 py-0.5 rounded font-mono uppercase">
            {attr}
           </span>
          ))}
         </div>
         <div className="text-[9px] text-[#00FF88]/70 italic border-t border-white/5 pt-1 mt-1">
          <strong>Synergy:</strong> {role.synergyTrait} — {role.synergyReason}
         </div>
        </div>
       );
      })}
     </div>
     <div className="text-[#555] text-[10px] mt-2 uppercase tracking-widest">
      Determines tactical identity, training bonuses, and match engine attribute checks.
     </div>
    </div>
   )}

   <div className="mb-6">
    <label className="block text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">
    Difficulty Level &middot; Realism & Scaling
    </label>
    <select 
    value={difficulty}
    onChange={(e) => setDifficulty(e.target.value as any)}
    className="w-full bg-[#1A1A1A] p-3 text-white focus:border-[#00FF88] focus:outline-none appearance-none font-bold uppercase tracking-wider text-xs"
    >
    <option value="CASUAL">🟢 Casual (1.5x attribute gains, +20% trust, -30% injuries)</option>
    <option value="STANDARD">🟡 Standard (Balanced, realistic simulation curves)</option>
    <option value="REALISTIC">🔴 Realistic (0.7x attribute gains, harder trust, +30% injuries)</option>
    </select>
    <div className="text-[#555] text-xs mt-2 uppercase tracking-widest">
    {difficulty === 'CASUAL' ? 'Perfect for a fast-paced superstar fantasy.' :
     difficulty === 'STANDARD' ? 'The recommended balanced career experience.' :
     'Hardcore realism. Attributes grow slowly, injuries strike harder.'}
    </div>
   </div>

   {pathwayChoice !== null && (
    <div className="mb-6">
    <label className="block text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">
     Starting Pathway
    </label>
    <div className="flex ">
     <button
     onClick={() => setPathwayChoice('U21')}
     className={`flex-1 py-3 text-sm font-bold uppercase transition-colors border-r border-white/10 last:border-0
      ${pathwayChoice === 'U21' ? 'text-[#00FF88] glass-panel' : 'text-white/40 hover:text-white/50'}`}
     >
     U21 Squad
     </button>
     <button
     onClick={() => setPathwayChoice('LOAN')}
     className={`flex-1 py-3 text-sm font-bold uppercase transition-colors border-r border-white/10 last:border-0
      ${pathwayChoice === 'LOAN' ? 'text-[#00FF88] glass-panel' : 'text-white/40 hover:text-white/50'}`}
     >
     Dev Loan
     </button>
    </div>
    <div className="text-[#555] text-xs mt-2 uppercase tracking-widest text-center">
     {pathwayChoice === 'U21' ? 'Fight through the academy.' : 'Learn in the lower leagues.'}
    </div>
    </div>
   )}

   <div className="mb-6">
    <label className="block text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">
    Personality Type
    </label>
    <select 
    value={personality}
    onChange={(e) => setPersonality(e.target.value as any)}
    className="w-full bg-[#1A1A1A] p-3 text-white focus:border-[#00FF88] focus:outline-none appearance-none font-bold uppercase tracking-wider text-xs"
    >
    <option value="Professional">⚙️ Professional (Disciplined, gains trust faster)</option>
    <option value="Ambitious">🔥 Ambitious (Highly motivated, faster attribute growth)</option>
    <option value="Temperamental">⚡ Temperamental (Volatile, higher peak but risk of cards)</option>
    <option value="Loyal">❤️ Loyal (Teammate chemistry holds strong, loves club)</option>
    <option value="Media-Friendly">🎤 Media-Friendly (Followers and sponsor boost)</option>
    <option value="Introvert">📚 Introvert (Quiet, focuses on training & concentration)</option>
    <option value="Party Animal">🎉 Party Animal (Dressing room joker, high teammate boost)</option>
    <option value="Model Citizen">👑 Model Citizen (Perfect professionalism, leadership boost)</option>
    </select>
    <div className="text-[#555] text-xs mt-2 uppercase tracking-widest">Influences your off-pitch choices and manager relationships.</div>
   </div>

   <div className="mb-6">
    <label className="block text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">
    Starting Signature Trait
    </label>
    <select 
    value={startingTrait}
    onChange={(e) => setStartingTrait(e.target.value)}
    className="w-full bg-[#1A1A1A] p-3 text-white focus:border-[#00FF88] focus:outline-none appearance-none font-bold uppercase tracking-wider text-xs"
    >
    <option value="Big Match Player">🌟 Big Match Player (Excel under intense cup match pressure)</option>
    <option value="Tries Killer Balls Often">🎯 Tries Killer Balls Often (Bonus to through-passes)</option>
    <option value="Curls Shots">💫 Curls Shots (Increased chance of wrapping standard shots)</option>
    <option value="Leadership Presence">📣 Leadership Presence (Increases captaincy chances & morale)</option>
    <option value="Flicks & Tricks">🎭 Flicks & Tricks (Unlocks advanced dribbling flair)</option>
    <option value="Long Shot Taker">🚀 Long Shot Taker (Unlocks extreme distance shots)</option>
    <option value="Injury Prone">🤕 Injury Prone (Hard mode: higher risk but starts with +3 technical points)</option>
    </select>
    <div className="text-[#555] text-xs mt-2 uppercase tracking-widest">A custom player trait that defines your playstyle on the pitch.</div>
   </div>

   <div className="mb-8 pb-8 border-b border-white/10">
    <label className="block text-white/40 text-xs font-bold mb-2 uppercase tracking-widest">
    Weak Foot &middot; Locked by Backstory
    </label>
    <div className="flex items-center justify-between">
    <div className="flex gap-1 text-[#00FF88] text-lg">
     {[...Array(5)].map((_, i) => (
     <span key={i} className={i < originDetails.weakFoot ? 'text-[#00FF88]' : 'text-[#333333]'}>★</span>
     ))}
    </div>
    <span className="text-white/50 font-mono">{originDetails.weakFoot}/5</span>
    </div>
    <div className="text-[#555] text-xs mt-2 uppercase tracking-widest">Grows slowly through training.</div>
   </div>

   <button 
    onClick={handleSignContract}
    disabled={!firstName || !lastName}
    className="mt-auto w-full py-4 bg-[#00FF88] text-white font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
   >
    Play Trial Match &rarr;
   </button>
   </div>
  </div>
  </div>
 </div>
 );
}

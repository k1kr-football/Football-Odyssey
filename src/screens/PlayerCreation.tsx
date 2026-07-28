/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { BACKSTORIES, NATIONALITY_NAMES } from '../data/backstories';
import { BACKSTORY_EXPANSIONS, DEFAULT_REGIONS } from '../data/backstoryExpansion';
import { getClubsByTier, CLUBS } from '../data/teams';
import { Player, BackstoryType, Position } from '../types';
import { getTrialHostClubByOrigin } from '../utils/careerSystems';
import { calculateOVR } from '../utils/player';
import { getRolesForPosition, getDefaultRoleForPositionAndTrait } from '../data/roles';

export function PlayerCreation() {
  const { startCareer } = useGame();

  // Wizard Step Control (1 through 6)
  const [step, setStep] = useState<number>(1);

  // Core Origin Selection
  const [selectedOrigin, setSelectedOrigin] = useState<BackstoryType>('STREET_PRODIGY');
  
  // Basic Identity
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationality, setNationality] = useState('');
  const [region, setRegion] = useState('');
  const [position, setPosition] = useState<Position | ''>('');
  const getDifficulty = (origin: string): 'CASUAL' | 'STANDARD' | 'REALISTIC' => {
    if (origin === 'WONDERKID') return 'CASUAL';
    if (origin === 'ACADEMY_PRODIGY' || origin === 'ACADEMY_GRADUATE' || origin === 'NEPOTISM_CASE') return 'STANDARD';
    return 'REALISTIC';
  };

  // Stats & Progression
  
  const [pathwayChoice, setPathwayChoice] = useState<'U21' | 'LOAN' | null>(null);

  // Personality & Role
  const [personality, setPersonality] = useState<'Professional' | 'Ambitious' | 'Temperamental' | 'Loyal' | 'Media-Friendly' | 'Introvert' | 'Party Animal' | 'Model Citizen'>('Professional');
  const [startingTrait, setStartingTrait] = useState<string>('Big Match Player');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Backstory Expansion Selections
  const [selectedFormativeChoiceId, setSelectedFormativeChoiceId] = useState<string>('');
  const [selectedFamilyOptionId, setSelectedFamilyOptionId] = useState<string>('');
  const [selectedRivalMentorType, setSelectedRivalMentorType] = useState<'RIVAL' | 'MENTOR'>('RIVAL');
  const [selectedCoreWoundId, setSelectedCoreWoundId] = useState<string>('');

  const originDetails = BACKSTORIES[selectedOrigin];
  const expansionDetails = BACKSTORY_EXPANSIONS[selectedOrigin];

  // Auto-set recommended role when position or starting trait changes
  useEffect(() => {
    if (position) {
      const defRole = getDefaultRoleForPositionAndTrait(position as Position, startingTrait);
      setSelectedRoleId(defRole);
    }
  }, [position, startingTrait]);

  // React to origin changes and initialize defaults
  useEffect(() => {
    const initialNat = originDetails.nationalityPool[0];
    setNationality(initialNat);
    setPosition(originDetails.positions[0]);
    setPersonality(originDetails.defaultPersonality);
    setStartingTrait(originDetails.defaultTrait);

    // Set region default for initial nationality
    const regList = expansionDetails.regions[initialNat] || DEFAULT_REGIONS;
    setRegion(regList[0].city);

    // Set expansion defaults
    setSelectedFormativeChoiceId(expansionDetails.formativeMoment.choices[0].id);
    setSelectedFamilyOptionId(expansionDetails.familyOptions[0].id);
    setSelectedRivalMentorType('RIVAL');
    setSelectedCoreWoundId(expansionDetails.drivingQuestionVariants[0].id);

    if (selectedOrigin === 'STREET_PRODIGY' || selectedOrigin === 'ACADEMY_GRADUATE') {
      setPathwayChoice('U21');
    } else {
      setPathwayChoice(null);
    }
  }, [selectedOrigin]);

  // Update region options when nationality changes
  useEffect(() => {
    if (!nationality) return;
    const regList = expansionDetails.regions[nationality] || DEFAULT_REGIONS;
    setRegion(regList[0].city);
  }, [nationality, selectedOrigin]);

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
    else if (pathwayChoice === 'U21') initialStatus = 'Exile';
    else if (selectedOrigin === 'LATE_BLOOMER') initialStatus = 'Squad Player';

    const startingAttributes = { ...originDetails.attributeDistribution };
    if (startingTrait === 'Injury Prone') {
      startingAttributes.finishing = Math.min(99, startingAttributes.finishing + 6);
      startingAttributes.passing = Math.min(99, startingAttributes.passing + 6);
      startingAttributes.dribbling = Math.min(99, startingAttributes.dribbling + 6);
    }

    // Resolve expanded selections
    const formativeChoice = expansionDetails.formativeMoment.choices.find(c => c.id === selectedFormativeChoiceId) || expansionDetails.formativeMoment.choices[0];
    const familyOption = expansionDetails.familyOptions.find(f => f.id === selectedFamilyOptionId) || expansionDetails.familyOptions[0];
    const rivalMentorOption = selectedRivalMentorType === 'RIVAL' ? expansionDetails.rivalMentorOptions.rival : expansionDetails.rivalMentorOptions.mentor;
    const coreWoundOption = expansionDetails.drivingQuestionVariants.find(dw => dw.id === selectedCoreWoundId) || expansionDetails.drivingQuestionVariants[0];

    // Seed Rivals array if rival was chosen
    const initialRivals = selectedRivalMentorType === 'RIVAL' ? [
      {
        name: rivalMentorOption.name,
        club: 'Youth / Grassroots Circuit',
        position: rivalMentorOption.roleOrPosition,
        type: 'GRUDGE_RIVAL' as const,
        escalatedTypes: [],
        headToHead: [],
        seasonComparison: { yourGoals: 0, theirGoals: 0, yourRating: 0, theirRating: 0 },
        mediaNarrative: rivalMentorOption.description
      }
    ] : [];

    // Seed Mentoring relationship if mentor was chosen
    const initialMentoring = selectedRivalMentorType === 'MENTOR' ? {
      isMentor: false,
      partnerName: rivalMentorOption.name,
      weeksRemaining: 52,
      focusAttribute: 'composure'
    } : null;

    // Seed initial Decision Memory log entry
    const formativeDecisionEntry = {
      id: `decision_formative_${Date.now()}`,
      choiceText: formativeChoice.label,
      system: 'Formative Backstory',
      week: 1,
      season: 1,
      age: originDetails.age,
      npcsInvolved: [rivalMentorOption.name],
      entitiesInvolved: [region || nationality],
      significance: 'MODERATE' as const,
      description: formativeChoice.decisionMemoryText,
      timestamp: 'MON 09:00'
    };

    const newPlayer: Player = {
      firstName,
      lastName,
      nationality,
      backstory: selectedOrigin,
      backstoryDetails: {
        region: region || 'Capital District',
        formativeFrame: formativeChoice.frameTag,
        familySituation: {
          optionId: familyOption.id,
          title: familyOption.title,
          description: familyOption.description,
          npcName: familyOption.npcName,
          startingRelationship: familyOption.startingRelationship
        },
        rivalOrMentor: {
          choiceType: rivalMentorOption.type,
          name: rivalMentorOption.name,
          roleOrPosition: rivalMentorOption.roleOrPosition,
          title: rivalMentorOption.title,
          description: rivalMentorOption.description
        },
        coreWound: {
          id: coreWoundOption.id,
          tag: coreWoundOption.tag,
          drivingQuestion: coreWoundOption.question,
          description: coreWoundOption.description
        }
      },
      position: position as Position,
      subPosition: selectedRoleId ? (getRolesForPosition(position as Position).find(r => r.id === selectedRoleId)?.name || 'Advanced Forward') as any : 'Advanced Forward',
      roleSpecialization: {
        selectedRoleId: selectedRoleId || getDefaultRoleForPositionAndTrait(position as Position, startingTrait),
        familiarity: 100,
        recentMatchesInRole: 0
      },
      dominantFoot: originDetails.weakFoot > 3 ? 'Both' : 'Right',
      weakFoot: originDetails.weakFoot,
      startingClubSymbol: clubSymbol,
      currentClubSymbol: pathwayChoice === 'LOAN' ? (getClubsByTier('Lower')[0]?.symbol || clubSymbol) : clubSymbol,
      hometownClubSymbol: (() => {
        const potential = CLUBS.filter(c => c.symbol !== clubSymbol);
        const startClub = CLUBS.find(c => c.symbol === clubSymbol);
        const matched = potential.find(c => c.league === startClub?.league) || potential[0] || CLUBS[0];
        return matched.symbol;
      })(),
      ovr: calculateOVR(startingAttributes, position as Position),
      age: originDetails.age,
      form: 60,
      sharpness: 50,
      trust: selectedOrigin === 'LATE_REPLACEMENT' ? 10 : (selectedOrigin === 'NEPOTISM_CASE' ? 20 : (selectedOrigin === 'SECOND_SPORT_CONVERT' ? 30 : 50)),
      tacticalFamiliarity: selectedOrigin === 'SECOND_SPORT_CONVERT' ? 10 : 30,
      fatigue: 0,
      morale: 75,
      fans: 0,
      mediaPerception: 50,
      attributes: startingAttributes,
      stats: { apps: 0, goals: 0, assists: 0, caps: 0 },
      buffs: { setPieceReliability: false, tacticalAdvantage: false, charismatic: selectedOrigin === 'NON_LEAGUE' },
      finances: {
        balance: 0,
        expenses: { housing: 200, training: 0, lifestyle: 0, family: 0 }
      },
      lifestyleTier: { housing: 'Digs', training: 'Basic', nutrition: 'Club', image: 'Standard' },
      sponsors: 0,
      reputation: {
        club: 0, 
        league: 0, 
        world: 0, 
        peerRespect: selectedOrigin === 'NEPOTISM_CASE' ? 20 : (selectedOrigin === 'THE_REFUGEE' ? 60 : 50), 
        skill: selectedOrigin === 'SECOND_SPORT_CONVERT' ? 20 : 50, 
        attitude: selectedOrigin === 'NEPOTISM_CASE' ? 30 : (selectedOrigin === 'THE_REFUGEE' ? 80 : 50), 
        media: selectedOrigin === 'LATE_REPLACEMENT' ? 20 : (selectedOrigin === 'NEPOTISM_CASE' ? 70 : 50), 
        fans: selectedOrigin === 'NEPOTISM_CASE' ? 10 : 20, 
        global: 0, 
        legacy: 0
      },
      perception: 'THE_HOT_PROSPECT',
      perceptionHistory: [],
      matchAnalysis: [],
      tacticalInstruction: { current: null, history: [] },
      physicalCondition: {
        value: 100, tier: 'PEAK', effects: { statPenalty: 0, injuryRisk: 0 }, matchFitness: 70, recoveryDebt: 0, injurySusceptibility: 5
      },
      recoveryProfile: { tier: 'BASIC', speed: 15, daysToPeak: 0, activeBonuses: [] },
      contract: {
        wage: 500,
        parentClub: pathwayChoice === 'LOAN' ? clubSymbol : undefined,
        expires: 'June 2027',
        yearsLeft: 3,
        status: initialStatus,
        bonuses: 0,
        appearanceBonus: 50,
        goalBonus: 100
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
        family: familyOption.startingRelationship,
      },
      squadDynamics: {
        cohesion: 50, dominantClique: 'The Young Guns', dressingRoomLeaders: [], unity: 50, faultLines: [],
        groups: [
          { name: 'The Young Guns', members: [], influence: 30 },
          { name: 'The Veterans', members: [], influence: 70 }
        ],
        personalities: {}, events: []
      },
      managerInfo: { name: 'Gaffer', assessmentWeeksLeft: 0, pressure: 0 },
      mentoring: initialMentoring,
      promises: [],
      socialMedia: {
        followers: selectedOrigin === 'FROM_SCRATCH' ? 0 : (selectedOrigin === 'FALLEN_PRODIGY' ? 25000 : 50),
        cancelRisk: 0
      },
      partnerships: { striker: 0, midfield: 0, winger: 0 },
      playstyleIdentity: 'Unknown',
      characterType: 'Unknown',
      personality,
      traits: [startingTrait],
      isInjured: false,
      isTutorialMode: true,
      ceiling: Math.min(99, calculateOVR(startingAttributes, position as Position) + 14 + Math.floor(Math.random() * 10)),
      scoutReports: [],
      dressingRoomEvents: [],
      rivals: initialRivals,
      trophies: [],
      agentType: (['SHARK', 'PROTECTOR', 'NEGOTIATOR', 'CELEBRITY'] as const)[Math.floor(Math.random() * 4)],
      financialEmpire: {
        netWorth: 0, cashBalance: 0, investments: [], businesses: [],
        stocks: { value: 0, annualReturnRate: 0.06 },
        crypto: { value: 0, currentPrice: 1.25, coinsHeld: 0, rollingFourWeekDrawdown: 0.0 },
        stage: 'ROOKIE', lastPayoutDate: ''
      },
      training: {
        weeklySessions: { clubOrganized: 0, individual: 0, recovery: 0, trainingMatch: 0 },
        sessionHistory: [], trainingMatchHistory: []
      },
      stateFlags: {
        historyFlags: { isTrialOngoing: true },
        openThreads: {},
        eventCooldowns: {},
        decisionMemory: [formativeDecisionEntry]
      },
      timeline: [
        {
          id: 'trial_match_invite',
          week: 1,
          day: 'MON',
          type: 'TRANSFER',
          title: 'Trial Match Invitation',
          description: `You have been invited for a critical trial match with ${trialHostClub.name}. Stand out on the pitch to secure a professional contract offer!`,
          clubSymbol
        }
      ]
    };

    startCareer(newPlayer, getDifficulty(selectedOrigin));
  };

  const stepsList = [
    { num: 1, title: 'Origin' },
    { num: 2, title: 'Formative Moment' },
    { num: 3, title: 'Identity & Region' },
    { num: 4, title: 'Support Network' },
    { num: 5, title: 'Rival / Mentor' },
    { num: 6, title: 'Motivation & Review' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0E0E0E] text-[#cccccc] font-mono overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-6 lg:gap-8 h-full">

        {/* Wizard Header & Stepper */}
        <div>
          <div className="text-[#00FF88] text-[10px] sm:text-xs font-black tracking-widest uppercase mb-2">
            Football Odyssey &middot; Character Creation
          </div>
          <h1 className="text-white text-2xl sm:text-4xl font-black uppercase tracking-tight mb-4">
            Forge Your Career Legacy
          </h1>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-[#121212] p-2 border border-white/10 rounded-2xl">
            {stepsList.map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`py-2.5 px-3 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-[#00FF88] text-black border-[#00FF88] font-bold shadow-md shadow-[#00FF88]/20'
                      : isCompleted
                      ? 'bg-white/5 text-white border-white/20 hover:bg-white/10'
                      : 'bg-transparent text-white/40 border-transparent hover:text-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-mono font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-black text-[#00FF88]' : isCompleted ? 'bg-[#00FF88] text-black' : 'bg-white/10 text-white/50'
                    }`}>
                      {isCompleted ? '✓' : s.num}
                    </span>
                    <span className="text-xs uppercase tracking-wider truncate">{s.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= STEP 1: ORIGIN SELECTION ================= */}
        {step === 1 && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
            <div className="w-full lg:w-3/5 flex flex-col gap-4">
              <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-1">Select Backstory Origin</div>
              <div className="flex flex-col gap-3 overflow-y-auto hide-scrollbar pb-8">
                {(Object.keys(BACKSTORIES) as BackstoryType[]).map((key) => {
                  const config = BACKSTORIES[key];
                  const isActive = selectedOrigin === key;
                  const isWonderkid = key === "WONDERKID";
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedOrigin(key)}
                      className={`text-left p-5 sm:p-6 border rounded-2xl transition-all duration-200 relative overflow-hidden cursor-pointer ${
                        isActive
                          ? 'bg-[#151515] border-[#00FF88] shadow-lg shadow-[#00FF88]/10'
                          : 'bg-[#121212] border-white/10 hover:border-white/30 hover:bg-[#161616]'
                      }`}
                    >
                      {isWonderkid && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg z-10 shadow-lg shadow-amber-500/20">
                          Premium Start
                        </div>
                      )}
                      <div className="flex justify-between items-baseline mb-3">
                        <h3 className={`font-bold text-lg uppercase tracking-wider ${isActive ? (isWonderkid ? 'text-amber-400' : 'text-white') : 'text-white/50'}`}>
                          {config.title}
                        </h3>
                        <div className={`uppercase text-xs tracking-widest ${isActive ? (isWonderkid ? 'text-amber-500' : 'text-[#00FF88]') : 'text-white/40'}`}>
                          Age {config.age} &middot; OVR {config.startingOvr}
                        </div>
                      </div>
                      <p className={`italic text-xs sm:text-sm mb-3 ${isActive ? (isWonderkid ? 'text-amber-500' : 'text-[#00FF88]') : 'text-white/40'}`}>
                        {config.slogan}
                      </p>
                      <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-4">
                        {config.description}
                      </p>
                      <div className={`pl-3 border-l-2 text-xs font-medium ${isActive ? 'border-[#00FF88] text-white/80' : 'border-white/10 text-[#555]'}`}>
                        {config.bullet}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Overview */}
            <div className="w-full lg:w-2/5 p-6 bg-[#121212] border border-white/15 rounded-2xl flex flex-col h-fit lg:sticky lg:top-4 shadow-2xl">
              <h2 className="text-white text-xl font-black uppercase tracking-wider mb-1">{originDetails.title}</h2>
              <div className="text-[#00FF88] text-xs font-bold tracking-widest uppercase mb-6 pb-3 border-b border-white/10">
                Origin Baseline Profile
              </div>

              <div className="space-y-4 text-xs uppercase tracking-wider mb-8">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Starting Tier</span>
                  <span className="text-white font-bold">{originDetails.startingTier}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Allowed Positions</span>
                  <span className="text-[#00FF88] font-bold">{originDetails.positions.join(' · ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Default Personality</span>
                  <span className="text-white font-bold">{originDetails.defaultPersonality}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Signature Trait</span>
                  <span className="text-white font-bold">{originDetails.defaultTrait}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Weak Foot Base</span>
                  <span className="text-white font-bold">{originDetails.weakFoot} / 5 Stars</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-4 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#00FF88]/20 border border-[#00FF88] cursor-pointer text-sm"
              >
                Next Step: Formative Moment &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: FORMATIVE MOMENT MICRO-SCENE ================= */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#00FF88]/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="text-[#00FF88] text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>🎬 Backstory Micro-Scene</span>
                <span>&middot;</span>
                <span>{originDetails.title}</span>
              </div>
              <h2 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4">
                {expansionDetails.formativeMoment.title}
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-8 italic bg-black/40 p-5 rounded-xl border border-white/10">
                "{expansionDetails.formativeMoment.sceneText}"
              </p>

              <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">
                Choose your response (Seeds Decision Memory & Starting Flavor Trait):
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {expansionDetails.formativeMoment.choices.map((choice) => {
                  const isSelected = selectedFormativeChoiceId === choice.id;
                  return (
                    <div
                      key={choice.id}
                      onClick={() => setSelectedFormativeChoiceId(choice.id)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#00FF88]/10 border-[#00FF88] shadow-lg shadow-[#00FF88]/10'
                          : 'bg-black/40 border-white/15 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-[#00FF88]' : 'text-white/60'}`}>
                            {choice.label}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-white/70">
                            {choice.frameTag}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white leading-snug mb-3">
                          {choice.text}
                        </p>
                      </div>
                      <div className="text-[10px] text-white/50 border-t border-white/10 pt-2 italic">
                        <strong>Memory:</strong> {choice.decisionMemoryText}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl text-xs cursor-pointer border border-white/15"
                >
                  &larr; Back to Origin
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-8 py-3 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-black uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg shadow-[#00FF88]/20"
                >
                  Next Step: Identity & Region &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: IDENTITY & REGION SUB-BRANCH ================= */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            <div className="bg-[#121212] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="text-[#00FF88] text-xs font-black uppercase tracking-widest mb-2">
                Step 03 &middot; Roots & Personal Identity
              </div>
              <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-6">
                Nationality, Region & Player Name
              </h2>

              <div className="space-y-6 mb-8">
                {/* Nationality Picker */}
                <div>
                  <label className="block text-white/70 text-xs font-bold mb-2 uppercase tracking-widest">
                    Nationality Pool &middot; {originDetails.nationalityPool.length} Allowed Options
                  </label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/20 focus:border-[#00FF88] rounded-xl p-3 text-sm font-bold text-white uppercase tracking-wider focus:outline-none transition-all cursor-pointer"
                  >
                    {originDetails.nationalityPool.map((nat) => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-region / Culture Picker */}
                <div>
                  <label className="block text-white/70 text-xs font-bold mb-2 uppercase tracking-widest">
                    Hometown / Sub-Region Sub-Branch
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(expansionDetails.regions[nationality] || DEFAULT_REGIONS).map((regOpt) => {
                      const isSelected = region === regOpt.city;
                      return (
                        <div
                          key={regOpt.city}
                          onClick={() => setRegion(regOpt.city)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#00FF88]/10 border-[#00FF88] text-white'
                              : 'bg-black/40 border-white/15 text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="font-bold text-sm uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>{regOpt.city}</span>
                            {isSelected && <span className="text-[#00FF88] text-xs">✓</span>}
                          </div>
                          <p className="text-[10px] text-white/50 leading-relaxed">{regOpt.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Name Inputs */}
                <div>
                  <div className="flex flex-col sm:flex-row gap-4 mb-3">
                    <div className="flex-1">
                      <label className="block text-white/70 text-xs font-bold mb-1.5 uppercase tracking-widest">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/20 focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] rounded-xl p-3 text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-white/70 text-xs font-bold mb-1.5 uppercase tracking-widest">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/20 focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] rounded-xl p-3 text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateName}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#00FF88] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    🎲 Generate {NATIONALITY_NAMES[nationality]?.isStyle || `${nationality}-Style`} Name
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl text-xs cursor-pointer border border-white/15"
                >
                  &larr; Previous Step
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!firstName || !lastName}
                  className="px-8 py-3 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-black uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg shadow-[#00FF88]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next Step: Support Network &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: FAMILY & SUPPORT NETWORK ================= */}
        {step === 4 && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            <div className="bg-[#121212] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="text-[#00FF88] text-xs font-black uppercase tracking-widest mb-2">
                Step 04 &middot; Home Life & Support Circle
              </div>
              <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-2">
                Family & Support Network
              </h2>
              <p className="text-white/60 text-xs sm:text-sm mb-6 leading-relaxed">
                Select your home background. This seeds a recurring family NPC, initial Family Relationship rating, and shapes off-pitch lifestyle events.
              </p>

              <div className="grid grid-cols-1 gap-4 mb-8">
                {expansionDetails.familyOptions.map((fOpt) => {
                  const isSelected = selectedFamilyOptionId === fOpt.id;
                  return (
                    <div
                      key={fOpt.id}
                      onClick={() => setSelectedFamilyOptionId(fOpt.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#00FF88]/10 border-[#00FF88] shadow-lg shadow-[#00FF88]/10'
                          : 'bg-black/40 border-white/15 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className={`font-bold text-base uppercase tracking-wider ${isSelected ? 'text-[#00FF88]' : 'text-white'}`}>
                            {fOpt.title}
                          </h3>
                          <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                            Recurring NPC: {fOpt.npcName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#00FF88]">
                            Family Rel: {fOpt.startingRelationship}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {fOpt.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl text-xs cursor-pointer border border-white/15"
                >
                  &larr; Previous Step
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-8 py-3 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-black uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg shadow-[#00FF88]/20"
                >
                  Next Step: Rival / Mentor &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: FORMATIVE RIVAL OR MENTOR SEED ================= */}
        {step === 5 && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            <div className="bg-[#121212] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="text-[#00FF88] text-xs font-black uppercase tracking-widest mb-2">
                Step 05 &middot; Early Key Figure
              </div>
              <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-2">
                Formative Rival or Mentor Seed
              </h2>
              <p className="text-white/60 text-xs sm:text-sm mb-6 leading-relaxed">
                Choose whether your backstory was defined by an early nemesis who pushed you out of spite, or a guiding mentor who taught you early wisdom.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {/* Rival Card */}
                <div
                  onClick={() => setSelectedRivalMentorType('RIVAL')}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedRivalMentorType === 'RIVAL'
                      ? 'bg-rose-500/10 border-rose-500 shadow-lg shadow-rose-500/10'
                      : 'bg-black/40 border-white/15 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-rose-400">
                        ⚡ Formative Rival
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        Seeds Grudge Rival Tracking
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg uppercase tracking-wider mb-2">
                      {expansionDetails.rivalMentorOptions.rival.name}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">
                      {expansionDetails.rivalMentorOptions.rival.description}
                    </p>
                  </div>
                  <div className="text-[10px] text-rose-400/80 font-mono border-t border-white/10 pt-2">
                    Position: {expansionDetails.rivalMentorOptions.rival.roleOrPosition} &middot; Seeds Career Rivalry
                  </div>
                </div>

                {/* Mentor Card */}
                <div
                  onClick={() => setSelectedRivalMentorType('MENTOR')}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedRivalMentorType === 'MENTOR'
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'bg-black/40 border-white/15 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                        🛡️ Formative Mentor
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        Seeds Mentor NPC & System
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg uppercase tracking-wider mb-2">
                      {expansionDetails.rivalMentorOptions.mentor.name}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">
                      {expansionDetails.rivalMentorOptions.mentor.description}
                    </p>
                  </div>
                  <div className="text-[10px] text-cyan-400/80 font-mono border-t border-white/10 pt-2">
                    Role: {expansionDetails.rivalMentorOptions.mentor.roleOrPosition} &middot; Seeds Guidance Network
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl text-xs cursor-pointer border border-white/15"
                >
                  &larr; Previous Step
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-8 py-3 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-black uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg shadow-[#00FF88]/20"
                >
                  Next Step: Motivation & Review &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: CORE MOTIVATION & FINAL REVIEW ================= */}
        {step === 6 && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
            <div className="w-full lg:w-3/5 flex flex-col gap-6">

              {/* Core Wound / Driving Question Selection */}
              <div className="bg-[#121212] border border-white/15 rounded-2xl p-6">
                <div className="text-[#00FF88] text-xs font-black uppercase tracking-widest mb-1">
                  Core Motivation & Driving Question
                </div>
                <h3 className="text-white text-lg font-black uppercase tracking-wider mb-4">
                  Select Narrative Lens
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {expansionDetails.drivingQuestionVariants.map((dw) => {
                    const isSelected = selectedCoreWoundId === dw.id;
                    return (
                      <div
                        key={dw.id}
                        onClick={() => setSelectedCoreWoundId(dw.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#00FF88]/10 border-[#00FF88]'
                            : 'bg-black/40 border-white/15 hover:border-white/30'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-[#00FF88]' : 'text-white'}`}>
                            {dw.tag}
                          </span>
                          {isSelected && <span className="text-[#00FF88] text-xs">✓ Active</span>}
                        </div>
                        <p className="text-sm font-bold text-white italic mb-1">
                          "{dw.question}"
                        </p>
                        <p className="text-[10px] text-white/50 leading-relaxed">{dw.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* On-Pitch Profile (Position, Role & Difficulty) */}
              <div className="bg-[#121212] border border-white/15 rounded-2xl p-6">
                <div className="text-[#00FF88] text-xs font-black uppercase tracking-widest mb-1">
                  On-Pitch Profile & Settings
                </div>

                {/* Position Picker */}
                <div className="mb-4">
                  <label className="block text-white/60 text-[11px] font-bold mb-1.5 uppercase tracking-widest">
                    Position &middot; {originDetails.positions.length} Options
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0a0a0a] p-1.5 border border-white/20 rounded-xl">
                    {originDetails.positions.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPosition(pos)}
                        className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                          position === pos
                            ? 'bg-[#00FF88] text-black border-[#00FF88]'
                            : 'bg-transparent text-white/50 border-transparent hover:text-white'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tactical Role */}
                {position && (
                  <div className="mb-4 p-4 rounded-xl bg-black/40 border border-white/10 text-left">
                    <label className="block text-[#00FF88] text-[10px] font-bold mb-2 uppercase tracking-widest">
                      Tactical Role Specialization
                    </label>
                    <div className="space-y-2">
                      {getRolesForPosition(position as Position).map((role) => {
                        const isSelected = selectedRoleId === role.id;
                        return (
                          <div
                            key={role.id}
                            onClick={() => setSelectedRoleId(role.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected ? 'border-[#00FF88] bg-[#00FF88]/10' : 'border-white/10 bg-[#121212] hover:bg-white/5'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-white text-xs">{role.name}</span>
                              <span className="text-[9px] text-white/40 font-mono uppercase">{role.preferredTacticalSystems.join(' / ')}</span>
                            </div>
                            <p className="text-[11px] text-white/60 mb-1 leading-relaxed">{role.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Difficulty (Auto-set by Origin) */}
                <div>
                  <label className="block text-white/60 text-[11px] font-bold mb-1.5 uppercase tracking-widest">
                    Game Difficulty
                  </label>
                  <div className="w-full bg-[#0a0a0a] border border-white/20 rounded-xl p-3 text-xs font-bold text-white uppercase tracking-wider">
                    {getDifficulty(selectedOrigin) === 'CASUAL' ? '🟢 Casual' : getDifficulty(selectedOrigin) === 'STANDARD' ? '🟡 Standard' : '🔴 Realistic'} (Based on Origin)
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Player Summary Sidebar */}
            <div className="w-full lg:w-2/5 p-6 bg-[#121212] border border-white/15 rounded-2xl flex flex-col h-fit lg:sticky lg:top-4 shadow-2xl">
              <h2 className="text-white text-2xl font-black uppercase tracking-wider mb-1">
                {firstName || 'Player'} {lastName || 'Name'}
              </h2>
              <div className="text-[#00FF88] text-xs font-bold tracking-widest uppercase mb-4 pb-3 border-b border-white/10">
                {originDetails.title} &middot; OVR {calculateOVR(originDetails.attributeDistribution, (position || 'CM') as Position)}
              </div>

              <div className="space-y-3 text-xs uppercase tracking-wider mb-6">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/40">Nationality & Region</span>
                  <span className="text-white font-bold">{nationality} ({region})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/40">Formative Frame</span>
                  <span className="text-[#00FF88] font-bold">
                    {expansionDetails.formativeMoment.choices.find(c => c.id === selectedFormativeChoiceId)?.frameTag}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/40">Support Circle</span>
                  <span className="text-white font-bold">
                    {expansionDetails.familyOptions.find(f => f.id === selectedFamilyOptionId)?.title}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/40">Key Figure</span>
                  <span className="text-white font-bold">
                    {selectedRivalMentorType === 'RIVAL' ? expansionDetails.rivalMentorOptions.rival.name : expansionDetails.rivalMentorOptions.mentor.name}
                  </span>
                </div>
                <div className="py-1.5 border-b border-white/5">
                  <div className="text-white/40 mb-1">Driving Question</div>
                  <div className="text-[#00FF88] font-bold italic normal-case text-xs">
                    "{expansionDetails.drivingQuestionVariants.find(dw => dw.id === selectedCoreWoundId)?.question}"
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl text-xs cursor-pointer border border-white/15"
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  onClick={handleSignContract}
                  disabled={!firstName || !lastName || !position}
                  className="flex-1 py-4 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#00FF88]/20 border border-[#00FF88] cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Play Trial Match &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

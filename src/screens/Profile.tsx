/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useGame } from '../store/GameContext';
import { ProgressBar } from '../components/ProgressBar';
import { TeamLogo } from '../components/TeamLogo';
import { CLUBS } from '../data/teams';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { calculateLegacyScore } from '../utils/gameRefinements';
import { GlossaryTooltip } from '../components/GlossaryTooltip';
import { getRoleById } from '../data/roles';

export function Profile() {
 const { state, setScreen, setPlayer, startLegacyContinuation } = useGame();
 
 const player = state.player;
 const isMatchDay = state.currentDay === 'FRI';

 const [activeTab, setActiveTab] = useState<'ATTRIBUTES' | 'TIMELINE' | 'RIVALS' | 'TROPHIES' | 'RETIREMENT' | 'STORY' | 'MEDICAL'>('ATTRIBUTES');
 const [isRetired, setIsRetired] = useState(!!player?.stateFlags?.retired);
 const [retirementStep, setRetirementStep] = useState<'MENU' | 'GRACEFUL' | 'COACHING' | 'RECORDS' | 'HOMECOMING' | 'CONFIRMED'>('MENU');
 const [selectedCoachingStyle, setSelectedCoachingStyle] = useState<'TACTICAL' | 'MAN_MANAGER' | 'YOUTH'>('TACTICAL');
 const [selectedRecordQuest, setSelectedRecordQuest] = useState<'CAPS' | 'GOALS' | 'TRUST'>('CAPS');
 const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'MILESTONE' | 'INJURY' | 'TRANSFER'>('ALL');
 const [timelineSearch, setTimelineSearch] = useState('');

 const fullTimeline = useMemo(() => {
  if (!player) return [];
  const historicalBiographies = {
  STREET_PRODIGY: [
  {
   id: 'hist_1',
   week: -5,
   day: 'SUN' as const,
   type: 'MILESTONE' as const,
   title: 'Concrete Cage Tournament MVP',
   description: 'Carried your amateur team to victory in the suburbs underground cash-prize match after netting a double rabona.',
   clubSymbol: player.startingClubSymbol
  },
  {
   id: 'hist_2',
   week: -1,
   day: 'WED' as const,
   type: 'MILESTONE' as const,
   title: 'Elite Street clip Goes Viral',
   description: 'A 15-second clip of you performing a seamless nutmeg-elastic combination gets shared, accumulating over 6,000,000 views.',
   clubSymbol: player.startingClubSymbol
  }
  ],
  FALLEN_PRODIGY: [
  {
   id: 'hist_1',
   week: -42,
   day: 'MON' as const,
   type: 'INJURY' as const,
   title: 'Severe Knee Ligament Rupture',
   description: 'Stretched off during regional finals. A grade-3 tear stalled interest from top tier football academy scouts.',
   clubSymbol: player.startingClubSymbol
  },
  {
   id: 'hist_2',
   week: -14,
   day: 'FRI' as const,
   type: 'INJURY' as const,
   title: 'Full Specialist Clearance',
   description: 'Successfully cleared for extreme physical training after 10 months of rehabilitation and squat adjustments.',
   clubSymbol: player.startingClubSymbol
  }
  ],
  LATE_BLOOMER: [
  {
   id: 'hist_1',
   week: -24,
   day: 'SAT' as const,
   type: 'MILESTONE' as const,
   title: 'Weekend double-shift hat-trick',
   description: 'Showed grit by working a morning construction shift, then scored a match-winning treble in local amateur leagues.',
   clubSymbol: player.startingClubSymbol
  },
  {
   id: 'hist_2',
   week: -4,
   day: 'TUE' as const,
   type: 'MILESTONE' as const,
   title: 'Spotted by Professional Scouts',
   description: 'Earned immediate senior interest after displaying sublime physical drive during a freezing cup qualifier.',
   clubSymbol: player.startingClubSymbol
  }
  ],
  ACADEMY_GRADUATE: [
  {
   id: 'hist_1',
   week: -32,
   day: 'MON' as const,
   type: 'TRANSFER' as const,
   title: 'Under-16 Elite Residency Draft',
   description: 'Joined the residential squad after standout open trials with over 500 applicants in attendance.',
   clubSymbol: player.startingClubSymbol
  },
  {
   id: 'hist_2',
   week: -2,
   day: 'SUN' as const,
   type: 'MILESTONE' as const,
   title: 'Youth FA Championship Trophy',
   description: 'Dispatched the match-winner with a dynamic overhead kick in front of senior club hierarchy representatives.',
   clubSymbol: player.startingClubSymbol
  }
  ],
  EXILE: [
  {
   id: 'hist_1',
   week: -18,
   day: 'FRI' as const,
   type: 'MILESTONE' as const,
   title: 'Contract/Coaching Confrontation',
   description: 'Spoke out against defensive limitations and squad restrictions, incurring official roster suspensions.',
   clubSymbol: player.startingClubSymbol
  },
  {
   id: 'hist_2',
   week: -6,
   day: 'THU' as const,
   type: 'TRANSFER' as const,
   title: 'Lucrative Contract Renunciation',
   description: 'Formally requested release from comfortable league terms to venture out on a true football search.',
   clubSymbol: player.startingClubSymbol
   }
  ]
  };
 
  const histEvents = historicalBiographies[player.backstory] || [];
  const baseTimeline = player.timeline || [];
 
  const combined = [...histEvents, ...baseTimeline].sort((a, b) => {
  if (b.week !== a.week) return b.week - a.week;
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  return days.indexOf(b.day || 'MON') - days.indexOf(a.day || 'MON');
  });
 
  return combined;
 }, [player.timeline, player.backstory, player.startingClubSymbol]);

 const parsedInjuries = useMemo(() => {
  const historicalInjuries = [
   {
    name: 'Severe Knee Ligament Rupture',
    severity: 'Grade 3 Tear',
    week: 'Pre-Career (Wk -42)',
    duration: '10 Months Rehab',
    clubImpact: 'Stalled senior academy recruitment. Temporary physical attributes degradation (-15% stamina, -20% pace).',
    intlImpact: 'Ruled out of Youth National Team Draft and European Under-17 Qualifiers.',
    notes: 'Required full surgical ligament re-anchoring and specialized gait adjustments.',
    icon: '🦵'
   },
   {
    name: 'Hamstring Pull & Micro-Tear',
    severity: 'Grade 1 Strain',
    week: 'Season Week 12',
    duration: '2 Weeks Active Rehab',
    clubImpact: 'Missed 2 fixtures. Limited to light gym conditioning sessions.',
    intlImpact: 'Declined provisional call-up for International Autumn Friendlies to protect recovery timeline.',
    notes: 'Triggered by high athletic workloads. Resolved via focused resistance-band stretching.',
    icon: '🏃‍♂️'
   },
   {
    name: 'Sprained Ankle Ligament',
    severity: 'Grade 2 Sprain',
    week: 'Season Week 26',
    duration: '4 Weeks Rehab',
    clubImpact: 'Roster status downgraded to Bench/Backup temporarily. Rested from intensive tactical drills.',
    intlImpact: 'Missed critical World Cup Qualification matchday against direct competitive rivals.',
    notes: 'Sustained during a sliding tackle impact. Strengthened with custom ankle braces.',
    icon: '🦶'
   }
  ];

  const actualTimelineInjuries = fullTimeline
   .filter(evt => evt.type === 'INJURY')
   .map(evt => {
    let severity = 'Grade 1 Strain';
    let duration = '1-2 Weeks';
    let clubImpact = 'Missed training sessions. Reduced physical output temporarily.';
    let intlImpact = 'Declined call-up or restricted minutes.';
    let notes = 'Monitored by the first-team physiological staff.';
    
    if (evt.title.toLowerCase().includes('knee') || evt.title.toLowerCase().includes('rupture') || evt.title.toLowerCase().includes('ligament')) {
     severity = 'Grade 3 Tear';
     duration = '6-10 Months';
     clubImpact = 'Long-term rehabilitation. Forced benched status and specialized conditioning.';
     intlImpact = 'Ruled out of key qualifying window matches and international roster drafts.';
     notes = 'Required surgical intervention and intensive post-operative physical therapy.';
    } else if (evt.title.toLowerCase().includes('hamstring') || evt.title.toLowerCase().includes('tear')) {
     severity = 'Grade 2 Strain';
     duration = '3-4 Weeks';
     clubImpact = 'Missed 3 club fixtures. Reduced training load and temporary Pace penalty.';
     intlImpact = 'Unavailable for international training camp.';
     notes = 'Recovered using isometric resistance protocols and deep tissue massage.';
    }

    return {
     name: evt.title,
     severity,
     week: evt.week < 1 ? `Pre-Career (Wk ${evt.week})` : `Wk ${evt.week}`,
     duration,
     clubImpact,
     intlImpact,
     notes: evt.description || notes,
     icon: evt.title.toLowerCase().includes('knee') ? '🦵' : '🏃‍♂️'
    };
   });

  if (actualTimelineInjuries.length === 0) {
   if (player.backstory === 'FALLEN_PRODIGY') {
    return [historicalInjuries[0], historicalInjuries[1]];
   }
   return [historicalInjuries[1], historicalInjuries[2]];
  }

  return actualTimelineInjuries;
 }, [fullTimeline, player.backstory]);
 
 const filteredTimeline = useMemo(() => {
  return fullTimeline.filter(evt => {
  if (timelineFilter !== 'ALL' && evt.type !== timelineFilter) return false;
  if (timelineSearch.trim() !== '') {
   const query = timelineSearch.toLowerCase();
   return evt.title.toLowerCase().includes(query) || evt.description.toLowerCase().includes(query);
  }
  return true;
  });
 }, [fullTimeline, timelineFilter, timelineSearch]);

 // Visual helper for attributes
 
 return (
 <div className="flex gap-6 h-full">
  {/* Left Column: Stats & Portrait */}
  <div className="w-[320px] flex flex-col gap-6">
  
  {/* Main Identity Card */}
  <div className="premium-card p-6 ">
   <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
   <CharacterPortrait type="player" size={64} name={`${player.firstName} ${player.lastName}`} />
   <div>
    <h2 className="text-white font-bold text-lg uppercase tracking-wider">{player.firstName} {player.lastName}</h2>
    <div className="text-white/50 text-[10px] uppercase tracking-widest mt-1.5 flex flex-col gap-0.5">
    <span>{player.position}</span>
    {player.roleSpecialization?.selectedRoleId ? (
      <span className="text-[#00FF88] font-bold">
       {getRoleById(player.roleSpecialization.selectedRoleId)?.name || player.subPosition}
      </span>
    ) : (
      <span>{player.subPosition}</span>
    )}
    </div>
   </div>
   </div>
   
   <div className="flex justify-between items-baseline mb-6">
   <div className="text-white/50 text-xs font-bold tracking-widest uppercase">Overall</div>
   <div className="text-[#00FF88] text-5xl font-black">{player.ovr}</div>
   </div>

   <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs uppercase tracking-widest text-white/50">
   <div>
    <div className="mb-1">Club</div>
    <div className="text-white flex items-center gap-1.5 font-semibold">
    {(() => {
     const club = CLUBS.find(c => c.symbol.toUpperCase() === player.currentClubSymbol.toUpperCase());
     return club ? (
     <>
      <TeamLogo
      symbol={club.symbol}
      name={club.name}
      primaryColor={club.primaryColor}
      secondaryColor={club.secondaryColor}
      size={18}
      className="flex-shrink-0"
      />
      <span>{player.currentClubSymbol}</span>
     </>
     ) : (
     <span>{player.currentClubSymbol}</span>
     );
    })()}
    </div>
   </div>
   <div>
    <div className="mb-1">Nation</div>
    <div className="text-white truncate">{player.nationality}</div>
   </div>
   <div>
    <div className="mb-1">Foot</div>
    <div className="text-white">{player.dominantFoot.toUpperCase()}</div>
   </div>
   <div>
    <div className="mb-1">Intl Status</div>
    <div className="text-white truncate">{player.stateFlags?.intlStatus || 'Uncapped'}</div>
   </div>
    <div>
     <div className="mb-1">Age</div>
    <div className="text-white font-semibold font-mono">{player.age} Years</div>
    </div>
    <div>
     <div className="mb-1">Growth Phase</div>
    <div className={`font-bold text-[10px] ${
       player.age < 21 ? 'text-emerald-400' :
       player.age < 28 ? 'text-teal-400' :
       player.age < 32 ? 'text-amber-400' :
       'text-red-400 animate-pulse'
     }`}>
       {player.age < 21 ? 'Rapid Growth' :
        player.age < 28 ? 'Peak Years' :
        player.age < 32 ? 'Slowing Gains' :
        'Late Plateau'}
     </div>
    </div>
   </div>

   <div className="mt-6 pt-6 border-t border-white/10">
    <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-2">Backstory</div>
    <div className="text-white font-bold uppercase tracking-wider mb-2">{player.backstory.replace('_', ' ')}</div>
    {player.backstoryDetails ? (
      <div className="space-y-2 mt-3 text-xs">
        {player.backstoryDetails.region && (
          <div className="flex justify-between text-white/70">
            <span className="text-white/40">Region:</span>
            <span className="font-bold text-white">{player.backstoryDetails.region}</span>
          </div>
        )}
        {player.backstoryDetails.formativeFrame && (
          <div className="flex justify-between text-white/70">
            <span className="text-white/40">Formative Style:</span>
            <span className="font-bold text-[#00FF88]">{player.backstoryDetails.formativeFrame}</span>
          </div>
        )}
        {player.backstoryDetails.familySituation && (
          <div className="flex justify-between text-white/70">
            <span className="text-white/40">Support Network:</span>
            <span className="font-bold text-white">{player.backstoryDetails.familySituation.title}</span>
          </div>
        )}
        {player.backstoryDetails.rivalOrMentor && (
          <div className="flex justify-between text-white/70">
            <span className="text-white/40">Key Figure:</span>
            <span className="font-bold text-white">{player.backstoryDetails.rivalOrMentor.name}</span>
          </div>
        )}
        {player.backstoryDetails.coreWound && (
          <div className="pt-2 border-t border-white/5 text-white/60 italic text-[11px]">
            "{player.backstoryDetails.coreWound.drivingQuestion}"
          </div>
        )}
      </div>
    ) : (
      <div className="text-white/40 text-xs leading-relaxed italic">
       "{player.backstory === 'STREET_PRODIGY' ? 'Concrete pitches. Bare feet. A viral clip changed everything.' :
       player.backstory === 'FALLEN_PRODIGY' ? 'At 16 they called you the next big thing. At 17 your knee said no.' :
       player.backstory === 'LATE_BLOOMER' ? 'Nobody found you. You found yourself.' :
       player.backstory === 'ACADEMY_GRADUATE' ? 'Every meal counted. Every drill measured. Now the real game asks: can you?' :
       'Comfortable life. Fat contract. You walked away to prove a point.'}"
      </div>
    )}
   </div>

   <div className="mt-6 pt-6 border-t border-white/10">
    <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-2">Personality</div>
   <div className="text-[#00FF88] font-bold text-xs tracking-wider uppercase bg-[#181818] px-3 py-2 w-fit rounded flex items-center gap-1.5">
    👤 {player.personality || 'Professional'}
   </div>
   </div>

   <div className="mt-6 pt-6 border-t border-white/10">
   <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-2">Traits ({player.traits?.length || 0}/3)</div>
   {player.traits && player.traits.length > 0 ? (
    <div className="flex flex-col gap-2">
    {player.traits.map(trait => (
     <div key={trait} className="text-white text-xs font-bold uppercase tracking-widest bg-[#151515] px-3 py-2 rounded flex items-center gap-1.5">
     <span className="text-[#00FF88] font-bold">✨</span>
     <span>{trait}</span>
     </div>
    ))}
    </div>
   ) : (
    <div className="text-white/40 text-xs italic">No traits earned yet.</div>
   )}
   </div>
  </div>

  </div>

  {/* Right Column: Conditions, Attributes, Activities */}
  <div className="flex-1 flex flex-col gap-6 overflow-hidden">
  
  {/* Navigation Tabs */}
  <div className="flex flex-wrap gap-2 border-b border-white/10 pb-0 shrink-0">
   <button 
   id="tab-attributes"
   onClick={() => setActiveTab('ATTRIBUTES')} 
   className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 px-3 transition-all duration-200 ${
    activeTab === 'ATTRIBUTES' 
    ? 'border-[#00FF88] text-[#00FF88] font-black' 
    : 'border-transparent text-white/40 hover:text-[#ccc]'
   }`}
   >
   Attributes
   </button>
   <button 
   id="tab-timeline"
   onClick={() => setActiveTab('TIMELINE')} 
   className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 px-3 transition-all duration-200 ${
    activeTab === 'TIMELINE' 
    ? 'border-[#00FF88] text-[#00FF88] font-black' 
    : 'border-transparent text-white/40 hover:text-[#ccc]'
   }`}
   >
   Timeline Feed
   </button>
   <button 
   id="tab-rivals"
   onClick={() => setActiveTab('RIVALS')} 
   className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 px-3 transition-all duration-200 ${
    activeTab === 'RIVALS' 
    ? 'border-[#00FF88] text-[#00FF88] font-black' 
    : 'border-transparent text-white/40 hover:text-[#ccc]'
   }`}
   >
   Positional Rivals
   </button>
   <button 
   id="tab-trophies"
   onClick={() => setActiveTab('TROPHIES')} 
   className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 px-3 transition-all duration-200 ${
    activeTab === 'TROPHIES' 
    ? 'border-[#00FF88] text-[#00FF88] font-black' 
    : 'border-transparent text-white/40 hover:text-[#ccc]'
   }`}
   >
   Trophy Cabinet
   </button>
   <button 
   id="tab-retirement"
   onClick={() => setActiveTab('RETIREMENT')} 
   className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 px-3 transition-all duration-200 ${
    activeTab === 'RETIREMENT' 
    ? 'border-[#00FF88] text-[#00FF88] font-black' 
    : 'border-transparent text-white/40 hover:text-[#ccc]'
   }`}
   >
   Retire & Legacy
   </button>
   <button 
   id="tab-story"
   onClick={() => setActiveTab('STORY')} 
   className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 px-3 transition-all duration-200 ${
    activeTab === 'STORY' 
    ? 'border-[#00FF88] text-[#00FF88] font-black' 
    : 'border-transparent text-white/40 hover:text-[#ccc]'
   }`}
   >
   Career Story
   </button>
   <button 
   id="tab-medical"
   onClick={() => setActiveTab('MEDICAL')} 
   className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 px-3 transition-all duration-200 ${
    activeTab === 'MEDICAL' 
    ? 'border-[#00FF88] text-[#00FF88] font-black' 
    : 'border-transparent text-white/40 hover:text-[#ccc]'
   }`}
   >
   Medical History
   </button>
  </div>

  {activeTab === 'ATTRIBUTES' && (
   <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar">
   <div className="flex flex-col xl:flex-row gap-6 h-fit shrink-0">
    {/* Condition Card */}
    <div id="condition-card" className="flex-1 premium-card p-6 ">
    <div className="text-white text-sm font-bold tracking-widest uppercase mb-6">Condition</div>
    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
     <ProgressBar label="Form" value={player.form} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Match Sharpness" value={player.sharpness} showValue={true} colorMode="accent" height="h-2" />
     <ProgressBar label="Manager Trust" value={player.trust} showValue={true} colorMode="trust" height="h-2" />
     <ProgressBar label="Morale" value={player.morale} showValue={true} colorMode="morale" height="h-2" />
     
     <ProgressBar label="Squad Chemistry" value={player.relationships.teammates} showValue={true} colorMode="trust" height="h-2" />
     <ProgressBar label="Tactical" value={player.tacticalFamiliarity} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Manager Relationship" value={player.relationships.manager} showValue={true} colorMode="trust" height="h-2" />
     <ProgressBar label="Discipline Trust" value={player.relationships.manager_discipline} showValue={true} colorMode="trust" height="h-2" />
     <ProgressBar label="Intl Manager Trust" value={player.relationships.intlManager || 50} showValue={true} colorMode="trust" height="h-2" />
     <div>
     <ProgressBar label="♡ Fatigue" value={player.fatigue} colorMode="fatigue" height="h-2" className="mt-2" />
     </div>
    </div>
    </div>
    
    {/* Reputation Card */}
    <div id="reputation-card" className="flex-1 premium-card p-6 ">
    <div className="text-white text-sm font-bold tracking-widest uppercase mb-6">Reputation Levels</div>
    <div className="grid grid-cols-1 gap-y-6">
     <ProgressBar label="World Reputation" value={player.reputation.world} colorMode="accent" height="h-2" />
     <ProgressBar label="Media Optics" value={player.mediaPerception} colorMode="accent" height="h-2" />
     <ProgressBar label="Peer Respect" value={player.reputation.peerRespect || 50} colorMode="accent" height="h-2" />
     <ProgressBar label="Fan Support" value={player.fans || 50} colorMode="accent" height="h-2" />
    </div>
    </div>

    {/* Potential & Ceiling Card */}
    <div id="potential-card" className="flex-1 premium-card p-6 flex flex-col justify-between relative overflow-hidden">
     <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF88]/5 rounded-full blur-xl pointer-events-none"></div>
     <div>
      <div className="text-white text-sm font-bold tracking-widest uppercase mb-4">Developmental Ceiling</div>
      
      {/* Category */}
      {(() => {
        const ceiling = player.ceiling || 80;
        let categoryText = "At Their Natural Level";
        let categoryColor = "text-[#aaaaaa]";
        let categoryBg = "bg-white/5 border-white/10";
        
        if (ceiling >= 90) {
          categoryText = "Has Potential to be Special";
          categoryColor = "text-emerald-400 animate-pulse";
          categoryBg = "bg-emerald-400/5 border-emerald-400/20";
        } else if (ceiling >= 85) {
          categoryText = "Showing Great Potential";
          categoryColor = "text-cyan-400";
          categoryBg = "bg-cyan-400/5 border-cyan-400/20";
        } else if (ceiling >= 80) {
          categoryText = "An Exciting Prospect";
          categoryColor = "text-amber-400";
          categoryBg = "bg-amber-400/5 border-amber-400/20";
        } else if (ceiling >= 75) {
          categoryText = "A Steady Professional";
          categoryColor = "text-purple-400";
          categoryBg = "bg-purple-400/5 border-purple-400/20";
        }

        const apps = player.stats?.apps || 0;
        let uncertaintyText = "Unconfirmed / Raw Data";
        let uncertaintyColor = "text-red-400";
        if (apps > 25) {
          uncertaintyText = "Highly Confirmed / Peak Modeling";
          uncertaintyColor = "text-emerald-400";
        } else if (apps >= 10) {
          uncertaintyText = "Establishing Trend Line";
          uncertaintyColor = "text-cyan-400";
        }

        return (
          <div className="space-y-4">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-1">Youth Status Category</div>
              <div className={`p-3 rounded-lg border text-center text-xs font-black uppercase tracking-wider ${categoryBg} ${categoryColor}`}>
                {categoryText}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-1">Analytical Uncertainty</div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${uncertaintyColor === 'text-emerald-400' ? 'bg-emerald-400 animate-pulse' : uncertaintyColor === 'text-cyan-400' ? 'bg-cyan-400' : 'bg-red-400'}`} />
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wide ${uncertaintyColor}`}>{uncertaintyText}</span>
              </div>
              <p className="text-[9px] text-white/40 mt-1 font-mono leading-relaxed uppercase">Based on {apps} matches of telemetry. Play more fixtures to establish a definitive projection.</p>
            </div>
          </div>
        );
      })()}
     </div>

    </div>
   </div>

   {/* Detailed Attributes Cards */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
    <div className="premium-card p-6 ">
    <div className="text-[#00FF88] text-sm font-bold tracking-widest uppercase mb-6 pb-2 border-b border-white/10">Technical</div>
    <div className="space-y-4">
     <ProgressBar label="Finishing" value={player.attributes.finishing} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Passing" value={player.attributes.passing} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Dribbling" value={player.attributes.dribbling} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Tackling" value={player.attributes.tackling} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="First Touch" value={player.attributes.firstTouch} showValue={true} colorMode="default" height="h-2" />
    </div>
    </div>
    
    <div className="premium-card p-6 ">
    <div className="text-[#00FF88] text-sm font-bold tracking-widest uppercase mb-6 pb-2 border-b border-white/10">Mental</div>
    <div className="space-y-4">
     <ProgressBar label="Composure" value={player.attributes.composure} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Vision" value={player.attributes.vision} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Decision Making" value={player.attributes.decisionMaking} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Tactical Awareness" value={player.attributes.tacticalAwareness || 50} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Leadership" value={player.attributes.leadership} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Determination" value={player.attributes.determination} showValue={true} colorMode="default" height="h-2" />
    </div>
    </div>

    <div className="premium-card p-6 ">
    <div className="text-[#00FF88] text-sm font-bold tracking-widest uppercase mb-6 pb-2 border-b border-white/10">Physical</div>
    <div className="space-y-4">
     <ProgressBar label="Pace" value={player.attributes.pace} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Stamina" value={player.attributes.stamina} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Strength" value={player.attributes.strength} showValue={true} colorMode="default" height="h-2" />
     <ProgressBar label="Agility" value={player.attributes.agility} showValue={true} colorMode="default" height="h-2" />
    </div>
    </div>
   </div>

   {/* Season Summary row */}
   <div className="premium-card p-6 shrink-0">
    <div className="text-white text-sm font-bold tracking-widest uppercase mb-6">This Season</div>
    <div className="grid grid-cols-3 gap-8 text-center divide-x divide-[#222222]">
    <div>
     <div className="text-white/50 text-xs tracking-widest uppercase mb-1">Apps</div>
     <div className="text-white text-3xl font-black">{player.stats?.apps || 0}</div>
    </div>
    <div>
     <div className="text-white/50 text-xs tracking-widest uppercase mb-1">Goals</div>
     <div className="text-white text-3xl font-black">{player.stats?.goals || 0}</div>
    </div>
    <div>
     <div className="text-white/50 text-xs tracking-widest uppercase mb-1">Assists</div>
     <div className="text-white text-3xl font-black">{player.stats?.assists || 0}</div>
    </div>
    </div>
   </div>
   </div>
  )}

  {activeTab === 'TIMELINE' && (
   <div className="flex-1 flex flex-col gap-4 premium-card p-6 overflow-hidden">
   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
    <div>
    <h3 className="text-white text-base font-bold tracking-wider uppercase">Career Timeline Feed</h3>
    <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Biographical milestones, injuries, and club transfers</p>
    </div>
    
    {/* Search Bar */}
    <div className="relative">
    <input 
     type="text" 
     placeholder="SEARCH TIMELINE..." 
     value={timelineSearch}
     onChange={(e) => setTimelineSearch(e.target.value)}
     className="bg-[#181818] border border-[#2d2d2d] text-xs px-4 py-2 text-white font-mono placeholder-[#444] rounded-sm focus:outline-none focus:border-[#00FF88] w-64 uppercase tracking-wider"
    />
    </div>
   </div>

   {/* Filter buttons */}
   <div className="flex flex-wrap gap-2 py-1 shrink-0">
    {[
    { label: 'ALL EVENTS', val: 'ALL', color: 'border-transparent hover:border-[#444]' },
    { label: 'MILESTONES', val: 'MILESTONE', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
    { label: 'INJURIES', val: 'INJURY', color: 'border-red-500/20 text-red-400 bg-red-500/5' },
    { label: 'TRANSFERS', val: 'TRANSFER', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' }
    ].map(f => (
    <button
     key={f.val}
     onClick={() => setTimelineFilter(f.val as any)}
     className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border transition-all rounded-sm
     ${timelineFilter === f.val 
      ? 'bg-[#00FF88] text-white border-[#00FF88]' 
      : `bg-[#131313] border-white/10 text-white/50 ${f.color}`}
     `}
    >
     {f.label}
    </button>
    ))}
   </div>

   {/* Timeline Feed Stream */}
   <div className="flex-1 overflow-y-auto pr-2 no-scrollbar mt-4">
    {filteredTimeline.length === 0 ? (
    <div className="h-full flex flex-col items-center justify-center text-center py-16">
     <span className="text-[#444] text-xs font-black uppercase tracking-widest">No matching career events</span>
     <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 leading-relaxed max-w-xs">Try adjusting your filter category or keywords</p>
    </div>
    ) : (
    <div className="relative pl-6 border-l border-white/10 ml-4 space-y-6 py-2">
     {filteredTimeline.map((evt) => {
     let colorDot = 'bg-[#10b981] shadow-[0_0_8px_#10b981]';
     let labelColor = 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5';
     if (evt.type === 'INJURY') {
      colorDot = 'bg-[#ef4444] shadow-[0_0_8px_#ef4444]';
      labelColor = 'text-rose-400 border-rose-500/10 bg-rose-500/5';
     } else if (evt.type === 'TRANSFER') {
      colorDot = 'bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]';
      labelColor = 'text-blue-400 border-blue-500/10 bg-blue-500/5';
     } else if (evt.type === 'MILESTONE') {
      colorDot = 'bg-[#00FF88] shadow-[0_0_8px_#00FF88]';
      labelColor = 'text-[#00FF88] border-[#00FF88]/10 bg-[#00FF88]/5';
     }

     return (
      <div key={evt.id} className="relative group">
      {/* Bullet indicator nodes positioned over the left border line */}
      <div className={`absolute -left-[31px] top-1.5 w-2 h-2 rounded-full ${colorDot} border border-[#111] transition-transform duration-200 group-hover:scale-125`} />
      
      <div className="flex items-start justify-between bg-[#151515] p-5 border border-[#1e1e1e] hover:border-[#2d2d2d] transition-all duration-200">
       <div className="flex-1">
       {/* Date Header */}
       <div className="flex items-center gap-3">
        <span className={`font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-sm ${labelColor}`}>
        {evt.week < 1 ? `Pre-Career (Wk ${evt.week})` : `Wk ${evt.week} · ${evt.day || 'MON'}`}
        </span>
        <span className="text-[#64748b] text-[9px] font-mono font-bold uppercase tracking-widest">
        {evt.type}
        </span>
       </div>

       {/* Event Title */}
       <h4 className="text-white text-sm font-bold uppercase tracking-wider mt-2 group-hover:text-[#00FF88] transition-colors">
        {evt.title}
       </h4>

       {/* Event Description */}
       <p className="text-white/50 text-xs mt-2 leading-relaxed font-sans font-medium">
        {evt.description}
       </p>
       </div>

       {/* Club Badge */}
       {evt.clubSymbol && (
       <div className="bg-[#1b1b1b] border border-[#2a2a2a] text-[#00FF88] font-mono font-black text-[10px] px-2.5 py-1 uppercase tracking-widest ml-4 shadow-sm self-start">
        {evt.clubSymbol}
       </div>
       )}
      </div>
      </div>
     );
     })}
    </div>
    )}
   </div>
   </div>
  )}

  {activeTab === 'RIVALS' && (
   <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar premium-card p-6 animate-fadeIn">
   <div className="border-b border-white/10 pb-4">
    <h3 className="text-white text-base font-bold tracking-wider uppercase">Positional Grudge & Rivals</h3>
    <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Direct comparisons and competitive narratives maintained by local media</p>
   </div>
   
   {!player.rivals || player.rivals.length === 0 ? (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 border border-dashed border-white/10">
    <span className="text-[#444] text-xs font-black uppercase tracking-widest">No Active Rivals</span>
    <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 leading-relaxed max-w-xs">Play matches and increase your reputation to ignite fierce individual rivalries.</p>
    </div>
   ) : (
    <div className="space-y-6">
    {player.rivals.map((rival, index) => (
     <div key={index} className="space-y-6">
     {/* Head-to-Head Main Panel */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* You Card */}
      <div className="bg-[#151515] p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex items-center justify-between mb-4">
       <div>
       <span className="text-[#00FF88] text-[10px] font-mono tracking-widest font-bold uppercase">Roster Star</span>
       <h4 className="text-white text-lg font-black uppercase tracking-tight">{player.firstName} {player.lastName}</h4>
       </div>
       <span className="text-white text-xs font-mono px-2 py-0.5 bg-white/10 font-black uppercase tracking-widest">{player.currentClubSymbol}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 font-mono text-xs">
       <div>
       <span className="text-white/40 block uppercase text-[10px]">Current OVR</span>
       <span className="text-white text-xl font-bold">{player.ovr}</span>
       </div>
       <div>
       <span className="text-white/40 block uppercase text-[10px]">Season Goals</span>
       <span className="text-[#00FF88] text-xl font-bold">{rival.seasonComparison.yourGoals}</span>
       </div>
       <div className="col-span-2">
       <span className="text-white/40 block uppercase text-[10px] mb-1">Match Form Rating</span>
       <div className="flex items-center gap-2">
        <div className="flex-1 bg-white/10 h-1.5 rounded-sm overflow-hidden">
        <div className="bg-[#00FF88] h-full" style={{ width: `${rival.seasonComparison.yourRating * 10}%` }}></div>
        </div>
        <span className="text-white font-bold">{rival.seasonComparison.yourRating}</span>
       </div>
       </div>
      </div>
      </div>

      {/* Rival Card */}
      <div className="bg-[#151515] p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex items-center justify-between mb-4">
       <div>
       <span className="text-red-500 text-[10px] font-mono tracking-widest font-bold uppercase">Arch Rival</span>
       <h4 className="text-white text-lg font-black uppercase tracking-tight">{rival.name}</h4>
       </div>
       <span className="text-white text-xs font-mono px-2 py-0.5 bg-white/10 font-black uppercase tracking-widest">{rival.club}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 font-mono text-xs">
       <div>
       <span className="text-white/40 block uppercase text-[10px]">Current OVR</span>
       <span className="text-white text-xl font-bold">{player.ovr + 1}</span>
       </div>
       <div>
       <span className="text-white/40 block uppercase text-[10px]">Season Goals</span>
       <span className="text-red-400 text-xl font-bold">{rival.seasonComparison.theirGoals}</span>
       </div>
       <div className="col-span-2">
       <span className="text-white/40 block uppercase text-[10px] mb-1">Match Form Rating</span>
       <div className="flex items-center gap-2">
        <div className="flex-1 bg-white/10 h-1.5 rounded-sm overflow-hidden">
        <div className="bg-red-500 h-full" style={{ width: `${rival.seasonComparison.theirRating * 10}%` }}></div>
        </div>
        <span className="text-white font-bold">{rival.seasonComparison.theirRating}</span>
       </div>
       </div>
      </div>
      </div>
     </div>

     {/* Sensational Tabloid News Ticker */}
     <div className="bg-red-500/5 border border-red-500/20 p-4">
      <div className="flex items-center gap-2 mb-2">
      <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
      <span className="text-red-400 text-[9px] font-mono font-black uppercase tracking-widest">TABLOID HEADLINE DEBATE</span>
      </div>
      <p className="text-white text-xs italic font-serif leading-relaxed">
      "{rival.mediaNarrative}"
      </p>
     </div>

     {/* Head-to-Head Clash Log */}
     <div className=" p-5">
      <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Direct Match Confrontation History</h4>
      {rival.headToHead.length === 0 ? (
      <p className="text-white/40 text-[10px] uppercase tracking-widest italic">No head-to-head fixtures recorded yet this campaign.</p>
      ) : (
      <div className="space-y-2 font-mono text-xs">
       {rival.headToHead.map((h2h, hIdx) => (
       <div key={hIdx} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
        <span className="text-white/50">{h2h.date}</span>
        <div className="flex items-center gap-4">
        <span className="text-white font-bold">{player.currentClubSymbol} {h2h.yourGoals} - {h2h.theirGoals} {rival.club}</span>
        <span className={`px-2 py-0.5 text-[9px] font-black rounded-sm ${
         h2h.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' :
         h2h.result === 'LOSS' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'
        }`}>{h2h.result}</span>
        </div>
       </div>
       ))}
      </div>
      )}
     </div>
     </div>
    ))}
    </div>
   )}
   </div>
  )}

  {activeTab === 'TROPHIES' && (
   <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar premium-card p-6 animate-fadeIn">
   <div className="border-b border-white/10 pb-4">
    <h3 className="text-white text-base font-bold tracking-wider uppercase">Trophy Hall & Historic Chronicles</h3>
    <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">A physical testament to your competitive achievements and historical dominance</p>
   </div>
   
   {!player.trophies || player.trophies.length === 0 ? (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 border border-dashed border-white/10">
    <div className="text-[#333] text-5xl mb-4">🏆</div>
    <span className="text-[#444] text-xs font-black uppercase tracking-widest">Trophy Cabinet is Empty</span>
    <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2 leading-relaxed max-w-xs">Fight for domestic silverware, championship promotions, or cup runs to immortalize your name.</p>
    </div>
   ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {player.trophies.map((trophy, tIdx) => (
     <div key={tIdx} className="bg-[#151515] hover:border-amber-500/30 transition-all p-5 relative overflow-hidden group">
     <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-amber-500/10"></div>
     <div className="flex items-start gap-4">
      <div className="text-3xl text-amber-500 select-none">🏆</div>
      <div>
      <div className="flex items-center gap-2 mb-1.5">
       <span className="text-amber-500 font-mono text-[9px] font-black uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">{trophy.year} CHAMPION</span>
      </div>
      <h4 className="text-white text-base font-bold uppercase tracking-wider">{trophy.name}</h4>
      <span className="text-white/40 text-[10px] font-mono uppercase block mt-1">{trophy.competition}</span>
      <p className="text-white/50 text-xs mt-3 leading-relaxed font-sans">
       {trophy.story}
      </p>
      </div>
     </div>
     </div>
    ))}
    </div>
   )}
   </div>
  )}


  {activeTab === 'STORY' && (
   <div className="premium-card p-6 rounded-xl animate-fade-in space-y-6">
    <div className="flex items-center gap-3 mb-4">
     <div className="w-1.5 h-6 bg-[#00FF88]"></div>
     <h3 className="text-white font-black text-lg tracking-wider uppercase">Career Story Journal</h3>
    </div>
    <p className="text-white/50 text-xs font-mono uppercase tracking-widest">
      Review your pivotal moments and narrative chapters.
    </p>

    <div className="space-y-6">
      {(!state.unlockedCutscenes || state.unlockedCutscenes.length === 0) ? (
        <div className="text-white/40 text-sm font-mono text-center py-12">No chapters unlocked yet. Play the game to write your story.</div>
      ) : (
        state.unlockedCutscenes.map((scene, idx) => (
          <div key={idx} className="glass-panel p-6 border-l-2 border-[#00FF88] rounded relative">

            <div className="absolute top-0 right-0 px-3 py-1 bg-white/5 text-[9px] font-bold uppercase tracking-widest text-white/50 rounded-bl">
              {scene.date}
            </div>
            <h4 className="text-lg font-black uppercase tracking-wider mb-4 text-white">{scene.title}</h4>
            <div className="space-y-3 pl-4 border-l-2 border-white/10">
              {scene.lines?.map((line: any, lIdx: number) => (
                <div key={lIdx} className="text-white/70 text-sm font-serif leading-relaxed">
                  {line.speaker && <span className="font-bold font-sans text-xs uppercase tracking-widest text-white/50 mr-2">{line.speaker}:</span>}
                  {line.text}
                </div>
              ))}
            </div>
            {scene.choiceText && (
              <div className="mt-4 pl-4 border-l-2 border-[#00FF88] text-[#00FF88] text-xs font-bold font-mono tracking-wide">
                &gt; {scene.choiceText}
              </div>
            )}

          </div>
        ))
      )}
    </div>
   </div>
  )}

  {activeTab === 'RETIREMENT' && (
   <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar premium-card p-6 relative animate-fadeIn">
   {isRetired ? (
    <div className="space-y-6">
    <div className="border border-amber-500/30 bg-amber-500/5 p-6 text-center rounded-sm">
     <div className="text-5xl mb-4 text-amber-500">🏆</div>
     <h3 className="text-white text-xl font-black uppercase tracking-widest font-display">THE ODYSSEY CONCLUDES</h3>
     <p className="text-amber-400 font-mono text-xs uppercase tracking-widest mt-1">Official Retirement Announcement & Hall of Fame Induction</p>
     
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 divide-x divide-[#222] font-mono text-xs">
     <div>
      <span className="text-white/40 block uppercase tracking-widest text-[9px]">Appearances</span>
      <span className="text-white text-lg font-bold">{player.stats?.apps || 0}</span>
     </div>
     <div>
      <span className="text-white/40 block uppercase tracking-widest text-[9px]">Career Goals</span>
      <span className="text-white text-lg font-bold">{player.stats?.goals || 0}</span>
     </div>
     <div>
      <span className="text-white/40 block uppercase tracking-widest text-[9px]">Trophies</span>
      <span className="text-white text-lg font-bold">{player.trophies?.length || 0}</span>
     </div>
     <div>
      <span className="text-white/40 block uppercase tracking-widest text-[9px]">Legacy Class</span>
      <span className="text-amber-500 text-lg font-black uppercase">{calculateLegacyScore(player).legacyTier}</span>
     </div>
     </div>
    </div>

    <div className=" p-5 space-y-4 leading-relaxed font-serif text-[#bbb] text-xs italic">
     <h4 className="text-white text-xs font-bold uppercase font-sans tracking-widest not-italic">PRESS DISPATCH: "AN ICON HANGS UP THE BOOTS"</h4>
     <p>
     "Today, at the age of {player.age}, {player.firstName} {player.lastName} has formally announced their immediate retirement from professional football. Starting from the humble roots of {player.startingClubSymbol}, {player.lastName}'s journey took them to the absolute limit of technical capability."
     </p>
     <p>
     {calculateLegacyScore(player).legacyScore >= 2500 ? (
      <span className="text-amber-400 not-italic font-sans text-xs font-bold uppercase tracking-wide block mt-4">
      ★ STATUE COMMISSIONED: Due to your incredible loyalty and reputation, {player.currentClubSymbol} has commissioned a bronze statue outside the main pavilion to forever honor your service.
      </span>
     ) : (
      "Fans have gathered outside the grounds to pay tribute to a local hero who gave everything for the badge."
     )}
     </p>
    </div>

    <div className="bg-[#1c1c1c] p-6 border border-[#2d2d2d] rounded-sm space-y-4">
     <h4 className="text-white text-xs font-mono font-bold uppercase tracking-widest">Score Breakdown Summary</h4>
     <div className="space-y-2 font-mono text-xs">
     <div className="flex justify-between"><span className="text-white/40">Trophies Won Weight (x250):</span><span className="text-white">+{(player.trophies?.length || 0) * 250}</span></div>
     <div className="flex justify-between"><span className="text-white/40">World Reputation Power (x20):</span><span className="text-white">+{player.reputation.world * 20}</span></div>
     <div className="flex justify-between"><span className="text-white/40">Longevity appearances (x15):</span><span className="text-white">+{(player.stats?.apps || 0) * 15}</span></div>
     <div className="flex justify-between"><span className="text-white/40">One-Club Loyalty Bonus:</span><span className="text-white">+{player.currentClubSymbol === player.startingClubSymbol ? 500 : 100}</span></div>
     <div className="border-t border-white/10 pt-2 flex justify-between font-black"><span className="text-white uppercase tracking-wider">GRAND LEGACY SCORE:</span><span className="text-amber-500">{calculateLegacyScore(player).legacyScore} PTS</span></div>
     </div>
    </div>

     <div className="flex flex-col md:flex-row gap-3">
      <button
       onClick={() => startLegacyContinuation()}
       className="flex-1 py-4 bg-[#00FF88] text-black font-black uppercase tracking-widest text-xs hover:bg-[#00FF88]/90 transition-colors rounded-sm"
      >
       🌟 Continue Your Legacy (New Career+)
      </button>
      <button
       onClick={() => setScreen('MAIN_MENU')}
       className="flex-1 py-4 bg-white/10 text-white font-mono font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors rounded-sm"
      >
       Return to Main Menu
      </button>
     </div>
     </div>
   ) : (
    <div className="space-y-6">
     <div className="border-b border-white/10 pb-4 flex justify-between items-center">
      <div>
       <h3 className="text-white text-base font-bold tracking-wider uppercase">Retire & Legacy Tracker</h3>
       <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Review your standing on the immortal historical record and declare retirement</p>
      </div>
      {player.age < 33 && (
       <button
        onClick={() => {
         setPlayer({
          ...player,
          age: 33,
          timeline: [
           ...player.timeline,
           {
            id: `fast_track_${Date.now()}`,
            week: state.currentWeek,
            day: 'SUN',
            type: 'MILESTONE',
            title: '🎓 Aged Cheat fasttrack Enabled',
            description: 'Advanced career aging cheat simulation triggered. Age set to 33 to unlock transition dialogues.'
           }
          ]
         });
        }}
        className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition-all text-[9px] font-mono font-bold uppercase tracking-widest"
       >
        Cheat: Fast-Track to Age 33 ⚡
       </button>
      )}
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#151515] p-5">
       <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Current Class</span>
       <h4 className="text-white text-lg font-black uppercase mt-1">{calculateLegacyScore(player).legacyTier}</h4>
       <p className="text-white/50 text-xs leading-relaxed mt-2 font-mono">
        Your achievements place you among local favorites. Push harder to secure Continental or Global Legend status.
       </p>
      </div>

      <div className="bg-[#151515] p-5">
       <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Grand Legacy Points</span>
       <h4 className="text-[#00FF88] text-2xl font-black mt-1 font-mono">{calculateLegacyScore(player).legacyScore} <span className="text-xs text-white/40">PTS</span></h4>
       <div className="w-full bg-white/10 h-1.5 rounded-sm overflow-hidden mt-3">
        <div className="bg-[#00FF88] h-full" style={{ width: `${Math.min(100, (calculateLegacyScore(player).legacyScore / 10000) * 100)}%` }}></div>
       </div>
      </div>
     </div>

     {/* Transition Decision Dialogue System (Unlocks at Age 33+) */}
     {player.age >= 33 ? (
      <div className="border border-[#00FF88]/30 bg-[#00FF88]/5 p-6 rounded-sm space-y-6">
       <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h4 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
         💼 Twilight Board Room: Career Decisions (Age {player.age})
        </h4>
        <span className="text-[#00FF88] text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-[#00FF88]/10 border border-[#00FF88]/20">
         Active Phase: {retirementStep}
        </span>
       </div>

       {retirementStep === 'MENU' && (
        <div className="space-y-4">
         <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1c1c1c] flex items-center justify-center text-xl shrink-0">🤝</div>
          <p className="text-[#ccc] text-xs font-serif italic leading-relaxed">
           "Boss, you have had an incredible journey, but we must face the reality. At age {player.age}, physical training is taking longer, and recovery is slower. Several interesting files lie on the desk. You can seek a transition to coaching, stay and chase specific record achievements, or call a graceful press conference."
          </p>
         </div>

         {player.stateFlags?.openThreads?.activeRetirementQuest && (
          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-sm">
           <span className="text-amber-400 text-[9px] font-mono font-bold block uppercase tracking-wider">Chased Milestone:</span>
           <span className="text-white text-xs font-bold uppercase">
            {player.stateFlags.openThreads.activeRetirementQuest === 'CAPS' && `CENTURY CHASER (Reach 100 Caps. Progress: ${player.stats?.caps || 0} / 100)`}
            {player.stateFlags.openThreads.activeRetirementQuest === 'GOALS' && `AGELESS STRIKER (Score 15 more career club goals)`}
            {player.stateFlags.openThreads.activeRetirementQuest === 'TRUST' && `BOARDROOM INFLUENCER (Maintain 95% Manager Trust)`}
           </span>
          </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          <button
           onClick={() => setRetirementStep('COACHING')}
           className="p-4 border border-[#333] hover:border-cyan-500 bg-[#0d0d0d] hover:bg-cyan-500/5 transition-all text-left rounded-sm"
          >
           <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">🎓 Seeking Coaching Badges</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Study for Pro Badges. Secure Assistant Manager contracts at {player.currentClubSymbol} or your starting club {player.startingClubSymbol}.</p>
          </button>

          <button
           onClick={() => setRetirementStep('RECORDS')}
           className="p-4 border border-[#333] hover:border-amber-500 bg-[#0d0d0d] hover:bg-amber-500/5 transition-all text-left rounded-sm"
          >
           <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">🎯 Chasing Record Milestones</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Stay in the game! Declare specific ageless goalscorer, century caps, or boardroom records you intend to break.</p>
          </button>

          <button
           onClick={() => setRetirementStep('GRACEFUL')}
           className="p-4 border border-[#333] hover:border-red-500 bg-[#0d0d0d] hover:bg-red-500/5 transition-all text-left rounded-sm"
          >
           <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">🌟 Graceful Resignation</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Announce immediate retirement via press release. Lock stats, claim full Hall of Fame honors, and exit clean.</p>
          </button>
         </div>
          <button
           onClick={() => setRetirementStep('HOMECOMING')}
           className="p-4 border border-[#333] hover:border-[#00FF88] bg-[#0d0d0d] hover:bg-[#00FF88]/5 transition-all text-left rounded-sm"
          >
           <div className="text-[#00FF88] text-xs font-bold uppercase tracking-wider mb-1">🏠 Finish Where It Started</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Request a homecoming transfer to {player.hometownClubSymbol || player.startingClubSymbol}. Demand a Farewell Tour before bowing out.</p>
          </button>
        </div>
       )}

       {retirementStep === 'COACHING' && (
        <div className="space-y-4">
         <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1c1c1c] flex items-center justify-center text-xl shrink-0">📋</div>
          <p className="text-[#ccc] text-xs font-serif italic leading-relaxed">
           "Your clinical execution of tactical drills makes you a prime candidate for the bench, Boss. Based on your stellar stats ({player.stats.apps} appearances), {player.currentClubSymbol} and {player.startingClubSymbol} have offered Youth/Assistant coaching deals. Select your tactical management archetype:"
          </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          <button
           onClick={() => setSelectedCoachingStyle('TACTICAL')}
           className={`p-4 border text-left rounded-sm transition-all ${selectedCoachingStyle === 'TACTICAL' ? 'border-cyan-500 bg-cyan-500/5' : 'border-[#333] bg-transparent'}`}
          >
           <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">🔬 Tactical Mastermind</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Deploy structured tiki-taka, high possession, and micro-aligned positional tactics.</p>
          </button>

          <button
           onClick={() => setSelectedCoachingStyle('MAN_MANAGER')}
           className={`p-4 border text-left rounded-sm transition-all ${selectedCoachingStyle === 'MAN_MANAGER' ? 'border-emerald-500 bg-emerald-500/5' : 'border-[#333] bg-transparent'}`}
          >
           <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">📢 Emotional Motivator</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Maximize locker room relationships, team spirit, and intense matchday motivation.</p>
          </button>

          <button
           onClick={() => setSelectedCoachingStyle('YOUTH')}
           className={`p-4 border text-left rounded-sm transition-all ${selectedCoachingStyle === 'YOUTH' ? 'border-pink-500 bg-pink-500/5' : 'border-[#333] bg-transparent'}`}
          >
           <div className="text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">🌱 Youth Development Director</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Prioritize the scouting network, fast-tracking wonderkids, and training optimization.</p>
          </button>
         </div>

         <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
          <button
           onClick={() => setRetirementStep('MENU')}
           className="px-4 py-2 text-xs font-mono font-bold uppercase text-white/50 hover:text-white transition-colors"
          >
           Back
          </button>
          <button
           onClick={() => {
            setPlayer({
             ...player,
             stateFlags: {
              ...(player.stateFlags || {}),
              retired: true
             },
             timeline: [
              ...player.timeline,
              {
               id: `coaching_${Date.now()}`,
               week: state.currentWeek,
               type: 'MILESTONE',
               day: 'SUN',
               title: `🏆 Appointed Coach at ${player.currentClubSymbol}`,
               description: `Graduated Pro License and accepted Youth Coaching contract. Archetype selected: ${selectedCoachingStyle}.`
              }
             ]
            });
            setIsRetired(true);
           }}
           className="px-6 py-2 bg-cyan-500 text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors"
          >
           Accept Coaching Deal & Retire
          </button>
         </div>
        </div>
       )}

       {retirementStep === 'RECORDS' && (
        <div className="space-y-4">
         <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1c1c1c] flex items-center justify-center text-xl shrink-0">🎯</div>
          <p className="text-[#ccc] text-xs font-serif italic leading-relaxed">
           "Hungry for more silverware, Boss? I respect that. Let's make sure the board and fans know you are staying with a massive goal in mind. What is your final records objective before hanging up the boots?"
          </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          <button
           onClick={() => setSelectedRecordQuest('CAPS')}
           className={`p-4 border text-left rounded-sm transition-all ${selectedRecordQuest === 'CAPS' ? 'border-amber-500 bg-amber-500/5' : 'border-[#333] bg-transparent'}`}
          >
           <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">🎖️ Century Chaser</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Target: Achieve 100 senior international caps. Currently: {player.stats?.caps || 0} Caps.</p>
          </button>

          <button
           onClick={() => setSelectedRecordQuest('GOALS')}
           className={`p-4 border text-left rounded-sm transition-all ${selectedRecordQuest === 'GOALS' ? 'border-orange-500 bg-orange-500/5' : 'border-[#333] bg-transparent'}`}
          >
           <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">⚽ Ageless Goalscorer</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Target: Score 15 more professional club career goals.</p>
          </button>

          <button
           onClick={() => setSelectedRecordQuest('TRUST')}
           className={`p-4 border text-left rounded-sm transition-all ${selectedRecordQuest === 'TRUST' ? 'border-emerald-500 bg-emerald-500/5' : 'border-[#333] bg-transparent'}`}
          >
           <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">🤝 Boardroom Icon</div>
           <p className="text-[#888] text-[10px] leading-relaxed">Target: Achieve and maintain 95% Manager Trust.</p>
          </button>
         </div>

         <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
          <button
           onClick={() => setRetirementStep('MENU')}
           className="px-4 py-2 text-xs font-mono font-bold uppercase text-white/50 hover:text-white transition-colors"
          >
           Back
          </button>
          <button
           onClick={() => {
            setPlayer({
             ...player,
             stateFlags: {
              ...player.stateFlags,
              openThreads: {
               ...(player.stateFlags?.openThreads || {}),
               activeRetirementQuest: selectedRecordQuest
              }
             },
             timeline: [
              ...player.timeline,
              {
               id: `quest_${Date.now()}`,
               week: state.currentWeek,
               type: 'MILESTONE',
               day: 'SUN',
               title: `🎯 Declared Twilight Pursuit: ${selectedRecordQuest}`,
               description: `Publicly declared intent to remain in the active squad and target ${selectedRecordQuest} records before hanging up the boots.`
              }
             ]
            });
            setRetirementStep('MENU');
            setActiveTab('ATTRIBUTES');
           }}
           className="px-6 py-2 bg-amber-500 text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors"
          >
           Lock In Record Chasing & Play On ⚽
          </button>
         </div>
        </div>
       )}

        {retirementStep === 'HOMECOMING' && (
         <div className="bg-[#111] border border-white/10 p-5 rounded-sm">
         <h4 className="text-[#00FF88] text-sm font-bold uppercase tracking-wider mb-2">The Homecoming Tour</h4>
         <p className="text-[#aaa] text-xs leading-relaxed mb-6">
          You will formally instruct your agent to orchestrate a move back to <strong>{player.hometownClubSymbol || player.startingClubSymbol}</strong> regardless of wages. 
          Your final season will be treated as a Farewell Tour, culminating in a Testimonial Match with your oldest teammates.
         </p>
         
         <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
          <button
           onClick={() => setRetirementStep('MENU')}
           className="px-4 py-2 text-xs font-mono font-bold uppercase text-white/50 hover:text-white transition-colors"
          >
           Back
          </button>
          <button
           onClick={() => {
            const clubTarget = player.hometownClubSymbol || player.startingClubSymbol;
            setPlayer({
             ...player,
             transferRequestStatus: "PENDING",
             stateFlags: {
              ...player.stateFlags,
              openThreads: {
               ...(player.stateFlags?.openThreads || {}),
               homecomingTour: clubTarget
              }
             },
             timeline: [
              ...(player.timeline || []),
              {
               id: `homecoming_requested_${Date.now()}`,
               week: state.currentWeek,
               day: state.currentDay,
               type: 'MILESTONE',
               title: `🏠 The Final Chapter Initiated`,
               description: `Formally requested to finish your career back at ${clubTarget}.`,
               clubSymbol: player.currentClubSymbol
              }
             ]
            });
            setRetirementStep('MENU');
            setActiveTab('ATTRIBUTES');
           }}
           className="px-6 py-2 bg-[#00FF88] text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#00FF88] transition-colors"
          >
           Request Homecoming Transfer 🤝
          </button>
         </div>
         </div>
        )}
       {retirementStep === 'GRACEFUL' && (
        <div className="space-y-4">
         <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1c1c1c] flex items-center justify-center text-xl shrink-0">🤝</div>
          <p className="text-[#ccc] text-xs font-serif italic leading-relaxed">
           "It takes courage to walk away at the top, Boss. You announce your decision gracefully, and a massive farewell choreography card is being prepped in the East Stand. Are you absolutely ready to retire?"
          </p>
         </div>

         <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
          <button
           onClick={() => setRetirementStep('MENU')}
           className="px-4 py-2 text-xs font-mono font-bold uppercase text-white/50 hover:text-white transition-colors"
          >
           Back
          </button>
          <button
           onClick={() => {
            setPlayer({
             ...player,
             stateFlags: {
              ...(player.stateFlags || {}),
              retired: true
             }
            });
            setIsRetired(true);
           }}
           className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors animate-pulse"
          >
           Hang Up the Boots Instantly 🔴
          </button>
         </div>
        </div>
       )}
      </div>
     ) : (
      <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-sm">
       <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">⚠ WARNING: HANG UP THE BOOTS</h4>
       <p className="text-white/50 text-xs leading-relaxed mb-6 font-sans">
        Declaring retirement is immediate, final, and cannot be undone. Your current career attributes and stats will be locked, and your final legacy score will be inscribed into the Hall of Fame. 
        <br />
        <span className="text-amber-400 font-mono text-[10px] uppercase font-bold mt-2 block">
         💡 Reach age 33 (current: {player.age}) to unlock advanced interactive coaching badges and records pursuits!
        </span>
       </p>
       <button
        onClick={() => {
         setPlayer({
          ...player,
          stateFlags: {
           ...(player.stateFlags || {}),
           retired: true
          }
         });
         setIsRetired(true);
        }}
        className="px-6 py-3 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-mono font-black uppercase tracking-widest"
       >
        Declare Immediate Retirement
       </button>
      </div>
     )}
    </div>
   )}
   </div>
  )}

  {activeTab === 'MEDICAL' && (
   <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar premium-card p-6 rounded-xl animate-fade-in">
    <div className="border-b border-white/10 pb-4">
     <h3 className="text-white text-base font-bold tracking-wider uppercase flex items-center gap-2">
      🏥 Medical History & Injury Logs
     </h3>
     <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">
      Official medical clearance reports, clinical diagnostics, and physical availability impacts
     </p>
    </div>

    {/* Physical Vitals Overview */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
     <div className="bg-[#101010] p-4 border border-white/5 rounded-sm">
      <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest font-mono">Current Status</div>
      <div className={`text-sm font-black mt-1 uppercase font-display ${player.isInjured ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
       {player.isInjured ? '🔴 RESTRICTED REHAB' : '🟢 CLEARED'}
      </div>
      <div className="text-[10px] text-white/50 mt-1">
       {player.isInjured ? 'Unfit for competitive play.' : 'Fully fit for standard selection.'}
      </div>
     </div>

     <div className="bg-[#101010] p-4 border border-white/5 rounded-sm">
      <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest font-mono">Injury Risk Coefficient</div>
      <div className="text-white text-lg font-bold font-mono mt-1">
       {Math.max(5, 100 - Math.floor((player.attributes.stamina * 0.5) + (player.attributes.strength * 0.3) + (100 - (player.fatigue || 0)) * 0.2))}%
      </div>
      <div className="text-[10px] text-white/50 mt-1">Based on Stamina, Strength & Fatigue.</div>
     </div>

     <div className="bg-[#101010] p-4 border border-white/5 rounded-sm">
      <div className="text-white/40 text-[9px] font-bold uppercase tracking-widest font-mono">Physiological Fatigue</div>
      <div className="text-white text-lg font-bold font-mono mt-1">{player.fatigue} / 100</div>
      <div className="w-full bg-white/10 h-1.5 mt-2 rounded-sm overflow-hidden">
       <div className={`h-full ${player.fatigue > 70 ? 'bg-red-500' : 'bg-emerald-400'}`} style={{ width: `${player.fatigue}%` }}></div>
      </div>
     </div>
    </div>

    {/* Medical Logs Table */}
    <div className="space-y-4">
     <h4 className="text-white text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">Diagnostic Timeline Logs</h4>
     
     <div className="space-y-4">
      {parsedInjuries.map((inj, idx) => (
       <div key={idx} className="bg-[#0c0c0c] border border-white/5 p-5 rounded-sm hover:border-red-500/20 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 border-b border-white/5 pb-3">
         <div className="flex items-center gap-2.5">
          <span className="text-2xl">{inj.icon}</span>
          <div>
           <h5 className="text-white text-sm font-bold uppercase tracking-wide">{inj.name}</h5>
           <span className="text-[10px] font-mono text-red-400 uppercase font-bold">{inj.severity}</span>
          </div>
         </div>
         <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
          <div>DATE: <span className="text-white/80">{inj.week}</span></div>
          <div>RECOVERY: <span className="text-white/80">{inj.duration}</span></div>
         </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono mb-2">
         <div>
          <span className="text-white/30 uppercase tracking-wider block mb-0.5">Club Performance Impact:</span>
          <span className="text-[#ccc]">{inj.clubImpact}</span>
         </div>
         <div>
          <span className="text-white/30 uppercase tracking-wider block mb-0.5">International Availability Impact:</span>
          <span className="text-[#ccc]">{inj.intlImpact}</span>
         </div>
        </div>

        <div className="mt-3 bg-[#111] p-3 border-l-2 border-red-500/30">
         <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest block mb-1">Physiotherapy Clinical Notes:</span>
         <p className="text-white/70 text-[10.5px] italic leading-relaxed">"{inj.notes}"</p>
        </div>
       </div>
      ))}
     </div>
    </div>
   </div>
  )}
  </div>
 </div>
 );
}

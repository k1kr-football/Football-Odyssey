import React, { useState, useMemo } from 'react';
import { useGame } from '../store/GameContext';
import { ChevronDown, ChevronRight, Info, Flame, Snowflake } from 'lucide-react';
import { CLUBS, RIVALRIES } from '../data/teams';
import { getClubStandings } from '../utils/seasonObjectives';
import { TeamLogo } from '../components/TeamLogo';

export function Schedule() {
 const { state, setScreen } = useGame();
 
 if (!state.player) return null;

 const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({ 1: true, 2: true });
 const [activeTab, setActiveTab] = useState<'TABLE' | 'SQUAD'>('TABLE');

 const toggleMonth = (m: number) => {
 setExpandedMonths(prev => ({ ...prev, [m]: !prev[m] }));
 };

 const getWeekData = (w: number) => {
  const entriesThisWeek = state.seasonCalendar?.filter(e => e.week === w) || [];
  const matchesThisWeek = entriesThisWeek.filter(e => e.type === 'MATCH' && e.match);

  if (matchesThisWeek.length > 0) {
   return matchesThisWeek.map(m => {
    let pressure = 5;
    let matchType = 'REGULAR';
    let rivalryName = '';
    
    if (m.match!.round === 'Final') { pressure = 10; matchType = 'FINAL'; }
    else if (m.match!.round === 'Semi-Final' || (m.match!.competitionType === 'EUROPEAN' && m.match!.round?.includes('Quarter'))) pressure = 8;
    else if (m.match!.competitionType === 'DOMESTIC_CUP' || m.match!.competitionType === 'EUROPEAN') pressure = 7;
    else if (w <= 4) { pressure = 1; matchType = 'FRIENDLY'; }
    
    const currentClub = state.player?.currentClubSymbol;
    if (currentClub) {
    // RIVALRIES imported globally
    const clubRivals = RIVALRIES[currentClub];
    if (clubRivals) {
     const rival = clubRivals.find((r: any) => r.opponent === m.match!.opponentSymbol);
     if (rival) {
      matchType = 'DERBY';
      pressure = Math.max(pressure, 9);
      rivalryName = rival.name;
     }
    }
    const previousClubs = state.player?.timeline?.filter(t => t.type === 'TRANSFER').map(t => t.clubSymbol) || [];
    if (matchType !== 'DERBY' && previousClubs.includes(m.match!.opponentSymbol)) {
     matchType = 'GRUDGE';
     pressure = Math.max(pressure, 8);
    }
    }

    return {
     w, 
     day: m.day,
     type: m.match!.competitionType, 
     compName: m.match!.competition,
     opp: m.match!.opponentSymbol, 
     loc: m.match!.isHome ? 'HOME' : 'AWAY', 
     pressure,
     matchType,
     rivalryName,
     isCurrent: w === state.currentWeek && m.day === state.currentDay, 
     isPast: w < state.currentWeek || (w === state.currentWeek && ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].indexOf(m.day) < ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].indexOf(state.currentDay))
    };
   });
  }

  const hasIntlBreak = (entriesThisWeek || []).some(e => e.type === 'INTERNATIONAL_BREAK');
  if (hasIntlBreak) {
   return [{ w, day: 'SAT', type: 'INTL', compName: 'International', opp: '-', loc: '-', isCurrent: w === state.currentWeek, isPast: w < state.currentWeek }];
  }

  return [{ w, day: 'SAT', type: 'TRAINING', compName: '-', opp: '-', loc: '-', isCurrent: w === state.currentWeek, isPast: w < state.currentWeek }];
 };

 const months = [
 { id: 1, name: 'July', start: 1, end: 4 },
 { id: 2, name: 'August', start: 5, end: 8 },
 { id: 3, name: 'September', start: 9, end: 12 },
 { id: 4, name: 'October', start: 13, end: 17 },
 { id: 5, name: 'November', start: 18, end: 21 },
 { id: 6, name: 'December', start: 22, end: 26 },
 { id: 7, name: 'January', start: 27, end: 30 },
 { id: 8, name: 'February', start: 31, end: 34 },
 { id: 9, name: 'March', start: 35, end: 39 },
 { id: 10, name: 'April', start: 40, end: 43 },
 { id: 11, name: 'May', start: 44, end: 48 },
 { id: 12, name: 'June', start: 49, end: 52 },
 ];

 const playerClubRef = CLUBS.find(c => c.symbol === state.player?.currentClubSymbol) || CLUBS[0];
 const leagueName = playerClubRef.league;
 const leagueClubs = CLUBS.filter(c => c.league === leagueName);

 // Determine league rules
 const getLeagueRules = (league: string) => {
 let rules = {
  maxGames: 38,
  tiebreaker: 'Goal Difference',
  zones: [] as { start: number, end: number, label: string, color: string }[]
 };

 if (league.includes('Premier League')) {
  rules.maxGames = 38;
  rules.tiebreaker = 'Goal Difference';
  rules.zones = [
   { start: 1, end: 4, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
   { start: 5, end: 5, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
   { start: 6, end: 6, label: 'Conf League / Cup Cascade', color: 'bg-green-500/20 border-l-2 border-green-500' },
   { start: 18, end: 20, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
  ];
 } else if (league.includes('EFL Championship') || league.includes('League One')) {
  rules.maxGames = 46;
  rules.tiebreaker = 'Goal Difference';
  rules.zones = [
   { start: 1, end: 2, label: 'Automatic Promotion', color: 'bg-emerald-500/20 border-l-2 border-emerald-500' },
   { start: 3, end: 6, label: 'Play-offs', color: 'bg-yellow-500/20 border-l-2 border-yellow-500' },
   { start: 22, end: 24, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
  ];
 } else if (league.includes('League Two')) {
  rules.maxGames = 46;
  rules.tiebreaker = 'Goal Difference';
  rules.zones = [
   { start: 1, end: 3, label: 'Automatic Promotion', color: 'bg-emerald-500/20 border-l-2 border-emerald-500' },
   { start: 4, end: 7, label: 'Play-offs', color: 'bg-yellow-500/20 border-l-2 border-yellow-500' },
   { start: 23, end: 24, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
  ];
 } else if (league.includes('La Liga')) {
  rules.maxGames = 38;
  rules.tiebreaker = 'Head-to-Head';
  rules.zones = [
   { start: 1, end: 4, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
   { start: 5, end: 5, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
   { start: 6, end: 6, label: 'Conf League / Coefficient Spot', color: 'bg-green-500/20 border-l-2 border-green-500' },
   { start: 18, end: 20, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
  ];
 } else if (league.includes('Serie A')) {
  rules.maxGames = 38;
  rules.tiebreaker = 'Head-to-Head -> Rare Playoff if tied for 1st/18th';
  rules.zones = [
   { start: 1, end: 4, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
   { start: 5, end: 6, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
   { start: 7, end: 7, label: 'Conf League / Cup Cascade', color: 'bg-green-500/20 border-l-2 border-green-500' },
   { start: 18, end: 20, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
  ];
 } else if (league.includes('Bundesliga')) {
  rules.maxGames = 34;
  rules.tiebreaker = 'Goal Difference';
  rules.zones = [
   { start: 1, end: 4, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
   { start: 5, end: 6, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
   { start: 7, end: 7, label: 'Conf League / Cup Cascade', color: 'bg-green-500/20 border-l-2 border-green-500' },
   { start: 16, end: 16, label: 'Relegation Play-off', color: 'bg-amber-600/20 border-l-2 border-amber-600' },
   { start: 17, end: 18, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
  ];
 } else if (league.includes('Ligue 1')) {
  rules.maxGames = 34;
  rules.tiebreaker = 'Goal Difference';
  rules.zones = [
   { start: 1, end: 3, label: 'Champions League', color: 'bg-blue-500/20 border-l-2 border-blue-500' },
   { start: 4, end: 4, label: 'Europa League', color: 'bg-orange-500/20 border-l-2 border-orange-500' },
   { start: 5, end: 5, label: 'Conf League / Coefficient Spot', color: 'bg-green-500/20 border-l-2 border-green-500' },
   { start: 16, end: 16, label: 'Relegation Play-off', color: 'bg-amber-600/20 border-l-2 border-amber-600' },
   { start: 17, end: 18, label: 'Relegation', color: 'bg-red-500/10 border-l-2 border-red-500' }
  ];
 }

 return rules;
 };

 const rules = getLeagueRules(leagueName);

 // Mock table deterministic generation based on current matches played
 // We want games played to scale up to rules.maxGames across the season (approx 40 weeks of play)
 const seasonProgress = Math.max(0, state.currentWeek - 4) / 39;
 const gamesPlayed = Math.min(rules.maxGames, Math.floor(seasonProgress * rules.maxGames));

 const table = useMemo(() => {
   return getClubStandings(leagueName, state.currentWeek, state.player?.currentClubSymbol || '', state.player?.seasonObjective?.pointsOffset || 0, state.worldState);
 }, [leagueName, state.currentWeek, state.player?.currentClubSymbol, state.player?.seasonObjective?.pointsOffset, state.worldState]);

 const getRowClass = (pos: number) => {
  const zone = rules.zones.find(z => pos >= z.start && pos <= z.end);
  return zone ? zone.color : 'border-l-2 border-transparent';
 };

 return (
 <div className="flex h-full gap-6">
  <div className="flex-1 flex flex-col gap-4">
  <h2 className="text-[#00FF88] text-xs font-bold tracking-widest uppercase">Season Calendar</h2>
  <div className="premium-card p-6 flex-1 overflow-y-auto hide-scrollbar rounded-md">
   
   <div className="space-y-4">
   {months.map((month) => (
    <div key={month.id} className=" rounded overflow-hidden">
     <button 
     onClick={() => toggleMonth(month.id)}
     className={`w-full flex items-center justify-between p-4 bg-[#181818] hover:glass-panel transition-colors border-b border-white/10 ${state.currentWeek >= month.start && state.currentWeek <= month.end ? 'border-l-4 border-[#00FF88]' : ''}`}
     >
     <div className="flex items-center gap-4">
      {expandedMonths[month.id] ? <ChevronDown size={14} className="text-white/50" /> : <ChevronRight size={14} className="text-white/50" />}
      <span className="text-white font-bold uppercase tracking-widest text-sm">{month.name}</span>
     </div>
     {state.currentWeek >= month.start && state.currentWeek <= month.end && (
      <span className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest bg-[#00FF88]/10 px-2 py-0.5 rounded">Current Month</span>
     )}
     </button>
     
     {expandedMonths[month.id] && (
     <div className="premium-card divide-y divide-[#1a1a1a]">
      {Array.from({length: month.end - month.start + 1}, (_, i) => {
       const w = month.start + i;
       const weekEvents = getWeekData(w);
       return (
       <React.Fragment key={w}>
        {weekEvents.map((data, idx) => {
         const isDerby = data.matchType === 'DERBY';
         const isGrudge = data.matchType === 'GRUDGE';
         return (
         <div 
         key={`${w}-${idx}`} 
         onClick={() => {
           if (data.isCurrent && data.opp !== '-') {
             setScreen('MATCH');
           }
         }}
         className={`flex items-center p-3 text-xs transition-colors relative overflow-hidden
          ${data.isCurrent && data.opp !== '-' ? 'cursor-pointer hover:border-[#00FF88]' : ''}
          ${data.isCurrent ? 'glass-panel border-l-2 border-l-[#00FF88] -ml-[2px]' : (data.isPast ? 'opacity-40' : '')}
          ${isDerby ? 'bg-red-950/10 border-l-2 border-l-red-500 border-y border-y-red-950/40' : ''}
          ${isGrudge ? 'bg-orange-950/10 border-l-2 border-l-orange-500 border-y border-y-orange-950/40' : ''}
         `}>
          {isDerby && (
           <div className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none w-24 flex items-center justify-end pr-2">
            <span className="text-[7px] text-red-500/60 font-bold tracking-widest uppercase">DERBY</span>
           </div>
          )}
          {isGrudge && (
           <div className="absolute top-0 right-0 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none w-24 flex items-center justify-end pr-2">
            <span className="text-[7px] text-orange-500/60 font-bold tracking-widest uppercase font-mono">GRUDGE</span>
           </div>
          )}
         <div className="w-16 font-bold text-white/50 tracking-widest uppercase text-[10px]">{idx === 0 ? `Wk ${data.w}` : ''}</div>
         <div className="w-12 text-white/40 font-bold text-[9px] uppercase">{data.day}</div>
         <div className={`w-36 flex items-center gap-1 font-bold uppercase tracking-widest text-[9px] ${data.isEvent ? 'text-emerald-400' : (data.type === 'LEAGUE' ? 'text-white' : (data.type === 'INTERNATIONAL' ? 'text-teal-400' : (data.type.includes('CUP') || data.type === 'EUROPEAN' ? 'text-orange-400' : 'text-white/40')))}`} title={data.compName}>
          <span>{data.type}</span>
          {data.pressure && data.pressure >= 8 && <Flame className="w-3 h-3 text-red-500" />}
          {data.pressure && data.pressure <= 3 && <Snowflake className="w-3 h-3 text-blue-400" />}
          {data.pressure && <span className="text-[9px] font-mono font-bold text-white/40 ml-1">({data.pressure}/10)</span>}
         </div>
         <div className="flex-1 flex items-center gap-2 font-mono uppercase text-white truncate max-w-[140px] px-2">
          {(() => {
          const oppClub = CLUBS.find(c => c.symbol === data.opp);
          if (oppClub) {
           return (
           <>
            <TeamLogo
            symbol={oppClub.symbol}
            name={oppClub.name}
            primaryColor={oppClub.primaryColor}
            secondaryColor={oppClub.secondaryColor}
            size={16}
            className="flex-shrink-0"
            />
            <span className="truncate text-[11px] font-semibold">{oppClub.name}</span>
            {data.matchType === 'DERBY' && (
             <span className="ml-2 px-1.5 py-0.5 bg-red-900/50 text-red-500 text-[8px] font-bold tracking-widest uppercase border border-red-900 rounded">Derby</span>
            )}
            {data.matchType === 'GRUDGE' && (
             <span className="ml-2 px-1.5 py-0.5 bg-orange-900/50 text-orange-500 text-[8px] font-bold tracking-widest uppercase border border-orange-900 rounded">Grudge</span>
            )}
           </>
           );
          }
          return <span className="text-white/40 text-xs">{data.opp}</span>;
          })()}
         </div>
         <div className="w-12 text-white/40 font-bold text-[9px] uppercase">{data.loc}</div>
        </div>
        );
       })}
       </React.Fragment>
       );
      })}
     </div>
     )}
    </div>
   ))}
   </div>

  </div>
  </div>
  
  <div className="flex-1 flex flex-col gap-4 overflow-hidden">
  <div className="flex justify-between items-center premium-card p-2 rounded-md">
   <h2 className="text-white text-xs font-bold tracking-widest uppercase ml-2">
   {activeTab === 'TABLE' ? `League Table · ${leagueName}` : 'Match Squad Sheet 📋'}
   </h2>
   <div className="flex gap-1.5 glass-panel p-1 rounded text-[10px] font-mono">
   <button
    onClick={() => setActiveTab('TABLE')}
    className={`px-3 py-1 rounded transition-colors uppercase font-bold tracking-wider ${activeTab === 'TABLE' ? 'bg-[#00FF88] text-black' : 'text-white/50 hover:text-white'}`}
   >
    Standings
   </button>
   <button
    onClick={() => setActiveTab('SQUAD')}
    className={`px-3 py-1 rounded transition-colors uppercase font-bold tracking-wider relative flex items-center gap-1.5 ${activeTab === 'SQUAD' ? 'bg-[#00FF88] text-black' : 'text-white/50 hover:text-white'}`}
   >
    Squad Release
    {state.nextMatch?.squadList && (
    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse shrink-0"></span>
    )}
   </button>
   </div>
  </div>

  <div className="premium-card p-4 flex flex-col flex-1 rounded-md overflow-hidden relative">
   {activeTab === 'TABLE' ? (
   <>
    <div className="mb-4 glass-panel rounded px-3 py-2 text-[10px] text-[#aaa] font-mono flex flex-col gap-1">
    <div className="flex gap-2 items-center text-[#fff] font-bold mb-1"><Info size={12}/> LEAGUE RULES</div>
    <div>Tiebreaker: <span className="text-[#00FF88]">{rules.tiebreaker}</span></div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
     {rules.zones.map((z, idx) => (
      <span key={idx} className="flex items-center gap-1">
       <span className={`w-2 h-2 ${z.color.split(' ')[0]}`}></span> {z.label} ({z.start}-{z.end})
      </span>
     ))}
    </div>
    {(rules.zones || []).some(z => z.label.includes('Cascade') || z.label.includes('Coefficient')) && (
     <div className="mt-1 text-white/40">Note: European spots may shift based on domestic cup winners or UEFA performance coefficients.</div>
    )}
    </div>

    <div className="overflow-y-auto hide-scrollbar flex-1 pr-1 rounded bg-[#0a0a0a]">
    <table className="w-full text-left border-collapse">
     <thead className="sticky top-0 bg-[#0a0a0a] z-10 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
     <tr className="text-white/40 border-b border-white/10 text-[9px] uppercase tracking-widest font-bold">
      <th className="py-2 px-2 w-10 text-center">Pos</th>
      <th className="py-2 px-2">Club</th>
      <th className="py-2 px-2 text-center w-8">P</th>
      <th className="py-2 px-2 text-center w-10">GD</th>
      <th className="py-2 px-2 text-right w-10">Pts</th>
     </tr>
     </thead>
     <tbody>
     {table.map((r, i) => {
      const zoneClass = getRowClass(r.pos);
      return (
      <tr key={i} className={`border-b border-white/10 last:border-0 hover:glass-panel transition-colors
      ${r.isPlayer ? 'glass-panel' : ''}
      `}>
      <td className={`py-2 text-center text-xs font-bold text-white/50 ${zoneClass}`}>{r.pos}</td>
      <td className={`py-2 px-2 text-xs font-bold tracking-tight truncate max-w-[120px] ${r.isPlayer ? 'text-[#00FF88]' : 'text-white'} flex items-center gap-2`}>
       <TeamLogo
       symbol={r.symbol}
       name={r.name}
       primaryColor={r.primaryColor}
       secondaryColor={r.secondaryColor}
       size={18}
       className="flex-shrink-0"
       />
       <span className="truncate">{r.name}</span>
      </td>
      <td className="py-2 px-2 text-center text-white/40 text-xs tabular-nums">{r.p}</td>
      <td className="py-2 px-2 text-center text-white/40 text-xs font-mono tabular-nums">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
      <td className={`py-2 px-2 text-right text-xs font-bold tabular-nums ${r.isPlayer ? 'text-[#00FF88]' : 'text-white'}`}>{r.pts}</td>
      </tr>
     )})}
     </tbody>
    </table>
    </div>
   </>
   ) : (
   <div className="flex-1 flex flex-col overflow-hidden">
    {state.nextMatch?.squadList ? (
    <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar">
     {/* Match Info Header */}
     <div className="bg-[#181818] border border-[#252525] p-4 rounded-md mb-4 flex justify-between items-center">
     <div className="flex items-center gap-3">
      {(() => {
      const oppClub = CLUBS.find(c => c.symbol === state.nextMatch?.opponentSymbol);
      return oppClub ? (
       <>
       <TeamLogo
        symbol={oppClub.symbol}
        name={oppClub.name}
        primaryColor={oppClub.primaryColor}
        secondaryColor={oppClub.secondaryColor}
        size={32}
       />
       <div>
        <div className="text-[10px] text-white/50 font-mono tracking-wider uppercase font-bold">UPCOMING FIXTURE</div>
        <div className="text-white font-bold tracking-tight text-sm">vs {oppClub.name}</div>
       </div>
       </>
      ) : (
       <div className="text-white font-bold">vs {state.nextMatch?.opponentSymbol}</div>
      );
      })()}
     </div>
     <div className="text-right">
      <div className="text-[9px] text-white/50 font-mono uppercase font-bold tracking-widest">{state.nextMatch?.venue} &middot; KICKOFF</div>
      <div className="text-[#00FF88] font-bold text-xs font-mono">{state.nextMatch?.kickoffTime || '15:00 BST'}</div>
     </div>
     </div>

     {/* Player Status Banner */}
     {(() => {
     const status = state.nextMatch?.playerStatus || 'STARTER';
     const userFullName = state.player ? `${state.player.firstName} ${state.player.lastName}` : "You";
     
     if (status === 'STARTER') {
      return (
      <div className="mb-4 bg-emerald-950/40 border border-emerald-900/60 rounded px-4 py-3 text-emerald-300 font-sans flex items-center justify-between">
       <div className="flex items-center gap-3">
       <span className="relative flex h-3 w-3 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
       </span>
       <div>
        <div className="text-white font-extrabold text-[11px] tracking-wide uppercase">SELECTED: STARTING XI</div>
        <div className="text-[10px] opacity-90 mt-0.5">Manager Clement has named you in the starting team. Focus on tactical drills.</div>
       </div>
       </div>
       <span className="text-[10px] font-mono font-bold tracking-widest bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded">MATCH STARTER</span>
      </div>
      );
     } else if (status === 'SUBSTITUTE') {
      return (
      <div className="mb-4 bg-amber-950/40 border border-amber-900/60 rounded px-4 py-3 text-amber-300 font-sans flex items-center justify-between">
       <div className="flex items-center gap-3">
       <span className="relative flex h-3 w-3 shrink-0">
        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
       </span>
       <div>
        <div className="text-white font-extrabold text-[11px] tracking-wide uppercase">SELECTED: BENCH / SUBSTITUTE</div>
        <div className="text-[10px] opacity-90 mt-0.5">You will begin on the bench. Stay warm and watch the tactical flow to make an impact.</div>
       </div>
       </div>
       <span className="text-[10px] font-mono font-bold tracking-widest bg-amber-900/50 text-amber-400 border border-amber-800 px-2.5 py-1 rounded">BENCH OPTION</span>
      </div>
      );
     } else {
      return (
      <div className="mb-4 bg-red-950/30 border border-red-900/50 rounded px-4 py-3 text-red-300 font-sans flex items-center justify-between">
       <div className="flex items-center gap-3">
       <span className="w-3 h-3 bg-red-500 rounded-full shrink-0"></span>
       <div>
        <div className="text-white font-extrabold text-[11px] tracking-wide uppercase">NOT SELECTED IN SQUAD</div>
        <div className="text-[10px] opacity-90 mt-0.5">Left out of the 18-man sheet. Report to the Training Center for independent fitness work.</div>
       </div>
       </div>
       <span className="text-[10px] font-mono font-bold tracking-widest bg-red-900/50 text-red-400 border border-red-800 px-2.5 py-1 rounded">UNUSED / OUT</span>
      </div>
      );
     }
     })()}

     {/* Squad Lists Grid */}
     <div className="grid grid-cols-3 gap-3 flex-1">
     {/* Starting XI Column */}
     <div className="bg-[#151515] p-3 rounded flex flex-col">
      <div className="text-white font-bold text-[10px] uppercase tracking-widest border-b border-white/10 pb-1.5 mb-2 flex justify-between items-center">
      <span>Starting XI</span>
      <span className="text-[#00FF88] font-mono text-[9px]">11 Players</span>
      </div>
      <div className="space-y-1.5 overflow-y-auto hide-scrollbar flex-1">
      {state.nextMatch?.squadList?.startingXI?.map((player: string, idx: number) => {
       const isUser = state.player && player.toLowerCase().includes(state.player.lastName.toLowerCase());
       return (
       <div
        key={idx}
        className={`p-2 rounded text-[11px] tracking-wide flex items-center gap-2 border ${
        isUser
         ? "bg-[#00FF88]/10 border-[#00FF88]/40 text-[#00FF88] font-extrabold"
         : "bg-[#181818] border-[#252525] text-white/90"
        }`}
       >
        <span className="text-[9px] font-mono text-white/40">{idx + 1}</span>
        <span className="truncate">{player}</span>
       </div>
       );
      })}
      </div>
     </div>

     {/* Substitutes Column */}
     <div className="bg-[#151515] p-3 rounded flex flex-col">
      <div className="text-white font-bold text-[10px] uppercase tracking-widest border-b border-white/10 pb-1.5 mb-2 flex justify-between items-center">
      <span>Substitutes</span>
      <span className="text-amber-400 font-mono text-[9px]">7 Players</span>
      </div>
      <div className="space-y-1.5 overflow-y-auto hide-scrollbar flex-1">
      {state.nextMatch?.squadList?.substitutes?.map((player: string, idx: number) => {
       const isUser = state.player && player.toLowerCase().includes(state.player.lastName.toLowerCase());
       return (
       <div
        key={idx}
        className={`p-2 rounded text-[11px] tracking-wide flex items-center gap-2 border ${
        isUser
         ? "bg-amber-400/10 border-amber-400/40 text-amber-400 font-extrabold"
         : "bg-[#181818] border-[#252525] text-white/90"
        }`}
       >
        <span className="text-[9px] font-mono text-white/40">SUB</span>
        <span className="truncate">{player}</span>
       </div>
       );
      })}
      </div>
     </div>

     {/* Unused Substitutes Column */}
     <div className="bg-[#151515] p-3 rounded flex flex-col">
      <div className="text-white font-bold text-[10px] uppercase tracking-widest border-b border-white/10 pb-1.5 mb-2 flex justify-between items-center">
      <span>Unselected / Out</span>
      <span className="text-red-400 font-mono text-[9px]">Reserves</span>
      </div>
      <div className="space-y-1.5 overflow-y-auto hide-scrollbar flex-1">
      {state.nextMatch?.squadList?.unused?.map((player: string, idx: number) => {
       const isUser = state.player && player.toLowerCase().includes(state.player.lastName.toLowerCase());
       return (
       <div
        key={idx}
        className={`p-2 rounded text-[11px] tracking-wide flex items-center gap-2 border ${
        isUser
         ? "bg-red-400/10 border-red-400/40 text-red-400 font-extrabold animate-pulse"
         : "bg-[#181818] border-[#252525] text-white/40"
        }`}
       >
        <span className="text-[9px] font-mono text-white/20">OUT</span>
        <span className="truncate">{player}</span>
       </div>
       );
      })}
      </div>
     </div>
     </div>
    </div>
    ) : (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0a0a0a] rounded-md">
     <div className="w-12 h-12 rounded-full bg-[#00FF88]/10 flex items-center justify-center mb-4 text-[#00FF88] border border-[#00FF88]/20">
     <Info size={24} />
     </div>
     <div className="text-white font-bold tracking-wide text-sm uppercase mb-1">Squad List Unreleased</div>
     <div className="text-white/40 text-xs max-w-[280px]">
     The manager releases the official squad announcement exactly 1 day before each matchday. Increase training intensity to guarantee selection!
     </div>
    </div>
    )}
   </div>
   )}
  </div>
  </div>
 </div>
 );
}


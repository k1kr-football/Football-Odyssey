import re

with open('src/screens/Schedule.tsx', 'r') as f:
    content = f.read()

get_week_pattern = r"(const getWeekData = \(w: number\) => \{)([\s\S]*?)(const isMatchWeek = getWeekData)"

new_get_week = r"""\1
     const entriesThisWeek = state.seasonCalendar?.filter(e => e.week === w) || [];
     const matchAndEvents = entriesThisWeek.filter(e => (e.type === 'MATCH' && e.match) || (e.type === 'EVENT' && e.specialEvent));

     if (matchAndEvents.length > 0) {
         return matchAndEvents.map(m => {
             if (m.type === 'EVENT') {
                 return {
                     w,
                     day: m.day,
                     type: 'SPECIAL_EVENT',
                     compName: m.specialEvent!.type.replace('_', ' '),
                     opp: m.specialEvent!.description,
                     loc: 'CLUB',
                     isPast: state.currentWeek > w,
                     isCurrent: state.currentWeek === w,
                     pressure: 0,
                     matchType: 'EVENT',
                     isEvent: true
                 };
             }

             let pressure = 5;
             let matchType = 'REGULAR';
             let rivalryName = '';
             
             if (m.match!.round === 'Final') { pressure = 10; matchType = 'FINAL'; }
             else if (m.match!.round === 'Semi-Final' || (m.match!.competitionType === 'EUROPEAN' && m.match!.round?.includes('Quarter'))) pressure = 8;
             else if (m.match!.competitionType === 'DOMESTIC_CUP' || m.match!.competitionType === 'EUROPEAN') pressure = 7;
             else if (w <= 4) { pressure = 1; matchType = 'FRIENDLY'; }
             
             const currentClub = state.player?.currentClubSymbol;
             if (currentClub) {
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
                 isPast: state.currentWeek > w,
                 isCurrent: state.currentWeek === w,
                 pressure,
                 matchType,
                 isEvent: false
             };
         });
     }
     return [{ w, day: '-', type: 'REST', compName: 'Rest Week', opp: 'No Fixtures', loc: '-', isPast: state.currentWeek > w, isCurrent: state.currentWeek === w, pressure: 0, matchType: 'REST', isEvent: false }];
  };

  \3"""

content = re.sub(get_week_pattern, new_get_week, content, flags=re.MULTILINE)

# Also let's fix the rendering for event
render_pattern = r"""(<div className=\{`w-36 flex items-center gap-1 font-bold uppercase tracking-widest text-\[9px\] \$\{data\.type === 'LEAGUE' \? 'text-white' : \(data\.type\.includes\('CUP'\) \|\| data\.type === 'EUROPEAN' \? 'text-orange-400' : 'text-\[\#666\]'\)\}`\} title=\{data\.compName\}>)"""

new_render_pattern = r"""<div className={`w-36 flex items-center gap-1 font-bold uppercase tracking-widest text-[9px] ${data.isEvent ? 'text-emerald-400' : (data.type === 'LEAGUE' ? 'text-white' : (data.type.includes('CUP') || data.type === 'EUROPEAN' ? 'text-orange-400' : 'text-[#666]'))}`} title={data.compName}>"""

content = re.sub(render_pattern, new_render_pattern, content)

with open('src/screens/Schedule.tsx', 'w') as f:
    f.write(content)


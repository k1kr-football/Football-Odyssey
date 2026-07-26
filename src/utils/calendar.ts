import { Club, CalendarEntry, DayOfWeek, CalendarMatch } from '../types';
import { CLUBS } from '../data/teams';

// Generates the season calendar
export function generateSeasonCalendar(club: Club): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  
  // A season runs roughly from July (Week 1) to May (Week 48). We have 52 weeks in a year.
  // We'll map matches into available slots.
  
  // Determine matches count based on league
  const numLeagueMatches = club.league === 'Bundesliga' ? 34 : 
                           ['Championship', 'League One', 'League Two'].includes(club.league) ? 46 : 38;

  // Generate opponents (just pick from CLUBS in same league, fallback to random if not enough)
  let opponents = CLUBS.filter(c => c.league === club.league && c.symbol !== club.symbol);
  
  // Fill up if not enough clubs available in data
  while (opponents.length * 2 < numLeagueMatches) {
      opponents = [...opponents, ...opponents]; // Duplicate opponents to reach count
  }
  
  const leagueMatches: CalendarMatch[] = [];
  for (let i = 0; i < numLeagueMatches; i++) {
    const isHome = i % 2 === 0;
    leagueMatches.push({
      id: `L_${i}`,
      opponentSymbol: opponents[i % opponents.length].symbol,
      competition: club.league,
      competitionType: 'LEAGUE',
      isHome: isHome,
      status: 'SCHEDULED'
    });
  }

  // Shuffle league matches simply
  leagueMatches.sort(() => Math.random() - 0.5);

  // We'll track busy days to avoid conflicts
  const isBusy = (week: number, day: DayOfWeek) => {
    return (entries || []).some(e => e.week === week && e.day === day && e.type !== 'REST' && e.type !== 'TRAINING');
  };

  // 0. Preseason Friendlies (Weeks 1-4)
  const sortedClubs = [...CLUBS].sort((a, b) => a.ovr - b.ovr);
  const myOvr = club.ovr;
  const lowerClubs = sortedClubs.filter(c => c.ovr < myOvr - 5 && c.symbol !== club.symbol);
  const midClubs = sortedClubs.filter(c => Math.abs(c.ovr - myOvr) <= 5 && c.symbol !== club.symbol);
  const higherClubs = sortedClubs.filter(c => c.ovr > myOvr + 2 && c.symbol !== club.symbol);
  
  const getOpp = (pool: Club[], fallbackPool: Club[]) => {
      if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
      if (fallbackPool.length > 0) return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
      return CLUBS[Math.floor(Math.random() * CLUBS.length)];
  };

  const friendlies = [
      { week: 1, type: 'tune-up', opp: getOpp(lowerClubs, sortedClubs) },
      { week: 2, type: 'tune-up', opp: getOpp(lowerClubs, midClubs) },
      { week: 3, type: 'mid-tier', opp: getOpp(midClubs, sortedClubs) },
      { week: 4, type: 'high-profile', opp: getOpp(higherClubs, midClubs) }
  ];

  friendlies.forEach((f, idx) => {
      entries.push({
          week: f.week,
          day: 'SAT',
          type: 'MATCH',
          match: {
              id: `F_${f.week}`,
              opponentSymbol: f.opp.symbol,
              competition: 'Preseason Friendly',
              competitionType: 'FRIENDLY',
              isHome: idx % 2 === 0,
              round: f.type === 'high-profile' ? 'Showcase Match' : 'Warm-up',
              status: 'SCHEDULED'
          }
      });
  });

  // 1. International Breaks
  const internationalBreaks = [10, 11, 14, 15, 18, 19, 36, 37, 49, 50]; // Sep, Oct, Nov, Mar, Jun roughly
  
  // Insert international breaks
  for (let week = 1; week <= 52; week++) {
    if (internationalBreaks.includes(week)) {
      entries.push({ week, day: 'SAT', type: 'INTERNATIONAL_BREAK' });
      entries.push({ week, day: 'TUE', type: 'INTERNATIONAL_BREAK' });
    }
  }

  // 2. European Matches (Midweek TUE/WED)
  // Let's assume club is in Champions League if OVR >= 85, UEL if OVR >= 80, UECL if OVR >= 75
  let europeanComp = '';
  if (club.ovr >= 85) europeanComp = 'Champions League';
  else if (club.ovr >= 80) europeanComp = 'Europa League';
  else if (club.ovr >= 75) europeanComp = 'Conference League';

  if (europeanComp) {
    const euroWeeks = [12, 14, 16, 20, 22, 24]; // Group Stage weeks (example)
    euroWeeks.forEach((w, index) => {
        const euroOpponents = CLUBS.filter(c => c.country !== club.country);
        const opp = euroOpponents[index % euroOpponents.length];
        if (!opp) return;

        entries.push({
          week: w,
          day: 'WED',
          type: 'MATCH',
          match: {
            id: `E_${w}`,
            opponentSymbol: opp.symbol,
            competition: europeanComp,
            competitionType: 'EUROPEAN',
            isHome: index % 2 === 0,
            round: 'Group Stage',
            status: 'SCHEDULED'
          }
        });
    });
    
    // Knockouts
    const koWeeks = [32, 34, 38, 40, 44, 46];
    koWeeks.forEach((w, index) => {
        entries.push({
          week: w,
          day: 'WED',
          type: 'MATCH',
          match: {
            id: `EKO_${w}`,
            opponentSymbol: 'TBD', // To be updated if they progress
            competition: europeanComp,
            competitionType: 'EUROPEAN',
            isHome: index % 2 === 0,
            round: 'Knockouts',
            status: 'SCHEDULED'
          }
        });
    });
  }

  // 3. Domestic Cup
  const domesticCupName = club.country === 'England' ? 'FA Cup' : 
                          club.country === 'France' ? 'Coupe de France' : 
                          club.country === 'Germany' ? 'DFB-Pokal' : 
                          club.country === 'Spain' ? 'Copa del Rey' : 'Domestic Cup';
                          
  const cupWeeks = [27, 31, 35, 39, 43, 47]; // Random cup rounds (Jan to May)
  cupWeeks.forEach((w, index) => {
     entries.push({
          week: w,
          day: 'TUE', // Mostly midweek
          type: 'MATCH',
          match: {
            id: `C_${w}`,
            opponentSymbol: 'TBD',
            competition: domesticCupName,
            competitionType: 'DOMESTIC_CUP',
            isHome: index % 2 === 0,
            round: `Round ${index + 3}`,
            status: 'SCHEDULED'
          }
     });
  });

  // 4. League Matches Backfill
  // We need to place 38 matches into available SAT or SUN slots. If full, use midweek.
  let matchIdx = 0;
  for (let week = 5; week <= 48 && matchIdx < numLeagueMatches; week++) {
     if (internationalBreaks.includes(week)) continue;
     
     // Try weekend first
     if (!isBusy(week, 'SAT')) {
         entries.push({ week, day: 'SAT', type: 'MATCH', match: leagueMatches[matchIdx++] });
     } else if (!isBusy(week, 'SUN')) {
         entries.push({ week, day: 'SUN', type: 'MATCH', match: leagueMatches[matchIdx++] });
     }
  }
  
  // If we still have league matches, cram them into midweek
  for (let week = 5; week <= 48 && matchIdx < numLeagueMatches; week++) {
    if (internationalBreaks.includes(week)) continue;
    if (!isBusy(week, 'WED')) {
        entries.push({ week, day: 'WED', type: 'MATCH', match: leagueMatches[matchIdx++] });
    } else if (!isBusy(week, 'THU')) {
        entries.push({ week, day: 'THU', type: 'MATCH', match: leagueMatches[matchIdx++] });
    }
  }

  
  // 5. Special Events (Dynamic Calendar Events)
  const eventTypes: Array<'MEDIA_DAY' | 'FAN_EVENT' | 'CHARITY' | 'TEAM_BONDING' | 'TRAINING_CAMP' | 'AWARD_CEREMONY' | 'SPONSOR_SHOOT' | 'INTERNATIONAL' | 'INJURY_SCARE'> = [
    'MEDIA_DAY', 'FAN_EVENT', 'CHARITY', 'TEAM_BONDING', 'SPONSOR_SHOOT'
  ];
  
  // Add a special event every ~4 weeks
  for (let week = 3; week <= 50; week += Math.floor(Math.random() * 2) + 3) {
      if (internationalBreaks.includes(week)) continue;
      // Try to place on THU or MON
      const targetDay = Math.random() > 0.5 ? 'THU' : 'MON';
      if (!isBusy(week, targetDay)) {
         const eType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
         entries.push({
            week, 
            day: targetDay as DayOfWeek, 
            type: 'EVENT',
            specialEvent: {
               id: `evt_${week}_${Math.random()}`,
               type: eType,
               description: eType.replace('_', ' ') + ' scheduled',
               status: 'PENDING'
            }
         });
      }
  }

  return entries;

}

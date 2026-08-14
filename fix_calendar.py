with open('src/utils/calendar.ts', 'r') as f:
    content = f.read()

# Replace generateSeasonCalendar(club: Club) -> generateSeasonCalendar(club: Club, isYouth?: boolean)
content = content.replace(
    'export function generateSeasonCalendar(club: Club): CalendarEntry[] {', 
    'export function generateSeasonCalendar(club: Club, isYouth?: boolean): CalendarEntry[] {'
)

# League matches
content = content.replace(
    "opponentSymbol: opponents[i % opponents.length].symbol,\n      competition: club.league,\n      competitionType: 'LEAGUE',",
    "opponentSymbol: isYouth ? opponents[i % opponents.length].symbol + ' U18' : opponents[i % opponents.length].symbol,\n      competition: isYouth ? 'U18 Premier League' : club.league,\n      competitionType: isYouth ? 'YOUTH_LEAGUE' : 'LEAGUE',"
)

# Friendlies
content = content.replace(
    "opponentSymbol: f.opp.symbol,\n              competition: 'Preseason Friendly',\n              competitionType: 'FRIENDLY',",
    "opponentSymbol: isYouth ? f.opp.symbol + ' U18' : f.opp.symbol,\n              competition: isYouth ? 'U18 Friendly' : 'Preseason Friendly',\n              competitionType: isYouth ? 'U18 Friendly' : 'FRIENDLY',"
)

# Euro
content = content.replace(
    "if (club.ovr >= 85) europeanComp = 'Champions League';\n  else if (club.ovr >= 80) europeanComp = 'Europa League';\n  else if (club.ovr >= 75) europeanComp = 'Conference League';",
    "if (club.ovr >= 85) europeanComp = isYouth ? 'UEFA Youth League' : 'Champions League';\n  else if (club.ovr >= 80) europeanComp = isYouth ? 'UEFA Youth League' : 'Europa League';\n  else if (club.ovr >= 75) europeanComp = isYouth ? 'UEFA Youth League' : 'Conference League';"
)

content = content.replace(
    "opponentSymbol: opp.symbol,\n            competition: europeanComp,\n            competitionType: 'EUROPEAN',",
    "opponentSymbol: isYouth ? opp.symbol + ' U19' : opp.symbol,\n            competition: europeanComp,\n            competitionType: isYouth ? 'YOUTH_EUROPEAN' : 'EUROPEAN',"
)

content = content.replace(
    "opponentSymbol: 'TBD', // To be updated if they progress\n            competition: europeanComp,\n            competitionType: 'EUROPEAN',",
    "opponentSymbol: 'TBD', // To be updated if they progress\n            competition: europeanComp,\n            competitionType: isYouth ? 'YOUTH_EUROPEAN' : 'EUROPEAN',"
)

# Cup
content = content.replace(
    "const domesticCupName = club.country === 'England' ? 'FA Cup' : \n                          club.country === 'France' ? 'Coupe de France' : \n                          club.country === 'Germany' ? 'DFB-Pokal' : \n                          club.country === 'Spain' ? 'Copa del Rey' : 'Domestic Cup';",
    "const domesticCupName = club.country === 'England' ? (isYouth ? 'FA Youth Cup' : 'FA Cup') : \n                          club.country === 'France' ? (isYouth ? 'Coupe Gambardella' : 'Coupe de France') : \n                          club.country === 'Germany' ? (isYouth ? 'DFB-Pokal der Junioren' : 'DFB-Pokal') : \n                          club.country === 'Spain' ? (isYouth ? 'Copa del Rey Juvenil' : 'Copa del Rey') : (isYouth ? 'Youth Domestic Cup' : 'Domestic Cup');"
)

content = content.replace(
    "opponentSymbol: 'TBD',\n            competition: domesticCupName,\n            competitionType: 'DOMESTIC_CUP',",
    "opponentSymbol: 'TBD',\n            competition: domesticCupName,\n            competitionType: isYouth ? 'YOUTH_CUP' : 'DOMESTIC_CUP',"
)

with open('src/utils/calendar.ts', 'w') as f:
    f.write(content)

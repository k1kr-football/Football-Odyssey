with open('src/screens/MatchEngine.tsx', 'r') as f:
    content = f.read()

target = """  const userClub = CLUBS.find(c => c.symbol.toUpperCase() === userClubSymbol.toUpperCase()) || {
    name: 'Your Club',
    symbol: userClubSymbol,
    primaryColor: '#0052CC',
    secondaryColor: '#FFFFFF',
    ovr: 72
  };"""

replacement = """  const userClub = CLUBS.find(c => c.symbol.toUpperCase() === userClubSymbol.toUpperCase()) || {
    name: 'Your Club',
    symbol: userClubSymbol,
    primaryColor: '#0052CC',
    secondaryColor: '#FFFFFF',
    ovr: 72
  };

  const isYouthMatch = state.nextMatch?.competitionType === 'YOUTH_LEAGUE' || state.nextMatch?.competitionType === 'YOUTH_CUP' || state.nextMatch?.competitionType === 'YOUTH_EUROPEAN' || state.nextMatch?.competitionType === 'U18 Friendly';
  const effectiveOppOvr = isYouthMatch ? Math.max(50, oppClub.ovr - 15) : oppClub.ovr;
  const effectiveUserOvr = isYouthMatch ? Math.max(50, userClub.ovr - 15) : userClub.ovr;"""

content = content.replace(target, replacement)
content = content.replace('userClub.ovr', 'effectiveUserOvr')
content = content.replace('oppClub.ovr', 'effectiveOppOvr')
# But wait, replacing all `userClub.ovr` and `oppClub.ovr` might replace the ones in the fallback object definition which we don't want, OR the ones we just added in `effectiveOppOvr` line!

with open('src/screens/MatchEngine.tsx', 'w') as f:
    f.write(content)

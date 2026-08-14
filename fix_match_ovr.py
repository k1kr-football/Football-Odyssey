with open('src/screens/MatchEngine.tsx', 'r') as f:
    content = f.read()

target = """  const userClub = CLUBS.find(c => c.symbol.toUpperCase() === userClubSymbol.toUpperCase()) || {
    name: 'Your Club',
    symbol: userClubSymbol,
    primaryColor: '#0052CC',
    secondaryColor: '#FFFFFF',
    ovr: 70
  };"""

replacement = """  const userClub = CLUBS.find(c => c.symbol.toUpperCase() === userClubSymbol.toUpperCase()) || {
    name: 'Your Club',
    symbol: userClubSymbol,
    primaryColor: '#0052CC',
    secondaryColor: '#FFFFFF',
    ovr: 70
  };

  const isYouthMatch = state.nextMatch?.competitionType === 'YOUTH_LEAGUE' || state.nextMatch?.competitionType === 'YOUTH_CUP' || state.nextMatch?.competitionType === 'YOUTH_EUROPEAN' || state.nextMatch?.competitionType === 'U18 Friendly';
  const effectiveOppOvr = isYouthMatch ? Math.max(50, oppClub.ovr - 15) : oppClub.ovr;
  const effectiveUserOvr = isYouthMatch ? Math.max(50, userClub.ovr - 15) : userClub.ovr;"""

if target in content:
    content = content.replace(target, replacement)
    
    # We also need to find where effectiveUserOvr is used. Oh wait! I didn't actually run it properly before. 
    # Let's replace userClub.ovr with effectiveUserOvr but we have to be careful
    content = content.replace('ovr: userClub.ovr', 'ovr: effectiveUserOvr')
    content = content.replace('ovr: oppClub.ovr', 'ovr: effectiveOppOvr')
    
    with open('src/screens/MatchEngine.tsx', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")

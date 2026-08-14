with open('src/screens/Team.tsx', 'r') as f:
    content = f.read()

target = """ const squad = getClubSquad(club.name);"""

replacement = """ const squad = getClubSquad(club.name);
 const isYouthSquad = state.player?.contract.status === 'Youth';
 
 // Filter players based on squad level
 let displayPlayers = squad.players || [];
 if (isYouthSquad) {
   displayPlayers = displayPlayers.filter((p: any) => p.isYouth);
 } else {
   displayPlayers = displayPlayers.filter((p: any) => !p.isYouth);
 }
 // Sort by OVR to ensure best players are on the pitch
 displayPlayers = [...displayPlayers].sort((a: any, b: any) => b.ovr - a.ovr);
"""

if target in content:
    content = content.replace(target, replacement)
    content = content.replace("squad.players.slice(0, 3)", "displayPlayers.slice(0, 3)")
    content = content.replace("squad.players.slice(3, 6)", "displayPlayers.slice(3, 6)")
    content = content.replace("squad.players.slice(6, 10)", "displayPlayers.slice(6, 10)")
    content = content.replace("squad.players[10]", "displayPlayers[10]")
    content = content.replace("squad.players", "displayPlayers")
    with open('src/screens/Team.tsx', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")

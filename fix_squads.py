with open('src/data/sheetSquads.ts', 'r') as f:
    content = f.read()

target = """    usedNames.add(fullName.toLowerCase());

    existingPlayers.push({
      name: fullName,
      ovr: playerOvr
    });
  }"""

replacement = """    usedNames.add(fullName.toLowerCase());

    existingPlayers.push({
      name: fullName,
      ovr: playerOvr
    });
  }

  // Generate Youth Academy depth (U18s)
  const YOUTH_SQUAD_SIZE = 14;
  let youthPlayersAdded = 0;
  posIdx = 0;
  
  while (youthPlayersAdded < YOUTH_SQUAD_SIZE) {
    const pos = POSITIONS[posIdx % POSITIONS.length];
    posIdx++;
    
    // Youth are 15-20 points lower than the fringe senior depth, but max out around 60
    const youthOvr = Math.min(60, Math.max(35, Math.round(depthMinOvr - 15 + (Math.random() * 8 - 4))));
    const youthAge = 16 + Math.floor(Math.random() * 3);
    
    const npcPlayer = globalNpcEngine.generatePlayer(
      'TEAMMATE',
      country,
      youthOvr,
      youthAge,
      pos,
      clubObj?.symbol
    );

    let fullName = `${npcPlayer.firstName} ${npcPlayer.lastName}`;
    let attempts = 0;
    while (usedNames.has(fullName.toLowerCase()) && attempts < 30) {
      const firstName = namePool.first[Math.floor(Math.random() * namePool.first.length)];
      const lastName = namePool.last[Math.floor(Math.random() * namePool.last.length)];
      fullName = `${firstName} ${lastName}`;
      attempts++;
    }
    
    usedNames.add(fullName.toLowerCase());
    existingPlayers.push({
      name: fullName,
      ovr: youthOvr,
      isYouth: true
    });
    
    youthPlayersAdded++;
  }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/data/sheetSquads.ts', 'w') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("NOT FOUND")

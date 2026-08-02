import re
with open('src/screens/AgentScreen.tsx', 'r') as f:
    content = f.read()

replacement = """  const handleActionPRShield = () => {
    let boost = 15;
    if (player.stateFlags?.agentFocus === 'PR_HYPE') {
        boost += 10;
    } else if (player.stateFlags?.agentFocus === 'FOOTBALL') {
        boost -= 5;
    }
    const newMedia = Math.min(100, player.mediaPerception + boost);
    setPlayer({
      ...player,
      mediaPerception: newMedia
    });
    triggerNotification(`🛡️ Media campaign active! Public perception improved by +${boost}.`);
  };"""

content = re.sub(
    r"  const handleActionPRShield = \(\) => \{.*?  \};\n",
    replacement + "\n",
    content,
    flags=re.DOTALL
)

with open('src/screens/AgentScreen.tsx', 'w') as f:
    f.write(content)

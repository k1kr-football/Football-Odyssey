import re
with open('src/screens/AgentScreen.tsx', 'r') as f:
    content = f.read()

replacement = """  const handleActionRequestContract = () => {
    const canDemand = (player.stats?.apps || 0) >= 10 && player.trust >= 70;
    if (!canDemand) {
      triggerNotification(`🔒 LOCKED — Req: 10+ Appearances & 70+ Manager Trust (Current: ${player.stats?.apps || 0} apps, ${player.trust} trust)`);
      return;
    }

    let contractBoost = currentAgentObj.skills.contractBoost;
    if (player.stateFlags?.agentFocus === 'WAGES') {
        contractBoost += 20;
    }

    const wageIncrease = Math.round(player.contract.wage * (0.15 + contractBoost * 0.003));
    const newWage = player.contract.wage + wageIncrease;

    setPlayer({
      ...player,
      contract: {
        ...player.contract,
        wage: newWage
      }
    });

    const newMsg = {"""

content = re.sub(
    r"  const handleActionRequestContract = \(\) => \{.*?const newMsg = \{",
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/screens/AgentScreen.tsx', 'w') as f:
    f.write(content)

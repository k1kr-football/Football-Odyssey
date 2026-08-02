import re
with open('src/components/AgentMeetingModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("const { state, setPlayer, updateState } = useGame();", "const { state, setPlayer } = useGame();")
content = content.replace("updateState(res.updatedState);", "if (res.updatedState.player) setPlayer(res.updatedState.player);")

with open('src/components/AgentMeetingModal.tsx', 'w') as f:
    f.write(content)

import re

with open('src/utils/worldSimulation.ts', 'r') as f:
    content = f.read()

content = re.sub(r'export function getLeagueTable\([\s\S]*?^}', '', content, flags=re.MULTILINE)

with open('src/utils/worldSimulation.ts', 'w') as f:
    f.write(content)

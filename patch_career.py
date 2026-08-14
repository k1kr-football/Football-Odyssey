import re

with open('src/utils/careerSystems.ts', 'r') as f:
    content = f.read()

# I am not going to delete it, I will just remove the two agent functions
content = re.sub(r'export function checkAgentOffers\([\s\S]*?^}', '', content, flags=re.MULTILINE)
content = re.sub(r'export function evaluateContractCounterOffer\([\s\S]*?^}', '', content, flags=re.MULTILINE)

with open('src/utils/careerSystems.ts', 'w') as f:
    f.write(content)


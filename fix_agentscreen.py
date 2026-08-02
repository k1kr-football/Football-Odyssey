import re
with open('src/screens/AgentScreen.tsx', 'r') as f:
    content = f.read()

# Replace the duplicated action 3 and unbalanced closing
content = re.sub(
    r'\{/\* Action 3: Schedule Agent Meeting \*/\}.*?</button>\s*</div>\s*</div>\s*\{/\* Action 3: Schedule Agent Meeting \*/\}',
    '{/* Action 3: Schedule Agent Meeting */}',
    content,
    flags=re.DOTALL
)

with open('src/screens/AgentScreen.tsx', 'w') as f:
    f.write(content)


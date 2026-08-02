import re
with open('src/screens/AgentScreen.tsx', 'r') as f:
    content = f.read()

# I will replace the start of the ACTIONS tab to include a Fragment
content = content.replace("{activeTab === 'ACTIONS' && (\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">", "{activeTab === 'ACTIONS' && (\n          <>\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">")

# And I will replace the end of Action 3 to close the Fragment
content = re.sub(r'Schedule Meeting\s*</button>\s*</div>\s*</div>\s*\)', 'Schedule Meeting\n              </button>\n            </div>\n          </>\n        )', content, flags=re.DOTALL)

with open('src/screens/AgentScreen.tsx', 'w') as f:
    f.write(content)

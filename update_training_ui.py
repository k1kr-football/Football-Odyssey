import re

with open('src/screens/Training.tsx', 'r') as f:
    content = f.read()

# I will replace the main training selection UI with a cleaner one.
# It starts around line 2085 with `{/* DEFAULT MENU VIEW */}`
# Oh wait, let's check what's there.

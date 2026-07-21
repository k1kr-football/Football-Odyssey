with open('src/types.ts', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "careerIdentity?: import" in line:
        if "matchdayRitual" not in lines[i+1]:
            lines.insert(i+1, "  matchdayRitual?: { name: string; active: boolean; effect: string };\n")
        break

with open('src/types.ts', 'w') as f:
    f.writelines(lines)

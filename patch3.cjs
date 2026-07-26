const fs = require('fs');
let code = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

code = code.replace('advanceDay: () => void;', 'advanceDay: (force?: boolean) => void;');
code = code.replace('const advanceDay = () => {', 'const advanceDay = (force: boolean = false) => {');
code = code.replace(`const hasCriticalItem = s.inbox.some(msg => msg.priority === "CRITICAL" && !msg.read);
      if (hasCriticalItem) return s;`, `const hasCriticalItem = s.inbox.some(msg => msg.priority === "CRITICAL" && !msg.read);
      if (hasCriticalItem && !force) return s;`);

fs.writeFileSync('src/store/GameContext.tsx', code);

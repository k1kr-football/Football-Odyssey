const fs = require('fs');
let code = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');

// Remove the poorly inserted "   });" from fix_lines.js
code = code.replace(/^   \}\);\n/gm, '');

// Now dynamically fix `inboxList.push({`
// Usually ends with `type: '...' }]\n` or `type: '...' }\n`
// Let's use regex to find inboxList.push({ ... }) and append }); 
// A better way is to find all objects missing a closing tag. 
// But a quick regex for inboxList.push:
code = code.replace(/inboxList\.push\(\{([\s\S]*?(?:\]|\}))\n(?! *\}\);)/g, 'inboxList.push({$1\n});\n');

// Also for setLogs(prev => [...prev, { ... }])
code = code.replace(/setLogs\(prev => \[\.\.\.prev, \{([\s\S]*?fail: (?:true|false) \}\])\n(?! *\}\);)/g, 'setLogs(prev => [...prev, {$1\n});\n');

// Also for setPlayer({
code = code.replace(/setPlayer\(\{([\s\S]*?)\}\)\n(?! *;)/g, 'setPlayer({$1});\n');

fs.writeFileSync('src/screens/MatchEngine.tsx', code);

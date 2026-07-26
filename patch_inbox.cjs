const fs = require('fs');
let code = fs.readFileSync('src/screens/Inbox.tsx', 'utf8');

// Update top unread count
code = code.replace(
  `<span className="text-[#00FF88] font-mono">\n   {filteredMessages.filter((m: any) => !m.read).length} Unread\n   </span>`,
  `<span className="text-[#00FF88] font-mono">\n   {(() => {\n    const unread = filteredMessages.filter((m: any) => !m.read);\n    const mandatory = unread.filter((m: any) => m.priority === 'CRITICAL').length;\n    return \`\${unread.length} Unread (\${mandatory} Mandatory)\`;\n   })()}\n   </span>`
);

// Update badge display on cards
code = code.replace(
  `{msg.priority || 'ROUTINE'}`,
  `{msg.priority === 'CRITICAL' ? 'MANDATORY' : 'OPTIONAL'}`
);

// Update section headers
code = code.replace(
  `🚨 Critical Actions Required`,
  `🚨 Mandatory Actions Required`
);

code = code.replace(
  `📁 General Correspondence`,
  `📁 Optional Correspondence`
);

fs.writeFileSync('src/screens/Inbox.tsx', code);
console.log('Successfully patched Inbox.tsx');

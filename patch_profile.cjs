const fs = require('fs');
let code = fs.readFileSync('src/screens/Profile.tsx', 'utf8');

if (!code.includes("import { musicEngine } from '../utils/musicEngine';")) {
  code = code.replace(
    "import { calculateLegacyScore } from \"../utils/gameRefinements\";",
    "import { calculateLegacyScore } from \"../utils/gameRefinements\";\nimport { musicEngine } from '../utils/musicEngine';"
  );
}

const effectCode = `
  useEffect(() => {
    if (isRetired || activeTab === 'RETIREMENT') {
      musicEngine.playMood('RETIREMENT');
    } else {
      musicEngine.playMood('MENU');
    }
  }, [isRetired, activeTab]);
`;

code = code.replace(
  " const [journalSearch, setJournalSearch] = useState('');",
  " const [journalSearch, setJournalSearch] = useState('');\n\n" + effectCode
);

fs.writeFileSync('src/screens/Profile.tsx', code);

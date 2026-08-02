const fs = require('fs');
let code = fs.readFileSync('src/components/StoryOverlay.tsx', 'utf8');

if (!code.includes("import { musicEngine } from '../utils/musicEngine';")) {
  code = code.replace(
    "import { getFormattedCalendarDate } from '../utils/careerSystems';",
    "import { getFormattedCalendarDate } from '../utils/careerSystems';\nimport { musicEngine } from '../utils/musicEngine';"
  );
}

const effectCode = `
  useEffect(() => {
    if (cutscene) {
      musicEngine.playMood('STORY_CUTSCENE');
    }
  }, [cutscene]);
`;

code = code.replace(
  "  const endRef = useRef<HTMLDivElement>(null);",
  "  const endRef = useRef<HTMLDivElement>(null);\n" + effectCode
);

fs.writeFileSync('src/components/StoryOverlay.tsx', code);

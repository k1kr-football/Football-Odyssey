const fs = require('fs');
let content = fs.readFileSync('src/screens/Training.tsx', 'utf8');

// The lines we want to remove:
//  const [selectedCategory, setSelectedCategory] = useState<"UNIVERSAL" | "POSITION" | "MENTAL">("UNIVERSAL");
//  const [selectedGame, setSelectedGame] = useState<MinigameConfig | null>(null);
//  const [intensity, setIntensity] = useState<IntensityLevel>("Standard");
// ... and so on.

// Actually, I can just use a regex to replace the state block from lines 162 to 183.
// But wait, there are also functions: `handleStartMinigame`, `initRepInteraction`, `handleInteractionAction`, `finalizeIndividualSession`, `applyRecoverySession`, `getMinigameInteractionType`.

content = content.replace(/const \[selectedCategory.*?\] = useState.*?;/s, '');
content = content.replace(/const \[selectedGame.*?\] = useState.*?;/s, '');
content = content.replace(/const \[intensity.*?\] = useState.*?;/s, '');
content = content.replace(/const \[activeEngine.*?\] = useState.*?;/s, '');
content = content.replace(/const \[error.*?\] = useState.*?;/s, '');
content = content.replace(/const \[sessionRep.*?\] = useState.*?;/s, '');
content = content.replace(/const TOTAL_REPS = 3;/s, '');
content = content.replace(/const \[repScores.*?\] = useState.*?;/s, '');
content = content.replace(/const \[lastDeltas.*?\] = useState.*?;/s, '');

content = content.replace(/const \[reactionTriggered.*?\] = useState.*?;/s, '');
content = content.replace(/const \[reactionStartTime.*?\] = useState.*?;/s, '');
content = content.replace(/const \[timingPos.*?\] = useState.*?;/s, '');
content = content.replace(/const \[timingDir.*?\] = useState.*?;/s, '');
content = content.replace(/const \[dirChoiceIndex.*?\] = useState.*?;/s, '');
content = content.replace(/const \[targetReticlePos.*?\] = useState.*?;/s, '');
content = content.replace(/const \[holdCharge.*?\] = useState.*?;/s, '');
content = content.replace(/const holdIntervalRef = useRef<NodeJS\.Timeout \| null>\(null\);/s, '');

content = content.replace(/const posGames = POSITION_MINIGAMES.*?return false;\n \}\);\n/s, '');
content = content.replace(/const availableGames =.*?;/s, '');
content = content.replace(/const getMinigameInteractionType =.*?return 'TIMING';\n \};\n/s, '');
content = content.replace(/const handleStartMinigame =.*?\};\n/s, '');
content = content.replace(/const initRepInteraction =.*?\};\n/s, '');
content = content.replace(/useEffect\(\(\) => \{\n  if \(activeEngine !== 'TIMING'\).*?clearInterval\(interval\);\n \}, \[activeEngine, timingDir\]\);\n/s, '');
content = content.replace(/const handleInteractionAction =.*?\};\n/s, '');
content = content.replace(/const finalizeIndividualSession =.*?\};\n/s, '');
content = content.replace(/const applyRecoverySession =.*?\};\n/s, '');

fs.writeFileSync('src/screens/Training.tsx', content);

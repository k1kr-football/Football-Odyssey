const fs = require('fs');
let code = fs.readFileSync('src/screens/Transfers.tsx', 'utf8');

// Add import
code = code.replace("import { SuggestSigningModal } from '../components/SuggestSigningModal';", "import { SuggestSigningModal } from '../components/SuggestSigningModal';\nimport { MedicalCheckModal } from '../components/MedicalCheckModal';");

// Add state
code = code.replace("const [negotiatingOffer, setNegotiatingOffer] = useState<string | null>(null);", "const [negotiatingOffer, setNegotiatingOffer] = useState<string | null>(null);\n const [pendingMedicalOffer, setPendingMedicalOffer] = useState<string | null>(null);\n const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);");

fs.writeFileSync('src/screens/Transfers.tsx', code);

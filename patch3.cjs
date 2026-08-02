const fs = require('fs');
let code = fs.readFileSync('src/screens/Career.tsx', 'utf8');

// Add import
code = code.replace("import { generateAcademyProspects, guideAcademyProspect, AcademyProspect } from '../utils/academyLegacy';", "import { generateAcademyProspects, guideAcademyProspect, AcademyProspect } from '../utils/academyLegacy';\nimport { RadarChartComparison } from '../components/RadarChartComparison';");

const radarRender = `
    {/* RADAR CHART WIDGET */}
    <RadarChartComparison playerAttributes={player.attributes} playerPosition={player.position} />
    
    {/* STORY ARC WIDGET */}`;

code = code.replace("{/* STORY ARC WIDGET */}", radarRender);

fs.writeFileSync('src/screens/Career.tsx', code);

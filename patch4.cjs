const fs = require('fs');
let code = fs.readFileSync('src/screens/MatchEngine.tsx', 'utf8');

// Add import
code = code.replace("import { generateMatchDecisions, getPositionGroup, DecisionOption, KeyDecision } from \"../utils/positionMatchDecisions\";", "import { generateMatchDecisions, getPositionGroup, DecisionOption, KeyDecision } from \"../utils/positionMatchDecisions\";\nimport { RadarChartComparison } from '../components/RadarChartComparison';");

const radarRender = `
      {/* Grid: Player Stats & Objectives Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RadarChartComparison playerAttributes={p.attributes} playerPosition={p.position} isMatchContext={true} />
      </div>

      {/* Grid: Player Stats & Objectives Status */}`;

code = code.replace("{/* Grid: Player Stats & Objectives Status */}", radarRender);

fs.writeFileSync('src/screens/MatchEngine.tsx', code);

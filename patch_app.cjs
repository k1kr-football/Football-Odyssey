const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importsToRemove = [
  "import { PlayerCreation } from './screens/PlayerCreation';",
  "import { TrialMatch } from './screens/TrialMatch';",
  "import { Profile } from './screens/Profile';",
  "import { Inbox } from './screens/Inbox';",
  "import { Training } from './screens/Training';",
  "import { Team } from './screens/Team';",
  "import { Schedule } from './screens/Schedule';",
  "import { Career } from './screens/Career';",
  "import { Transfers } from './screens/Transfers';",
  "import { MatchEngine } from './screens/MatchEngine';",
  "import { PressConference } from './screens/PressConference';",
  "import { MediaMinigame } from './screens/MediaMinigame';",
  "import { RehabMinigame } from './screens/RehabMinigame';",
  "import { Lifestyle } from './screens/Lifestyle';",
  "import { Social } from './screens/Social';",
  "import { Finances } from './screens/Finances';",
  "import { AgentScreen } from './screens/AgentScreen';",
  "import { Glossary } from './screens/Glossary';",
  "import { AwardsCeremony } from './screens/AwardsCeremony';"
];

importsToRemove.forEach(imp => {
  code = code.replace(imp, "");
});

const lazyImports = `
import { Suspense, lazy } from 'react';

const PlayerCreation = lazy(() => import('./screens/PlayerCreation').then(module => ({ default: module.PlayerCreation })));
const TrialMatch = lazy(() => import('./screens/TrialMatch').then(module => ({ default: module.TrialMatch })));
const Profile = lazy(() => import('./screens/Profile').then(module => ({ default: module.Profile })));
const Inbox = lazy(() => import('./screens/Inbox').then(module => ({ default: module.Inbox })));
const Training = lazy(() => import('./screens/Training').then(module => ({ default: module.Training })));
const Team = lazy(() => import('./screens/Team').then(module => ({ default: module.Team })));
const Schedule = lazy(() => import('./screens/Schedule').then(module => ({ default: module.Schedule })));
const Career = lazy(() => import('./screens/Career').then(module => ({ default: module.Career })));
const Transfers = lazy(() => import('./screens/Transfers').then(module => ({ default: module.Transfers })));
const MatchEngine = lazy(() => import('./screens/MatchEngine').then(module => ({ default: module.MatchEngine })));
const PressConference = lazy(() => import('./screens/PressConference').then(module => ({ default: module.PressConference })));
const MediaMinigame = lazy(() => import('./screens/MediaMinigame').then(module => ({ default: module.MediaMinigame })));
const RehabMinigame = lazy(() => import('./screens/RehabMinigame').then(module => ({ default: module.RehabMinigame })));
const Lifestyle = lazy(() => import('./screens/Lifestyle').then(module => ({ default: module.Lifestyle })));
const Social = lazy(() => import('./screens/Social').then(module => ({ default: module.Social })));
const Finances = lazy(() => import('./screens/Finances').then(module => ({ default: module.Finances })));
const AgentScreen = lazy(() => import('./screens/AgentScreen').then(module => ({ default: module.AgentScreen })));
const Glossary = lazy(() => import('./screens/Glossary').then(module => ({ default: module.Glossary })));
const AwardsCeremony = lazy(() => import('./screens/AwardsCeremony').then(module => ({ default: module.AwardsCeremony })));

const LoadingScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-transparent">
    <div className="w-12 h-12 border-4 border-white/10 border-t-[#00FF88] rounded-full animate-spin mb-4"></div>
    <div className="text-[#00FF88] font-bold text-xs uppercase tracking-widest animate-pulse">Loading Asset...</div>
  </div>
);
`;

code = code.replace("import React from 'react';", "import React from 'react';\n" + lazyImports);

code = code.replace(
  "{renderActiveScreen()}",
  "<Suspense fallback={<LoadingScreen>}>{renderActiveScreen()}</Suspense>"
);

fs.writeFileSync('src/App.tsx', code);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { Suspense, lazy } from 'react';

const PlayerCreation = lazy(() => import('./screens/PlayerCreation').then(module => ({ default: module.PlayerCreation })));
const TrialMatch = lazy(() => import('./screens/TrialMatch').then(module => ({ default: module.TrialMatch })));
const Profile = lazy(() => import('./screens/Profile').then(module => ({ default: module.Profile })));
const Inbox = lazy(() => import('./screens/Inbox').then(module => ({ default: module.Inbox })));
const Messages = lazy(() => import('./screens/Messages').then(module => ({ default: module.Messages })));
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
const Club = lazy(() => import('./screens/Club').then(module => ({ default: module.Club })));
const Glossary = lazy(() => import('./screens/Glossary').then(module => ({ default: module.Glossary })));
const AwardsCeremony = lazy(() => import('./screens/AwardsCeremony').then(module => ({ default: module.AwardsCeremony })));

const LoadingScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-transparent">
    <div className="w-12 h-12 border-4 border-white/10 border-t-[#00FF88] rounded-full animate-spin mb-4"></div>
    <div className="text-[#00FF88] font-bold text-xs uppercase tracking-widest animate-pulse">Loading Asset...</div>
  </div>
);

import { GameProvider, useGame } from './store/GameContext';
import { MainLayout } from './components/MainLayout';


import { Hub } from './screens/Hub';















import { MainMenu } from './screens/MainMenu';


import { getTeamColors } from './utils/teamColors';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AudioManager } from './components/AudioManager';

function GameRouter() {
  const { state, setScreen } = useGame();

  if (state.screen === 'MAIN_MENU') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#0E0E0E]">
        <MainMenu />
      </div>
    );
  }

  const handleReset = () => {
    setScreen('HUB');
  };

  const renderActiveScreen = () => {
    switch (state.screen) {
      case 'CREATION':
        return <PlayerCreation />;
      case 'TRIAL_MATCH':
        return <TrialMatch />;
      case 'HUB':
        return <Hub />;
      case 'PROFILE':
        return <Profile />;
      case 'INBOX':
        return <Inbox />;
      case 'MESSAGES':
        return <Messages />;
      case 'TRAINING':
        return <Training />;
      case 'TEAM':
        return <Team />;
      case 'SCHEDULE':
        return <Schedule />;
      case 'CAREER':
        return <Career />;
      case 'TRANSFERS':
        return <Transfers />;
      case 'MATCH':
        return <MatchEngine />;
      case 'PRESS':
        return <PressConference />;
      case 'MEDIA_MINIGAME':
        return <MediaMinigame />;
      case 'REHAB_MINIGAME':
        return <RehabMinigame />;
      case 'LIFESTYLE':
        return <Lifestyle />;
      case 'SOCIAL':
        return <Social />;
      case 'FINANCES':
        return <Finances />;
      case 'AGENT':
        return <AgentScreen />;
      case 'CLUB':
        return <Club />;
      case 'GLOSSARY':
        return <Glossary />;
      case 'AWARDS_CEREMONY':
        return <AwardsCeremony />;
      default:
        return <Hub />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0E0E0E]">
      <AudioManager />
      <MainLayout>
        <ErrorBoundary onReset={handleReset}>
          <Suspense fallback={<LoadingScreen />}>{renderActiveScreen()}</Suspense>
        </ErrorBoundary>
      </MainLayout>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}

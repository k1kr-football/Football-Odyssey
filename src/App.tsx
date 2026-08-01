/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameProvider, useGame } from './store/GameContext';
import { MainLayout } from './components/MainLayout';
import { PlayerCreation } from './screens/PlayerCreation';
import { TrialMatch } from './screens/TrialMatch';
import { Hub } from './screens/Hub';
import { Profile } from './screens/Profile';
import { Inbox } from './screens/Inbox';
import { Training } from './screens/Training';
import { Team } from './screens/Team';
import { Schedule } from './screens/Schedule';
import { Career } from './screens/Career';
import { Transfers } from './screens/Transfers';
import { MatchEngine } from './screens/MatchEngine';
import { PressConference } from './screens/PressConference';
import { MediaMinigame } from './screens/MediaMinigame';
import { RehabMinigame } from './screens/RehabMinigame';
import { Lifestyle } from './screens/Lifestyle';
import { Social } from './screens/Social';
import { Finances } from './screens/Finances';
import { AgentScreen } from './screens/AgentScreen';
import { MainMenu } from './screens/MainMenu';
import { Glossary } from './screens/Glossary';
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
      case 'GLOSSARY':
        return <Glossary />;
      default:
        return <Hub />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0E0E0E]">
      <AudioManager />
      <MainLayout>
        <ErrorBoundary onReset={handleReset}>
          {renderActiveScreen()}
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

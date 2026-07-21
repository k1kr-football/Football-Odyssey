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
import { MainMenu } from './screens/MainMenu';
import { Glossary } from './screens/Glossary';
import { getTeamColors } from './utils/teamColors';
import { ErrorBoundary } from './components/ErrorBoundary';

function GameRouter() {
  const { state, setScreen } = useGame();

  if (state.screen === 'MAIN_MENU') {
    return (
      <div className="h-full w-full">
        <MainMenu />
      </div>
    );
  }

  const handleReset = () => {
    setScreen('HUB');
  };

  return (
    <div className="h-full w-full">
      <MainLayout>
        <ErrorBoundary onReset={handleReset}>
          {state.screen === 'CREATION' && <PlayerCreation />}
          {state.screen === 'TRIAL_MATCH' && <TrialMatch />}
          {state.screen === 'HUB' && <Hub />}
          {state.screen === 'PROFILE' && <Profile />}
          {state.screen === 'INBOX' && <Inbox />}
          {state.screen === 'TRAINING' && <Training />}
          {state.screen === 'TEAM' && <Team />}
          {state.screen === 'SCHEDULE' && <Schedule />}
          {state.screen === 'CAREER' && <Career />}
          {state.screen === 'TRANSFERS' && <Transfers />}
          {state.screen === 'MATCH' && <MatchEngine />}
          {state.screen === 'PRESS' && <PressConference />}
          {state.screen === 'MEDIA_MINIGAME' && <MediaMinigame />}
          {state.screen === 'REHAB_MINIGAME' && <RehabMinigame />}
          {state.screen === 'LIFESTYLE' && <Lifestyle />}
          {state.screen === 'SOCIAL' && <Social />}
          {state.screen === 'FINANCES' && <Finances />}
          {state.screen === 'GLOSSARY' && <Glossary />}
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

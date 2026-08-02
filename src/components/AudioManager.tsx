import React, { useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { musicEngine, MusicMoodId } from '../utils/musicEngine';
import { sfxEngine } from '../utils/sfxEngine';

export function AudioManager() {
  const { state, settings } = useGame();

  // Sync volume settings whenever they change
  useEffect(() => {
    sfxEngine.setVolumes(settings.masterVolume, settings.sfxVolume);
    musicEngine.setVolumes(settings.masterVolume, settings.musicVolume);
  }, [settings.masterVolume, settings.musicVolume, settings.sfxVolume]);

  // Determine active music mood from game state
  useEffect(() => {
    let targetMood: MusicMoodId | null = null;
    
    // Screens that explicitly DO NOT have their music managed centrally,
    // because they manage their own dynamic music states internally.

    const selfManagingScreens = ['MATCH', 'TRIAL_MATCH', 'TRAINING'];
    
    if (state.activeCutscene) {
      // Handled by StoryOverlay
      return;
    }

    if (!selfManagingScreens.includes(state.screen)) {
      if (state.screen === 'REHAB_MINIGAME' || state.screen === 'MEDIA_MINIGAME') {
        targetMood = 'TRAINING';
      } else {
        targetMood = 'MENU';
      }
    }


    if (targetMood) {
      musicEngine.playMood(targetMood);
    }
  }, [state.screen]);

  // Global SFX trigger for UI button clicks
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, a, input[type="button"], input[type="submit"], [role="button"]');
      if (interactive) {
        sfxEngine.play('UI_CLICK');
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });

    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  return null; // Silent background manager
}

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
    let targetMood: MusicMoodId = 'MENU';

    if (state.activeCutscene) {
      targetMood = 'STORY_CUTSCENE';
    } else {
      switch (state.screen) {
        case 'MAIN_MENU':
        case 'CREATION':
          targetMood = 'MENU';
          break;

        case 'TRAINING':
        case 'REHAB_MINIGAME':
        case 'MEDIA_MINIGAME':
          targetMood = 'TRAINING';
          break;

        case 'MATCH':
        case 'TRIAL_MATCH': {
          const nextMatch = state.nextMatch;
          const isDerby = nextMatch?.matchType === 'DERBY' || nextMatch?.matchType === 'FINAL' || nextMatch?.matchType === 'GRUDGE';
          const pressure = nextMatch?.pressure || 5;

          if (isDerby) {
            targetMood = 'DERBY_DAY';
          } else if (pressure >= 7) {
            targetMood = 'MATCH_HIGH_PRESSURE';
          } else {
            targetMood = 'MATCH_LOW_PRESSURE';
          }
          break;
        }

        default:
          targetMood = 'MENU';
          break;
      }
    }

    musicEngine.playMood(targetMood);
  }, [state.screen, state.activeCutscene, state.nextMatch?.pressure, state.nextMatch?.matchType]);

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

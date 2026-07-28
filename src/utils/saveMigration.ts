/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState } from '../store/GameContext';

/**
 * The current save data version.
 * Increment this whenever a new system is introduced that adds or renames
 * state fields, ensuring smooth backfills and avoiding save corruption.
 */
export const CURRENT_SAVE_VERSION = 2;

/**
 * Migrates a saved state object from older versions of the game to the current structure.
 * This treats every new system addition as a migration event, rather than assuming a fresh-start.
 *
 * @param savedState The parsed state loaded from localStorage
 * @returns The migrated, safe GameState
 */
export function migrateSaveData(savedState: any): any {
  if (!savedState || !savedState.player) return savedState;

  // Clone to prevent direct mutation of the source parameter
  const state = JSON.parse(JSON.stringify(savedState));

  // Determine current version of loaded save. Missing version defaults to 0.
  const initialVersion = state.saveVersion || 0;

  // =========================================================================
  // ALWAYS-ON SANITIZATION & DEFAULTS FOR ALL SAVES
  // Ensures missing properties are safely backfilled regardless of version
  // =========================================================================
  const player = state.player;

  if (!player.stats) {
    player.stats = { apps: 0, goals: 0, assists: 0, caps: 0, intlGoals: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, derbyStats: { played: 0, totalRating: 0 } };
  } else {
    if (player.stats.apps === undefined) player.stats.apps = 0;
    if (player.stats.goals === undefined) player.stats.goals = 0;
    if (player.stats.assists === undefined) player.stats.assists = 0;
    if (player.stats.caps === undefined) player.stats.caps = 0;
    if (player.stats.intlGoals === undefined) player.stats.intlGoals = 0;
    if (player.stats.cleanSheets === undefined) player.stats.cleanSheets = 0;
    if (!player.stats.derbyStats) player.stats.derbyStats = { played: 0, totalRating: 0 };
  }

  if (!player.attributes) {
    player.attributes = { pace: 60, finishing: 60, passing: 60, dribbling: 60, tackling: 50, stamina: 60, agility: 60, composure: 60, strength: 60, decisionMaking: 60, vision: 60, firstTouch: 60, tacticalAwareness: 50 };
  } else {
    const defaultAttrs: any = { pace: 60, finishing: 60, passing: 60, dribbling: 60, tackling: 50, stamina: 60, agility: 60, composure: 60, strength: 60, decisionMaking: 60, vision: 60, firstTouch: 60, tacticalAwareness: 50 };
    for (const key in defaultAttrs) {
      if (player.attributes[key] === undefined) {
        player.attributes[key] = defaultAttrs[key];
      }
    }
  }

  if (!player.finances) {
    player.finances = { balance: 10000, expenses: { housing: 200, training: 0, lifestyle: 0, family: 0 }, investments: [], property: [] };
  } else {
    if (player.finances.balance === undefined) player.finances.balance = 10000;
    if (!player.finances.expenses) {
      player.finances.expenses = { housing: 200, training: 0, lifestyle: 0, family: 0 };
    } else {
      if (player.finances.expenses.housing === undefined) player.finances.expenses.housing = 0;
      if (player.finances.expenses.training === undefined) player.finances.expenses.training = 0;
      if (player.finances.expenses.lifestyle === undefined) player.finances.expenses.lifestyle = 0;
      if (player.finances.expenses.family === undefined) player.finances.expenses.family = 0;
    }
  }

  if (!player.contract) {
    player.contract = { wage: 1000, status: 'Starter', yearsRemaining: 3, appearanceBonus: 0, goalBonus: 0, bonuses: 0 };
  } else {
    if (player.contract.wage === undefined) player.contract.wage = 1000;
    if (player.contract.status === undefined) player.contract.status = 'Starter';
    if (player.contract.yearsRemaining === undefined) player.contract.yearsRemaining = 3;
  }

  if (!player.relationships) {
    player.relationships = { manager: 50, manager_discipline: 50, teammates: 50, agent: 50, family: 60, intlManager: 50 };
  } else {
    if (player.relationships.manager === undefined) player.relationships.manager = 50;
    if (player.relationships.manager_discipline === undefined) player.relationships.manager_discipline = 50;
    if (player.relationships.teammates === undefined) player.relationships.teammates = 50;
    if (player.relationships.agent === undefined) player.relationships.agent = 50;
    if (player.relationships.family === undefined) player.relationships.family = 60;
  }

  if (!player.socialMedia) {
    player.socialMedia = { followers: 1000, posts: [] };
  }

  if (!player.physicalCondition) {
    player.physicalCondition = { value: 85, tier: 'PEAK', effects: { statPenalty: 0, injuryRisk: 5 }, matchFitness: 80, recoveryDebt: 0, injurySusceptibility: 5 };
  }

  if (!player.stateFlags) {
    player.stateFlags = { openThreads: { formHistory: [] }, stadiumMilestones: {} };
  } else if (!player.stateFlags.openThreads) {
    player.stateFlags.openThreads = { formHistory: [] };
  }

  if (!state.inbox) state.inbox = [];
  if (!state.storyFlags) state.storyFlags = {};
  if (!state.unlockedCutscenes) state.unlockedCutscenes = [];

  if (initialVersion === CURRENT_SAVE_VERSION) {
    return state; // No version migration needed
  }

  console.log(`[SAVE MIGRATION] Migrating save from v${initialVersion} to v${CURRENT_SAVE_VERSION}`);

  // =========================================================================
  // MIGRATION EVENT V1: Unified NPC Registry & Decision Memory Safeguards
  // =========================================================================
  if (state.saveVersion === undefined || state.saveVersion < 1) {
    const player = state.player;

    // Defensive structures on player
    if (!player.scoutReports) player.scoutReports = [];
    if (!player.dressingRoomEvents) player.dressingRoomEvents = [];
    if (!player.rivals) player.rivals = [];
    if (!player.trophies) player.trophies = [];
    if (!player.milestones) player.milestones = [];
    if (!player.journalists) player.journalists = [];
    if (!player.promises) player.promises = [];
    if (player.mentoring === undefined) player.mentoring = null;

    // Check system-level registries
    if (!state.unlockedCutscenes) state.unlockedCutscenes = [];
    if (!state.storyFlags) state.storyFlags = {};
    if (!state.inbox) state.inbox = [];

    state.saveVersion = 1;
  }

  // =========================================================================
  // MIGRATION EVENT V2: Dynamic Reputation, Media Perception & Peer Respect
  // =========================================================================
  if (state.saveVersion < 2) {
    const player = state.player;

    // Extract existing proxy data
    const wage = player.contract?.wage || 1000;
    const apps = player.stats?.apps || 0;
    const fans = player.fans || 10; // Fan Adoration
    const managerTrust = player.trust || 50;

    // 1. BACKFILL WORLD REPUTATION
    // Let's compute a balanced starting value (10-100) using existing metrics:
    // Elite wages (£100k+) and extensive appearances yield high reputation.
    const wageWeight = Math.min(40, Math.round((wage / 150000) * 40)); // up to 40
    const appsWeight = Math.min(30, Math.round((apps / 200) * 30));    // up to 30
    const fansWeight = Math.min(30, Math.round((fans / 100) * 30));    // up to 30
    const backfilledWorldRep = Math.max(10, Math.min(100, wageWeight + appsWeight + fansWeight));

    // 2. BACKFILL PEER RESPECT
    // Determined primarily by appearance longevity and high manager trust / reliability.
    const longevityWeight = Math.min(50, Math.round((apps / 250) * 50)); // up to 50
    const trustWeight = Math.min(50, Math.round((managerTrust / 100) * 50)); // up to 50
    const backfilledPeerRespect = Math.max(10, Math.min(100, longevityWeight + trustWeight));

    // 3. BACKFILL MEDIA PERCEPTION
    // Standard baseline is 50, adapted by player's personality.
    let backfilledMediaPerception = 50;
    if (player.personality === 'Media-Friendly' || player.personality === 'Professional') {
      backfilledMediaPerception = 65;
    } else if (player.personality === 'Temperamental' || player.personality === 'Party Animal') {
      backfilledMediaPerception = 35;
    }

    // Ensure entire reputation structure is initialized and complete
    if (!player.reputation) {
      player.reputation = {
        club: Math.max(20, managerTrust),
        league: Math.max(15, Math.round(backfilledWorldRep * 0.8)),
        world: backfilledWorldRep,
        peerRespect: backfilledPeerRespect,
        skill: 50,
        attitude: 50,
        media: backfilledMediaPerception,
        fans: fans,
        global: backfilledWorldRep,
        legacy: 0
      };
    } else {
      // Backfill individual fields inside reputation if missing or empty
      if (!player.reputation.world) player.reputation.world = backfilledWorldRep;
      if (!player.reputation.peerRespect) player.reputation.peerRespect = backfilledPeerRespect;
      if (!player.reputation.club) player.reputation.club = Math.max(20, managerTrust);
      if (!player.reputation.league) player.reputation.league = Math.max(15, Math.round(backfilledWorldRep * 0.8));
      if (!player.reputation.skill) player.reputation.skill = 50;
      if (!player.reputation.attitude) player.reputation.attitude = 50;
      if (!player.reputation.media) player.reputation.media = backfilledMediaPerception;
      if (!player.reputation.fans) player.reputation.fans = fans;
      if (!player.reputation.global) player.reputation.global = backfilledWorldRep;
      if (!player.reputation.legacy) player.reputation.legacy = 0;
    }

    if (player.mediaPerception === undefined) {
      player.mediaPerception = backfilledMediaPerception;
    }

    // Ensure player perception records are initialized
    if (!player.perception) player.perception = 'Neutral';
    if (!player.perceptionHistory) player.perceptionHistory = [];

    // 4. INJECT MIGRATION NOTIFICATION
    if (state.inbox) {
      state.inbox.unshift({
        id: `save_migration_v2_${Date.now()}`,
        sender: 'TECHNICAL DIRECTIVE',
        subject: 'Save Upgraded Successfully 🔄',
        content: `Your career progress has been updated to Save Version ${CURRENT_SAVE_VERSION} to support the latest simulation systems without breaking.

Below is the backfill mapping computed from your existing career milestones:
• World Reputation: ${backfilledWorldRep}/100 (Derived from your £${wage.toLocaleString()}/w salary and ${apps} appearances)
• Professional Peer Respect: ${backfilledPeerRespect}/100 (Derived from your career longevity and Manager trust)
• Media Perception: ${backfilledMediaPerception}/100 (Aligned with your "${player.personality || 'Professional'}" personality)

All active items, decisions, and club systems remain intact!`,
        read: false,
        type: 'NEWS',
        timestamp: 'MON 08:00',
        choices: [{ text: 'Great, continue career.', type: 'ack' }]
      });
    }

    state.saveVersion = 2;
  }

  // Graceful fallback for missing clubs or NPCs (never silently fail)
  if (state.player && !state.player.currentClubSymbol) {
    state.player.currentClubSymbol = 'MUN'; // Fallback to safe default
  }

  return state;
}

/*
=============================================================================
DEVELOPMENT ROLLBACK & MANUAL TESTING PROCESS
=============================================================================
To test migrations during active development without losing your primary test save:

1. EXPORT AND BACKUP:
   Open developer console in browser, run:
   `const backup = localStorage.getItem('rtg_careersave');`
   `copy(backup);` (Copies string to clipboard, save to a text file).

2. TEST COLD UPGRADE:
   - Clear save or modify saveVersion to a lower value in console:
     `const data = JSON.parse(localStorage.getItem('rtg_careersave'));`
     `data.saveVersion = 0; delete data.player.reputation;`
     `localStorage.setItem('rtg_careersave', JSON.stringify(data));`
   - Refresh the page and click "Load Career".
   - Confirm that the career launches without error and you see the "Save Upgraded Successfully" message in your Inbox.
   - Verify that your reputation metrics are correctly populated in your Profile view.

3. ROLLBACK AFTER TESTING:
   If something fails or you want to repeat the test:
   `localStorage.setItem('rtg_careersave', '<paste_original_backup_string_here>');`
=============================================================================
STANDING RULE FOR ALL FUTURE PROMPTS
=============================================================================
Any future prompt introducing a new player attribute, club system, or state-level
variable MUST define a new migration case inside migrateSaveData() and increment 
CURRENT_SAVE_VERSION. Never assume a fresh save is acceptable.
=============================================================================
*/

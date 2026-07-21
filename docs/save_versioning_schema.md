# Save Data Versioning & Migration

## Overview
This system prevents save data corruption, silent loading failures, and missing fields as new systems are continuously added to Football Odyssey during vibe coding. Every save is tagged with a version identifier (`saveVersion`), and as new features are added, explicit migration logic translates old save formats into the current expected structure.

## 1. Version Identifiers
- Every new save is initialized with `saveVersion = CURRENT_SAVE_VERSION`.
- When loading a save, the system checks `savedState.saveVersion`. If it is less than `CURRENT_SAVE_VERSION` (or missing, which assumes `0`), it runs sequential migrations.
- **Current Save Version:** 2 (as of Phase 0.5 NPC/Formulas integrations).

## 2. Standard Migration Pattern
When introducing a new system (e.g., Financial Tiers), do not leave existing saves with `undefined` values. 
- Create a migration block in `src/utils/saveMigration.ts`.
- Calculate a sensible fallback/default value based on existing data.
  *Example:* When Financial Tier was added (Version 1), the migration reads existing `reputation` and `netWorth` to place the player in 'ROOKIE' or 'REGULAR', rather than defaulting to nothing.

## 3. Graceful Fallbacks (Removed/Renamed Fields)
If a stat or mechanic is renamed:
- The migration should map the old field `savedState.oldFieldName` to the new `savedState.newFieldName` and `delete savedState.oldFieldName`.
- Systems rendering the UI should always have a default `|| 0` or `|| 'UNKNOWN'` in case data is temporarily mismatched.

## 4. NPC Engine Save Versioning
The `NPCRegistry` in `src/utils/npcEngine.ts` maintains an ongoing list of generated characters.
- If the schema for an NPC changes (e.g., adding `traits`), the `saveMigration.ts` must map over `state.npcRegistry` and inject default traits into old entries so the game doesn't crash trying to read them.

## 5. Rollback and Testing
Manual testing is supported by opening DevTools -> Application -> Local Storage, changing the `saveVersion` key on the JSON object back to `0`, and reloading. The game should seamlessly re-run the migrations.

## STANDING RULE FOR FUTURE PROMPTS
**Any future system-addition prompt MUST explicitly state its migration/backfill approach for existing saves.** Do not assume a fresh-start. Include migration instructions for `src/utils/saveMigration.ts`.

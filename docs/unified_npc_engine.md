# Unified NPC Generation Engine

## 1. Single Save-Wide Name Registry
*File: `src/utils/npcEngine.ts`*
- Maintains a `NPCRegistry` covering all types: `players`, `agents`, `journalists`, `managers`.
- Exposes `generateUniqueName(nationality)` which loops through available names for the region, verifying against *all* existing entries across every registry list to guarantee zero duplicates save-wide.

## 2. Regional Generation
*File: `src/utils/npcEngine.ts` (REGIONS constant)*
- Name generation maps specific first and last name banks by nationality (England, Spain, Brazil, Nigeria, Germany, France, Italy, Generic).
- Reuses the logic conceptually tied to the character creator, so foreign leagues and managers feel authentic.

## 3. Shared Personality Archetypes
*File: `src/utils/npcEngine.ts` (`NPCPersonalityArchetype`)*
- Global list: `DEMANDING`, `SUPPORTIVE`, `CALCULATING`, `VOLATILE`, `PROFESSIONAL`, `CHARISMATIC`, `SKEPTICAL`, `MENTOR`, `ENIGMATIC`, `JOKER`.
- System-specific mapping:
  - Managers lean `DEMANDING`.
  - Journalists lean `SKEPTICAL` and `PROVOCATEUR`.
  - Agents lean `SHARK` or `CALCULATING`.
  - Teammates select from `VOLATILE`, `SUPPORTIVE`, `PROFESSIONAL`, etc.

## 4. Scaled Attributes by Context
*File: `src/utils/npcEngine.ts` (`generatePlayer`)*
- Rivals and Teammates receive appropriate OVR and Potential bases (e.g. `targetOVR` param).
- Fills out all 22 specific player attributes dynamically centering around the `targetOVR`.

## 5. Cross-System Registry & Query Mechanism
*File: `src/utils/npcEngine.ts` (`getRegistry`)*
- Because it's an instance or singleton context (`UnifiedNPCEngine`), other systems like Journalist logic or Rumor Stream can query `engine.getRegistry().players` to see rivals and dynamically drop their names into text.

## 6. NPC Lifecycle & Persistence
- Can be tied to world state simulation (`worldSimulation.ts` and `careerSystems.ts`) where the engine adds new players via `generatePlayer(..., 'YOUTH')` at the end of the season.

---

## Retrofit Note
The following existing files/systems should be refactored to pull from `UnifiedNPCEngine`:
1. `src/utils/careerSystems.ts` (For teammate roster generation, replace local name gens with `engine.generatePlayer(...)`).
2. `src/utils/worldSimulation.ts` (When sacking/hiring managers, use `engine.generateManager(...)`).
3. `src/screens/Press.tsx` (When encountering Journalists, pick or generate via `engine.generateJournalist(...)`).
4. `src/screens/Transfers.tsx` (Agent generation via `engine.generateAgent(...)`).

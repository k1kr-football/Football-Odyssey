# Living World Simulation

## 1. Match Simulation
- **Frequency**: Every week, all fixtures in the simulated leagues are resolved.
- **Resolution Model**: Lightweight abstraction.
  - `Home Advantage` = +OVR modifier.
  - `Form` = momentum from last 5 matches.
  - `Base Probability` = derived from Home OVR vs Away OVR.
  - `Randomness` = 15% variance to allow upsets.
- Results update the League Tables for all six countries in the background.

## 2. Transfer Market Simulation
- **Continuous Operations**: Clubs constantly evaluate their squad depth and average OVR.
- If a club is missing a role (e.g. ST) or has a weak link:
  - They check their **Financial Health**.
  - If Stable/Secure, they "buy" a generated NPC from a lower tier club or free agency.
- **Player Sales**: Strained/Crisis clubs periodically "sell" top NPCs to balance books.
- These events feed into the **Rumor Stream** so the player sees the world reacting.

## 3. Managerial Changes
- Every club has a manager with an archetype (Loyalist, Pragmatist, etc.).
- When a club severely underperforms expectations (based on their Club Tier vs League Position):
  - **Pragmatist** managers are fired quicker.
  - **Loyalist** managers get more time.
- Upon firing, a new manager archetype is generated.
- This creates news items (e.g., "Chelsea sack manager, Pragmatist hired").

## 4. Rival NPC Careers
- Rivals generated from youth trials or the player's past also progress.
- Their stats improve based on their club's tier and their potential.
- Rivals can transfer clubs, win awards, or suffer long-term injuries.

## 5. Optimization
- Simulations run at the start of `nextWeek()` processing.
- Off-screen leagues are updated statically without saving full play-by-play logs to avoid save file bloat. Only the Standings, key transfers, and manager sackings are retained.

## 6. Worked Example: A Simulated Season
**Scenario**: The player is in League One. The Premier League simulates entirely in the background.
1. **August (Week 1-4)**: Chelsea (Elite, Secure) start poorly, losing 3 of their first 4 games. Form drops to -3.
2. **October (Week 10)**: Chelsea's bad run continues. Manager job security drops below 0.
3. **News Event**: "BREAKING: Chelsea has sacked their manager after a poor run of form."
4. **New Hire**: A 'Pragmatist' is hired. The pragmatist gets a 'New Manager Bounce' logic applied, resetting trust and increasing the home advantage modifier temporarily.
5. **January (Week 26)**: Transfer window opens. Chelsea, still financially 'Secure', are triggered by the simulation to bolster their squad.
6. **News Event**: "TRANSFER: Chelsea complete a massive £30m signing to bolster their squad."
7. **May (Week 52)**: The season concludes. Chelsea has recovered to 6th place thanks to the new manager and signings. Meanwhile, Everton, operating under 'Strained' finances, suffered an embargo in January, couldn't buy players, and were relegated in 18th place.

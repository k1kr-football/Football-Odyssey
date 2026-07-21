# Football Odyssey — League & Competition Structure Bible

This document serves as the absolute, single source of truth (SSOT) for the League and Competition Structures within **Football Odyssey**. All systems—including the Match Engine, World Simulation, Calendars, Reputation progressions, Transfer models, and International Careers—must refer to the rules, structures, and baselines defined herein.

---

## 1. Core Structural Tiers & Club-Strength Baselines

Club-strength classification dictates financial power (transfer and wage budgets), starting reputation, and scouting visibility. All simulated clubs in the six countries fall into one of these five tiers:

| Tier Name | Baseline OVR | Wage Budget Class | Transfer Budget Class | National Reputation | Global Reputation |
| :--- | :---: | :--- | :--- | :---: | :---: |
| **Elite** | 85 – 95 | Elite / Very High | Elite / Very High | 85 – 100 | 80 – 100 |
| **Strong** | 75 – 84 | High / Medium-High | High / Medium-High | 70 – 84 | 50 – 79 |
| **Mid** | 65 – 74 | Medium | Medium / Medium-Low | 50 – 69 | 20 – 49 |
| **Lower** | 55 – 64 | Medium-Low / Low | Low | 30 – 49 | 5 – 19 |
| **Foundation** | 40 – 54 | Low | Minimal | 10 – 29 | 0 – 4 |

---

## 2. Pyramid & Competition Structures (By Country)

### 🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENGLAND

The English pyramid is characterized by its high volume of matches, deep lower leagues, and dual domestic cups.

*   **Tiers Modelled:**
    *   **Tier 1: Premier League (PL)** — 20 Clubs. OVR: 70 – 94 (Elite to Mid).
    *   **Tier 2: Championship (CHA)** — 24 Clubs. OVR: 58 – 68 (Mid to Lower).
    *   **Tier 3: League One (L1)** — 24 Clubs. OVR: 48 – 57 (Lower to Foundation).
    *   **Tier 4: League Two (L2)** — 24 Clubs. OVR: 40 – 47 (Foundation).
*   **Promotion & Relegation:**
    *   **Tier 1 ⇄ Tier 2:** 3 Relegated from PL. 3 Promoted from CHA (Top 2 direct + 1 via Playoffs).
    *   **Tier 2 ⇄ Tier 3:** 3 Relegated from CHA. 3 Promoted from L1 (Top 2 direct + 1 via Playoffs).
    *   **Tier 3 ⇄ Tier 4:** 4 Relegated from L1. 4 Promoted from L2 (Top 3 direct + 1 via Playoffs).
*   **Domestic Cup Formats:**
    *   **FA Cup:** Single-legged knockout, open to all 4 tiers. 120-minute extra time & penalties if tied. Starts Week 20 (R3), Final Week 47.
    *   **EFL Cup (Carabao Cup):** Single-legged knockout. Semis are two-legged. Weeks 6 – 30.
*   **Continental Qualification (From Tier 1):**
    *   **Champions League:** 1st, 2nd, 3rd, 4th.
    *   **Europa League:** 5th + FA Cup Winner.
    *   **Conference League:** EFL Cup Winner (or 6th/7th in PL if cup winners already qualified).
*   **Season Calendar:**
    *   **Weeks 1 – 4:** Preseason & Friendlies.
    *   **Weeks 5 – 48:** Active Season (46 League matches for Tiers 2-4; 38 for Tier 1).
    *   **Winter Break:** None. (High fatigue/congestion period during Weeks 22 – 26).

---

### 🇪🇸 SPAIN

The Spanish pyramid places heavy emphasis on technical control and has a distinct cup format with a mid-season winter pause.

*   **Tiers Modelled:**
    *   **Tier 1: La Liga** — 20 Clubs. OVR: 68 – 93 (Elite to Mid).
    *   **Tier 2: Segunda División** — 22 Clubs. OVR: 55 – 66 (Mid to Lower).
*   **Promotion & Relegation:**
    *   **Tier 1 ⇄ Tier 2:** 3 Relegated from La Liga. 3 Promoted from Segunda (Top 2 direct + 1 via Playoffs).
*   **Domestic Cup Format:**
    *   **Copa del Rey:** Knockout tournament. Round of 32 onwards. Semifinals are two-legged. Starts Week 25, Final Week 45.
*   **Continental Qualification (From Tier 1):**
    *   **Champions League:** 1st, 2nd, 3rd, 4th.
    *   **Europa League:** 5th + Copa del Rey Winner.
    *   **Conference League:** 6th in La Liga.
*   **Season Calendar:**
    *   **Weeks 1 – 4:** Preseason & Friendlies.
    *   **Weeks 5 – 48:** Active Season (38 matches).
    *   **Winter Break:** Weeks 23 – 24 (Late December/Early January). Reset Fatigue by 25%.

---

### 🇮🇹 ITALY

The Italian structure features a highly tactical, defensive game engine profile with a streamlined domestic cup.

*   **Tiers Modelled:**
    *   **Tier 1: Serie A** — 20 Clubs. OVR: 67 – 90 (Elite to Mid).
    *   **Tier 2: Serie B** — 20 Clubs. OVR: 54 – 64 (Lower to Foundation).
*   **Promotion & Relegation:**
    *   **Tier 1 ⇄ Tier 2:** 3 Relegated from Serie A. 3 Promoted from Serie B (Top 2 direct + 1 via Playoff if gap between 3rd and 4th is under 14 points).
*   **Domestic Cup Format:**
    *   **Coppa Italia:** Direct single-legged knockout. Round of 16 entered by Elite clubs. Starts Week 22, Final Week 46.
*   **Continental Qualification (From Tier 1):**
    *   **Champions League:** 1st, 2nd, 3rd, 4th.
    *   **Europa League:** 5th + Coppa Italia Winner.
    *   **Conference League:** 6th in Serie A.
*   **Season Calendar:**
    *   **Weeks 1 – 4:** Preseason & Friendlies.
    *   **Weeks 5 – 48:** Active Season (38 matches).
    *   **Winter Break:** Week 23 (One week around Christmas). Reset Fatigue by 15%.

---

### 🇩🇪 GERMANY

The German pyramid is characterized by a high-intensity, high-pressing physical profile, a shorter 18-team league structure, and a deep winter hibernation.

*   **Tiers Modelled:**
    *   **Tier 1: Bundesliga** — 18 Clubs. OVR: 66 – 94 (Elite to Mid).
    *   **Tier 2: 2. Bundesliga** — 18 Clubs. OVR: 53 – 63 (Lower).
*   **Promotion & Relegation:**
    *   **Tier 1 ⇄ Tier 2:** 2 Relegated directly from Bundesliga. 1 Relegation Playoff (16th Bundesliga vs 3rd 2. Bundesliga). 2 Promoted directly from 2. Bundesliga.
*   **Domestic Cup Format:**
    *   **DFB-Pokal:** Pure single-elimination knockout. No replays. Starts Week 5 (Round 1), Final Week 47.
*   **Continental Qualification (From Tier 1):**
    *   **Champions League:** 1st, 2nd, 3rd, 4th.
    *   **Europa League:** 5th + DFB-Pokal Winner.
    *   **Conference League:** 6th in Bundesliga.
*   **Season Calendar:**
    *   **Weeks 1 – 4:** Preseason & Friendlies.
    *   **Weeks 5 – 48:** Active Season (34 matches).
    *   **Winter Break:** Weeks 21 – 24 (Four-week deep winter break). Reset Fatigue by 40%, sharpness decays by 15%.

---

### 🇫🇷 FRANCE

The French structure features physically elite youth development, defensive solid blocks, and an 18-team top flight.

*   **Tiers Modelled:**
    *   **Tier 1: Ligue 1** — 18 Clubs. OVR: 65 – 93 (Elite to Mid).
    *   **Tier 2: Ligue 2** — 18 Clubs. OVR: 51 – 62 (Lower).
*   **Promotion & Relegation:**
    *   **Tier 1 ⇄ Tier 2:** 2 Relegated directly from Ligue 1. 1 Relegation Playoff (16th Ligue 1 vs Winner of Ligue 2 playoffs). 2 Promoted directly from Ligue 2.
*   **Domestic Cup Format:**
    *   **Coupe de France:** Single-legged knockout. If tied at 90 minutes, goes straight to penalties (no extra time). Starts Week 26 (R64), Final Week 46.
*   **Continental Qualification (From Tier 1):**
    *   **Champions League:** 1st, 2nd, 3rd (Direct), 4th (Playoffs).
    *   **Europa League:** 5th + Coupe de France Winner.
    *   **Conference League:** 6th in Ligue 1.
*   **Season Calendar:**
    *   **Weeks 1 – 4:** Preseason & Friendlies.
    *   **Weeks 5 – 48:** Active Season (34 matches).
    *   **Winter Break:** Weeks 22 – 23. Reset Fatigue by 20%.

---

### 🇧🇷 BRAZIL

The Brazilian pyramid represents the South American calendar, featuring a highly congested schedule, high travel fatigue, and the unique Copa Libertadores.

*   **Tiers Modelled:**
    *   **Tier 1: Série A** — 20 Clubs. OVR: 65 – 83 (Strong to Mid).
    *   **Tier 2: Série B** — 20 Clubs. OVR: 52 – 64 (Lower).
*   **Promotion & Relegation:**
    *   **Tier 1 ⇄ Tier 2:** 4 Relegated directly from Série A. 4 Promoted directly from Série B.
*   **Domestic Cup Format:**
    *   **Copa do Brasil:** Two-legged knockout from the Round of 16 onwards. Away goals rule is NOT used. Starts Week 10, Final Week 42.
*   **Continental Qualification (From Tier 1):**
    *   **Copa Libertadores:** 1st, 2nd, 3rd, 4th, 5th, 6th (G-6).
    *   **Copa Sudamericana:** 7th, 8th, 9th, 10th, 11th, 12th.
*   **Season Calendar (South American Calendar Mapped to System Weeks):**
    *   **Weeks 1 – 4:** Preseason & Friendlies.
    *   **Weeks 5 – 48:** Active Season (38 matches). 
    *   **Winter Break:** None. High congestion due to midweek matches and continental travel (Fatigue multiplier is 1.15x for Brazilian clubs).

---

## 3. Continental Competitions Reference

Leagues feed clubs into three tiers of European or South American Continental competitions. The system schedules these midweek:

### UEFA Champions League (UCL)
*   **In-Game Name:** Champions League
*   **Participants:** Top 4 from ENG, ESP, ITA, GER; Top 3 from FRA.
*   **Schedules:** Midweek (Wednesday). Group Stage: Weeks 12, 14, 16, 20, 22, 24. Knockouts: Weeks 32, 34, 38, 40, 44, 46 (Final).
*   **Match Engine Modifier:** 1.1x Intensity, higher physical demand, 1.25x reputation bonus for ratings.

### UEFA Europa League (UEL)
*   **In-Game Name:** Europa League
*   **Participants:** 5th place + Domestic Cup Winner from ENG, ESP, ITA, GER, FRA.
*   **Schedules:** Midweek (Thursday). Same weeks as UCL.

### UEFA Conference League (UECL)
*   **In-Game Name:** Conference League
*   **Participants:** 6th place from ENG (or EFL Cup winner), ESP, ITA, GER; 6th from FRA.
*   **Schedules:** Midweek (Thursday). Same weeks as UCL.

### Copa Libertadores (CONMEBOL)
*   **In-Game Name:** Copa Libertadores
*   **Participants:** Top 6 from Brazil Série A.
*   **Schedules:** Midweek (Wednesday/Thursday). Group Stage: Weeks 12, 14, 18, 20, 24, 28. Knockouts: Weeks 34, 36, 40, 42, 44, 46.

---

## 4. Integration Note: Architectural Implementation

The following existing files in the codebase must be refactored or updated to load from and respect this Bible:

1.  **`src/utils/calendar.ts`**
    *   Currently, the calendar assumes English competition names (`FA Cup`, `EFL Cup`) and a rigid 38-match or 46-match template based only on string checks.
    *   **Refactoring Action:** Add a helper `getPyramidRules(country: string)` that returns the specific league size, domestic cup name, winter break weeks, and continental slots. Use this returned configuration to dynamically seed entries in `generateSeasonCalendar(club: Club)`.
    *   **Winter Break Implementation:** Insert `WINTER_BREAK` type events instead of matches during the designated weeks for Germany, Spain, Italy, and France. Modify the career progression week logic to reduce fatigue and decay sharpness during these weeks.

2.  **`src/utils/worldSimulation.ts`**
    *   Currently, `simulateWorldWeek` iterates over all leagues and pairs up teams blindly, ignoring country boundaries, regional cup calendars, and distinct winter breaks.
    *   **Refactoring Action:** Divide world simulation loops by country first. Check if the current week is a winter break week for a specific country; if so, skip simulating domestic matches for those clubs and instead run a fatigue recovery process.
    *   **Copa Libertadores and South American modifiers:** For Brazil Série A clubs, apply the 1.15x fatigue decay penalty in simulated match results, resulting in higher rotation requirements or late-season form drop-offs for heavy starters.

3.  **`src/utils/transfers.ts`**
    *   Currently, club gating uses rough global variables or flat metrics.
    *   **Refactoring Action:** Incorporate the OVR and reputation baseline boundaries when determining player market valuations. If a player in Tier 4 England (League Two, OVR baseline 40-47) is targeted by an Elite club, trigger an immediate massive transfer interest spike but require a strict reputation filter.

4.  **`src/utils/international.ts`**
    *   Currently, international selection pools are flat.
    *   **Refactoring Action:** Align selection priority with the league tier baselines. A player playing in Ligue 1 (France Tier 1) will have a significantly higher national team selection coefficient than a player with the same OVR playing in English League One (England Tier 3).

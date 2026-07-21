# Football Odyssey — Manager AI Decision Model Specification

This design document outlines the specification for the **Manager AI Decision Model** in *Football Odyssey*. It defines how manager NPCs (including the player’s active club manager) evaluate performance, distribute playing time, handle contract negotiations, and react to media/social events. 

To maintain high aesthetic standards and deeper gameplay immersion, **these archetypes are never exposed to the user via flat UI text labels (e.g., "Style: Loyalist")**. Instead, they must be dynamically discovered through contextual feedback, dialogue choices, and behavioral patterns.

---

## 1. Core Manager Archetypes

Each manager NPC is initialized with a dominant archetype that governs their decision-making algorithms. The archetype shapes how they weigh historical loyalty, immediate form, physical potential, or external noise.

```
       [Historical Loyalty / Seniority]
                      ▲
                      │         (Loyalist)
                      │
[Youth / Potential] ◄─┼─► [Recent Match Ratings / Stats]
                      │
         (Project     │         (Ruthless
         Builder)     ▼         Pragmatist)
                [Mood / Media / Chaos]
                     (Reactive/
                     Volatile)
```

### A. The Loyalist
*   **Aesthetic Vibe:** Traditional, father-figure, fiercely protective, slow to change.
*   **Core Logic:** Prioritizes squad harmony, hierarchy roles, seniority, and long-term club chemistry.
*   **Behavioral Rules:**
    *   **The Slump Pass:** If a veteran player has high historical trust, they will retain their starting spot even through a 5+ match slump (form < 60, recent match ratings < 6.0).
    *   **Anti-Noise Bias:** Strongly disapproves of transfer request threats, demanding meetings, or media outburst options. Will penalize relationship score by 1.5x compared to other managers.
    *   **Loyalty Reward:** Grants guaranteed match minutes if a player keeps head down and training metrics are solid, regardless of OVR rating gaps.
*   **Reluctance to Sell:** High servants (years at club >= 4) require an extra 40% premium on transfer bids for the manager to agree to sell.

### B. The Ruthless Pragmatist
*   **Aesthetic Vibe:** Analytical, cold, results-oriented, hyper-focused on efficiency.
*   **Core Logic:** Evaluates based strictly on recent match ratings, immediate form, and tactical instruction compliance.
*   **Behavioral Rules:**
    *   **Zero-Tolerance Benchings:** If a star player's last 3 match ratings average below 6.4, they are benched immediately for the next game.
    *   **Listings & Exiles:** Anyone whose performance averages below the team median for 6 consecutive weeks is automatically placed on the transfer list, regardless of reputation.
    *   **Form over Potential:** Prioritizes immediate OVR and Match Ratings over high potential (POT) or age. A 33-year-old OVR 78 will start over a 19-year-old POT 90/OVR 71 in every single high-stakes match.

### C. The Project Builder
*   **Aesthetic Vibe:** Visionary, patient, youth-focused, academy-obsessed.
*   **Core Logic:** Prioritizes physical potential progression, training performance, and long-term roster value.
*   **Behavioral Rules:**
    *   **Youth Acceleration:** Automatically allocates a minimum of 25% of match minutes to high-potential youth players (POT >= 85, age <= 21) in all league games, even if it sacrifices short-term results.
    *   **Training-Driven Selection:** A player who achieves a "Perfect" training performance (90+ rating) is guaranteed a starting spot or high sub minutes in the upcoming week.
    *   **Roster Sacrifice:** Highly willing to sell declining players (age >= 30) for below market value to open roster spots for youth.

### D. The Reactive/Volatile
*   **Aesthetic Vibe:** Unpredictable, mood-driven, sensational, sensitive to media pressure.
*   **Core Logic:** Decisions are heavily influenced by the most recent match result, journalist sentiments, and the player's public/social media conduct.
*   **Behavioral Rules:**
    *   **The Single-Match Trigger:** Prone to sudden benchings after a single match rating under 5.8 or an on-field red card/penalty conceded.
    *   **Journalist and Fan Puppet:** If local fans' morale or media perception is low (< 45), the manager will immediately alter the team's tactics or drop scapegoated players to appease the crowd.
    *   **Social Media Sensitive:** If the player suffers a "cancel risk" event on social media, this manager will immediately suspend them from squad selection for 2 weeks to "restore team reputation."

---

## 2. Bounded Irrationality Layer

To prevent the game from feeling like a sterile spreadsheet, managers operate with a **Bounded Irrationality** model. This introduces believable human errors, cognitive biases, and emotional volatility to their selection engines:

1.  **Sunk Cost Fallacy (The Star Bias):** 
    Managers will play newly signed expensive acquisitions (transfer fee in top 10% of league) for at least the first 10 matches of a season, even if their form is catastrophic and recent ratings are under 5.5.
2.  **Confirmation Bias (The Pet/Scapegoat Cycle):** 
    If a player starts their career under a manager with 3 consecutive "Excellent" matches (rating >= 7.8), they are flagged as a "Pet." The manager's threshold to bench them in future slumps decreases by 30%. Conversely, starting with 3 bad games flags them as a "Scapegoat," raising the required match rating to start in future weeks to an 8.0.
3.  **Tactical Stubbornness:** 
    During a losing streak (3+ consecutive losses), a manager has a 40% chance of locking their tactical style (refusing to change systems or rotate) out of pure stubbornness, resulting in high squad fatigue and tension before they finally break.
4.  **Sudden Ultimatum:** 
    A manager facing high pressure (pressure >= 80) has a 15% weekly chance of issuing a sudden, highly demanding promise to the player (e.g., "Score in the next 2 games or lose your spot entirely"), driven by their own fear of getting sacked.

---

## 3. Discoverable Contextual Flavor (Zero-UI Design)

Instead of cheap UI text tags, the manager's archetype is elegantly communicated to the player through distinct narrative vectors:

### I. Dynamic Inbox Messages & Feedback
*   **The Loyalist:** *"I don't care what the papers are writing, son. You've earned your stripes at this club. Put your head down, block the noise, and you'll be on that pitch Saturday."*
*   **The Ruthless Pragmatist:** *"We look at data, not names. Your recent contribution level has dropped below the line. You will begin this weekend on the bench. Show me you can meet our standards in training."*
*   **The Project Builder:** *"I can see what you are becoming. The path to greatness isn't linear, but you have the raw profile. I am giving you the start because you're the future of this midfield."*
*   **The Reactive/Volatile:** *"The atmosphere around you is toxic right now. The fans are calling for changes after that display. I cannot risk starting you under this kind of heat. We're rotating."*

### II. Press Conference Responses
*   **Loyalist:** Defends players publicly, always takes the blame for defeats, emphasizes "trust in the dressing room."
*   **Pragmatist:** Gives short, analytical answers, lists player stats, mentions "tactical execution percentages" and "performance baselines."
*   **Project Builder:** Discusses progress, youth development, patience, and "squad progression milestones."
*   **Reactive:** Shifts blame onto players after defeats, responds defensively to aggressive journalists, and changes tone depending on whether the team won or lost.

### III. Dynamic Dialogue Choices in Crucial Moments
When requesting more playing time or discussing a transfer request, the player's choices should yield wildly different outcomes depending on the manager's hidden archetype:

```
                  ┌───────────────────────────────┐
                  │ Player Requests Playing Time  │
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
[Appeal to Loyalty]                                [Demand on Stats/Ratings]
  - Loyalist: Trust +10, Starts                     - Loyalist: Trust -5, Refuses
  - Pragmatist: Trust -5, Refuses                   - Pragmatist: Trust +10, Starts
```

---

## 4. Technical Specification: Schema & Logic Engines

### I. TypeScript State Interfaces

To implement this model, we extend the manager's data structure to track hidden archetypal fields, emotional variables, and biases.

```typescript
export type ManagerArchetypeType = 'LOYALIST' | 'RUTHLESS_PRAGMATIST' | 'PROJECT_BUILDER' | 'REACTIVE_VOLATILE';

export interface ManagerAIState {
  id: string;
  name: string;
  archetype: ManagerArchetypeType;
  baseTactics: 'Gegenpress' | 'Tiki-Taka' | 'Low Block' | 'Direct Counter';
  currentTactics: string;
  
  // Relations and trust indexes
  globalTrust: number; // 0 - 100
  disciplineFactor: number; // 0 - 100
  moodModifier: number; // -20 to +20, volatile managers swing wildly
  
  // Bounded Irrationality Flags
  favorites: string[]; // Player IDs flagged as "Pets"
  scapegoats: string[]; // Player IDs flagged as "Scapegoats"
  consecutiveDefeatsCount: number;
  stubbornnessLock: boolean;
  
  // Historical stats
  seasonPurchasesValuationSum: number;
  youthMinutesRatio: number;
}
```

### II. Core Selection Formula (Starting Probability)

Each week, before a match, the Selection Engine calculates a **Starting Selection Coefficient (SSC)** for the player. If the SSC exceeds a threshold (typically 65), the player starts the match.

$$\text{SSC} = (W_{\text{OVR}} \times \text{OVR}) + (W_{\text{Form}} \times \text{Form}) + (W_{\text{Trust}} \times \text{Trust}) + (W_{\text{Age}} \times \text{AgeModifier}) + \text{IrrationalityBias}$$

The weights ($W$) differ drastically by manager archetype, modeling their specific personalities mathematically:

| Weight / Modifier | Loyalist | Ruthless Pragmatist | Project Builder | Reactive / Volatile |
| :--- | :---: | :---: | :---: | :---: |
| $W_{\text{OVR}}$ (Raw Rating) | 0.40 | 0.15 | 0.10 | 0.30 |
| $W_{\text{Form}}$ (Recent Performance) | 0.10 | 0.55 | 0.20 | 0.40 |
| $W_{\text{Trust}}$ (Manager Relationship) | 0.40 | 0.25 | 0.20 | 0.10 |
| $W_{\text{Age}}$ (Age/Potential Ratio) | -0.10 | 0.05 | 0.50 | 0.00 |
| $\text{MoodSwing}$ (Variance/Chaos) | 0.02 | 0.00 | 0.05 | 0.35 |

#### 1. The Project Builder Age Modifier
For a Project Builder, younger age combined with high potential increases starting probability:
$$\text{AgeModifier} = \max\left(0, \frac{\text{Potential} - \text{OVR}}{2} \times \max\left(0, 24 - \text{Age}\right)\right)$$

#### 2. The Loyalist Seniority Shield
For a Loyalist, long service safeguards the player from form drops:
$$\text{SeniorityShield} = \max(0, \text{YearsAtClub} \times 4.5)$$
*(Applied as an additive bonus if Form drops below 60, neutralizing the normal selection penalty).*

#### 3. Reactive/Volatile Media Swing
For a Volatile manager, the selection is heavily affected by public metrics:
$$\text{MediaSwing} = (\text{MediaPerception} - 50) \times 0.4 + (\text{CancelRisk} \times -0.6)$$

### III. Trust Decelerator / Accelerator Equations

The rate at which a manager gains or loses trust based on the player's behavior is scaled by the archetype's modifier.

#### 1. Media Outburst Penalty
When a player speaks negatively to the press, the relationship drop is calculated as:
$$\Delta\text{Trust} = -\text{Severity} \times K_{\text{outburst}}$$

*   **Loyalist:** $K_{\text{outburst}} = 2.0$ *(Severe breach of dressing room code).*
*   **Pragmatist:** $K_{\text{outburst}} = 1.0$ *(Dislikes distraction, but tolerates if performance is high).*
*   **Project Builder:** $K_{\text{outburst}} = 1.2$ *(Worried about squad cohesion/influence on youth).*
*   **Reactive/Volatile:** $K_{\text{outburst}} = 2.5$ *(Panics due to media blowback, heavily penalizes player).*

#### 2. Performance Feedback Loop
When a player obtains a low match rating (e.g., Rating < 6.0), the Trust decrement is:
$$\Delta\text{Trust} = (6.0 - \text{Rating}) \times 10 \times K_{\text{perf}}$$

*   **Loyalist:** $K_{\text{perf}} = 0.3$ *(Slow to judge, shields player from single-match drops).*
*   **Pragmatist:** $K_{\text{perf}} = 2.0$ *(Extremely punishing. Instant trust loss).*
*   **Project Builder:** $K_{\text{perf}} = 0.8$ *(Tolerates mistakes as learning experiences).*
*   **Reactive/Volatile:** $K_{\text{perf}} = 2.5$ *(Overreacts immediately, resulting in huge drops).*

## 6. Worked Example: The Poor Form Scenario
**Scenario**: The player has averaged a 5.5 match rating over the last 4 games.
- **Under a Loyalist Manager**: The manager weighs tenure heavily. If the player has been at the club for 2 seasons and started well, the Loyalist's trust drops by only 5 points. Dialogue: *"You've been off the pace recently, but I know what you can do. You're starting next match. Don't make me regret it."*
- **Under a Ruthless Pragmatist Manager**: The manager weighs recent form almost exclusively. Trust plummets by 15 points. Dialogue: *"I don't care what you did last month. Your recent numbers are unacceptable. You're dropped to the bench until you prove you want to wear this shirt."*

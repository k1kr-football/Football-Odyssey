# Club Financial Simulation

## 1. Revenue Streams
Every club generates revenue scaled by their tier and league reputation:
- **Matchday Revenue**: Driven by stadium capacity, ticket prices, and average attendance (influenced by recent form/momentum).
- **TV/Broadcast Rights**: Flat rate based on the league and tier. Sharp step-changes exist between tiers (e.g. huge jump from Championship to Premier League).
- **Sponsorship/Commercial Revenue**: Influenced by Club Global Reputation. Elite clubs have massive commercial deals.
- **Transfer Trading Income**: Revenue from selling players. Essential for 'Mid' or 'Lower' tier clubs to balance the books.

## 2. Spending Categories
- **Wage Bill**: Weekly/Monthly salaries paid to players and staff. This is usually the largest fixed cost.
- **Transfer Fee Spending**: Amortized or upfront costs of buying players.
- **Infrastructure Investment**: Upgrading facilities, youth academy, or stadium capacity.

## 3. Financial Health Status
Derived from (Revenue + Cash Reserves) - (Wage Bill + Transfer Costs + Debt Payments):
- **Secure**: Massive reserves. Can afford elite wages and record transfers without selling.
- **Stable**: Breaking even or slight surplus. Can make moderate signings but usually needs to balance the books with sales if making a big splash.
- **Strained**: Operating at a loss, depleting reserves. Cannot increase the wage bill; forced to accept reasonable offers for key players.
- **Crisis**: Deep in debt. Transfer embargoes enforced. Wage ceiling drastically cut. Forced fire-sales.

## 4. Financial Fair Play (FFP) Constraints
- A rolling 3-season deficit limit.
- Consequences for breach:
  - 1st Offense: Fine and warning.
  - 2nd Offense: Transfer embargo (can only sign free agents/loans).
  - 3rd Offense: Points deduction (e.g. -9 points).
  - 4th Offense: Relegation.

## 5. Player/Transfer Market Interaction
- A club's Transfer Budget = (Annual Revenue * Budget % based on owner) + Reserves - Current Wage Bill.
- A club in **Strained** or **Crisis** status will:
  - Refuse to offer improved contracts to the player.
  - Automatically place the player on the transfer list if the player's value is high.
  - Fail to sign the player even with "High Interest" if their remaining wage budget cannot accommodate the player's demands.


## 6. Worked Example: Financial Decline
**Scenario**: A Mid-Tier club (e.g. Everton) overspends on wages to push for European qualification.
1. **Season 1**: Wage bill exceeds 85% of revenue. Financial Health shifts from STABLE to STRAINED. Transfer budget is heavily cut.
2. **Season 2**: The club fails to qualify for Europe, missing the TV/Broadcast revenue bump. The massive wage bill remains. Cash reserves drop below 0. FFP Ratio hits 0.90.
3. **Status Update**: Health changes to CRISIS.
4. **Consequences**:
   - Transfer embargo applied (can no longer buy players).
   - "Forced Fire Sale" mode activated. The Living World simulation starts selling off their top-OVR players.
   - Wage ceiling is slashed to 6% of revenue. The club cannot offer contract renewals.
5. **Season 3**: Consecutive FFP breaches hit 8 weeks. A -6 points deduction is applied by the regulatory board, leading to their relegation.

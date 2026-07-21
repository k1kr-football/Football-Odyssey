# Core Formulas & Balance Bible

## 1. OVR Calculation
*File: `src/utils/coreFormulas.ts` (CoreFormulas.calculateOVR)*
- Strikers (`ST`, `CF`): Heavily weights Finishing (4x), Pace (2x), Positioning (2x).
- Wingers (`W`, `LM`, `RM`): Weights Pace (3x), Dribbling (3x), Crossing (2x).
- Center Mids (`CM`, `CAM`): Weights Passing (3x), Vision (3x), Dribbling (2x).
- Defensive Mids (`CDM`): Weights Tackling (2x), Stamina (2x), Passing (2x), Positioning (2x).
- Fullbacks (`FB`, `WB`): Weights Pace (2x), Stamina (2x), Crossing (2x), Tackling (2x).
- Center Backs (`CB`): Weights Tackling (3x), Strength (2x), Positioning (2x), Heading (2x).
- Goalkeepers (`GK`): Weights Positioning (4x), Decision Making (3x), Composure (2x).

## 2. Attribute Check Success Probability
*File: `src/utils/coreFormulas.ts` (CoreFormulas.calculateSuccessProbability)*
- Base chance is 60% when `Player Attribute == Baseline Difficulty`.
- Scales by `±2%` per point of difference.
- Modifiers:
  - **Difficulty Tier**: Casual `+15%`, Realistic `-15%`.
  - **Stamina**: `<30%` stamina imposes a `-10%` penalty.
  - **Match Pressure**: High Pressure `-5%`, Low Pressure `+5%`.
  - **Weather**: Rain `-5%`, Snow `-10%`.
- Hard-capped between `5%` and `95%`.

## 3. Training Gains
*File: `src/utils/coreFormulas.ts` (CoreFormulas.calculateTrainingGain)*
- Applies multipliers to a base drill gain:
  - **Age Curve**: `<20` (1.5x), `20-23` (1.2x), `24-30` (1.0x), `>30` (0.5x), `>34` (0.2x).
  - **Difficulty Tier**: Casual (1.5x), Standard (1.0x), Realistic (0.7x).
  - **Diminishing Returns**: Gain halves (0.5x) when within 3 points of potential.
  - **Spam Cap**: Reusing same drill/stat extensively drops gain to 20% (0.2x).

## 4. Reputation & Trust Deltas
*File: `src/utils/coreFormulas.ts` (CoreFormulas.calculateTrustDelta, calculateReputationDelta)*
- **Manager Trust**: Match Rating >=9.0 (`+6`), >=8.0 (`+4`), >=7.0 (`+2`), >=6.0 (`0`), >=5.0 (`-2`), else (`-5`).
- **Reputation**: Event Magnitude scales deltas (LARGE: ±5, MEDIUM: ±2, SMALL: ±1).

## 5. Injury Probability
*File: `src/utils/coreFormulas.ts` (CoreFormulas.calculateInjuryProbability)*
- Base risk is 1% per check.
- **Fatigue Modifier**: Adds up to 5% based on fatigue (0-100 scale).
- **Susceptibility**: ±1% per point deviance from average (3).
- **Age**: Adds 2% if over 30.
- **Difficulty**: Realistic (1.3x), Casual (0.7x).

## 6. Financial Formulas
*File: `src/utils/coreFormulas.ts` (CoreFormulas.calculateWageOffer, calculateTransferFee)*
- **Wages**: Base ranges from £1,000 to £100,000 depending on OVR brackets. Multiplied by Club Tier (up to 2.0x for ELITE) and Player Reputation bonus.
- **Transfers**: Base value from £1M to £100M based on OVR. Modified by Age (young=1.5x, old=0.3x), Contract Length (<1 yr=0.6x), and Buyer Tier Tax (Elite=1.2x).

---

## Retrofit Note
The following existing files/systems should be refactored to pull from `CoreFormulas`:
1. `src/screens/Training.tsx` (Use `calculateTrainingGain`).
2. `src/screens/MatchEngine.tsx` (Use `calculateSuccessProbability` for action checks and `calculateInjuryProbability` for injuries).
3. `src/utils/seasonObjectives.ts` (Check manager trust using `calculateTrustDelta` concepts).
4. `src/screens/Transfers.tsx` (Use `calculateWageOffer` and `calculateTransferFee`).

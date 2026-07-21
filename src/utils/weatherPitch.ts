import { WeatherCondition, PitchCondition, Club } from '../types';
import { CLUBS } from '../data/teams';

export interface WeatherPitchPreset {
  weather: WeatherCondition;
  pitch: PitchCondition;
  tempCelsius: number;
  commentaryHook: string;
}

/**
 * Gets the month of the season based on the current week.
 * Assumes a 40-week season starting in August.
 */
export function getSeasonMonth(week: number): 'AUGUST' | 'OCTOBER' | 'DECEMBER' | 'FEBRUARY' | 'APRIL' | 'JUNE' {
  if (week <= 6) return 'AUGUST';
  if (week <= 14) return 'OCTOBER';
  if (week <= 22) return 'DECEMBER';
  if (week <= 30) return 'FEBRUARY';
  if (week <= 38) return 'APRIL';
  return 'JUNE';
}

/**
 * Generates realistic weather and pitch conditions based on the hosting club's country and week.
 */
export function generateWeatherAndPitch(clubSymbol: string, week: number): WeatherPitchPreset {
  const club = CLUBS.find(c => c.symbol === clubSymbol);
  const country = club ? club.country : 'England';
  const month = getSeasonMonth(week);

  let wType: WeatherCondition['type'] = 'CLOUDY';
  let pType: PitchCondition['type'] = 'PERFECT';
  let tempCelsius = 15;
  let commentaryHook = 'A standard afternoon for football.';

  const rand = Math.random();

  if (country === 'England' || country === 'Scotland') {
    if (month === 'AUGUST' || month === 'JUNE') {
      tempCelsius = Math.floor(Math.random() * 8) + 18; // 18-26C
      if (rand < 0.6) {
        wType = 'SUNNY';
        pType = 'PERFECT';
        commentaryHook = 'Bright sunshine covers the stadium. The pitch has been watered pre-kickoff.';
      } else if (rand < 0.85) {
        wType = 'CLOUDY';
        pType = 'PERFECT';
        commentaryHook = 'Overcast skies but warm temperatures. Excellent playing surface.';
      } else {
        wType = 'LIGHT_RAIN';
        pType = 'SLIGHTLY_WET';
        commentaryHook = 'A light English summer drizzle slickens the turf. The ball will skid.';
      }
    } else if (month === 'OCTOBER' || month === 'APRIL') {
      tempCelsius = Math.floor(Math.random() * 8) + 9; // 9-17C
      if (rand < 0.3) {
        wType = 'CLOUDY';
        pType = 'PERFECT';
        commentaryHook = 'Cool and breezy. Standard autumn conditions.';
      } else if (rand < 0.55) {
        wType = 'LIGHT_RAIN';
        pType = 'SLIGHTLY_WET';
        commentaryHook = 'Rain slickens the turf. Ball circulation will be fast.';
      } else if (rand < 0.75) {
        wType = 'WINDY';
        pType = 'PERFECT';
        commentaryHook = 'Strong gusts of wind are whipping across the stands. Long ball projection will be difficult.';
      } else if (rand < 0.9) {
        wType = 'HEAVY_RAIN';
        pType = 'MUDDY';
        commentaryHook = 'Torrential rain turns the touchlines muddy. A real physical slugfest awaits.';
      } else {
        wType = 'FOG';
        pType = 'SLIGHTLY_WET';
        commentaryHook = 'Thick mist descends onto the pitch. Pundits in the gantry are struggling with visibility.';
      }
    } else {
      // Winter (December, February)
      tempCelsius = Math.floor(Math.random() * 7) + 1; // 1-8C
      if (rand < 0.25) {
        wType = 'CLOUDY';
        pType = 'SLIGHTLY_WET';
        commentaryHook = 'Biting cold under floodlights. Gaffer is wrapped in a heavy trench coat.';
      } else if (rand < 0.5) {
        wType = 'HEAVY_RAIN';
        pType = 'WATERLOGGED';
        commentaryHook = 'Waterlogged surface in freezing winter rain. This is going to test technical foundations.';
      } else if (rand < 0.7) {
        wType = 'FOG';
        pType = 'MUDDY';
        commentaryHook = 'A classic frozen winter fog. Short passes are highly recommended.';
      } else if (rand < 0.85) {
        wType = 'WINDY';
        pType = 'SLIGHTLY_WET';
        commentaryHook = 'Swirling icy winds. Goalkeepers will hate dealing with crosses today.';
      } else {
        wType = 'SNOW';
        pType = 'FROZEN';
        commentaryHook = 'Snow is actively falling! Ground staff have cleared lines with orange balls at the ready.';
      }
    }
  } else if (country === 'Spain' || country === 'Italy') {
    if (month === 'AUGUST' || month === 'JUNE') {
      tempCelsius = Math.floor(Math.random() * 10) + 28; // 28-38C (Extreme heat!)
      if (rand < 0.85) {
        wType = 'SUNNY';
        pType = 'PERFECT';
        commentaryHook = 'Basking in absolute Mediterranean heat. Sweat dripping before warmups are finished. Rapid fatigue risk.';
      } else {
        wType = 'CLOUDY';
        pType = 'PERFECT';
        commentaryHook = 'Extremely humid and heavy air. Gearing up for a slow-tempo tactical clash.';
      }
    } else if (month === 'OCTOBER' || month === 'APRIL') {
      tempCelsius = Math.floor(Math.random() * 8) + 16; // 16-24C
      wType = rand < 0.7 ? 'SUNNY' : rand < 0.9 ? 'CLOUDY' : 'LIGHT_RAIN';
      pType = wType === 'LIGHT_RAIN' ? 'SLIGHTLY_WET' : 'PERFECT';
      commentaryHook = wType === 'SUNNY' ? 'Gorgeous sunny weather, perfect for a high-tempo display.' : 'Mild temperatures and light cloud cover.';
    } else {
      // Winter
      tempCelsius = Math.floor(Math.random() * 8) + 8; // 8-16C
      if (rand < 0.5) {
        wType = 'CLOUDY';
        pType = 'PERFECT';
        commentaryHook = 'Cool evening under clear, crisp skies.';
      } else if (rand < 0.8) {
        wType = 'LIGHT_RAIN';
        pType = 'SLIGHTLY_WET';
        commentaryHook = 'Slick pitch, favoring elegant touch play.';
      } else {
        wType = 'WINDY';
        pType = 'PERFECT';
        commentaryHook = 'Gusty conditions, but the pitch remains in immaculate shape.';
      }
    }
  } else {
    // Germany / France (Moderate, snowy winters)
    if (month === 'AUGUST' || month === 'JUNE') {
      tempCelsius = Math.floor(Math.random() * 8) + 21; // 21-29C
      wType = rand < 0.65 ? 'SUNNY' : rand < 0.9 ? 'CLOUDY' : 'LIGHT_RAIN';
      pType = wType === 'LIGHT_RAIN' ? 'SLIGHTLY_WET' : 'PERFECT';
      commentaryHook = 'Pleasant summer conditions. Pitch looks like a carpet.';
    } else if (month === 'OCTOBER' || month === 'APRIL') {
      tempCelsius = Math.floor(Math.random() * 8) + 11; // 11-19C
      wType = rand < 0.45 ? 'CLOUDY' : rand < 0.75 ? 'LIGHT_RAIN' : 'WINDY';
      pType = wType === 'LIGHT_RAIN' ? 'SLIGHTLY_WET' : 'PERFECT';
      commentaryHook = 'Overcast and crisp. Perfect environment for high-intensity play.';
    } else {
      // Cold winter
      tempCelsius = Math.floor(Math.random() * 8) - 1; // -1 to 7C
      if (rand < 0.4) {
        wType = 'CLOUDY';
        pType = 'FROZEN';
        commentaryHook = 'Freezing temperature. Hard, slippery turf with some visible frost patches.';
      } else if (rand < 0.7) {
        wType = 'SNOW';
        pType = 'FROZEN';
        commentaryHook = 'A picturesque snow-covered arena. Ground staff working overtime.';
      } else {
        wType = 'HEAVY_RAIN';
        pType = 'MUDDY';
        commentaryHook = 'Heavy freezing rain turns the middle corridor muddy. Strength and leverage are key.';
      }
    }
  }

  // 3. Complete modifier mapping based on Weather Type
  let wIcon = '⛅';
  let wDesc = 'Normal conditions.';
  let wMods = { passing: 0, dribbling: 0, pace: 0, injuryRisk: 0, vision: 0, crossing: 0 };

  switch (wType) {
    case 'SUNNY':
      wIcon = '☀️';
      wDesc = tempCelsius > 32 ? 'Extreme heat. Fatigue rate elevated.' : 'Clear and bright skies.';
      wMods = { passing: 0, dribbling: 0, pace: 5, injuryRisk: 0, vision: 0, crossing: 0 };
      break;
    case 'CLOUDY':
      wIcon = '⛅';
      wDesc = 'Calm and overcast skies.';
      wMods = { passing: 0, dribbling: 0, pace: 0, injuryRisk: 0, vision: 0, crossing: 0 };
      break;
    case 'LIGHT_RAIN':
      wIcon = '🌧️';
      wDesc = 'Drizzle. Fast turf, ball slides rapidly.';
      wMods = { passing: -4, dribbling: 5, pace: 0, injuryRisk: 3, vision: 0, crossing: 0 };
      break;
    case 'HEAVY_RAIN':
      wIcon = '🌧️🌧️';
      wDesc = 'Heavy downpour. Impeded sightlines, slipping hazard.';
      wMods = { passing: -12, dribbling: -6, pace: -10, injuryRisk: 14, vision: -5, crossing: 0 };
      break;
    case 'SNOW':
      wIcon = '❄️';
      wDesc = 'Snowing. Low visibility, treacherous footing.';
      wMods = { passing: -16, dribbling: -8, pace: -14, injuryRisk: 18, vision: -10, crossing: -8 };
      break;
    case 'WINDY':
      wIcon = '💨';
      wDesc = 'Swirling wind. High balls are unpredictable.';
      wMods = { passing: -5, dribbling: 0, pace: 0, injuryRisk: 0, vision: 0, crossing: -15 };
      break;
    case 'FOG':
      wIcon = '🌫️';
      wDesc = 'Low visibility. Vision severely reduced.';
      wMods = { passing: -8, dribbling: 0, pace: 0, injuryRisk: 2, vision: -20, crossing: 0 };
      break;
  }

  // 4. Complete modifier mapping based on Pitch Type
  let pIcon = '🟩';
  let pDesc = 'Firm playing turf.';
  let pMods = { pace: 0, dribbling: 0, passing: 0, injuryRisk: 0 };

  switch (pType) {
    case 'PERFECT':
      pIcon = '🟩';
      pDesc = 'Firm, well-groomed pitch. Great for speedy players.';
      pMods = { pace: 5, dribbling: 0, passing: 2, injuryRisk: 0 };
      break;
    case 'SLIGHTLY_WET':
      pIcon = '🟨';
      pDesc = 'Soft, damp pitch. Ball moves fast.';
      pMods = { pace: 0, dribbling: 4, passing: 4, injuryRisk: 4 };
      break;
    case 'WATERLOGGED':
      pIcon = '🟫';
      pDesc = 'Waterlogged. Ball stops dead, sliding risks.';
      pMods = { pace: -15, dribbling: -12, passing: -15, injuryRisk: 18 };
      break;
    case 'MUDDY':
      pIcon = '🟫🟫';
      pDesc = 'Soft and worn mud. Strength is critical, pace reduces.';
      pMods = { pace: -12, dribbling: -5, passing: -6, injuryRisk: 15 };
      break;
    case 'FROZEN':
      pIcon = '⬜';
      pDesc = 'Hard ice. Slips are common, high physical toll.';
      pMods = { pace: -18, dribbling: -15, passing: -4, injuryRisk: 22 };
      break;
  }

  const weather: WeatherCondition = {
    type: wType,
    icon: wIcon,
    description: wDesc,
    modifiers: wMods
  };

  const pitch: PitchCondition = {
    type: pType,
    icon: pIcon,
    modifiers: pMods
  };

  return {
    weather,
    pitch,
    tempCelsius,
    commentaryHook
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeamColors {
  primary: string;
  secondary: string;
  textOnPrimary: string;
  accent: string;
}

const colorMap: Record<string, TeamColors> = {
  // ENGLAND - PREMIER LEAGUE
  MCY: { primary: '#6CABDD', secondary: '#1C2C5B', textOnPrimary: '#FFFFFF', accent: '#FEBE10' }, // Man City (Sky Blue, Navy, Gold accent)
  ARS: { primary: '#EF0107', secondary: '#063672', textOnPrimary: '#FFFFFF', accent: '#D1AC00' }, // Arsenal (Red, White/Royal Blue, Gold accent)
  LIV: { primary: '#C8102E', secondary: '#00B06F', textOnPrimary: '#FFFFFF', accent: '#F6EB61' }, // Liverpool (Red, Green, Yellow/Gold accent)
  CHE: { primary: '#034694', secondary: '#EE242C', textOnPrimary: '#FFFFFF', accent: '#F7A700' }, // Chelsea (Blue, Red, Yellow accent)
  MUN: { primary: '#DA291C', secondary: '#000000', textOnPrimary: '#FFFFFF', accent: '#FBE122' }, // Man United (Red, Black, Yellow accent)
  NEW: { primary: '#241F20', secondary: '#41B6E6', textOnPrimary: '#FFFFFF', accent: '#41B6E6' }, // Newcastle (Black, Sky Blue, Sky Blue accent)
  TOT: { primary: '#132257', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#C8102E' }, // Tottenham (Navy, White, Red accent)
  AVL: { primary: '#95BFE5', secondary: '#670E36', textOnPrimary: '#000000', accent: '#FEE500' }, // Aston Villa (Sky Blue, Claret, Yellow accent)
  BHA: { primary: '#0057B8', secondary: '#FFCD00', textOnPrimary: '#FFFFFF', accent: '#FFCD00' }, // Brighton (Blue, White, Yellow accent)
  WHU: { primary: '#7A263A', secondary: '#1BB1E7', textOnPrimary: '#FFFFFF', accent: '#1BB1E7' }, // West Ham (Claret, Sky Blue, Sky Blue accent)
  FUL: { primary: '#000000', secondary: '#CC2821', textOnPrimary: '#FFFFFF', accent: '#CC2821' }, // Fulham (Black, Grey, Red accent)
  BRE: { primary: '#E30613', secondary: '#161214', textOnPrimary: '#FFFFFF', accent: '#FBD011' }, // Brentford (Red, Black, Gold accent)
  CRY: { primary: '#1B458F', secondary: '#C4122E', textOnPrimary: '#FFFFFF', accent: '#FBD01F' }, // Crystal Palace (Blue, Red, Gold accent)
  WOL: { primary: '#FDB913', secondary: '#231F20', textOnPrimary: '#000000', accent: '#FDB913' }, // Wolves (Gold/Orange, Black, Black accent)
  EVE: { primary: '#004890', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#004890' }, // Everton (Royal Blue, White, Blue accent)
  NFO: { primary: '#DD0000', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#DD0000' }, // Nottingham Forest (Red, White)
  BOU: { primary: '#B50E12', secondary: '#000000', textOnPrimary: '#FFFFFF', accent: '#B50E12' }, // Bournemouth (Red, Black)
  LEI: { primary: '#003090', secondary: '#FDBE11', textOnPrimary: '#FFFFFF', accent: '#FDBE11' }, // Leicester (Blue, Yellow)
  IPS: { primary: '#0000FF', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#FF0000' }, // Ipswich (Blue, White, Red)
  SOU: { primary: '#D71920', secondary: '#130C0E', textOnPrimary: '#FFFFFF', accent: '#F7A700' }, // Southampton (Red, Dark Grey, Gold)

  // ENGLAND - CHAMPIONSHIP
  LEE: { primary: '#0000FF', secondary: '#FFCD00', textOnPrimary: '#FFFFFF', accent: '#FFCD00' }, // Leeds (Blue, Yellow)
  BUR: { primary: '#6C1D45', secondary: '#81B3DF', textOnPrimary: '#FFFFFF', accent: '#81B3DF' }, // Burnley (Claret, Sky Blue)
  SHU: { primary: '#E30613', secondary: '#000000', textOnPrimary: '#FFFFFF', accent: '#FCD01F' }, // Sheffield United (Red, Black)
  MID: { primary: '#E30613', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#0000FF' }, // Middlesbrough (Red, Blue)
  NOR: { primary: '#FFF200', secondary: '#00A650', textOnPrimary: '#000000', accent: '#00A650' }, // Norwich (Yellow, Green)
  SUN: { primary: '#FF0000', secondary: '#000000', textOnPrimary: '#FFFFFF', accent: '#D4B55B' }, // Sunderland (Red, Black, Gold)
  WBA: { primary: '#122F67', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#E30613' }, // West Brom (Navy, White, Red)
  COV: { primary: '#81B3E2', secondary: '#130C0E', textOnPrimary: '#000000', accent: '#130C0E' }, // Coventry (Sky Blue, Black)
  MIL: { primary: '#001A4E', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#001A4E' }, // Millwall (Navy, White)
  WAT: { primary: '#FBEE23', secondary: '#111111', textOnPrimary: '#000000', accent: '#ED2124' }, // Watford (Yellow, Black, Red)
  BRI: { primary: '#C51318', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#C51318' }, // Bristol City (Red)
  HUL: { primary: '#F68E1E', secondary: '#000000', textOnPrimary: '#000000', accent: '#F68E1E' }, // Hull (Amber, Black)
  QPR: { primary: '#0054A6', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#0054A6' }, // QPR (Blue, White)
  STO: { primary: '#E03A3E', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#E03A3E' }, // Stoke City (Red)
  PRE: { primary: '#000040', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#000040' }, // Preston (Deep Blue)
  BLA: { primary: '#0054A1', secondary: '#D10915', textOnPrimary: '#FFFFFF', accent: '#D10915' }, // Blackburn (Blue, Red)
  SWA: { primary: '#121212', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#C9A84C' }, // Swansea (White/Black, Gold)
  DER: { primary: '#101010', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#888888' }, // Derby (White/Black, Grey)
  CAR: { primary: '#0000FF', secondary: '#FFFF00', textOnPrimary: '#FFFFFF', accent: '#FFFF00' }, // Cardiff (Blue, Yellow)
  PLY: { primary: '#00523C', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#FEBE10' }, // Plymouth (Green, Gold)

  // LOWER/STARTERS
  BIR: { primary: '#0000FF', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#0000FF' }, // Birmingham (Blue)
  WRE: { primary: '#C8102E', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#C8102E' }, // Wrexham (Red)
  WIG: { primary: '#0000FF', secondary: '#FFFF00', textOnPrimary: '#FFFFFF', accent: '#FFFF00' }, // Wigan (Blue, Yellow)
  CHA: { primary: '#C8102E', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#C8102E' }, // Charlton (Red)
  DON: { primary: '#FF0000', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#FF0000' }, // Doncaster
  GRI: { primary: '#111111', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#FF0000' }, // Grimsby (Black/White, Red)
  BRA: { primary: '#800020', secondary: '#FEBA13', textOnPrimary: '#FFFFFF', accent: '#FEBA13' }, // Bradford (Claret, Amber)
  SAL: { primary: '#FF0000', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#FF0000' }, // Salford (Red)

  // SPAIN - LA LIGA
  RMA: { primary: '#FEFEFE', secondary: '#19315B', textOnPrimary: '#000000', accent: '#FEBE10' }, // Real Madrid (White, Gold/Navy)
  BAR: { primary: '#004D98', secondary: '#A50044', textOnPrimary: '#FFFFFF', accent: '#EDBB00' }, // Barcelona (Blue, Garnet, Gold)
  ATM: { primary: '#CB3524', secondary: '#192C5B', textOnPrimary: '#FFFFFF', accent: '#192C5B' }, // Atletico Madrid (Red/White, Navy)
  RSO: { primary: '#005CA5', secondary: '#FFFFFF', textOnPrimary: '#FFFFFF', accent: '#005CA5' }, // Real Sociedad (Blue)
  VIL: { primary: '#FFF200', secondary: '#004D98', textOnPrimary: '#000000', accent: '#004D98' }, // Villarreal (Yellow, Blue)

  // GERMANY - BUNDESLIGA
  FCB: { primary: '#DC052D', secondary: '#0066B2', textOnPrimary: '#FFFFFF', accent: '#0066B2' }, // Bayern Munich (Red, Blue)
  B04: { primary: '#E32221', secondary: '#000000', textOnPrimary: '#FFFFFF', accent: '#E32221' }, // Leverkusen (Red, Black)
  BVB: { primary: '#FDE100', secondary: '#000000', textOnPrimary: '#000000', accent: '#000000' }, // Dortmund (Yellow, Black)

  // ITALY - SERIE A
  INT: { primary: '#0073C7', secondary: '#000000', textOnPrimary: '#FFFFFF', accent: '#F3E155' }, // Inter (Blue, Black, Yellow)
  NAP: { primary: '#12A0D7', secondary: '#11315B', textOnPrimary: '#FFFFFF', accent: '#12A0D7' }, // Napoli (Sky Blue, Navy)
  ACM: { primary: '#E31B23', secondary: '#000000', textOnPrimary: '#FFFFFF', accent: '#E31B23' }  // AC Milan (Red, Black)
};

const defaultColors: TeamColors = {
  primary: '#0d9488',   // Modern Teal Primary
  secondary: '#115e59', // Deep Teal Secondary
  textOnPrimary: '#FFFFFF',
  accent: '#14b8a6'     // Vibrant Teal Accent
};

export function getTeamColors(symbol?: string): TeamColors {
  if (!symbol) return defaultColors;
  return colorMap[symbol.toUpperCase()] || defaultColors;
}

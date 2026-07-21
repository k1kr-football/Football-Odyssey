/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BackstoryType, Position, Attributes } from '../types';

export interface BackstoryConfig {
  type: BackstoryType;
  title: string;
  slogan: string;
  description: string;
  age: number;
  startingOvr: number;
  positions: Position[];
  weakFoot: number; // 1-5
  startingTier: string;
  nationalityPool: string[];
  attributeDistribution: Attributes;
  bullet: string;
}

export const BACKSTORIES: Record<BackstoryType, BackstoryConfig> = {
  STREET_PRODIGY: {
    type: 'STREET_PRODIGY',
    title: 'THE STREET PRODIGY',
    slogan: '"Concrete pitches. Bare feet. A viral clip changed everything."',
    description: 'You learned the game on hot tarmac in Lagos, Accra, or São Paulo — no coach, no academy, no structure. Survival football forged a first touch most academies envy and a left foot built out of necessity. A scout’s phone caught you nutmegging three grown men in a tournament nobody televised. A trial followed. Now the lower leagues are your audition.',
    bullet: 'Both feet from day one · raw pace and flair · tactically and mentally untested at pro level.',
    age: 19,
    startingOvr: 63,
    positions: ['LW', 'RW', 'ST'],
    weakFoot: 4,
    startingTier: 'Lower-league / small clubs',
    nationalityPool: ['Nigeria', 'Ghana', 'Brazil', 'Argentina', 'Ivory Coast'],
    attributeDistribution: {
      pace: 82,
      strength: 55,
      stamina: 60,
      agility: 85,
      finishing: 72,
      passing: 55,
      dribbling: 84,
      firstTouch: 78,
      tackling: 30,
      composure: 55,
      vision: 50,
      positioning: 50,
      decisionMaking: 40,
      tacticalAwareness: 35,
      leadership: 35,
      determination: 65
    }
  },
  FALLEN_PRODIGY: {
    type: 'FALLEN_PRODIGY',
    title: 'THE FALLEN PRODIGY',
    slogan: '"At 16 they called you the next big thing. At 17 your knee said no."',
    description: 'Most talked-about talent in Europe at 16, signed to a top academy. But a serious ligament tear sidelined you for 18 months, turning the spotlight elsewhere. Loan spells at forgettable clubs followed. Now 21, you represent raw, polished, yet fragile footballing intellect. It’s time to rebuild what everyone said was gone.',
    bullet: 'High composure & match experience · zero league reputation · free choice of position.',
    age: 21,
    startingOvr: 66,
    positions: ['AM', 'CM', 'LW', 'RW'],
    weakFoot: 3,
    startingTier: 'Any top-5 club (no elite)',
    nationalityPool: ['Spain', 'France', 'Portugal', 'Italy', 'Netherlands'],
    attributeDistribution: {
      pace: 68,
      strength: 50,
      stamina: 52,
      agility: 75,
      finishing: 72,
      passing: 81,
      dribbling: 78,
      firstTouch: 80,
      tackling: 45,
      composure: 85,
      vision: 78,
      positioning: 60,
      decisionMaking: 70,
      tacticalAwareness: 75,
      leadership: 60,
      determination: 80
    }
  },
  LATE_BLOOMER: {
    type: 'LATE_BLOOMER',
    title: 'THE LATE BLOOMER',
    slogan: '"Nobody found you. You found yourself."',
    description: 'Never played academy youth football. You were a construction worker or local fitness instructor, playing Sunday League for fun. At 23, a semi-pro club took a gamble on your sheer athletic dominance. You have raw physical strength and work rate, but massive technical gaps. Can you adapt to professional discipline before time runs out?',
    bullet: 'Unrivaled engine & power · low starting technique · humble roots protect morale.',
    age: 23,
    startingOvr: 60,
    positions: ['CB', 'LB', 'RB', 'CM'],
    weakFoot: 2,
    startingTier: 'Foundation / Lower-league only',
    nationalityPool: ['Norway', 'Sweden', 'Poland', 'Egypt', 'Morocco', 'Nigeria'],
    attributeDistribution: {
      pace: 75,
      strength: 84,
      stamina: 88,
      agility: 55,
      finishing: 50,
      passing: 55,
      dribbling: 52,
      firstTouch: 45,
      tackling: 78,
      composure: 55,
      vision: 45,
      positioning: 55,
      decisionMaking: 60,
      tacticalAwareness: 40,
      leadership: 50,
      determination: 90
    }
  },
  ACADEMY_GRADUATE: {
    type: 'ACADEMY_GRADUATE',
    title: 'THE ACADEMY GRADUATE',
    slogan: '"Every meal counted. Every drill measured. Now the real game asks: can you?"',
    description: 'Nine years old when you signed your first academy papers at one of Europe’s elite clubs. Every meal, every session, every school holiday — football. You can pass with both feet, you read shape, you say the right things in interviews. What you’ve never faced is a hostile crowd at 2-0 down with the manager screaming. Polished but untested. The first team is watching to see if you’ve got bite.',
    bullet: 'Elite tactical & technical base · soft physically and mentally · captaincy track if you survive.',
    age: 18,
    startingOvr: 64,
    positions: ['GK', 'CB', 'CM', 'LB', 'RB'],
    weakFoot: 2,
    startingTier: 'Reserve / mid-table top club',
    nationalityPool: ['England', 'Germany', 'Spain', 'France', 'Netherlands'],
    attributeDistribution: {
      pace: 65,
      strength: 50,
      stamina: 60,
      agility: 65,
      finishing: 58,
      passing: 76,
      dribbling: 68,
      firstTouch: 75,
      tackling: 64,
      composure: 60,
      vision: 72,
      positioning: 50,
      decisionMaking: 68,
      tacticalAwareness: 72,
      leadership: 55,
      determination: 70
    }
  },
  FROM_SCRATCH: {
    type: 'FROM_SCRATCH',
    title: 'STARTING FROM SCRATCH',
    slogan: '"No money. No reputation. Just a trial and a dream."',
    description: 'You have absolutely nothing. No savings to fall back on, zero media cushion, and no agent whispering in the ears of top clubs. You start with the absolute minimum resources allowed. It will be a brutal grind up from the floor. Lifestyle options are locked until you prove you belong.',
    bullet: 'Brutal start · zero finances · floor-level reputation everywhere.',
    age: 18,
    startingOvr: 60,
    positions: ['GK', 'CB', 'LB', 'RB', 'CM', 'AM', 'LW', 'RW', 'ST'],
    weakFoot: 2,
    startingTier: 'Lower-league only',
    nationalityPool: ['Brazil', 'England', 'Spain', 'Senegal', 'Mexico'],
    attributeDistribution: {
      pace: 65,
      strength: 65,
      stamina: 65,
      agility: 60,
      finishing: 60,
      passing: 60,
      dribbling: 60,
      firstTouch: 60,
      tackling: 60,
      composure: 60,
      vision: 60,
      positioning: 50,
      decisionMaking: 60,
      tacticalAwareness: 60,
      leadership: 50,
      determination: 80
    }
  },
  EXILE: {
    type: 'EXILE',
    title: 'THE EXILE',
    slogan: '"Comfortable life. Fat contract. You walked away to prove a point."',
    description: 'You were a first-team regular and a derby-day name in Saudi Arabia, MLS, Japan, or the K-League. The money was real. The lifestyle was easy. You walked away because Europe never came calling and you needed to know. Pundits write you off as past-it or soft. You’re neither — but the league doesn’t know your face, and you start that conversation from scratch every weekend.',
    bullet: 'High composure & match experience · zero league reputation · free choice of position.',
    age: 26,
    startingOvr: 70,
    positions: ['LW', 'RW', 'ST', 'AM', 'CM'],
    weakFoot: 3,
    startingTier: 'Any top-5 club (no elite)',
    nationalityPool: ['Japan', 'South Korea', 'United States', 'Saudi Arabia', 'Australia', 'Senegal'],
    attributeDistribution: {
      pace: 70,
      strength: 68,
      stamina: 65,
      agility: 70,
      finishing: 75,
      passing: 72,
      dribbling: 71,
      firstTouch: 74,
      tackling: 40,
      composure: 80,
      vision: 70,
      positioning: 50,
      decisionMaking: 75,
      tacticalAwareness: 70,
      leadership: 65,
      determination: 60
    }
  },
  NON_LEAGUE: {
    type: 'NON_LEAGUE',
    title: 'Non-League Hero',
    slogan: 'From Sunday League to the big time.',
    description: 'You spent your weekends playing on muddy pitches with mismatched socks, working a regular nine-to-five during the week. But professional scouts saw something. Now, at 21, you have a shock trial with a real club. Your fitness and determination are elite from years of hard graft, but your technical quality has massive gaps. This is your one shot to leave the amateur leagues behind forever.',
    bullet: 'Starts with High Trust, Low Starting OVR',
    age: 21,
    startingOvr: 50,
    positions: ['CB', 'CM', 'ST'],
    weakFoot: 2,
    startingTier: 'Lower',
    nationalityPool: ['England', 'Wales', 'Scotland', 'Ireland'],
    attributeDistribution: {
      pace: 65,
      strength: 65,
      stamina: 65,
      agility: 65,
      finishing: 40,
      passing: 40,
      dribbling: 40,
      firstTouch: 40,
      tackling: 40,
      composure: 60,
      vision: 60,
      positioning: 60,
      decisionMaking: 60,
      tacticalAwareness: 60,
      leadership: 60,
      determination: 60
    }
  },
  ACADEMY_PRODIGY: {
    type: 'ACADEMY_PRODIGY',
    title: 'ACADEMY PRODIGY',
    slogan: '"Standing in the shadow of a legend, carrying their legacy into a new era."',
    description: 'Mentored by a retired club icon, you enter the professional ranks with immense expectation and inherited guidance. The fans demand greatness, but you possess the technical blueprint to build your own legacy.',
    bullet: 'Inherited mentorship · High potential cap · Press spotlight',
    age: 17,
    startingOvr: 65,
    positions: ['ST', 'AM', 'LW', 'RW', 'CM'],
    weakFoot: 3,
    startingTier: 'Youth / Academy prodigy',
    nationalityPool: ['England', 'France', 'Germany', 'Spain', 'Italy', 'Brazil', 'Argentina'],
    attributeDistribution: {
      pace: 72,
      strength: 58,
      stamina: 65,
      agility: 74,
      finishing: 68,
      passing: 70,
      dribbling: 72,
      firstTouch: 72,
      tackling: 45,
      composure: 68,
      vision: 70,
      positioning: 65,
      decisionMaking: 68,
      tacticalAwareness: 65,
      leadership: 60,
      determination: 75
    }
  }
};

export { NATIONALITY_NAMES } from './playerNames';

const fs = require('fs');
let code = `
import { Club, GeneratedClub, Player } from '../types';
import { ClubFinancesMap, verifyClubSigningCapability } from './clubFinances';

export type ManagerArchetype = 'LOYALIST' | 'PRAGMATIST' | 'PROJECT_BUILDER' | 'VOLATILE';

export interface ManagerProfile {
    name: string;
    archetype: ManagerArchetype;
    trust: number;
    jobSecurity: number;
    tenureWeeks: number;
}

export interface WorldClub extends GeneratedClub {
    manager: ManagerProfile;
    form: number[]; // Last 5 match results (1=Win, 0=Draw, -1=Loss)
    points: number;
    matchesPlayed: number;
    goalsFor: number;
    goalsAgainst: number;
}

export interface LeagueTableEntry {
    clubName: string;
    symbol: string;
    points: number;
    played: number;
    gf: number;
    ga: number;
    gd: number;
    form: string;
}

export interface WorldState {
    clubs: Record<string, WorldClub>;
    newsItems: { week: number; text: string; type: string }[];
}

import { CLUBS } from '../data/clubs';

export function initializeWorldState(): WorldState {
    const worldClubs: Record<string, WorldClub> = {};
    
    CLUBS.forEach(club => {
        const archetypes: ManagerArchetype[] = ['LOYALIST', 'PRAGMATIST', 'PROJECT_BUILDER', 'VOLATILE'];
        const arch = archetypes[Math.floor(Math.random() * archetypes.length)];
        
        worldClubs[club.symbol] = {
            ...club,
            manager: {
                name: \`\${club.symbol} Manager\`,
                archetype: arch,
                trust: 50,
                jobSecurity: 100,
                tenureWeeks: Math.floor(Math.random() * 50)
            },
            form: [],
            points: 0,
            matchesPlayed: 0,
            goalsFor: 0,
            goalsAgainst: 0
        } as WorldClub;
    });

    return { clubs: worldClubs, newsItems: [] };
}

export function simulateWorldWeek(
    world: WorldState | undefined, 
    playerClubSymbol: string, 
    week: number, 
    isTransferWindow: boolean, 
    player: Player
): WorldState {
    if (!world || !world.clubs || Object.keys(world.clubs).length === 0) {
        world = initializeWorldState();
    }
    const newWorld = { ...world, clubs: { ...world.clubs }, newsItems: [] };
    const clubIds = Object.keys(newWorld.clubs);
    
    // Group clubs by league to simulate matches
    const leagues: Record<string, string[]> = {};
    clubIds.forEach(id => {
        const league = newWorld.clubs[id].league;
        if (!leagues[league]) leagues[league] = [];
        leagues[league].push(id);
    });

    for (const [leagueName, ids] of Object.entries(leagues)) {
        // Simple random pairing
        const shuffled = [...ids].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length - 1; i += 2) {
            const homeId = shuffled[i];
            const awayId = shuffled[i+1];
            
            // Skip match generation if it's the player's club - match engine handles it
            if (homeId === playerClubSymbol || awayId === playerClubSymbol) continue;
            
            const home = newWorld.clubs[homeId];
            const away = newWorld.clubs[awayId];

            const homeAdvantage = 3;
            const homeScoreForm = home.form.reduce((a,b)=>a+b, 0);
            const awayScoreForm = away.form.reduce((a,b)=>a+b, 0);
            
            const homeStrength = home.ovr + homeAdvantage + homeScoreForm + (Math.random()*20);
            const awayStrength = away.ovr + awayScoreForm + (Math.random()*20);

            let homeGoals = 0;
            let awayGoals = 0;
            if (homeStrength > awayStrength + 8) { homeGoals = 2 + Math.floor(Math.random()*2); awayGoals = 0; }
            else if (homeStrength > awayStrength + 3) { homeGoals = 2; awayGoals = 1; }
            else if (homeStrength > awayStrength) { homeGoals = 1; awayGoals = 0; }
            else if (awayStrength > homeStrength + 8) { homeGoals = 0; awayGoals = 2 + Math.floor(Math.random()*2); }
            else if (awayStrength > homeStrength + 3) { homeGoals = 1; awayGoals = 2; }
            else if (awayStrength > homeStrength) { homeGoals = 0; awayGoals = 1; }
            else { homeGoals = 1; awayGoals = 1; }

            home.matchesPlayed++;
            away.matchesPlayed++;
            home.goalsFor += homeGoals;
            home.goalsAgainst += awayGoals;
            away.goalsFor += awayGoals;
            away.goalsAgainst += homeGoals;

            if (homeGoals > awayGoals) {
                home.points += 3;
                home.form.push(1);
                away.form.push(-1);
            } else if (awayGoals > homeGoals) {
                away.points += 3;
                away.form.push(1);
                home.form.push(-1);
            } else {
                home.points += 1;
                away.points += 1;
                home.form.push(0);
                away.form.push(0);
            }

            if (home.form.length > 5) home.form.shift();
            if (away.form.length > 5) away.form.shift();
        }
    }

    // Manager AI & Job Security Evaluation
    for (const clubId of clubIds) {
        const club = newWorld.clubs[clubId];
        club.manager.tenureWeeks++;
        
        const recentForm = club.form.reduce((a,b)=>a+b,0);
        if (recentForm < -2) {
            let drop = 5;
            if (club.manager.archetype === 'PRAGMATIST') drop = 10;
            if (club.manager.archetype === 'LOYALIST') drop = 2;
            if (club.manager.archetype === 'VOLATILE') drop = 15;
            club.manager.jobSecurity -= drop;
        } else if (recentForm > 2) {
            club.manager.jobSecurity += 5;
        }

        // Sacking
        if (club.manager.jobSecurity <= 0 && clubId !== playerClubSymbol) {
            newWorld.newsItems.push({ week, type: 'MANAGER', text: \`BREAKING: \${club.name} has sacked their manager after a poor run of form.\` });
            const archetypes: ManagerArchetype[] = ['LOYALIST', 'PRAGMATIST', 'PROJECT_BUILDER', 'VOLATILE'];
            club.manager = {
                name: \`New Manager\`,
                archetype: archetypes[Math.floor(Math.random()*archetypes.length)],
                trust: 50,
                jobSecurity: 100,
                tenureWeeks: 0
            };
        }
    }

    // Transfer Market Simulation
    if (isTransferWindow) {
        if (Math.random() < 0.3) {
            const buyers = clubIds.filter(id => id !== playerClubSymbol && newWorld.clubs[id].tier === 'Elite');
            if (buyers.length > 0) {
                const buyer = newWorld.clubs[buyers[Math.floor(Math.random() * buyers.length)]];
                newWorld.newsItems.push({ week, type: 'TRANSFER', text: \`RUMOR: \${buyer.name} are heavily scouting emerging talents across Europe.\` });
            }
        }
    }

    // Filter news items to keep it light
    if (newWorld.newsItems.length > 10) {
        newWorld.newsItems = newWorld.newsItems.slice(newWorld.newsItems.length - 10);
    }

    return newWorld;
}

export function getLeagueTable(world: WorldState | undefined, leagueName: string): LeagueTableEntry[] {
    if (!world || !world.clubs) return [];
    return Object.values(world.clubs)
        .filter(c => c.league === leagueName)
        .map(c => ({
            clubName: c.name,
            symbol: c.symbol,
            points: c.points,
            played: c.matchesPlayed,
            gf: c.goalsFor,
            ga: c.goalsAgainst,
            gd: c.goalsFor - c.goalsAgainst,
            form: c.form.map(f => f === 1 ? 'W' : f === 0 ? 'D' : 'L').join('')
        })).sort((a,b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.gf - a.gf;
        });
}
`;
fs.writeFileSync('src/utils/worldSimulation.ts', code);
console.log("Updated worldSimulation.ts");

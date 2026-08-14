import React, { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { useGame } from '../store/GameContext';
import { getPositionGroup } from '../utils/positionMatchDecisions';
import { Attributes } from '../types';

interface RadarChartComparisonProps {
  playerAttributes: Attributes;
  playerPosition: string;
  isMatchContext?: boolean; // If true, maybe styling is slightly different or title changes
}

export const RadarChartComparison: React.FC<RadarChartComparisonProps> = ({ playerAttributes, playerPosition, isMatchContext }) => {
  const { state } = useGame();
  
  const data = useMemo(() => {
    const posGroup = getPositionGroup(playerPosition);
    const npcs = state.npcRegistry?.players || [];
    
    // Filter to same position group
    const peers = npcs.filter(npc => getPositionGroup(npc.position) === posGroup);
    
    // Define the key attributes to compare based on position group
    let keysToCompare: (keyof Attributes)[] = [];
    let labels: string[] = [];
    
    switch (posGroup) {
      case 'GK':
        keysToCompare = ['agility', 'decisionMaking', 'positioning', 'composure', 'firstTouch'];
        labels = ['Agility', 'Decisions', 'Positioning', 'Composure', 'Reflexes(Touch)'];
        break;
      case 'DEFENDER':
        keysToCompare = ['tackling', 'strength', 'positioning', 'pace', 'composure'];
        labels = ['Tackling', 'Strength', 'Positioning', 'Pace', 'Composure'];
        break;
      case 'MIDFIELDER':
        keysToCompare = ['passing', 'vision', 'stamina', 'tackling', 'firstTouch'];
        labels = ['Passing', 'Vision', 'Stamina', 'Tackling', 'Control'];
        break;
      case 'ATTACKING_MID_WING':
        keysToCompare = ['pace', 'dribbling', 'passing', 'vision', 'agility'];
        labels = ['Pace', 'Dribbling', 'Passing', 'Vision', 'Agility'];
        break;
      case 'STRIKER':
        keysToCompare = ['finishing', 'pace', 'strength', 'positioning', 'composure'];
        labels = ['Finishing', 'Pace', 'Strength', 'Positioning', 'Composure'];
        break;
    }
    
    // Calculate averages
    const averages: Record<string, number> = {};
    keysToCompare.forEach(k => averages[k] = 0);
    
    let count = 0;
    peers.forEach(peer => {
      const attrs = peer.attributes;
      if (attrs) {
        keysToCompare.forEach(k => {
          averages[k] += (attrs[k] || 50);
        });
        count++;
      }
    });
    
    if (count > 0) {
      keysToCompare.forEach(k => {
        averages[k] = Math.round(averages[k] / count);
      });
    } else {
      // Fallback baseline if no peers generated
      keysToCompare.forEach(k => averages[k] = 65);
    }
    
    // Format for Recharts
    return keysToCompare.map((key, idx) => ({
      subject: labels[idx],
      You: playerAttributes[key] || 50,
      LeagueAverage: averages[key]
    }));
  }, [playerPosition, playerAttributes, state.npcRegistry]);

  return (
    <div className={`glass-panel p-4 flex flex-col w-full ${isMatchContext ? 'h-64' : 'h-80'}`}>
      <h3 className="text-white/80 font-black uppercase tracking-widest text-xs text-center mb-2">
        Attribute Comparison vs League Average
      </h3>
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="You"
              dataKey="You"
              stroke="#00FF88"
              fill="#00FF88"
              fillOpacity={0.5}
            />
            <Radar
              name="League Avg"
              dataKey="LeagueAverage"
              stroke="#666"
              fill="#666"
              fillOpacity={0.3}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

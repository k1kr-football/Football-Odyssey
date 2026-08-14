import React from 'react';
import { useGame } from '../store/GameContext';
import { CareerDepthWidget } from '../components/CareerDepthWidget';
import { TeamFormD3Chart } from '../components/TeamFormD3Chart';
import { CLUBS } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { getClubStaff } from '../utils/clubStaff';
import { getClubSquad } from '../data/sheetSquads';
import { Users, Lightbulb, Activity, Stethoscope } from 'lucide-react';

export function Club() {
  const { state } = useGame();
  const player = state.player;

  if (!player) return null;

  const currentClub = CLUBS.find(c => c.symbol === player.currentClubSymbol) || CLUBS[0];
  const staff = getClubStaff(state);
  const squad = getClubSquad(currentClub.name);
  const worldClub = state.worldState?.clubs?.[currentClub.symbol];
  const managerName = worldClub?.manager?.name || player.managerInfo?.name || squad.manager || "The Manager";
  const clubSymbol = player.currentClubSymbol;
  const clubFinances = state.worldState?.clubFinances?.[clubSymbol];

  return (
    <div className="flex flex-col gap-6 w-full font-sans text-sm pb-12 overflow-y-auto">
      <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#00FF88]"></div>
        <div className="flex items-center gap-5 relative z-10">
          <TeamLogo
            symbol={currentClub.symbol}
            name={currentClub.name}
            primaryColor={currentClub.primaryColor}
            secondaryColor={currentClub.secondaryColor}
            size={68}
            className="flex-shrink-0 bg-[#0d0d0d] p-3 border border-[#222]"
          />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] px-2.5 py-1 ">
                {currentClub.league}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-1 ">
                Tier {currentClub.tier}
              </span>
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight mb-1">
              {currentClub.name}
            </h1>
            <p className="text-white/50 text-xs font-mono uppercase tracking-widest">
              Est. Board Confidence: <span className="text-emerald-400">Stable</span>
            </p>
          </div>
        </div>
        
        {clubFinances && (
          <div className="glass-panel p-4 text-right">
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Est. Transfer Budget</div>
            <div className="text-xl font-black text-white">£{(clubFinances.transferBudget / 1000000).toFixed(1)}M</div>
            <div className={`text-[10px] font-bold uppercase mt-1 ${clubFinances.financialHealth === 'SECURE' ? 'text-emerald-400' : 'text-amber-400'}`}>
              Status: {clubFinances.financialHealth}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#151515] border border-[#111] p-4 flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-white/50 flex items-center gap-1.5"><Users size={14} className="text-amber-400"/> Head Coach</div>
          <div className="text-sm font-black text-white uppercase">{managerName}</div>
          <div className="text-[10px] text-white/40">Responsible for tactics and starting XI.</div>
        </div>
        <div className="bg-[#151515] border border-[#111] p-4 flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-white/50 flex items-center gap-1.5"><Lightbulb size={14} className="text-blue-400"/> Director of Football</div>
          <div className="text-sm font-black text-white uppercase">{staff.chiefScout.fullName}</div>
          <div className="text-[10px] text-white/40">Oversees club transfers and contracts.</div>
        </div>
        <div className="bg-[#151515] border border-[#111] p-4 flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-white/50 flex items-center gap-1.5"><Activity size={14} className="text-emerald-400"/> Fitness Coach</div>
          <div className="text-sm font-black text-white uppercase">{staff.fitnessCoach.fullName}</div>
          <div className="text-[10px] text-white/40">Manages training intensity & sharpness.</div>
        </div>
        <div className="bg-[#151515] border border-[#111] p-4 flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-white/50 flex items-center gap-1.5"><Stethoscope size={14} className="text-red-400"/> Head Physio</div>
          <div className="text-sm font-black text-white uppercase">{staff.physio.fullName}</div>
          <div className="text-[10px] text-white/40">Oversees medical protocols and rehab.</div>
        </div>
      </div>

      {/* D3 Team Form & Performance Momentum Visualizer */}
      <TeamFormD3Chart player={player} />

      <CareerDepthWidget />
    </div>
  );
}

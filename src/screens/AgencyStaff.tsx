import React from 'react';
import { useAPEngine } from '../hooks/useAPEngine';
import { StaffAutomation } from '../types/apEngine';
import { useGame } from '../store/GameContext';
import { Stethoscope, Mic, Apple, ChevronRight, CheckCircle2 } from 'lucide-react';

interface StaffMember {
  id: keyof StaffAutomation;
  name: string;
  role: string;
  weeklyWage: number;
  effectDescription: string;
  icon: any;
}

const STAFF_ROSTER: StaffMember[] = [
  {
    id: 'nutritionist',
    name: 'Dr. Elena Rostova',
    role: 'Chief Nutritionist',
    weeklyWage: 1200,
    effectDescription: 'Automatically restores +10% Condition on every daily AP reset.',
    icon: Apple
  },
  {
    id: 'privatePhysio',
    name: 'Marcus Vance',
    role: 'Private Physio',
    weeklyWage: 2500,
    effectDescription: 'Reduces strain penalties and decreases match injury risk by -30%.',
    icon: Stethoscope
  },
  {
    id: 'prManager',
    name: 'Sarah Jenkins',
    role: 'PR Manager',
    weeklyWage: 1800,
    effectDescription: 'Passively generates +100 World Reputation per week and mitigates media controversy.',
    icon: Mic
  }
];

export function AgencyStaff() {
  const { apState, toggleStaff } = useAPEngine();
  const { state } = useGame();
  
  const totalWages = STAFF_ROSTER.reduce((acc, staff) => {
    return acc + (apState.staff[staff.id] ? staff.weeklyWage : 0);
  }, 0);

  const netIncome = (state.player?.contract?.wage || 0) - totalWages;

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse"></span>
            Private Staff & Specialists
          </h2>
          <p className="text-sm text-white/50 mt-1 font-mono">Automate daily routines and optimize recovery.</p>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-right">
          <div className="text-[10px] uppercase text-white/40 font-bold mb-1">Weekly Financial Impact</div>
          <div className="font-mono text-sm">
            <span className="text-white">Net Income: </span>
            <span className={netIncome >= 0 ? 'text-[#00FF88]' : 'text-red-400'}>£{netIncome.toLocaleString()}/wk</span>
          </div>
          <div className="text-[10px] text-white/30 mt-0.5">
            (Staff Expenses: £{totalWages.toLocaleString()}/wk)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {STAFF_ROSTER.map(staff => {
          const isHired = apState.staff[staff.id];
          const Icon = staff.icon;
          
          return (
            <div 
              key={staff.id} 
              className={`p-5 rounded-xl border transition-all ${
                isHired 
                  ? 'bg-[#121212] border-[#00FF88]/30 shadow-[0_0_15px_rgba(0,255,136,0.05)]' 
                  : 'bg-black/40 border-white/5 opacity-80 hover:opacity-100 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHired ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-white/5 text-white/40'}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-sans">{staff.name}</h3>
                    <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">{staff.role}</div>
                  </div>
                </div>
                {isHired && <CheckCircle2 size={20} className="text-[#00FF88]" />}
              </div>
              
              <p className="text-[11px] text-white/60 leading-relaxed min-h-[40px] mb-6">
                {staff.effectDescription}
              </p>
              
              <button
                onClick={() => toggleStaff(staff.id)}
                className={`w-full py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all ${
                  isHired
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'bg-white text-black hover:bg-[#00FF88] hover:scale-[1.02]'
                }`}
              >
                {isHired ? 'TERMINATE CONTRACT' : `HIRE (£${staff.weeklyWage.toLocaleString()}/wk)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

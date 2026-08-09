import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { APState } from '../types/apEngine';

interface APHeaderWidgetProps {
  apState: APState;
}

export function APHeaderWidget({ apState }: APHeaderWidgetProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isStrained = apState.strainZoneUsed > 0 || apState.currentAP < 0;
  const displayAP = apState.currentAP;

  return (
    <div className="relative inline-block font-mono">
      <div 
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
          isStrained 
            ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 animate-pulse'
            : 'bg-neutral-900/80 border-white/10 text-emerald-400 hover:border-emerald-500/40'
        }`}
      >
        {isStrained ? <AlertTriangle size={16} className="text-amber-400" /> : <Zap size={16} className="text-emerald-400" />}
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
          <span>AP:</span>
          <span className={`font-black ${isStrained ? 'text-amber-400' : 'text-white'}`}>
            {displayAP} / {apState.maxAP}
          </span>
          {isStrained && (
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
              STRAINED
            </span>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-neutral-900 border border-white/15 rounded-xl p-4 shadow-2xl z-50 text-xs space-y-2 text-white/80 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info size={14} /> Action Points Status
            </span>
            <span className="text-[10px] text-white/50 uppercase">{apState.phase}</span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-white/60">Base AP (Age tier):</span>
              <strong className="text-white">{apState.baseAP} AP</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Strain Borrowed:</span>
              <strong className={apState.strainZoneUsed > 0 ? 'text-amber-400' : 'text-white'}>
                {apState.strainZoneUsed} / 2 MAX
              </strong>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="text-[10px] font-bold text-white/50 uppercase">Active Perks & Staff:</div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <ShieldCheck size={13} />
              <span>Nutritionist: {apState.staff.nutritionist ? 'Active (+10% Cond/day)' : 'Inactive'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <ShieldCheck size={13} />
              <span>Private Physio: {apState.staff.privatePhysio ? 'Active (-20% Fatigue)' : 'Inactive'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <ShieldCheck size={13} />
              <span>PR Manager: {apState.staff.prManager ? 'Active (+Reputation)' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

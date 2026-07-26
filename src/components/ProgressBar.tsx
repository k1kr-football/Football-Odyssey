import React from 'react';
import { GlossaryTooltip } from './GlossaryTooltip';
import { GLOSSARY_ENTRIES } from '../data/glossary';

interface ProgressBarProps {
  label?: string;
  value: number; // 0-100
  max?: number;
  colorMode?: 'default' | 'fatigue' | 'morale' | 'trust' | 'inverse' | 'accent';
  showValue?: boolean;
  valueFormatter?: (val: number) => string;
  height?: string;
  className?: string;
}

export function ProgressBar({ 
  label, 
  value, 
  max = 100, 
  colorMode = 'default', 
  showValue = true,
  valueFormatter = (val) => `${Math.round(val)}%`,
  height = 'h-1.5',
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let colorClass = 'bg-[#00FF88]';
  if (colorMode === 'accent') colorClass = 'bg-[#00FF88]';
  else if (colorMode === 'fatigue') {
    if (percentage < 40) colorClass = 'bg-emerald-500';
    else if (percentage < 70) colorClass = 'bg-amber-500';
    else colorClass = 'bg-red-500';
  } else if (colorMode === 'morale' || colorMode === 'trust') {
    if (percentage < 30) colorClass = 'bg-red-500';
    else if (percentage < 60) colorClass = 'bg-amber-500';
    else colorClass = 'bg-emerald-500';
  } else if (colorMode === 'inverse') {
    if (percentage < 30) colorClass = 'bg-emerald-500';
    else if (percentage < 60) colorClass = 'bg-amber-500';
    else colorClass = 'bg-red-500';
  }

  const cleanLabel = label ? label.replace(/^[^\w]*/, '').trim() : '';
  const hasGlossaryMatch = label ? GLOSSARY_ENTRIES.some(e => e.term.toLowerCase() === cleanLabel.toLowerCase()) : false;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
          {label && (
            <span>
              {hasGlossaryMatch ? (
                <GlossaryTooltip term={cleanLabel}>{label}</GlossaryTooltip>
              ) : (
                label
              )}
            </span>
          )}
          {showValue && <span>{valueFormatter(value)}</span>}
        </div>
      )}
      <div className={`w-full bg-black/50 rounded-full overflow-hidden ${height} border border-white/10 p-0.5 backdrop-blur-sm`}>
        <div 
          className={`h-full ${colorClass} transition-all duration-500 rounded-full shadow-sm`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

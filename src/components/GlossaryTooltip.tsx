/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GLOSSARY_ENTRIES, GlossaryEntry } from '../data/glossary';
import { BookOpen, Info, HelpCircle, X } from 'lucide-react';

interface GlossaryTooltipProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

export function GlossaryTooltip({ term, children, className = '' }: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the exact glossary entry or look it up case-insensitively
  const entry = GLOSSARY_ENTRIES.find(
    e => e.term.toLowerCase() === term.toLowerCase()
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!entry) {
    // Fallback if the term doesn't exist in the glossary data
    return <span className={className}>{children}</span>;
  }

  const categoryColors: Record<GlossaryEntry['category'], string> = {
    Performance: 'text-[#38bdf8] border-[#38bdf8]/20 bg-[#38bdf8]/5',
    Relationships: 'text-rose-400 border-rose-950/20 bg-rose-950/5',
    Financial: 'text-emerald-400 border-emerald-950/20 bg-emerald-950/5',
    Career: 'text-amber-400 border-amber-950/20 bg-amber-950/5'
  };

  const borderColors: Record<GlossaryEntry['category'], string> = {
    Performance: 'border-[#38bdf8]/30',
    Relationships: 'border-rose-500/30',
    Financial: 'border-emerald-500/30',
    Career: 'border-amber-500/30'
  };

  return (
    <span 
      ref={containerRef}
      className="relative inline-block"
    >
      <span 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`border-b border-dotted border-white/40 cursor-help hover:border-[#00FF88] hover:text-white transition-colors select-none ${className}`}
      >
        {children}
      </span>

      {isOpen && (
        <div className={`absolute z-50 left-1/2 transform -translate-x-1/2 mt-2 w-72 p-4 rounded-lg bg-[#111] border ${borderColors[entry.category]} shadow-2xl backdrop-blur-md text-left font-mono pointer-events-auto`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-xs uppercase tracking-wider">{entry.term}</span>
            <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 border rounded ${categoryColors[entry.category]}`}>
              {entry.category}
            </span>
          </div>
          
          <p className="text-white/80 text-[11px] leading-relaxed mb-3">
            {entry.definition}
          </p>

          <div className="border-t border-white/5 pt-2 mt-2 space-y-1.5 text-[10px]">
            <div>
              <span className="text-white/40 uppercase tracking-widest block text-[8px] font-bold">How it shifts:</span>
              <span className="text-white/70">{entry.raisesLoweres}</span>
            </div>
            {entry.unlocksGates && (
              <div>
                <span className="text-white/40 uppercase tracking-widest block text-[8px] font-bold">Unlocks / Gates:</span>
                <span className="text-[#00FF88]">{entry.unlocksGates}</span>
              </div>
            )}
          </div>

          {entry.seeAlso.length > 0 && (
            <div className="border-t border-white/5 pt-1.5 mt-2 flex flex-wrap items-center gap-1.5 text-[8px]">
              <span className="text-white/40 uppercase tracking-widest font-bold">See Also:</span>
              {entry.seeAlso.map((sa) => (
                <span key={sa} className="text-white/60 bg-white/5 px-1 py-0.5 rounded">
                  {sa}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </span>
  );
}

interface FirstEncounterCalloutProps {
  term: string;
  className?: string;
}

export function FirstEncounterCallout({ term, className = '' }: FirstEncounterCalloutProps) {
  return null;
}

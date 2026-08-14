/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GLOSSARY_ENTRIES, GlossaryEntry } from '../data/glossary';
import { Search, BookOpen, Activity, Heart, Coins, Award, HelpCircle, ArrowRight } from 'lucide-react';

export function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | GlossaryEntry['category']>('ALL');

  const filteredEntries = useMemo(() => {
    return GLOSSARY_ENTRIES.filter(entry => {
      const matchesSearch = entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.seeAlso || []).some(sa => sa.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = activeCategory === 'ALL' || entry.category === activeCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [searchTerm, activeCategory]);

  const categoryIcons: Record<GlossaryEntry['category'] | 'ALL', React.ReactNode> = {
    ALL: <BookOpen size={16} />,
    Performance: <Activity size={16} />,
    Relationships: <Heart size={16} />,
    Financial: <Coins size={16} />,
    Career: <Award size={16} />
  };

  const categoryBg: Record<GlossaryEntry['category'], string> = {
    Performance: 'border-[#38bdf8]/20',
    Relationships: 'border-rose-950/40',
    Financial: 'border-emerald-950/40',
    Career: 'border-amber-950/40'
  };

  const accentColors: Record<GlossaryEntry['category'], string> = {
    Performance: 'text-[#38bdf8]',
    Relationships: 'text-rose-400',
    Financial: 'text-emerald-400',
    Career: 'text-amber-400'
  };

  const categoryBadges: Record<GlossaryEntry['category'], string> = {
    Performance: 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20',
    Relationships: 'bg-rose-950/30 text-rose-400 border-rose-950/50',
    Financial: 'bg-emerald-950/30 text-emerald-400 border-emerald-950/50',
    Career: 'bg-amber-950/30 text-amber-400 border-amber-950/50'
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-mono h-full w-full">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6 shrink-0">
        <div>
          <span className="text-[#00FF88] text-[9px] font-black uppercase tracking-widest border border-[#00FF88]/20 px-3 py-1 rounded bg-[#00FF88]/5 mb-2 inline-block">SYSTEM DIRECTORY</span>
          <h1 className="text-white text-3xl font-black uppercase tracking-tighter">Athletic Glossary</h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Master the core stats, dynamic meters, and complex mechanics of professional football</p>
        </div>
      </div>

      {/* Interactive controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="SEARCH STATS, METERS, AND CONTRACT RULES..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#222] pl-11 pr-4 py-3 text-xs text-white placeholder-white/30 uppercase tracking-wider focus:outline-none focus:border-[#00FF88] transition-colors font-mono"
          />
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'Performance', 'Relationships', 'Financial', 'Career'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2.5 border text-[10px] font-bold uppercase tracking-widest transition-all
                ${activeCategory === cat
                  ? 'bg-[#00FF88] border-[#00FF88] text-[#0e0e0e] shadow-[#00FF88]/10'
                  : 'bg-[#111] border-[#111] text-white/50 hover:text-white hover:border-[#333]'
                }`}
            >
              {categoryIcons[cat]}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Glossary Grid */}
      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8 overflow-y-auto pr-1">
          {filteredEntries.map((entry) => (
            <div
              key={entry.term}
              className={`${categoryBg[entry.category]} border p-6 relative overflow-hidden flex flex-col justify-between`}
            >
              {/* Background accent badge */}
              <div className="absolute top-4 right-4 shrink-0">
                <span className={`text-[8px] font-black uppercase tracking-widest border px-2.5 py-0.5 rounded ${categoryBadges[entry.category]}`}>
                  {entry.category}
                </span>
              </div>

              <div>
                <h3 className="text-white text-lg font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                  <span className={accentColors[entry.category]}>&bull;</span>
                  {entry.term}
                </h3>

                <p className="text-white/80 text-xs leading-relaxed mb-4 pr-12">
                  {entry.definition}
                </p>

                {/* Subsections */}
                <div className="space-y-3 border-t border-[#111] pt-4">
                  <div>
                    <span className="text-white/30 text-[8px] font-black uppercase tracking-widest block mb-0.5">Dynamic Shift Factors:</span>
                    <span className="text-[#ccc] text-[11px] leading-relaxed block">{entry.raisesLoweres}</span>
                  </div>

                  <div>
                    <span className="text-white/30 text-[8px] font-black uppercase tracking-widest block mb-0.5">Unlock Gating:</span>
                    <span className="text-[#00FF88] text-[11px] leading-relaxed block">{entry.unlocksGates}</span>
                  </div>
                </div>
              </div>

              {/* Related terms footer */}
              {entry.seeAlso.length > 0 && (
                <div className="border-t border-[#111] pt-3 mt-4 flex flex-wrap items-center gap-2 text-[9px]">
                  <span className="text-white/40 uppercase tracking-widest font-bold">Related Mechanics:</span>
                  {entry.seeAlso.map((sa) => (
                    <button
                      key={sa}
                      onClick={() => {
                        setSearchTerm(sa);
                        setActiveCategory('ALL');
                      }}
                      className="text-[#00FF88] bg-[#00FF88]/5 hover:bg-[#00FF88]/10 border border-[#00FF88]/15 px-2 py-0.5 rounded transition-colors uppercase font-mono font-bold"
                    >
                      {sa}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111] border border-[#111] p-12 text-center flex flex-col items-center justify-center">
          <HelpCircle size={48} className="text-white/20 mb-3 animate-pulse" />
          <h3 className="text-white text-md font-bold uppercase tracking-wider mb-1">No glossary terms match your search</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest max-w-md">Try modifying your query or category filter to inspect other game system properties.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('ALL');
            }}
            className="mt-6 text-xs text-[#00FF88] hover:underline uppercase tracking-widest flex items-center gap-2 font-black"
          >
            Clear Search Filters <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { CUTSCENES } from '../data/cutscenes';
import { getFormattedCalendarDate } from '../utils/careerSystems';
import { musicEngine } from '../utils/musicEngine';

export function StoryOverlay() {
  const { state, resolveCutscene } = useGame();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [revealedLines, setRevealedLines] = useState<number[]>([0]); // indices of lines currently shown
  
  const cutscene = CUTSCENES.find(c => c.id === state.activeCutscene);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cutscene) {
      musicEngine.playMood('STORY_CUTSCENE');
    }
  }, [cutscene]);


  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [revealedLines]);

  if (!cutscene) return null;

  const lines = cutscene.getLines(state);
  const choices = cutscene.getChoices ? cutscene.getChoices(state) : null;
  const isFinished = currentLineIndex >= lines.length - 1;

  const nextLine = () => {
    if (currentLineIndex < lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
      setRevealedLines(prev => [...prev, currentLineIndex + 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#080706] text-amber-100 font-serif flex flex-col cursor-pointer select-none" onClick={nextLine}>
      {/* Nostalgic Top Bar */}
      <div className="h-20 bg-black/85 w-full z-10 flex items-center justify-between px-8 md:px-24 border-b border-amber-900/20">
         <div className="flex items-center gap-3">
           <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 animate-pulse"></span>
           <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-400/80 font-bold">Memory // Archival Reflection</span>
         </div>
         <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Season {state.season} • {getFormattedCalendarDate(state.currentWeek, state.currentDay)}</span>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col justify-end px-8 md:px-24 lg:px-48 py-12 relative bg-gradient-to-b from-[#120f0c] via-[#080706] to-[#040404]">
        
        {/* Nostalgic Sepia Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(20,10,0,0.85)_100%)]"></div>

        <div className="max-w-3xl mx-auto w-full space-y-10 relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl tracking-[0.2em] text-amber-200/90 uppercase font-sans font-black">
               {cutscene.title}
            </h1>
            <div className="w-16 h-0.5 bg-amber-500/30 mx-auto mt-3"></div>
          </div>

          {revealedLines.map((idx) => {
            const line = lines[idx];
            return (
              <div key={idx} className="animate-fade-in space-y-2">
                {line.speaker && (
                  <div className="text-xs tracking-[0.2em] text-amber-400/70 uppercase font-sans font-bold">
                    {line.speaker}
                  </div>
                )}
                <div className={`text-lg md:text-xl leading-relaxed text-amber-50/95 font-serif ${line.speaker ? 'border-l-2 border-amber-500/40 pl-6 italic' : ''}`}>
                  "{line.text}"
                </div>
              </div>
            );
          })}
          
          <div ref={endRef} className="h-10"></div>
          
          {isFinished && (
            <div className="mt-16 animate-fade-in flex flex-col gap-4 border-t border-amber-900/30 pt-12" onClick={e => e.stopPropagation()}>
              {choices && choices.length > 0 ? (
                choices.map((choice, idx) => (
                  <button 
                    key={idx}
                    onClick={() => resolveCutscene(idx)}
                    className="w-full text-left p-6 bg-amber-950/10 hover:bg-amber-900/20 border border-amber-500/20 hover:border-amber-500/50 transition-all group rounded-xl shadow-lg"
                  >
                    <div className="text-base md:text-lg font-medium group-hover:text-amber-200 text-amber-100 transition-colors font-serif">
                       {choice.text}
                    </div>
                    {choice.description && (
                      <div className="text-[10px] tracking-widest text-amber-400/60 uppercase font-sans mt-2">
                        {choice.description}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <button 
                  onClick={() => resolveCutscene(-1)}
                  className="mx-auto block px-12 py-4 bg-amber-500 text-black font-sans uppercase tracking-widest font-black rounded-lg hover:bg-amber-400 transition-all shadow-xl"
                >
                  Return to Present
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nostalgic Bottom Bar */}
      <div className="h-16 bg-black w-full z-10 flex items-center justify-center text-amber-400/50 text-[10px] font-mono tracking-widest uppercase border-t border-amber-900/20">
        {!isFinished && "Click anywhere to reflect further..."}
      </div>
    </div>
  );
}

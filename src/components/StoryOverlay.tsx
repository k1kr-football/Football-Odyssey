import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { CUTSCENES } from '../data/cutscenes';

export function StoryOverlay() {
  const { state, resolveCutscene } = useGame();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [revealedLines, setRevealedLines] = useState<number[]>([0]); // indices of lines currently shown
  
  const cutscene = CUTSCENES.find(c => c.id === state.activeCutscene);
  const endRef = useRef<HTMLDivElement>(null);

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
    <div className="fixed inset-0 z-[100] bg-black text-white font-serif flex flex-col cursor-pointer" onClick={nextLine}>
      {/* Cinematic Letterbox top */}
      <div className="h-24 bg-black w-full shadow-[0_10px_20px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center">
         {/* Optional Title subtly shown */}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col justify-end px-8 md:px-24 lg:px-48 py-12 relative bg-[#050505]">
        
        {/* Subtle Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%)]"></div>

        <div className="max-w-3xl mx-auto w-full space-y-10 relative z-10">
          <div className="mb-12">
            <h1 className="text-3xl tracking-widest text-[#555] uppercase font-sans text-center">
               {cutscene.title}
            </h1>
          </div>

          {revealedLines.map((idx) => {
            const line = lines[idx];
            return (
              <div key={idx} className="animate-fade-in">
                {line.speaker && (
                  <div className="text-sm tracking-widest text-white/50 uppercase font-sans mb-2">
                    {line.speaker}
                  </div>
                )}
                <div className={`text-xl md:text-2xl leading-relaxed text-white/90 ${line.speaker ? 'border-l-2 border-white/20 pl-6 italic' : ''}`}>
                  {line.text}
                </div>
              </div>
            );
          })}
          
          <div ref={endRef} className="h-10"></div>
          
          {isFinished && (
            <div className="mt-16 animate-fade-in flex flex-col gap-4 border-t border-white/10 pt-12" onClick={e => e.stopPropagation()}>
              {choices && choices.length > 0 ? (
                choices.map((choice, idx) => (
                  <button 
                    key={idx}
                    onClick={() => resolveCutscene(idx)}
                    className="w-full text-left p-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                  >
                    <div className="text-lg md:text-xl font-medium group-hover:text-white text-white/80 transition-colors">
                       "{choice.text}"
                    </div>
                    {choice.description && (
                      <div className="text-xs tracking-widest text-white/40 uppercase font-sans mt-3">
                        {choice.description}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <button 
                  onClick={() => resolveCutscene(-1)}
                  className="mx-auto block px-12 py-4 bg-white text-black font-sans uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cinematic Letterbox bottom */}
      <div className="h-24 bg-black w-full shadow-[0_-10px_20px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center text-[#444] text-xs font-sans tracking-widest">
        {!isFinished && "CLICK ANYWHERE TO CONTINUE"}
      </div>
    </div>
  );
}

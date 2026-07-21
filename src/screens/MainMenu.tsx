import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { Play, Star } from 'lucide-react';
import gameLogo from '../assets/images/image-removebg-preview.png';

export function MainMenu() {
 const { loadSavedGame, newGame } = useGame();
 const [hasSave, setHasSave] = useState(false);

 useEffect(() => {
 try {
  const saved = localStorage.getItem('rtg_careersave');
  if (saved) {
  const parsed = JSON.parse(saved);
  if (parsed && parsed.player) {
   setHasSave(true);
  }
  }
 } catch (e) {
  setHasSave(false);
 }
 }, []);

 const handleContinue = () => {
 loadSavedGame();
 };

 const handleNewGame = () => {
 newGame();
 };

 return (
 <div className="min-h-screen bg-[#080B09] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-mono selection:bg-[#00FF88]/30 selection:text-white">
  {/* Dynamic Odyssey Pitch Grid Background */}
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#131a15_1px,transparent_1px),linear-gradient(to_bottom,#131a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40"></div>
  
  {/* Background dual radial glows matching the green shield and gold ribbon */}
  <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-[#253D31]/10 rounded-full blur-3xl pointer-events-none"></div>
  <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-[#00FF88]/4 rounded-full blur-3xl pointer-events-none"></div>

  <div className="max-w-4xl w-full text-center relative z-10 flex flex-col items-center py-12">
  {/* Game Logo Emblem */}
  <div className="w-56 h-56 sm:w-64 sm:h-64 mb-6 relative hover:scale-[1.03] transition-transform duration-500 ease-out">
   <img
   src={gameLogo}
   alt="Football Odyssey Logo"
   className="w-full h-full object-contain filter drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
   referrerPolicy="no-referrer"
   />
  </div>

  {/* Game Title */}
  <h1 className="text-white text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-12 leading-none">
   FOOTBALL ODYSSEY
  </h1>

  {/* Action Menu */}
  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mb-16">
   {hasSave && (
   <button
    onClick={handleContinue}
    className="flex-1 bg-gradient-to-r from-[#00FF88] to-white text-black hover:scale-102 font-black py-4 px-6 rounded-lg uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#00FF88]/10 active:scale-98"
   >
    <Play size={14} fill="black" />
    Continue Career
   </button>
   )}

   <button
   onClick={handleNewGame}
   className={`flex-1 font-black py-4 px-6 rounded-lg uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2.5 active:scale-98 border ${
    hasSave 
    ? 'bg-transparent border-white/10 text-[#aaaaaa] hover:text-white hover:border-[#00FF88]' 
    : 'bg-white text-black hover:bg-[#00FF88] hover:scale-102 shadow-lg shadow-white/5 border-transparent'
   }`}
   >
   <Star size={14} className={hasSave ? 'text-white/50' : 'text-black'} />
   New Pro Career
   </button>
  </div>

  {/* Developer Credit footer line */}
  <div className="mt-16 text-[#444444] text-[9px] uppercase tracking-[0.2em] pointer-events-none">
   SYSTEM ONLINE &middot; FULL-STACK PROTOCOL v2.1
  </div>
  </div>
 </div>
 );
}

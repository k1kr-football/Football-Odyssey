import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { Play, Star, Settings, Trash2, Heart } from 'lucide-react';
import gameLogo from '../assets/images/image-removebg-preview.png';
import { SettingsModal } from '../components/SettingsModal';
import { getFormattedCalendarDate } from '../utils/careerSystems';
import { loadGameStateAsync, deleteGameStateAsync } from '../utils/storageEngine';

export function MainMenu() {
  const { loadSavedGame, newGame } = useGame();
  
  const [saveSlots, setSaveSlots] = useState<{ slot: number, data: any | null }[]>([
    { slot: 1, data: null },
    { slot: 2, data: null },
    { slot: 3, data: null }
  ]);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const fetchSaveSlots = async () => {
      const slots = await Promise.all([1, 2, 3].map(async slot => {
        try {
          const parsed = await loadGameStateAsync(`rtg_careersave_${slot}`);
          if (parsed && parsed.player) {
            return { slot, data: parsed };
          }
        } catch (e) {
          console.error(`Failed to load save slot ${slot}`, e);
        }
        return { slot, data: null };
      }));
      if (active) {
        setSaveSlots(slots);
      }
    };
    fetchSaveSlots();
    return () => { active = false; };
  }, []);

  const handleSlotAction = async (slot: number, data: any | null) => {
    if (data) {
      await loadSavedGame(slot);
    } else {
      newGame(slot);
    }
  };

  const handleDeleteSlot = (slot: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmSlot(slot);
  };

  const confirmDelete = async (slot: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteGameStateAsync(`rtg_careersave_${slot}`);
    setSaveSlots(prev => prev.map(s => s.slot === slot ? { slot, data: null } : s));
    setDeleteConfirmSlot(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmSlot(null);
  };

  return (
    <div className="min-h-screen bg-[#080B09] text-white flex flex-col justify-center items-center p-6 relative overflow-y-auto font-mono selection:bg-[#00FF88]/30 selection:text-white">
      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <a 
          href="https://selar.com/showlove/k1kr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 bg-white/5 hover:bg-[#00FF88]/20 rounded-full transition-colors border border-white/10 hover:border-[#00FF88]/50 group"
          title="Support the Developer"
        >
          <Heart size={24} className="text-white/70 group-hover:text-[#00FF88] transition-colors" />
        </a>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
          title="Settings"
        >
          <Settings size={24} className="text-white/70" />
        </button>
      </div>

      {/* Dynamic Odyssey Pitch Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#131a15_1px,transparent_1px),linear-gradient(to_bottom,#131a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40"></div>
      
      {/* Background dual radial glows matching the green shield and gold ribbon */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#253D31]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#00FF88]/4 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12 py-4 md:py-12 px-4 md:px-12 h-full">
        
        {/* Left Side: Game Logo & Title */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="w-24 h-24 sm:w-48 sm:h-48 mb-3 sm:mb-8 relative hover:scale-[1.03] transition-transform duration-500 ease-out">
            <img
              src={gameLogo}
              alt="Football Odyssey Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#00FF88] mb-1 sm:mb-2 block">
            CAREER RPG
          </span>
          <h1 className="text-white text-3xl sm:text-7xl font-black uppercase tracking-tighter mb-2 sm:mb-4 leading-none">
            FOOTBALL<br/>ODYSSEY
          </h1>
          <p className="text-[#00FF88] text-xs sm:text-sm uppercase tracking-[0.3em] font-bold">
            Write Your Legacy
          </p>
        </div>

        {/* Right Side: Save Slots List / Start Button */}
        <div className="flex-1 w-full max-w-lg flex flex-col gap-5 items-center md:items-stretch">
          {!showSlots ? (
            <div className="flex justify-center items-center h-full w-full">
              <button 
                onClick={() => setShowSlots(true)}
                className="group relative px-12 py-6 bg-[#00FF88] text-black font-black uppercase tracking-[0.2em] text-xl rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,255,136,0.3)] hover:shadow-[0_0_60px_rgba(0,255,136,0.5)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative flex items-center gap-3">
                  <Play fill="currentColor" size={24} />
                  Start Career
                </span>
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4 animate-fade-in mt-4">
              <div className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-2 px-2 flex justify-between items-center">
                <span>Career Files</span>
                <button 
                  onClick={() => setShowSlots(false)}
                  className="text-white/30 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              {saveSlots.map(({ slot, data }) => (
                <div 
                  key={slot}
                  onClick={() => handleSlotAction(slot, data)}
                  className="relative group w-full p-5 border border-white/10 rounded-2xl bg-[#121513]/80 backdrop-blur-md hover:bg-black/60 hover:border-[#00FF88]/50 transition-all cursor-pointer flex justify-between items-center shadow-xl hover:shadow-[#00FF88]/10 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-black/50 border border-white/5 rounded-full flex items-center justify-center font-black text-white/40 group-hover:text-[#00FF88] group-hover:border-[#00FF88]/30 transition-colors">
                      {slot}
                    </div>
                    <div className="text-left">
                      {data ? (
                        <>
                          <h3 className="text-xl font-black uppercase text-white flex items-center gap-2 mb-1">
                            {data.player?.firstName} {data.player?.lastName}
                          </h3>
                          <p className="text-xs text-white/50 font-bold tracking-wider">
                            OVR: <span className="text-[#00FF88]">{data.player?.ovr}</span> &middot; S{data.season} &middot; {getFormattedCalendarDate(data.currentWeek || 1, 'MON')}
                          </p>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                            {data.player?.backstory.replace(/_/g, ' ')}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold uppercase text-white/40 flex items-center gap-2 mb-1">
                            <Star size={18} className="text-white/20" />
                            New Career
                          </h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest">
                            Empty Slot
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {data && deleteConfirmSlot === slot ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 text-xs font-bold mr-2">DELETE?</span>
                      <button
                        onClick={(e) => confirmDelete(slot, e)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        YES
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        NO
                      </button>
                    </div>
                  ) : data && (
                    <button
                      onClick={(e) => handleDeleteSlot(slot, e)}
                      className="p-3 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Save"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

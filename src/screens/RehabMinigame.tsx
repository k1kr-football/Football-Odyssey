import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { Heart, Shield, Activity, RefreshCw, Zap } from 'lucide-react';

export function RehabMinigame() {
 const { state, setPlayer, advanceDay, setScreen } = useGame();
 
 // High-fidelity Clinical grid state
 const [physioEnergy, setPhysioEnergy] = useState(100); // stamina for physio actions
 const [muscles, setMuscles] = useState([
 { id: 'quads', name: 'Quadriceps Group', tension: 70, capacity: 55, icon: '🍗' },
 { id: 'hams', name: 'Hamstrings Fiber', tension: 65, capacity: 50, icon: '🦵' },
 { id: 'calf', name: 'Calf & Achilles', tension: 50, capacity: 45, icon: '🧎' }
 ]);
 
 const [logs, setLogs] = useState<string[]>([
 "Clinical protocol initialized. Target: Lower all muscle tension levels below 35% to secure match authorization.",
 ]);
 const [minigameFinished, setMinigameFinished] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);

 const p = state.player;
 if (!p) return null;

 const handlePhysioAction = (muscleId: string, type: 'ICE' | 'ROLL' | 'NEEDLE' | 'STRETCH') => {
 if (physioEnergy < 20 || minigameFinished) return;
 
 setPhysioEnergy(e => Math.max(0, e - 20));
 
 setMuscles(prevMuscles => {
  let flareupTriggered = false;
  const updated = prevMuscles.map(m => {
  if (m.id !== muscleId) return m;

  let tensionChange = 0;
  let capChange = 0;
  let actionLabel = '';

  if (type === 'ICE') {
   tensionChange = -20;
   capChange = 5;
   actionLabel = 'Cryotherapy / Ice Treatment';
  } else if (type === 'ROLL') {
   tensionChange = -15;
   capChange = 10;
   actionLabel = 'Deep Tissue Foam Rolling';
  } else if (type === 'NEEDLE') {
   tensionChange = -30;
   capChange = -10; // Intense needle increases fragility slightly
   actionLabel = 'Acupuncture Needles Stimulation';
  } else if (type === 'STRETCH') {
   tensionChange = -10;
   capChange = 15;
   actionLabel = 'Active Resistance Stretching';
  }

  const nextTension = Math.max(0, m.tension + tensionChange);
  const nextCap = Math.max(20, Math.min(100, m.capacity + capChange));

  // Random flareup check on heavy manipulation (NEEDLE / ROLL)
  if ((type === 'NEEDLE' || type === 'ROLL') && Math.random() > 0.8) {
   flareupTriggered = true;
   return {
   ...m,
   tension: Math.min(100, m.tension + 15),
   capacity: Math.max(10, m.capacity - 10)
   };
  }

  return { ...m, tension: nextTension, capacity: nextCap };
  });

  // Log update
  const targetMuscle = muscles.find(m => m.id === muscleId);
  if (flareupTriggered) {
  setLogs(l => [`⚠ WARNING: Cellular flareup detected in ${targetMuscle?.name}! Tension surged!`, ...l]);
  } else {
  setLogs(l => [`Completed ${type} on ${targetMuscle?.name}. Tension eased.`, ...l]);
  }

  return updated;
 });
 };

 const evaluateRehabSession = () => {
 // Check if average tension is below 35%
 const averageTension = muscles.reduce((sum, m) => sum + m.tension, 0) / muscles.length;
 const allPassed = muscles.every(m => m.tension <= 40);

 let updatedPlayer = { ...p };
 
 if (allPassed) {
  // Clear injury! Reduce fatigue massively
  updatedPlayer.isInjured = false;
  updatedPlayer.fatigue = Math.max(0, updatedPlayer.fatigue - 45);
  updatedPlayer.sharpness = Math.min(100, updatedPlayer.sharpness + 10);
  updatedPlayer.morale = Math.min(100, updatedPlayer.morale + 15);
  setIsSuccess(true);
  setLogs(l => [
  "🏆 MEDICAL CLEARANCE GRANTED. Roster authorization unlocked. Returning you to first-team selection pool.",
  ...l
  ]);
 } else {
  // Failed to drop tension, setback
  updatedPlayer.fatigue = Math.min(100, updatedPlayer.fatigue + 15);
  updatedPlayer.sharpness = Math.max(0, updatedPlayer.sharpness - 5);
  setIsSuccess(false);
  setLogs(l => [
  "❌ REHAB PROTOCOL INSUFFICIENT. Team medical staff has denied tactical clearance. Try again when fatigue settles.",
  ...l
  ]);
 }

 setPlayer(updatedPlayer);
 setMinigameFinished(true);
 };

 const handleFinish = () => {
 advanceDay(true);
 setScreen('HUB');
 };

 return (
 <div className="flex flex-col h-full bg-[#0a0b0c] p-8 select-none font-sans">
  
  {/* Header Panel */}
  <div className="flex justify-between items-center pb-6 border-b border-white/10 shrink-0">
  <div>
   <h2 className="text-[#38bdf8] text-xs font-bold uppercase tracking-widest font-mono">Therapy Protocol v3.0</h2>
   <h1 className="text-white text-3xl font-black uppercase tracking-tight font-display mt-1">First-Team Rehabilitation Clinic</h1>
  </div>
  <div className="flex items-center gap-6">
   <div className="text-right">
    <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest font-bold">Physio Stamina</span>
    <div className="flex items-center gap-3 mt-1 font-mono">
    <div className="bg-white/10 w-24 h-2 rounded overflow-hidden">
     <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${physioEnergy}%` }}></div>
    </div>
    <span className="text-[#aaa] text-xs font-bold">{physioEnergy} EP</span>
    </div>
   </div>
   <span className="bg-red-950/20 text-red-400 border border-red-500/30 text-[10px] tracking-widest uppercase font-mono px-3 py-1 rounded">
    Tactical Strain
   </span>
  </div>
  </div>

  {minigameFinished ? (
  /* Results Mode */
  <div className="flex-1 flex flex-col justify-center items-center max-w-xl mx-auto text-center space-y-6 animate-fade-in">
   {isSuccess ? (
   <div className="bg-emerald-950/10 border border-emerald-500/30 p-10 rounded space-y-4">
    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center font-black mx-auto text-2xl">
    ✓
    </div>
    <h2 className="text-emerald-400 text-2xl font-black uppercase font-display tracking-tight">Physio Clearance Approved</h2>
    <p className="text-[#ccc] text-sm leading-relaxed font-sans">
    Excellent progression. Deep tissue repair was successful, all muscle group tensions have been brought within safe athletic parameters. Your fatigue has decreased and you are cleared for team training.
    </p>
    <button 
    onClick={handleFinish}
    className="w-full bg-emerald-500 text-black font-semibold uppercase tracking-wider text-xs py-3.5 mt-4"
    >
    Return to Squad Hub
    </button>
   </div>
   ) : (
   <div className="bg-red-950/10 border border-red-500/30 p-10 rounded space-y-4">
    <div className="w-16 h-16 bg-red-500/20 border border-red-500 text-red-400 rounded-full flex items-center justify-center font-black mx-auto text-2xl">
    ✕
    </div>
    <h2 className="text-red-400 text-2xl font-black uppercase font-display tracking-tight">Rehab Setback</h2>
    <p className="text-[#ccc] text-sm leading-relaxed font-sans">
    The muscle bundles still report extremely high stiffness and strain coefficient values. Pushing any further is too dangerous. The medical lead insists on another block of physical protection.
    </p>
    <button 
    onClick={handleFinish}
    className="w-full bg-red-500 text-white font-semibold uppercase tracking-wider text-xs py-3.5 mt-4"
    >
    Accept and Rest
    </button>
   </div>
   )}
  </div>
  ) : (
  /* Active Clinical Grid */
  <div className="flex-1 flex flex-col lg:flex-row gap-6 mt-8">
   
   {/* Left panel: muscle units */}
   <div className="flex-[2] flex flex-col gap-4">
   <h3 className="text-white text-xs font-mono uppercase tracking-wider text-white/50">Target Muscle Complexes</h3>
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {muscles.map(m => (
    <div key={m.id} className="premium-card p-5 rounded flex flex-col justify-between">
     <div>
     <div className="flex justify-between items-start mb-4">
      <span className="text-2xl">{m.icon}</span>
      <div className="text-right">
      <span className="text-white/40 text-[9px] uppercase font-mono block">STIFFNESS</span>
      <span className={`text-lg font-black font-mono leading-none ${m.tension > 60 ? 'text-red-400' : m.tension > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
       {m.tension}%
      </span>
      </div>
     </div>
     <h4 className="text-white text-md font-bold uppercase tracking-wider font-display">{m.name}</h4>
     <p className="text-[#555] text-[10px] font-mono uppercase tracking-widest mt-1">Elasticity Cap: {m.capacity}%</p>
     </div>

     <div className="space-y-1.5 mt-6 border-t border-[#1a1a1a] pt-4">
     <button
      onClick={() => handlePhysioAction(m.id, 'ICE')}
      className="w-full py-1.5 hover:bg-sky-500/10 text-sky-400 hover:border-sky-400/50 border border-transparent transition-all rounded text-[10px] uppercase font-mono font-bold"
     >
      ❄ Cryo Ice (Tension -20)
     </button>
     <button
      onClick={() => handlePhysioAction(m.id, 'ROLL')}
      className="w-full py-1.5 hover:bg-amber-500/10 text-amber-400 hover:border-amber-400/50 border border-transparent transition-all rounded text-[10px] uppercase font-mono font-bold"
     >
      🩹 Foam Roll (Tension -15)
     </button>
     <button
      onClick={() => handlePhysioAction(m.id, 'NEEDLE')}
      className="w-full py-1.5 hover:bg-red-500/10 text-red-400 hover:border-red-400/50 border border-transparent transition-all rounded text-[10px] uppercase font-mono font-bold"
     >
      💉 Needle Stim (Tension -30)
     </button>
     <button
      onClick={() => handlePhysioAction(m.id, 'STRETCH')}
      className="w-full py-1.5 hover:bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/50 border border-transparent transition-all rounded text-[10px] uppercase font-mono font-bold"
     >
      ⚡ Stretch Core (Tension -10)
     </button>
     </div>
    </div>
    ))}
   </div>
   
   {/* Action panel */}
   <div className="premium-card/40 p-5 rounded mt-4 flex justify-between items-center">
    <span className="text-white/50 text-xs font-mono leading-relaxed">
    Ensure all muscle stiffnesses are dropped to 40% or lower before clicking secure clearance evaluation.
    </span>
    <button
    onClick={evaluateRehabSession}
    className="bg-[#38bdf8] text-black px-8 py-3 text-xs font-mono uppercase font-bold tracking-widest hover:bg-[#0ea5e9]"
    >
    Secure Medical Clearance
    </button>
   </div>
   </div>

   {/* Right panel: Live Logs */}
   <div className="flex-1 premium-card p-6 flex flex-col justify-between">
   <div>
    <h3 className="text-white text-xs font-display uppercase tracking-widest pb-3 border-b border-white/10 mb-4">Therapeutic Clinical Log</h3>
    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 hide-scrollbar">
    {logs.map((log, i) => (
     <div key={i} className={`text-[11px] font-mono leading-relaxed pb-2 border-b border-white/10/15 last:border-0 
     ${log.startsWith('⚠') ? 'text-red-400' : log.startsWith('🏆') ? 'text-emerald-400' : 'text-white/50'}
     `}>
     {log}
     </div>
    ))}
    </div>
   </div>
   <div className="glass-panel p-4 rounded border border-[#2c2c2c] text-[10px] text-[#555] font-mono uppercase leading-relaxed mt-4">
    CRITICAL protocol rule: Acupuncture needles can trigger unexpected flareups that instantly increase tension. Use surgical precision.
   </div>
   </div>

  </div>
  )}

 </div>
 );
}

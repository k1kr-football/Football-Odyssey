import re

with open('src/screens/MatchEngine.tsx', 'r') as f:
    content = f.read()

old_metrics = """  <div className="premium-card p-6 flex-1 flex flex-col">
   <div className="text-[#C9A84C] text-xs font-bold tracking-widest uppercase mb-6 pb-4 border-b border-white/10">Live Player Metrics</div>
   
   <div className="space-y-6">
    <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Distance Covered</span>
     <span className="text-white">{distanceCovered.toFixed(1)} km</span>
    </div>
    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-[#555] transition-all duration-300" style={{ width: `${Math.min(100, distanceCovered * 8)}%`}}></div>
    </div>
    </div>
    
    <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Passes Completed</span>
     <span className="text-white">{passesCompleted} / {passesMade}</span>
    </div>
    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-[#C9A84C] transition-all duration-300" style={{ width: `${passesMade > 0 ? (passesCompleted/passesMade)*100 : 0}%`}}></div>
    </div>
    </div>
    <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
     <span className="text-white/50">Live Condition // Fatigue</span>
     <span className={`text-${(state.player?.fatigue || 0) + (minute / 90 * 40) > 80 ? 'red-500' : 'white'}`}>
      {Math.min(100, Math.floor((state.player?.fatigue || 0) + (minute / 90 * 40)))}%
     </span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
     <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.min(100, (state.player?.fatigue || 0) + (minute / 90 * 40))}%`}}></div>
    </div>
    </div>
   </div>"""

new_metrics = """  <div className="glass-panel p-6 flex-1 flex flex-col">
   <div className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-6 pb-4 border-b border-white/5 flex justify-between">
     <span>Live Player Metrics</span>
     <span className="text-team-accent">MATCH {minute}'</span>
   </div>
   
   <div className="space-y-6">
    <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-1.5">
     <span className="text-white/50">Player Condition</span>
     <span className={Math.min(100, (state.player?.fatigue || 0) + (minute / 90 * 40)) > 80 ? 'text-red-400 font-mono' : 'text-emerald-400 font-mono'}>
      {Math.min(100, Math.floor(100 - ((state.player?.fatigue || 0) + (minute / 90 * 40))))}%
     </span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
     <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.max(0, 100 - ((state.player?.fatigue || 0) + (minute / 90 * 40)))}%`}}></div>
    </div>
    </div>

    <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-1.5">
     <span className="text-white/50">Distance Covered</span>
     <span className="text-white font-mono">{distanceCovered.toFixed(1)} km</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
     <div className="h-full bg-white/30 transition-all duration-300" style={{ width: `${Math.min(100, distanceCovered * 8)}%`}}></div>
    </div>
    </div>
    
    <div>
    <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-1.5">
     <span className="text-white/50">Passes</span>
     <span className="text-white font-mono">{passesCompleted} / {passesMade}</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
     <div className="h-full bg-team-accent transition-all duration-300" style={{ width: `${passesMade > 0 ? (passesCompleted/passesMade)*100 : 0}%`}}></div>
    </div>
    </div>
   </div>"""

content = content.replace(old_metrics, new_metrics)

with open('src/screens/MatchEngine.tsx', 'w') as f:
    f.write(content)

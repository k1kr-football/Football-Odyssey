import re

with open('src/screens/Training.tsx', 'r') as f:
    content = f.read()

# 1. Add state variable for activeHabit
state_target = "  const [drillIntensity, setDrillIntensity] = useState<'LIGHT' | 'STANDARD' | 'INTENSE'>('STANDARD');"
state_replacement = """  const [drillIntensity, setDrillIntensity] = useState<'LIGHT' | 'STANDARD' | 'INTENSE'>('STANDARD');
  const [activeHabit, setActiveHabit] = useState<string | null>(null);"""
if state_target in content:
    content = content.replace(state_target, state_replacement)
else:
    print("Failed to inject activeHabit state")

# 2. Apply habit in finalizeMinigame
finalize_target = """    player.training = player.training || {
      weeklySessions: { clubOrganized: 0, individual: 0, recovery: 0, trainingMatch: 0 },
      sessionHistory: [],
      trainingMatchHistory: []
    };
    player.training.weeklySessions.individual = (player.training.weeklySessions.individual || 0) + 1;

    deltas.push({ attr: 'Drill Grade', gain: grade });
    deltas.push({ attr: 'Fatigue Load', gain: `+${fatigueAdd}%` });
    deltas.push({ attr: 'Match Sharpness', gain: `+${sharpnessAdd}%` });"""

finalize_replacement = """    player.training = player.training || {
      weeklySessions: { clubOrganized: 0, individual: 0, recovery: 0, trainingMatch: 0 },
      sessionHistory: [],
      trainingMatchHistory: []
    };
    player.training.weeklySessions.individual = (player.training.weeklySessions.individual || 0) + 1;

    // Apply Daily Habit Bonuses
    if (activeHabit === 'EXTRA_YOGA') {
      fatigueAdd = Math.max(0, fatigueAdd - 3);
      player.sharpness = Math.min(100, (player.sharpness || 0) + 2);
      deltas.push({ attr: 'Fatigue (Yoga)', gain: '-3%' });
    } else if (activeHabit === 'FILM_STUDY') {
      player.attributes.vision = Math.min(99, (player.attributes.vision || 50) + 0.1);
      player.attributes.positioning = Math.min(99, (player.attributes.positioning || 50) + 0.1);
      deltas.push({ attr: 'Vis/Pos (Film)', gain: '+0.1' });
    } else if (activeHabit === 'DIET_DISCIPLINE') {
      player.attributes.stamina = Math.min(99, (player.attributes.stamina || 50) + 0.1);
      player.morale = Math.min(100, (player.morale || 50) + 2);
      deltas.push({ attr: 'Stamina (Diet)', gain: '+0.1' });
    }

    deltas.push({ attr: 'Drill Grade', gain: grade });
    deltas.push({ attr: 'Fatigue Load', gain: `+${fatigueAdd}%` });
    deltas.push({ attr: 'Match Sharpness', gain: `+${sharpnessAdd}%` });"""
if finalize_target in content:
    content = content.replace(finalize_target, finalize_replacement)
else:
    print("Failed to inject habit bonuses into finalizeMinigame")


# 3. Add UI before the Drills section
ui_target = """          <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">"""
ui_replacement = """          <div className="lg:col-span-2 space-y-6">
            
            {/* Daily Habits Module */}
            <div className="bg-[#121212] border border-white/10 p-5 rounded-2xl shadow-xl animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pre-Training Habit</h3>
              </div>
              <p className="text-[11px] font-mono text-white/50 mb-4">Choose a focused activity to perform before your daily drill to gain minor, situational stat boosts.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => setActiveHabit('EXTRA_YOGA')}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-2 ${activeHabit === 'EXTRA_YOGA' ? 'bg-purple-500/20 border-purple-400' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xl">🧘</span>
                    {activeHabit === 'EXTRA_YOGA' && <CheckCircle2 size={16} className="text-purple-400" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${activeHabit === 'EXTRA_YOGA' ? 'text-purple-400' : 'text-white'}`}>Extra Yoga</h4>
                    <p className="text-[9px] font-mono text-white/60 mt-1">-3% Drill Fatigue<br/>+2% Sharpness</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveHabit('FILM_STUDY')}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-2 ${activeHabit === 'FILM_STUDY' ? 'bg-blue-500/20 border-blue-400' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xl">📺</span>
                    {activeHabit === 'FILM_STUDY' && <CheckCircle2 size={16} className="text-blue-400" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${activeHabit === 'FILM_STUDY' ? 'text-blue-400' : 'text-white'}`}>Film Study</h4>
                    <p className="text-[9px] font-mono text-white/60 mt-1">+0.1 Vision<br/>+0.1 Positioning</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveHabit('DIET_DISCIPLINE')}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-2 ${activeHabit === 'DIET_DISCIPLINE' ? 'bg-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xl">🥗</span>
                    {activeHabit === 'DIET_DISCIPLINE' && <CheckCircle2 size={16} className="text-emerald-400" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${activeHabit === 'DIET_DISCIPLINE' ? 'text-emerald-400' : 'text-white'}`}>Diet Discipline</h4>
                    <p className="text-[9px] font-mono text-white/60 mt-1">+0.1 Stamina<br/>+2 Morale</p>
                  </div>
                </button>
              </div>
            </div>

          <div className="flex justify-between items-center border-b border-white/10 pb-3 mt-6">"""

if ui_target in content:
    content = content.replace(ui_target, ui_replacement)
else:
    print("Failed to inject UI")

with open('src/screens/Training.tsx', 'w') as f:
    f.write(content)

print("Modifications complete.")

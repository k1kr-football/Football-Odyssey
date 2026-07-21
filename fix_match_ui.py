import re

with open('src/screens/MatchEngine.tsx', 'r') as f:
    content = f.read()

# 1. Clean up PRE phase UI
pre_match_ui = """
   {preMatchStep === 0 && (
   <div className="col-span-2 flex justify-between items-center bg-[#111] border border-white/5 rounded-lg p-4 mb-4 mt-2">
     <div className="flex flex-col text-left">
       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Match Conditions</span>
       <div className="flex items-center gap-4 mt-1 text-xs font-bold text-white">
         <span className="flex items-center gap-1.5">{weather?.icon} {weather?.type}</span>
         <span className="w-px h-3 bg-white/20"></span>
         <span className="flex items-center gap-1.5">{pitch?.icon} {pitch?.type} Pitch</span>
       </div>
     </div>
     <div className="flex flex-col text-right">
       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Tactical Setup</span>
       <span className="text-emerald-400 font-mono font-black text-sm tracking-widest mt-1">4-3-3</span>
     </div>
   </div>
   )}
"""
content = re.sub(r'   \{preMatchStep === 0 && \(\n   <div className="col-span-2 grid grid-cols-3 gap-4 mb-4">.*?   </div>\n   \)\}', pre_match_ui.strip('\n'), content, flags=re.DOTALL)

# 2. Fix Commentary Log styling
commentary_old = r"""    \{logs\.map\(\(log, i\) => \(\n    <div key=\{i\} className=\{`flex gap-6 py-3 border-b border-white/10/50 last:border-0 \n     \$\{log\.isPlayerFeature \? \(log\.fail \? 'text-orange-500 bg-orange-500/5 -mx-4 px-4' : 'text-\[#C9A84C\] bg-\[#C9A84C\]/5 -mx-4 px-4'\) : \(log\.isOpp \? 'text-red-400' : 'text-\[#cccccc\]'\)\}\n    `\}>\n     <div className="text-white/40 font-bold w-8 shrink-0">\{log\.m\}'</div>\n     <div className=\{log\.isPlayerFeature \? 'font-bold tracking-wide' : ''\}>\{log\.text\}</div>\n    </div>\n    \)\)\}"""
commentary_new = """
    {logs.map((log, i) => {
      let logClass = "flex gap-4 py-2.5 items-start text-white/70";
      let minClass = "text-white/30 font-mono text-xs mt-0.5 w-8 shrink-0 text-right";
      let textClass = "";
      
      if (log.isPlayerFeature) {
        logClass = "flex gap-4 py-3 items-start";
        textClass = log.fail ? "text-orange-400 font-bold" : "text-team-accent font-bold";
        minClass = log.fail ? "text-orange-500/50 font-mono text-xs mt-0.5 w-8 shrink-0 text-right" : "text-team-accent/50 font-mono text-xs mt-0.5 w-8 shrink-0 text-right";
      } else if (log.isOpp) {
        logClass = "flex gap-4 py-2.5 items-start text-white/50";
        textClass = "text-red-300/80";
      }

      return (
        <div key={i} className={logClass}>
          <div className={minClass}>{log.m}'</div>
          <div className={`flex-1 ${textClass}`}>
             {log.isPlayerFeature && !log.fail && <span className="mr-2">⚡</span>}
             {log.isPlayerFeature && log.fail && <span className="mr-2">⚠️</span>}
             {log.text}
          </div>
        </div>
      );
    })}
"""
content = re.sub(commentary_old, commentary_new.strip('\n'), content, flags=re.DOTALL)

with open('src/screens/MatchEngine.tsx', 'w') as f:
    f.write(content)

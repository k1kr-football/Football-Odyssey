import re

with open('src/screens/MatchEngine.tsx', 'r') as f:
    content = f.read()

replacement = """    <div>
     <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
     <span>Match Control</span>
     </div>
     <div className="w-full h-1.5 bg-white/10 relative overflow-hidden rounded-full">
     <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#111] z-10"></div>
     <div className={`absolute top-0 bottom-0 transition-all duration-300 ${teamMomentum < 50 ? 'bg-red-500' : 'bg-team-accent'}`}
       style={{
        left: teamMomentum < 50 ? `${teamMomentum}%` : '50%',
       right: teamMomentum > 50 ? `${100 - teamMomentum}%` : '50%'
       }}
     ></div>
     </div>
    </div>
    
    <div>
     <div className="flex justify-between items-center text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
       <span>Match Pressure</span>
       <span className="font-mono text-white/80">{matchPressure}/10</span>
     </div>
     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
       <div 
          className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${matchPressure > 7 ? 'bg-red-500' : matchPressure > 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${(matchPressure / 10) * 100}%` }}
       />
     </div>
    </div>"""

content = re.sub(r'    <div>\n     <div className="flex justify-between text-\[10px\] font-bold text-white/50 uppercase tracking-widest mb-1\.5">\n     <span>Team Momentum</span>\n     </div>\n     <div className="w-full h-1\.5 bg-white/10 relative overflow-hidden">\n     <div className="absolute top-0 bottom-0 left-1/2 w-0\.5 bg-\[#555\] z-10"></div>\n     <div className=\{`absolute top-0 bottom-0 transition-all duration-300 \$\{teamMomentum < 50 \? \'bg-red-500\' : \'bg-\[#C9A84C\]\'\}`\}\n       style=\{\{ ?\n       left: teamMomentum < 50 \? `\$\{teamMomentum\}%` : \'50%\',\n       right: teamMomentum > 50 \? `\$\{100 - teamMomentum\}%` : \'50%\'\n       \}\}\n     ></div>\n     </div>\n    </div>', replacement, content)

with open('src/screens/MatchEngine.tsx', 'w') as f:
    f.write(content)

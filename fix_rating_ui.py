import re

with open('src/screens/MatchEngine.tsx', 'r') as f:
    content = f.read()

# Fix the CLEAR text
content = content.replace("{minute}' <span className=\"mx-2 text-[#444]\">·</span> {matchPhase === 'POST' ? 'FULL TIME' : 'CLEAR'}",
                          "{minute}' <span className=\"mx-2 text-[#444]\">·</span> {matchPhase === 'POST' ? 'FULL TIME' : 'LIVE'}")

old_rating = """  <div className="premium-card p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
   <h3 className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest mb-4 absolute top-6 left-6 relative left-0 top-0 mb-3 w-full text-left">Match Rating</h3>
   <div className={`text-6xl font-black transition-colors ${matchRating >= 7.5 ? 'text-emerald-500' : matchRating < 6.5 ? 'text-red-500' : 'text-white'}`}>
    {matchRating.toFixed(1)}
   </div>
  </div>"""

new_rating = """  <div className="glass-panel p-6 flex flex-col items-center justify-center shrink-0">
   <div className="flex justify-between items-center w-full mb-2">
     <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Match Rating</h3>
     <div className="w-2 h-2 rounded-full bg-team-accent animate-pulse"></div>
   </div>
   <div className={`text-5xl font-black font-mono tracking-tighter transition-colors mt-2 ${matchRating >= 7.5 ? 'text-emerald-400' : matchRating < 6.5 ? 'text-red-400' : 'text-white'}`}>
    {matchRating.toFixed(1)}
   </div>
  </div>"""

content = content.replace(old_rating, new_rating)

with open('src/screens/MatchEngine.tsx', 'w') as f:
    f.write(content)

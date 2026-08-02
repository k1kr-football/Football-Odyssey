import re
with open('src/screens/Career.tsx', 'r') as f:
    content = f.read()

# I want to find the whole TIMELINE block start
match = re.search(r'  \{activeTab === \'TIMELINE\' && \(\s*<div className="flex-1 flex flex-col.*?<div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 relative z-20">\s*<div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center mb-3 border border-white/5">\s*<Trophy className="text-\[#444\] w-6 h-6" />\s*</div>\s*<div className="text-white/40 text-\[11px\] font-bold uppercase tracking-widest">No timeline events recorded yet</div>\s*<p className="text-\[#555\] text-\[10px\] max-w-\[320px\] mt-1 leading-relaxed">Major career milestones, transfers, and achievements will be chronicled here\.</p>\s*</div>\s*\)\}\s*</div>\s*\)\}', content, re.DOTALL)

if match:
    replacement = """  {activeTab === 'TIMELINE' && (
   <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative p-4 bg-zinc-950/20 rounded-xl border border-white/5">
   <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-white/5 via-white/20 to-transparent z-0"></div>
   {(player.timeline && player.timeline.length > 0) ? player.timeline.slice().reverse().map((event: any, idx: number) => (
    <div key={idx} className="relative z-10 flex gap-6 mb-8 group">
     <div className="w-12 flex flex-col items-center shrink-0">
      <div className="text-[10px] text-white/50 font-bold mb-2 uppercase font-mono">W{event.week}</div>
      {event.clubSymbol ? (
       <TeamLogo symbol={event.clubSymbol} size={32} />
      ) : (
       <div className="text-white/50 text-[9px] font-bold font-mono uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded mt-1">SYSTEM</div>
      )}
     </div>
     <div className="flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-0.5">
       <div className={`text-[9px] font-bold uppercase tracking-widest ${event.title.includes('🏆') ? 'text-amber-500 animate-pulse' : 'text-[#00FF88]'}`}>{event.title.includes('🏆') ? 'RECORD' : event.type}</div>
      </div>
      <div className={`font-bold text-md mb-1 ${event.title.includes('🏆') ? 'text-amber-500' : 'text-white'}`}>{event.title}</div>
      <div className="text-[#aaa] text-xs leading-relaxed">{event.description}</div>
     </div>
    </div>
   )) : (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 relative z-20">
    <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center mb-3 border border-white/5">
     <Trophy className="text-[#444] w-6 h-6" />
    </div>
    <div className="text-white/40 text-[11px] font-bold uppercase tracking-widest">No timeline events recorded yet</div>
    <p className="text-[#555] text-[10px] max-w-[320px] mt-1 leading-relaxed">Major career milestones, transfers, and achievements will be chronicled here.</p>
    </div>
   )}
   </div>
  )}"""
    content = content[:match.start()] + replacement + content[match.end():]

with open('src/screens/Career.tsx', 'w') as f:
    f.write(content)

import re
with open('src/screens/Career.tsx', 'r') as f:
    content = f.read()

# I want to find the end of the REPUTATION tab which is:
#      </div>
#     )}
#    </div>
#   </div>
#  )}
#  {/* NEW TAB: SOCIAL PR STUDIO */}
#  ()

match = re.search(r'\{/\* NEW TAB: SOCIAL PR STUDIO \*/\}.*?\(\)\s*\) : \(\s*<div className="text-white/50 text-\[9px\]', content, re.DOTALL)
if match:
    replacement = """
  {activeTab === 'TIMELINE' && (
   <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative p-4 bg-zinc-950/20 rounded-xl border border-white/5">
   <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-white/5 via-white/20 to-transparent z-0"></div>
   {(player.timeline && player.timeline.length > 0) ? player.timeline.slice().reverse().map((event: any, idx: number) => (
    <div key={idx} className="relative z-10 flex gap-6 mb-8 group">
     <div className="w-12 flex flex-col items-center shrink-0">
      <div className="text-[10px] text-white/50 font-bold mb-2 uppercase font-mono">W{event.week}</div>
      {event.clubSymbol ? (
       <TeamLogo symbol={event.clubSymbol} size={32} />
      ) : (
       <div className="text-white/50 text-[9px] font-bold font-mono uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded mt-1">SYSTEM</div>"""
    
    content = content[:match.start()] + replacement + content[match.end():]
    
with open('src/screens/Career.tsx', 'w') as f:
    f.write(content)


import re

with open('src/screens/MatchEngine.tsx', 'r') as f:
    content = f.read()

# Replace the entire return statement
# We find the start of the returns for different phases.
# The main return is in `if (matchPhase === 'PRE_TALK' || matchPhase === 'FULL_TIME_TALK') {`
# We can just replace everything from `if (matchPhase === 'PRE_TALK' || matchPhase === 'FULL_TIME_TALK') {` to the end of the file with a much simpler minimalist UI.

# Let's find the position of `if (matchPhase === 'PRE_TALK' || matchPhase === 'FULL_TIME_TALK') {`
split_marker = "if (matchPhase === 'PRE_TALK' || matchPhase === 'FULL_TIME_TALK') {"
parts = content.split(split_marker)

if len(parts) == 2:
    logic_part = parts[0]
    
    ui_part = """if (matchPhase === 'PRE_TALK' || matchPhase === 'FULL_TIME_TALK') {
 const isWin = homeScore > awayScore;
 const isLoss = homeScore < awayScore;
 const tone = isLoss ? "Disappointed" : (isWin ? "Praising" : "Muted");
 const message = isLoss ? "Unacceptable performance." : (isWin ? "Brilliant work." : "We need more.");
 return (
  <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 p-8 text-center text-white">
   <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">{tone} Team Talk</div>
   <h1 className="text-2xl font-bold tracking-tight">"{message}"</h1>
   <div className="flex gap-4 mt-4">
   {talkResponse === null ? (
    <>
    <button onClick={() => handleTeamTalkResponse('POSITIVE')} className="px-6 py-3 border border-white/10 hover:border-white text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">Nod</button>
    <button onClick={() => handleTeamTalkResponse('MUTED')} className="px-6 py-3 border border-white/10 hover:border-white text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">Stay Silent</button>
    <button onClick={() => handleTeamTalkResponse('FRUSTRATED')} className="px-6 py-3 border border-white/10 hover:border-white text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">Look Frustrated</button>
    <button onClick={() => handleTeamTalkResponse('CONTINUE')} className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors">Skip</button>
    </>
   ) : (
    <div className="text-sm font-bold uppercase tracking-widest text-white/50">Reaction Registered</div>
   )}
   </div>
  </div>
 );
 }

 if (matchPhase === 'HALF_TIME_TALK') {
  return (
   <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 p-8 text-center text-white">
    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Half Time Talk</div>
    <h1 className="text-2xl font-bold tracking-tight">"Listen up."</h1>
    <div className="flex gap-4 mt-4">
    {talkResponse === null ? (
     <>
      <button onClick={() => handleHalfTimeResponse('team')} className="px-6 py-3 border border-white/10 hover:border-white text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">Rally Team</button>
      <button onClick={() => handleHalfTimeResponse('fans')} className="px-6 py-3 border border-white/10 hover:border-white text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">Praise Fans</button>
      <button onClick={() => handleHalfTimeResponse('referee')} className="px-6 py-3 border border-white/10 hover:border-white text-xs font-bold uppercase tracking-widest text-white/50 transition-colors">Blame Ref</button>
      <button onClick={() => handleHalfTimeResponse('silent')} className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors">Skip</button>
     </>
    ) : (
     <div className="text-sm font-bold uppercase tracking-widest text-white/50">Reaction Registered</div>
    )}
    </div>
   </div>
  );
 }

 if (matchPhase === 'POST_MATCH_SUMMARY') {
  return (
   <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 p-8 text-center text-white">
    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Match Summary</div>
    <h1 className="text-3xl font-bold tracking-tighter uppercase">{homeScore} - {awayScore}</h1>
    <div className="grid grid-cols-2 gap-8 text-left border border-white/10 p-8">
     <div>
      <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Match Rating</div>
      <div className="text-xl font-bold">{matchRating.toFixed(1)}</div>
     </div>
     <div>
      <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Passes</div>
      <div className="text-xl font-bold">{passesCompleted}/{passesMade}</div>
     </div>
    </div>
    <button onClick={handlePostMatchSummaryContinue} className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors mt-4">End Match</button>
   </div>
  );
 }

 if (matchPhase === 'PRE') {
  return (
   <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 p-8 text-center text-white">
    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Pre-Match Preparation</div>
    <h1 className="text-3xl font-bold uppercase tracking-tighter">
     {preMatchStep === 0 ? "Warm-Up" : preMatchStep === 1 ? "Mental Focus" : "Tactics"}
    </h1>
    <div className="flex gap-4">
     {getPreMatchOptions().map((opt) => (
      <button key={opt.key} onClick={() => handlePreMatchChoice(opt.key)} className="p-6 border border-white/10 hover:border-white transition-colors text-left flex flex-col">
       <span className="font-bold uppercase tracking-wider mb-2">{opt.title}</span>
       <span className="text-white/50 text-[10px] leading-tight max-w-[200px]">{opt.desc}</span>
      </button>
     ))}
    </div>
    {preMatchStep === 0 && (
     <button onClick={handleQuickSimulate} className="mt-8 text-white/40 hover:text-white text-[10px] uppercase tracking-widest font-bold">Quick Simulate Match</button>
    )}
   </div>
  );
 }

 return (
  <div className="flex flex-col lg:flex-row min-h-[500px] w-full gap-8 p-8 text-white">
   <div className="flex-1 flex flex-col gap-8">
    <div className="border border-white/10 p-8 text-center">
     <div className="text-4xl font-bold tracking-tighter mb-2">{homeScore} - {awayScore}</div>
     <div className="text-white/50 text-xs font-bold uppercase tracking-widest">{minute}' | LIVE</div>
    </div>
    <div className="flex-1 border border-white/10 p-6 overflow-y-auto no-scrollbar flex flex-col gap-2">
     {logs.map((log, i) => (
      <div key={i} className={`flex gap-4 text-xs font-mono ${log.isPlayerFeature ? (log.fail ? 'text-red-400' : 'text-white font-bold') : 'text-white/50'}`}>
       <div className="w-8 shrink-0">{log.m}'</div>
       <div>{log.text}</div>
      </div>
     ))}
     <div ref={logsEndRef} />
    </div>
   </div>
   <div className="w-full lg:w-1/3 border border-white/10 p-6 flex flex-col justify-center">
    {isDecisionFrame ? (
     <div className="flex flex-col gap-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Critical Decision</div>
      {currentHint && <div className="text-xs mb-4">{currentHint}</div>}
      <div className="flex flex-col gap-2">
       {decisionOptions.map((opt, i) => (
        <button key={i} onClick={() => handleDecision(opt)} className="p-4 border border-white/10 hover:border-white transition-colors text-left text-xs font-bold uppercase tracking-widest">
         {opt.text}
        </button>
       ))}
      </div>
     </div>
    ) : (
     <div className="flex flex-col items-center justify-center text-white/50 text-[10px] font-bold uppercase tracking-widest gap-4 h-full">
      {isBenched ? (
       <div className="text-center">
        <div className="mb-4">On the Bench</div>
        <button onClick={() => setWarmupLevel(Math.min(100, warmupLevel + 25))} className="px-6 py-3 border border-white/10 hover:border-white transition-colors">Warm Up</button>
       </div>
      ) : (
       <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      )}
     </div>
    )}
   </div>
  </div>
 );
}
"""
    
    new_content = logic_part + ui_part
    with open('src/screens/MatchEngine.tsx', 'w') as f:
        f.write(new_content)
    print("MatchEngine UI replaced successfully.")
else:
    print("Could not find the split marker.")


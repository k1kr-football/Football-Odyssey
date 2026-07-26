const fs = require('fs');
let code = fs.readFileSync('src/screens/Hub.tsx', 'utf8');

const oldButton = `<button 
     onClick={() => advanceDay()}
     className="bg-transparent hover:border-[#00FF88] hover:text-[#00FF88] px-12 py-4 font-black text-white uppercase tracking-widest transition-colors text-xs flex items-center gap-3 rounded-lg shadow-md"
    >
     Advance Calendar <ArrowRight size={14}/>
    </button>`;

const newButton = `<div className="relative group">
    <button 
     onClick={() => !isAdvanceBlocked && advanceDay()}
     disabled={isAdvanceBlocked}
     className={\`relative px-12 py-4 font-black uppercase tracking-widest text-xs flex flex-col items-center gap-1.5 rounded-lg transition-all duration-300
      \${isAdvanceBlocked 
        ? "bg-transparent border-2 border-white/10 text-white/30 cursor-not-allowed" 
        : "bg-transparent border-2 border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88]/10 hover:shadow-[0_0_20px_rgba(0,255,136,0.25)]"}
     \`}
    >
     <div className="flex items-center gap-3">
      Advance Calendar <ArrowRight size={14} className={isAdvanceBlocked ? 'opacity-50' : 'opacity-100'}/>
     </div>
     <div className={\`text-[10px] font-mono tracking-wider \${isAdvanceBlocked ? 'text-white/20' : 'text-[#00FF88]/70'} transition-colors\`}>
      Next: {nextDay}, {nextDateStr}
     </div>
    </button>
    
    {isAdvanceBlocked && (
     <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
      <span className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
       <span className="relative inline-flex rounded-full bg-[#1a0a0a] border border-red-500 text-red-400 text-[9px] font-bold px-2.5 py-0.5 uppercase tracking-widest shadow-lg flex items-center gap-1.5">
        <AlertTriangle size={10} /> ⚠ {criticalCount} pending
       </span>
      </span>
     </div>
    )}

    {isAdvanceBlocked && (
     <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 flex flex-col items-center">
      <div className="w-2 h-2 border-t border-l border-white/10 bg-[#111] rotate-45 -mb-1"></div>
      <div className="bg-[#111] border border-white/10 text-white/70 text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg flex flex-col items-center gap-1 shadow-2xl backdrop-blur-md">
       <span className="text-red-400 font-bold">Action Required</span>
       <span className="text-white/50 text-[9px]">Check your inbox to resolve critical items.</span>
      </div>
     </div>
    )}
   </div>`;

code = code.replace(oldButton, newButton);
fs.writeFileSync('src/screens/Hub.tsx', code);

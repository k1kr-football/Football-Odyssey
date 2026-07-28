const fs = require('fs');
let content = fs.readFileSync('src/screens/MainMenu.tsx', 'utf8');

// Replace Settings button and add Heart button
content = content.replace(
  `      {/* Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20 border border-white/10"
        title="Settings"
      >
        <Settings size={24} className="text-white/70" />
      </button>`,
  `      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <a 
          href="https://selar.com/showlove/k1kr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 bg-white/5 hover:bg-[#00FF88]/20 rounded-full transition-colors border border-white/10 hover:border-[#00FF88]/50 group"
          title="Support the Developer"
        >
          <Heart size={24} className="text-white/70 group-hover:text-[#00FF88] transition-colors" />
        </a>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
          title="Settings"
        >
          <Settings size={24} className="text-white/70" />
        </button>
      </div>`
);

// Remove links from bottom
content = content.replace(
  `<div className="mt-auto hidden md:block pt-24 text-[#444444] text-[9px] uppercase tracking-[0.2em] flex flex-col items-start gap-2">
            <span className="pointer-events-none">SYSTEM ONLINE &middot; FULL-STACK PROTOCOL v2.1</span>
            <a 
              href="https://selar.com/showlove/k1kr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#00FF88]/70 hover:text-[#00FF88] transition-colors flex items-center gap-1 mt-2"
            >
              <Heart size={10} className="inline" /> SUPPORT THE DEVELOPER
            </a>
          </div>`,
  `<div className="mt-auto hidden md:block pt-24 text-[#444444] text-[9px] uppercase tracking-[0.2em] flex flex-col items-start gap-2">
            <span className="pointer-events-none">SYSTEM ONLINE &middot; FULL-STACK PROTOCOL v2.1</span>
          </div>`
);

content = content.replace(
  `<div className="mt-8 md:hidden text-[#444444] text-[9px] uppercase tracking-[0.2em] flex flex-col items-center gap-2">
            <span className="pointer-events-none">SYSTEM ONLINE &middot; FULL-STACK PROTOCOL v2.1</span>
            <a 
              href="https://selar.com/showlove/k1kr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#00FF88]/70 hover:text-[#00FF88] transition-colors flex items-center gap-1 mt-2"
            >
              <Heart size={10} className="inline" /> SUPPORT THE DEVELOPER
            </a>
          </div>`,
  `<div className="mt-8 md:hidden text-[#444444] text-[9px] uppercase tracking-[0.2em] flex flex-col items-center gap-2">
            <span className="pointer-events-none">SYSTEM ONLINE &middot; FULL-STACK PROTOCOL v2.1</span>
          </div>`
);

fs.writeFileSync('src/screens/MainMenu.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// replace everything with a connected version

const newContent = `import React from 'react';
import { X, Volume2, Monitor, Keyboard, Gamepad2, AlertCircle } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { AppSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings, resetData } = useGame();

  const handleToggle = (key: keyof AppSettings) => {
    updateSettings({ [key]: !settings[key] });
    
    // Specifically handle Fullscreen toggle
    if (key === 'fullscreen') {
      if (!settings.fullscreen) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to completely reset all saves and settings? This cannot be undone.")) {
      resetData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} className="text-white/70 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-white/80 space-y-8 font-mono">
          
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[#00FF88] uppercase tracking-widest border-b border-[#00FF88]/20 pb-2 flex items-center gap-2">
              <Volume2 size={16} /> Audio
            </h3>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
              <span>Master Volume</span>
              <input type="range" className="accent-[#00FF88]" min="0" max="100" value={settings.masterVolume} onChange={(e) => updateSettings({ masterVolume: parseInt(e.target.value) })} />
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
              <span>Music Volume</span>
              <input type="range" className="accent-[#00FF88]" min="0" max="100" value={settings.musicVolume} onChange={(e) => updateSettings({ musicVolume: parseInt(e.target.value) })} />
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
              <span>SFX Volume</span>
              <input type="range" className="accent-[#00FF88]" min="0" max="100" value={settings.sfxVolume} onChange={(e) => updateSettings({ sfxVolume: parseInt(e.target.value) })} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[#00FF88] uppercase tracking-widest border-b border-[#00FF88]/20 pb-2 flex items-center gap-2">
              <Monitor size={16} /> Display
            </h3>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
              <span>Fullscreen</span>
              <button 
                onClick={() => handleToggle('fullscreen')}
                className={\`w-12 h-6 \${settings.fullscreen ? 'bg-[#00FF88]' : 'bg-white/20'} rounded-full relative transition-colors\`}
              >
                <span className={\`absolute top-1 w-4 h-4 bg-black rounded-full transition-all \${settings.fullscreen ? 'right-1' : 'left-1'}\`}></span>
              </button>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
              <span>Animations</span>
              <button 
                onClick={() => handleToggle('animations')}
                className={\`w-12 h-6 \${settings.animations ? 'bg-[#00FF88]' : 'bg-white/20'} rounded-full relative transition-colors\`}
              >
                <span className={\`absolute top-1 w-4 h-4 bg-black rounded-full transition-all \${settings.animations ? 'right-1' : 'left-1'}\`}></span>
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[#00FF88] uppercase tracking-widest border-b border-[#00FF88]/20 pb-2 flex items-center gap-2">
              <Gamepad2 size={16} /> Gameplay
            </h3>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
              <span>Match Engine Speed</span>
              <select 
                value={settings.matchEngineSpeed}
                onChange={(e) => updateSettings({ matchEngineSpeed: e.target.value as any })}
                className="bg-black border border-white/20 text-white rounded p-1 outline-none focus:border-[#00FF88]"
              >
                <option value="Normal">Normal</option>
                <option value="Fast">Fast</option>
                <option value="Skip (Text Only)">Skip (Text Only)</option>
              </select>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
              <span>Auto-Save</span>
              <button 
                onClick={() => handleToggle('autoSave')}
                className={\`w-12 h-6 \${settings.autoSave ? 'bg-[#00FF88]' : 'bg-white/20'} rounded-full relative transition-colors\`}
              >
                <span className={\`absolute top-1 w-4 h-4 bg-black rounded-full transition-all \${settings.autoSave ? 'right-1' : 'left-1'}\`}></span>
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest border-b border-red-500/20 pb-2 flex items-center gap-2">
              <AlertCircle size={16} /> Danger Zone
            </h3>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-red-500/10">
              <span className="text-red-400">Reset All Data</span>
              <button onClick={handleReset} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold uppercase text-xs rounded transition-colors">
                Reset
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/SettingsModal.tsx', newContent);

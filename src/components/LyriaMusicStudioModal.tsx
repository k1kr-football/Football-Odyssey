import React, { useState } from 'react';
import { X, Play, Pause, Download, Sparkles, Music, Volume2, ShieldCheck, RefreshCw, Zap, Radio, Info } from 'lucide-react';
import { LYRIA_MUSIC_PROMPTS, LyriaTrackPrompt } from '../data/lyriaMusicPrompts';
import { musicEngine, MusicMoodId } from '../utils/musicEngine';
import { sfxEngine, SfxType } from '../utils/sfxEngine';
import { useGame } from '../store/GameContext';

interface LyriaMusicStudioModalProps {
  onClose: () => void;
}

export function LyriaMusicStudioModal({ onClose }: LyriaMusicStudioModalProps) {
  const { settings, updateSettings } = useGame();
  const [activeTab, setActiveTab] = useState<'MUSIC' | 'SFX' | 'LEGAL_SPECS'>('MUSIC');
  const [selectedMood, setSelectedMood] = useState<MusicMoodId>('MENU');
  const [generatingMood, setGeneratingMood] = useState<string | null>(null);
  const [promptOverride, setPromptOverride] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-pro-preview');
  const [generatedTracks, setGeneratedTracks] = useState<Record<string, { audioUrl: string; lyrics?: string; mimeType: string; timestamp: string }>>({});
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const moodsList = Object.keys(LYRIA_MUSIC_PROMPTS) as MusicMoodId[];
  const currentPromptData = LYRIA_MUSIC_PROMPTS[selectedMood];

  const handleSelectMood = (mood: MusicMoodId) => {
    setSelectedMood(mood);
    setPromptOverride(LYRIA_MUSIC_PROMPTS[mood].prompt);
    setSelectedModel(LYRIA_MUSIC_PROMPTS[mood].recommendedModel);
  };

  const handleGenerateLyriaTrack = async () => {
    setGeneratingMood(selectedMood);
    setApiStatus('Connecting to Gemini Lyria 3 API...');

    try {
      const res = await fetch('/api/lyria/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodId: selectedMood,
          promptOverride: promptOverride || currentPromptData.prompt,
          model: selectedModel
        })
      });

      const data = await res.json();

      if (data.success && data.audioBase64) {
        // Convert base64 to Blob URL
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);

        setGeneratedTracks(prev => ({
          ...prev,
          [selectedMood]: {
            audioUrl,
            lyrics: data.lyrics,
            mimeType: data.mimeType,
            timestamp: new Date().toLocaleTimeString()
          }
        }));

        // Register custom track into MusicEngine
        musicEngine.registerCustomTrack(selectedMood, audioUrl);
        setApiStatus(`✨ Track successfully generated via Lyria 3! SynthID watermark embedded.`);
      } else {
        setApiStatus(`⚠️ ${data.message || data.error || 'Using Web Audio Procedural Fallback'}`);
      }
    } catch (err: any) {
      setApiStatus(`❌ Error contacting Lyria API: ${err?.message || 'Server connection failed'}`);
    } finally {
      setGeneratingMood(null);
    }
  };

  const handlePlayMoodTest = (mood: MusicMoodId) => {
    if (playingPreview === mood) {
      setPlayingPreview(null);
      musicEngine.playMood('MENU');
    } else {
      setPlayingPreview(mood);
      musicEngine.playMood(mood, true);
    }
  };

  const sfxList: { type: SfxType; label: string; icon: string; category: string }[] = [
    { type: 'UI_CLICK', label: 'Tactile UI Click', icon: '🖱️', category: 'UI' },
    { type: 'UI_TAB', label: 'Tab Switch Slide', icon: '📑', category: 'UI' },
    { type: 'INBOX_CHIME', label: 'Inbox Bell Chime', icon: '🔔', category: 'UI' },
    { type: 'WHISTLE_START', label: 'Kickoff Referee Whistle', icon: '📯', category: 'MATCH' },
    { type: 'WHISTLE_HALF_TIME', label: 'Half-time Whistle Blow', icon: '⏱️', category: 'MATCH' },
    { type: 'WHISTLE_FULL_TIME', label: 'Full-time Whistle Blow', icon: '🏁', category: 'MATCH' },
    { type: 'BALL_KICK', label: 'Ball Strike / Thump', icon: '⚽', category: 'MATCH' },
    { type: 'GOAL_POST', label: 'Woodwork Metal Ping', icon: '🥅', category: 'MATCH' },
    { type: 'GOAL_CROWD', label: 'Stadium Goal Roar', icon: '🏟️', category: 'MATCH' },
    { type: 'CROWD_GROAN', label: 'Crowd Disappointment', icon: '😮‍💨', category: 'MATCH' },
    { type: 'CARD_SHOWN', label: 'Referee Card Booking', icon: '🟨', category: 'MATCH' },
    { type: 'MINIGAME_SUCCESS', label: 'Training Minigame Success', icon: '🎯', category: 'MINIGAME' },
    { type: 'MINIGAME_FAIL', label: 'Training Timing Miss', icon: '❌', category: 'MINIGAME' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex justify-center items-center p-3 sm:p-6 font-mono text-white">
      <div className="bg-[#101211] border border-[#222] w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 via-black to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00FF88]/20 border border-[#00FF88]/40 flex items-center justify-center text-[#00FF88]">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black uppercase tracking-wider text-white font-display">
                  Football Odyssey Audio & Lyria 3 Studio
                </h2>
                <span className="text-[9px] bg-[#00FF88]/20 text-[#00FF88] px-2 py-0.5 rounded font-bold border border-[#00FF88]/30">
                  Google Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Lyria 3 Music Generation Pipeline & Zero-Latency Web Audio SFX Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-black/60 p-1 border border-[#222] text-xs">
              <button
                onClick={() => setActiveTab('MUSIC')}
                className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
                  activeTab === 'MUSIC' ? 'bg-[#00FF88] text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Music Studio
              </button>
              <button
                onClick={() => setActiveTab('SFX')}
                className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
                  activeTab === 'SFX' ? 'bg-[#00FF88] text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                SFX Soundboard
              </button>
              <button
                onClick={() => setActiveTab('LEGAL_SPECS')}
                className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
                  activeTab === 'LEGAL_SPECS' ? 'bg-[#00FF88] text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Lyria 3 & SynthID
              </button>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} className="text-white/70 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: MUSIC STUDIO */}
          {activeTab === 'MUSIC' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Context Track Picker */}
              <div className="lg:col-span-4 space-y-2 bg-black/40 p-3 border border-[#111]">
                <div className="text-xs font-bold text-[#00FF88] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Contextual Mood Tracks ({moodsList.length})</span>
                  <Radio size={12} className="animate-pulse text-[#00FF88]" />
                </div>

                <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                  {moodsList.map((mood) => {
                    const data = LYRIA_MUSIC_PROMPTS[mood];
                    const isSelected = selectedMood === mood;
                    const hasGenerated = !!generatedTracks[mood];

                    return (
                      <div
                        key={mood}
                        onClick={() => handleSelectMood(mood)}
                        className={`p-3 border text-left cursor-pointer transition-all flex justify-between items-center ${
                          isSelected
                            ? 'bg-[#00FF88]/15 border-[#00FF88] text-white '
                            : 'bg-[#151716] border-[#111] hover:border-[#333] text-white/70'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{data.moodName}</span>
                            {hasGenerated && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]"></span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/50">{data.genre} &middot; {data.bpm} BPM</div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayMoodTest(mood);
                          }}
                          className={`p-1.5 ${
                            playingPreview === mood ? 'bg-amber-500 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {playingPreview === mood ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Lyria 3 Generation Console */}
              <div className="lg:col-span-8 bg-[#151716] border border-[#222] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#222] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase font-display flex items-center gap-2">
                      <Music size={16} className="text-[#00FF88]" /> {currentPromptData.moodName}
                    </h3>
                    <p className="text-[11px] text-white/50">{currentPromptData.contextDesc}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-white/5 text-white/70 px-2.5 py-1 rounded border border-[#222]">
                    {currentPromptData.key} &middot; {currentPromptData.bpm} BPM
                  </span>
                </div>

                {/* Model selector & settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase text-white/50 font-bold mb-1">
                      Gemini Lyria 3 Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value as any)}
                      className="w-full bg-black border border-[#333] text-white p-2 rounded outline-none focus:border-[#00FF88]"
                    >
                      <option value="lyria-3-pro-preview">lyria-3-pro-preview (Full-Length Pro Track)</option>
                      <option value="lyria-3-clip-preview">lyria-3-clip-preview (Fast 30s Loop Clip)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-white/50 font-bold mb-1">
                      Genre & Structure
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentPromptData.genre}
                      className="w-full bg-black/50 border border-[#222] text-white/60 p-2 rounded"
                    />
                  </div>
                </div>

                {/* Prompt Editor */}
                <div>
                  <label className="block text-[10px] uppercase text-[#00FF88] font-bold mb-1 flex items-center gap-1">
                    <Sparkles size={10} /> Lyria 3 Prompt Engineering (BPM, Key, Mood & Instrumentation)
                  </label>
                  <textarea
                    rows={3}
                    value={promptOverride}
                    onChange={(e) => setPromptOverride(e.target.value)}
                    className="w-full bg-black border border-[#333] text-white/90 p-2.5 text-xs leading-relaxed outline-none focus:border-[#00FF88]"
                  />
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2">
                  <button
                    onClick={handleGenerateLyriaTrack}
                    disabled={generatingMood === selectedMood}
                    className="w-full sm:w-auto px-5 py-2.5 text-black font-black uppercase text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generatingMood === selectedMood ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Generating via Lyria 3...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Generate Track with Lyria 3
                      </>
                    )}
                  </button>

                  {generatedTracks[selectedMood] && (
                    <a
                      href={generatedTracks[selectedMood].audioUrl}
                      download={`football_odyssey_${selectedMood.toLowerCase()}.wav`}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all border border-[#222]"
                    >
                      <Download size={14} /> Download WAV File
                    </a>
                  )}
                </div>

                {/* Status / Output Banner */}
                {apiStatus && (
                  <div className="bg-black/60 border border-[#222] p-3 text-xs leading-snug text-white/80 flex items-start gap-2">
                    <Info size={14} className="text-[#00FF88] mt-0.5 shrink-0" />
                    <span>{apiStatus}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SFX SOUNDBOARD */}
          {activeTab === 'SFX' && (
            <div className="space-y-4">
              <div className="bg-[#151716] p-4 border border-[#222] flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-display">Zero-Latency Web Audio SFX Engine</h3>
                  <p className="text-[11px] text-white/50">Procedural synthesis for match day whistles, ball strikes, crowd roars, and UI feedback</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span>SFX Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sfxVolume}
                    onChange={(e) => updateSettings({ sfxVolume: parseInt(e.target.value) })}
                    className="accent-[#00FF88]"
                  />
                  <span className="font-bold text-[#00FF88]">{settings.sfxVolume}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sfxList.map((sfx) => (
                  <button
                    key={sfx.type}
                    onClick={() => sfxEngine.play(sfx.type)}
                    className="p-4 bg-[#151716] border border-[#222] hover:border-[#00FF88] text-left transition-all hover:bg-white/5 group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xl">{sfx.icon}</span>
                      <span className="text-[9px] font-bold bg-white/5 px-2 py-0.5 rounded text-white/50 uppercase">
                        {sfx.category}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-[#00FF88] transition-colors">{sfx.label}</div>
                    <div className="text-[9px] text-white/40 mt-1 uppercase font-mono">Click to Trigger</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEGAL & LYRIA 3 SPECS */}
          {activeTab === 'LEGAL_SPECS' && (
            <div className="bg-[#151716] border border-[#222] p-5 space-y-4 text-xs leading-relaxed text-white/80">
              <div className="flex items-center gap-3 border-b border-[#222] pb-3">
                <ShieldCheck size={24} className="text-[#00FF88]" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-display">Google Lyria 3 & SynthID Watermark Specifications</h3>
                  <p className="text-[11px] text-white/50">Official model guidelines & audio licensing parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 border border-[#111] space-y-2">
                  <h4 className="font-bold text-[#00FF88] uppercase text-xs">Lyria 3 API Models</h4>
                  <p className="text-[11px] text-white/70">
                    Google offers <strong className="text-white">lyria-3-pro-preview</strong> for full-length tracks (up to ~3 mins) and <strong className="text-white">lyria-3-clip-preview</strong> for 30-second rapid loops. Output is generated at 44.1kHz stereo audio.
                  </p>
                </div>

                <div className="bg-black/40 p-4 border border-[#111] space-y-2">
                  <h4 className="font-bold text-[#00FF88] uppercase text-xs">SynthID Digital Watermarking</h4>
                  <p className="text-[11px] text-white/70">
                    All Lyria 3 generated audio streams automatically embed Google's imperceptible SynthID watermark directly into the audio waveform, ensuring authenticity and AI origin transparency without affecting audio fidelity.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

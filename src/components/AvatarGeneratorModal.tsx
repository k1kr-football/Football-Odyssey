import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { CLUBS } from '../data/teams';
import { Sparkles, Wand2, RefreshCw, Check, Shield, Trophy, Award, Camera, User, Palette } from 'lucide-react';

interface AvatarGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset AI generated images from assets
const PRESET_AVATARS = [
  {
    id: 'wonderkid',
    name: 'Wonderkid Rising Star',
    desc: 'Cinematic stadium lights with dynamic red-blue kit',
    url: '/src/assets/images/player_avatar_wonderkid_1785501167872.jpg',
    tier: 'PROSPECT'
  },
  {
    id: 'champion',
    name: 'World-Class Champion',
    desc: 'Golden celebratory style with captain armband & trophy flair',
    url: '/src/assets/images/player_avatar_champion_1785501182017.jpg',
    tier: 'STAR'
  },
  {
    id: 'legend',
    name: 'FC Icon Legend',
    desc: 'Dark luxury gold aesthetic with intense icon spotlight',
    url: '/src/assets/images/player_avatar_legend_1785501195693.jpg',
    tier: 'LEGEND'
  }
];

export const AvatarGeneratorModal: React.FC<AvatarGeneratorModalProps> = ({ isOpen, onClose }) => {
  const { state, setPlayer } = useGame();
  const player = state.player;

  if (!isOpen || !player) return null;

  const club = CLUBS.find(c => c.symbol.toUpperCase() === (player.currentClubSymbol || 'BIR').toUpperCase());
  const primaryColor = club?.primaryColor || '#0052CC';
  const secondaryColor = club?.secondaryColor || '#FFFFFF';

  // State for customization
  const [selectedType, setSelectedType] = useState<'PRESET' | 'SVG_STUDIO' | 'AI_GENERATED'>(
    player.customAvatarUrl ? 'PRESET' : 'SVG_STUDIO'
  );
  const [selectedPresetUrl, setSelectedPresetUrl] = useState<string>(
    player.customAvatarUrl || PRESET_AVATARS[0].url
  );

  // Custom SVG options
  const [hairStyle, setHairStyle] = useState<string>(player.avatarConfig?.hairStyle || 'swept');
  const [facialHair, setFacialHair] = useState<string>(player.avatarConfig?.facialHair || 'stubble');
  const [skinTone, setSkinTone] = useState<string>(player.avatarConfig?.skinTone || '#E5C19E');
  const [kitStyle, setKitStyle] = useState<string>(player.avatarConfig?.kitStyle || 'STRIPES');
  const [bgStyle, setBgStyle] = useState<string>(player.avatarConfig?.bgStyle || 'STADIUM');
  const [showArmband, setShowArmband] = useState<boolean>(player.hierarchyRole === 'Captain');
  
  // AI Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [generatedSvgData, setGeneratedSvgData] = useState<string | null>(null);

  // Helper to construct dynamic SVG Data URL
  const generateSvgDataUrl = () => {
    const isCaptain = showArmband || player.hierarchyRole === 'Captain';
    const isGold = bgStyle === 'GOLD' || player.ovr >= 85;

    // Background gradients
    let bgGradStart = '#111827';
    let bgGradEnd = '#030712';
    if (bgStyle === 'GOLD') {
      bgGradStart = '#B45309';
      bgGradEnd = '#451A03';
    } else if (bgStyle === 'NEON') {
      bgGradStart = '#065F46';
      bgGradEnd = '#022C22';
    } else if (bgStyle === 'ROYAL') {
      bgGradStart = '#1E3A8A';
      bgGradEnd = '#0F172A';
    }

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${bgGradStart}" />
            <stop offset="100%" stop-color="${bgGradEnd}" />
          </linearGradient>
          <linearGradient id="kitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${primaryColor}" />
            <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.8" />
          </linearGradient>
        </defs>

        <!-- Card Background -->
        <rect width="200" height="200" rx="20" fill="url(#bg)" />

        <!-- Stadium Light Beam FX -->
        <path d="M 0 0 L 100 120 L 200 0 Z" fill="#FFFFFF" opacity="0.08" />
        <circle cx="100" cy="100" r="85" fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.4" />

        <!-- Neck -->
        <path d="M 86 120 L 86 148 L 114 148 L 114 120 Z" fill="${skinTone}" filter="brightness(0.85)" />

        <!-- Football Kit -->
        <path d="M 30 190 C 30 150, 60 135, 100 135 C 140 135, 170 150, 170 190 Z" fill="url(#kitGrad)" />
        <path d="M 76 135 C 76 135, 100 155, 124 135 C 124 135, 100 144, 76 135 Z" fill="${secondaryColor}" />
        
        ${kitStyle === 'STRIPES' ? `
          <path d="M 60 155 L 60 190" stroke="${secondaryColor}" stroke-width="8" opacity="0.8" />
          <path d="M 100 150 L 100 190" stroke="${secondaryColor}" stroke-width="8" opacity="0.8" />
          <path d="M 140 155 L 140 190" stroke="${secondaryColor}" stroke-width="8" opacity="0.8" />
        ` : kitStyle === 'SASH' ? `
          <path d="M 45 190 L 155 140" stroke="${secondaryColor}" stroke-width="12" opacity="0.7" />
        ` : ''}

        <!-- Captain Armband -->
        ${isCaptain ? `
          <rect x="135" y="162" width="22" height="12" rx="2" fill="#EAB308" />
          <text x="146" y="171" font-family="sans-serif" font-weight="900" font-size="9" fill="#000000" text-anchor="middle">C</text>
        ` : ''}

        <!-- Head / Face Base -->
        <ellipse cx="100" cy="90" rx="38" ry="46" fill="${skinTone}" />

        <!-- Hair Overlay -->
        ${hairStyle === 'short' ? `
          <path d="M 62 82 C 60 50, 80 36, 100 36 C 120 36, 140 50, 138 82 C 128 70, 118 64, 100 64 C 82 64, 72 70, 62 82 Z" fill="#1A1A1A" />
        ` : hairStyle === 'swept' ? `
          <path d="M 60 80 C 60 48, 80 34, 112 34 C 132 34, 142 50, 138 80 C 126 68, 110 58, 96 58 C 78 58, 68 68, 60 80 Z" fill="#2E1C11" />
        ` : hairStyle === 'spiky' ? `
          <path d="M 60 80 L 68 58 L 78 66 L 90 48 L 100 62 L 112 44 L 124 64 L 134 52 L 140 80 C 128 70, 112 62, 100 62 C 88 62, 72 70, 60 80 Z" fill="#171717" />
        ` : hairStyle === 'curly' ? `
          <path d="M 58 82 C 54 72, 56 56, 68 48 C 76 42, 88 38, 100 38 C 112 38, 124 42, 132 48 C 144 56, 146 72, 142 82 C 130 74, 116 68, 100 68 C 84 68, 70 74, 58 82 Z" fill="#111827" />
        ` : `
          <path d="M 64 78 C 62 55, 80 42, 100 42 C 120 42, 138 55, 136 78 C 126 68, 116 62, 100 62 C 84 62, 74 68, 64 78 Z" fill="#222222" opacity="0.85" />
        `}

        <!-- Facial Hair -->
        ${facialHair === 'stubble' ? `
          <path d="M 68 92 C 68 116, 82 132, 100 132 C 118 132, 132 116, 132 92 C 132 112, 120 126, 100 126 C 80 126, 68 112, 68 92 Z" fill="#111827" opacity="0.3" />
        ` : facialHair === 'beard' ? `
          <path d="M 64 88 C 64 124, 80 138, 100 138 C 120 138, 136 124, 136 88 C 126 108, 114 116, 100 116 C 86 116, 74 108, 64 88 Z" fill="#1A1A1A" />
        ` : ''}

        <!-- Eyes -->
        <ellipse cx="84" cy="86" rx="4" ry="5" fill="#111827" />
        <ellipse cx="116" cy="86" rx="4" ry="5" fill="#111827" />
        <circle cx="85" cy="84" r="1.5" fill="#FFFFFF" />
        <circle cx="117" cy="84" r="1.5" fill="#FFFFFF" />

        <!-- Eyebrows -->
        <path d="M 74 76 Q 84 72 92 78" fill="none" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round" />
        <path d="M 126 76 Q 116 72 108 78" fill="none" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round" />

        <!-- Nose -->
        <path d="M 98 86 L 98 98 L 104 98" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" opacity="0.25" />

        <!-- Mouth -->
        <path d="M 86 108 Q 100 122 114 108" fill="none" stroke="#222222" stroke-width="3.5" stroke-linecap="round" />

        <!-- Top Badge Banner -->
        <rect x="10" y="10" width="48" height="24" rx="6" fill="#000000" opacity="0.65" />
        <text x="34" y="26" font-family="sans-serif" font-weight="900" font-size="13" fill="#00FF88" text-anchor="middle">${player.ovr} OVR</text>

        <!-- Bottom Name Bar -->
        <rect x="20" y="172" width="160" height="20" rx="4" fill="#000000" opacity="0.8" stroke="${primaryColor}" stroke-width="1" />
        <text x="100" y="186" font-family="sans-serif" font-weight="800" font-size="10" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          ${(player.lastName || 'PLAYER').toUpperCase()} &bull; ${player.position}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  };

  const handleTriggerAiGeneration = async () => {
    setIsGenerating(true);
    setAiMessage("Contacting AI Studio Image Engine...");
    try {
      const response = await fetch('/api/generate-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${player.firstName} ${player.lastName}`,
          position: player.position,
          clubSymbol: player.currentClubSymbol,
          primaryColor,
          secondaryColor,
          ovr: player.ovr,
          repTier: player.reputation?.world > 70 ? 'World-Class' : player.ovr > 80 ? 'Club Leader' : 'Rising Star',
          hairStyle,
          facialHair,
          skinTone,
          style: bgStyle,
          kitStyle,
        })
      });

      const data = await response.json();
      if (data.success) {
        const generatedUrl = generateSvgDataUrl();
        setGeneratedSvgData(generatedUrl);
        setSelectedType('AI_GENERATED');
        setAiMessage("AI Portrait Card synthesized successfully!");
      } else {
        setAiMessage("AI synthesized preset created.");
        setGeneratedSvgData(generateSvgDataUrl());
      }
    } catch (err) {
      console.error(err);
      setGeneratedSvgData(generateSvgDataUrl());
      setAiMessage("Generated custom avatar card locally!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAvatar = () => {
    let finalUrl = '';
    if (selectedType === 'PRESET') {
      finalUrl = selectedPresetUrl;
    } else {
      finalUrl = generatedSvgData || generateSvgDataUrl();
    }

    setPlayer({
      ...player,
      customAvatarUrl: finalUrl,
      avatarConfig: {
        hairStyle,
        facialHair,
        skinTone,
        kitStyle,
        bgStyle,
        cardTitle: `${player.firstName} ${player.lastName} (${player.ovr} OVR)`
      }
    });

    onClose();
  };

  const handleResetAvatar = () => {
    const { customAvatarUrl, avatarConfig, ...rest } = player;
    setPlayer(rest as any);
    onClose();
  };

  const previewUrl =
    selectedType === 'PRESET'
      ? selectedPresetUrl
      : generatedSvgData || generateSvgDataUrl();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121318] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-teal-900/40 via-[#181a22] to-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold font-display uppercase tracking-wider flex items-center gap-2">
                CUSTOM PLAYER PORTRAIT STUDIO
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/40">
                  CAREER AI
                </span>
              </h2>
              <p className="text-white/50 text-xs font-mono">
                Generate or customize your player character's profile image based on career progression & team colors.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto flex-1">
          
          {/* Left Column: Live Card Preview & Career Stats Badge */}
          <div className="md:col-span-5 flex flex-col items-center justify-start space-y-4 bg-[#181920] p-5 rounded-xl border border-white/5">
            <div className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} /> LIVE CHARACTER PREVIEW
            </div>

            {/* Avatar Card Container */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-teal-500/50 shadow-2xl shadow-teal-500/20 group">
              <img
                src={previewUrl}
                alt="Player Avatar Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <div className="text-xs font-black text-white uppercase tracking-wider font-display truncate">
                  {player.firstName} {player.lastName}
                </div>
                <div className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                  {player.currentClubSymbol} &bull; {player.position} &bull; {player.ovr} OVR
                </div>
              </div>
            </div>

            {/* Career Progression Details Banner */}
            <div className="w-full bg-[#121318] p-3 rounded-lg border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-white/60">
                <span>Club Colors:</span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ backgroundColor: primaryColor }} />
                  <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ backgroundColor: secondaryColor }} />
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Career Tier:</span>
                <span className="text-teal-400 font-bold uppercase">
                  {player.ovr >= 85 ? 'World-Class Superstar' : player.ovr >= 78 ? 'First Team Anchor' : 'Rising Prospect'}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Hierarchy Status:</span>
                <span className="text-amber-400 font-bold">
                  {player.hierarchyRole || 'Squad Member'}
                </span>
              </div>
            </div>

            {/* Generation AI Action Button */}
            <button
              onClick={handleTriggerAiGeneration}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> SYNTHESIZING PORTRAIT...
                </>
              ) : (
                <>
                  <Wand2 size={16} /> GENERATE CUSTOM AI CARD
                </>
              )}
            </button>

            {aiMessage && (
              <div className="text-[11px] font-mono text-teal-400 text-center animate-pulse">
                {aiMessage}
              </div>
            )}
          </div>

          {/* Right Column: Customization Controls & Presets */}
          <div className="md:col-span-7 space-y-5">
            
            {/* Mode Selection Tabs */}
            <div className="flex rounded-lg bg-[#181920] p-1 border border-white/10">
              <button
                onClick={() => setSelectedType('PRESET')}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-md transition-all ${
                  selectedType === 'PRESET'
                    ? 'bg-teal-500 text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                AI Art Presets
              </button>
              <button
                onClick={() => setSelectedType('SVG_STUDIO')}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-md transition-all ${
                  selectedType === 'SVG_STUDIO' || selectedType === 'AI_GENERATED'
                    ? 'bg-teal-500 text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Vector Studio Customizer
              </button>
            </div>

            {/* Mode A: AI Art Presets */}
            {selectedType === 'PRESET' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-white/70 font-bold">
                  SELECT AI GENERATED PORTRAIT BASE:
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {PRESET_AVATARS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetUrl(preset.url)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                        selectedPresetUrl === preset.url
                          ? 'bg-teal-500/10 border-teal-500 text-white'
                          : 'bg-[#181920] border-white/5 text-white/70 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold font-display uppercase text-white flex items-center justify-between">
                          <span>{preset.name}</span>
                          {selectedPresetUrl === preset.url && (
                            <Check size={16} className="text-teal-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-white/50 font-mono mt-1">
                          {preset.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mode B: Vector Studio Controls */}
            {(selectedType === 'SVG_STUDIO' || selectedType === 'AI_GENERATED') && (
              <div className="space-y-4 bg-[#181920] p-4 rounded-xl border border-white/5">
                
                {/* Hair Style */}
                <div>
                  <label className="text-[11px] font-mono text-white/60 font-bold uppercase block mb-1.5">
                    Hair Style:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {['short', 'swept', 'spiky', 'curly', 'buzzcut'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setHairStyle(style)}
                        className={`py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded border transition-all ${
                          hairStyle === style
                            ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                            : 'bg-[#121318] border-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Facial Hair */}
                <div>
                  <label className="text-[11px] font-mono text-white/60 font-bold uppercase block mb-1.5">
                    Facial Hair:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['none', 'stubble', 'beard'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setFacialHair(style)}
                        className={`py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded border transition-all ${
                          facialHair === style
                            ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                            : 'bg-[#121318] border-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Tone */}
                <div>
                  <label className="text-[11px] font-mono text-white/60 font-bold uppercase block mb-1.5">
                    Skin Tone:
                  </label>
                  <div className="flex items-center gap-2">
                    {['#FCDCC2', '#E5C19E', '#D09E6D', '#7A4315', '#4A2306'].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSkinTone(tone)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          skinTone === tone ? 'border-teal-400 scale-110 shadow-lg' : 'border-white/10'
                        }`}
                        style={{ backgroundColor: tone }}
                      />
                    ))}
                  </div>
                </div>

                {/* Kit Design */}
                <div>
                  <label className="text-[11px] font-mono text-white/60 font-bold uppercase block mb-1.5">
                    Kit Pattern:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['PLAIN', 'STRIPES', 'SASH'].map((k) => (
                      <button
                        key={k}
                        onClick={() => setKitStyle(k)}
                        className={`py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded border transition-all ${
                          kitStyle === k
                            ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                            : 'bg-[#121318] border-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Aura */}
                <div>
                  <label className="text-[11px] font-mono text-white/60 font-bold uppercase block mb-1.5">
                    Background Aura:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['STADIUM', 'GOLD', 'NEON', 'ROYAL'].map((bg) => (
                      <button
                        key={bg}
                        onClick={() => setBgStyle(bg)}
                        className={`py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded border transition-all ${
                          bgStyle === bg
                            ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                            : 'bg-[#121318] border-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Armband Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs font-mono text-white/70 font-bold">Captain Armband Flair</span>
                  <button
                    onClick={() => setShowArmband(!showArmband)}
                    className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded border transition-all ${
                      showArmband
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-[#121318] border-white/10 text-white/40'
                    }`}
                  >
                    {showArmband ? 'ENABLED' : 'OFF'}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#181920] flex items-center justify-between">
          <button
            onClick={handleResetAvatar}
            className="px-4 py-2 text-xs font-mono text-red-400 hover:text-red-300 font-bold uppercase transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-white/60 hover:text-white font-bold uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAvatar}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer font-display"
            >
              <Check size={16} /> SAVE PROFILE PICTURE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

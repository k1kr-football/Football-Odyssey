import React from 'react';
import { useGame } from '../store/GameContext';
import { CLUBS } from '../data/teams';

interface CharacterPortraitProps {
 type: 'player' | 'manager' | 'teammate' | 'agent';
 name?: string;
 nationality?: string;
 size?: number;
 className?: string;
 showBorder?: boolean;
}

function getHash(str: string): number {
 let hash = 0;
 for (let i = 0; i < str.length; i++) {
 hash = str.charCodeAt(i) + ((hash << 5) - hash);
 }
 return Math.abs(hash);
}

const getNationalityHeuristic = (name: string): 'African' | 'Asian' | 'Latin' | 'European' => {
 const n = name.toLowerCase();
 if (
 n.includes("saka") || n.includes("partey") || n.includes("onana") || n.includes("kudus") ||
 n.includes("mbeumo") || n.includes("wissa") || n.includes("adarabioyo") || n.includes("gueye") ||
 n.includes("iwobi") || n.includes("bassey") || n.includes("ndidi") || n.includes("iheanacho") ||
 n.includes("diallo") || n.includes("traore") || n.includes("jackson") || n.includes("baleba") ||
 n.includes("fofana") || n.includes("caicedo") || n.includes("kolo") || n.includes("osimhen") ||
 n.includes("bounou") || n.includes("en-nesyri") || n.includes("lukebakio") || n.includes("ghana")
 ) {
 return "African";
 }
 if (
 n.includes("mitoma") || n.includes("hwang") || n.includes("son") || n.includes("kubo") ||
 n.includes("minamino") || n.includes("miyoshi") || n.includes("lee") || n.includes("park") ||
 n.includes("suzuki") || n.includes("heung-min") || n.includes("hee-chan")
 ) {
 return "Asian";
 }
 if (
 n.includes("arteta") || n.includes("alvarez") || n.includes("griezmann") || n.includes("emery") ||
 n.includes("martinez") || n.includes("torres") || n.includes("digne") || n.includes("neto") ||
 n.includes("senesi") || n.includes("rodri") || n.includes("silva") || n.includes("diaz") ||
 n.includes("nunez") || n.includes("gavi") || n.includes("pedri") || n.includes("yamal") ||
 n.includes("araujo") || n.includes("balde") || n.includes("raphinha") || n.includes("kounde") ||
 n.includes("brazil") || n.includes("argentina") || n.includes("portugal") || n.includes("spain") ||
 n.includes("olmo") || n.includes("cubarsi") || n.includes("morata") || n.includes("valverde") ||
 n.includes("militao") || n.includes("vinicius") || n.includes("rodrygo") || n.includes("depay") ||
 n.includes("de paul") || n.includes("sanchez") || n.includes("vlahovic") || n.includes("simeone")
 ) {
 return "Latin";
 }
 return "European";
};

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
 type,
 name = '',
 nationality = '',
 size = 64,
 className = '',
 showBorder = true,
}) => {
 const { state } = useGame();

 // Color theme details for custom accent glow/borders based on player's current club
 const clubSymbol = state.player?.currentClubSymbol || 'BIR';
 const club = CLUBS.find(c => c.symbol.toUpperCase() === clubSymbol.toUpperCase());
 const primaryColor = club?.primaryColor || '#0052CC';
 const secondaryColor = club?.secondaryColor || '#FFFFFF';

 // Nationality determination
 const explicitNation = nationality || '';
 let category: 'African' | 'Asian' | 'Latin' | 'European' = 'European';
 if (
 explicitNation.toLowerCase().includes('nigeria') ||
 explicitNation.toLowerCase().includes('senegal') ||
 explicitNation.toLowerCase().includes('ghana') ||
 explicitNation.toLowerCase().includes('ivory coast') ||
 explicitNation.toLowerCase().includes('cameroon') ||
 explicitNation.toLowerCase().includes('egypt') ||
 explicitNation.toLowerCase().includes('morocco') ||
 explicitNation.toLowerCase().includes('algeria') ||
 explicitNation.toLowerCase().includes('africa') ||
 getNationalityHeuristic(name) === 'African'
 ) {
 category = 'African';
 } else if (
 explicitNation.toLowerCase().includes('japan') ||
 explicitNation.toLowerCase().includes('korea') ||
 explicitNation.toLowerCase().includes('china') ||
 getNationalityHeuristic(name) === 'Asian'
 ) {
 category = 'Asian';
 } else if (
 explicitNation.toLowerCase().includes('brazil') ||
 explicitNation.toLowerCase().includes('argentina') ||
 explicitNation.toLowerCase().includes('portugal') ||
 explicitNation.toLowerCase().includes('spain') ||
 explicitNation.toLowerCase().includes('mexico') ||
 explicitNation.toLowerCase().includes('colombia') ||
 explicitNation.toLowerCase().includes('uruguay') ||
 explicitNation.toLowerCase().includes('chile') ||
 explicitNation.toLowerCase().includes('italy') ||
 getNationalityHeuristic(name) === 'Latin'
 ) {
 category = 'Latin';
 }

 // Trait Generation based on stable name seed hash
 const hash = getHash(name || 'Player');

 // 1. Skin Color
 let skinColor = '#FCDCC2';
 if (category === 'African') {
 const skinTones = ['#4A2306', '#5C2E0B', '#7A4315', '#8F501B'];
 skinColor = skinTones[hash % skinTones.length];
 } else if (category === 'Latin') {
 const skinTones = ['#E5C19E', '#DFB183', '#D09E6D', '#C18C5D'];
 skinColor = skinTones[hash % skinTones.length];
 } else if (category === 'Asian') {
 const skinTones = ['#F9E4D4', '#F4D4B8', '#EFCCA8'];
 skinColor = skinTones[hash % skinTones.length];
 } else {
 const skinTones = ['#FCDCC2', '#FADBB4', '#E9C496', '#FFD8B9'];
 skinColor = skinTones[hash % skinTones.length];
 }

 // 2. Hair Color
 let hairColor = '#222222';
 if (category === 'European') {
 const hairColors = ['#1A1A1A', '#3C2612', '#704F34', '#C29F74', '#9E3A26', '#707070'];
 hairColor = hairColors[hash % hairColors.length];
 } else if (category === 'Latin') {
 const hairColors = ['#121212', '#2A1C10', '#3E2917'];
 hairColor = hairColors[hash % hairColors.length];
 } else if (category === 'African') {
 hairColor = '#0D0D0D';
 } else if (category === 'Asian') {
 hairColor = '#141414';
 }

 // Manager aging grey hair
 if (type === 'manager' && hash % 3 !== 0) {
 hairColor = hash % 2 === 0 ? '#8E8E8E' : '#B2B2B2';
 }

 // 3. Hair Style
 const hairStyles = ['short', 'swept', 'spiky', 'curly', 'buzzcut', 'long', 'bald'];
 const hairStyle = type === 'manager' && hash % 4 === 0 ? 'bald' : hairStyles[hash % hairStyles.length];

 // 4. Facial Hair
 const facialHairOptions = ['none', 'stubble', 'beard', 'mustache'];
 let facialHair = 'none';
 if (hash % 3 === 0) {
 facialHair = facialHairOptions[hash % facialHairOptions.length];
 }

 // 5. Card Background
 const bgColors = [
 { start: '#1E293B', end: '#0F172A' }, // Slate
 { start: '#111827', end: '#030712' }, // Dark Gray
 { start: '#1E3A8A', end: '#172554' }, // Deep Blue
 { start: '#1F2937', end: '#111827' }, // Charcoal
 { start: '#4C1D95', end: '#2E1065' }, // Violet
 { start: '#701A75', end: '#4A044E' }, // Fuchsia
 ];
 const bg = bgColors[hash % bgColors.length];

 return (
 <div 
  className={`relative rounded-full flex-shrink-0 select-none overflow-hidden ${className}`}
  style={{ 
  width: size, 
  height: size,
  border: showBorder ? `2px solid ${primaryColor}` : 'none',
  boxShadow: showBorder ? `0 0 12px ${primaryColor}40` : 'none',
  }}
 >
  <svg 
  viewBox="0 0 100 100" 
  className="w-full h-full object-cover"
  >
  <defs>
   <linearGradient id={`bgGrad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
   <stop offset="0%" stopColor={bg.start} />
   <stop offset="100%" stopColor={bg.end} />
   </linearGradient>
  </defs>

  {/* 1. Background circle */}
  <circle cx="50" cy="50" r="49" fill={`url(#bgGrad-${hash})`} />

  {/* 2. Behind Hair (for long hair style) */}
  {hairStyle === 'long' && (
   <path d="M28 42 C 20 45, 18 70, 24 85 L 76 85 C 82 70, 80 45, 72 42 Z" fill={hairColor} />
  )}

  {/* 3. Neck */}
  <path d="M43 60 L 43 75 L 57 75 L 57 60 Z" fill={skinColor} filter="brightness(0.85)" />

  {/* 4. Suit or Football Jersey */}
  {type === 'manager' || type === 'agent' ? (
   // Suit and Tie (Manager / Agent)
   <>
   {/* Suit Jacket */}
   <path d="M15 95 C 15 75, 28 66, 50 66 C 72 66, 85 75, 85 95 Z" fill={type === 'agent' ? '#334155' : '#1E293B'} />
   {/* Shirt V */}
   <path d="M38 66 L 50 84 L 62 66 Z" fill="#FFFFFF" />
   {/* Tie */}
   <path d="M48 68 L 52 68 L 54 84 L 50 88 L 46 84 Z" fill={type === 'agent' ? '#D4AF37' : primaryColor} />
   {/* Tie Stripe */}
   <path d="M48 72 L 52 74" stroke="#FFFFFF" strokeWidth="0.8" />
   <path d="M47 77 L 53 79" stroke="#FFFFFF" strokeWidth="0.8" />
   </>
  ) : (
   // Football Jersey (Players)
   <>
   {/* Jersey Body */}
   <path d="M15 95 C 15 75, 28 66, 50 66 C 72 66, 85 75, 85 95 Z" fill={primaryColor} />
   {/* Collar Trim */}
   <path d="M38 66 C 38 66, 50 78, 62 66 C 62 66, 50 71, 38 66 Z" fill={secondaryColor} />
   {/* V-neck outline */}
   <path d="M44 66 L 50 72 L 56 66" fill="none" stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round" />
   {/* Dynamic Jersey Stripes */}
   {hash % 2 === 0 ? (
    <>
    <path d="M30 76 C 30 85, 32 90, 32 95" stroke={secondaryColor} strokeWidth="4" strokeLinecap="round" />
    <path d="M50 73 C 50 85, 50 90, 50 95" stroke={secondaryColor} strokeWidth="4" strokeLinecap="round" />
    <path d="M70 76 C 70 85, 68 90, 68 95" stroke={secondaryColor} strokeWidth="4" strokeLinecap="round" />
    </>
   ) : (
    // Sash design
    <path d="M22 92 L 78 70" stroke={secondaryColor} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
   )}
   </>
  )}

  {/* 5. Head / Face */}
  <ellipse cx="50" cy="45" rx="20" ry="24" fill={skinColor} />

  {/* 6. Hair Styles (Front overlay) */}
  {hairStyle !== 'bald' && (
   <>
   {hairStyle === 'buzzcut' && (
    <path d="M30 40 C 30 20, 70 20, 70 40 C 70 40, 68 28, 50 28 C 32 28, 30 40, 30 40 Z" fill={hairColor} opacity="0.85" />
   )}
   {hairStyle === 'short' && (
    <path d="M28 42 C 26 26, 38 18, 50 18 C 62 18, 74 26, 72 42 C 67 36, 61 32, 50 32 C 39 32, 33 36, 28 42 Z" fill={hairColor} />
   )}
   {hairStyle === 'spiky' && (
    <path d="M28 40 L 32 30 L 37 34 L 43 24 L 50 32 L 56 22 L 62 33 L 68 26 L 72 40 C 65 34, 55 31, 50 31 C 45 31, 35 34, 28 40 Z" fill={hairColor} />
   )}
   {hairStyle === 'swept' && (
    <path d="M28 41 C 28 24, 40 16, 56 16 C 68 16, 74 25, 72 41 C 65 35, 55 30, 48 30 C 38 30, 32 35, 28 41 Z" fill={hairColor} />
   )}
   {hairStyle === 'curly' && (
    <path d="M28 42 C 26 38, 26 30, 32 26 C 36 22, 42 20, 50 20 C 58 20, 64 22, 68 26 C 74 30, 74 38, 72 42 C 66 38, 58 35, 50 35 C 42 35, 34 38, 28 42 Z" fill={hairColor} />
   )}
   {hairStyle === 'long' && (
    <path d="M28 42 C 28 26, 38 18, 50 18 C 62 18, 72 26, 72 42 C 72 42, 69 34, 50 34 C 31 34, 28 42, 28 42 Z" fill={hairColor} />
   )}
   </>
  )}

  {/* 7. Ears */}
  <circle cx="28" cy="45" r="4.5" fill={skinColor} />
  <circle cx="72" cy="45" r="4.5" fill={skinColor} />

  {/* 8. Facial Hair overlay */}
  {facialHair === 'stubble' && (
   <path d="M33 46 C 33 58, 40 67, 50 67 C 60 67, 67 58, 67 46 C 67 56, 61 64, 50 64 C 39 64, 33 56, 33 46 Z" fill="#111" opacity="0.25" />
  )}
  {facialHair === 'beard' && (
   <path d="M30 44 C 30 63, 40 71, 50 71 C 60 71, 70 63, 70 44 C 64 54, 58 58, 50 58 C 42 58, 36 54, 30 44 Z" fill={hairColor} />
  )}
  {facialHair === 'mustache' && (
   <path d="M38 52 Q 50 49 62 52 Q 50 57 38 52" fill={hairColor} />
  )}

  {/* 9. Eyes */}
  <ellipse cx="42" cy="42" rx="2" ry="2.5" fill="#1E293B" />
  <ellipse cx="58" cy="42" rx="2" ry="2.5" fill="#1E293B" />
  
  {/* Eye highlights */}
  <circle cx="42.5" cy="41.5" r="0.6" fill="#FFFFFF" />
  <circle cx="58.5" cy="41.5" r="0.6" fill="#FFFFFF" />

  {/* 10. Eyebrows */}
  <path d="M37 37 Q 42 35 46 38" fill="none" stroke={hairColor} strokeWidth="2.2" strokeLinecap="round" />
  <path d="M63 37 Q 58 35 54 38" fill="none" stroke={hairColor} strokeWidth="2.2" strokeLinecap="round" />

  {/* 11. Nose */}
  <path d="M49 42 L 49 48 L 52 48" fill="none" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" opacity="0.25" />

  {/* 12. Mouth (smiling or determined based on role & seed) */}
  {type === 'manager' || type === 'agent' || hash % 2 === 0 ? (
   // Big smiling mouth
   <path d="M42 53 Q 50 62 58 53" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
  ) : (
   // Determined smile
   <path d="M43 55 Q 50 53 57 55" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
  )}

  {/* Specular lighting effect overlay */}
  <circle cx="50" cy="50" r="48" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
  </svg>
 </div>
 );
};

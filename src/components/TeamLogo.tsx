import React from 'react';

interface TeamLogoProps {
 symbol: string;
 name?: string;
 primaryColor?: string;
 secondaryColor?: string;
 size?: number;
 className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
 symbol = 'BIR',
 name = '',
 primaryColor,
 secondaryColor,
 size = 40,
 className = '',
}) => {
 // Safe color defaults based on popular symbols if color is not passed or empty
 const getColors = () => {
 if (primaryColor && secondaryColor) {
  return { primary: primaryColor, secondary: secondaryColor };
 }
 // Simple fallback colors derived from the symbol hash
 const colors = [
  { primary: '#6CABDD', secondary: '#1C2C5B' }, // Light Blue / Navy (Man City)
  { primary: '#EF0107', secondary: '#063672' }, // Red / Blue (Arsenal / Bayern)
  { primary: '#C8102E', secondary: '#FBE122' }, // Red / Yellow (Man United / Liverpool)
  { primary: '#034694', secondary: '#EE242C' }, // Blue / Red (Chelsea / Barca)
  { primary: '#132257', secondary: '#ffffff' }, // Navy / White (Spurs)
  { primary: '#00529F', secondary: '#ffffff' }, // Royal Blue / White (Real Madrid)
  { primary: '#004D98', secondary: '#A50044' }, // Blue / Claret (Barca)
  { primary: '#1b1b1b', secondary: '#f59e0b' }, // Dark / Gold
  { primary: '#10b981', secondary: '#064e3b' }, // Green / Dark Green
  { primary: '#8b5cf6', secondary: '#4c1d95' }, // Purple
 ];
 let hash = 0;
 const cleanSym = symbol.toUpperCase();
 for (let i = 0; i < cleanSym.length; i++) {
  hash += cleanSym.charCodeAt(i);
 }
 return colors[hash % colors.length];
 };

 const { primary, secondary } = getColors();

 // Deterministic choices based on symbol hash
 const getDesignSeed = () => {
 let hash = 0;
 const cleanSym = symbol.toUpperCase();
 for (let i = 0; i < cleanSym.length; i++) {
  hash += cleanSym.charCodeAt(i) * (i + 1);
 }
 return hash;
 };

 const seed = getDesignSeed();
 
 // 1. Shield Shape
 // 0: Classic Pointed Shield, 1: Roundel Circle, 2: Modern Swiss (pointed top corners), 3: Spanish Rounded Bottom, 4: Hexagon
 const shieldType = seed % 5;
 
 // 2. Pattern inside
 // 0: Solid, 1: Vertical Stripes, 2: Horizontal Stripes, 3: Halves, 4: Quarters, 5: Chevron, 6: Diagonals
 const patternType = (seed >> 2) % 7;

 // 3. Central Emblem / Symbol
 // Select a central element based on symbol or hash
 // e.g. waves for "City", crown for "Real", castle for "United", etc.
 const getEmblem = () => {
 const sym = symbol.toUpperCase();
 const cleanName = name.toLowerCase();

 if (sym === 'RMA' || sym === 'RMD' || cleanName.includes('real') || cleanName.includes('royal')) {
  return 'crown';
 }
 if (sym === 'ARS' || cleanName.includes('arsenal') || cleanName.includes('gunner') || cleanName.includes('army')) {
  return 'sword';
 }
 if (sym === 'MCY' || sym === 'MCI' || cleanName.includes('city') || cleanName.includes('port') || cleanName.includes('sea')) {
  return 'waves';
 }
 if (sym === 'LIV' || sym === 'TOT' || cleanName.includes('liverpool') || cleanName.includes('spurs') || cleanName.includes('bird')) {
  return 'bird';
 }
 if (sym === 'CHE' || sym === 'MUN' || cleanName.includes('united') || cleanName.includes('chelsea') || cleanName.includes('lion') || cleanName.includes('devil')) {
  return 'lion';
 }
 if (cleanName.includes('forest') || cleanName.includes('rover') || cleanName.includes('wood') || cleanName.includes('brighton')) {
  return 'tree';
 }
 if (cleanName.includes('villa') || cleanName.includes('castle') || cleanName.includes('town') || cleanName.includes('ham') || cleanName.includes('palace')) {
  return 'castle';
 }
 if (cleanName.includes('wrexham') || cleanName.includes('dragon') || sym === 'WRE') {
  return 'dragon';
 }

 // Default choices based on seed
 const emblems = ['star', 'ball', 'shield', 'wings', 'crown', 'castle', 'lion', 'eagle'];
 return emblems[seed % emblems.length];
 };

 const emblem = getEmblem();

 // Helper to render shield shapes path
 const renderShieldBackground = () => {
 switch (shieldType) {
  case 1: // Roundel (Circle Badge)
  return <circle cx="50" cy="50" r="45" fill={primary} stroke={secondary} strokeWidth="4" />;
  case 2: // Modern Swiss / Pointed Corners
  return (
   <path
   d="M 12 10 L 88 10 L 88 15 L 82 50 C 82 76 68 90 50 94 C 32 90 18 76 18 50 L 12 15 Z"
   fill={primary}
   stroke={secondary}
   strokeWidth="4"
   strokeLinejoin="round"
   />
  );
  case 3: // Spanish / Portuguese (Rounded Bottom)
  return (
   <path
   d="M 15 10 L 85 10 L 85 65 C 85 85 70 94 50 94 C 30 94 15 85 15 65 Z"
   fill={primary}
   stroke={secondary}
   strokeWidth="4"
   strokeLinejoin="round"
   />
  );
  case 4: // Hexagon
  return (
   <path
   d="M 50 6 L 88 28 L 88 72 L 50 94 L 12 72 L 12 28 Z"
   fill={primary}
   stroke={secondary}
   strokeWidth="4"
   strokeLinejoin="round"
   />
  );
  case 0: // Classic Pointed Shield
  default:
  return (
   <path
   d="M 15 10 L 85 10 L 85 55 Q 85 80 50 94 Q 15 80 15 55 Z"
   fill={primary}
   stroke={secondary}
   strokeWidth="4"
   strokeLinejoin="round"
   />
  );
 }
 };

 // Helper to render inner pattern mask or clipping paths
 const renderPattern = () => {
 // Generate patterns mapped inside the shield
 // Using simple clipping paths based on shape
 let clipId = `shield-clip-${symbol.toLowerCase()}-${seed}`;
 
 // Define a standard clipping path according to shield type
 const getClipPath = () => {
  switch (shieldType) {
  case 1:
   return <circle cx="50" cy="50" r="43" />;
  case 2:
   return <path d="M 13 11 L 87 11 L 87 16 L 81 50 C 81 75 67 89 50 93 C 33 89 19 75 19 50 L 13 16 Z" />;
  case 3:
   return <path d="M 16 11 L 84 11 L 84 65 C 84 84 69 93 50 93 C 31 93 16 84 16 65 Z" />;
  case 4:
   return <path d="M 50 7 L 87 29 L 87 71 L 50 93 L 13 71 L 13 29 Z" />;
  case 0:
  default:
   return <path d="M 16 11 L 84 11 L 84 55 Q 84 79 50 93 Q 16 79 16 55 Z" />;
  }
 };

 const renderPatternElements = () => {
  switch (patternType) {
  case 1: // Vertical stripes
   return (
   <>
    <rect x="20" y="0" width="12" height="100" fill={secondary} opacity="0.45" />
    <rect x="44" y="0" width="12" height="100" fill={secondary} opacity="0.45" />
    <rect x="68" y="0" width="12" height="100" fill={secondary} opacity="0.45" />
   </>
   );
  case 2: // Horizontal stripes
   return (
   <>
    <rect x="0" y="20" width="100" height="12" fill={secondary} opacity="0.45" />
    <rect x="0" y="44" width="100" height="12" fill={secondary} opacity="0.45" />
    <rect x="0" y="68" width="100" height="12" fill={secondary} opacity="0.45" />
   </>
   );
  case 3: // Halves
   return <rect x="50" y="0" width="50" height="100" fill={secondary} opacity="0.45" />;
  case 4: // Quarters
   return (
   <>
    <rect x="50" y="0" width="50" height="50" fill={secondary} opacity="0.45" />
    <rect x="0" y="50" width="50" height="50" fill={secondary} opacity="0.45" />
   </>
   );
  case 5: // Chevron
   return (
   <path
    d="M 10 30 L 50 55 L 90 30 L 90 42 L 50 67 L 10 42 Z"
    fill={secondary}
    opacity="0.5"
   />
   );
  case 6: // Diagonals
   return (
   <polygon
    points="0,0 100,100 80,100 0,20"
    fill={secondary}
    opacity="0.45"
   />
   );
  case 0: // Solid
  default:
   return <circle cx="50" cy="50" r="30" fill={secondary} opacity="0.2" />;
  }
 };

 return (
  <>
  <defs>
   <clipPath id={clipId}>
   {getClipPath()}
   </clipPath>
  </defs>
  <g clipPath={`url(#${clipId})`}>
   {renderPatternElements()}
  </g>
  </>
 );
 };

 // Helper to render central emblem vectors
 const renderEmblem = () => {
 const color = '#ffffff'; // White overlay is clean and high contrast on most primary colors
 const strokeColor = secondary;

 switch (emblem) {
  case 'crown':
  return (
   <path
   d="M 30 65 L 25 40 L 40 50 L 50 35 L 60 50 L 75 40 L 70 65 Z M 30 70 L 70 70"
   fill="none"
   stroke={color}
   strokeWidth="4"
   strokeLinecap="round"
   strokeLinejoin="round"
   />
  );
  case 'sword':
  return (
   <g>
   <path
    d="M 50 25 L 50 68"
    fill="none"
    stroke={color}
    strokeWidth="5"
    strokeLinecap="round"
   />
   <path
    d="M 38 58 L 62 58"
    fill="none"
    stroke={color}
    strokeWidth="4"
    strokeLinecap="round"
   />
   <circle cx="50" cy="73" r="3.5" fill={color} />
   </g>
  );
  case 'waves':
  return (
   <g>
   <path
    d="M 28 45 Q 39 37 50 45 T 72 45"
    fill="none"
    stroke={color}
    strokeWidth="4"
    strokeLinecap="round"
   />
   <path
    d="M 28 55 Q 39 47 50 55 T 72 55"
    fill="none"
    stroke={color}
    strokeWidth="4"
    strokeLinecap="round"
   />
   <path
    d="M 28 65 Q 39 57 50 65 T 72 65"
    fill="none"
    stroke={color}
    strokeWidth="4"
    strokeLinecap="round"
   />
   </g>
  );
  case 'bird':
  return (
   <path
   d="M 50 30 C 50 30 55 35 55 42 C 55 48 48 55 48 65 L 53 65 M 50 42 C 45 42 40 45 42 53 C 44 60 50 65 50 65 M 46 38 C 44 38 43 35 45 35"
   fill="none"
   stroke={color}
   strokeWidth="4"
   strokeLinecap="round"
   strokeLinejoin="round"
   />
  );
  case 'lion':
  return (
   <path
   d="M 40 38 C 45 34 55 34 60 38 C 65 42 62 48 56 50 C 50 52 48 56 48 62 L 54 62 M 38 48 C 34 50 34 56 42 56 L 46 56 M 40 68 L 60 68"
   fill="none"
   stroke={color}
   strokeWidth="3.5"
   strokeLinecap="round"
   strokeLinejoin="round"
   />
  );
  case 'tree':
  return (
   <g>
   <path
    d="M 50 32 C 42 32 38 38 38 45 C 38 52 44 55 50 55 C 56 55 62 52 62 45 C 62 38 58 32 50 32 Z"
    fill="none"
    stroke={color}
    strokeWidth="4"
   />
   <path d="M 50 55 L 50 68" stroke={color} strokeWidth="5" strokeLinecap="round" />
   <path d="M 42 68 L 58 68" stroke={color} strokeWidth="4" strokeLinecap="round" />
   </g>
  );
  case 'castle':
  return (
   <path
   d="M 32 68 L 32 45 L 40 45 L 40 52 L 48 52 L 48 45 L 52 45 L 52 52 L 60 52 L 60 45 L 68 45 L 68 68 Z M 44 68 L 44 60 C 44 57 47 55 50 55 C 53 55 56 57 56 60 L 56 68"
   fill="none"
   stroke={color}
   strokeWidth="3.5"
   strokeLinecap="round"
   strokeLinejoin="round"
   />
  );
  case 'dragon':
  return (
   <path
   d="M 32 58 C 32 58 35 48 42 48 C 48 48 48 40 52 35 C 55 32 62 30 65 35 C 68 40 64 48 58 52 C 54 54 50 62 55 65 M 34 45 C 28 42 32 32 42 38 Z"
   fill="none"
   stroke={color}
   strokeWidth="3.5"
   strokeLinecap="round"
   strokeLinejoin="round"
   />
  );
  case 'star':
  return (
   <polygon
   points="50,26 57,41 73,43 61,54 65,70 50,62 35,70 39,54 27,43 43,41"
   fill="none"
   stroke={color}
   strokeWidth="3.5"
   strokeLinejoin="round"
   />
  );
  case 'ball':
  return (
   <g>
   <circle cx="50" cy="50" r="20" fill="none" stroke={color} strokeWidth="3.5" />
   <path d="M 36 36 L 64 64 M 36 64 L 64 36 M 50 30 L 50 70 M 30 50 L 70 50" stroke={color} strokeWidth="2.5" opacity="0.6" />
   </g>
  );
  case 'wings':
  return (
   <path
   d="M 22 45 Q 35 30 50 50 Q 65 30 78 45 M 25 53 Q 36 42 50 58 Q 64 42 75 53 M 28 61 Q 37 54 50 65 Q 63 54 72 61"
   fill="none"
   stroke={color}
   strokeWidth="3.5"
   strokeLinecap="round"
   />
  );
  case 'eagle':
  default:
  return (
   <path
   d="M 30 45 L 42 35 L 50 42 L 58 35 L 70 45 L 58 65 L 42 65 Z"
   fill="none"
   stroke={color}
   strokeWidth="3.5"
   strokeLinecap="round"
   strokeLinejoin="round"
   />
  );
 }
 };

 // Render initials wrapped elegantly or clean monogram
 const renderInitials = () => {
 // 2-3 characters from symbol or name
 const text = symbol.slice(0, 3).toUpperCase();
 return (
  <text
  x="50"
  y="83"
  textAnchor="middle"
  fill="#ffffff"
  fontSize="12"
  fontWeight="900"
  fontFamily="JetBrains Mono, Courier, monospace"
  letterSpacing="0.5"
  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
  >
  {text}
  </text>
 );
 };

 return (
 <svg
  width={size}
  height={size}
  viewBox="0 0 100 100"
  className={`inline-block select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${className}`}
  aria-label={`${name || symbol} logo`}
 >
  {/* 1. Shield Outline & Background fill */}
  {renderShieldBackground()}
  
  {/* 2. Inner Pattern Layer */}
  {renderPattern()}
  
  {/* 3. Outer Edge Highlight (subtle inner bevel style border) */}
  {shieldType === 1 ? (
  <circle cx="50" cy="50" r="41" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />
  ) : shieldType === 2 ? (
  <path d="M 15 13 L 85 13 L 79 50 C 79 73 66 86 50 90 C 34 86 21 73 21 50 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />
  ) : shieldType === 3 ? (
  <path d="M 18 13 L 82 13 L 82 65 C 82 82 68 90 50 90 C 32 90 18 82 18 65 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />
  ) : shieldType === 4 ? (
  <path d="M 50 10 L 85 31 L 85 69 L 50 90 L 15 69 L 15 31 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />
  ) : (
  <path d="M 18 13 L 82 13 L 82 55 Q 82 76 50 90 Q 18 76 18 55 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />
  )}

  {/* 4. Emblem Symbol */}
  <g className="transition-transform duration-300 hover:scale-105 transform origin-center">
  {renderEmblem()}
  </g>
  
  {/* 5. Team Monogram / Text initials */}
  {renderInitials()}
 </svg>
 );
};

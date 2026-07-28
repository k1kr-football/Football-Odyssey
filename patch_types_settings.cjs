const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
if (!content.includes('AppSettings')) {
  content += `

export interface AppSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  fullscreen: boolean;
  animations: boolean;
  matchEngineSpeed: 'Normal' | 'Fast' | 'Skip (Text Only)';
  autoSave: boolean;
}
`;
  fs.writeFileSync('src/types.ts', content);
}

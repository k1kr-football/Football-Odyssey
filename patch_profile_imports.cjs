const fs = require('fs');
let code = fs.readFileSync('src/screens/Profile.tsx', 'utf8');

code = code.replace("import React, { useState, useMemo } from 'react';", "import React, { useState, useMemo, useEffect } from 'react';\nimport { musicEngine } from '../utils/musicEngine';");

fs.writeFileSync('src/screens/Profile.tsx', code);

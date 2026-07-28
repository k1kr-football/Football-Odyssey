const fs = require('fs');
let content = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

content = content.replace(
  "import { Player, DayOfWeek, RoutineSlot, InboxMessage, EventChoice, DailyEvent, CalendarEntry } from '../types';",
  "import { Player, DayOfWeek, RoutineSlot, InboxMessage, EventChoice, DailyEvent, CalendarEntry, AppSettings, Screen } from '../types';"
);

fs.writeFileSync('src/store/GameContext.tsx', content);

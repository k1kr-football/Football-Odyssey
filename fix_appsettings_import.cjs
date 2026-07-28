const fs = require('fs');
let content = fs.readFileSync('src/store/GameContext.tsx', 'utf8');

// I also missed importing AppSettings. Let's fix that too.
if (!content.includes('AppSettings')) {
   // wait, it might be imported, let's replace all types
   content = content.replace(
      "import { Player, Screen, DayOfWeek, DailyEvent, InboxMessage, CalendarEntry, Position, Attributes, DevelopmentActivity, MatchEvent } from '../types';",
      "import { Player, Screen, DayOfWeek, DailyEvent, InboxMessage, CalendarEntry, Position, Attributes, DevelopmentActivity, MatchEvent, AppSettings } from '../types';"
   );
} else {
   content = content.replace(
      "import { Player, Screen, DayOfWeek, DailyEvent, InboxMessage, CalendarEntry, Position, Attributes, DevelopmentActivity, MatchEvent } from '../types';",
      "import { Player, Screen, DayOfWeek, DailyEvent, InboxMessage, CalendarEntry, Position, Attributes, DevelopmentActivity, MatchEvent, AppSettings } from '../types';"
   );
}

fs.writeFileSync('src/store/GameContext.tsx', content);

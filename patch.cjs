const fs = require('fs');
let code = fs.readFileSync('src/screens/Hub.tsx', 'utf8');

const calcStr = `
 const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
 const currentDayIdx = days.indexOf(state.currentDay);
 let nextDay = state.currentDay;
 let nextWeek = state.currentWeek;

 if (currentDayIdx < days.length - 1) {
   nextDay = days[currentDayIdx + 1];
 } else {
   nextDay = 'MON';
   nextWeek = state.currentWeek >= 52 ? 1 : state.currentWeek + 1;
 }
 const nextDateStr = getFormattedCalendarDate(nextWeek, nextDay);

 const outstandingCriticalItems = state.inbox.filter((msg: any) => msg.priority === 'CRITICAL' && !msg.read);
 const criticalCount = outstandingCriticalItems.length;
 const isAdvanceBlocked = criticalCount > 0;
`;

code = code.replace("const [activeFeedTab, setActiveFeedTab] = useState<'MANAGER' | 'SPECULATION' | 'SCOUTING'>('MANAGER');", "const [activeFeedTab, setActiveFeedTab] = useState<'MANAGER' | 'SPECULATION' | 'SCOUTING'>('MANAGER');" + calcStr);

fs.writeFileSync('src/screens/Hub.tsx', code);

import re

with open('src/utils/calendar.ts', 'r') as f:
    content = f.read()

events_logic = """
  // 5. Special Events (Dynamic Calendar Events)
  const eventTypes: Array<'MEDIA_DAY' | 'FAN_EVENT' | 'CHARITY' | 'TEAM_BONDING' | 'TRAINING_CAMP' | 'AWARD_CEREMONY' | 'SPONSOR_SHOOT' | 'INTERNATIONAL' | 'INJURY_SCARE'> = [
    'MEDIA_DAY', 'FAN_EVENT', 'CHARITY', 'TEAM_BONDING', 'SPONSOR_SHOOT'
  ];
  
  // Add a special event every ~4 weeks
  for (let week = 3; week <= 50; week += Math.floor(Math.random() * 2) + 3) {
      if (internationalBreaks.includes(week)) continue;
      // Try to place on THU or MON
      const targetDay = Math.random() > 0.5 ? 'THU' : 'MON';
      if (!isBusy(week, targetDay)) {
         const eType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
         entries.push({
            week, 
            day: targetDay as DayOfWeek, 
            type: 'EVENT',
            specialEvent: {
               id: `evt_${week}_${Math.random()}`,
               type: eType,
               description: eType.replace('_', ' ') + ' scheduled',
               status: 'PENDING'
            }
         });
      }
  }

  return entries;
"""

content = content.replace("return entries;", events_logic)

with open('src/utils/calendar.ts', 'w') as f:
    f.write(content)


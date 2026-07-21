sed -i -e '618,625c\
   p = {\
    ...p,\
    fans: Math.min(100, p.fans + 15),\
    trust: Math.min(100, p.trust + 10),\
    mediaPerception: Math.min(100, p.mediaPerception + 10)\
   };\
   setPlayer(p);' src/screens/MatchEngine.tsx

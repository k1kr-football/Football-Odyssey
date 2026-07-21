sed -i -e '652,659c\
   p = {\
    ...p,\
    fans: Math.max(0, p.fans - 10),\
    trust: Math.max(0, p.trust - 10),\
    mediaPerception: Math.max(0, p.mediaPerception - 10)\
   };\
   setPlayer(p);' src/screens/MatchEngine.tsx

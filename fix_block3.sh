sed -i -e '670,676c\
   p = {\
    ...p,\
    trust: Math.max(0, p.trust - 5),\
    morale: Math.max(0, p.morale - 5)\
   };\
   setPlayer(p);' src/screens/MatchEngine.tsx

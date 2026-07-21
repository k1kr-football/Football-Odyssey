sed -i 's/setPlayer(prev => {/let currentP = { ...p };/g' src/screens/MatchEngine.tsx
sed -i 's/if (!prev) return prev;/ /g' src/screens/MatchEngine.tsx
sed -i 's/return {/ /g' src/screens/MatchEngine.tsx
sed -i 's/\.\.\.prev/\.\.\.currentP/g' src/screens/MatchEngine.tsx
sed -i 's/prev\.fans/currentP.fans/g' src/screens/MatchEngine.tsx
sed -i 's/prev\.trust/currentP.trust/g' src/screens/MatchEngine.tsx
sed -i 's/prev\.mediaPerception/currentP.mediaPerception/g' src/screens/MatchEngine.tsx
sed -i 's/prev\.morale/currentP.morale/g' src/screens/MatchEngine.tsx

sed -i -e 's/const baseOvr = originDetails.startingOvr;/const initialNat = originDetails.nationalityPool[0];/g' src/screens/PlayerCreation.tsx
sed -i -e 's/const roll = baseOvr + (Math.floor(Math.random() \* 5) - 2); \/\/ +\/- 2 variance//g' src/screens/PlayerCreation.tsx
sed -i -e 's/setRolledOvr(roll);//g' src/screens/PlayerCreation.tsx

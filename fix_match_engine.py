import re

with open('src/screens/MatchEngine.tsx', 'r') as f:
    content = f.read()

# I need to insert `handleHalfTimeResponse` and `handleQuickSimulate` if they are missing.
# Let's just prepend them before `if (matchPhase === 'PRE_TALK' || matchPhase === 'FULL_TIME_TALK') {`

functions_to_add = """
 const handleHalfTimeResponse = (type: string) => {
  setTalkResponse('CONTINUE');
  const p = { ...state.player! };
  if (type === 'team') {
   p.trust = Math.min(100, (p.trust || 50) + 5);
  }
  setPlayer(p);
  setTimeout(() => {
   setTalkResponse(null);
   setMinute(46);
   setMatchPhase('PLAYING');
  }, 1000);
 };

 const handleQuickSimulate = () => {
  setHomeScore(Math.floor(Math.random() * 4));
  setAwayScore(Math.floor(Math.random() * 4));
  setMatchRating(6.5 + Math.random() * 2);
  setPassesMade(Math.floor(20 + Math.random() * 20));
  setPassesCompleted(Math.floor(15 + Math.random() * 20));
  setMatchPhase('POST_MATCH_SUMMARY');
 };

"""

content = content.replace("if (matchPhase === 'PRE_TALK' || matchPhase === 'FULL_TIME_TALK') {", functions_to_add + "if (matchPhase === 'PRE_TALK' || matchPhase === 'FULL_TIME_TALK') {")

with open('src/screens/MatchEngine.tsx', 'w') as f:
    f.write(content)
print("Functions added.")

import re

with open('src/screens/MatchEngine.tsx', 'r') as f:
    content = f.read()

replacement = """
    // Update player and advance day
    setPlayer(updatedPlayer);
    
    import("../utils/careerSystems").then(({ checkStoryArcProgression }) => {
        const { updatedArc, inboxMessage } = checkStoryArcProgression(updatedPlayer, newApps);
        
        if (updatedArc) {
             setPlayer(prev => ({...prev!, storyArc: updatedArc}));
        }
        
        let newInbox = inboxList;
        if (inboxMessage) {
            newInbox = [inboxMessage, ...newInbox];
        }
        setInbox(newInbox);
        
        // Return to Hub and advance calendar day
        setScreen('HUB', true);
        advanceDay(true);
    });
"""

# Find where it ends
target = """
    setInbox(inboxList);

    // Return to Hub and advance calendar day
    setScreen('HUB', true);
    advanceDay(true);
"""

content = content.replace(target, replacement)

with open('src/screens/MatchEngine.tsx', 'w') as f:
    f.write(content)


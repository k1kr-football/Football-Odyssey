import { InboxMessage } from '../types';

export interface NPC {
  name: string;
  role: 'MANAGER' | 'CAPTAIN' | 'AGENT' | 'ASSISTANT' | 'PROSPECT';
  personality: 'STERN' | 'LOYAL' | 'MONEY_FOCUSED' | 'ANALYTICAL' | 'HIGH_INTENSITY' | 'EAGER_TO_LEARN';
}

export const NPCS: NPC[] = [
  { name: "Boss Hassen", role: "MANAGER", personality: "STERN" },
  { name: "Gaffer Clement", role: "MANAGER", personality: "ANALYTICAL" },
  { name: "Captain Henderson", role: "CAPTAIN", personality: "HIGH_INTENSITY" },
  { name: "Captain Adams", role: "CAPTAIN", personality: "LOYAL" },
  { name: "Mino Lucci", role: "AGENT", personality: "MONEY_FOCUSED" },
  { name: "Sarah Sterling", role: "AGENT", personality: "LOYAL" },
  { name: "Coach Miller", role: "ASSISTANT", personality: "HIGH_INTENSITY" },
  { name: "Dr. Aris", role: "ASSISTANT", personality: "ANALYTICAL" },
  { name: "Billy Kid", role: "PROSPECT", personality: "EAGER_TO_LEARN" },
  { name: "Leo Rossi", role: "PROSPECT", personality: "EAGER_TO_LEARN" }
];

export function getNPC(role: NPC['role'], personality?: NPC['personality']): NPC {
  const filtered = NPCS.filter(n => n.role === role && (!personality || n.personality === personality));
  if (filtered.length > 0) {
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  const fallback = NPCS.filter(n => n.role === role);
  return fallback[Math.floor(Math.random() * fallback.length)];
}

// Generate custom dialogue based on NPC role and personality
export function generateNPCDialogue(
  npc: NPC, 
  scenarioType: 'SPONSOR_ATTEND' | 'TRAINING_DISPUTE' | 'LEAK_QUESTION' | 'MENTORING_ASK'
): { subject: string; content: string } {
  const name = npc.name;
  
  if (scenarioType === 'SPONSOR_ATTEND') {
    if (npc.role === 'AGENT') {
      if (npc.personality === 'MONEY_FOCUSED') {
        return {
          subject: "Commercial Gala Invite 📈",
          content: `Listen, kid. I've lined up a goldmine. A private watch brand wants you at their luxury gala tonight. It's £5,000 cash in hand. Yes, tactical team training is tomorrow morning, but who cares about some cardio drill when real money is on the table? Grab your suit. Let's secure this bag.`
        };
      } else { // LOYAL
        return {
          subject: "Local Brand Growth Proposal",
          content: `A local sustainable clothing brand wants you for a quick meet-and-greet with junior fans tonight. It's a humble £1,000 but the community loyalty will keep your brand safe for years. I know it's tight with training scheduled tomorrow morning, but I highly recommend showing your face.`
        };
      }
    }
  }

  if (scenarioType === 'TRAINING_DISPUTE') {
    if (npc.role === 'MANAGER') {
      if (npc.personality === 'STERN') {
        return {
          subject: "Drop in Training Standards 😡",
          content: `I don't care how many followers you have, or what your agent whispers in your ear. Your performance during the training drills today was lazy. You lack the work rate I expect from my players. You either double down tomorrow, or you can find a comfortable seat on the reserve bench.`
        };
      } else { // ANALYTICAL
        return {
          subject: "GPS Training Data Report 📊",
          content: `Our technical team's telemetry reports show your high-intensity sprint distance dropped by 18% in today's drills. Tactical positioning parameters also deviated from our tactical framework. We need to rectify this immediately. Do you need a lighter schedule, or are you ready to study the game film?`
        };
      }
    } else if (npc.role === 'CAPTAIN') {
      if (npc.personality === 'HIGH_INTENSITY') {
        return {
          subject: "Pull your socks up! 😤",
          content: `I saw you coasting during the tactical drills today, mate. If we want silverware, everyone needs to bleed for the badge. Pull your socks up or we're going to have a real problem in the dressing room. Standards cannot drop!`
        };
      }
    }
  }

  if (scenarioType === 'LEAK_QUESTION') {
    if (npc.role === 'ASSISTANT') {
      if (npc.personality === 'ANALYTICAL') {
        return {
          subject: "Leak Warning: Source Detected ⚠️",
          content: `My contacts in the media department detected a press leak containing tomorrow's exact starting line-up. A journalist from @RomanoHere has already posted about it. We are tracking internal emails. Did you say something to your agent, or is someone else playing games behind our backs?`
        };
      } else { // HIGH_INTENSITY
        return {
          subject: "DRESSING ROOM SNAKE ALERT! 🐍",
          content: `A local journalist just published our exact set-piece routines for Saturday! Someone leaked it. If I find out who's talking to the papers, I'll throw their boots in the bin myself. We need to shut this down and focus. We need total lock-down.`
        };
      }
    }
  }

  if (scenarioType === 'MENTORING_ASK') {
    if (npc.role === 'PROSPECT') {
      return {
        subject: "Humble Advice Request ⭐",
        content: `Hey big man, sorry to bother you. I'm struggling with my first touch and positioning under pressure during drills. You are an absolute master at it. Can we stay after training for 30 minutes tomorrow? I want to learn how you shield the ball so gracefully.`
      };
    }
  }

  // Fallbacks
  return {
    subject: "A message from " + name,
    content: `Let's discuss our upcoming preparations. We need to be aligned and ready to succeed.`
  };
}

export function generateConsequenceScenario(player: any, currentDay: string, currentWeek: number): InboxMessage | null {
  const roll = Math.random();
  const index = Math.floor(roll * 4);
  
  if (index === 0) { // Commercial Opportunity
    const agentNPC = getNPC('AGENT');
    const dialogue = generateNPCDialogue(agentNPC, 'SPONSOR_ATTEND');
    
    return {
      id: `scenario_sponsor_${Date.now()}`,
      sender: `${agentNPC.name} (AGENT)`,
      subject: dialogue.subject,
      content: dialogue.content,
      read: false,
      type: 'DM',
      timestamp: `${currentDay} 10:00`,
      choices: [
        { text: agentNPC.personality === 'MONEY_FOCUSED' ? 'Attend Luxury Gala (+£5,000, 2-day fatigue lag)' : 'Attend Charity Show (+£1,000, 2-day PR boost)', type: 'scen_sponsor_accept' },
        { text: 'Decline and rest', type: 'scen_sponsor_decline' }
      ]
    };
  }
  else if (index === 1) { // Training Dispute
    const mgrNPC = getNPC('MANAGER');
    const dialogue = generateNPCDialogue(mgrNPC, 'TRAINING_DISPUTE');
    
    return {
      id: `scenario_training_${Date.now()}`,
      sender: `${mgrNPC.name} (MANAGER)`,
      subject: dialogue.subject,
      content: dialogue.content,
      read: false,
      type: 'DM',
      timestamp: `${currentDay} 14:00`,
      choices: [
        { text: 'Accept criticism and do extra drills (+5 trust, +10 fatigue)', type: 'scen_training_grind' },
        { text: 'Defend your stats and argue (-10 trust, +5 morale)', type: 'scen_training_argue' }
      ]
    };
  }
  else if (index === 2) { // Leak / Press Demands
    const asstNPC = getNPC('ASSISTANT');
    const dialogue = generateNPCDialogue(asstNPC, 'LEAK_QUESTION');
    
    return {
      id: `scenario_leak_${Date.now()}`,
      sender: `${asstNPC.name} (ASSISTANT)`,
      subject: dialogue.subject,
      content: dialogue.content,
      read: false,
      type: 'DM',
      timestamp: `${currentDay} 16:30`,
      choices: [
        { text: 'Confess and blame agent (-5 trust, 1-day delayed relief)', type: 'scen_leak_confess' },
        { text: 'Deny everything vehemently (+5 morale, 1-day delayed test)', type: 'scen_leak_deny' }
      ]
    };
  }
  else { // Mentoring Request
    const prospectNPC = getNPC('PROSPECT');
    const dialogue = generateNPCDialogue(prospectNPC, 'MENTORING_ASK');
    
    return {
      id: `scenario_mentor_${Date.now()}`,
      sender: `${prospectNPC.name} (PROSPECT)`,
      subject: dialogue.subject,
      content: dialogue.content,
      read: false,
      type: 'DM',
      timestamp: `${currentDay} 11:15`,
      choices: [
        { text: 'Stay after for 1-on-1 session (+10 fatigue, 3-day growth)', type: 'scen_mentor_stay' },
        { text: 'Tell him to train with reserves (-10 prospect rel, 2-day lag)', type: 'scen_mentor_skip' }
      ]
    };
  }
}

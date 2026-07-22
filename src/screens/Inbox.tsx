import { ProgressBar } from "../components/ProgressBar";
import React, { useState } from "react";
import { useGame } from "../store/GameContext";
import {
 Mail,
 ArrowLeft,
 Send,
 Users,
 Shield,
 Award,
 Sparkles,
 AlertTriangle,
} from "lucide-react";
import { TeamLogo } from "../components/TeamLogo";
import { CLUBS, RIVALRIES } from "../data/teams";
import { CharacterPortrait } from "../components/CharacterPortrait";
import { getReputationTags } from "../utils/reputation";
import { generateSeasonObjective, generateRandomNewManager } from "../utils/seasonObjectives";
import { getIntlEligibility, processIntlMatch } from "../utils/international";
import { executeTestimonialMatch } from "../utils/testimonialMatch";
import { processInboxMessages } from "../utils/notifications";

export function Inbox() {
 const { state, setPlayer, setInbox, updateCalendar, setScreen } = useGame();

 const [selectedMsg, setSelectedMsg] = useState<any>(null);
 const [notification, setNotification] = useState<string | null>(null);
 const [digestEnabled, setDigestEnabled] = useState(true);
 const [verbosity, setVerbosity] = useState<'ALL' | 'IMPORTANT_AND_CRITICAL' | 'CRITICAL_ONLY'>(
   state.player?.stateFlags?.notificationVerbosity || 'ALL'
 );

 if (!state.player) return null;

 const handleVerbosityChange = (val: 'ALL' | 'IMPORTANT_AND_CRITICAL' | 'CRITICAL_ONLY') => {
   setVerbosity(val);
   if (state.player) {
     setPlayer({
       ...state.player,
       stateFlags: {
         ...state.player.stateFlags,
         notificationVerbosity: val
       }
     });
   }
 };
 const showNotification = (msg: string) => {
   setNotification(msg);
   setTimeout(() => setNotification(null), 3500);
 };

 const getSelectedMsgClub = () => {
  if (!selectedMsg) return null;
  const choiceClubSymbol = selectedMsg.choices?.find(
   (c: any) => c.clubSymbol,
  )?.clubSymbol;
  const currentClubSymbol =
   state.player?.currentClubSymbol || "BIR";
  const isClubStaff = [
   "MANAGER",
   "ASSISTANT MANAGER",
   "SPORTING DIRECTOR",
   "CLUB CAPTAIN",
  ].includes(selectedMsg.sender.toUpperCase());

  const targetSymbol =
   choiceClubSymbol || (isClubStaff ? currentClubSymbol : null);
  return targetSymbol
   ? CLUBS.find(
    (c) =>
    c.symbol.toUpperCase() === targetSymbol.toUpperCase(),
   )
   : null;
 };
 const currentSelectedClub = getSelectedMsgClub();
 const [category, setCategory] = useState<
 "ALL" | "STAFF" | "AGENT" | "TEAM" | "MEDICAL" | "SOCIAL"
 >("ALL");

 // Interactive Negotiation States
 const [negotiatingMsg, setNegotiatingMsg] = useState<any | null>(null);
 const [negotiationPhase, setNegotiationPhase] = useState<
 "NONE" | "NEGOTIATE" | "SUCCESS" | "COLLAPSED"
 >("NONE");
 const [targetClub, setTargetClub] = useState("");
 const [isLoanTransition, setIsLoanTransition] = useState(false);

 // Negotiation parameters
 const [baseWage, setBaseWage] = useState(0);
 const [proposedWage, setProposedWage] = useState(0);
 const [proposedGoalBonus, setProposedGoalBonus] = useState(100);
 const [proposedAppBonus, setProposedAppBonus] = useState(50);
 const [patience, setPatience] = useState(100); // 0-100%
 const [boardFeedback, setBoardFeedback] = useState(
 "We are very interested in bringing you to the club. Let's discuss contract terms.",
 );
 const [lastRoundText, setLastRoundText] = useState(
 "Initial Offer details on table.",
 );
 const [proposedCleanSheetBonus, setProposedCleanSheetBonus] = useState(50);
 const [proposedMilestoneBonus, setProposedMilestoneBonus] = useState(200);
 const [negotiationLog, setNegotiationLog] = useState<string[]>([]);
 const [isSponsorship, setIsSponsorship] = useState(false);
 const [sponsorName, setSponsorName] = useState("");

 const messages = state.inbox || [];

 const startNegotiations = (choice: any) => {
 setNegotiatingMsg(selectedMsg);
 setTargetClub(choice.clubSymbol || "SND");
 setIsLoanTransition(choice.type.includes("loan"));

 // Set base numbers
 const initialWage =
  choice.wage ||
  (state.player?.contract.wage
  ? Math.floor(state.player.contract.wage * 1.1)
  : 1000);
 setBaseWage(initialWage);
 setProposedWage(initialWage);
 setProposedGoalBonus(choice.goalBonus || 150);
 setProposedAppBonus(choice.appearanceBonus || 80);
 setPatience(100);
 setNegotiationPhase("NEGOTIATE");
 setBoardFeedback(
  `Welcome, son. We are looking forward to signing you to ${choice.clubSymbol}. State your demands.`,
 );
 setLastRoundText(
  `Minimum expectation: £${initialWage.toLocaleString()} p/w.`,
 );
 };

 const handleAction = (choice: any) => {
 const player = state.player!;
 let newPlayer = { ...player };
 let rels = { ...player.relationships };

 if (choice.type === "digest_mark_all_read") {
  const unreadIds = selectedMsg?.digestItems ? selectedMsg.digestItems.map((m: any) => m.id) : [];
  const updatedInbox = messages.map(m => {
   if (unreadIds.includes(m.id)) {
    return { ...m, read: true };
   }
   return m;
  });
  setInbox(updatedInbox);
  setSelectedMsg(null);
  showNotification("Marked all digest items as read!");
  return;
 }

 // Intercept with Negotiations if player wants more/accepts
 if (
  choice.type === "transfer_accept" ||
  choice.type === "loan_accept_negotiate"
 ) {
  startNegotiations(choice);
  return;
 }

 if (choice.type === "sponsorship_negotiate") {
  startSponsorshipNegotiations(choice);
  return;
 }

 // Process normal choices
 if (choice.type === "mgr_agree") {
  newPlayer.fatigue = Math.min(100, player.fatigue + 15);
  newPlayer.tacticalFamiliarity = Math.min(
  100,
  player.tacticalFamiliarity + 5,
  );
  rels.manager = Math.min(100, rels.manager + 5);
  showNotification("+5 Manager Trust | +5 Tactical | +15% Fatigue");
 } else if (choice.type === "mgr_disagree") {
  rels.manager = Math.max(0, rels.manager - 10);
  newPlayer.fatigue = Math.max(0, player.fatigue - 5);
  showNotification("-10 Manager Trust");
 } else if (choice.type === "agent_quiet") {
  rels.agent = Math.min(100, rels.agent + 5);
  showNotification("+5 Agent Relationship");
 } else if (choice.type === "agent_loud") {
  rels.agent = Math.max(0, rels.agent - 10);
  newPlayer.fans = Math.max(0, player.fans - 10);
  newPlayer.morale = Math.min(100, player.morale + 10);
  showNotification("+10 Morale | -10 Fans | -10 Agent Rel");
 } else if (choice.type === "med_push") {
  rels.manager = Math.min(100, rels.manager + 5);
  newPlayer.sharpness = Math.max(0, player.sharpness - 10);
  showNotification("+5 Manager Trust | -10 Sharpness");
 } else if (choice.type === "med_rest") {
  rels.manager = Math.max(0, rels.manager - 5);
  newPlayer.sharpness = Math.min(100, player.sharpness + 10);
  showNotification("+10 Sharpness | -5 Manager Trust");
 } else if (choice.type === "cap_go") {
  rels.teammates = Math.min(100, rels.teammates + 15);
  newPlayer.morale = Math.min(100, player.morale + 15);
  newPlayer.fatigue = Math.min(100, player.fatigue + 10);
 } else if (choice.type === "cap_skip") {
  rels.teammates = Math.max(0, rels.teammates - 10);
  newPlayer.morale = Math.max(0, player.morale - 10);
  newPlayer.fatigue = Math.max(0, player.fatigue - 10);
 } else if (choice.type === "deadline_force_move") {
  rels.manager = Math.max(0, rels.manager - 20);
  newPlayer.fans = Math.max(0, player.fans - 10);
  
  const isWellConnected = ['Shark', 'Super Agent', 'Legend'].includes(newPlayer.agentTier);
  const successChance = isWellConnected ? 0.7 : 0.3;
  
  if (Math.random() < successChance) {
      const possibleClubs = CLUBS.filter(c => c.symbol !== newPlayer.currentClubSymbol);
      const currentTier = CLUBS.find(c => c.symbol === newPlayer.currentClubSymbol)?.tier === 'Elite' ? 1 : 
                          CLUBS.find(c => c.symbol === newPlayer.currentClubSymbol)?.tier === 'Strong' ? 2 : 
                          CLUBS.find(c => c.symbol === newPlayer.currentClubSymbol)?.tier === 'Mid' ? 3 : 
                          CLUBS.find(c => c.symbol === newPlayer.currentClubSymbol)?.tier === 'Lower' ? 4 : 5;
      
      const validClubs = possibleClubs.filter(c => {
          const t = c.tier === 'Elite' ? 1 : c.tier === 'Strong' ? 2 : c.tier === 'Mid' ? 3 : c.tier === 'Lower' ? 4 : 5;
          return t >= currentTier; // same or lower tier
      });
      
      if (validClubs.length > 0) {
          const club = validClubs[Math.floor(Math.random() * validClubs.length)];
          const offerWage = Math.floor(newPlayer.contract.wage * 0.8);
          
          if (!newPlayer.transferOffers) newPlayer.transferOffers = [];
          newPlayer.transferOffers.push({
                id: `offer_${club.symbol}_${Date.now()}`,
                clubSymbol: club.symbol,
                wage: offerWage,
                bonus: Math.floor(offerWage * 52 * 0.1),
                length: 2,
                status: 'PENDING'
          });
          
          setTimeout(() => {
              setInbox([...state.inbox, {
                  id: `deadline_panic_offer_${Date.now()}`,
                  sender: 'AGENT',
                  subject: `🚨 PANIC BUY: Offer from ${club.symbol}!`,
                  content: `I called in every favor I had. ${club.name} are willing to take a chance on you, but as promised, the wages are lower. We only have hours left to sign the paperwork! Check the Transfer Hub.`,
                  read: false,
                  type: 'NEWS',
                  timestamp: `${state.currentDay} 19:00`,
                  choices: []
              }]);
          }, 0);
      }
  } else {
      newPlayer.morale = Math.max(0, newPlayer.morale - 20);
      setTimeout(() => {
          setInbox([...state.inbox, {
              id: `deadline_panic_fail_${Date.now()}`,
              sender: 'AGENT',
              subject: `Update: No luck`,
              content: `I've been on the phone for 6 hours straight. No one is biting. The manager knows we tried to force our way out, and the window is shutting. This is going to be an awkward team meeting tomorrow.`,
              read: false,
              type: 'DM',
              timestamp: `${state.currentDay} 23:00`,
              choices: [{ text: 'Disastrous.', type: 'ack' }]
          }]);
      }, 0);
  }
 } else if (choice.type === "deadline_stay") {
  rels.manager = Math.min(100, rels.manager + 10);
  newPlayer.morale = Math.min(100, newPlayer.morale + 5);
  newPlayer.transferListed = false; 
  setTimeout(() => {
      setInbox([...state.inbox, {
          id: `deadline_stay_${Date.now()}`,
          sender: 'MANAGER',
          subject: `Commitment`,
          content: `I appreciate you putting the noise to rest and staying focused on our campaign. We're in this together. See you at training.`,
          read: false,
          type: 'DM',
          timestamp: `${state.currentDay} 18:00`,
          choices: [{ text: 'Thanks Boss.', type: 'ack' }]
      }]);
  }, 0);
 } else if (choice.type === "transfer_reject") {
  rels.agent = Math.max(0, rels.agent - 5);
  rels.manager = Math.min(100, rels.manager + 5);
  newPlayer.fans = Math.min(100, newPlayer.fans + 5);
 } else if (choice.type === "INTL_ACCEPT" || choice.type === "INTL_OK") {
  const isTournament = selectedMsg?.subject?.includes('Tournament') || false;
  const matchRes = processIntlMatch(newPlayer, isTournament);
  newPlayer = matchRes.updatedPlayer;
  
  if (!newPlayer.stateFlags) newPlayer.stateFlags = { historyFlags: {}, openThreads: {}, eventCooldowns: {} };
  newPlayer.stateFlags.activeIntlWindow = state.currentWeek;
  newPlayer.stateFlags.intlStatus = getIntlEligibility(newPlayer) as any;
  
  showNotification(`Reported to ${newPlayer.nationality} camp! Match Rating: ${matchRes.rating}/10 (${matchRes.result})`);
  if (matchRes.inboxMessages.length > 0) {
    setTimeout(() => {
      setInbox([...state.inbox, ...matchRes.inboxMessages]);
    }, 0);
  }
 } else if (choice.type === "TESTIMONIAL_ACCEPT") {
  const testRes = executeTestimonialMatch(newPlayer, 'HUMBLE_GRATITUDE');
  newPlayer = testRes.updatedPlayer;
  showNotification(`Hosted Testimonial Match! Gate Payout: +£${(testRes.gateRevenue / 1000).toFixed(0)}k`);
  setTimeout(() => {
    setInbox([...state.inbox, testRes.inboxMessage]);
  }, 0);
 } else if (choice.type === "TESTIMONIAL_DECLINE") {
  showNotification('Politely declined testimonial match proposal.');
 } else if (choice.type === "INTL_DECLINE") {
  rels.manager = Math.min(100, rels.manager + 5);
  rels.intlManager = Math.max(0, (rels.intlManager || 50) - 20);
  newPlayer.reputation.world = Math.max(0, newPlayer.reputation.world - 5);
  newPlayer.fans = Math.max(0, newPlayer.fans - 5);
 } else if (choice.type === "INTL_RETIRE") {
  if (!newPlayer.stateFlags) newPlayer.stateFlags = { historyFlags: {}, openThreads: {}, eventCooldowns: {} };
  newPlayer.stateFlags.intlStatus = 'Retired';
  newPlayer.reputation.world = Math.max(0, newPlayer.reputation.world - 10);
  newPlayer.fans = Math.max(0, newPlayer.fans - 10);
  
  setTimeout(() => {
      setInbox([...state.inbox, {
          id: `intl_retired_${Date.now()}`,
          sender: 'MANAGER',
          subject: `International Retirement`,
          content: `I saw your announcement. It's a big decision, but it means you can focus 100% on us now. I appreciate that commitment.`,
          read: false,
          type: 'DM',
          timestamp: `${state.currentDay} 19:00`,
          choices: [{ text: 'Thanks boss.', type: 'ack' }]
      }]);
  }, 0);
 } else if (choice.type === "sponsor_accept") {
  newPlayer.sponsors += 1;
  rels.agent = Math.min(100, rels.agent + 5);
  newPlayer.mediaPerception = Math.min(100, newPlayer.mediaPerception + 5);
 } else if (choice.type === "sponsor_reject") {
  rels.agent = Math.max(0, rels.agent - 5);
 } else if (choice.type.startsWith("social_")) {
  if (newPlayer.socialMedia) {
  if (choice.type === "social_humble") {
   newPlayer.mediaPerception = Math.min(
   100,
   newPlayer.mediaPerception + 10,
   );
   newPlayer.socialMedia.followers += 500;
  } else if (choice.type === "social_reactive") {
   newPlayer.socialMedia.cancelRisk = Math.min(
   100,
   newPlayer.socialMedia.cancelRisk + 30,
   );
   newPlayer.socialMedia.followers += 5000;
   if (Math.random() > 0.5) {
   newPlayer.fans = Math.min(100, newPlayer.fans + 15);
   } else {
   newPlayer.fans = Math.max(0, newPlayer.fans - 20);
   newPlayer.mediaPerception = Math.max(
    0,
    newPlayer.mediaPerception - 15,
   );
   }
  }
  }
 } else if (choice.type === "manager_greet_safe") {
  rels.manager = Math.min(100, rels.manager + 5);
  newPlayer.morale = Math.min(100, newPlayer.morale + 5);
 } else if (choice.type === "manager_greet_arrogant") {
  rels.manager = Math.max(0, rels.manager - 15);
  newPlayer.morale = Math.min(100, newPlayer.morale + 10);
 } else if (choice.type === "manager_greet_doubt") {
  rels.manager = Math.max(0, rels.manager - 5);
  newPlayer.morale = Math.max(0, newPlayer.morale - 10);
 } else if (choice.type === "loan_reject") {
  rels.manager = Math.max(0, rels.manager - 5);
  newPlayer.morale = Math.min(100, newPlayer.morale + 5);
 } else if (choice.type === "loan_recall_accept") {
  const parentClubSymbol = newPlayer.contract?.parentClub || newPlayer.startingClubSymbol || CLUBS[0].symbol;
  const parentClubObj = CLUBS.find(c => c.symbol === parentClubSymbol) || CLUBS[0];
  newPlayer.currentClubSymbol = parentClubObj.symbol;
  if (newPlayer.contract) {
   newPlayer.contract.parentClub = undefined;
  }
  newPlayer.loanInfo = undefined;

  newPlayer.seasonObjective = generateSeasonObjective(parentClubObj, newPlayer.ovr);
  newPlayer.managerInfo = generateRandomNewManager(newPlayer.currentClubSymbol);

  newPlayer.timeline = [
  {
   id: `loan_recall_evt_${Date.now()}`,
   week: state.currentWeek,
   day: state.currentDay,
   type: "TRANSFER",
   title: "Recalled from Loan",
   description: `Recalled back to parent club ${newPlayer.currentClubSymbol}.`,
   clubSymbol: newPlayer.currentClubSymbol,
  },
  ...newPlayer.timeline,
  ];
 } else if (choice.type === "extension_accept") {
  newPlayer.contract.wage = choice.wage;
  newPlayer.contract.bonuses = choice.bonus;
  rels.manager = Math.min(100, rels.manager + 10);
  newPlayer.fans = Math.min(100, newPlayer.fans + 15);

  newPlayer.timeline = [
  {
   id: `contract_${Date.now()}`,
   week: state.currentWeek,
   day: state.currentDay,
   type: "MILESTONE",
   title: "Signed Contract Extension",
   description: `Committed future to the club with a contract worth £${choice.wage.toLocaleString()}/w.`,
   clubSymbol: newPlayer.currentClubSymbol,
  },
  ...newPlayer.timeline,
  ];
 } else if (choice.type === "extension_reject") {
  rels.manager = Math.max(0, rels.manager - 20);
  rels.teammates = Math.max(0, rels.teammates - 10);
  newPlayer.mediaPerception = Math.min(100, newPlayer.mediaPerception + 10);
  newPlayer.trust = Math.max(0, newPlayer.trust - 30);
 } else if (choice.type === "sign_agent") {
  newPlayer.savedAgent = selectedMsg?.metadata?.agent || null;
  newPlayer.agentName = selectedMsg?.metadata?.agent?.name || "Unrepresented";
  newPlayer.agentTier = selectedMsg?.metadata?.agent?.tier || "Rookie";
  rels.agent = 75; // high starting relationship

  newPlayer.timeline = [
  {
   id: `signed_agent_${Date.now()}`,
   week: state.currentWeek,
   day: state.currentDay,
   type: "MILESTONE",
   title: "Hired Professional Agent",
   description: `Signed representation contract with ${newPlayer.agentName} (${newPlayer.agentTier} Agent).`,
   clubSymbol: newPlayer.currentClubSymbol,
  },
  ...newPlayer.timeline,
  ];
 } else if (choice.type === "decline_agent") {
  // Just decline, do nothing
 } else if (choice.type === "retire_graceful") {
  newPlayer.stateFlags = {
   ...(newPlayer.stateFlags || {}),
   retired: true
  };
  newPlayer.timeline = [
   {
    id: `retirement_${Date.now()}`,
    week: state.currentWeek,
    day: state.currentDay,
    type: "MILESTONE",
    title: "Retired Gracefully 🌟",
    description: `Announced formal immediate retirement from professional football at age ${newPlayer.age} via agent dispatch.`,
    clubSymbol: newPlayer.currentClubSymbol
   },
   ...newPlayer.timeline
  ];
  setScreen("PROFILE");
 } else if (choice.type === "retire_coach") {
  newPlayer.stateFlags = {
   ...(newPlayer.stateFlags || {}),
   retired: true
  };
  newPlayer.timeline = [
   {
    id: `coaching_grad_${Date.now()}`,
    week: state.currentWeek,
    day: state.currentDay,
    type: "MILESTONE",
    title: "Began Coaching Odyssey 🎓",
    description: `Graduated with an elite Pro License and registered interests for backroom setups at ${newPlayer.currentClubSymbol}.`,
    clubSymbol: newPlayer.currentClubSymbol
   },
   ...newPlayer.timeline
  ];
  setScreen("PROFILE");
 } else if (choice.type === "retire_pursue_records") {
  newPlayer.stateFlags = {
   ...(newPlayer.stateFlags || {}),
   openThreads: {
    ...(newPlayer.stateFlags?.openThreads || {}),
    activeRetirementQuest: "GOALS"
   }
  };
  newPlayer.timeline = [
   {
    id: `record_pursuit_${Date.now()}`,
    week: state.currentWeek,
    day: state.currentDay,
    type: "MILESTONE",
    title: "Stayed to Pursue Records 🎯",
    description: "Committed to staying in active service to challenge remaining ageless striker records.",
    clubSymbol: newPlayer.currentClubSymbol
   },
   ...newPlayer.timeline
  ];
  setScreen("PROFILE");
 } else if (choice.type === "story_embrace") {
  newPlayer.morale = Math.min(100, newPlayer.morale + 10);
  newPlayer.reputation.world = Math.min(100, newPlayer.reputation.world + 5);
  if (newPlayer.storyArc) {
   newPlayer.storyArc.resolution = "EMBRACED";
  }
 } else if (choice.type === "story_reject") {
  newPlayer.morale = Math.max(0, newPlayer.morale - 10);
  rels.manager = Math.max(0, rels.manager - 5);
  if (newPlayer.storyArc) {
   newPlayer.storyArc.resolution = "REJECTED";
  }
 } else if (choice.type === "story_question") {
  newPlayer.morale = Math.min(100, newPlayer.morale + 5);
  newPlayer.mediaPerception = Math.min(100, newPlayer.mediaPerception + 5);
  if (newPlayer.storyArc) {
   newPlayer.storyArc.resolution = "QUESTIONED";
  }
 } else if (
  choice.type === "scen_sponsor_accept" ||
  choice.type === "scen_sponsor_decline" ||
  choice.type === "scen_training_grind" ||
  choice.type === "scen_training_argue" ||
  choice.type === "scen_leak_confess" ||
  choice.type === "scen_leak_deny" ||
  choice.type === "scen_mentor_stay" ||
  choice.type === "scen_mentor_skip"
 ) {
  const getFutureDay = (currentDay: string, daysToAdd: number): { day: string, weekOffset: number } => {
   const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
   const idx = days.indexOf(currentDay);
   const targetIdx = (idx + daysToAdd) % 7;
   const weekOffset = Math.floor((idx + daysToAdd) / 7);
   return { day: days[targetIdx], weekOffset };
  };

  let delayedEffects = [...(newPlayer.stateFlags?.openThreads?.delayedEffects || [])];

  if (choice.type === "scen_sponsor_accept") {
   const isGala = choice.text.includes("Gala");
   if (isGala) {
   newPlayer.finances.balance += 5000;
   rels.agent = Math.min(100, rels.agent + 10);
   
   const fut = getFutureDay(state.currentDay, 2);
   delayedEffects.push({
    id: `de_${Date.now()}`,
    effectDay: fut.day,
    effectWeek: state.currentWeek + fut.weekOffset,
    type: 'SPONSOR_FATIGUE'
   });
   } else {
   newPlayer.finances.balance += 1000;
   rels.agent = Math.min(100, rels.agent + 5);
   
   const fut = getFutureDay(state.currentDay, 2);
   delayedEffects.push({
    id: `de_${Date.now()}`,
    effectDay: fut.day,
    effectWeek: state.currentWeek + fut.weekOffset,
    type: 'SPONSOR_CHARITY_THANK'
   });
   }
  } else if (choice.type === "scen_training_grind") {
   newPlayer.trust = Math.min(100, newPlayer.trust + 5);
   newPlayer.fatigue = Math.min(100, newPlayer.fatigue + 10);
  } else if (choice.type === "scen_training_argue") {
   newPlayer.trust = Math.max(0, newPlayer.trust - 10);
   newPlayer.morale = Math.min(100, newPlayer.morale + 5);
  } else if (choice.type === "scen_leak_confess") {
   newPlayer.trust = Math.max(0, newPlayer.trust - 5);
   
   const fut = getFutureDay(state.currentDay, 1);
   delayedEffects.push({
   id: `de_${Date.now()}`,
   effectDay: fut.day,
   effectWeek: state.currentWeek + fut.weekOffset,
   type: 'LEAK_FORGIVEN'
   });
  } else if (choice.type === "scen_leak_deny") {
   newPlayer.morale = Math.min(100, newPlayer.morale + 5);
   
   const fut = getFutureDay(state.currentDay, 1);
   delayedEffects.push({
   id: `de_${Date.now()}`,
   effectDay: fut.day,
   effectWeek: state.currentWeek + fut.weekOffset,
   type: 'LEAK_BACKLASH'
   });
  } else if (choice.type === "scen_mentor_stay") {
   rels.teammates = Math.min(100, rels.teammates + 5);
   newPlayer.fatigue = Math.min(100, newPlayer.fatigue + 10);
   
   const fut = getFutureDay(state.currentDay, 3);
   delayedEffects.push({
   id: `de_${Date.now()}`,
   effectDay: fut.day,
   effectWeek: state.currentWeek + fut.weekOffset,
   type: 'MENTOR_GROWTH'
   });
  } else if (choice.type === "scen_mentor_skip") {
   rels.teammates = Math.max(0, rels.teammates - 5);
   
   const fut = getFutureDay(state.currentDay, 2);
   delayedEffects.push({
   id: `de_${Date.now()}`,
   effectDay: fut.day,
   effectWeek: state.currentWeek + fut.weekOffset,
   type: 'MENTOR_FALLOUT'
   });
  }

  newPlayer.stateFlags = {
   ...newPlayer.stateFlags,
   openThreads: {
   ...newPlayer.stateFlags.openThreads,
   delayedEffects
   }
  };
 }

 newPlayer.relationships = rels;
 setPlayer(newPlayer);

 const updatedInbox = messages.map((m) =>
  m.id === selectedMsg.id ? { ...m, read: true } : m,
 );
 setInbox(updatedInbox);
 setSelectedMsg(null);
 };

 const startSponsorshipNegotiations = (choice: any) => {
  setIsSponsorship(true);
  setSponsorName(choice.sponsorName || "Nike");
  setTargetClub(choice.sponsorName || "Nike");
  setNegotiatingMsg(selectedMsg);
  
  const playerRep = state.player?.reputation?.world || 10;
  const baseSponsorWage = Math.round(playerRep * 75 + 300);
  
  setBaseWage(baseSponsorWage);
  setProposedWage(baseSponsorWage);
  setProposedGoalBonus(0);
  setProposedAppBonus(0);
  setProposedCleanSheetBonus(0);
  setProposedMilestoneBonus(0);
  setPatience(100);
  setNegotiationPhase("NEGOTIATE");
  setBoardFeedback(`"We see massive brand potential in you. Let's hammer out the weekly sponsorship retainer details."`);
  setLastRoundText(`Minimum sponsor estimate: £${baseSponsorWage.toLocaleString()} p/w.`);
  setNegotiationLog([`Sponsorship discussion opened with ${choice.sponsorName || "Nike"}.`]);
 };

 const submitProposedOffer = () => {
  const p = state.player!;
  
  if (isSponsorship) {
   const tags = getReputationTags(p);
   let stanceMultiplier = 1.0;
   if (tags.includes('MODEL_PROFESSIONAL') || tags.includes('FAN_FAVOURITE')) stanceMultiplier = 1.25;
   if (tags.includes('DISRUPTIVE_INFLUENCE') || tags.includes('MERCENARY')) stanceMultiplier = 0.85;
   
   const greedRatio = proposedWage / baseWage;
   
   if (greedRatio <= 1.05 * stanceMultiplier) {
    setNegotiationPhase("SUCCESS");
    setBoardFeedback(`"We have a deal! Let's get the papers signed."`);
    setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w.`, `${sponsorName} accepted terms.`]);
   } else if (greedRatio > 1.35 * stanceMultiplier) {
    const drop = 35;
    const nextPatience = Math.max(0, patience - drop);
    setPatience(nextPatience);
    if (nextPatience <= 0) {
     setNegotiationPhase("COLLAPSED");
     setBoardFeedback(`"These demands do not reflect your market value. We are walking away."`);
     setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w.`, `Negotiations collapsed due to excessive greed.`]);
    } else {
     const counterWage = Math.floor(baseWage * 1.02);
     setProposedWage(counterWage);
     setBoardFeedback(`"We are a world-class brand, not a charity. Here is our absolute counter: £${counterWage.toLocaleString()}/w."`);
     setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w (Too high).`, `${sponsorName} countered with £${counterWage.toLocaleString()}/w.`]);
    }
   } else {
    const drop = 15;
    const nextPatience = Math.max(0, patience - drop);
    setPatience(nextPatience);
    if (nextPatience <= 0) {
     setNegotiationPhase("COLLAPSED");
     setBoardFeedback(`"Negotiations have stalled. We will explore other player endorsements."`);
     setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w.`, `Negotiations collapsed due to lack of compromise.`]);
    } else {
     const compromiseWage = Math.floor(baseWage + (proposedWage - baseWage) * 0.35);
     setProposedWage(compromiseWage);
     setBoardFeedback(`"Let's meet in the middle. We offer £${compromiseWage.toLocaleString()}/w. Deal?"`);
     setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w.`, `${sponsorName} countered with £${compromiseWage.toLocaleString()}/w.`]);
    }
   }
   return;
  }

  // Contract compromise logic based on club finance tier
  const targetTeam = CLUBS.find(c => c.symbol === targetClub);
  const tier = targetTeam ? targetTeam.tier : 'Mid';
  const isRich = tier === 'Elite' || tier === 'Strong';
  const isLower = tier === 'Lower';
  
  const greedRatio =
   (proposedWage + proposedGoalBonus + proposedAppBonus + proposedCleanSheetBonus + proposedMilestoneBonus * 0.1) /
   (baseWage + 150 + 80 + 50 + 20);
   
  const patienceDropFactor = isRich ? 0.7 : isLower ? 1.5 : 1.0;
  
  if (greedRatio <= (isRich ? 1.15 : isLower ? 1.02 : 1.06)) {
   setNegotiationPhase("SUCCESS");
   setBoardFeedback(`"Outstanding. We are absolutely pleased to welcome you to the squad under these terms. Here is the contract ready to sign."`);
   setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w.`, `Board accepted terms.`]);
  } else if (greedRatio > (isRich ? 1.45 : isLower ? 1.15 : 1.35)) {
   const drop = Math.round(40 * patienceDropFactor);
   const nextPatience = Math.max(0, patience - drop);
   setPatience(nextPatience);
   if (nextPatience <= 0) {
    setNegotiationPhase("COLLAPSED");
    setBoardFeedback(`"These demands are absolute daylight robbery! We are pulling out of discussions. Have a good season."`);
    setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w with supplements.`, `Negotiations collapsed.`]);
   } else {
    const counterWage = Math.floor(baseWage * (isRich ? 1.12 : isLower ? 1.01 : 1.05));
    setProposedWage(counterWage);
    setProposedGoalBonus(100);
    setProposedAppBonus(50);
    setProposedCleanSheetBonus(40);
    setProposedMilestoneBonus(150);
    setBoardFeedback(`"Do you think we are made of gold? We will not spend anywhere near those wages. Here is our absolute limit: £${counterWage.toLocaleString()} p/w. Take it or leave it."`);
    setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w (Too greedy for club limits).`, `Board countered with £${counterWage.toLocaleString()}/w.`]);
   }
  } else {
   const drop = Math.round(20 * patienceDropFactor);
   const nextPatience = Math.max(0, patience - drop);
   setPatience(nextPatience);
   if (nextPatience <= 0) {
    setNegotiationPhase("COLLAPSED");
    setBoardFeedback(`"Unfortunately your demands do not align with our budget limits. Negotiations have collapsed."`);
    setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w.`, `Negotiations collapsed.`]);
   } else {
    const compromiseWage = Math.floor(baseWage + (proposedWage - baseWage) * (isRich ? 0.55 : isLower ? 0.15 : 0.35));
    setProposedWage(compromiseWage);
    setBoardFeedback(`"That's a bit rich. Let's compromise. We can do £${compromiseWage.toLocaleString()} p/w, with standard appearance supplements. Are we in agreement?"`);
    setNegotiationLog(prev => [...prev, `You proposed £${proposedWage.toLocaleString()}/w.`, `Board countered with £${compromiseWage.toLocaleString()}/w.`]);
   }
  }
 };

 const finalizeNegotiatedDeal = () => {
  const player = state.player!;
  let newPlayer = { ...player };
  let rels = { ...player.relationships };

  if (isSponsorship) {
   newPlayer.finances.balance += proposedWage * 4; // Sign-on bonus of 4 weeks!
   newPlayer.stateFlags = {
    ...(newPlayer.stateFlags || {}),
    activeSponsorship: {
     sponsor: sponsorName,
     wage: proposedWage,
     signedWeek: state.currentWeek
    }
   };
   newPlayer.timeline = [
    {
     id: `sponsor_signed_${Date.now()}`,
     week: state.currentWeek,
     day: state.currentDay,
     type: "MILESTONE",
     title: `Signed with ${sponsorName}`,
     description: `Secured an official endorsement deal with ${sponsorName}, earning £${proposedWage.toLocaleString()}/w.`,
     clubSymbol: "FA"
    },
    ...newPlayer.timeline
   ];
   
   setPlayer(newPlayer);
   const updatedInbox = messages.map((m) =>
    m.id === negotiatingMsg.id ? { ...m, read: true } : m,
   );
   setInbox(updatedInbox);
   setNegotiatingMsg(null);
   setNegotiationPhase("NONE");
   setSelectedMsg(null);
   setIsSponsorship(false);
   return;
  }
 if (isLoanTransition) {
  newPlayer.contract.parentClub = newPlayer.currentClubSymbol;
  newPlayer.currentClubSymbol = targetClub;
  newPlayer.loanInfo = {
  hostClub: targetClub,
  playingTimeGuarantee: true,
  recallClause: true,
  wagePercentage: 100,
  };
  newPlayer.contract.wage = proposedWage;
  newPlayer.contract.appearanceBonus = proposedAppBonus;
  newPlayer.contract.goalBonus = proposedGoalBonus;

  newPlayer.timeline = [
  {
   id: `loan_finish_${Date.now()}`,
   week: state.currentWeek,
   day: state.currentDay,
   type: "TRANSFER",
   title: `Loan Transfer to ${targetClub}`,
   description: `Signed loan contract with ${targetClub} worth £${proposedWage.toLocaleString()}/w after custom personal negotiations.`,
   clubSymbol: targetClub,
  },
  ...newPlayer.timeline,
  ];
 } else {
  newPlayer.currentClubSymbol = targetClub;
  newPlayer.contract.wage = proposedWage;
  newPlayer.contract.appearanceBonus = proposedAppBonus;
  newPlayer.contract.goalBonus = proposedGoalBonus;
  newPlayer.contract.status = "Rotation"; // Initial provisional status
  newPlayer.transferListed = false;
  newPlayer.reputation.world = Math.min(
  100,
  newPlayer.reputation.world + 5,
  );
  rels.agent = Math.min(100, rels.agent + 15);
  
  if (state.currentWeek <= 4) {
      newPlayer.stateFlags.preseasonEvaluation = {
          friendlyAppearances: 0,
          friendlyRatingsSum: 0,
          provisionalStatus: 'Rotation',
          originalStatus: 'First Teamer',
          injuries: 0
      };
  } else {
      newPlayer.stateFlags.midSeasonEvaluation = {
          matchesPlayed: 0,
          ratingsSum: 0,
          provisionalStatus: 'Rotation',
          targetMatches: 3
      };
  }
  
  // RIVALRIES imported globally
  const currentRivals = RIVALRIES[player.currentClubSymbol] || [];
  if (currentRivals.find((r: any) => r.opponent === targetClub)) {
   newPlayer.fans = 0; // Betrayal
  } else {
   newPlayer.fans = 10; // Start over as new signing
  }

  newPlayer.timeline = [
  {
   id: `transfer_finish_${Date.now()}`,
   week: state.currentWeek,
   day: state.currentDay,
   type: "TRANSFER",
   title: `Transferred to ${targetClub}`,
   description: `Completed permanent transfer to ${targetClub}. Secured negotiated contract worth £${proposedWage}/w, goals: £${proposedGoalBonus}.`,
   clubSymbol: targetClub,
  },
  ...newPlayer.timeline,
  ];
 }

 const targetClubObj = CLUBS.find(c => c.symbol === targetClub) || CLUBS[0];
 newPlayer.seasonObjective = generateSeasonObjective(targetClubObj, newPlayer.ovr);
 newPlayer.managerInfo = generateRandomNewManager(targetClub);

 newPlayer.relationships = rels;
 setPlayer(newPlayer);

 const updatedInbox = messages.map((m) =>
  m.id === negotiatingMsg.id ? { ...m, read: true } : m,
 );
 setInbox(updatedInbox);

 // Clear negotiation states
 setNegotiatingMsg(null);
 setNegotiationPhase("NONE");
 setSelectedMsg(null);
 };

 const cancelNegotiation = () => {
 if (state.player) {
  const p = { ...state.player };
  p.relationships.agent = Math.max(0, p.relationships.agent - 10);
  setPlayer(p);
 }

 // Reject email
 const updatedInbox = messages.map((m) =>
  m.id === negotiatingMsg.id ? { ...m, read: true } : m,
 );
 setInbox(updatedInbox);

 setNegotiatingMsg(null);
 setNegotiationPhase("NONE");
 setSelectedMsg(null);
 };

 const processedAllMessages = processInboxMessages(messages, verbosity, digestEnabled);

 const filteredMessages = processedAllMessages.filter((m) => {
 if (category === "ALL") return true;
 if (category === "STAFF")
  return (
  m.sender === "ASSISTANT MANAGER" ||
  m.sender === "MANAGER" ||
  m.sender === "SPORTING DIRECTOR"
  );
 if (category === "AGENT") return m.sender === "AGENT";
 if (category === "TEAM") return m.sender === "CLUB CAPTAIN";
 if (category === "MEDICAL") return m.sender === "CHIEF MEDICAL OFFICER";
 if (category === "SOCIAL") return m.type === "SOCIAL";
 return true;
 });

 return (
 <div className="flex h-full gap-6 select-none font-sans relative">
  {/* Negotiation Interface Screen Overlay */}
  {negotiationPhase !== "NONE" && (
  <div className="absolute inset-0 z-50 bg-[#0c0d0d] flex flex-col p-8 font-sans animate-fade-in overflow-y-auto">
   <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 h-full justify-between pb-8">
   <div>
    {/* Header block */}
    <div className="flex justify-between items-center pb-4 border-b border-white/10">
    <div>
     <h1 className="text-2xl font-black tracking-tight uppercase text-white font-display">
     Contract Negotiations
     </h1>
     <p className="text-xs text-[#00FF88] uppercase font-mono mt-1 tracking-widest">
     {isLoanTransition ? "Loan Agreement" : "Permanent Transfer"}{" "}
     &middot; Boardroom {targetClub}
     </p>
    </div>
    <div className="text-right">
     <ProgressBar label="Representative Mood" value={patience} colorMode="morale" height="h-2" className="w-48" />
    </div>
    </div>

    {/* Character Bubble */}
    <div className="mt-6 flex gap-4 premium-card p-6 rounded-md">
    <div className="w-12 h-12 bg-[#00FF88] text-black font-black flex items-center justify-center rounded uppercase text-lg shrink-0">
     {targetClub.slice(0, 2)}
    </div>
    <div>
     <h4 className="text-white text-xs font-bold uppercase tracking-wider font-display mb-1">
     {targetClub} Board Delegate
     </h4>
     <p className="text-[#00FF88] text-sm font-mono leading-relaxed italic">
     "{boardFeedback}"
     </p>
    </div>
    </div>

    {/* Symmetrical Adjustments Area */}
    {negotiationPhase === "NEGOTIATE" && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Proposal Adjusters */}
      <div className="bg-[#151515] border border-[#2c2c2c] p-6 space-y-6">
      <h3 className="text-white text-xs font-bold tracking-widest uppercase pb-3 border-b border-white/10">
       {isSponsorship ? "Proposed Endorsement Terms" : "Proposed Demands"}
      </h3>

      {/* Wage Counter */}
      <div className="space-y-2">
       <div className="flex justify-between items-center text-xs">
       <span className="text-white/50 font-bold uppercase font-mono">
        {isSponsorship ? "Sponsorship Retainer p/w" : "Weekly Wage"}
       </span>
       <span className="text-white font-black text-lg font-mono">
        £{proposedWage.toLocaleString()} p/w
       </span>
       </div>
       <div className="flex gap-2">
       <button
        onClick={() =>
        setProposedWage((w) => Math.max(0, w - 250))
        }
        className="flex-1 py-1.5 hover:border-[#666] text-white text-xs font-mono font-bold uppercase"
       >
        - £250/w
       </button>
       <button
        onClick={() => setProposedWage((w) => w + 250)}
        className="flex-1 py-1.5 hover:border-[#00FF88] text-[#00FF88] text-xs font-mono font-bold uppercase"
       >
        + £250/w
       </button>
       </div>
      </div>

      {!isSponsorship && (
       <>
        {/* Goal Bonus Counter */}
        <div className="space-y-2">
         <div className="flex justify-between items-center text-xs">
         <span className="text-white/50 font-bold uppercase font-mono">
          Goal Bonus Supplement
         </span>
         <span className="text-white font-black text-sm font-mono">
          £{proposedGoalBonus.toLocaleString()}
         </span>
         </div>
         <div className="flex gap-2">
         <button
          onClick={() =>
          setProposedGoalBonus((b) => Math.max(0, b - 50))
          }
          className="flex-1 py-1.5 hover:border-[#666] text-white text-xs font-mono font-bold uppercase"
         >
          - £50
         </button>
         <button
          onClick={() => setProposedGoalBonus((b) => b + 50)}
          className="flex-1 py-1.5 hover:border-[#00FF88] text-[#00FF88] text-xs font-mono font-bold uppercase"
         >
          + £50
         </button>
         </div>
        </div>

        {/* Appearance Bonus */}
        <div className="space-y-2">
         <div className="flex justify-between items-center text-xs">
         <span className="text-white/50 font-bold uppercase font-mono">
          Match Appearance Bonus
         </span>
         <span className="text-white font-black text-sm font-mono">
          £{proposedAppBonus.toLocaleString()}
         </span>
         </div>
         <div className="flex gap-2">
         <button
          onClick={() =>
          setProposedAppBonus((b) => Math.max(0, b - 20))
          }
          className="flex-1 py-1.5 hover:border-[#666] text-white text-xs font-mono font-bold uppercase"
         >
          - £20
         </button>
         <button
          onClick={() => setProposedAppBonus((b) => b + 20)}
          className="flex-1 py-1.5 hover:border-[#00FF88] text-[#00FF88] text-xs font-mono font-bold uppercase"
         >
          + £20
         </button>
         </div>
        </div>

        {/* Clean Sheet Bonus Counter */}
        <div className="space-y-2">
         <div className="flex justify-between items-center text-xs">
         <span className="text-white/50 font-bold uppercase font-mono">
          Clean Sheet Bonus Supplement
         </span>
         <span className="text-white font-black text-sm font-mono">
          £{proposedCleanSheetBonus.toLocaleString()}
         </span>
         </div>
         <div className="flex gap-2">
         <button
          onClick={() =>
          setProposedCleanSheetBonus((b) => Math.max(0, b - 10))
          }
          className="flex-1 py-1.5 hover:border-[#666] text-white text-xs font-mono font-bold uppercase"
         >
          - £10
         </button>
         <button
          onClick={() => setProposedCleanSheetBonus((b) => b + 10)}
          className="flex-1 py-1.5 hover:border-[#00FF88] text-[#00FF88] text-xs font-mono font-bold uppercase"
         >
          + £10
         </button>
         </div>
        </div>

        {/* Milestone/Promotion Bonus Counter */}
        <div className="space-y-2">
         <div className="flex justify-between items-center text-xs">
         <span className="text-white/50 font-bold uppercase font-mono">
          Promotion & Silverware Bonus
         </span>
         <span className="text-white font-black text-sm font-mono">
          £{proposedMilestoneBonus.toLocaleString()}
         </span>
         </div>
         <div className="flex gap-2">
         <button
          onClick={() =>
          setProposedMilestoneBonus((b) => Math.max(0, b - 50))
          }
          className="flex-1 py-1.5 hover:border-[#666] text-white text-xs font-mono font-bold uppercase"
         >
          - £50
         </button>
         <button
          onClick={() => setProposedMilestoneBonus((b) => b + 50)}
          className="flex-1 py-1.5 hover:border-[#00FF88] text-[#00FF88] text-xs font-mono font-bold uppercase"
         >
          + £50
         </button>
         </div>
        </div>
       </>
      )}
      </div>

      {/* Context Status Panel */}
      <div className="bg-[#141515] p-6 flex flex-col justify-between">
      <div>
       <h3 className="text-white/50 text-xs font-bold tracking-widest uppercase pb-3 border-b border-white/10">
        {isSponsorship ? "Endorsement Briefing" : "Representative Notes"}
       </h3>

       {/* Log Console */}
       {negotiationLog.length > 0 && (
        <div className="mt-4 mb-4 bg-black/40 border border-white/5 p-3 rounded h-32 overflow-y-auto space-y-1.5 font-mono text-[10px] leading-tight">
         <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold pb-1 border-b border-white/5 mb-1">NEGOTIATION HISTORY</div>
         {negotiationLog.map((logLine, idx) => (
          <div key={idx} className={logLine.includes('countered') || logLine.includes('collapsed') ? 'text-amber-400' : logLine.includes('accepted') ? 'text-[#00FF88]' : 'text-white/60'}>
           &gt; {logLine}
          </div>
         ))}
        </div>
       )}

       <div className="space-y-4 font-mono text-xs leading-relaxed text-[#aaa] mt-4">
       <p>
        {isSponsorship 
         ? "Sponsor budgets scale directly with your global reputation and stance. High demands increase patience decay, risking absolute withdrawal." 
         : "Your target club's recruitment budget is strictly monitored by league authorities. Demanding excessively high starting figures causes board patience to decay immediately."}
       </p>
       <p className="premium-card p-3 rounded text-amber-500 font-bold border border-amber-500/10">
        ⚠ If Patience hits 0%, negotiations terminate
        instantly. You will stay at your parent club, and your
        agent relationship is damaged.
       </p>
       <div className="pt-2 border-t border-white/10 flex justify-between">
        <span className="text-white/40">
        Original Base:
        </span>
        <span className="text-white font-bold">
        £{baseWage.toLocaleString()} p/w
        </span>
       </div>
       </div>
      </div>

      <button
       onClick={() => submitProposedOffer()}
       className="w-full mt-6 bg-[#00FF88] text-black font-mono font-bold text-xs uppercase py-3.5 tracking-wider hover:bg-[#00FF88]"
      >
       Submit Counter-Offer
      </button>
      </div>
    </div>
    )}

    {/* SUCCESS PANEL */}
     {negotiationPhase === "SUCCESS" && (
     <div className="bg-emerald-950/15 border border-emerald-500/30 p-8 rounded text-center my-12 animate-fade-in max-w-2xl mx-auto space-y-6">
      <Sparkles size={48} className="text-emerald-400 mx-auto" />
      <h3 className="text-emerald-400 text-2xl font-black uppercase font-display tracking-tight">
      {isSponsorship ? "Endorsement Deal Secured!" : "Contract Agreed!"}
      </h3>
      <div className="bg-black/40 p-6 rounded border border-emerald-500/10 space-y-3 font-mono text-sm inline-block w-full text-left">
      <div className="flex justify-between border-b border-white/10 pb-2">
       <span className="text-white/40">{isSponsorship ? "Sponsor" : "Club"}:</span>{" "}
       <span className="text-white font-bold">{targetClub}</span>
      </div>
      <div className="flex justify-between border-b border-white/10 pb-2">
       <span className="text-white/40">{isSponsorship ? "Weekly Retainer" : "Weekly Wage"}:</span>{" "}
       <span className="text-emerald-400 font-bold">
       £{proposedWage.toLocaleString()} p/w
       </span>
      </div>
      {!isSponsorship && (
       <>
        <div className="flex justify-between border-b border-white/10 pb-2">
         <span className="text-white/40">Goal Bonus:</span>{" "}
         <span className="text-white font-bold">
         £{proposedGoalBonus.toLocaleString()}
         </span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-2">
         <span className="text-white/40">Appearance Bonus:</span>{" "}
         <span className="text-white font-bold">
         £{proposedAppBonus.toLocaleString()}
         </span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-2">
         <span className="text-white/40">Clean Sheet Bonus:</span>{" "}
         <span className="text-white font-bold">
         £{proposedCleanSheetBonus.toLocaleString()}
         </span>
        </div>
        <div className="flex justify-between">
         <span className="text-white/40">Promotion/Silverware Bonus:</span>{" "}
         <span className="text-white font-bold">
         £{proposedMilestoneBonus.toLocaleString()}
         </span>
        </div>
       </>
      )}
      </div>
      <p className="text-[#aaa] text-xs leading-relaxed">
      {isSponsorship 
       ? "Sponsorship credentials have been written to your active endorsements portfolio. An initial 4-week sign-on bonus was deposited into your checking account."
       : "Custom contract parameters have been securely stored in your personal directory folder. Welcome to your new career chapter."}
      </p>
      <button
      onClick={() => finalizeNegotiatedDeal()}
      className="w-full bg-emerald-500 text-black font-bold uppercase tracking-wider text-xs py-3 font-mono"
      >
      Confirm and Close
      </button>
     </div>
     )}

    {/* COLLAPSED PANEL */}
    {negotiationPhase === "COLLAPSED" && (
    <div className="bg-red-950/15 border border-red-500/30 p-8 rounded text-center my-12 animate-fade-in max-w-2xl mx-auto space-y-6">
     <AlertTriangle size={48} className="text-red-400 mx-auto" />
     <h3 className="text-red-400 text-2xl font-black uppercase font-display tracking-tight">
     Negotiations Collapsed
     </h3>
     <p className="text-[#ccc] text-sm leading-relaxed max-w-md mx-auto">
     The club representatives got completely fed up with your
     demands and packed their papers. They have officially
     rescinded the offer.
     </p>
     <div className="text-xs text-red-400 font-mono italic">
     Agent trust has dropped by 10%.
     </div>
     <button
     onClick={() => cancelNegotiation()}
     className="w-full bg-red-500 text-white font-bold uppercase tracking-wider text-xs py-3 font-mono hover:bg-red-400"
     >
     Close & Return to Inbox
     </button>
    </div>
    )}
   </div>

   {negotiationPhase === "NEGOTIATE" && (
    <div className="flex justify-between items-center border-t border-white/10 pt-6">
    <button
     onClick={() => cancelNegotiation()}
     className="px-6 py-2 hover:border-red-500 hover:text-red-500 text-white/50 font-mono text-xs uppercase"
    >
     Walk Away from Negotiation
    </button>
    <div className="text-xs text-[#555] font-mono uppercase font-bold">
     Football Career Simulation Boardroom v1.0
    </div>
    </div>
   )}
   </div>
  </div>
  )}

  {/* Main Mailbox Dashboard UI */}
  {/* Categories Sidebar */}
  <div className="w-[200px] flex flex-col gap-2">
  {["ALL", "STAFF", "TEAM", "MEDICAL", "AGENT", "SOCIAL"].map((c) => (
   <button
   key={c}
   onClick={() => setCategory(c as any)}
   className={`text-left p-4 uppercase tracking-widest text-xs font-bold transition-colors border-l-4
    ${category === c ? "glass-panel border-[#00FF88] text-white font-display" : "premium-card border-transparent text-white/50 hover:bg-[#151515] hover:text-[#ccc]"}
    `}
   >
   {c}
   </button>
  ))}

   {/* QOL Preferences Pane */}
   <div className="mt-4 p-4 bg-[#0d0d0d] border border-white/5 rounded space-y-4 font-sans">
    <div className="text-[9px] font-mono font-black uppercase text-white/40 tracking-wider">
     QOL Preferences
    </div>
    
    {/* Verbosity Setting */}
    <div className="space-y-1.5">
     <label className="text-[9px] font-bold text-white/60 uppercase tracking-widest block font-sans">Verbosity Filter</label>
     <select 
      value={verbosity}
      onChange={(e) => handleVerbosityChange(e.target.value as any)}
      className="w-full bg-[#141414] border border-[#2f2f2f] text-white text-[10px] font-mono rounded px-2 py-1.5 focus:border-[#00FF88] focus:outline-none"
     >
      <option value="ALL">Show All Messages</option>
      <option value="IMPORTANT_AND_CRITICAL">Hide Ambient News</option>
      <option value="CRITICAL_ONLY">Critical Alerts Only</option>
     </select>
    </div>

    {/* Digest Mode Toggle */}
    <div className="flex items-center justify-between pt-2 border-t border-white/5">
     <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest font-sans">Digest Mode</span>
     <button
      onClick={() => setDigestEnabled(!digestEnabled)}
      className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${digestEnabled ? 'bg-[#00FF88]' : 'bg-white/10'}`}
     >
      <div className={`w-4 h-4 rounded-full bg-black transition-transform ${digestEnabled ? 'transform translate-x-5' : ''}`} />
     </button>
    </div>
   </div>
  </div>

  <div className="w-1/3 premium-card flex flex-col">
  <div className="p-6 border-b border-white/10 text-white/50 text-xs tracking-widest uppercase flex justify-between font-bold bg-[#151515] font-display">
   <span>{category} MESSAGES</span>
   <span className="text-[#00FF88] font-mono">
   {filteredMessages.filter((m: any) => !m.read).length} Unread
   </span>
  </div>
  <div className="flex-1 overflow-y-auto hide-scrollbar">
   {filteredMessages.length === 0 ? (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 h-full">
     <div className="w-12 h-12 rounded-full bg-[#141414] border border-white/5 flex items-center justify-center mb-3">
      <Mail className="text-white/30 w-6 h-6" />
     </div>
     <div className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Inbox Cleared</div>
     <p className="text-[#555] text-[10px] max-w-[240px] mt-1 leading-relaxed">No {category !== 'ALL' ? category.toLowerCase() : ''} messages at this time. All official correspondence is up to date.</p>
    </div>
   ) : (() => {
     const criticalUnread = filteredMessages.filter(m => m.priority === 'CRITICAL' && !m.read);
     const standardMsgs = filteredMessages.filter(m => m.priority !== 'CRITICAL' || m.read);
     
     const renderCard = (msg: any) => {
       let priorityStyle = "";
       let badgeColor = "text-[#666] border-[#333] bg-white/5";
       
       if (msg.priority === 'CRITICAL') {
         priorityStyle = msg.read ? "border-l-red-500/40" : "bg-red-950/10 border-l-red-500 shadow-[0_0_15px_rgba(239,68,68,0.05)]";
         badgeColor = "text-red-400 border-red-500/20 bg-red-950/20 animate-pulse";
       } else if (msg.priority === 'IMPORTANT') {
         priorityStyle = msg.read ? "border-l-cyan-500/40" : "bg-cyan-950/10 border-l-cyan-500";
         badgeColor = "text-cyan-400 border-cyan-500/20 bg-cyan-950/20";
       } else if (msg.priority === 'AMBIENT') {
         priorityStyle = "border-l-amber-500/20";
         badgeColor = "text-amber-500 border-amber-500/10 bg-amber-950/5";
       } else if (msg.sender === 'WEEKLY CORRESPONDENCE DIGEST') {
         priorityStyle = "bg-teal-950/5 border-l-teal-500";
         badgeColor = "text-teal-400 border-teal-500/20 bg-teal-950/20";
       }

       return (
         <div
           key={msg.id}
           onClick={() => {
             setSelectedMsg(msg);
             if (!msg.read && msg.sender !== 'WEEKLY CORRESPONDENCE DIGEST') {
               const updatedInbox = messages.map((m) =>
                 m.id === msg.id ? { ...m, read: true } : m
               );
               setInbox(updatedInbox);
             }
           }}
           className={`p-5 border-b border-white/10 cursor-pointer transition-colors relative
           ${selectedMsg?.id === msg.id ? "bg-[#1d1d1d]" : "hover:bg-[#151515]"}
           border-l-4 ${priorityStyle || (selectedMsg?.id === msg.id ? "border-l-[#00FF88]" : !msg.read ? "border-l-[#00FF88]/60 bg-[#141616]" : "border-l-transparent")}`}
         >
           <div className="flex justify-between items-center mb-1.5">
             <div className="text-[#00FF88] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 font-mono">
               {!msg.read && (
                 <span className="w-2 h-2 bg-[#00FF88] rounded-full inline-block animate-pulse shrink-0"></span>
               )}
               {msg.sender}
             </div>
             <div className="flex items-center gap-1.5">
               <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 border rounded ${badgeColor}`}>
                 {msg.priority || 'ROUTINE'}
               </span>
               <span className="text-[#555] text-[10px] uppercase font-bold tracking-widest font-mono">
                 {msg.read ? "Opened" : "New"}
               </span>
             </div>
           </div>
           <div className={`text-xs tracking-wide truncate font-display ${!msg.read ? "text-white font-bold" : "text-white/50 font-medium"}`}>
             {msg.subject}
           </div>
           <div className="text-white/40 text-[10px] font-sans mt-1 line-clamp-1 truncate max-w-[280px]">
             {msg.content?.replace(/\n/g, ' ') || ''}
           </div>
         </div>
       );
     };

     return (
       <div className="flex flex-col">
         {criticalUnread.length > 0 && (
           <div className="bg-red-950/5 border-b border-red-900/20">
             <div className="px-5 py-2 text-[9px] font-mono font-black text-red-400 bg-red-950/20 uppercase tracking-widest border-b border-red-950 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
               🚨 Critical Actions Required ({criticalUnread.length})
             </div>
             {[...criticalUnread].reverse().map(renderCard)}
           </div>
         )}
         
         {standardMsgs.length > 0 && (
           <div>
             {criticalUnread.length > 0 && (
               <div className="px-5 py-2 text-[9px] font-mono font-black text-white/40 uppercase tracking-widest border-b border-white/5 bg-black/40">
                 📁 General Correspondence ({standardMsgs.length})
               </div>
             )}
             {[...standardMsgs].reverse().map(renderCard)}
           </div>
         )}
       </div>
     );
   })()}
  </div>
  </div>

  <div className="flex-1 premium-card flex flex-col relative">
  {selectedMsg ? (
   selectedMsg.digestItems ? (
    <div className="flex-1 flex flex-col h-full bg-[#0d0e0e] relative overflow-hidden">
     {/* Digest Header */}
     <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-black/40">
      <div className="flex items-center gap-3">
       <div className="w-10 h-10 rounded bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-mono text-teal-400 font-bold uppercase shrink-0">
        ✉
       </div>
       <div>
        <div className="text-white text-sm font-bold tracking-widest uppercase font-display">
         WEEKLY CORRESPONDENCE DIGEST
        </div>
        <div className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-0.5 font-mono">
         Grouped Routine Updates ({selectedMsg.digestItems.length} messages)
        </div>
       </div>
      </div>
      <button
       onClick={() => handleAction({ type: 'digest_mark_all_read' })}
       className="px-4 py-2 bg-teal-500 text-black text-[10px] font-mono font-black uppercase tracking-widest rounded hover:bg-teal-400 transition-colors shadow"
      >
       Mark All Read
      </button>
     </div>

     {/* Digest Items list */}
     <div className="p-8 flex-1 overflow-y-auto space-y-6">
      <div className="border-l-2 border-teal-500/30 pl-4 py-1 mb-6">
       <p className="text-[#888] text-xs font-mono leading-relaxed">
        Your dynamic Digest Assistant has compiled {selectedMsg.digestItems.length} lower-priority notifications from your inbox to prevent main feed fatigue.
       </p>
      </div>

      <div className="space-y-4">
       {selectedMsg.digestItems.map((item: any, idx: number) => (
        <div key={item.id || idx} className="bg-[#141414] border border-white/5 rounded-lg p-6 relative">
         <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-3">
          <div>
           <span className="text-[10px] font-mono font-black text-teal-400 uppercase tracking-widest">
            {item.sender}
           </span>
           <h3 className="text-white text-xs font-bold mt-1 tracking-wide font-display">
            {item.subject}
           </h3>
          </div>
          <span className="text-[9px] font-mono text-[#555] uppercase font-bold tracking-widest">
           {item.type || 'EMAIL'}
          </span>
         </div>
         <p className="text-[#bbb] text-xs leading-relaxed font-sans whitespace-pre-wrap font-medium">
          {item.content}
         </p>
        </div>
       ))}
      </div>
     </div>

     {/* Digest Footer Action */}
     <div className="p-6 border-t border-white/10 bg-[#0a0a0a] flex justify-end">
      <button
       onClick={() => handleAction({ type: 'digest_mark_all_read' })}
       className="w-full py-4 bg-teal-500 text-black font-black uppercase tracking-widest text-[11px] font-mono rounded hover:bg-teal-400 transition-colors shadow-lg"
      >
       Archive and Mark All {selectedMsg.digestItems.length} Items as Read
      </button>
     </div>
    </div>
   ) : (
    <>
    <div className="px-8 py-6 border-b border-white/10 flex items-center gap-4">
    {(() => {
    const choiceClubSymbol = selectedMsg.choices?.find(
     (c: any) => c.clubSymbol,
    )?.clubSymbol;
    const currentClubSymbol =
     state.player?.currentClubSymbol || "BIR";
    const isClubStaff = [
     "MANAGER",
     "ASSISTANT MANAGER",
     "SPORTING DIRECTOR",
     "CLUB CAPTAIN",
    ].includes(selectedMsg.sender.toUpperCase());

    const targetSymbol =
     choiceClubSymbol || (isClubStaff ? currentClubSymbol : null);
    const club = targetSymbol
     ? CLUBS.find(
      (c) =>
      c.symbol.toUpperCase() === targetSymbol.toUpperCase(),
     )
     : null;

    if (club) {
     return (
     <TeamLogo
      symbol={club.symbol}
      name={club.name}
      primaryColor={club.primaryColor}
      secondaryColor={club.secondaryColor}
      size={40}
      className="flex-shrink-0"
     />
     );
    }

    return (
     <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center font-bold text-[#00FF88] text-sm font-mono uppercase overflow-hidden shrink-0">
     {["MANAGER", "ASSISTANT MANAGER", "SPORTING DIRECTOR", "AGENT", "CLUB CAPTAIN"].includes(selectedMsg.sender.toUpperCase()) ? (
      <CharacterPortrait
      type={
       [
       "MANAGER",
       "ASSISTANT MANAGER",
       "SPORTING DIRECTOR",
       ].includes(selectedMsg.sender.toUpperCase())
       ? "manager"
       : selectedMsg.sender.toUpperCase() === "AGENT"
        ? "agent"
        : "teammate"
      }
      name={selectedMsg.sender}
      size={38}
      showBorder={false}
      />
     ) : (
      selectedMsg.sender.slice(0, 2)
     )}
     </div>
    );
    })()}
    <div>
    <div className="text-white text-sm font-bold tracking-widest uppercase font-display">
     {selectedMsg.sender}
    </div>
    <div className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-0.5 font-mono">
     To: {state.player?.lastName || "You"}
    </div>
    </div>
   </div>
   <div className="p-8 pb-12 flex-1 overflow-y-auto">
    <h2 className="text-white text-xl font-bold uppercase tracking-wider mb-6 leading-snug font-display">
    {selectedMsg.subject}
    </h2>
    <div className="w-8 h-1 bg-[#333] mb-6"></div>

    {selectedMsg.socialPost && (
    <div className="glass-panel p-6 rounded-md mb-6 font-mono text-xs">
     <div className="text-[#00FF88] font-bold mb-2">
     {selectedMsg.socialPost.authorHandle}
     </div>
     <div className="text-white text-sm mb-4 leading-relaxed font-sans">
     {selectedMsg.content}
     </div>
     <div className="flex gap-6 text-white/50 font-bold uppercase">
     <span>
      ❤️ {selectedMsg.socialPost.likes.toLocaleString()}
     </span>
     <span>
      🔁 {selectedMsg.socialPost.retweets.toLocaleString()}
     </span>
     </div>
    </div>
    )}

    {!selectedMsg.socialPost && (
     <div className="bg-[#0e0e0e]/50 border border-white/5 rounded-lg p-8 sm:p-10 font-serif relative overflow-hidden shadow-2xl">
      {/* Centered letterhead */}
      <div className="text-center mb-8 pb-6 border-b border-white/10">
       <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/40 mb-2">Official Correspondence</div>
       <div className="text-white text-base font-bold font-sans uppercase tracking-widest">{currentSelectedClub ? currentSelectedClub.name : selectedMsg.sender}</div>
       <div className="text-[9px] font-mono tracking-widest uppercase text-[#00FF88] mt-1">Date: Week {state.currentWeek}, Year {state.season}</div>
      </div>
      
      {/* Properly aligned body text */}
      <div className="text-[#cccccc] text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans font-medium max-w-2xl mx-auto">
       {selectedMsg.content}
      </div>
      
      {/* Sign-off */}
      <div className="mt-12 pt-6 border-t border-white/5 text-right font-sans">
       <div className="text-white/40 text-[10px] uppercase font-mono tracking-widest">Sincerely,</div>
       <div className="text-white text-xs font-bold mt-1 uppercase tracking-wide">{selectedMsg.sender}</div>
      </div>
     </div>
    )}
   </div>

   <div className="mt-auto p-6 border-t border-white/10 flex gap-4 bg-[#0a0a0a]">
    {selectedMsg.choices &&
    selectedMsg.choices.map((choice: any, idx: number) => {
     const text = choice.text.toUpperCase();
     const isAccept = text.includes("ACCEPT") || text.includes("SIGN") || text.includes("AGREE") || text.includes("SUPPORT") || text.includes("ESTABLISH") || text.includes("PUSH") || text.includes("PITCH") || text.includes("NEGOTIATE") || text.includes("RETAIN") || text.includes("YES");
     const isReject = text.includes("REJECT") || text.includes("CANCEL") || text.includes("DISAGREE") || text.includes("IGNORE") || text.includes("PASS") || text.includes("REFUSE") || text.includes("NO");
     
     let btnStyle = "bg-transparent text-white border-white/10 hover:border-white/30";
     if (isAccept) {
      btnStyle = "bg-[#4ade80] text-black border-[#4ade80] hover:bg-[#22c55e] hover:border-[#22c55e]";
     } else if (isReject) {
      btnStyle = "bg-transparent text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500";
     } else if (idx === 0) {
      btnStyle = "bg-[#00FF88] text-black border-[#00FF88] hover:bg-[#00FF88]";
     }
     
     return (
      <button
      key={idx}
      onClick={() => handleAction(choice)}
      className={`flex-1 px-6 py-4 font-black uppercase tracking-widest text-[11px] transition-all duration-300 border font-mono rounded shadow-lg ${btnStyle}`}
      >
      {choice.text}
      </button>
     );
    })}
   </div>
    </>
   )
  ) : (
   <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
   <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-4 text-[#555] text-xl font-mono">
    @
   </div>
   <div className="text-white text-lg font-bold uppercase tracking-widest mb-2 font-display">
    Personal Inbox
   </div>
   <div className="text-[#555555] text-xs uppercase tracking-widest max-w-xs leading-relaxed font-mono font-bold">
    Read emails, sign sponsorship deals, and negotiate incoming
    transfers.
   </div>
   </div>
  )}
  </div>
 </div>
 );
}

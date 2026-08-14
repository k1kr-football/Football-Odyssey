import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { AgentMeetingModal } from '../components/AgentMeetingModal';
import { AgencyStaff } from './AgencyStaff';
import { 
  Briefcase, Award, TrendingUp, Shield, Star, CheckCircle2, 
  DollarSign, Users, PhoneCall, MessageSquare, Sparkles, 
  AlertCircle, ArrowRight, Zap, RefreshCw, Lock
} from 'lucide-react';

interface AgentProfile {
  id: string;
  name: string;
  agency: string;
  tier: 'Rookie' | 'Hungry' | 'Shark' | 'Super Agent' | 'Legend';
  bio: string;
  commission: number; // percentage
  retainer: number; // per week
  upfrontCost: number;
  reqReputation: number;
  skills: {
    transferAttraction: number;
    contractBoost: number;
    mediaProtection: number;
    scoutingSpeed: number;
  };
  quote: string;
}

const AVAILABLE_AGENTS: AgentProfile[] = [
  {
    id: 'rookie',
    name: 'Arthur Pendelton',
    agency: 'Pendelton Family & Associates',
    tier: 'Rookie',
    bio: 'A loyal family friend or local grassroots advisor. Deeply trustworthy, but lacks high-level board room connections.',
    commission: 3.0,
    retainer: 150,
    upfrontCost: 0,
    reqReputation: 0,
    skills: { transferAttraction: 5, contractBoost: 2, mediaProtection: 10, scoutingSpeed: 0 },
    quote: "I've known you since you kicked a tennis ball in the park. We take it one step at a time."
  },
  {
    id: 'hungry',
    name: 'Elena Vance',
    agency: 'Vance Legal & Sports',
    tier: 'Hungry',
    bio: 'Young, aggressive, and meticulous with contract clauses. Excellent at squeezing out every pound of wage and release clauses.',
    commission: 5.0,
    retainer: 500,
    upfrontCost: 2500,
    reqReputation: 25,
    skills: { transferAttraction: 15, contractBoost: 35, mediaProtection: 20, scoutingSpeed: 10 },
    quote: "Clubs always try to underpay young talent. Not on my watch. Every clause is legally ironclad."
  },
  {
    id: 'shark',
    name: 'Marco "The Shark" Rossi',
    agency: 'Rossi Global Management',
    tier: 'Shark',
    bio: 'Ruthless media operator with direct lines to sporting directors across top European leagues. Known for orchestrating big-money transfers.',
    commission: 8.5,
    retainer: 1500,
    upfrontCost: 15000,
    reqReputation: 50,
    skills: { transferAttraction: 50, contractBoost: 30, mediaProtection: 40, scoutingSpeed: 35 },
    quote: "Loyalty is admirable, ambition is profitable. Let's get your talent onto the global stage."
  },
  {
    id: 'super_agent',
    name: 'Sir Jonathan Sterling',
    agency: 'Sterling Star Agency London/Dubai',
    tier: 'Super Agent',
    bio: 'The elite kingmaker. Operates at the pinnacle of world football, managing Ballon d\'Or winners and multi-million pound endorsement portfolios.',
    commission: 10.0,
    retainer: 5000,
    upfrontCost: 50000,
    reqReputation: 75,
    skills: { transferAttraction: 85, contractBoost: 60, mediaProtection: 80, scoutingSpeed: 70 },
    quote: "When I walk into a boardroom, presidents listen. You deserve the absolute apex of the sport."
  },
  {
    id: 'legend',
    name: 'Mino "The Titan" Mendes',
    agency: 'Titanium Sports Empire',
    tier: 'Legend',
    bio: 'An undisputed legendary titan of the transfer window. Commands global headlines and dictates terms to the biggest clubs on earth.',
    commission: 12.0,
    retainer: 12000,
    upfrontCost: 150000,
    reqReputation: 90,
    skills: { transferAttraction: 100, contractBoost: 90, mediaProtection: 95, scoutingSpeed: 100 },
    quote: "Records exist to be broken. Your name will be on the front page and the back page."
  }
];

export function AgentScreen() {
  const { state, setPlayer, setInbox } = useGame();
  const player = state.player;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MARKET' | 'ACTIONS' | 'STAFF'>('OVERVIEW');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  if (!player) return null;

  const currentAgentTier = player.agentTier || 'Rookie';
  const currentAgentName = player.agentName || 'Arthur Pendelton';
  const currentAgentObj = AVAILABLE_AGENTS.find(a => a.tier === currentAgentTier) || AVAILABLE_AGENTS[0];

  const triggerNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleHireAgent = (agent: AgentProfile) => {
    if (player.reputation.world < agent.reqReputation) {
      triggerNotification(`❌ Cannot hire ${agent.name} — Requires World Reputation of ${agent.reqReputation}+ (Current: ${Math.round(player.reputation.world)})`);
      return;
    }

    const currentBalance = player.finances?.balance || 5000;
    if (currentBalance < agent.upfrontCost) {
      triggerNotification(`❌ Insufficient funds! Upfront sign-on fee is £${agent.upfrontCost.toLocaleString()}`);
      return;
    }

    const newBalance = currentBalance - agent.upfrontCost;
    
    setPlayer({
      ...player,
      agentName: agent.name,
      agentTier: agent.tier,
      relationships: {
        ...player.relationships,
        agent: 85
      },
      finances: {
        ...player.finances,
        balance: newBalance
      }
    });

    const newMsg = {
      id: `agent_hire_${Date.now()}`,
      sender: agent.name.toUpperCase(),
      subject: `🤝 NEW REPRESENTATION: Partnership Secured`,
      content: `${agent.name} from ${agent.agency}: "Pleasure doing business with you. My team is ready to elevate your career, maximize your contract terms, and open doors at top clubs. Let's get to work."`,
      read: false,
      timestamp: `${state.currentDay} 10:00`,
      type: 'SPORTING' as const,
      choices: [{ text: 'Let\'s make it happen', type: 'ack' }]
    };

    setInbox([newMsg, ...state.inbox]);
    triggerNotification(`✅ Successfully retained ${agent.name} as your new agent!`);
  };

  const handleActionRequestContract = () => {
    const canDemand = (player.stats?.apps || 0) >= 10 && player.trust >= 70;
    if (!canDemand) {
      triggerNotification(`🔒 LOCKED — Req: 10+ Appearances & 70+ Manager Trust (Current: ${player.stats?.apps || 0} apps, ${player.trust} trust)`);
      return;
    }

    let contractBoost = currentAgentObj.skills.contractBoost;
    if (player.stateFlags?.agentFocus === 'WAGES') {
        contractBoost += 20;
    }

    const wageIncrease = Math.round(player.contract.wage * (0.15 + contractBoost * 0.003));
    const newWage = player.contract.wage + wageIncrease;

    setPlayer({
      ...player,
      contract: {
        ...player.contract,
        wage: newWage
      }
    });

    const newMsg = {
      id: `agent_contract_${Date.now()}`,
      sender: currentAgentName.toUpperCase(),
      subject: `💰 CONTRACT UPGRADE SUCCESSFUL`,
      content: `${currentAgentName}: "I met with the club board this morning. After some stern negotiations regarding your market value, they agreed to increase your weekly wages from £${player.contract.wage.toLocaleString()}/wk to £${newWage.toLocaleString()}/wk!"`,
      read: false,
      timestamp: `${state.currentDay} 14:30`,
      type: 'CONTRACT' as const,
      choices: [{ text: 'Fantastic work', type: 'ack' }]
    };

    setInbox([newMsg, ...state.inbox]);
    triggerNotification(`🎉 Contract upgraded! Weekly wages raised to £${newWage.toLocaleString()}`);
  };

  const handleActionSoundOutClubs = () => {
    if (currentAgentTier === 'Rookie') {
      triggerNotification(`🔒 Rookie agents lack the network to sound out clubs. Upgrade your representation first!`);
      return;
    }

    const attraction = currentAgentObj.skills.transferAttraction;
    triggerNotification(`🔍 ${currentAgentName} is quietly sounding out clubs across the division. Expect incoming transfer interest soon!`);

    const newMsg = {
      id: `agent_sound_${Date.now()}`,
      sender: currentAgentName.toUpperCase(),
      subject: `🌐 TRANSFER MARKET INTEL: Clubs Gauging Interest`,
      content: `${currentAgentName}: "I've had discreet inquiries from several clubs looking for reinforcements in your position. With our current market pull (${attraction}% rating), we should see formal approaches when the transfer window opens."`,
      read: false,
      timestamp: `${state.currentDay} 16:00`,
      type: 'TRANSFER' as const,
      choices: [{ text: 'Keep me informed', type: 'ack' }]
    };

    setInbox([newMsg, ...state.inbox]);
  };

  const handleActionPRShield = () => {
    let boost = 15;
    if (player.stateFlags?.agentFocus === 'PR_HYPE') {
        boost += 10;
    } else if (player.stateFlags?.agentFocus === 'FOOTBALL') {
        boost -= 5;
    }
    const newMedia = Math.min(100, player.mediaPerception + boost);
    setPlayer({
      ...player,
      mediaPerception: newMedia
    });
    triggerNotification(`🛡️ Media campaign active! Public perception improved by +${boost}.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white overflow-hidden p-6 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#222] shrink-0 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#00FF88] text-xs font-bold uppercase tracking-widest mb-1">
            <Briefcase size={16} />
            <span>Representation & Agency Management</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">Your Agent & Career Office</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-[#141414] p-1 border border-[#222] ">
          {[
            { id: 'OVERVIEW', label: 'Current Agent' },
            { id: 'MARKET', label: 'Agency Market' },
            { id: 'ACTIONS', label: 'Agent Services' },
            { id: 'STAFF', label: 'Private Staff' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#00FF88] text-black shadow-[#00FF88]/20' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Notification Banner */}
      {feedbackMessage && (
        <div className="mt-4 bg-[#112217] border border-[#00FF88]/40 text-[#00FF88] px-4 py-3 text-xs font-mono animate-fadeIn flex items-center gap-3 shrink-0">
          <Sparkles size={18} className="shrink-0 animate-pulse" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto mt-6 pr-2 no-scrollbar">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Agent Card */}
            <div className="lg:col-span-2 bg-[#050505] border border-[#222] p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF88]/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/5 border border-[#222] flex items-center justify-center text-[#00FF88] shadow-inner">
                      <Briefcase size={32} />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Retained Representative</div>
                      <h2 className="text-xl font-black uppercase text-white tracking-wide">{currentAgentName}</h2>
                      <p className="text-xs text-[#00FF88] font-mono mt-0.5">{currentAgentObj.agency}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-xs font-black uppercase tracking-widest rounded-full">
                    {currentAgentTier} Tier
                  </span>
                </div>

                <p className="text-sm text-white/80 font-sans italic bg-black/40 p-4 border border-[#111] mb-6">
                  "{currentAgentObj.quote}"
                </p>

                <p className="text-xs text-white/60 leading-relaxed font-sans mb-8">
                  {currentAgentObj.bio}
                </p>

                {/* Agent Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-black/40 p-4 border border-[#222]">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">Commission</span>
                    <span className="text-lg font-black text-white">{currentAgentObj.commission}%</span>
                  </div>
                  <div className="bg-black/40 p-4 border border-[#222]">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">Weekly Retainer</span>
                    <span className="text-lg font-black text-white">£{currentAgentObj.retainer.toLocaleString()}</span>
                  </div>
                  <div className="bg-black/40 p-4 border border-[#222]">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">Relationship</span>
                    <span className="text-lg font-black text-[#00FF88]">{Math.round(player.relationships?.agent || 80)}/100</span>
                  </div>
                  <div className="bg-black/40 p-4 border border-[#222]">
                    <span className="text-[10px] text-white/40 uppercase block mb-1">Transfer Pull</span>
                    <span className="text-lg font-black text-cyan-400">+{currentAgentObj.skills.transferAttraction}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#222] flex items-center justify-between">
                <span className="text-xs text-white/40">Active Representation Agreement</span>
                <button
                  onClick={() => setActiveTab('MARKET')}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all border border-[#222] flex items-center gap-2"
                >
                  <span>Switch Agency</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Col: Quick Tips & Summary */}
            <div className="bg-[#050505] border border-[#222] p-6 flex flex-col justify-between ">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                  <Star size={16} className="text-[#00FF88]" />
                  <span>Agent Skill Matrix</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60">Transfer Attraction</span>
                      <span className="text-white font-bold">{currentAgentObj.skills.transferAttraction}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#00FF88] h-full" style={{ width: `${currentAgentObj.skills.transferAttraction}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60">Contract Boost</span>
                      <span className="text-white font-bold">{currentAgentObj.skills.contractBoost}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full" style={{ width: `${currentAgentObj.skills.contractBoost}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60">Media Protection</span>
                      <span className="text-white font-bold">{currentAgentObj.skills.mediaProtection}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: `${currentAgentObj.skills.mediaProtection}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[#181818] p-4 border border-[#222]">
                <span className="text-[10px] text-[#00FF88] font-bold uppercase tracking-wider block mb-1">💡 Pro Career Tip</span>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Upgrading your agent as your world reputation grows is crucial for accessing elite clubs in the Premier League, La Liga, and Champions League.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'MARKET' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_AGENTS.map((agent) => {
              const isCurrent = agent.tier === currentAgentTier;
              const meetsRep = player.reputation.world >= agent.reqReputation;
              const hasFunds = (player.finances?.balance || 5000) >= agent.upfrontCost;

              return (
                <div 
                  key={agent.id}
                  className={`bg-[#050505] border p-6 flex flex-col justify-between transition-all duration-200 ${
                    isCurrent ? 'border-[#00FF88] shadow-[#00FF88]/10 bg-[#121c16]' : 'border-[#222] hover:border-white/30'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                        agent.tier === 'Legend' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                        agent.tier === 'Super Agent' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        agent.tier === 'Shark' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                        agent.tier === 'Hungry' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-white/5 text-white/50 border-[#222]'
                      }`}>
                        {agent.tier}
                      </span>
                      <span className="text-xs font-mono text-white/50 font-bold">Req: {agent.reqReputation} Rep</span>
                    </div>

                    <h3 className="text-lg font-bold uppercase text-white mb-1">{agent.name}</h3>
                    <p className="text-xs text-[#00FF88] font-mono mb-3">{agent.agency}</p>
                    <p className="text-xs text-white/60 leading-relaxed font-sans mb-4 line-clamp-3">{agent.bio}</p>

                    <div className="space-y-2 mb-6 font-mono text-xs bg-black/40 p-3.5 border border-[#111]">
                      <div className="flex justify-between">
                        <span className="text-white/40">Upfront Fee:</span>
                        <span className="text-white font-bold">£{agent.upfrontCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Weekly Retainer:</span>
                        <span className="text-white font-bold">£{agent.retainer.toLocaleString()}/wk</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Transfer Pull:</span>
                        <span className="text-[#00FF88] font-bold">+{agent.skills.transferAttraction}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <div className="w-full py-3 bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-xs font-black uppercase tracking-widest text-center">
                        Active Representation
                      </div>
                    ) : (
                      <button
                        onClick={() => handleHireAgent(agent)}
                        disabled={!meetsRep || !hasFunds}
                        className={`w-full py-3 text-xs font-black uppercase tracking-widest transition-all ${
                          !meetsRep || !hasFunds
                            ? 'bg-white/5 text-white/30 border border-[#111] cursor-not-allowed'
                            : 'bg-[#00FF88] text-black hover:bg-white'
                        }`}
                      >
                        {!meetsRep ? 'Reputation Too Low' : !hasFunds ? 'Insufficient Funds' : 'Retain Agent'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'ACTIONS' && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Action 1: Demand Contract Upgrade */}
            <div className="bg-[#050505] border border-[#222] p-6 flex flex-col justify-between ">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20">
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase text-white">Demand Contract Upgrade</h3>
                    <p className="text-xs text-white/50 font-mono mt-0.5">Instruct agent to renegotiate your salary</p>
                  </div>
                </div>

                <p className="text-xs text-white/70 font-sans leading-relaxed mb-6">
                  Your agent will approach the club board to negotiate an improved wage package based on recent performances and contract terms.
                </p>

                <div className="bg-black/40 p-4 border border-[#222] mb-6 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50">Requirement:</span>
                    <span className="text-white font-bold">10+ Appearances & 70+ Trust</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Current Status:</span>
                    <span className={((player.stats?.apps || 0) >= 10 && player.trust >= 70) ? 'text-[#00FF88] font-bold' : 'text-amber-400 font-bold'}>
                      {player.stats?.apps || 0} Apps | {player.trust} Trust
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleActionRequestContract}
                className="w-full py-3 bg-[#00FF88] text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-all "
              >
                Launch Contract Talks
              </button>
            </div>

            {/* Action 2: Sound Out Transfer Market */}
            <div className="bg-[#050505] border border-[#222] p-6 flex flex-col justify-between ">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase text-white">Sound Out Transfer Market</h3>
                    <p className="text-xs text-white/50 font-mono mt-0.5">Gauge discreet interest from rival clubs</p>
                  </div>
                </div>

                <p className="text-xs text-white/70 font-sans leading-relaxed mb-6">
                  Leverage your agent's network to sound out sporting directors across the league before the transfer window officially opens.
                </p>

                <div className="bg-black/40 p-4 border border-[#222] mb-6 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50">Requirement:</span>
                    <span className="text-white font-bold">Hungry Agent Tier or Higher</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Agent Bonus:</span>
                    <span className="text-cyan-400 font-bold">+{currentAgentObj.skills.transferAttraction}% Pull</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleActionSoundOutClubs}
                className="w-full py-3 bg-cyan-500 text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-all "
              >
                Initiate Market Probe
              </button>
            </div>

            {/* Action 3: PR & Media Shielding */}
            <div className="bg-[#050505] border border-[#222] p-6 flex flex-col justify-between ">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase text-white">PR & Media Shielding</h3>
                    <p className="text-xs text-white/50 font-mono mt-0.5">Spin press narratives and clean public image</p>
                  </div>
                </div>

                <p className="text-xs text-white/70 font-sans leading-relaxed mb-6">
                  Deploy your agent's PR team to manage tabloid rumors, smooth over press conference slip-ups, and boost public standing.
                </p>

                <div className="bg-black/40 p-4 border border-[#222] mb-6 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50">Effect:</span>
                    <span className="text-amber-400 font-bold">+15 Media Perception</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Current Perception:</span>
                    <span className="text-white font-bold">{Math.round(player.mediaPerception)} / 100</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleActionPRShield}
                className="w-full py-3 bg-amber-500 text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-all "
              >
                Execute PR Campaign
              </button>
            </div>

            {/* Action 4: Endorsement / Sponsorship Pitch */}
            <div className="bg-[#050505] border border-[#222] p-6 flex flex-col justify-between ">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase text-white">Brand Endorsement Pitch</h3>
                    <p className="text-xs text-white/50 font-mono mt-0.5">Secure lucrative sponsorship deals</p>
                  </div>
                </div>

                <p className="text-xs text-white/70 font-sans leading-relaxed mb-6">
                  Your agent scouts boot manufacturers and lifestyle brands eager to sign rising football talents for commercial campaigns.
                </p>

                <div className="bg-black/40 p-4 border border-[#222] mb-6 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50">Requirement:</span>
                    <span className="text-white font-bold">World Rep 30+ & Active Agent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Reward:</span>
                    <span className="text-purple-400 font-bold">Financial Bonus & Fans Boost</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (player.reputation.world < 30) {
                    triggerNotification(`🔒 Req: World Reputation 30+ to attract major brand sponsors.`);
                    return;
                  }
                  const bonus = 10000;
                  setPlayer({
                    ...player,
                    finances: {
                      ...player.finances,
                      balance: (player.finances?.balance || 5000) + bonus
                    }
                  });
                  triggerNotification(`💼 Sponsorship secured! £10,000 added to your personal finances.`);
                }}
                className="w-full py-3 bg-purple-500 text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-all "
              >
                Secure Brand Deal (£10k)
              </button>
            </div>
          </div>
            
            {/* Action 3: Schedule Agent Meeting */}
            <div className="bg-[#050505] border border-[#222] p-6 flex flex-col justify-between md:col-span-2">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase text-white">Strategic Agent Meeting</h3>
                    <p className="text-xs text-white/50 font-mono mt-0.5">Discuss career ambitions, PR strategy, and demands</p>
                  </div>
                </div>
                
                <p className="text-xs text-white/70 font-sans leading-relaxed mb-6">
                  Sit down with your representative to define your roadmap. Aligning your goals helps your agent make the right moves behind the scenes for transfers, contracts, and public perception.
                </p>
              </div>

              <button
                onClick={() => setIsMeetingModalOpen(true)}
                className="w-full py-3 bg-blue-500 text-white hover:bg-blue-400 text-xs font-black uppercase tracking-wider transition-all "
              >
                Schedule Meeting
              </button>
            </div>
          </>
        )}
        {activeTab === 'STAFF' && (
          <AgencyStaff />
        )}
      </div>
      <AgentMeetingModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} />
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { useGame } from "../store/GameContext";
import {
  Mail,
  User,
  ShieldAlert,
  Flame,
  Globe,
  Clock,
  Briefcase,
  Stethoscope,
  Users,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { CLUBS } from "../data/teams";
import { resolveSenderIdentity } from "../utils/clubStaff";
import { RealWorldNewsWidget } from "../components/RealWorldNewsWidget";
import { isDecisionRequired, processInboxMessages } from "../utils/notifications";

export function Inbox() {
  const { state, setScreen, setInbox, setPlayer } = useGame();
  const [category, setCategory] = useState<string>("ALL");
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [verbosity, setVerbosity] = useState<"ALL" | "IMPORTANT_AND_CRITICAL" | "CRITICAL_ONLY">("ALL");
  const [digestEnabled, setDigestEnabled] = useState(true);

  // Interactive Negotiation States
  const [negotiationPhase, setNegotiationPhase] = useState<"NONE" | "NEGOTIATE" | "SUCCESS" | "COLLAPSED">("NONE");
  const [negotiatingMsg, setNegotiatingMsg] = useState<any | null>(null);
  const [proposedWage, setProposedWage] = useState(0);

  const rawInbox = state.inbox || [];
  const messages = useMemo(() => {
    return processInboxMessages(rawInbox, verbosity, digestEnabled);
  }, [rawInbox, verbosity, digestEnabled]);

  // Filter messages based on category
  const filteredMessages = messages.filter((m) => {
    const sender = m.sender?.toUpperCase() || "";
    if (sender.includes("TEAMMATE") || sender.includes("CAPTAIN") || sender.includes("PROSPECT")) return false;
    if (category === "ALL") return true;
    if (category === "STAFF") return ["MANAGER", "ASSISTANT MANAGER", "SPORTING DIRECTOR", "HEAD SCOUT"].includes(m.sender?.toUpperCase());
    if (category === "AGENT") return m.sender?.toUpperCase().includes("AGENT");
    if (category === "TEAM") return ["CAPTAIN", "TEAMMATE", "SQUAD"].includes(m.sender?.toUpperCase()) || m.type === "TRANSFER";
    if (category === "MEDICAL") return ["PHYSIO", "DOCTOR", "MEDICAL"].includes(m.sender?.toUpperCase()) || m.sender?.toUpperCase().includes("HEAD PHYSIO");
    if (category === "SOCIAL") return m.type === "SOCIAL" || m.type === "RUMOR";
    return true;
  });

  const selectedMsg = messages.find((m) => m.id === selectedMsgId) || filteredMessages[0] || null;

  // Handle choice actions (e.g., contract negotiation, quest accept, options)
  const handleAction = (choice: any) => {
    if (!selectedMsg) return;

    if (choice.type === "negotiate_contract" || choice.type === "contract_offer") {
      setNegotiatingMsg(selectedMsg);
      const currentWage = state.player?.contract?.wage || 500;
      setProposedWage(choice.wage || Math.round(currentWage * 1.2));
      setNegotiationPhase("NEGOTIATE");
      return;
    }

    if (choice.type === "digest_mark_all_read") {
      const updated = messages.map((m) => ({ ...m, read: true }));
      setInbox(updated);
      return;
    }

    // Standard choice handling
    const updated = messages.map((m) => {
      if (m.id === selectedMsg.id) {
        return { ...m, read: true, handled: true, actionTaken: choice.text };
      }
      return m;
    });

    setInbox(updated);

    // Apply stats bonuses if any
    if (choice.bonus && state.player) {
      const currentTrust = state.player.trust || 50;
      setPlayer({
        ...state.player,
        trust: Math.min(100, currentTrust + 2)
      });
    }
  };

  const categories = [
    { id: "ALL", label: "All Messages", icon: Mail, color: "text-[#00FF88]" },
    { id: "STAFF", label: "Club Management", icon: Users, color: "text-blue-400" },
    { id: "AGENT", label: "Agent & Reps", icon: Briefcase, color: "text-amber-400" },
    
    { id: "MEDICAL", label: "Medical & Rehab", icon: Stethoscope, color: "text-red-400" },
    { id: "SOCIAL", label: "Media & Rumors", icon: MessageSquare, color: "text-purple-400" },
    { id: "WORLD MEDIA", label: "World Press Wire", icon: Globe, color: "text-teal-400", badge: "LIVE" }
  ];

  return (
    <div className="flex h-full gap-6 select-none font-sans relative">
      {/* Contract Negotiation Overlay */}
      {negotiationPhase !== "NONE" && negotiatingMsg && (
        <div className="absolute inset-0 z-50 bg-[#0c0d0d] flex flex-col p-8 font-sans animate-fade-in overflow-y-auto">
          <div className="max-w-2xl w-full mx-auto glass-panel p-8 rounded-xl border border-emerald-500/30 my-auto shadow-2xl">
            <h2 className="text-xl font-black uppercase text-white font-display mb-2 flex items-center gap-3">
              <Briefcase className="text-emerald-400" size={24} />
              Contract Offer Negotiations
            </h2>
            <p className="text-xs text-white/60 mb-6 font-mono">
              Representative talks for {state.player?.firstName} {state.player?.lastName} at {CLUBS.find((c) => c.symbol === state.player?.currentClubSymbol)?.name || "Current Club"}.
            </p>

            {negotiationPhase === "NEGOTIATE" && (
              <div className="space-y-6">
                <div className="bg-[#141414] p-5 rounded-lg border border-white/10 space-y-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white/50">Current Weekly Wage:</span>
                    <span className="text-white font-bold">£{(state.player?.contract?.wage || 500).toLocaleString()}/wk</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white/50">Proposed Weekly Wage:</span>
                    <span className="text-emerald-400 font-bold">£{proposedWage.toLocaleString()}/wk</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/70 font-mono block mb-2">Adjust Weekly Counter-Offer (£):</label>
                  <input
                    type="range"
                    min={(state.player?.contract?.wage || 500) * 0.8}
                    max={(state.player?.contract?.wage || 500) * 2.5}
                    step={250}
                    value={proposedWage}
                    onChange={(e) => setProposedWage(Number(e.target.value))}
                    className="w-full accent-[#00FF88]"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setNegotiationPhase("SUCCESS");
                      if (state.player && state.player.contract) {
                        setPlayer({
                          ...state.player,
                          contract: { ...state.player.contract, wage: proposedWage }
                        });
                      }
                    }}
                    className="flex-1 bg-[#00FF88] text-black font-black uppercase tracking-widest py-3 text-xs rounded font-mono hover:bg-[#00FF88]/90"
                  >
                    Accept Contract Terms
                  </button>
                  <button
                    onClick={() => setNegotiationPhase("NONE")}
                    className="px-6 bg-white/10 text-white font-bold uppercase tracking-widest py-3 text-xs rounded font-mono hover:bg-white/20"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            {negotiationPhase === "SUCCESS" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl border border-emerald-500/30">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-white uppercase font-display">New Deal Signed!</h3>
                <p className="text-xs text-white/60 font-mono max-w-md mx-auto">
                  Terms agreed at £{proposedWage.toLocaleString()}/week. Your financial backing and club status have increased.
                </p>
                <button
                  onClick={() => setNegotiationPhase("NONE")}
                  className="bg-[#00FF88] text-black font-black uppercase tracking-widest px-8 py-3 text-xs rounded font-mono"
                >
                  Return to Inbox
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Left Sidebar Category Navigation */}
      <div className="w-64 premium-card flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-white text-xs font-black uppercase tracking-widest font-display flex items-center gap-2">
            <Mail size={16} className="text-[#00FF88]" />
            Inbox Dispatch
          </h2>
        </div>

        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            const count = messages.filter((m) => {
              if (cat.id === "ALL") return !m.read;
              if (cat.id === "STAFF") return ["MANAGER", "ASSISTANT MANAGER", "SPORTING DIRECTOR"].includes(m.sender?.toUpperCase()) && !m.read;
              if (cat.id === "AGENT") return m.sender?.toUpperCase().includes("AGENT") && !m.read;
                            if (cat.id === "MEDICAL") return ["PHYSIO", "DOCTOR"].includes(m.sender?.toUpperCase()) && !m.read;
              if (cat.id === "SOCIAL") return (m.type === "SOCIAL" || m.type === "RUMOR") && !m.read;
              return false;
            }).length;

            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                  isSelected ? "bg-white/10 text-white font-bold border border-white/10 shadow" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={cat.color} />
                  <span>{cat.label}</span>
                </div>
                {cat.badge ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-500/20 text-teal-400 border border-teal-500/30 animate-pulse">
                    {cat.badge}
                  </span>
                ) : count > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00FF88] text-black">
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Verbosity Selector & Digest Mode */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0a] space-y-3">
          <div>
            <label className="text-[10px] text-white/50 uppercase font-mono font-bold block mb-1">Feed Filter</label>
            <select
              value={verbosity}
              onChange={(e) => setVerbosity(e.target.value as any)}
              className="w-full bg-[#141414] border border-[#2f2f2f] text-white text-[10px] font-mono rounded px-2.5 py-2 focus:border-[#00FF88] focus:outline-none"
            >
              <option value="ALL">Show All Messages</option>
              <option value="IMPORTANT_AND_CRITICAL">Hide Ambient News</option>
              <option value="CRITICAL_ONLY">Critical Alerts Only</option>
            </select>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-white/50 uppercase font-mono font-bold">Digest Mode</span>
            <button
              onClick={() => setDigestEnabled(!digestEnabled)}
              className={`px-2.5 py-1 rounded text-[9px] font-mono font-black uppercase transition-all ${
                digestEnabled 
                  ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40' 
                  : 'bg-white/10 text-white/50 border border-white/10'
              }`}
            >
              {digestEnabled ? 'Enabled (ON)' : 'Disabled (OFF)'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {category === "WORLD MEDIA" ? (
        <div className="flex-1 overflow-y-auto">
          <RealWorldNewsWidget />
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Middle Column: Messages List */}
          <div className="w-1/3 premium-card flex flex-col">
            <div className="p-4 border-b border-white/10 text-white/50 text-[10px] font-mono tracking-widest uppercase flex justify-between font-bold bg-[#151515]">
              <span>{category} MESSAGES</span>
              <span className="text-[#00FF88] font-mono">
                {filteredMessages.filter((m) => !m.read).length} Unread
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs font-mono uppercase tracking-wider">
                  No messages found in this stream.
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = selectedMsg?.id === msg.id;
                  const isMandatory = isDecisionRequired(msg) && !msg.handled;

                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMsgId(msg.id)}
                      className={`p-4 cursor-pointer transition-colors relative ${
                        isSelected ? "bg-white/10 border-l-2 border-[#00FF88]" : "hover:bg-white/5"
                      } ${!msg.read ? "bg-white/[0.02]" : ""}`}
                    >
                      <div className="flex justify-between items-center mb-1.5 gap-3">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#00FF88] truncate flex-1 min-w-0">
                          {resolveSenderIdentity(state, msg.sender, msg.id)}
                        </span>
                        <span className="text-[9px] font-mono text-white/40 shrink-0">{msg.timestamp}</span>
                      </div>

                      <h4 className={`text-xs font-bold font-sans truncate mb-1 ${!msg.read ? "text-white font-black" : "text-white/70"}`}>
                        {msg.subject}
                      </h4>

                      <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed overflow-hidden text-ellipsis">
                        {msg.content}
                      </p>

                      {isMandatory && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-950/60 border border-red-500/40 text-red-300 text-[9px] font-mono font-bold uppercase rounded">
                          <ShieldAlert size={10} /> Action Required
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Message Detail View */}
          <div className="flex-1 premium-card flex flex-col relative">
            {selectedMsg ? (
              <div className="flex-1 flex flex-col h-full bg-[#0d0e0e] relative overflow-hidden">
                {/* Detail Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                  <div>
                    <span className="text-[10px] font-mono text-[#00FF88] font-bold uppercase tracking-widest block">
                      {resolveSenderIdentity(state, selectedMsg.sender, selectedMsg.id)}
                    </span>
                    <h2 className="text-base font-bold text-white uppercase font-display mt-0.5">
                      {selectedMsg.subject}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-white/40">{selectedMsg.timestamp}</span>
                </div>

                {/* Detail Content Body */}
                <div className="p-8 flex-1 overflow-y-auto space-y-6">
                  <div className="bg-[#141414] border border-white/5 p-6 rounded-lg font-sans text-sm text-white/80 leading-relaxed whitespace-pre-line">
                    {selectedMsg.content}
                  </div>

                  {/* Social Media Post Attachment */}
                  {selectedMsg.socialPost && (
                    <div className="glass-panel p-5 rounded-lg border border-purple-500/20 font-mono text-xs space-y-2">
                      <div className="text-purple-400 font-bold">{selectedMsg.socialPost.authorHandle}</div>
                      <p className="text-white text-xs">{selectedMsg.content}</p>
                      <div className="flex gap-6 text-white/40 text-[10px] font-mono pt-2 border-t border-white/5">
                        <span>❤️ {selectedMsg.socialPost.likes.toLocaleString()} Likes</span>
                        <span>🔁 {selectedMsg.socialPost.retweets.toLocaleString()} Retweets</span>
                      </div>
                    </div>
                  )}

                  {/* Action Choices */}
                  {selectedMsg.choices && selectedMsg.choices.length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <span className="text-[10px] font-mono text-white/50 uppercase font-bold tracking-widest block">
                        Response Options
                      </span>
                      <div className="flex flex-col sm:flex-row gap-3">
                        {selectedMsg.choices.map((choice, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAction(choice)}
                            className="flex-1 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black px-6 py-3.5 font-black uppercase text-xs tracking-wider rounded font-mono transition-all shadow-lg"
                          >
                            {choice.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Mail size={48} className="text-white/20 mb-4" />
                <h3 className="text-white text-sm font-bold uppercase tracking-widest font-display mb-1">
                  No Message Selected
                </h3>
                <p className="text-white/40 text-xs font-mono max-w-xs">
                  Select a message from the dispatch feed on the left to review player correspondence.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

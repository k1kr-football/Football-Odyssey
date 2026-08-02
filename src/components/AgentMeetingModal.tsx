import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import {
  canRequestAgentMeeting,
  processAgentMeeting,
  AGENT_MEETING_OPTIONS,
  AgentMeetingTopic,
  AgentMeetingResult
} from '../utils/agentMeeting';
import { X, MessageSquare, Briefcase, TrendingUp, TrendingDown, Lock, CheckCircle2, DollarSign, Users } from 'lucide-react';

interface AgentMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentMeetingModal: React.FC<AgentMeetingModalProps> = ({ isOpen, onClose }) => {
  const { state, setPlayer } = useGame();
  const player = state.player;
  
  const [selectedTopic, setSelectedTopic] = useState<AgentMeetingTopic>('TRANSFER_AMBITION');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('PUSH_FOR_MOVE');
  const [result, setResult] = useState<AgentMeetingResult | null>(null);

  if (!isOpen || !player) return null;

  const currentAgentName = player.agentName || 'Arthur Pendelton';
  const agentTrust = player.relationships?.agent || 50;

  const cooldown = canRequestAgentMeeting(state);

  const optionsForTopic = AGENT_MEETING_OPTIONS.filter(o => o.topic === selectedTopic);

  const handleTopicChange = (topic: AgentMeetingTopic) => {
    setSelectedTopic(topic);
    const firstForTopic = AGENT_MEETING_OPTIONS.find(o => o.topic === topic);
    if (firstForTopic) setSelectedOptionId(firstForTopic.id);
  };

  const handleStartMeeting = () => {
    if (!cooldown.allowed) return;
    const res = processAgentMeeting(state, selectedOptionId);
    if (res.updatedState.player) setPlayer(res.updatedState.player);
    setResult(res);
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-widest text-sm">Meeting with Agent</h2>
              <p className="text-white/50 text-[10px] uppercase font-mono tracking-wider">{currentAgentName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-white/50 hover:text-white transition-colors bg-white/5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {!cooldown.allowed && !result ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-4">
              <Lock size={24} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Agent is Busy</h3>
            <p className="text-white/50 text-sm max-w-md mx-auto font-mono">
              You recently held a strategy meeting with your agent. Let them work on the current plan for {cooldown.remainingWeeks} more {cooldown.remainingWeeks === 1 ? 'week' : 'weeks'} before changing direction.
            </p>
            <button 
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-bold uppercase tracking-wider text-xs transition-colors"
            >
              Close
            </button>
          </div>
        ) : result ? (
          <div className="p-8 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-6">
                <div className="bg-[#111] border border-white/10 p-5 rounded-xl relative">
                  <div className="absolute -top-3 -left-3 bg-blue-500 text-white text-[10px] font-black px-2 py-1 uppercase rounded tracking-widest">
                    Agent's Response
                  </div>
                  <p className="text-white/90 italic font-medium leading-relaxed font-serif text-lg">
                    {result.agentDialog}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest font-mono">Meeting Summary</h4>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm text-white/80">
                    {result.summary}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <p className="text-white/40 text-[9px] uppercase tracking-wider font-mono">Agent Relationship</p>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">{(player.relationships?.agent || 50).toFixed(0)}</span>
                        {result.relationshipChange > 0 && <span className="text-emerald-400 text-xs flex items-center"><TrendingUp size={12} className="mr-0.5" />+{result.relationshipChange}</span>}
                        {result.relationshipChange < 0 && <span className="text-red-400 text-xs flex items-center"><TrendingDown size={12} className="mr-0.5" />{result.relationshipChange}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleClose}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl text-xs transition-colors shadow-lg shadow-blue-500/20"
                >
                  Conclude Meeting
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-full max-h-[70vh]">
            {/* Sidebar Topics */}
            <div className="w-full md:w-48 bg-[#111] border-r border-white/10 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
              <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest font-mono mb-2 px-2">Discussion Topics</h3>
              
              <button 
                onClick={() => handleTopicChange('TRANSFER_AMBITION')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors text-left ${selectedTopic === 'TRANSFER_AMBITION' ? 'bg-blue-500 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                <Users size={14} className={selectedTopic === 'TRANSFER_AMBITION' ? 'text-white' : 'text-blue-400'} />
                Transfers
              </button>
              
              <button 
                onClick={() => handleTopicChange('CONTRACT_DEMANDS')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors text-left ${selectedTopic === 'CONTRACT_DEMANDS' ? 'bg-blue-500 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                <DollarSign size={14} className={selectedTopic === 'CONTRACT_DEMANDS' ? 'text-white' : 'text-emerald-400'} />
                Contracts
              </button>
              
              <button 
                onClick={() => handleTopicChange('PR_STRATEGY')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors text-left ${selectedTopic === 'PR_STRATEGY' ? 'bg-blue-500 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                <MessageSquare size={14} className={selectedTopic === 'PR_STRATEGY' ? 'text-white' : 'text-amber-400'} />
                PR & Media
              </button>
            </div>

            {/* Options */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#0a0a0a]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedTopic.replace('_', ' ')}</h3>
                  <p className="text-white/50 text-xs font-mono mt-1">Select your approach for this meeting</p>
                </div>
              </div>

              <div className="space-y-3">
                {optionsForTopic.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedOptionId === opt.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`font-bold text-sm ${selectedOptionId === opt.id ? 'text-blue-400' : 'text-white'}`}>
                        {opt.title}
                      </h4>
                      {selectedOptionId === opt.id && <CheckCircle2 size={16} className="text-blue-400" />}
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed font-sans pr-8">{opt.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <button 
                  onClick={handleStartMeeting}
                  disabled={!selectedOptionId}
                  className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                    selectedOptionId 
                      ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20' 
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  Start Meeting
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

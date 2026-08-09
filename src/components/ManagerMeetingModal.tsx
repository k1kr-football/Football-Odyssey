import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import {
  canRequestManagerMeeting,
  processManagerMeeting,
  MEETING_OPTIONS,
  MeetingTopic,
  MeetingResult
} from '../utils/playerAgency';
import { X, MessageSquare, ShieldAlert, Award, TrendingUp, TrendingDown, Lock, CheckCircle2 } from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';

interface ManagerMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManagerMeetingModal: React.FC<ManagerMeetingModalProps> = ({ isOpen, onClose }) => {
  const { state, setPlayer } = useGame();
  const player = state.player;

  const [selectedTopic, setSelectedTopic] = useState<MeetingTopic>('PLAYING_TIME');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('EXPRESS_FRUSTRATION');
  const [result, setResult] = useState<MeetingResult | null>(null);

  if (!isOpen || !player) return null;

  const currentClubSymbol = player.currentClubSymbol;
  const worldClub = state.worldState?.clubs?.[currentClubSymbol];
  const managerName = worldClub?.manager?.name || player.managerInfo?.name || "The Gaffer";
  const archetype = worldClub?.manager?.archetype || 'PRAGMATIST';
  const philosophy = worldClub?.manager?.philosophy || 'TACTICAL_RIGID';
  const managerTrust = player.trust || 50;

  const cooldown = canRequestManagerMeeting(state);

  const optionsForTopic = MEETING_OPTIONS.filter(o => o.topic === selectedTopic);

  const handleTopicChange = (topic: MeetingTopic) => {
    setSelectedTopic(topic);
    const firstOption = MEETING_OPTIONS.find(o => o.topic === topic);
    if (firstOption) {
      setSelectedOptionId(firstOption.id);
    }
  };

  const handleExecuteMeeting = () => {
    const res = processManagerMeeting(state, selectedOptionId);
    setResult(res);
    if (res.updatedState.player) {
      setPlayer(res.updatedState.player);
    }
  };

  const archetypeColors: Record<string, string> = {
    LOYALIST: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    PRAGMATIST: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    PROJECT_BUILDER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    VOLATILE: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  const archetypeLabels: Record<string, string> = {
    LOYALIST: 'Loyalist Manager',
    PRAGMATIST: 'Ruthless Pragmatist',
    PROJECT_BUILDER: 'Project Builder',
    VOLATILE: 'Volatile Manager'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#121620] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-none overflow-y-auto shadow-2xl text-white flex flex-col mt-auto sm:my-auto animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <CharacterPortrait type="manager" size={54} name={managerName} className="rounded-xl border border-white/20 shadow-md" />
              <div className="absolute -bottom-1 -right-1 bg-[#00FF88] p-1 rounded-full text-black">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-display tracking-wide">{managerName}</h2>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border uppercase ${archetypeColors[archetype] || 'bg-gray-500/20 text-gray-300'}`}>
                  {archetypeLabels[archetype] || archetype}
                </span>
              </div>
              <p className="text-white/60 text-xs mt-1">
                Tactical Philosophy: <span className="text-amber-400 font-semibold uppercase">{philosophy.replace('_', ' ')}</span> &middot; Manager Trust: <span className="text-[#00FF88] font-bold">{managerTrust}%</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {result ? (
            /* Outcome View */
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <CharacterPortrait type="manager" size={44} name={managerName} className="rounded-lg" />
                  <div>
                    <h3 className="font-bold text-base text-white">{managerName}'s Direct Response</h3>
                    <p className="text-xs text-white/50">{archetypeLabels[archetype]} &middot; Head Coach</p>
                  </div>
                </div>

                <blockquote className="text-lg italic font-serif text-amber-200/90 leading-relaxed border-l-4 border-amber-400 pl-4 my-2">
                  {result.managerDialog}
                </blockquote>

                {/* Consequences */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className={`p-3 rounded-lg border flex items-center justify-between ${result.trustChange >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                    <div className="flex items-center gap-2">
                      {result.trustChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-xs font-bold uppercase">Manager Trust</span>
                    </div>
                    <span className="font-extrabold text-sm">{result.trustChange >= 0 ? `+${result.trustChange}%` : `${result.trustChange}%`}</span>
                  </div>

                  {result.reputationTagAdded ? (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">New Tag Earned</div>
                        <div className="text-xs font-black">{result.reputationTagAdded}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white/70 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />
                      <span className="text-xs font-medium">Logged in Decision Memory</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-[#00FF88] text-black font-extrabold rounded-xl uppercase tracking-wider hover:bg-[#00FF88]/90 transition-all shadow-lg"
              >
                Conclude Meeting
              </button>
            </div>
          ) : !cooldown.allowed ? (
            /* Cooldown View */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Manager Office Gated</h3>
                <p className="text-sm text-white/60 max-w-md mx-auto mt-1">
                  You requested a private meeting with {managerName} recently. To prevent disruptive meetings, you must wait <span className="text-amber-400 font-bold">{cooldown.remainingWeeks} week{cooldown.remainingWeeks > 1 ? 's' : ''}</span> before requesting your next discussion.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-sm"
              >
                Return to Squad
              </button>
            </div>
          ) : (
            /* Topic & Selection View */
            <div className="space-y-6">
              {/* Topic Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
                <button
                  onClick={() => handleTopicChange('PLAYING_TIME')}
                  className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${selectedTopic === 'PLAYING_TIME' ? 'bg-[#00FF88] text-black shadow' : 'text-white/60 hover:text-white'}`}
                >
                  ⏱️ Playing Time
                </button>
                <button
                  onClick={() => handleTopicChange('TACTICAL_ROLE')}
                  className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${selectedTopic === 'TACTICAL_ROLE' ? 'bg-[#00FF88] text-black shadow' : 'text-white/60 hover:text-white'}`}
                >
                  📋 Tactical Role
                </button>
                <button
                  onClick={() => handleTopicChange('AMBITION')}
                  className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${selectedTopic === 'AMBITION' ? 'bg-[#00FF88] text-black shadow' : 'text-white/60 hover:text-white'}`}
                >
                  🌟 Ambition
                </button>
              </div>

              {/* Sub-options List */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Select Discussion Angle:</label>
                {optionsForTopic.map(opt => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00FF88]/10 border-[#00FF88] shadow-lg shadow-[#00FF88]/5'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">{opt.title}</h4>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#00FF88] bg-[#00FF88]' : 'border-white/30'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </div>
                      <p className="text-xs text-white/60 mt-1">{opt.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Context Warning / Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl text-xs text-blue-200/80 flex items-start gap-3">
                <Award className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  {managerName} is a <strong className="text-white">{archetypeLabels[archetype]}</strong>. Your tone and recent performance will directly shape his trust, squad standing, and future selection decisions.
                </span>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleExecuteMeeting}
                className="w-full py-3.5 bg-[#00FF88] text-black font-black rounded-xl uppercase tracking-wider hover:bg-[#00FF88]/90 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Request Private Meeting
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

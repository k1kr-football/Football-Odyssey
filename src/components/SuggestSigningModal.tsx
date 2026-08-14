import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import {
  canSuggestSigningToDoF,
  getSuggestedSigningCandidates,
  evaluateDoFSigningSuggestion,
  TargetCandidate,
  DoFResponseResult
} from '../utils/playerAgency';
import { getClubStaff } from '../utils/clubStaff';
import { X, Lightbulb, DollarSign, Award, Users, TrendingUp, Lock, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';

interface SuggestSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestSigningModal: React.FC<SuggestSigningModalProps> = ({ isOpen, onClose }) => {
  const { state, setPlayer, setInbox } = useGame();
  const player = state.player;

  const [candidates] = useState<TargetCandidate[]>(() => getSuggestedSigningCandidates(state));
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?.id || '');
  const [result, setResult] = useState<DoFResponseResult | null>(null);

  if (!isOpen || !player) return null;

  const staff = getClubStaff(state);
  const dof = staff.chiefScout;
  const dofTitle = "Director of Football & Chief Scout";
  const cooldown = canSuggestSigningToDoF(state);

  const clubSymbol = player.currentClubSymbol;
  const clubFinances = state.worldState?.clubFinances?.[clubSymbol];
  const transferBudget = clubFinances?.transferBudget ?? 25000000;
  const financialHealth = clubFinances?.financialHealth ?? 'Healthy';

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  const handleExecuteSuggestion = () => {
    if (!selectedCandidate) return;
    const res = evaluateDoFSigningSuggestion(state, selectedCandidate);
    setResult(res);
    if (res.updatedState.player) {
      setPlayer(res.updatedState.player);
    }
    if (res.inboxMsg) {
      setInbox([res.inboxMsg, ...state.inbox]);
    }
  };

  const getCandidateBadgeColor = (type: TargetCandidate['candidateType']) => {
    switch (type) {
      case 'Youth Rival': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Former Teammate': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Scouted Talent': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="bg-[#121620] border border-[#222] w-full max-w-2xl overflow-hidden text-white flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <CharacterPortrait type="manager" size={54} name={dof.fullName} className="border border-[#333] " />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1 rounded-full text-black">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-display tracking-wide">{dof.fullName}</h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/30 uppercase">
                  {dofTitle}
                </span>
              </div>
              <p className="text-white/60 text-xs mt-1">
                Standing Weight: <span className="text-[#00FF88] font-bold">{player.hierarchyRole || 'Fringe'}</span> &middot; Peer Respect: <span className="text-amber-400 font-bold">{player.reputation?.peerRespect || 50}%</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {result ? (
            /* Outcome View */
            <div className="space-y-6 animate-fadeIn">
              <div className="border border-[#222] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#222] pb-4">
                  <div className="flex items-center gap-3">
                    <CharacterPortrait type="manager" size={44} name={dof.fullName} className="" />
                    <div>
                      <h3 className="font-bold text-base text-white">{dof.fullName}'s Verdict</h3>
                      <p className="text-xs text-white/50">{dofTitle}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    result.status === 'ACCEPTED_AND_SIGNED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    result.status === 'ADDED_TO_SHORTLIST' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {result.status === 'ACCEPTED_AND_SIGNED' ? 'Transfer Completed! 🤝' :
                     result.status === 'ADDED_TO_SHORTLIST' ? 'Added to Shortlist 📋' :
                     'Suggestion Declined'}
                  </span>
                </div>

                <blockquote className="text-lg italic font-serif text-amber-200/90 leading-relaxed border-l-4 border-amber-400 pl-4 my-2">
                  {result.dofDialog}
                </blockquote>

                {/* Consequences */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className={`p-3 border flex items-center justify-between ${result.trustChange >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                    <span className="text-xs font-bold uppercase">Manager Trust</span>
                    <span className="font-extrabold text-sm">+{result.trustChange}%</span>
                  </div>

                  <div className={`p-3 border flex items-center justify-between ${result.peerRespectChange >= 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                    <span className="text-xs font-bold uppercase">Peer Respect</span>
                    <span className="font-extrabold text-sm">+{result.peerRespectChange}%</span>
                  </div>
                </div>

                {result.inboxMsg && (
                  <div className="bg-[#00FF88]/10 border border-[#00FF88]/30 p-3 flex items-center gap-2 text-xs text-[#00FF88]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Official confirmation message sent to your Inbox!</span>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-[#00FF88] text-black font-extrabold uppercase tracking-wider hover:bg-[#00FF88]/90 transition-all "
              >
                Close Transfer Desk
              </button>
            </div>
          ) : !cooldown.allowed ? (
            /* Cooldown View */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Director of Football Desk Gated</h3>
                <p className="text-sm text-white/60 max-w-md mx-auto mt-1">
                  You submitted a recruitment recommendation recently. To maintain squad discipline, you can suggest your next target in <span className="text-amber-400 font-bold">{cooldown.remainingWeeks} week{cooldown.remainingWeeks > 1 ? 's' : ''}</span>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold transition-colors text-sm"
              >
                Return to Transfers
              </button>
            </div>
          ) : (
            /* Candidate Selection View */
            <div className="space-y-6">
              {/* Financial Health Header */}
              <div className="bg-white/5 border border-[#222] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 ">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-white/50 font-bold uppercase tracking-wider">Club Transfer Budget</div>
                    <div className="text-base font-black text-white">£{(transferBudget / 1000000).toFixed(1)}M</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/50 font-bold uppercase tracking-wider">Financial Status</div>
                  <div className="text-xs font-bold text-amber-400 uppercase">{financialHealth}</div>
                </div>
              </div>

              {/* Candidate Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Select Player Target to Recommend:</label>
                {candidates.map(cand => {
                  const isSelected = selectedCandidateId === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className={`p-4 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 '
                          : 'bg-white/5 border-[#222] hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black/40 border border-[#222] flex items-center justify-center font-black text-sm text-[#00FF88]">
                            {cand.ovr}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white">{cand.name}</h4>
                              <span className="text-xs font-bold text-white/50">({cand.position} &middot; {cand.age}yo)</span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${getCandidateBadgeColor(cand.candidateType)}`}>
                                {cand.candidateType}
                              </span>
                            </div>
                            <p className="text-xs text-white/60 mt-0.5">{cand.club}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-[#00FF88]">£{(cand.value / 1000000).toFixed(1)}M</div>
                          <div className="text-[10px] text-white/40 font-mono">£{cand.weeklyWage.toLocaleString()}/wk</div>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 mt-2 bg-black/20 p-2.5 border border-[#111] italic">
                        "{cand.reasoning}"
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Standing Context */}
              <div className="bg-purple-500/10 border border-purple-500/20 p-3.5 text-xs text-purple-200/80 flex items-start gap-3">
                <Users className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Your influence as a <strong className="text-white">{player.hierarchyRole || 'Fringe'}</strong> player gives your recommendation extra weight with the Director of Football.
                </span>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleExecuteSuggestion}
                className="w-full py-3.5 bg-amber-400 text-black font-black uppercase tracking-wider hover:bg-amber-300 transition-all flex items-center justify-center gap-2"
              >
                <Lightbulb className="w-4 h-4" /> Recommend Target to Director of Football
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

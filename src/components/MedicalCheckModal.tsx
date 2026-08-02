import React, { useState, useEffect } from 'react';
import { TransferOffer, Player } from '../types';
import { GameState } from '../store/GameContext';
import { useGame } from '../store/GameContext';
import { CLUBS } from '../data/teams';
import { Activity, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { getClubStaff, resolveSenderIdentity } from '../utils/clubStaff';

interface MedicalCheckModalProps {
  isOpen: boolean;
  offer: TransferOffer | null;
  onComplete: (success: boolean, newOffer?: TransferOffer) => void;
  onClose: () => void;
}

export const MedicalCheckModal: React.FC<MedicalCheckModalProps> = ({ isOpen, offer, onComplete, onClose }) => {
  const { state } = useGame();
  const player = state.player;
  const [stage, setStage] = useState<'START' | 'SCAN' | 'RESULT'>('START');
  const [result, setResult] = useState<'PASS' | 'DELAY' | 'FAIL' | null>(null);
  const [revisedOffer, setRevisedOffer] = useState<TransferOffer | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStage('START');
      setResult(null);
      setRevisedOffer(null);
    }
  }, [isOpen]);

  if (!isOpen || !offer || !player) return null;

  const club = CLUBS.find(c => c.symbol === offer.clubSymbol);
  const physioName = resolveSenderIdentity(state, 'PHYSIO');

  const runMedical = () => {
    setStage('SCAN');
    
    setTimeout(() => {
      const physCondition = player.physicalCondition;
      const injSusceptibility = physCondition?.injurySusceptibility || 0;
      const recDebt = physCondition?.recoveryDebt || 0;
      const isInjured = player.isInjured;
      
      let passChance = 0.95; // default 95% pass rate
      
      if (isInjured) passChance -= 0.5; // Big penalty if currently injured
      if (injSusceptibility > 70) passChance -= 0.15;
      if (recDebt > 80) passChance -= 0.10;
      
      const roll = Math.random();
      
      if (roll <= passChance) {
        setResult('PASS');
      } else {
        // Did we just delay, or did we fail/reduce?
        const failRoll = Math.random();
        if (failRoll < 0.4 && !isInjured) {
          // Delay - minor complication but proceeds
          setResult('DELAY');
        } else {
          // Fail/reduce - they want a revised offer or they pull out
          setResult('FAIL');
          
          if (failRoll > 0.8 || isInjured) {
            // Completely fail
            setRevisedOffer(null);
          } else {
            // Reduced offer
            setRevisedOffer({
              ...offer,
              wage: Math.floor(offer.wage * 0.8),
              id: `${offer.id}_revised`
            });
          }
        }
      }
      setStage('RESULT');
    }, 1500); // 1.5s scan time for tension
  };

  const handleFinish = () => {
    if (result === 'PASS' || result === 'DELAY') {
      onComplete(true);
    } else if (result === 'FAIL') {
      if (revisedOffer) {
        onComplete(true, revisedOffer); // Handled differently by parent? Parent just expects newOffer if it was updated, but parent assumes success = true means finalized. 
        // Wait, if it's revised, it's NOT finalized. 
        // If we want to return a revised offer to the pool, success = false, newOffer = revisedOffer.
        onComplete(false, revisedOffer);
      } else {
        onComplete(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
          <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <Activity className="text-emerald-400 w-4 h-4" />
            Pre-Transfer Medical
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {stage === 'START' && (
            <div className="text-center space-y-4">
              <p className="text-white/70 text-xs font-mono">
                You have arrived at the {club?.name} training complex. Before personal terms can be finalized, you must undergo a routine physical assessment.
              </p>
              <div className="bg-black/50 p-4 rounded border border-white/5 text-left text-xs font-mono text-white/50">
                <span className="text-white font-bold block mb-2">Lead Assessor:</span>
                {physioName}
              </div>
              <button
                onClick={runMedical}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-colors"
              >
                Begin Medical Assessment
              </button>
            </div>
          )}

          {stage === 'SCAN' && (
            <div className="text-center space-y-6 py-8">
              <Activity className="w-12 h-12 text-emerald-500 mx-auto animate-pulse" />
              <div>
                <div className="text-white font-bold tracking-widest uppercase mb-2">Assessment in Progress</div>
                <div className="w-full bg-white/10 h-1 mt-2 rounded overflow-hidden">
                  <div className="bg-emerald-500 h-full animate-[progress_1.5s_ease-in-out_forwards]"></div>
                </div>
              </div>
              <p className="text-white/40 text-[10px] font-mono">Reviewing joint stability, muscle load, and cardiovascular baselines...</p>
            </div>
          )}

          {stage === 'RESULT' && (
            <div className="space-y-4">
              {result === 'PASS' && (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-emerald-500 font-bold uppercase tracking-widest">Medical Passed</h3>
                  <p className="text-white/70 text-xs font-mono">
                    "{physioName}: Everything looks clean. You're cleared to finalize the paperwork."
                  </p>
                  <button
                    onClick={handleFinish}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-colors mt-4"
                  >
                    Sign Contract
                  </button>
                </div>
              )}

              {result === 'DELAY' && (
                <div className="text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
                  <h3 className="text-yellow-500 font-bold uppercase tracking-widest">Minor Complication</h3>
                  <p className="text-white/70 text-xs font-mono">
                    "{physioName}: We noticed some minor tightness during the mobility screening. It's nothing that derails the move, but we'll need an extra day to review the scans before signing off."
                  </p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">The transfer will proceed with a slight delay.</p>
                  <button
                    onClick={handleFinish}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-colors mt-4"
                  >
                    Acknowledge
                  </button>
                </div>
              )}

              {result === 'FAIL' && (
                <div className="text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                  <h3 className="text-red-500 font-bold uppercase tracking-widest">Medical Concern Flagged</h3>
                  
                  {revisedOffer ? (
                    <>
                      <p className="text-white/70 text-xs font-mono">
                        "{physioName}: The scans revealed an underlying risk factor. The board isn't comfortable with the original terms given this new information."
                      </p>
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded mt-2">
                        <div className="text-red-400 font-bold text-[10px] uppercase tracking-widest mb-1">Revised Terms</div>
                        <div className="text-white font-mono text-xs">New Wage: £{revisedOffer.wage.toLocaleString()}/week</div>
                      </div>
                    </>
                  ) : (
                    <p className="text-white/70 text-xs font-mono">
                      "{physioName}: I'm sorry, but you've failed the medical assessment. We cannot proceed with this transfer given your current physical state."
                    </p>
                  )}
                  
                  <button
                    onClick={handleFinish}
                    className="w-full py-3 bg-red-500 hover:bg-red-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-colors mt-4"
                  >
                    {revisedOffer ? 'Review New Offer' : 'Close'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}} />
    </div>
  );
};

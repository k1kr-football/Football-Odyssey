import React from 'react';
import { useGame } from '../store/GameContext';
import { useAPEngine } from '../hooks/useAPEngine';
import { AP_ACTION_CATALOG } from '../types/apEngine';
import { Globe, Heart, Dumbbell, Star, ChevronRight, CheckCircle2 } from 'lucide-react';

export function OffSeasonScreen() {
  const { state, setScreen, advanceDay } = useGame();
  const { apState, performAction, getActionCost } = useAPEngine();

  const [showSummary, setShowSummary] = React.useState(false);

  React.useEffect(() => {
    if (apState.phase !== 'off_season' && !showSummary) {
      // If we just finished off-season, show the summary modal instead of immediately routing
      if (state.currentWeek === 1) {
        setShowSummary(true);
      } else {
        setScreen('HUB');
      }
    }
  }, [apState.phase, setScreen, showSummary, state.currentWeek]);

  // The off-season is 4 weeks long (weeks 49-52)
  const offSeasonWeek = Math.min(4, Math.max(1, (state.currentWeek || 49) - 48));

  const offSeasonActions = AP_ACTION_CATALOG.filter(a => a.category === 'off_season');

  const handleAction = (actionId: string) => {
    const result = performAction(actionId);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleAdvance = () => {
    if (apState.currentAP > 0) {
      if (!window.confirm(`You still have ${apState.currentAP} AP remaining. Are you sure you want to advance?`)) {
        return;
      }
    }
    // Advance week
    advanceDay(true); // Since it's weekly we can just call advanceDay(true) multiple times or modify advanceDay logic to skip a week if in off-season.
    // Wait, advanceDay advances one day. We need to advance a whole week if we are treating off-season as weekly blocks.
    // Let's call it 7 times, or just handle it in GameContext. For simplicity, advanceDay(true) 7 times.
    for (let i = 0; i < 7; i++) {
        advanceDay(true);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 custom-scrollbar">
      {/* Header Banner */}
      <div className="bg-[#00FF88]/10 border border-[#00FF88]/30 p-4 sm:p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-[#00FF88] font-mono tracking-tighter">
            🌴 OFF-SEASON PHASE
          </h1>
          <p className="text-sm text-[#00FF88]/70 mt-1 font-mono">
            WEEK {offSeasonWeek} OF 4 &mdash; REST, REBUILD, AND REBRAND
          </p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 px-4 py-2 border border-[#222]">
          <div className="text-center">
            <span className="block text-[10px] text-white/50 uppercase font-bold mb-0.5">Remaining Time</span>
            <span className="font-mono font-bold text-white text-lg">{apState.currentAP} <span className="text-xs text-white/50">AP</span></span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {offSeasonActions.map(action => {
          const cost = getActionCost(action);
          const canAfford = typeof cost === 'number' ? apState.currentAP >= cost : apState.currentAP > 0;
          
          let Icon = Globe;
          if (action.id === 'off_bootcamp') Icon = Dumbbell;
          else if (action.id === 'off_charity') Icon = Heart;
          else if (action.id === 'off_rest') Icon = CheckCircle2;

          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={!canAfford}
              className={`p-4 border text-left flex flex-col justify-between transition-all group ${
                canAfford 
                  ? 'bg-[#050505] border-[#222] hover:border-[#00FF88]/50 hover:bg-[#1a1a1a] cursor-pointer' 
                  : 'bg-black/50 border-[#111] opacity-50 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-8 h-8 flex items-center justify-center ${canAfford ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'bg-white/5 text-white/40'}`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-2 py-1 ${canAfford ? 'bg-[#00FF88] text-black' : 'bg-white/10 text-white/50'}`}>
                    {cost === 'ALL' ? 'ALL AP' : `${cost} AP`}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-1">{action.title}</h3>
                <p className="text-[11px] text-white/60 leading-relaxed mb-3">
                  {action.description}
                </p>
              </div>
              
              <div className="pt-3 border-t border-[#111] space-y-1">
                {action.effects.attributeXP && (
                   <div className="text-[10px] text-white/70 font-mono">+XP: {Object.keys(action.effects.attributeXP).join(', ')}</div>
                )}
                {action.effects.conditionDelta !== undefined && (
                   <div className={`text-[10px] font-mono ${action.effects.conditionDelta > 0 ? 'text-[#00FF88]' : 'text-red-400'}`}>
                     Condition {action.effects.conditionDelta > 0 ? '+' : ''}{action.effects.conditionDelta}
                   </div>
                )}
                {action.effects.reputationDelta && (
                   <div className="text-[10px] text-[#00FF88] font-mono">+Reputation</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Advance Button */}
      <div className="flex justify-center mt-auto pb-8">
        <button
          onClick={handleAdvance}
          className="bg-white text-black px-8 py-4 font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#00FF88] hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]"
        >
          Advance to Next Off-Season Week
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-[#00FF88]/30 p-6 md:p-10 max-w-lg w-full">
            <h2 className="text-2xl font-black text-[#00FF88] uppercase tracking-wider mb-2">Off-Season Concluded</h2>
            <p className="text-white/70 mb-6 font-mono text-sm">You have completed your summer break and pre-season preparations. It's time to return to club duty.</p>
            
            <div className="space-y-4 mb-8 font-mono">
              <div className="flex justify-between items-center p-3 bg-white/5 ">
                <span className="text-white/50 text-xs uppercase">Current Condition</span>
                <span className="text-white font-bold">{Math.max(0, 100 - (state.player?.fatigue || 0))}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 ">
                <span className="text-white/50 text-xs uppercase">Current World Reputation</span>
                <span className="text-white font-bold">{state.player?.reputation?.world || 50}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSummary(false);
                setScreen('HUB');
              }}
              className="w-full bg-[#00FF88] text-black py-4 font-black uppercase tracking-wider hover:bg-white transition-colors"
            >
              Return to Hub & Begin Season
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

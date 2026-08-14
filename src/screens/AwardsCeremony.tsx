import React from 'react';
import { useGame } from '../store/GameContext';
import { Award, Trophy, Star, Shield, Zap, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { TeamLogo } from '../components/TeamLogo';
import { SeasonAwardsSummary } from '../utils/leagueAwards';

export function AwardsCeremony() {
  const { state, setScreen } = useGame();

  const awards: SeasonAwardsSummary | null = state.pendingAwardsCeremony || state.seasonAwardsHistory?.[state.seasonAwardsHistory.length - 1] || null;

  if (!state.player) return null;

  const handleFinishCeremony = () => {
    setScreen('HUB');
  };

  const userWonAny = awards && awards.userAwardsWon && awards.userAwardsWon.length > 0;

  return (
    <div className="min-h-screen bg-[#07080a] text-white flex flex-col p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Gala Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header Banner */}
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center text-center my-6 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs uppercase tracking-widest mb-3 animate-pulse">
          <Sparkles size={14} /> Annual Football League Gala Ceremony
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text ">
          Season {awards?.season || state.season} Awards Gala
        </h1>
        <p className="text-xs md:text-sm text-white/60 font-mono mt-2 uppercase tracking-wider">
          {awards?.league || 'Professional League'} &bull; Individual Honours & Team of the Season
        </p>

        {userWonAny && (
          <div className="mt-4 p-3 border border-amber-500/40 flex items-center gap-3 text-amber-300 max-w-xl text-left ">
            <Trophy className="text-amber-400 shrink-0" size={28} />
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-200">Gala Distinction</div>
              <div className="text-xs font-medium">
                You were awarded: <span className="font-bold text-white">{awards.userAwardsWon.join(', ')}</span>! Your achievements have been enshrined in your Trophy Cabinet.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Awards Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 my-4 z-10">
        {/* Golden Boot */}
        <div className={`premium-card p-6 border ${awards?.goldenBoot?.isUserPlayer ? 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-[#222] bg-[#0d0f12]'} flex flex-col items-center text-center relative overflow-hidden`}>
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
            <Award size={24} />
          </div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">League Top Scorer</span>
          <h3 className="text-xl font-black uppercase text-white mt-1">Golden Boot</h3>

          {awards?.goldenBoot ? (
            <div className="mt-4 flex flex-col items-center w-full">
              <TeamLogo symbol={awards.goldenBoot.clubSymbol} size={48} className="my-2" />
              <div className="text-base font-bold text-white flex items-center gap-1.5">
                {awards.goldenBoot.name}
                {awards.goldenBoot.isUserPlayer && <Star size={16} className="text-amber-400 fill-amber-400 inline" />}
              </div>
              <div className="text-xs text-white/50 font-mono">{awards.goldenBoot.clubName}</div>

              <div className="mt-4 px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-sm font-bold">
                ⚽ {awards.goldenBoot.goals} Goals
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/40 mt-4">Awaiting Calculation...</div>
          )}
        </div>

        {/* Player of the Season */}
        <div className={`premium-card p-6 border ${awards?.playerOfSeason?.isUserPlayer ? 'border-yellow-400/80 bg-yellow-500/15 shadow-[0_0_40px_rgba(234,179,8,0.25)]' : 'border-[#222] bg-[#0d0f12]'} flex flex-col items-center text-center relative overflow-hidden`}>
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl"></div>
          <div className="w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-400/60 flex items-center justify-center text-yellow-300 mb-3">
            <Trophy size={28} />
          </div>
          <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest font-bold">Ultimate Individual Award</span>
          <h3 className="text-2xl font-black uppercase text-white mt-1">Player of the Season</h3>

          {awards?.playerOfSeason ? (
            <div className="mt-4 flex flex-col items-center w-full">
              <TeamLogo symbol={awards.playerOfSeason.clubSymbol} size={56} className="my-2" />
              <div className="text-lg font-black text-white flex items-center gap-1.5">
                {awards.playerOfSeason.name}
                {awards.playerOfSeason.isUserPlayer && <Star size={18} className="text-yellow-400 fill-yellow-400 inline" />}
              </div>
              <div className="text-xs text-white/50 font-mono">{awards.playerOfSeason.clubName}</div>

              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-mono text-xs font-bold">
                  Rating: {awards.playerOfSeason.avgRating.toFixed(2)}
                </span>
                <span className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-mono text-xs font-bold">
                  {awards.playerOfSeason.goals}G / {awards.playerOfSeason.assists}A
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/40 mt-4">Awaiting Calculation...</div>
          )}
        </div>

        {/* Golden Glove */}
        <div className={`premium-card p-6 border ${awards?.goldenGlove?.isUserPlayer ? 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-[#222] bg-[#0d0f12]'} flex flex-col items-center text-center relative overflow-hidden`}>
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3">
            <Shield size={24} />
          </div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Top Defensive Goalkeeper</span>
          <h3 className="text-xl font-black uppercase text-white mt-1">Golden Glove</h3>

          {awards?.goldenGlove ? (
            <div className="mt-4 flex flex-col items-center w-full">
              <TeamLogo symbol={awards.goldenGlove.clubSymbol} size={48} className="my-2" />
              <div className="text-base font-bold text-white flex items-center gap-1.5">
                {awards.goldenGlove.name}
                {awards.goldenGlove.isUserPlayer && <Star size={16} className="text-amber-400 fill-amber-400 inline" />}
              </div>
              <div className="text-xs text-white/50 font-mono">{awards.goldenGlove.clubName}</div>

              <div className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-sm font-bold">
                🛡️ {awards.goldenGlove.cleanSheets} Clean Sheets
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/40 mt-4">Awaiting Calculation...</div>
          )}
        </div>
      </div>

      {/* Team of the Season (TOTS) Pitch Section */}
      <div className="max-w-6xl mx-auto w-full my-6 z-10">
        <div className="premium-card p-6 border border-[#222] bg-[#0d0f12]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222]">
            <div className="flex items-center gap-2">
              <Zap className="text-amber-400" size={20} />
              <h2 className="text-lg font-black uppercase tracking-wider text-white">
                Official Team of the Season
              </h2>
            </div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">4-3-3 Formation</span>
          </div>

          {/* 11 TOTS Squad Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {awards?.teamOfSeason?.map((p, idx) => (
              <div
                key={idx}
                className={`p-3 border flex flex-col items-center text-center transition-all ${
                  p.isUserPlayer
                    ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-105'
                    : 'border-[#222] bg-[#14171d]'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[9px] font-mono text-white/50 mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-amber-300">{p.exactPosition}</span>
                  <span className="font-bold text-emerald-400">{p.matchRating.toFixed(1)}</span>
                </div>
                <TeamLogo symbol={p.clubSymbol} size={32} className="my-1" />
                <div className="text-xs font-bold text-white truncate w-full flex items-center justify-center gap-1">
                  {p.name}
                  {p.isUserPlayer && <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-white/40 truncate w-full">{p.clubName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gala Action Button */}
      <div className="max-w-6xl mx-auto w-full flex justify-center my-6 z-10">
        <button
          onClick={handleFinishCeremony}
          className="px-8 py-4 text-black font-black uppercase tracking-wider text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)]"
        >
          <span>Conclude Gala & Advance</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

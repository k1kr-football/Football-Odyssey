import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { fetchRealWorldFootballNews, RealWorldHeadline, GroundingSource } from '../utils/realWorldNews';
import { Globe, RefreshCw, ExternalLink, Newspaper, Sparkles, MessageSquare, TrendingUp, Radio, CheckCircle2, Share2 } from 'lucide-react';

interface RealWorldNewsWidgetProps {
  compact?: boolean;
}

export const RealWorldNewsWidget: React.FC<RealWorldNewsWidgetProps> = ({ compact = false }) => {
  const { state, setPlayer } = useGame();
  const [headlines, setHeadlines] = useState<RealWorldHeadline[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGrounded, setIsGrounded] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [reactionToast, setReactionToast] = useState<string | null>(null);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRealWorldFootballNews();
      setHeadlines(data.headlines);
      setSources(data.groundingSources);
      setIsGrounded(data.isGrounded);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load real-world news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handlePlayerReaction = (headline: RealWorldHeadline, reactionType: 'ENCOURAGING' | 'AMBITIOUS' | 'PR_TRAINED') => {
    if (!state.player) return;

    let mediaGain = 3;
    let fanGain = 4;
    let moraleGain = 2;
    let message = '';

    if (reactionType === 'AMBITIOUS') {
      mediaGain = 6;
      fanGain = 8;
      moraleGain = 4;
      message = `You publicly commented on "${headline.title}". The media highlights your ambitious global perspective! (+6 Media Perception, +8 Fans)`;
    } else if (reactionType === 'ENCOURAGING') {
      mediaGain = 4;
      fanGain = 5;
      message = `You shared your respect for "${headline.title}". Fans admire your football knowledge! (+4 Media Perception, +5 Fans)`;
    } else {
      mediaGain = 5;
      moraleGain = 3;
      message = `A polished, media-trained comment on world football news. Press networks praised your maturity. (+5 Media Perception)`;
    }

    const updatedPlayer = {
      ...state.player,
      mediaPerception: Math.min(100, (state.player.mediaPerception || 50) + mediaGain),
      fans: Math.min(100, (state.player.fans || 50) + fanGain),
      morale: Math.min(100, (state.player.morale || 70) + moraleGain)
    };

    setPlayer(updatedPlayer);
    setReactionToast(message);
    setTimeout(() => setReactionToast(null), 4500);
  };

  const filteredHeadlines = activeCategory === 'ALL'
    ? headlines
    : headlines.filter(h => h.category === activeCategory);

  const categories = ['ALL', 'TRANSFERS', 'CHAMPIONS LEAGUE', 'PREMIER LEAGUE', 'WORLD FOOTBALL'];

  if (compact) {
    return (
      <div className="bg-[#121318] border border-[#222] p-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#222] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-[#00FF88] animate-pulse" />
            <span className="font-bold text-white uppercase tracking-wider font-display">
              REAL-WORLD FOOTBALL MEDIA FEED
            </span>
          </div>
          <button
            onClick={loadNews}
            disabled={isLoading}
            className="text-white/60 hover:text-white p-1 rounded transition-colors cursor-pointer"
            title="Refresh Real-World Headlines"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#00FF88]' : ''} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-white/50 animate-pulse">
            Grounding real-world football headlines...
          </div>
        ) : (
          <div className="space-y-2.5">
            {headlines.slice(0, 3).map((item) => (
              <div key={item.id} className="p-2.5 bg-[#181920] border border-[#111] hover:border-[#333] transition-all">
                <div className="flex items-center justify-between gap-2 mb-1 text-[10px]">
                  <span className="text-[#00FF88] font-bold uppercase">{item.category}</span>
                  <span className="text-white/40">{item.sourceName} &bull; {item.timestamp}</span>
                </div>
                <p className="text-white font-bold leading-tight line-clamp-2 mb-1">
                  {item.title}
                </p>
                {item.url && item.url !== '#' && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-teal-400 hover:underline flex items-center gap-1 inline-flex"
                  >
                    Read on {item.sourceName} <ExternalLink size={10} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#121318] border border-[#222] p-5 md:p-6 font-mono">
      {/* Header with Google Search Grounding Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#222] pb-4 mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0 ">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-display">
                WORLD FOOTBALL PRESS & MEDIA WIRE
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1 font-bold">
                <Globe size={11} className="text-teal-400" />
                {isGrounded ? 'GOOGLE SEARCH GROUNDED' : 'LIVE MEDIA'}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Current real-world football headlines, transfers & European coverage grounded live
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {lastUpdated && (
            <span className="text-[10px] text-white/40">
              Updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={loadNews}
            disabled={isLoading}
            className="bg-teal-500/20 border border-teal-500/40 hover:bg-teal-500 hover:text-black text-teal-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer "
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'GROUNDING...' : 'REFRESH PRESS WIRE'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {reactionToast && (
        <div className="mb-4 p-3 border border-teal-500/50 text-teal-300 text-xs flex items-center gap-2 animate-in fade-in zoom-in-95 ">
          <Sparkles size={16} className="text-teal-400 shrink-0 animate-spin" />
          <span className="font-bold">{reactionToast}</span>
        </div>
      )}

      {/* Category Filtering Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-[#111]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? 'bg-teal-500 text-black font-black'
                : 'bg-black/40 text-white/60 hover:text-white hover:bg-white/10 border border-[#111]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Headlines Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-white/50 space-y-3">
          <Globe size={32} className="mx-auto text-teal-400 animate-spin" />
          <p className="text-sm font-bold uppercase tracking-wider font-display">
            Fetching Grounded Football Headlines via Google Search...
          </p>
          <p className="text-xs text-white/40">Synthesizing transfer rumours, league standings & Champions League updates</p>
        </div>
      ) : filteredHeadlines.length === 0 ? (
        <div className="py-8 text-center text-white/40 text-xs">
          No headlines found for category {activeCategory}. Try refreshing the press wire.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHeadlines.map((item) => {
            let catColor = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
            if (item.category === 'TRANSFERS') catColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            if (item.category === 'CHAMPIONS LEAGUE') catColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
            if (item.category === 'PREMIER LEAGUE') catColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';

            return (
              <div
                key={item.id}
                className="bg-[#181920] border border-[#222] hover:border-teal-500/40 p-4 flex flex-col justify-between transition-all group "
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catColor}`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <Newspaper size={11} /> {item.sourceName} &bull; {item.timestamp}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-display text-white group-hover:text-teal-300 transition-colors leading-snug mb-2">
                    {item.title}
                  </h4>

                  <p className="text-xs text-white/70 leading-relaxed mb-3 line-clamp-3">
                    {item.summary}
                  </p>

                  {item.keyEntities && item.keyEntities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.keyEntities.map((entity, i) => (
                        <span key={i} className="text-[9px] bg-black/50 text-white/50 px-2 py-0.5 rounded border border-[#111]">
                          #{entity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#222] pt-3 flex items-center justify-between gap-2">
                  {/* Reaction Actions for Player RPG */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePlayerReaction(item, 'AMBITIOUS')}
                      className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                      title="Comment on headline as an ambitious star player"
                    >
                      <MessageSquare size={11} /> React (+Media)
                    </button>
                  </div>

                  {/* External Source Link */}
                  {item.url && item.url !== '#' && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-bold underline transition-colors"
                    >
                      Read Source <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grounding Citations Footer */}
      {sources && sources.length > 0 && (
        <div className="mt-5 border-t border-[#222] pt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-[10px] text-white/40">
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-teal-400" />
            <span>Google Search Grounding Citations:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {sources.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-300 underline flex items-center gap-0.5"
              >
                {s.title} <ExternalLink size={9} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

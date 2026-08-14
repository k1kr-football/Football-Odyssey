import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { MessageSquare, Phone, Video, Info, User, Check, Send } from 'lucide-react';
import { resolveSenderIdentity } from '../utils/clubStaff';

export function Messages() {
  const { state, setInbox, setPlayer } = useGame();
  const messages = state.inbox || [];
  
  // Filter chat messages: teammates, captain, prospect
  const chatMessages = messages.filter(m => {
    const sender = m.sender?.toUpperCase() || '';
    return sender.includes('TEAMMATE') || sender.includes('CAPTAIN') || sender.includes('PROSPECT');
  });

  // Group by sender
  const groups: Record<string, any[]> = {};
  chatMessages.forEach(m => {
    const senderName = m.sender?.replace(/\s*\(.*?\)\s*/g, '') || m.sender;
    if (!groups[senderName]) groups[senderName] = [];
    groups[senderName].push(m);
  });

  const chatContacts = Object.keys(groups).map(name => ({
    name,
    messages: groups[name],
    latest: groups[name][groups[name].length - 1],
    unread: groups[name].some(m => !m.read)
  })).sort((a, b) => new Date(b.latest.timestamp).getTime() - new Date(a.latest.timestamp).getTime());

  const [activeContact, setActiveContact] = useState<string | null>(chatContacts.length > 0 ? chatContacts[0].name : null);

  const handleAction = (msgId: string, choice: any) => {
    const selectedMsg = chatMessages.find(m => m.id === msgId);
    if (!selectedMsg) return;

    const updated = state.inbox.map((m) => {
      if (m.id === selectedMsg.id) {
        return { ...m, read: true, handled: true, actionTaken: choice.text };
      }
      return m;
    });
    setInbox(updated);

    if (choice.bonus && state.player) {
      const currentTrust = state.player.trust || 50;
      setPlayer({
        ...state.player,
        trust: Math.min(100, currentTrust + 2)
      });
    }
  };

  const activeGroup = activeContact ? groups[activeContact] : null;

  return (
    <div className="flex h-full gap-4 select-none font-sans bg-black p-4">
      {/* Contacts Sidebar */}
      <div className="w-1/3 max-w-[300px] flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2 text-white font-black uppercase text-xl tracking-tight">
          <MessageSquare className="text-[#00FF88]" />
          Chats
        </div>
        
        <div className="flex-1 bg-[#111] border border-[#111] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#111]">
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00FF88]"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatContacts.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-sm font-mono">
                No active conversations.
              </div>
            ) : (
              chatContacts.map(contact => (
                <button
                  key={contact.name}
                  onClick={() => setActiveContact(contact.name)}
                  className={`w-full p-4 flex items-center gap-3 transition-colors border-l-2 ${activeContact === contact.name ? 'bg-white/10 border-[#00FF88]' : 'hover:bg-white/5 border-transparent'}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg border border-[#222]">
                      {contact.name.substring(0, 2).toUpperCase()}
                    </div>
                    {contact.unread && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-[#00FF88] rounded-full border-2 border-[#111]"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-white font-bold truncate">{contact.name}</span>
                      <span className="text-[10px] text-white/40 font-mono shrink-0">{contact.latest.timestamp.split(' ')[1] || 'Now'}</span>
                    </div>
                    <div className={`text-xs truncate ${contact.unread ? 'text-white font-semibold' : 'text-white/50'}`}>
                      {contact.latest.handled ? `You: ${contact.latest.actionTaken}` : contact.latest.content.substring(0, 40) + '...'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#111] border border-[#111] flex flex-col relative overflow-hidden">
        {activeContact && activeGroup ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-[#111] flex items-center justify-between px-6 bg-[#161616]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border border-[#222]">
                  {activeContact.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-white font-bold">{activeContact}</h2>
                  <p className="text-[10px] text-emerald-400 font-mono">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white/40">
                <Phone size={18} className="hover:text-white cursor-pointer transition-colors" />
                <Video size={18} className="hover:text-white cursor-pointer transition-colors" />
                <Info size={18} className="hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeGroup.map((msg, idx) => {
                const showDate = idx === 0 || activeGroup[idx - 1].timestamp.split(' ')[0] !== msg.timestamp.split(' ')[0];
                return (
                  <div key={msg.id} className="flex flex-col gap-4">
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="bg-white/5 text-white/40 text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-widest">
                          {msg.timestamp.split(' ')[0]}
                        </span>
                      </div>
                    )}
                    
                    {/* Received Message */}
                    <div className="flex items-end gap-2 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0 mb-1 flex items-center justify-center text-[10px] text-white">
                        {activeContact.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="bg-[#1a1a1a] border border-[#222] rounded-bl-sm p-4 text-sm text-white/90">
                        {msg.content}
                        <div className="text-[9px] text-white/30 mt-2 text-right font-mono">
                          {msg.timestamp.split(' ')[1] || '12:00'}
                        </div>
                      </div>
                    </div>

                    {/* Options / Sent Message */}
                    {msg.handled ? (
                      <div className="flex justify-end w-full">
                        <div className="flex items-end gap-2 max-w-[80%] flex-row-reverse">
                          <div className="bg-[#00FF88] text-black rounded-br-sm p-4 text-sm font-medium">
                            {msg.actionTaken}
                            <div className="text-[9px] text-black/50 mt-2 text-right font-mono flex items-center justify-end gap-1">
                              {msg.timestamp.split(' ')[1] || '12:01'} <Check size={10} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end w-full mt-2">
                        <div className="bg-white/5 border border-[#222] p-3 max-w-[80%]">
                          <div className="text-[10px] uppercase font-bold text-white/40 mb-3 px-1">How to reply?</div>
                          <div className="flex flex-col gap-2">
                            {msg.choices?.map((choice: any, cIdx: number) => (
                              <button
                                key={cIdx}
                                onClick={() => handleAction(msg.id, choice)}
                                className="w-full text-left bg-white/10 hover:bg-[#00FF88] hover:text-black text-white px-4 py-2.5 text-sm transition-all group"
                              >
                                {choice.text}
                              </button>
                            ))}
                            {(!msg.choices || msg.choices.length === 0) && (
                              <button
                                onClick={() => {
                                  const updated = state.inbox.map((m) => m.id === msg.id ? { ...m, read: true, handled: true, actionTaken: 'Seen' } : m);
                                  setInbox(updated);
                                }}
                                className="w-full text-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm transition-all"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Input Area (Mock) */}
            <div className="p-4 bg-[#161616] border-t border-[#111] flex items-center gap-3">
              <div className="flex-1 bg-[#1a1a1a] border border-[#222] rounded-full px-4 py-3 text-sm text-white/40 font-mono">
                Reply from options above...
              </div>
              <div className="w-12 h-12 rounded-full bg-[#00FF88]/20 text-[#00FF88] flex items-center justify-center">
                <Send size={18} className="ml-1" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/20">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm font-mono uppercase tracking-widest">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

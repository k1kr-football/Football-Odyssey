import re
with open('src/screens/AgentScreen.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { useGame } from '../store/GameContext';", "import { useGame } from '../store/GameContext';\nimport { AgentMeetingModal } from '../components/AgentMeetingModal';")

# Add state
content = content.replace("const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);", "const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);\n  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);")

# Find the end of ACTIONS tab
match = re.search(r'\{/\* Action 2: Sound Out Transfer Market \*/\}.*?</button>\s*</div>\s*</div>\s*\)', content, re.DOTALL)

if match:
    replacement = match.group(0).replace('</div>\n        )', '''</div>
            
            {/* Action 3: Schedule Agent Meeting */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl md:col-span-2">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
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
                className="w-full py-3 bg-blue-500 text-white hover:bg-blue-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                Schedule Meeting
              </button>
            </div>
            
          </div>
        )''')
    
    content = content[:match.start()] + replacement + content[match.end():]

# Add modal at the end before closing div
content = content.replace('</div>\n    </div>\n  );\n}', '</div>\n      <AgentMeetingModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} />\n    </div>\n  );\n}')

with open('src/screens/AgentScreen.tsx', 'w') as f:
    f.write(content)

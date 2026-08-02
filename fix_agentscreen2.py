import re
with open('src/screens/AgentScreen.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { AgentMeetingModal } from '../components/AgentMeetingModal';\nimport { AgentMeetingModal } from '../components/AgentMeetingModal';", "import { AgentMeetingModal } from '../components/AgentMeetingModal';")
content = content.replace("const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);\n  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);", "const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);")

with open('src/screens/AgentScreen.tsx', 'w') as f:
    f.write(content)

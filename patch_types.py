import re
with open('src/types.ts', 'r') as f:
    content = f.read()

replacement = """  stateFlags: {
    historyFlags?: Record<string, boolean>;
    openThreads?: Record<string, any>;
    eventCooldowns?: Record<string, number>;
    decisionMemory?: any[];
    digestEnabled?: boolean;
    verbosity?: 'ALL' | 'IMPORTANT_AND_CRITICAL' | 'CRITICAL_ONLY';
    notificationVerbosity?: 'ALL' | 'IMPORTANT_AND_CRITICAL' | 'CRITICAL_ONLY';
    reputationHistory?: any[];
    skippedTrainingThisWeek?: boolean;
    retired?: boolean;
    agentFocus?: 'TRANSFER' | 'LOYALTY' | 'WAGES' | 'BONUSES' | 'PR_HYPE' | 'FOOTBALL' | string;
    lastAgentMeetingWeek?: number;"""

content = re.sub(
    r"  stateFlags: \{\n    historyFlags\?: Record<string, boolean>;\n    openThreads\?: Record<string, any>;\n    eventCooldowns\?: Record<string, number>;\n    decisionMemory\?: any\[\];\n    digestEnabled\?: boolean;\n    verbosity\?: 'ALL' \| 'IMPORTANT_AND_CRITICAL' \| 'CRITICAL_ONLY';\n    notificationVerbosity\?: 'ALL' \| 'IMPORTANT_AND_CRITICAL' \| 'CRITICAL_ONLY';\n    reputationHistory\?: any\[\];\n    skippedTrainingThisWeek\?: boolean;\n    retired\?: boolean;",
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/types.ts', 'w') as f:
    f.write(content)

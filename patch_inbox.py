import re

with open('src/screens/Inbox.tsx', 'r') as f:
    content = f.read()

replacement = """
    if (choice.type === "TESTIMONIAL_ACCEPT") {
      if (state.player) {
        import("../utils/testimonialMatch").then(({ executeTestimonialMatch }) => {
          const result = executeTestimonialMatch(state.player!, "HUMBLE_GRATITUDE");
          setPlayer(result.updatedPlayer);
          setInbox([result.inboxMessage, ...state.inbox]);
        });
      }
    }

    if (choice.type === "digest_mark_all_read") {
"""

content = content.replace('if (choice.type === "digest_mark_all_read") {', replacement)

with open('src/screens/Inbox.tsx', 'w') as f:
    f.write(content)

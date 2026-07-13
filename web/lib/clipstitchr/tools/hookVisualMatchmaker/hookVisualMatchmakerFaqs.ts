import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const hookVisualMatchmakerFaqs: ToolFaq[] = [
  {
    question: "Does the matchmaker inspect or upload my footage?",
    answer:
      "No. You describe the footage you have, and the storyboard is assembled locally in your browser.",
  },
  {
    question: "What if I do not have the requested UGC or demo clip?",
    answer:
      "The plan uses the footage you say is available. If neither source is available, it starts with a simple text card and names the missing product shot.",
  },
  {
    question: "Will the suggested pairing outperform another ad?",
    answer:
      "No. The tool checks whether the hook and visual can tell one connected story. Real performance still has to be tested.",
  },
];

import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const appAdCreativeFatigueFaqs: ToolFaq[] = [
  {
    question: "Does this predict when an ad will stop working?",
    answer:
      "No. It models even delivery against the audience size and frequency ceiling you enter. Actual delivery and results can move differently.",
  },
  {
    question: "Why split impressions evenly across creatives?",
    answer:
      "It creates a transparent planning baseline. Ad platforms rarely deliver every creative equally, so compare the model with your real reports.",
  },
  {
    question: "What should I use as the frequency ceiling?",
    answer:
      "Use a threshold your team already chose from its own evidence. This tool does not provide a market benchmark or recommend a refresh date.",
  },
];

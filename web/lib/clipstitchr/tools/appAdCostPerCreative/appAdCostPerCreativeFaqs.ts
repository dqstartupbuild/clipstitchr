import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const appAdCostPerCreativeFaqs: ToolFaq[] = [
  {
    question: "What counts as a publishable creative?",
    answer:
      "Count one genuinely usable app-ad version. Do not count duplicate downloads, file formats, or aspect-ratio copies as separate creative ideas.",
  },
  {
    question: "How is this different from the UGC Production Cost Calculator?",
    answer:
      "The production calculator breaks down one UGC cycle in detail. This calculator starts with your current unit cost and compares it with an optional scenario that finishes more creatives from source footage you already paid for.",
  },
  {
    question: "Does a lower comparison mean ClipStitchr will save that amount?",
    answer:
      "No. The comparison uses only the costs and creative counts you entered. It shows how your scenario differs from repeating your current average, not a guaranteed product saving.",
  },
  {
    question: "Does this include ad spend?",
    answer:
      "No. This is a creative-production calculation. Use the App Ad Break-Even Calculator when you want to combine media spend with creative cost and customer economics.",
  },
];

import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const creativeAssetInventoryFaqs: ToolFaq[] = [
  {
    question: "What counts as ready?",
    answer:
      "Use ready only when the asset is usable in the next production round. Put uncertain quality under needs work and uncertain usage details under rights unknown.",
  },
  {
    question: "How is coverage calculated?",
    answer:
      "Ready coverage is ready assets divided by every counted asset. Needs-work, missing, and rights-unknown items stay visible instead of being treated as production-ready.",
  },
  {
    question: "Does this save my creative library?",
    answer:
      "No. The inventory stays in this browser session. Download the CSV or Markdown version if you want to keep it.",
  },
];

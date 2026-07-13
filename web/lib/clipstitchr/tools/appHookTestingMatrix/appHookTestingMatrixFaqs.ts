import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const appHookTestingMatrixFaqs: ToolFaq[] = [
  {
    question: "Why does the matrix change only one variable?",
    answer:
      "Changing one thing at a time makes the comparison easier to interpret. The first stage changes hooks; the follow-up stage changes visuals after you pick a hook.",
  },
  {
    question: "Does this run the tests for me?",
    answer:
      "No. It creates the test cells and keeps the CTA, audience, and offer visible. It does not make ads, spend money, publish campaigns, or track results.",
  },
  {
    question: "How many ideas can I include?",
    answer:
      "The matrix uses up to five unique hooks and three unique visuals so the plan stays controlled and practical.",
  },
];

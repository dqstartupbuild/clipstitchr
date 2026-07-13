import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const appAdCreativeTestingBlueprintFaqs: ToolFaq[] = [
  {
    question: "How is this different from the Creative Test Plan Generator?",
    answer:
      "The Test Plan Generator schedules available variants in three production waves. This blueprint defines the hypotheses, controls, evidence rules, and asset gaps that should guide those variants before scheduling begins.",
  },
  {
    question: "Does the blueprint recommend an ad budget?",
    answer:
      "No. If you enter a budget and your own minimum spend per variant, the tool only calculates how many cells fit that assumption. It does not supply a benchmark or recommend spend.",
  },
  {
    question: "Will this choose a winning creative?",
    answer:
      "No. The blueprint gives you fair comparison rules and a decision rubric. Your team still reviews real campaign evidence and makes the decision.",
  },
  {
    question: "Does ClipStitchr produce the blueprint's ads for free?",
    answer:
      "No. This free tool prepares the testing strategy. ClipStitchr is a paid production workflow for organizing source clips and turning focused UGC and product-demo combinations into finished ads.",
  },
];

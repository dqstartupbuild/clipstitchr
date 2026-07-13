import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const appAdBreakEvenFaqs: ToolFaq[] = [
  {
    question: "What does contribution margin mean here?",
    answer:
      "It is the share of customer revenue left after the app-store fees, refunds, servicing costs, and other variable costs you choose to include. The calculator does not estimate that percentage for you.",
  },
  {
    question: "Why does the calculator include creative production cost?",
    answer:
      "Creative is part of the money the campaign needs to recover. Including it keeps the break-even customer and revenue targets from looking artificially low.",
  },
  {
    question: "What does maximum blended CAC mean?",
    answer:
      "It is the contribution value from one paying customer. At break-even, the combined media and entered creative cost per acquired customer cannot be higher than that amount.",
  },
  {
    question: "Is this a forecast or a recommendation to spend?",
    answer:
      "No. It is arithmetic based on your assumptions. It does not predict attribution, retention, conversion, cash flow, or ad performance.",
  },
];

import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const clientContentCapacityFaqs: ToolFaq[] = [
  {
    question: "Is this a staffing guarantee?",
    answer:
      "No. It is a capacity model based on your entered hours and average effort. Real projects still vary in complexity and delays.",
  },
  {
    question: "Why use productive-time percentage?",
    answer:
      "It keeps meetings, handoffs, admin work, and interruptions from being treated as production time. Use your own observed percentage.",
  },
  {
    question: "What does limiting stage mean?",
    answer:
      "It is the entered stage with the lowest modeled weekly output. It identifies the current constraint but does not prescribe a hiring decision.",
  },
];

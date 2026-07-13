import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const appAdHookGraderFaqs: ToolFaq[] = [
  {
    question: "Does a high score mean my app ad will perform well?",
    answer:
      "No. The score checks the writing against transparent craft rules. It cannot predict views, clicks, installs, or sales.",
  },
  {
    question: "Does ClipStitchr save the hook I grade?",
    answer:
      "No. Grading happens in your browser, and the hook and context are not sent to a grading API.",
  },
  {
    question: "Why does the grader flag claims?",
    answer:
      "Numbers, guarantees, authority claims, and sensitive outcomes need support. A flag is a reminder to review the wording, not legal advice.",
  },
];

import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const clipNamingSystemFaqs: ToolFaq[] = [
  {
    answer:
      "No. It creates text you can copy. It never reads, renames, moves, or stores a file.",
    question: "Will this rename my clips?",
  },
  {
    answer:
      "It removes characters that commonly break filenames, turns spaces into your selected separator, removes repeated separators, and supplies an untitled fallback for an empty token.",
    question: "What does sanitized mean here?",
  },
  {
    answer:
      "Use the arrow buttons to put the details your team scans most often near the front. Keep the same order across creators and campaigns so filenames stay predictable.",
    question: "How should I order the tokens?",
  },
];

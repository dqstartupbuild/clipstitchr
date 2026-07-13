import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const creativeTestingTrackerFaqs: ToolFaq[] = [
  {
    question: "Does this connect to TikTok or Meta?",
    answer:
      "No. Every row stays in this browser session, and the tracker calculates only from the numbers you type.",
  },
  {
    question: "Why does a metric say unavailable?",
    answer:
      "The formula needs a non-zero denominator. For example, CTR needs impressions and CPI needs installs. The row tells you exactly what is missing.",
  },
  {
    question: "Can I keep the tracker?",
    answer:
      "Yes. Download the current rows as CSV for a spreadsheet or Markdown for a readable testing note before you leave the page.",
  },
];

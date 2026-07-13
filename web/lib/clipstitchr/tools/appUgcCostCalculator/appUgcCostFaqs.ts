import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const appUgcCostFaqs: ToolFaq[] = [
  {
    question: "What does the app UGC cost estimate include?",
    answer:
      "It includes the creator fees, editing time, revision cost, and internal team time you enter. It also shows cost per raw clip, cost per finished variant, and the creator spend tied to your estimated unused footage.",
  },
  {
    question: "Does the calculator use creator-rate benchmarks?",
    answer:
      "No. Every dollar amount comes from your inputs. The tool does not guess a market rate, recommend what to pay, or promise savings.",
  },
  {
    question: "Is unused-footage cost added twice?",
    answer:
      "No. Unused-footage cost is a portion of creator spend shown for context. It is not added again to the production total.",
  },
  {
    question: "What costs are not included?",
    answer:
      "The estimate leaves out ad spend, usage or licensing fees, reshoots, taxes, software, and any other cost you do not enter. Treat the result as a production subtotal, not a full campaign budget.",
  },
];

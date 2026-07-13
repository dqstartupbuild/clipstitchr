import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const adVariantCalculatorFaqs: ToolFaq[] = [
  {
    question: "What is an ad variant?",
    answer:
      "An ad variant is one version of an ad with a specific UGC clip, product demo, hook, and call to action. Changing any one of those pieces creates another version you can test.",
  },
  {
    question: "How does the ad variant calculator work?",
    answer:
      "It multiplies your UGC clips by your product demos to find footage pairings, then multiplies those pairings by your hooks and calls to action to show the full set of possible tests.",
  },
  {
    question: "Should I make every possible ad combination?",
    answer:
      "Usually not. Start with one demo, one hook, and one call to action across several UGC openings. Once one opening wins, change the hook, demo, or call to action one at a time.",
  },
  {
    question: "Why does the practical first batch stop at 20 UGC clips?",
    answer:
      "Stitchr supports selecting up to 20 UGC clips with one demo in a batch. Each selected UGC clip produces its own finished Stitch, so the smaller number reflects a real production step instead of the full theoretical total.",
  },
];

import { adTeardownItems } from "@/lib/clipstitchr/tools/adTeardownLibrary/adTeardownItems";
import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";

export const adTeardownLibraryDefinition: CollectionResourceDefinition = {
  emptyMessage:
    "No teardown matches that search yet. Try another category or creative pattern.",
  faqs: [
    {
      question: "Are these real winning ads?",
      answer:
        "No. They are original synthetic teaching examples built to demonstrate careful creative analysis. They include no performance claim and copy no advertiser's media or full ad.",
    },
    {
      question: "Can I copy the hooks and ads exactly?",
      answer:
        "Use the abstract pattern, then write an original execution grounded in your own audience, product action, and supportable proof. Do not copy another brand's creative identity.",
    },
  ],
  guideParagraphs: [
    "Filter by app category or search for a hook, proof, pacing, or funnel pattern. Each teardown names what the hypothetical creative shows and what it cannot prove.",
    "Copy the analysis when you want a compact reference, then extract only the abstract sequence. Your own hook, visuals, product action, proof, and CTA should come from your app.",
    "No record in this library is a performance benchmark. Its job is to make creative structure easier to see before you plan an original test.",
  ],
  guideTitle: "Study the structure without copying the execution.",
  items: adTeardownItems,
  resourceKey: "app-ad-teardown-library",
  searchPlaceholder: "Search hooks, proof, pacing, or patterns",
};

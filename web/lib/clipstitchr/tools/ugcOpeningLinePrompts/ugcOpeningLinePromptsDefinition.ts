import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";
import { ugcOpeningLinePrompts } from "@/lib/clipstitchr/tools/ugcOpeningLinePrompts/ugcOpeningLinePrompts";
import { ugcOpeningLinePromptsFaqs } from "@/lib/clipstitchr/tools/ugcOpeningLinePrompts/ugcOpeningLinePromptsFaqs";

export const ugcOpeningLinePromptsDefinition: CollectionResourceDefinition = {
  emptyMessage:
    "No prompt cards match that search. Try problem, surprise, objection, demo, confession, or outcome.",
  faqs: ugcOpeningLinePromptsFaqs,
  guideParagraphs: [
    "Give the creator a prompt instead of a sentence to memorize. A natural answer usually sounds more believable and gives the editor more usable choices.",
    "Record the main prompt and its alternate as separate clips. Keep a clean pause before and after each take, then capture the demo or supporting visual as its own file.",
    "These cards help with source capture only. ClipStitchr remains the paid place to organize those takes and assemble finished app ads.",
  ],
  guideTitle: "Capture natural openings without handing over a rigid script.",
  items: ugcOpeningLinePrompts,
  resourceKey: "ugc-opening-line-prompt-cards",
  searchPlaceholder: "Search a feeling, delivery, or situation...",
};

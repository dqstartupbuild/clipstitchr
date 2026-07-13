import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";
import { appAdHookStructures } from "@/lib/clipstitchr/tools/appAdHookStructures/appAdHookStructures";
import { appAdHookStructuresFaqs } from "@/lib/clipstitchr/tools/appAdHookStructures/appAdHookStructuresFaqs";

export const appAdHookStructuresDefinition: CollectionResourceDefinition = {
  emptyMessage:
    "No frameworks match that search. Try the problem, demo, objection, or story category.",
  faqs: appAdHookStructuresFaqs,
  guideParagraphs: [
    "Start with the formula, not the example. The formula shows which pieces must be true; the example only demonstrates how those pieces can sound in a short opening.",
    "Use the opening visual to make the first claim easy to understand without extra explanation. Read the misuse warning and claim guardrail before adapting a framework to a sensitive category.",
    "The collection stops at planning. It does not create footage, store an idea library, or produce finished ads; those remain part of ClipStitchr's paid workflow.",
  ],
  guideTitle: "Turn a framework into one honest, filmable opening.",
  items: appAdHookStructures,
  resourceKey: "app-ad-hook-structures",
  searchPlaceholder: "Search a formula, intent, or warning...",
};

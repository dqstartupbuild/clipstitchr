import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";
import { appCategoryHookPacks } from "@/lib/clipstitchr/tools/appCategoryHookPacks/appCategoryHookPacks";
import { appCategoryHookPacksFaqs } from "@/lib/clipstitchr/tools/appCategoryHookPacks/appCategoryHookPacksFaqs";

export const appCategoryHookPacksDefinition: CollectionResourceDefinition = {
  emptyMessage:
    "No pack entries match that search. Try a category or a customer problem.",
  faqs: appCategoryHookPacksFaqs,
  guideParagraphs: [
    "Open the pack closest to your app, then choose a structure that matches what the demo can show. The brackets make the missing details obvious before you record anything.",
    "Read the category reminder on every card. It is not legal advice, but it helps you notice promises that need evidence, softer wording, or a different angle.",
    "The packs are intentionally finite and do not connect to ClipStitchr's larger Hook library. Use ClipStitchr's paid workflow when you are ready to organize source footage and produce the ads.",
  ],
  guideTitle: "Start with category context, then make the line yours.",
  items: appCategoryHookPacks,
  resourceKey: "app-category-hook-packs",
  searchPlaceholder: "Search fitness, finance, learning...",
};

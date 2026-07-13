import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import type { CollectionResourceItem } from "@/lib/clipstitchr/tools/resources/CollectionResourceItem";
import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export type CollectionResourceDefinition = {
  emptyMessage: string;
  faqs: ToolFaq[];
  guideParagraphs: readonly string[];
  guideTitle: string;
  items: readonly CollectionResourceItem[];
  resourceKey: PublicToolKey;
  searchPlaceholder: string;
};

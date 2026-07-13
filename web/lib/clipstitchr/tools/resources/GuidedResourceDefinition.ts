import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import type { GuidedResourceSection } from "@/lib/clipstitchr/tools/resources/GuidedResourceSection";
import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export type GuidedResourceDefinition = {
  completionLabel: string;
  estimatedMinutes: number;
  faqs: ToolFaq[];
  guideParagraphs: readonly string[];
  guideTitle: string;
  progressStorageKey?: string;
  resourceKey: PublicToolKey;
  sections: readonly GuidedResourceSection[];
};

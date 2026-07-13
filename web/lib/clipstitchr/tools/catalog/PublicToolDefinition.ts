import type { PublicToolCategory } from "@/lib/clipstitchr/tools/catalog/PublicToolCategory";
import type { PublicToolFormat } from "@/lib/clipstitchr/tools/catalog/PublicToolFormat";
import type { PublicToolIconKey } from "@/lib/clipstitchr/tools/catalog/PublicToolIconKey";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

export type PublicToolDefinition = {
  category: PublicToolCategory;
  changeFrequency: "weekly" | "monthly";
  description: string;
  eyebrow: string;
  format: PublicToolFormat;
  iconKey: PublicToolIconKey;
  key: PublicToolKey;
  keywords: string[];
  name: string;
  pathname: `/tools/${string}`;
  portfolioNumber: number;
  priority: number;
  relatedToolKeys: readonly PublicToolKey[];
  tiktokContentId: string;
};

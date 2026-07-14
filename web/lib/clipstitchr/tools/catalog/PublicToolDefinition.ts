import type { PublicToolCategory } from "./PublicToolCategory";
import type { PublicToolFormat } from "./PublicToolFormat";
import type { PublicToolIconKey } from "./PublicToolIconKey";
import type { PublicToolKey } from "./PublicToolKey";

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

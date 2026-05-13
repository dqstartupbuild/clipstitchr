import type { CustomerDocCategory } from "@/lib/clipstitchr/docs/CustomerDocCategory";
import type { CustomerDocSection } from "@/lib/clipstitchr/docs/CustomerDocSection";
import type { CustomerRateLimitGroup } from "@/lib/clipstitchr/docs/CustomerRateLimitGroup";

export type CustomerDocPage = {
  slug: string;
  title: string;
  description: string;
  summary: string;
  category: CustomerDocCategory;
  order: number;
  updated: string;
  sections: CustomerDocSection[];
  rateLimitGroups?: CustomerRateLimitGroup[];
};

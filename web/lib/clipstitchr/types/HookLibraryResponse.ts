import type { HookLibraryCategoryOption } from "@/lib/clipstitchr/types/HookLibraryCategoryOption";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";

export type HookLibraryResponse = {
  categories: HookLibraryCategoryOption[];
  items: HookLibraryTemplateSummary[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  triggers: string[];
};

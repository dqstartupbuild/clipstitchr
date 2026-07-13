import type { GuidedResourceItem } from "@/lib/clipstitchr/tools/resources/GuidedResourceItem";

export type GuidedResourceSection = {
  description: string;
  id: string;
  items: readonly GuidedResourceItem[];
  title: string;
};

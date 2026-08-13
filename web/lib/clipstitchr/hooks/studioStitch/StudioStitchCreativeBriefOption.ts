import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";

export type StudioStitchCreativeBriefOption = {
  id: string;
  source: "product" | "hookLab" | "lazyReel";
  title: string;
  note: string;
  brief: HookLabCreativeBriefContent;
};

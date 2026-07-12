import type { HookLabIdeaSourceType } from "@/lib/clipstitchr/types/HookLabIdeaSourceType";

export function getHookLabIdeaSourceLabel(sourceType: HookLabIdeaSourceType) {
  switch (sourceType) {
    case "generated_hook":
      return "Generated hook";
    case "migrated_template":
      return "Past Template";
    case "social_link":
      return "Public post";
    case "stitch":
      return "Past Stitch";
    default:
      return "Pasted text";
  }
}

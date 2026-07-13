import type { HookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchmakerInput";
import type { HookVisualOpeningSource } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualOpeningSource";

export function getHookVisualAlternateSource(
  input: HookVisualMatchmakerInput,
  primarySource: HookVisualOpeningSource,
): HookVisualOpeningSource {
  if (primarySource !== "ugc" && input.ugcFootage.trim()) return "ugc";
  if (primarySource !== "demo" && input.demoMoment.trim()) return "demo";

  return primarySource;
}

import type { HookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchmakerInput";
import type { HookVisualOpeningSource } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualOpeningSource";
import type { PublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/PublicHookIntent";

export function getHookVisualOpeningSource(
  input: HookVisualMatchmakerInput,
  intent: PublicHookIntent,
): HookVisualOpeningSource {
  const hasDemo = Boolean(input.demoMoment.trim());
  const hasUgc = Boolean(input.ugcFootage.trim());

  if (input.preferredOpening === "ugc" && hasUgc) return "ugc";
  if (input.preferredOpening === "demo" && hasDemo) return "demo";
  if (input.preferredOpening === "ugc" && hasDemo) return "demo";
  if (input.preferredOpening === "demo" && hasUgc) return "ugc";

  if (
    hasDemo &&
    ["comparison", "demonstration", "discovery", "outcome"].includes(intent)
  ) {
    return "demo";
  }

  if (hasUgc) return "ugc";
  if (hasDemo) return "demo";

  return "text-card";
}

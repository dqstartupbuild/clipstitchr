import type { HookVisualOpeningSource } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualOpeningSource";

const labels: Record<HookVisualOpeningSource, string> = {
  demo: "Demo opening",
  "text-card": "Text-card opening",
  ugc: "UGC opening",
};

export function getHookVisualOpeningSourceLabel(
  source: HookVisualOpeningSource,
) {
  return labels[source];
}

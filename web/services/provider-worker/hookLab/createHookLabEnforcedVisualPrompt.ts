import type { HookLabVariationDirection } from "@/lib/clipstitchr/types/HookLabVariationDirection";

export function createHookLabEnforcedVisualPrompt(
  generatedPrompt: string,
  variationDirection: HookLabVariationDirection,
) {
  return [
    `Required visual direction: ${variationDirection.visualDirection}`,
    generatedPrompt.trim(),
    "Keep this as one continuous vertical shot with no source identity, exact staging, text, watermark, logo, or copied branded object.",
  ]
    .filter(Boolean)
    .join(" ");
}

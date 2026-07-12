import type { Doc } from "../_generated/dataModel";

export function getHookLabTemplateOriginalText(
  template: Doc<"stitchTemplates">,
) {
  return (
    template.textOverlays?.find((overlay) => overlay.text.trim())?.text.trim() ??
    template.textOverlay?.text.trim() ??
    undefined
  );
}

type HookLabStitchTextSource = {
  textOverlay?: { text?: string };
  textOverlays?: { text?: string }[];
};

export function getHookLabStitchOriginalText(
  stitch: HookLabStitchTextSource | null | undefined,
) {
  return (
    stitch?.textOverlays?.find((overlay) => overlay.text?.trim())?.text?.trim() ||
    stitch?.textOverlay?.text?.trim() ||
    undefined
  );
}

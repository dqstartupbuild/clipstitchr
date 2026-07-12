const DEFAULT_HOOK_LAB_IMPORTED_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

export function getHookLabImportedVideoMaxBytes() {
  const configured = Number(process.env.HOOK_LAB_IMPORTED_VIDEO_MAX_BYTES);

  return Number.isSafeInteger(configured) && configured > 0
    ? Math.min(configured, DEFAULT_HOOK_LAB_IMPORTED_VIDEO_MAX_BYTES)
    : DEFAULT_HOOK_LAB_IMPORTED_VIDEO_MAX_BYTES;
}

const DEFAULT_HOOK_LAB_VIDEO_MAX_DURATION_SECONDS = 180;

export function assertHookLabVideoDuration(duration: number) {
  const configured = Number(process.env.HOOK_LAB_VIDEO_MAX_DURATION_SECONDS);
  const maxDuration =
    Number.isFinite(configured) && configured > 0
      ? Math.min(configured, DEFAULT_HOOK_LAB_VIDEO_MAX_DURATION_SECONDS)
      : DEFAULT_HOOK_LAB_VIDEO_MAX_DURATION_SECONDS;

  if (!Number.isFinite(duration) || duration <= 0 || duration > maxDuration) {
    throw new Error(
      `Hook Lab supports public videos up to ${Math.round(maxDuration)} seconds.`,
    );
  }
}

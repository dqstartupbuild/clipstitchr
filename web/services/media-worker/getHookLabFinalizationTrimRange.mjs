export function getHookLabFinalizationTrimRange(value, duration) {
  const start =
    value && Number.isFinite(value.start)
      ? Math.max(0, Math.min(duration, value.start))
      : 0;
  const end =
    value && Number.isFinite(value.end)
      ? Math.max(start, Math.min(duration, value.end))
      : duration;

  return { start, end };
}

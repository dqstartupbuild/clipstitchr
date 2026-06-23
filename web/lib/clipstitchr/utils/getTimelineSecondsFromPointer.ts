import { clamp } from "@/lib/clipstitchr/utils/clamp";

type GetTimelineSecondsFromPointerOptions = {
  clientX: number;
  duration: number;
  left: number;
  width: number;
};

export function getTimelineSecondsFromPointer({
  clientX,
  duration,
  left,
  width,
}: GetTimelineSecondsFromPointerOptions) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;

  if (!safeDuration || !safeWidth) {
    return 0;
  }

  const progress = clamp((clientX - left) / safeWidth, 0, 1);

  return progress * safeDuration;
}

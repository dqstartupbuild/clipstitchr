import type { QuickEditSilenceRange } from "@/lib/clipstitchr/types/QuickEditSilenceRange";

export function parseQuickEditSilenceRanges(stderr: string) {
  const ranges: QuickEditSilenceRange[] = [];
  let currentStart: number | null = null;

  for (const line of stderr.split("\n")) {
    const startMatch = /silence_start:\s*([0-9.]+)/.exec(line);

    if (startMatch) {
      currentStart = Number(startMatch[1]);
      continue;
    }

    const endMatch =
      /silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)/.exec(
        line,
      );

    if (!endMatch || currentStart === null) {
      continue;
    }

    const end = Number(endMatch[1]);
    const duration = Number(endMatch[2]);

    if (Number.isFinite(end) && Number.isFinite(duration) && end > currentStart) {
      ranges.push({
        duration,
        end,
        start: currentStart,
      });
    }

    currentStart = null;
  }

  return ranges;
}

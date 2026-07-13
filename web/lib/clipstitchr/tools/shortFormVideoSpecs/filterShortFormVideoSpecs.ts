import type { ShortFormVideoPlatform } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/ShortFormVideoPlatform";
import type { ShortFormVideoSpecRecord } from "@/lib/clipstitchr/tools/shortFormVideoSpecs/ShortFormVideoSpecRecord";

export function filterShortFormVideoSpecs(
  records: readonly ShortFormVideoSpecRecord[],
  platform: ShortFormVideoPlatform | "All",
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return records.filter((record) => {
    if (platform !== "All" && record.platform !== platform) return false;
    if (!normalizedQuery) return true;

    return [
      record.platform,
      record.placement,
      record.ratio,
      record.dimensions,
      record.duration,
      record.containers,
      record.codec,
      record.frameRate,
      record.audio,
      ...record.practicalNotes,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
}

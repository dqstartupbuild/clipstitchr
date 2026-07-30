import { readNonnegativeSocialMetric } from "./readNonnegativeSocialMetric";
import { readUnknownRecord } from "./readUnknownRecord";

export function readTikTokSaveCounts(items: unknown[]) {
  const savesByExternalId = new Map<string, number>();

  for (const item of items) {
    const record = readUnknownRecord(item);
    const stats = readUnknownRecord(record?.stats);
    const statistics = readUnknownRecord(record?.statistics);
    const externalIdCandidates = [
      record?.id,
      record?.postId,
      record?.aweme_id,
      record?.awemeId,
    ];
    const externalId = externalIdCandidates.find(
      (value) =>
        (typeof value === "string" || typeof value === "number") &&
        Boolean(String(value)),
    );
    const saveCandidates = [
      record?.collectCount,
      record?.bookmarkCount,
      record?.savedCount,
      stats?.collectCount,
      stats?.bookmarkCount,
      statistics?.collectCount,
      statistics?.bookmarkCount,
    ];
    const saves = saveCandidates
      .map(readNonnegativeSocialMetric)
      .find((value) => value !== undefined);

    if (externalId !== undefined && saves !== undefined) {
      savesByExternalId.set(String(externalId), saves);
    }
  }

  return savesByExternalId;
}

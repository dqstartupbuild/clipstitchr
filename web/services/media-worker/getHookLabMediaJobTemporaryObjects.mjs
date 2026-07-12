import { getHookLabFinalizationR2Object } from "./getHookLabFinalizationR2Object.mjs";

export function getHookLabMediaJobTemporaryObjects(job) {
  if (job?.jobType !== "hook-lab-variant-finalization") {
    return [];
  }

  const ownerId = typeof job.ownerId === "string" ? job.ownerId.trim() : "";

  if (!ownerId) {
    return [];
  }

  const expectedPrefix = `users/${encodeURIComponent(ownerId)}/`;

  let input;

  try {
    input = JSON.parse(job.inputSnapshotJson);
  } catch {
    return [];
  }

  if (!input || typeof input !== "object" || !Array.isArray(input.temporaryObjects)) {
    return [];
  }

  return input.temporaryObjects.flatMap((value) => {
    try {
      const object = getHookLabFinalizationR2Object(value, "temporary object");

      return object.key.startsWith(expectedPrefix) ? [object] : [];
    } catch {
      return [];
    }
  });
}

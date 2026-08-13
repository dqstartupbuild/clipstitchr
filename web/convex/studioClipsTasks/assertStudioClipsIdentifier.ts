import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "./studioClipsPersistenceLimits";

export function assertStudioClipsIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (
    normalized.length === 0 ||
    normalized.length > STUDIO_CLIPS_PERSISTENCE_LIMITS.identifierCharacters ||
    !/^[A-Za-z0-9:_-]+$/.test(normalized)
  ) {
    throw new Error(`${label} is invalid.`);
  }
  return normalized;
}

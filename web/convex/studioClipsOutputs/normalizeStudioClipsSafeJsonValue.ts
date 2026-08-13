import type { StudioClipsJsonValue } from "../../lib/clipstitchr/types/studioClips/StudioClipsJsonValue";

const prohibitedKey =
  /^(?:authorization|password|secret|api[_-]?key|access[_-]?key|access[_-]?token|refresh[_-]?token|auth[_-]?token|signed[_-]?url|credential|signature)$/i;

const prohibitedValue =
  /(?:https?:\/\/|bearer\s+[a-z0-9._~-]{12,}|[?&](?:x-amz-[^=&]+|x-goog-[^=&]+|token|signature|credential)=|\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|secret|credential|signature)\s*[:=]\s*\S+)/i;

export function normalizeStudioClipsSafeJsonValue(
  value: unknown,
  state: { nodes: number },
  depth: number,
): StudioClipsJsonValue {
  state.nodes += 1;
  if (state.nodes > 5_000 || depth > 20) {
    throw new Error("The Studio Clips JSON snapshot is too complex.");
  }
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      throw new Error("Snapshot numbers must be finite.");
    return value;
  }
  if (typeof value === "string") {
    if (value.length > 8_192 || prohibitedValue.test(value)) {
      throw new Error("The Studio Clips JSON snapshot contains unsafe text.");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      normalizeStudioClipsSafeJsonValue(item, state, depth + 1),
    );
  }
  if (typeof value === "object") {
    const result: Record<string, StudioClipsJsonValue> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      if (key.length === 0 || key.length > 160 || prohibitedKey.test(key)) {
        throw new Error(
          "The Studio Clips JSON snapshot contains an unsafe key.",
        );
      }
      result[key] = normalizeStudioClipsSafeJsonValue(
        (value as Record<string, unknown>)[key],
        state,
        depth + 1,
      );
    }
    return result;
  }
  throw new Error(
    "The Studio Clips JSON snapshot contains an unsupported value.",
  );
}

import { assertStudioLazyReelBoundedString } from "./assertStudioLazyReelBoundedString";
import { assertStudioLazyReelJsonValueIsSafe } from "./assertStudioLazyReelJsonValueIsSafe";
import { getStudioLazyReelUtf8ByteLength } from "./getStudioLazyReelUtf8ByteLength";

export function normalizeStudioLazyReelJsonSnapshot(
  snapshot: { schemaVersion: string; payloadJson: string },
  options: { label: string; maxBytes: number },
) {
  const schemaVersion = assertStudioLazyReelBoundedString(
    snapshot.schemaVersion,
    { label: `${options.label} schema version`, maxLength: 80 },
  );
  let parsed: unknown;

  try {
    parsed = JSON.parse(snapshot.payloadJson) as unknown;
  } catch {
    throw new Error(`${options.label} must contain valid JSON.`);
  }

  assertStudioLazyReelJsonValueIsSafe(parsed, options.label);

  const payloadJson = JSON.stringify(parsed);
  const byteLength = getStudioLazyReelUtf8ByteLength(payloadJson);

  if (byteLength > options.maxBytes) {
    throw new Error(`${options.label} exceeds its ${options.maxBytes}-byte cap.`);
  }

  return { schemaVersion, payloadJson, byteLength };
}

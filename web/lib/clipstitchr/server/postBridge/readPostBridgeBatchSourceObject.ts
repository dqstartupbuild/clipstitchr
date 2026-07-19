import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export function readPostBridgeBatchSourceObject(
  value: unknown,
): R2ObjectReference {
  const source = value as Record<string, unknown> | null;

  if (
    !source ||
    typeof source.key !== "string" ||
    typeof source.contentType !== "string" ||
    typeof source.size !== "number" ||
    !Number.isFinite(source.size) ||
    source.size <= 0
  ) {
    throw new Error("Unable to load the rendered media upload.");
  }

  return {
    contentType: source.contentType,
    key: source.key,
    size: Math.ceil(source.size),
  };
}

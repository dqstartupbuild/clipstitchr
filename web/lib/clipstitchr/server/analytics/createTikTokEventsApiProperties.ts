import type { TikTokEventPayload } from "@/lib/clipstitchr/analytics/TikTokEventPayload";

const propertyKeys = [
  "contents",
  "currency",
  "query",
  "search_string",
  "value",
] as const;

function getIsRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getSanitizedContent(value: unknown) {
  if (!getIsRecord(value)) {
    return null;
  }

  const content: Record<string, string> = {};

  for (const key of [
    "brand",
    "content_category",
    "content_id",
    "content_name",
    "content_type",
  ]) {
    const fieldValue = value[key];

    if (typeof fieldValue === "string" && fieldValue.trim()) {
      content[key] = fieldValue.trim().slice(0, 200);
    }
  }

  return Object.keys(content).length > 0 ? content : null;
}

export function createTikTokEventsApiProperties(
  payload?: TikTokEventPayload,
) {
  if (!payload) {
    return undefined;
  }

  const properties: Record<string, unknown> = {};

  for (const key of propertyKeys) {
    const value = payload[key];

    if (key === "contents" && Array.isArray(value)) {
      const contents = value
        .slice(0, 10)
        .map(getSanitizedContent)
        .filter((content): content is Record<string, string> => Boolean(content));

      if (contents.length > 0) {
        properties.contents = contents;
      }
    } else if (
      (key === "currency" || key === "query" || key === "search_string") &&
      typeof value === "string" &&
      value.trim()
    ) {
      properties[key] = value.trim().slice(0, key === "currency" ? 3 : 200);
    } else if (
      key === "value" &&
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      properties.value = value;
    }
  }

  if (!properties.query && typeof properties.search_string === "string") {
    properties.query = properties.search_string;
  }

  return Object.keys(properties).length > 0 ? properties : undefined;
}

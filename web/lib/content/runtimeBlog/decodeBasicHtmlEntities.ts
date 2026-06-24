const htmlEntityMap: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&#39;": "'",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
};

export function decodeBasicHtmlEntities(value: string) {
  return value.replace(
    /&(amp|apos|quot|lt|gt);|&#39;/g,
    (entity) => htmlEntityMap[entity] ?? entity,
  );
}

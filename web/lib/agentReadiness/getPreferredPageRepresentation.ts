export type PageRepresentation = "html" | "markdown";

export function getPreferredPageRepresentation(
  accept: string | null,
  available: readonly PageRepresentation[] = ["html", "markdown"],
): PageRepresentation | null {
  if (!accept || accept.trim() === "") {
    return available.includes("html") ? "html" : (available[0] ?? null);
  }

  const entries = accept.split(",").map((raw, position) => {
    const [rawType = "", ...parameters] = raw
      .trim()
      .toLowerCase()
      .split(";")
      .map((part) => part.trim());
    const qParameter = parameters.find((parameter) =>
      parameter.startsWith("q="),
    );
    const parsedQuality = qParameter
      ? Number(qParameter.slice(2))
      : 1;
    const quality =
      Number.isFinite(parsedQuality) &&
      parsedQuality >= 0 &&
      parsedQuality <= 1
        ? parsedQuality
        : 0;
    const specificity = rawType === "*/*" ? 0 : rawType.endsWith("/*") ? 1 : 2;

    return { position, quality, specificity, type: rawType };
  });

  let preferred: PageRepresentation | null = null;
  let preferredPosition = Number.POSITIVE_INFINITY;
  let preferredQuality = -1;

  for (const representation of available) {
    const mediaType =
      representation === "markdown" ? "text/markdown" : "text/html";
    let matchingEntry:
      | (typeof entries)[number]
      | undefined;

    for (const entry of entries) {
      const matches =
        entry.type === mediaType ||
        entry.type === "text/*" ||
        entry.type === "*/*";

      if (
        matches &&
        (!matchingEntry ||
          entry.specificity > matchingEntry.specificity ||
          (entry.specificity === matchingEntry.specificity &&
            entry.position < matchingEntry.position))
      ) {
        matchingEntry = entry;
      }
    }

    if (!matchingEntry || matchingEntry.quality <= 0) {
      continue;
    }

    if (
      matchingEntry.quality > preferredQuality ||
      (matchingEntry.quality === preferredQuality &&
        matchingEntry.position < preferredPosition)
    ) {
      preferred = representation;
      preferredPosition = matchingEntry.position;
      preferredQuality = matchingEntry.quality;
    }
  }

  return preferred;
}

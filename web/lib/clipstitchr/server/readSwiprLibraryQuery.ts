import { normalizeSwiprLibraryQueryName } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryName";

export function readSwiprLibraryQuery(value: unknown) {
  const query =
    typeof value === "string" ? normalizeSwiprLibraryQueryName(value) : "";

  if (!query) {
    throw new Error("Enter a photo search first.");
  }

  return query;
}

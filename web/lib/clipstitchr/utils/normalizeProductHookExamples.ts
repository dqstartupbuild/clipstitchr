import {
  productHookExampleLimit,
  productHookExampleMaxLength,
} from "@/lib/clipstitchr/constants/productHookMemoryLimits";

export function normalizeProductHookExamples(values?: string[]) {
  return Array.from(
    new Set(
      (values ?? []).map((value) =>
        value.trim().replace(/\s+/g, " ").slice(0, productHookExampleMaxLength),
      ),
    ),
  )
    .filter(Boolean)
    .slice(0, productHookExampleLimit);
}

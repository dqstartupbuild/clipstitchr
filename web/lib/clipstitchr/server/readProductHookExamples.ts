import { normalizeProductHookExamples } from "@/lib/clipstitchr/utils/normalizeProductHookExamples";

export function readProductHookExamples(value: unknown) {
  if (Array.isArray(value)) {
    return normalizeProductHookExamples(
      value.map((entry) => (typeof entry === "string" ? entry : "")),
    );
  }

  if (typeof value === "string") {
    return normalizeProductHookExamples(value.split(/\r?\n/g));
  }

  return [];
}

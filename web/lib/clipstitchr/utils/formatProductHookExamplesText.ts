import { normalizeProductHookExamples } from "@/lib/clipstitchr/utils/normalizeProductHookExamples";

export function formatProductHookExamplesText(values?: string[]) {
  return normalizeProductHookExamples(values).join("\n");
}

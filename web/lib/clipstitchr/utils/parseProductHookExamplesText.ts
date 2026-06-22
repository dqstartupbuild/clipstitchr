import { normalizeProductHookExamples } from "@/lib/clipstitchr/utils/normalizeProductHookExamples";

export function parseProductHookExamplesText(value: string) {
  return normalizeProductHookExamples(value.split(/\r?\n/g));
}

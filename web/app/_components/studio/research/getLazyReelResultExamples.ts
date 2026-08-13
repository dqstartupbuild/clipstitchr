import type { LazyReelExample } from "@/lib/clipstitchr/types/lazyreel/LazyReelExample";

export function getLazyReelResultExamples(data: unknown): LazyReelExample[] {
  if (!data || typeof data !== "object" || !("examples" in data)) {
    return [];
  }

  if (!Array.isArray(data.examples)) {
    return [];
  }

  return data.examples.filter(
    (example): example is LazyReelExample =>
      Boolean(example) &&
      typeof example === "object" &&
      "url" in example &&
      typeof example.url === "string" &&
      "hookPattern" in example &&
      typeof example.hookPattern === "string" &&
      "framework" in example &&
      typeof example.framework === "string",
  );
}

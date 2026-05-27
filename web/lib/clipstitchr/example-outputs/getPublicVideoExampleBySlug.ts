import { publicVideoExamples } from "@/lib/clipstitchr/example-outputs/publicVideoExamples";

export function getPublicVideoExampleBySlug(slug: string) {
  return publicVideoExamples.find((example) => example.slug === slug) ?? null;
}

import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type CreateCliprDemoVisualPromptOptions = {
  demoClipName: string;
  demoVideoDescription?: string;
  product: ProductProfile;
};

export function createCliprDemoVisualPrompt({
  demoClipName,
  demoVideoDescription,
  product,
}: CreateCliprDemoVisualPromptOptions) {
  return [
    "Create one silent vertical UGC-style demo remix from [Video1].",
    "Use [Video1] as the product demo reference and preserve the important screen flow as much as possible.",
    "Place the demo naturally on a modern phone screen held in someone's hand.",
    "Use one continuous real-world shot with subtle handheld motion.",
    "Keep the phone screen readable and centered enough to understand the demo.",
    "Do not add dialogue, captions, subtitles, logos, extra UI, or on-screen text outside the referenced demo.",
    "Do not turn it into a montage, tutorial, talking-head video, or unrelated lifestyle scene.",
    `Product: ${product.name}`,
    `Product context: ${product.productDetails}`,
    `Audience: ${product.audienceDetails}`,
    product.inferredProblem ? `Audience problem: ${product.inferredProblem}` : "",
    product.inferredPainPoints.length
      ? `Pain points: ${product.inferredPainPoints.join("; ")}`
      : "",
    `Demo source name: ${demoClipName}`,
    demoVideoDescription
      ? `Demo source description: ${demoVideoDescription}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function createProductEnrichmentPrompt({
  audienceDetails,
  name,
  productDetails,
}: {
  audienceDetails: string;
  name: string;
  productDetails: string;
}) {
  return [
    "Infer hidden strategic metadata for this saved product profile.",
    "Return only compact JSON with this exact shape:",
    '{"inferredProblem":"one sentence","inferredPainPoints":["pain point","pain point","pain point"]}',
    "Use 3 to 6 concise pain points. Do not invent regulated claims, pricing, guarantees, or unsupported facts.",
    `Product name: ${name.trim()}`,
    `Product details: ${productDetails.trim()}`,
    `Audience details: ${audienceDetails.trim()}`,
  ].join("\n");
}

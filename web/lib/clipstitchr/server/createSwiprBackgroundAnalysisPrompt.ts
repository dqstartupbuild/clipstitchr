export function createSwiprBackgroundAnalysisPrompt(originalName: string) {
  return [
    "Analyze this carousel background image for a shared marketing background library.",
    `Original file name: ${originalName || "unknown"}.`,
    "Return compact JSON only with this exact shape:",
    '{"name":"short descriptive title","tags":["tag one","tag two"],"description":"plain-language description of the background","details":"searchable visual details covering setting, subject matter, composition, colors, texture, lighting, mood, available copy space, and product/category fit"}',
    "Use a clear title of 2 to 6 words with no file extension.",
    "Use 3 to 8 lowercase tags for visible content, setting, style, mood, colors, or useful product/category contexts.",
    "For description, summarize the background as a reusable carousel backdrop.",
    "For details, include concrete visual information that would help search and future background selection.",
    "Do not guess private identity, demographics, brands, pricing, claims, or sensitive traits.",
  ].join("\n");
}

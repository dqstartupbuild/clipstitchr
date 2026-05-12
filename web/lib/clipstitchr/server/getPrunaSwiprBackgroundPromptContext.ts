const PRUNA_BACKGROUND_CONTEXT_TRIGGER_PATTERN =
  /\b(tiktok|carousel|ad|ads|advertisement|advertising|app|application|iphone|phone|smartphone|device|devices|screen|ui|interface|mockup|mockups|layout|layouts|social|media|caption|captions|text|copy|typography|logo|website|webpage|page)\b/gi;

export function getPrunaSwiprBackgroundPromptContext(context: string) {
  return context
    .replace(PRUNA_BACKGROUND_CONTEXT_TRIGGER_PATTERN, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, 1200);
}

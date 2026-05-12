const CLIPR_SEEDANCE_TEXT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bhome gym\b/gi, "bright living room"],
  [/\bgym\b/gi, "living room"],
  [/\bexercise mat\b/gi, "small side table"],
  [/\bworkouts?\b/gi, "daily routines"],
  [/\bfitness\b/gi, "daily planning"],
  [/\bbeginner routine\b/gi, "starter plan"],
  [/\bresults you can see\b/gi, "clearer progress over time"],
  [/\bvisible results\b/gi, "clearer progress"],
  [/\bbody\b/gi, "routine"],
  [/\bweight loss\b/gi, "habit change"],
  [/\bcalories\b/gi, "details"],
  [/\bdiet\b/gi, "daily plan"],
  [/\bmuscle\b/gi, "momentum"],
];

export function sanitizeCliprSeedanceText(text: string) {
  return CLIPR_SEEDANCE_TEXT_REPLACEMENTS.reduce(
    (safeText, [pattern, replacement]) =>
      safeText.replace(pattern, replacement),
    text,
  ).replace(/\s+/g, " ").trim();
}

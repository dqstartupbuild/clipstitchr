import type { PublicHookClaimSignal } from "@/lib/clipstitchr/tools/publicHooks/PublicHookClaimSignal";

export function findPublicHookClaimSignals(value: string) {
  const signals: PublicHookClaimSignal[] = [];

  if (
    /(?:[$€£]|\b\d{1,3}(?:,\d{3})+\b|\b\d+(?:\.\d+)?\s?%|\b\d+(?:\.\d+)?\s?(?:days?|downloads?|hours?|installs?|minutes?|months?|seconds?|times?|users?|weeks?|x|years?)\b)/i.test(
      value,
    )
  ) {
    signals.push({
      kind: "numeric",
      message: "A number or measurable result needs visible, accurate support.",
    });
  }

  if (
    /\b(?:always|best|effortless|every time|guaranteed|instantly|never|no work|perfect|works for everyone)\b/i.test(
      value,
    )
  ) {
    signals.push({
      kind: "absolute",
      message: "An absolute promise may be stronger than the available proof.",
    });
  }

  if (
    /\b(?:#1|award[- ]winning|data (?:proves|shows)|doctors?|experts?|research shows|study (?:proves|shows)|trusted by|users? agree)\b/i.test(
      value,
    )
  ) {
    signals.push({
      kind: "authority",
      message: "Authority or social-proof wording needs a source you can show.",
    });
  }

  if (
    /\b(?:credit score|cure|debt[- ]free|diagnos(?:e|es|is)|investment returns?|lose weight|medical|treat(?:s|ment)?|weight loss)\b/i.test(
      value,
    )
  ) {
    signals.push({
      kind: "regulated",
      message: "This outcome deserves careful human review and clear support.",
    });
  }

  return signals;
}

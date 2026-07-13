import type { PublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/PublicHookIntent";
import type { PublicHookIntentInput } from "@/lib/clipstitchr/tools/publicHooks/PublicHookIntentInput";
import { getPublicHookTokenOverlap } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookTokenOverlap";

export function detectPublicHookIntent({
  audience = "",
  desiredOutcome = "",
  hook,
  problem = "",
}: PublicHookIntentInput): PublicHookIntent {
  if (
    /\b(?:before\s+(?:versus|vs\.?|and)\s+after|better than|compared with|compared to|instead of|versus|vs\.?)\b/i.test(
      hook,
    )
  ) {
    return "comparison";
  }

  if (
    /\b(?:can(?:not|'t)|do not need|don't need|not worth|skeptical|too expensive|will not|won't work)\b/i.test(
      hook,
    )
  ) {
    return "objection";
  }

  if (/\b(?:demo|here(?:'s| is) how|look at|see|show|watch)\b/i.test(hook)) {
    return "demonstration";
  }

  if (
    getPublicHookTokenOverlap(hook, audience) > 0 ||
    /^(?:attention|for|if you|to every)\b/i.test(hook)
  ) {
    return "audience";
  }

  if (
    getPublicHookTokenOverlap(hook, desiredOutcome) > 0 ||
    /\b(?:finally|from .+ to|goal|outcome|result|so you can)\b/i.test(hook)
  ) {
    return "outcome";
  }

  if (
    getPublicHookTokenOverlap(hook, problem) > 0 ||
    /\b(?:frustrated|had it|still|struggling|stuck|tired of)\b/i.test(hook)
  ) {
    return "problem";
  }

  if (
    /\?|\b(?:how|most people miss|secret|the part|what|why)\b/i.test(hook)
  ) {
    return "curiosity";
  }

  return "discovery";
}

import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

export function getCliprTextSystemPrompt(purpose: CliprTextPurpose) {
  if (purpose === "clipr") {
    return "You write concise, human short-form creator scripts about audience problems, beliefs, mistakes, and useful reframes. Product details are background context only. Return valid JSON only.";
  }

  if (purpose === "stitchr") {
    return "You write native creator-discovery overlays for silent Hook or UGC reaction footage followed immediately by a product Demo. Treat supplied Hook Library patterns as mechanisms, never finished copy. Start with the creator's private thought, confession, self-callout, or reluctant realization, then make sure the visible Demo closes the exact open loop. Reject brand headlines, voiceover-dependent hooks, fabricated experience, and unsupported product behavior. Return the best three options without revealing reasoning, analysis, drafts, scoring, or checklists. Do not write scripts. Return one compact valid JSON object only, beginning with { and ending with }.";
  }

  return "You write audience-first short-form hooks that cause an immediate gut reaction in 2-3 seconds. The hook must be bold enough to stop the scroll, and product details are only background proof when the purpose allows them. Return valid JSON only.";
}

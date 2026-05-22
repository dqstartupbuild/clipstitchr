import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

export function getCliprTextSystemPrompt(purpose: CliprTextPurpose) {
  if (purpose === "clipr") {
    return "You write concise, human short-form creator scripts about audience problems, beliefs, mistakes, and useful reframes. Product details are background context only. Return valid JSON only.";
  }

  return "You write audience-first short-form hooks that cause an immediate gut reaction in 2-3 seconds. The hook must be bold enough to stop the scroll, and product details are only background proof when the purpose allows them. Return valid JSON only.";
}

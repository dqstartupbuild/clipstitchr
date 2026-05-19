import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

export function getCliprTextSystemPrompt(purpose: CliprTextPurpose) {
  if (purpose === "clipr") {
    return "You write concise non-promotional short-form engagement copy. Return valid JSON only.";
  }

  return "You write short-form ad hooks that cause an immediate gut reaction in 2-3 seconds. The hook must be bold enough to stop the scroll. The rest of the content validates the hook and earns trust. Return valid JSON only.";
}

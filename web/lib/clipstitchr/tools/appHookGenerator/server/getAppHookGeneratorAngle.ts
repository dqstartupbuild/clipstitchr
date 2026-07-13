import type { CliprHookStyle } from "@/lib/clipstitchr/types/CliprHookStyle";

const angleByTrigger: Record<string, string> = {
  anticipation: "What happens next",
  "contrarian interest": "Sharper point of view",
  curiosity: "Open loop",
  defiance: "Bold challenge",
  empathy: "Relatable tension",
  "insider access": "Worth discovering",
  participation: "Viewer challenge",
  "practical proof": "Show, then tell",
  progress: "Before and after",
  proof: "Visible payoff",
  recognition: "Problem callout",
  surprise: "Unexpected opener",
  trust: "Credible framing",
  urgency: "Timely reason",
};

export function getAppHookGeneratorAngle(style: CliprHookStyle) {
  return angleByTrigger[style.emotionalTrigger] ?? "App discovery";
}

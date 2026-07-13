import type { CliprHookStyle } from "@/lib/clipstitchr/types/CliprHookStyle";

const reasonByTrigger: Record<string, string> = {
  curiosity: "Leaves one useful question open so the app demo can answer it.",
  "insider access": "Makes the app feel worth discovering without inventing proof.",
  progress: "Sets up a clean before-and-after story around the desired outcome.",
  recognition: "Calls out a frustration the audience can recognize right away.",
  surprise: "Breaks the usual app-ad rhythm without making a fake claim.",
};

export function getAppHookGeneratorReason(style: CliprHookStyle) {
  return (
    reasonByTrigger[style.emotionalTrigger] ??
    "Connects the audience's problem to a clear reason to watch the app demo."
  );
}

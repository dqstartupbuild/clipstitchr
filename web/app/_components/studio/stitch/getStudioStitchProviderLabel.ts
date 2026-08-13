import type { StudioStitchReadiness } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchReadiness";

export function getStudioStitchProviderLabel(
  provider: StudioStitchReadiness["providers"][number]["provider"],
) {
  const labels = {
    dansugc: "DansUGC",
    elevenlabs: "ElevenLabs",
    gemini: "Gemini",
    render: "Studio renderer",
  } as const;

  return labels[provider];
}

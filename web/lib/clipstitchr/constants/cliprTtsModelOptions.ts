import type { CliprTtsModelId } from "@/lib/clipstitchr/types/CliprTtsModelId";

export const cliprTtsModelOptions: Array<{
  description: string;
  label: string;
  value: CliprTtsModelId;
}> = [
  {
    description: "Generate narration with ElevenLabs v3 before video creation.",
    label: "ElevenLabs v3",
    value: "elevenlabs/v3",
  },
  {
    description: "Use the selected avatar-video model's built-in voice path.",
    label: "Built-in voice",
    value: "none",
  },
];

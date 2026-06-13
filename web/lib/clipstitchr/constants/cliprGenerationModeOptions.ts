import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";

export const cliprGenerationModeOptions: {
  label: string;
  value: CliprGenerationMode;
}[] = [
  { label: "Any", value: "any" },
  { label: "Script", value: "script" },
  { label: "Reaction", value: "reaction" },
  { label: "B-roll", value: "broll" },
  { label: "Demo", value: "demo" },
];

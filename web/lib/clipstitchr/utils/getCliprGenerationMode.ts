import { defaultCliprGenerationMode } from "@/lib/clipstitchr/constants/defaultCliprGenerationMode";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";

export function getCliprGenerationMode(value: unknown): CliprGenerationMode {
  return value === "script" ||
    value === "reaction" ||
    value === "broll" ||
    value === "any"
    ? value
    : defaultCliprGenerationMode;
}

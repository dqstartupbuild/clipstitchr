import { getCliprJsonText } from "@/lib/clipstitchr/server/getCliprJsonText";
import type { HookLabExactReuseGates } from "@/lib/clipstitchr/types/HookLabExactReuseGates";
import type { HookLabExactReuseEvidence } from "@/lib/clipstitchr/types/HookLabExactReuseEvidence";
import { getHookLabParsedObject } from "./getHookLabParsedObject";
import { getHookLabParsedString } from "./getHookLabParsedString";
import { HOOK_LAB_EXACT_REUSE_GATE_NAMES } from "./hookLabExactReuseGateNames";

export function parseHookLabUseGeneration(outputText: string) {
  const parsed = getHookLabParsedObject(
    JSON.parse(getCliprJsonText(outputText)) as unknown,
  );
  const rawGates = getHookLabParsedObject(parsed.exactReuseGates);
  const exactReuseEvidence = Object.fromEntries(
    HOOK_LAB_EXACT_REUSE_GATE_NAMES.map((name) => {
      const gate = getHookLabParsedObject(rawGates[name]);

      return [name, getHookLabParsedString(gate.evidence, "", 240)];
    }),
  ) as HookLabExactReuseEvidence;
  const exactReuseGates = Object.fromEntries(
    HOOK_LAB_EXACT_REUSE_GATE_NAMES.map((name) => {
      const gate = getHookLabParsedObject(rawGates[name]);

      return [name, gate.passes === true && Boolean(exactReuseEvidence[name])];
    }),
  ) as HookLabExactReuseGates;

  return {
    adaptedHook: getHookLabParsedString(parsed.adaptedHook, "", 240),
    caption: getHookLabParsedString(parsed.caption, "", 2_000),
    exactReuseGates,
    exactReuseEvidence,
    visualPrompt: getHookLabParsedString(parsed.visualPrompt, "", 2_000),
    visualPromptSummary: getHookLabParsedString(
      parsed.visualPromptSummary,
      "A fresh creator reaction that leads naturally into the Demo.",
      1_000,
    ),
  };
}

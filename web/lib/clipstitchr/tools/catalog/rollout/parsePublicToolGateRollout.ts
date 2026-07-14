import { isPublicToolKey } from "@/lib/clipstitchr/tools/catalog/isPublicToolKey";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import type { PublicToolGateRolloutConfiguration } from "@/lib/clipstitchr/tools/catalog/rollout/PublicToolGateRolloutConfiguration";

const rolloutKeys = ["allocationPercent", "tools", "variant"] as const;

/**
 * PUBLIC_TOOL_GATE_ROLLOUT accepts one strict JSON object:
 * {"variant":"hybrid-v1","tools":["app-hook-generator"],"allocationPercent":50}
 */
export function parsePublicToolGateRollout(
  value: string | undefined,
): PublicToolGateRolloutConfiguration | null {
  if (!value?.trim()) return null;

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  if (
    keys.length !== rolloutKeys.length ||
    !rolloutKeys.every((key, index) => key === keys[index])
  ) {
    return null;
  }

  if (record.variant !== "hybrid-v1") return null;
  if (!Array.isArray(record.tools)) return null;
  const tools: PublicToolKey[] = [];

  for (const tool of record.tools) {
    if (typeof tool !== "string" || !isPublicToolKey(tool)) return null;
    tools.push(tool);
  }

  if (new Set(tools).size !== tools.length) return null;
  if (
    typeof record.allocationPercent !== "number" ||
    !Number.isInteger(record.allocationPercent) ||
    record.allocationPercent < 0 ||
    record.allocationPercent > 100
  ) {
    return null;
  }

  return {
    allocationPercent: record.allocationPercent,
    tools,
    variant: "hybrid-v1",
  };
}

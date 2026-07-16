export function getWorkerQueueToolLimit(tool: string) {
  const raw = process.env.PROVIDER_TOOL_ACTIVE_GENERATION_LIMITS_JSON;

  if (!raw) {
    return null;
  }

  try {
    const limits = JSON.parse(raw) as Record<string, unknown>;
    const value = limits[tool];

    return typeof value === "number" && Number.isFinite(value) && value > 0
      ? Math.floor(value)
      : null;
  } catch {
    throw new Error(
      "PROVIDER_TOOL_ACTIVE_GENERATION_LIMITS_JSON must be valid JSON.",
    );
  }
}

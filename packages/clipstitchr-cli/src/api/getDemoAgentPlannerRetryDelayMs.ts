const retryAfterSecondsPattern = /try again in (\d+) seconds?/i;

export function getDemoAgentPlannerRetryDelayMs(error: unknown, attempt: number) {
  const message = error instanceof Error ? error.message : String(error);
  const retryAfterSeconds = message.includes("Planner provider is busy")
    ? retryAfterSecondsPattern.exec(message)?.[1]
    : undefined;

  if (retryAfterSeconds) {
    return Number.parseInt(retryAfterSeconds, 10) * 1000;
  }

  if (
    message.includes("ExpiredInQueue") ||
    message.includes("Too many concurrent requests") ||
    message.includes("Planner provider is busy")
  ) {
    return Math.min(15_000, 5000 * (attempt + 1));
  }

  return undefined;
}

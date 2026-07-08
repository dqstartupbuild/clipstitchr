export function getCliDemoAgentPlannerProviderBackpressureRetryAfterSeconds(
  error: unknown,
) {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("ExpiredInQueue") ||
    message.includes("Too many concurrent requests")
  ) {
    return 6;
  }

  return undefined;
}

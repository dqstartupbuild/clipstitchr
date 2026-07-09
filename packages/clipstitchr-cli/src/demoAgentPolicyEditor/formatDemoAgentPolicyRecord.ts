export function formatDemoAgentPolicyRecord(values: Record<string, string>) {
  return Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

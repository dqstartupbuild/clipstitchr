export function normalizeDemoAgentPolicyOrigins(origins: string[]) {
  return Array.from(new Set(origins.map((origin) => new URL(origin).origin)));
}

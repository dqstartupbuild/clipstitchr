export function truncateDemoAgentText(value: string, maxLength = 160) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

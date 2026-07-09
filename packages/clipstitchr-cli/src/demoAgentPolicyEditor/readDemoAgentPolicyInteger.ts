export function readDemoAgentPolicyInteger(input: {
  fallback: number;
  maximum: number;
  minimum: number;
  value: string;
}) {
  const parsedValue = Number.parseInt(input.value, 10);

  if (!Number.isFinite(parsedValue)) {
    return input.fallback;
  }

  return Math.min(input.maximum, Math.max(input.minimum, parsedValue));
}

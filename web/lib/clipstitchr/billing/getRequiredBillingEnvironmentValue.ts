export function getRequiredBillingEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required for billing.`);
  }

  return value;
}

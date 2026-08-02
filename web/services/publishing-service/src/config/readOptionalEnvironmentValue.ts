export const readOptionalEnvironmentValue = (
  environment: NodeJS.ProcessEnv,
  fieldName: string,
): string | undefined => {
  const value = environment[fieldName]?.trim();
  return value === undefined || value.length === 0 ? undefined : value;
};

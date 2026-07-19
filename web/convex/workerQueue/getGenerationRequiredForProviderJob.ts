export function getGenerationRequiredForProviderJob(jobType: string) {
  return new Set([
    "manual-swapr",
    "manual-clipr",
    "manual-swipr-draft",
    "avatar-photo-generation",
    "swipr-background-generation",
    "swapr-photo-expansion",
  ]).has(jobType);
}

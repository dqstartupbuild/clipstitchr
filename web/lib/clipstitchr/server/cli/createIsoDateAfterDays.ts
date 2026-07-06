export function createIsoDateAfterDays(startedAt: Date, days: number) {
  return new Date(startedAt.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

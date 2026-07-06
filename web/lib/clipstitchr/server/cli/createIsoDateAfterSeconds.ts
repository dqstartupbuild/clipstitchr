export function createIsoDateAfterSeconds(startedAt: Date, seconds: number) {
  return new Date(startedAt.getTime() + seconds * 1000).toISOString();
}

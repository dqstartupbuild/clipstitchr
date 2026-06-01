export function assertProviderWorkerSecret(secret: string) {
  const expectedSecret = process.env.PROVIDER_WORKER_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    throw new Error("Unauthorized provider worker request.");
  }
}

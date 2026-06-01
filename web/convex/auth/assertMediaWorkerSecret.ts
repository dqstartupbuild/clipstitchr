export function assertMediaWorkerSecret(secret: string) {
  if (
    !process.env.MEDIA_WORKER_SECRET ||
    secret !== process.env.MEDIA_WORKER_SECRET
  ) {
    throw new Error("Unauthorized media worker request.");
  }
}

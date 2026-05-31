export function assertAutomationWorkerSecret(secret: string) {
  const expectedSecret = process.env.AUTOMATION_WORKER_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    throw new Error("Not authorized to run automation work.");
  }
}

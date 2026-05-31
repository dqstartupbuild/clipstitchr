export function getAutomationWorkerSecret() {
  const secret = process.env.AUTOMATION_WORKER_SECRET;

  if (!secret) {
    throw new Error("Missing AUTOMATION_WORKER_SECRET.");
  }

  return secret;
}

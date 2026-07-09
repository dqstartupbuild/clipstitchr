export function getQueueContentErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

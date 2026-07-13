export function createDeadSpaceAbortError() {
  const error = new Error("Dead-space analysis was canceled.");
  error.name = "AbortError";
  return error;
}

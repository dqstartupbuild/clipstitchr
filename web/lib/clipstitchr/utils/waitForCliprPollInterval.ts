const CLIPR_POLL_INTERVAL_MS = 5000;

export function waitForCliprPollInterval() {
  return new Promise((resolve) =>
    window.setTimeout(resolve, CLIPR_POLL_INTERVAL_MS),
  );
}

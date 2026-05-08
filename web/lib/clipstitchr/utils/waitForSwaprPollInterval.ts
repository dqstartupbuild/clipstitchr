const SWAPR_POLL_INTERVAL_MS = 3000;

export function waitForSwaprPollInterval() {
  return new Promise((resolve) =>
    window.setTimeout(resolve, SWAPR_POLL_INTERVAL_MS),
  );
}

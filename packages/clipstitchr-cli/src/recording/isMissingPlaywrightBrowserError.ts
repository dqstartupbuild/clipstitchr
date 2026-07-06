export function isMissingPlaywrightBrowserError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("Executable doesn't exist") &&
    message.includes("playwright install")
  );
}

export async function waitForTuiFrame(input: {
  pattern: RegExp;
  readFrame: () => string | undefined;
  timeoutMs?: number;
}) {
  const timeoutAt = Date.now() + (input.timeoutMs ?? 2_000);

  while (Date.now() < timeoutAt) {
    const frame = input.readFrame() ?? "";
    input.pattern.lastIndex = 0;

    if (input.pattern.test(frame)) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(`Timed out waiting for TUI frame matching ${input.pattern}.`);
}

export const waitForPublishingOutboxPoll = async (
  milliseconds: number,
  signal: AbortSignal,
): Promise<void> => {
  if (signal.aborted) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, milliseconds);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
};

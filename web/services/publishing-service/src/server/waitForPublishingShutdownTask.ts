export const waitForPublishingShutdownTask = async (
  task: Promise<unknown>,
  timeoutMilliseconds = 7_500,
): Promise<void> => {
  let timeout: NodeJS.Timeout | undefined;

  await Promise.race([
    task.then(() => undefined, () => undefined),
    new Promise<void>((resolve) => {
      timeout = setTimeout(resolve, timeoutMilliseconds);
      timeout.unref();
    }),
  ]);

  if (timeout !== undefined) {
    clearTimeout(timeout);
  }
};

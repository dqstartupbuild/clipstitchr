export const mapWithConcurrency = async <Value>(
  values: readonly Value[],
  concurrency: number,
  callback: (value: Value) => Promise<void>,
): Promise<void> => {
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      const value = values[index];

      if (value !== undefined) {
        await callback(value);
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, values.length) },
      async () => worker(),
    ),
  );
};

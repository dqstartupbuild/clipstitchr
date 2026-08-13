export const runConcurrentMapWorker = async <Value>(
  values: readonly Value[],
  takeNextIndex: () => number,
  callback: (value: Value) => Promise<void>,
): Promise<void> => {
  let index = takeNextIndex();

  while (index < values.length) {
    const value = values[index];
    if (value !== undefined) {
      await callback(value);
    }
    index = takeNextIndex();
  }
};

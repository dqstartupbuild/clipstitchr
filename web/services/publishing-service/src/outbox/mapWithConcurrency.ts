export const mapWithConcurrency = async <Value>(
  values: readonly Value[],
  concurrency: number,
  callback: (value: Value) => Promise<void>,
): Promise<void> => {
  let nextIndex = 0;

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, values.length) },
      async () =>
        runConcurrentMapWorker(
          values,
          () => {
            const index = nextIndex;
            nextIndex += 1;
            return index;
          },
          callback,
        ),
    ),
  );
};
import { runConcurrentMapWorker } from "./runConcurrentMapWorker.js";

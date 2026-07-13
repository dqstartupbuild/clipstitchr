import type { Input } from "mediabunny";

export function createLocalVideoInputDisposer(input: Input) {
  let isDisposed = false;

  return () => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    input.dispose();
  };
}

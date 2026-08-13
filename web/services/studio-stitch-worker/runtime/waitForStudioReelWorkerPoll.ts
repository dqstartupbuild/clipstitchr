import { settleStudioReelWorkerPoll } from "./settleStudioReelWorkerPoll";

export function waitForStudioReelWorkerPoll(
  milliseconds: number,
  signal: AbortSignal,
) {
  if (signal.aborted) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const state = { resolve, signal } as {
      listener?: () => void;
      resolve: () => void;
      signal: AbortSignal;
      timeout?: ReturnType<typeof setTimeout>;
    };
    state.listener = settleStudioReelWorkerPoll.bind(null, state);
    state.timeout = setTimeout(state.listener, milliseconds);
    signal.addEventListener("abort", state.listener, { once: true });
  });
}

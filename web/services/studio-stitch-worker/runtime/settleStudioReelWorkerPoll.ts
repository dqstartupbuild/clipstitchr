export function settleStudioReelWorkerPoll(state: {
  listener?: () => void;
  resolve: () => void;
  signal: AbortSignal;
  timeout?: ReturnType<typeof setTimeout>;
}) {
  if (state.timeout) clearTimeout(state.timeout);
  if (state.listener) state.signal.removeEventListener("abort", state.listener);
  state.resolve();
}

import type { StudioReelCommandProcessState } from "../../contracts/StudioReelCommandProcessState";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { failStudioReelCommandProcess } from "./failStudioReelCommandProcess";

export function captureStudioReelCommandOutput(
  state: StudioReelCommandProcessState,
  target: Buffer[],
  chunk: Buffer,
) {
  state.bytes += chunk.byteLength;
  if (state.bytes > state.maximumOutputBytes) {
    failStudioReelCommandProcess(
      state,
      new StudioReelWorkerError({
        code: "COMMAND_OUTPUT_LIMIT_EXCEEDED",
        kind: "permanent",
        publicMessage: "A Studio Stitch media command produced too much output.",
      }),
    );
    return;
  }
  target.push(Buffer.from(chunk));
}

import type { StudioReelCommandProcessState } from "../../contracts/StudioReelCommandProcessState";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { failStudioReelCommandProcess } from "./failStudioReelCommandProcess";

export function handleStudioReelCommandSpawnError(
  state: StudioReelCommandProcessState,
  error: Error,
) {
  failStudioReelCommandProcess(
    state,
    new StudioReelWorkerError({
      cause: error,
      code: "COMMAND_UNAVAILABLE",
      kind: "permanent",
      publicMessage: "A required Studio Stitch media command is unavailable.",
    }),
  );
}

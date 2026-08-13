import type {
  StudioClipsCommandResult,
  StudioClipsCommandRunner,
} from "./StudioClipsCommandRunner";
import { StudioClipsBoundedCommandExecution } from "./StudioClipsBoundedCommandExecution";

export const runBoundedStudioClipsCommand: StudioClipsCommandRunner = async (
  input,
): Promise<StudioClipsCommandResult> => {
  return new StudioClipsBoundedCommandExecution(input).run();
};

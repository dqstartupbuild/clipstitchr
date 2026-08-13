import { getStudioClipsWorkerCheck } from "../cli/getStudioClipsWorkerCheck";
import { getStudioClipsWorkerRuntimePreflight } from "./getStudioClipsWorkerRuntimePreflight";

export function getStudioClipsWorkerRuntimeCheck(
  environment: NodeJS.ProcessEnv,
) {
  return {
    ...getStudioClipsWorkerCheck(),
    runtime: getStudioClipsWorkerRuntimePreflight(environment),
    service: "studio-clips-worker",
  } as const;
}

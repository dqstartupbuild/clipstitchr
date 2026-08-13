import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export function rejectStudioClipsAccess(code: string, message: string): never {
  throw new StudioClipsWorkerError({
    code,
    kind: "permanent",
    publicMessage: message,
  });
}

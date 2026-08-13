import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export function failInvalidStudioClipsFont(): never {
  throw new StudioClipsWorkerError({
    code: "INVALID_CUSTOM_FONT",
    kind: "permanent",
    publicMessage: "The custom caption font is not a valid TrueType or OpenType font.",
  });
}

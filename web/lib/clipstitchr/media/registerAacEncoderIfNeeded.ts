import { registerAacEncoder } from "@mediabunny/aac-encoder";
import { canEncodeAudio } from "mediabunny";

let registrationPromise: Promise<void> | null = null;

export function registerAacEncoderIfNeeded() {
  registrationPromise ??= canEncodeAudio("aac").then((canEncode) => {
    if (!canEncode) {
      registerAacEncoder();
    }
  });

  return registrationPromise;
}

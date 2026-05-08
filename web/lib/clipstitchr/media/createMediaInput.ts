import { ALL_FORMATS, BlobSource, Input } from "mediabunny";

export function createMediaInput(blob: Blob) {
  return new Input({
    source: new BlobSource(blob),
    formats: ALL_FORMATS,
  });
}

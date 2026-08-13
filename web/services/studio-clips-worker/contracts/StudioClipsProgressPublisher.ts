import type { StudioClipsProgressEvent } from "./StudioClipsProgressEvent";

export type StudioClipsProgressPublisher = {
  publish: (event: StudioClipsProgressEvent) => Promise<void>;
};

import type { StudioClipsSourceDraft } from "./StudioClipsSourceDraft";
import type { StudioClipsStyleDraft } from "./StudioClipsStyleDraft";
import type { StudioClipsTaskOptions } from "./StudioClipsTaskOptions";

export type StudioClipsCreateDraft = {
  options: StudioClipsTaskOptions;
  source: StudioClipsSourceDraft;
  style: StudioClipsStyleDraft;
};

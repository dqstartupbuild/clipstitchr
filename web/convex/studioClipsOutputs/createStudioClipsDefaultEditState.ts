import type { StudioClipsOutputEditState } from "../../lib/clipstitchr/types/studioClips/StudioClipsOutputEditState";

export function createStudioClipsDefaultEditState(): StudioClipsOutputEditState {
  return {
    acceptance: { state: "pending" },
    handoffs: [],
    regenerate: { state: "not_requested" },
    version: 1,
  };
}

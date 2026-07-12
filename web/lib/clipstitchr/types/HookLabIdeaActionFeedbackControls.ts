import type { Dispatch, SetStateAction } from "react";

export type HookLabIdeaActionFeedbackControls = {
  setError: Dispatch<SetStateAction<string | null>>;
  setStatusMessage: Dispatch<SetStateAction<string | null>>;
};

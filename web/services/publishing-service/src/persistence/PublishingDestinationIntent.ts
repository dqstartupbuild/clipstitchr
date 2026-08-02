import type { ZonedScheduleDateInput } from "../scheduling/ZonedScheduleDateInput.js";

export type PublishingDestinationIntent =
  | Readonly<{ kind: "draft" }>
  | Readonly<{ kind: "publish-now" }>
  | Readonly<{
      kind: "schedule";
      schedule: ZonedScheduleDateInput;
    }>;

import { describe, expect, it } from "vitest";
import { getIsApifyActorRunPending } from "@/lib/clipstitchr/server/apify/getIsApifyActorRunPending";

describe("getIsApifyActorRunPending", () => {
  it.each(["READY", "RUNNING", "TIMING-OUT", "ABORTING"] as const)(
    "keeps polling the transitional %s state",
    (status) => {
      expect(getIsApifyActorRunPending(status)).toBe(true);
    },
  );

  it.each(["SUCCEEDED", "FAILED", "TIMED-OUT", "ABORTED"] as const)(
    "treats %s as terminal",
    (status) => {
      expect(getIsApifyActorRunPending(status)).toBe(false);
    },
  );
});

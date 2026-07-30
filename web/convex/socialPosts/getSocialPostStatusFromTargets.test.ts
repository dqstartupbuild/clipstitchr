import { describe, expect, it } from "vitest";
import { getSocialPostStatusFromTargets } from "./getSocialPostStatusFromTargets";

function targets(...statuses: string[]) {
  return statuses.map((status) => ({ status })) as never;
}

describe("getSocialPostStatusFromTargets", () => {
  it("keeps independent partial-success state", () => {
    expect(
      getSocialPostStatusFromTargets(targets("published", "failed")),
    ).toBe("partially_published");
  });

  it("does not call an inbox delivery publicly posted", () => {
    expect(getSocialPostStatusFromTargets(targets("waiting_for_user"))).toBe(
      "waiting_for_user",
    );
  });

  it("puts ambiguous outcomes ahead of retryable failures", () => {
    expect(
      getSocialPostStatusFromTargets(targets("outcome_unknown", "failed")),
    ).toBe("outcome_unknown");
  });
});

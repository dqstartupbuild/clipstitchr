import { describe, expect, it } from "vitest";
import { assertUsageReservationCommitBinding } from "./assertUsageReservationCommitBinding";

const baseReservation = {
  domainId: "analysis_1",
  domainKind: "analysis",
  operation: "hook_lab_script",
  reservationKind: "server",
  resource: "creation_credit",
  state: "reserved",
};

const baseBinding = {
  domainId: "analysis_1",
  domainKind: "analysis",
  operation: "hook_lab_script" as const,
  reservationKind: "server" as const,
  resource: "creation_credit" as const,
};

describe("assertUsageReservationCommitBinding", () => {
  it("accepts direct-server work without a worker queue entry", () => {
    expect(() =>
      assertUsageReservationCommitBinding(baseReservation, baseBinding),
    ).not.toThrow();
  });

  it("still requires a queue entry for worker provenance", () => {
    expect(() =>
      assertUsageReservationCommitBinding(
        { ...baseReservation, reservationKind: "worker" },
        { ...baseBinding, reservationKind: "worker" },
      ),
    ).toThrow("does not match this creation");
  });
});

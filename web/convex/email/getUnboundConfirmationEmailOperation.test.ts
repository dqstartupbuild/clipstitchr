import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { getUnboundConfirmationEmailOperation } from "./getUnboundConfirmationEmailOperation";

function operation(
  fields: Partial<Doc<"emailProviderOperations">> & {
    _id: string;
    createdAt: number;
    status: "claimed" | "accepted" | "pending" | "deadLetter";
    updatedAt: number;
  },
) {
  return {
    kind: "transactional",
    transactionalTemplateKey: "email-confirmation",
    deliveryStatus: "pending",
    ...fields,
  } as Doc<"emailProviderOperations">;
}

describe("unbound confirmation email operation", () => {
  it("selects the closest current confirmation operation", () => {
    const olderAccepted = operation({
      _id: "older" as never,
      acceptedAt: 1_000,
      createdAt: 900,
      status: "accepted",
      updatedAt: 1_000,
    });
    const currentClaim = operation({
      _id: "current" as never,
      createdAt: 1_900,
      status: "claimed",
      updatedAt: 2_000,
    });

    expect(
      getUnboundConfirmationEmailOperation(
        [olderAccepted, currentClaim],
        2_010,
      )?._id,
    ).toBe("current");
  });

  it("rejects workflow and already-bound operations", () => {
    expect(
      getUnboundConfirmationEmailOperation(
        [
          operation({
            _id: "bound" as never,
            createdAt: 100,
            providerMessageId: "provider_email",
            status: "accepted",
            updatedAt: 100,
          }),
          {
            ...operation({
              _id: "workflow" as never,
              createdAt: 100,
              status: "accepted",
              updatedAt: 100,
            }),
            kind: "workflowEvent",
          } as Doc<"emailProviderOperations">,
        ],
        100,
      ),
    ).toBeNull();
  });

  it("binds authoritative delivery after an ambiguous retry or dead letter", () => {
    const ambiguousPending = operation({
      _id: "ambiguous_pending" as never,
      acceptanceStatus: "unknown",
      createdAt: 100,
      status: "pending",
      updatedAt: 150,
    });
    const neverAttempted = operation({
      _id: "never_attempted" as never,
      acceptanceStatus: "notAttempted",
      createdAt: 190,
      status: "pending",
      updatedAt: 190,
    });
    const ambiguousDeadLetter = operation({
      _id: "ambiguous_dead_letter" as never,
      acceptanceStatus: "unknown",
      createdAt: 300,
      status: "deadLetter",
      updatedAt: 300,
    });

    expect(
      getUnboundConfirmationEmailOperation(
        [ambiguousPending, neverAttempted],
        200,
      )?._id,
    ).toBe("ambiguous_pending");
    expect(
      getUnboundConfirmationEmailOperation(
        [neverAttempted, ambiguousDeadLetter],
        300,
      )?._id,
    ).toBe("ambiguous_dead_letter");
  });
});

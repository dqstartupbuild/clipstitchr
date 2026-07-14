import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { getEmailOperationDispatchEligibility } from "./getEmailOperationDispatchEligibility";

const contact = {
  consentStatus: "confirmed",
  deletionStatus: "active",
  marketingEligible: true,
  subscriptionStatus: "subscribed",
  suppressionStatus: "none",
  verificationStatus: "verified",
} as Doc<"marketingContacts">;
const workflowOperation = {
  kind: "workflowEvent",
} as Doc<"emailProviderOperations">;

describe("email dispatch eligibility", () => {
  it("allows eligible marketing work and blocks opt-out or tombstone state", () => {
    expect(
      getEmailOperationDispatchEligibility({
        contact,
        operation: workflowOperation,
        tombstone: null,
      }),
    ).toEqual({ eligible: true });
    expect(
      getEmailOperationDispatchEligibility({
        contact: {
          ...contact,
          subscriptionStatus: "unsubscribed",
        } as Doc<"marketingContacts">,
        operation: workflowOperation,
        tombstone: null,
      }),
    ).toMatchObject({ eligible: false });
    expect(
      getEmailOperationDispatchEligibility({
        contact,
        operation: workflowOperation,
        tombstone: {} as Doc<"providerDeletionTombstones">,
      }),
    ).toEqual({ eligible: false, reason: "providerDeleted" });
  });

  it("permits only the allowlisted confirmation transaction before verification", () => {
    const pendingContact = {
      ...contact,
      consentStatus: "pendingVerification",
      marketingEligible: false,
      subscriptionStatus: "notSubscribed",
      verificationStatus: "pending",
    } as Doc<"marketingContacts">;

    expect(
      getEmailOperationDispatchEligibility({
        contact: pendingContact,
        operation: {
          kind: "transactional",
          transactionalTemplateKey: "email-confirmation",
        } as Doc<"emailProviderOperations">,
        tombstone: null,
      }),
    ).toEqual({ eligible: true });
  });

  it("dispatches unsubscribe compensation only while canonical state needs it", () => {
    const compensation = {
      kind: "contactUnsubscribe",
    } as Doc<"emailProviderOperations">;

    expect(
      getEmailOperationDispatchEligibility({
        contact: {
          ...contact,
          marketingEligible: false,
          subscriptionStatus: "unsubscribed",
        } as Doc<"marketingContacts">,
        operation: compensation,
        tombstone: null,
      }),
    ).toEqual({ eligible: true });
    expect(
      getEmailOperationDispatchEligibility({
        contact,
        operation: compensation,
        tombstone: null,
      }),
    ).toEqual({ eligible: false, reason: "alreadyEligible" });
  });
});

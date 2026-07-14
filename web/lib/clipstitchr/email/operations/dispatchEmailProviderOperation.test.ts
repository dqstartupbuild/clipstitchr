import type { LoopsClient } from "loops";
import { describe, expect, it, vi } from "vitest";
import { createEmailConfirmationSignature } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationSignature";
import { createEmailConfirmationTokenDigest } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationTokenDigest";
import type { EmailProviderDispatchProjection } from "@/lib/clipstitchr/email/operations/EmailProviderDispatchProjection";
import { dispatchEmailProviderOperation } from "@/lib/clipstitchr/email/operations/dispatchEmailProviderOperation";

const confirmationSecret = "a long development-only confirmation secret";

const baseProjection = {
  confirmation: null,
  contact: {
    contactName: "Person Name",
    firstTool: "app-hook-generator",
    latestTool: "app-hook-generator",
    leadSegment: "hooks-and-messaging",
    leadStage: "captured",
    normalizedEmail: "person@example.com",
    providerContactKey: "provider_opaque_key_12345678901234",
  },
  operation: {
    kind: "contactSync",
    operationId: "email_operation_123",
  },
  transactionalTemplateKey: null,
  workflow: null,
} satisfies EmailProviderDispatchProjection;

function createClient() {
  return {
    deleteContact: vi.fn().mockResolvedValue({ success: true }),
    sendEvent: vi.fn().mockResolvedValue({ success: true }),
    sendTransactionalEmail: vi.fn().mockResolvedValue({ success: true }),
    updateContact: vi.fn().mockResolvedValue({
      id: "loops_contact",
      success: true,
    }),
  };
}

function dispatch(
  projection: EmailProviderDispatchProjection,
  client = createClient(),
) {
  return {
    client,
    promise: dispatchEmailProviderOperation({
      client: client as unknown as Pick<
      LoopsClient,
        | "deleteContact"
        | "sendEvent"
        | "sendTransactionalEmail"
        | "updateContact"
      >,
      confirmationSigningSecret: confirmationSecret,
      developmentRecipientList: "person@example.com",
      environment: {
        LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID: "confirmation_template",
      },
      projection,
      siteUrl: "https://clipstitchr.com",
      teamEnvironment: "development",
    }),
  };
}

describe("dispatchEmailProviderOperation", () => {
  it("deletes by only the opaque provider key", async () => {
    const deletion = dispatch({
      ...baseProjection,
      contact: {
        ...baseProjection.contact,
        contactName: "Deleted contact",
        firstTool: undefined,
        latestTool: undefined,
        normalizedEmail: "deleted-contact_1",
      },
      operation: {
        ...baseProjection.operation,
        kind: "contactDelete",
      },
    });

    await deletion.promise;
    expect(deletion.client.deleteContact).toHaveBeenCalledWith({
      userId: baseProjection.contact.providerContactKey,
    });
    expect(deletion.client.updateContact).not.toHaveBeenCalled();
  });

  it("keeps normal contact sync separate from explicit resubscription", async () => {
    const normal = dispatch(baseProjection);
    await normal.promise;
    expect(normal.client.updateContact).toHaveBeenCalledOnce();
    expect(normal.client.updateContact.mock.calls[0]?.[0]?.properties).not.toHaveProperty(
      "subscribed",
    );

    const resubscribe = dispatch({
      ...baseProjection,
      operation: {
        ...baseProjection.operation,
        kind: "contactResubscribe",
      },
    });
    await resubscribe.promise;
    expect(
      resubscribe.client.updateContact.mock.calls[0]?.[0]?.properties,
    ).toMatchObject({ subscribed: true });
  });

  it("dispatches only an opaque-key unsubscribe for compensation", async () => {
    const correction = dispatch({
      ...baseProjection,
      contact: {
        ...baseProjection.contact,
        firstTool: undefined,
        latestTool: undefined,
      },
      operation: {
        ...baseProjection.operation,
        kind: "contactUnsubscribe",
      },
    });

    await correction.promise;
    expect(correction.client.updateContact).toHaveBeenCalledWith({
      properties: { subscribed: false },
      userId: baseProjection.contact.providerContactKey,
    });
  });

  it("keeps unsubscribe compensation inside the development allowlist", async () => {
    const correction = dispatch({
      ...baseProjection,
      contact: {
        ...baseProjection.contact,
        normalizedEmail: "not-allowlisted@example.com",
      },
      operation: {
        ...baseProjection.operation,
        kind: "contactUnsubscribe",
      },
    });

    await expect(correction.promise).rejects.toThrow(
      "Email provider operation is not configured.",
    );
    expect(correction.client.updateContact).not.toHaveBeenCalled();
  });

  it("dispatches only the bounded workflow payload", async () => {
    const operation = dispatch({
      ...baseProjection,
      operation: { kind: "workflowEvent", operationId: "email_operation_456" },
      workflow: {
        gateMode: "useful-preview",
        leadSegment: "hooks-and-messaging",
        toolSource: "app-hook-generator",
        workflowKey: "tool_lead_captured",
        workflowVersion: "v1",
      },
    });

    await operation.promise;

    expect(operation.client.sendEvent).toHaveBeenCalledWith({
      userId: baseProjection.contact.providerContactKey,
      eventName: "tool_lead_captured",
      eventProperties: {
        gateMode: "useful-preview",
        leadSegment: "hooks-and-messaging",
        toolKey: "app-hook-generator",
        workflowVersion: "v1",
      },
      headers: { "Idempotency-Key": "email_operation_456" },
    });
  });

  it("rebuilds the approved confirmation URL and keeps it out of the audience", async () => {
    const tokenRecordId = "1f51ee91-fb53-4cec-9c51-4ac578de435a";
    const expiresAt = Date.UTC(2026, 6, 15, 12);
    const signature = await createEmailConfirmationSignature(
      tokenRecordId,
      expiresAt,
      confirmationSecret,
    );
    const tokenDigest = await createEmailConfirmationTokenDigest(signature);
    const operation = dispatch({
      ...baseProjection,
      confirmation: {
        expiresAt,
        generation: 1,
        tokenDigest,
        tokenRecordId,
      },
      operation: { kind: "transactional", operationId: "email_operation_789" },
      transactionalTemplateKey: "email-confirmation",
    });

    await operation.promise;

    expect(operation.client.sendTransactionalEmail).toHaveBeenCalledWith({
      transactionalId: "confirmation_template",
      email: "person@example.com",
      addToAudience: false,
      dataVariables: {
        confirmationUrl: expect.stringMatching(
          /^https:\/\/clipstitchr\.com\/email\/confirm\?/,
        ),
      },
      headers: { "Idempotency-Key": "email_operation_789" },
    });
  });

  it("rejects unapproved workflows and altered confirmation digests", async () => {
    const invalidWorkflow = dispatch({
      ...baseProjection,
      operation: { kind: "workflowEvent", operationId: "email_operation_bad" },
      workflow: {
        gateMode: "open-result",
        leadSegment: "hooks-and-messaging",
        toolSource: "app-hook-generator",
        workflowKey: "visitor_supplied_event",
        workflowVersion: "v1",
      },
    });
    await expect(invalidWorkflow.promise).rejects.toThrow(
      "Email provider operation is not configured.",
    );

    const invalidConfirmation = dispatch({
      ...baseProjection,
      confirmation: {
        expiresAt: Date.UTC(2026, 6, 15, 12),
        generation: 1,
        tokenDigest: "a".repeat(64),
        tokenRecordId: "1f51ee91-fb53-4cec-9c51-4ac578de435a",
      },
      operation: { kind: "transactional", operationId: "email_operation_bad" },
      transactionalTemplateKey: "email-confirmation",
    });
    await expect(invalidConfirmation.promise).rejects.toThrow(
      "Email provider operation is not configured.",
    );
  });
});

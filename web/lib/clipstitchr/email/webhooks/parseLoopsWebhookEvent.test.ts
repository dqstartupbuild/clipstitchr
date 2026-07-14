import { describe, expect, it } from "vitest";
import { parseLoopsWebhookEvent } from "@/lib/clipstitchr/email/webhooks/parseLoopsWebhookEvent";

const contactIdentity = {
  id: "loops_contact_123",
  email: "person@example.com",
  userId: "provider_opaque_key",
};

describe("parseLoopsWebhookEvent", () => {
  it("keeps only bounded reconciliation fields from a contact event", () => {
    const event = parseLoopsWebhookEvent(
      JSON.stringify({
        eventName: "contact.created",
        eventTime: 1783958400,
        webhookSchemaVersion: "1.0.0",
        contactIdentity,
        contact: {
          ...contactIdentity,
          subscribed: true,
          contactName: "Person Name",
          personalizedResult: "must not persist",
        },
      }),
    );

    expect(event).toEqual({
      contactIdentity,
      eventName: "contact.created",
      eventTime: 1783958400,
      mailingListId: null,
      providerEmailId: null,
      providerEmailMessageId: null,
      providerSourceId: null,
      sourceType: null,
      webhookSchemaVersion: "1.0.0",
    });
    expect(event).not.toHaveProperty("contact");
  });

  it("normalizes a delivery event without retaining subject content", () => {
    const event = parseLoopsWebhookEvent(
      JSON.stringify({
        eventName: "email.delivered",
        eventTime: 1783958400,
        webhookSchemaVersion: "1.0.0",
        sourceType: "transactional",
        transactionalId: "confirmation_template",
        contactIdentity,
        email: {
          id: "provider_email_123",
          emailMessageId: "provider_message_123",
          subject: "Confirm your email",
        },
      }),
    );

    expect(event).toMatchObject({
      eventName: "email.delivered",
      providerEmailId: "provider_email_123",
      providerEmailMessageId: "provider_message_123",
      providerSourceId: "confirmation_template",
      sourceType: "transactional",
    });
    expect(event).not.toHaveProperty("subject");
  });

  it("rejects unknown events and schema versions", () => {
    expect(() =>
      parseLoopsWebhookEvent(
        JSON.stringify({
          eventName: "email.clicked",
          eventTime: 1783958400,
          webhookSchemaVersion: "1.0.0",
        }),
      ),
    ).toThrow("Webhook event is not supported.");

    expect(() =>
      parseLoopsWebhookEvent(
        JSON.stringify({
          eventName: "testing.testEvent",
          eventTime: 1783958400,
          webhookSchemaVersion: "2.0.0",
        }),
      ),
    ).toThrow("Webhook schema version is not supported.");
  });
});

import type { LoopsWebhookEvent } from "./LoopsWebhookEvent";
import type { LoopsWebhookEventName } from "./LoopsWebhookEventName";
import { getWebhookValueIsRecord } from "./getWebhookValueIsRecord";
import { loopsWebhookEventNames } from "./loopsWebhookEventNames";
import { readBoundedWebhookString } from "./readBoundedWebhookString";

const contactEvents = new Set<LoopsWebhookEventName>([
  "contact.created",
  "contact.unsubscribed",
  "contact.deleted",
  "contact.mailingList.subscribed",
  "contact.mailingList.unsubscribed",
]);

const mailingListEvents = new Set<LoopsWebhookEventName>([
  "contact.mailingList.subscribed",
  "contact.mailingList.unsubscribed",
]);

const sentEventSourceTypes = {
  "loop.email.sent": "loop",
  "transactional.email.sent": "transactional",
} as const;

export function parseLoopsWebhookEvent(rawBody: string): LoopsWebhookEvent {
  let value: unknown;

  try {
    value = JSON.parse(rawBody);
  } catch {
    throw new Error("Webhook body is not valid JSON.");
  }

  if (
    !getWebhookValueIsRecord(value) ||
    value.webhookSchemaVersion !== "1.0.0"
  ) {
    throw new Error("Webhook schema version is not supported.");
  }

  if (
    typeof value.eventName !== "string" ||
    !(loopsWebhookEventNames as readonly string[]).includes(value.eventName)
  ) {
    throw new Error("Webhook event is not supported.");
  }

  const eventName = value.eventName as LoopsWebhookEventName;

  if (!Number.isSafeInteger(value.eventTime) || Number(value.eventTime) <= 0) {
    throw new Error("Webhook event time is invalid.");
  }

  if (eventName === "testing.testEvent") {
    return {
      contactIdentity: null,
      eventName,
      eventTime: Number(value.eventTime),
      mailingListId: null,
      providerEmailId: null,
      providerEmailMessageId: null,
      providerSourceId: null,
      sourceType: null,
      webhookSchemaVersion: "1.0.0",
    };
  }

  if (!getWebhookValueIsRecord(value.contactIdentity)) {
    throw new Error("Webhook contact identity is missing.");
  }

  const providerContactId = readBoundedWebhookString(
    value.contactIdentity.id,
    256,
  );
  const email = readBoundedWebhookString(value.contactIdentity.email, 320);
  const userId =
    value.contactIdentity.userId === null
      ? null
      : readBoundedWebhookString(value.contactIdentity.userId, 256);

  if (
    !providerContactId ||
    !email ||
    (userId === null && value.contactIdentity.userId !== null)
  ) {
    throw new Error("Webhook contact identity is invalid.");
  }

  const mailingList = getWebhookValueIsRecord(value.mailingList)
    ? value.mailingList
    : null;
  const mailingListId = mailingList
    ? readBoundedWebhookString(mailingList.id, 256)
    : null;

  if (mailingListEvents.has(eventName) && !mailingListId) {
    throw new Error("Webhook mailing list is invalid.");
  }

  if (contactEvents.has(eventName)) {
    return {
      contactIdentity: { email, id: providerContactId, userId },
      eventName,
      eventTime: Number(value.eventTime),
      mailingListId,
      providerEmailId: null,
      providerEmailMessageId: null,
      providerSourceId: null,
      sourceType: null,
      webhookSchemaVersion: "1.0.0",
    };
  }

  if (!getWebhookValueIsRecord(value.email)) {
    throw new Error("Webhook email identity is missing.");
  }

  const providerEmailId = readBoundedWebhookString(value.email.id, 256);
  const providerEmailMessageId = readBoundedWebhookString(
    value.email.emailMessageId,
    256,
  );

  if (!providerEmailId || !providerEmailMessageId) {
    throw new Error("Webhook email identity is invalid.");
  }

  const sentSourceType =
    eventName in sentEventSourceTypes
      ? sentEventSourceTypes[
          eventName as keyof typeof sentEventSourceTypes
        ]
      : null;
  const sourceType = sentSourceType ?? value.sourceType;

  if (
    sourceType !== "campaign" &&
    sourceType !== "loop" &&
    sourceType !== "transactional"
  ) {
    throw new Error("Webhook email source is invalid.");
  }

  const sourceIdKey = {
    campaign: "campaignId",
    loop: "loopId",
    transactional: "transactionalId",
  } as const;
  const providerSourceId = readBoundedWebhookString(
    value[sourceIdKey[sourceType]],
    256,
  );

  if (!providerSourceId) {
    throw new Error("Webhook email source is missing.");
  }

  return {
    contactIdentity: { email, id: providerContactId, userId },
    eventName,
    eventTime: Number(value.eventTime),
    mailingListId: null,
    providerEmailId,
    providerEmailMessageId,
    providerSourceId,
    sourceType,
    webhookSchemaVersion: "1.0.0",
  };
}

import type { LoopsWebhookEventName } from "./LoopsWebhookEventName";

export type LoopsWebhookEvent = Readonly<{
  contactIdentity: Readonly<{
    email: string;
    id: string;
    userId: string | null;
  }> | null;
  eventName: LoopsWebhookEventName;
  eventTime: number;
  mailingListId: string | null;
  providerEmailId: string | null;
  providerEmailMessageId: string | null;
  providerSourceId: string | null;
  sourceType: "campaign" | "loop" | "transactional" | null;
  webhookSchemaVersion: "1.0.0";
}>;

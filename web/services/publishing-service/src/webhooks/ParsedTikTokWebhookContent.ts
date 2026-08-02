import type { TikTokContentPostingWebhookEvent } from "./TikTokContentPostingWebhookEvent.js";

export type ParsedTikTokWebhookContent =
  | Readonly<{
      event: TikTokContentPostingWebhookEvent;
      kind: "content-posting";
      publishId: string;
    }>
  | Readonly<{ kind: "authorization-removed" }>
  | Readonly<{ kind: "ignored" }>;

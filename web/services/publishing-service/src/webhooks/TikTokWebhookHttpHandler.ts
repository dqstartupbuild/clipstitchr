import type { IncomingMessage } from "node:http";

import type { PublishingServiceRouteResponse } from "../server/PublishingServiceRouteResponse.js";

export type TikTokWebhookHttpHandler = (
  request: IncomingMessage,
) => Promise<PublishingServiceRouteResponse>;

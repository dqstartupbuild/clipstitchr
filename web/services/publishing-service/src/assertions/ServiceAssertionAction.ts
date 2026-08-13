export const SERVICE_ASSERTION_ACTIONS = [
  "publishing.integrations.read",
  "publishing.integrations.connect",
  "publishing.integrations.callback",
  "publishing.integrations.refresh",
  "publishing.integrations.disconnect",
  "publishing.media.register",
  "publishing.media.read",
  "publishing.posts.read",
  "publishing.posts.write",
  "publishing.posts.publish",
  "publishing.posts.schedule",
  "publishing.posts.retry",
  "publishing.posts.cancel",
  "publishing.analytics.read",
  "publishing.analytics.refresh",
  "publishing.status.poll",
] as const;

export type ServiceAssertionAction = (typeof SERVICE_ASSERTION_ACTIONS)[number];

import { v } from "convex/values";

export const loopsWebhookEventTypeValidator = v.union(
  v.literal("contact.created"),
  v.literal("contact.unsubscribed"),
  v.literal("contact.deleted"),
  v.literal("contact.mailingList.subscribed"),
  v.literal("contact.mailingList.unsubscribed"),
  v.literal("loop.email.sent"),
  v.literal("transactional.email.sent"),
  v.literal("email.delivered"),
  v.literal("email.softBounced"),
  v.literal("email.hardBounced"),
  v.literal("email.unsubscribed"),
  v.literal("email.resubscribed"),
  v.literal("email.spamReported"),
  v.literal("testing.testEvent"),
);

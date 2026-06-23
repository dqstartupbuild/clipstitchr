export function getBlogPublishWebhookToken() {
  const token = process.env.BLOG_PUBLISH_WEBHOOK_TOKEN;

  if (!token) {
    throw new Error("Missing BLOG_PUBLISH_WEBHOOK_TOKEN.");
  }

  return token;
}

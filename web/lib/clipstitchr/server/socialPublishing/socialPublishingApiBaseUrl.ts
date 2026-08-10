export const socialPublishingApiBaseUrl =
  process.env.ZERNIO_API_BASE_URL ??
  process.env.SOCIAL_PUBLISHING_API_BASE_URL ??
  "https://zernio.com/api/v1";

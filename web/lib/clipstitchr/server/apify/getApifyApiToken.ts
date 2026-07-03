export function getApifyApiToken() {
  const token = process.env.APIFY_TOKEN?.trim();

  if (!token) {
    throw new Error("Sound search is not set up yet.");
  }

  return token;
}

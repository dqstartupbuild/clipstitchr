export async function revokeTikTokAuthorization(accessToken: string) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();

  if (!clientKey || !clientSecret) {
    throw new Error("TikTok connection is not configured.");
  }

  let response: Response;

  try {
    response = await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        token: accessToken,
      }),
    });
  } catch {
    throw new Error("TikTok could not be reached to disconnect this account.");
  }

  if (response.status >= 500) {
    throw new Error("TikTok could not disconnect this account right now.");
  }
}

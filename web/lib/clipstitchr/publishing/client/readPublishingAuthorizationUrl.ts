import { PublishingApiError } from "@/lib/clipstitchr/publishing/client/PublishingApiError";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";

export function readPublishingAuthorizationUrl(
  provider: PublishingProvider,
  value: string,
  clipStitchrOrigin: string,
) {
  let authorizationUrl: URL;
  let callbackUrl: URL;
  let expectedOrigin: URL;

  try {
    authorizationUrl = new URL(value);
    callbackUrl = new URL(
      authorizationUrl.searchParams.get("redirect_uri") ?? "",
    );
    expectedOrigin = new URL(clipStitchrOrigin);
  } catch {
    throw new PublishingApiError({
      code: "invalid_authorization_url",
      message: "The provider returned an unsafe connection link.",
      status: 502,
    });
  }

  const hasSafeBase =
    authorizationUrl.protocol === "https:" &&
    authorizationUrl.username === "" &&
    authorizationUrl.password === "" &&
    authorizationUrl.port === "" &&
    authorizationUrl.hash === "" &&
    authorizationUrl.searchParams.get("state")?.trim();
  const callbackProvider =
    provider === "instagram"
      ? "(?:instagram|instagram-standalone)"
      : "tiktok";
  const callbackIsSafe =
    callbackUrl.origin === expectedOrigin.origin &&
    new RegExp(
      `^/api/publishing/oauth/${callbackProvider}/callback/?$`,
    ).test(callbackUrl.pathname) &&
    callbackUrl.search === "" &&
    callbackUrl.hash === "";
  const providerIsSafe =
    provider === "tiktok"
      ? authorizationUrl.hostname === "www.tiktok.com" &&
        authorizationUrl.pathname === "/v2/auth/authorize/" &&
        Boolean(authorizationUrl.searchParams.get("client_key"))
      : ((authorizationUrl.hostname === "www.facebook.com" &&
            /^\/v\d+(?:\.\d+)?\/dialog\/oauth\/?$/.test(
              authorizationUrl.pathname,
            )) ||
          (["api.instagram.com", "www.instagram.com"].includes(
            authorizationUrl.hostname,
          ) && /^\/oauth\/authorize\/?$/.test(authorizationUrl.pathname))) &&
        Boolean(authorizationUrl.searchParams.get("client_id"));

  if (!hasSafeBase || !callbackIsSafe || !providerIsSafe) {
    throw new PublishingApiError({
      code: "invalid_authorization_url",
      message: "The provider returned an unsafe connection link.",
      status: 502,
    });
  }

  return authorizationUrl.toString();
}

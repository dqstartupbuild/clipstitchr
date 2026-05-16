import { getConstantTimeStringMatch } from "@/lib/clipstitchr/server/indexnow/getConstantTimeStringMatch";
import { getIndexNowSubmitSecret } from "@/lib/clipstitchr/server/indexnow/getIndexNowSubmitSecret";

export function getIsAuthorizedIndexNowRequest(request: Request) {
  const expectedSecret = getIndexNowSubmitSecret();
  const authorization = request.headers.get("authorization") ?? "";
  const bearerToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const headerToken = request.headers.get("x-indexnow-submit-secret") ?? "";

  return (
    getConstantTimeStringMatch(bearerToken, expectedSecret) ||
    getConstantTimeStringMatch(headerToken, expectedSecret)
  );
}

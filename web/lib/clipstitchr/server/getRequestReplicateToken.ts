import { REPLICATE_API_TOKEN_HEADER_NAME } from "@/lib/clipstitchr/constants/replicateApiTokenHeaderName";
import { normalizeReplicateApiToken } from "@/lib/clipstitchr/utils/normalizeReplicateApiToken";

export function getRequestReplicateToken(request: Request) {
  return (
    normalizeReplicateApiToken(
      request.headers.get(REPLICATE_API_TOKEN_HEADER_NAME),
    ) || null
  );
}

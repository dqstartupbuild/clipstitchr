import { normalizeReplicateApiToken } from "@/lib/clipstitchr/utils/normalizeReplicateApiToken";

export function getReplicateToken(requestToken?: string | null) {
  const normalizedRequestToken = normalizeReplicateApiToken(requestToken);

  return (
    normalizedRequestToken ||
    process.env.REPLICATE_API_TOKEN ||
    process.env.REPLICATE_KEY ||
    null
  );
}

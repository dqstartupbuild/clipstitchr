import Replicate from "replicate";
import { getReplicateToken } from "@/lib/clipstitchr/server/getReplicateToken";

export function createReplicateClient(requestToken?: string | null) {
  const token = getReplicateToken(requestToken);

  if (!token) {
    throw new Error(
      "Missing Replicate API token. Add one on the dashboard or configure REPLICATE_API_TOKEN on the server.",
    );
  }

  return new Replicate({
    auth: token,
    fileEncodingStrategy: "upload",
    useFileOutput: false,
  });
}

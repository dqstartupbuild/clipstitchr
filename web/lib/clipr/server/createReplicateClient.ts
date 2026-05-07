import Replicate from "replicate";
import { getReplicateToken } from "@/lib/clipr/server/getReplicateToken";

export function createReplicateClient() {
  const token = getReplicateToken();

  if (!token) {
    throw new Error("Missing REPLICATE_KEY or REPLICATE_API_TOKEN.");
  }

  return new Replicate({
    auth: token,
    fileEncodingStrategy: "upload",
    useFileOutput: false,
  });
}

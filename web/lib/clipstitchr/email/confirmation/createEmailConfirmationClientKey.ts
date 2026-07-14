import { createHmac } from "node:crypto";
import { getPublicToolClientIp } from "@/lib/clipstitchr/tools/server/getPublicToolClientIp";

export function createEmailConfirmationClientKey(
  request: Request,
  secret: string,
) {
  return createHmac("sha256", secret)
    .update(`email-confirmation:${getPublicToolClientIp(request)}`)
    .digest("hex");
}

import { createHmac } from "node:crypto";
import { getPublicToolClientIp } from "@/lib/clipstitchr/tools/server/getPublicToolClientIp";

export function createToolLeadClientKey(request: Request, secret: string) {
  return createHmac("sha256", secret)
    .update(`tool-lead:${getPublicToolClientIp(request)}`)
    .digest("hex");
}

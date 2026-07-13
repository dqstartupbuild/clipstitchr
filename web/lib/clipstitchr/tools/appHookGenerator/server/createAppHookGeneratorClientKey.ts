import { createHash } from "node:crypto";
import { getPublicToolClientIp } from "@/lib/clipstitchr/tools/server/getPublicToolClientIp";

export function createAppHookGeneratorClientKey(request: Request) {
  return createHash("sha256")
    .update(`app-hook-generator:${getPublicToolClientIp(request)}`)
    .digest("hex");
}

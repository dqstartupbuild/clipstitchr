import { STUDIO_REEL_LOCAL_MEDIA_PROTOCOLS } from "../../constants/studioReelLocalMediaProtocols";

export function createStudioReelLocalInputArgs(path: string) {
  return [
    "-protocol_whitelist",
    STUDIO_REEL_LOCAL_MEDIA_PROTOCOLS,
    "-i",
    path,
  ] as const;
}

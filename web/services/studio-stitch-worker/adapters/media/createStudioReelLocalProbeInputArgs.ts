import { STUDIO_REEL_LOCAL_MEDIA_PROTOCOLS } from "../../constants/studioReelLocalMediaProtocols";

export function createStudioReelLocalProbeInputArgs(path: string) {
  return ["-protocol_whitelist", STUDIO_REEL_LOCAL_MEDIA_PROTOCOLS, path] as const;
}

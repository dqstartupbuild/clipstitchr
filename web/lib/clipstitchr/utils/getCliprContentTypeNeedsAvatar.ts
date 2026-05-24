import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import { getCliprContentTypeUsesVoiceover } from "@/lib/clipstitchr/utils/getCliprContentTypeUsesVoiceover";

export function getCliprContentTypeNeedsAvatar(contentType: CliprContentType) {
  return (
    contentType === "avatar-talking-head" ||
    contentType === "b-roll-reel" ||
    getCliprContentTypeUsesVoiceover(contentType)
  );
}

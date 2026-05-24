import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";

export function getCliprContentTypeUsesVoiceover(contentType: CliprContentType) {
  return contentType === "voiceover-reel";
}

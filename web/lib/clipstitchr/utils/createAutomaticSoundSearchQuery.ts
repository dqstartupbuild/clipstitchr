import { getAutomaticSoundSearchTokens } from "@/lib/clipstitchr/utils/getAutomaticSoundSearchTokens";

type CreateAutomaticSoundSearchQueryInput = {
  caption?: string;
  context?: string;
  sourceTitle: string;
};

export function createAutomaticSoundSearchQuery({
  caption,
  context,
  sourceTitle,
}: CreateAutomaticSoundSearchQueryInput) {
  const tokens = getAutomaticSoundSearchTokens(
    [sourceTitle, caption, context].filter(Boolean).join(" "),
  );
  const keywordText = tokens.slice(0, 5).join(" ");

  return keywordText ? `${keywordText} trending sound` : "viral product demo sound";
}

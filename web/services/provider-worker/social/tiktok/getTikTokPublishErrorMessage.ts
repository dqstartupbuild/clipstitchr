const TIKTOK_PUBLISH_ERROR_MESSAGES: Record<string, string> = {
  unaudited_client_can_only_post_to_private_accounts:
    "TikTok requires a private account for automatic posts until ClipStitchr's TikTok review is approved. Make this TikTok account private, or choose Send to TikTok for finishing.",
  url_ownership_unverified:
    "TikTok could not fetch this media because ClipStitchr's media address still needs approval.",
};

export function getTikTokPublishErrorMessage({
  fallbackMessage,
  providerCode,
}: {
  fallbackMessage: string;
  providerCode?: string;
}) {
  return providerCode
    ? (TIKTOK_PUBLISH_ERROR_MESSAGES[providerCode] ?? fallbackMessage)
    : fallbackMessage;
}

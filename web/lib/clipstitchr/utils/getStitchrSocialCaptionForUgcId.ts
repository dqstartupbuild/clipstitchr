export function getStitchrSocialCaptionForUgcId({
  fallbackSocialCaption,
  socialCaptionByUgcId,
  ugcId,
}: {
  fallbackSocialCaption: string | null;
  socialCaptionByUgcId: Record<string, string>;
  ugcId: string;
}) {
  if (Object.prototype.hasOwnProperty.call(socialCaptionByUgcId, ugcId)) {
    return socialCaptionByUgcId[ugcId] ?? "";
  }

  return fallbackSocialCaption ?? "";
}

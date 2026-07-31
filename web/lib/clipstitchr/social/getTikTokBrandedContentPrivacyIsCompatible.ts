export function getTikTokBrandedContentPrivacyIsCompatible(
  brandContentToggle: boolean,
  privacyLevel: string | undefined,
) {
  return !brandContentToggle || privacyLevel !== "SELF_ONLY";
}

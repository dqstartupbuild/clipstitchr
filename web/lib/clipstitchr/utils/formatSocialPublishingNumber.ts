export function formatSocialPublishingNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

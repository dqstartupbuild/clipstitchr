export function fillLazyReelHook(
  template: string,
  input: { audience: string; category: string; niche: string; product: string },
) {
  return template
    .replace("{moment}", `${input.audience} catches the ${input.category} problem mid-day`)
    .replaceAll("{category}", input.category)
    .replaceAll("{product}", input.product)
    .replaceAll("{audience}", input.audience)
    .replaceAll("{niche}", input.niche);
}

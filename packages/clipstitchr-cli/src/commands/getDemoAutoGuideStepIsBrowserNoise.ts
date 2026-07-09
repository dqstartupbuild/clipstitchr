export function getDemoAutoGuideStepIsBrowserNoise(label: string) {
  return /\b(cookie|cookies|consent|banner|tracking|privacy notice|captcha|newsletter|chat widget)\b/i.test(
    label,
  );
}

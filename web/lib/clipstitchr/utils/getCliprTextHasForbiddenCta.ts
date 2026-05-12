const forbiddenCtaPattern =
  /\b(try (it|this|using|riding|adding|switching|checking|building|following|downloading|saving|the|a|an|one)|download it|save this|comment|follow|buy|book|sign up|subscribe|share this|click|tap the link|dm me)\b/i;

export function getCliprTextHasForbiddenCta(text: string) {
  return forbiddenCtaPattern.test(text);
}

import type { SwiprBackgroundGenerationCategory } from "@/lib/clipstitchr/types/SwiprBackgroundGenerationCategory";

const categoryPatterns: {
  category: SwiprBackgroundGenerationCategory;
  pattern: RegExp;
}[] = [
  {
    category: "food",
    pattern:
      /\b(pizza|pizzeria|restaurant|food|meal|kitchen|chef|snack|beverage|drink|coffee|espresso|bakery|sauce|oven|delivery)\b/i,
  },
  {
    category: "fitness",
    pattern:
      /\b(fitness|calisthenics|workout|gym|training|exercise|athlete|strength|mobility|pull-up|pullup|yoga|pilates|run|running)\b/i,
  },
  {
    category: "beauty",
    pattern:
      /\b(beauty|skincare|skin care|cosmetic|makeup|serum|fragrance|hair|salon|spa|wellness)\b/i,
  },
  {
    category: "home",
    pattern:
      /\b(home|decor|furniture|kitchen|bathroom|bedroom|cleaning|storage|garden|plant|interior)\b/i,
  },
  {
    category: "software",
    pattern:
      /\b(software|saas|app|platform|dashboard|automation|workflow|ai tool|analytics|crm|calendar|productivity)\b/i,
  },
];

export function getSwiprBackgroundGenerationCategory(
  productContext: string,
): SwiprBackgroundGenerationCategory {
  const categoryMatch = categoryPatterns.find(({ pattern }) =>
    pattern.test(productContext),
  );

  return categoryMatch?.category ?? "generic";
}

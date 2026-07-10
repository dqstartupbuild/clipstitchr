export function getSwiprProductPlacementPromptRules(productName: string) {
  return [
    `- Exactly one non-final slide must mention ${productName} by name as a subtle part of the solution.`,
    "- Make that product mention feel natural inside a useful list, routine, recommendation, example, or set of steps.",
    "- The product must not be the hook, the whole topic, or a hard sell on that non-final slide.",
    "- Do not mention the product on any other non-final slide.",
    "- Do not invent personal use, results, testimonials, medical claims, statistics, studies, or facts that are not in the product context.",
  ];
}

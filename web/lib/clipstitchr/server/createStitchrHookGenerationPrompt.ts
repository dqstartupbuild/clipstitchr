import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type CreateStitchrHookGenerationPromptOptions = {
  durationSeconds: CliprDurationSeconds;
  fillers: CliprPlaceholderFillers;
  product: ProductProfile;
};

const emotionalAngles = [
  "doubt",
  "regret",
  "surprise",
  "embarrassment",
  "pride",
  "validation",
  "attraction",
  "disappointment",
  "curiosity",
  "relief",
];

const hookFrameworks = [
  "Emotional Narrative Hooks: a first-person or third-person setup that implies something happened, something changed, or someone is about to be proven right or wrong.",
  "Relationship Hooks: romance, friendship, dating, partners, crushes, or social judgment framed through another person's opinion, attraction, approval, disappointment, or surprise.",
  "Validation Hooks: status, approval, or social meaning that makes the viewer feel seen, rewarded, or called out.",
  "Doubt-to-Proof Hooks: someone doubts the outcome, method, person, product, or transformation, and the demo becomes the proof.",
  "Before/After Emotional Hooks: a personal change in confidence, appearance, ability, attraction, discipline, or identity.",
  "Humor / Roast Hooks: playful teasing, mild insult, meme logic, or exaggerated social judgment.",
  "Reaction-Matched Hooks: match shock with disbelief, sadness with regret, happiness with pride, confusion with curiosity, laughter with roasts, and impressed reactions with proof or validation.",
  "Discovery Hooks: make the viewer feel like they are seeing something useful, surprising, or previously unknown.",
  "Easier Way Hooks: relief from frustration, confusion, or unnecessary effort without describing a feature.",
  "Contrarian Reframe Hooks: a surprising personal realization, not a preachy accusation.",
];

const bannedMarketingPhrases = [
  "unlock your potential",
  "reach your goals",
  "maximize results",
  "save time and effort",
  "level up your journey",
  "optimize your routine",
  "game changer",
  "transform your workflow",
  "built for",
  "powerful solution",
];

export function createStitchrHookGenerationPrompt({
  durationSeconds,
  fillers,
  product,
}: CreateStitchrHookGenerationPromptOptions) {
  return [
    "Create Stitchr visual overlay hook copy for a reaction-based stitched video.",
    "Stitchr combines a short emotional UGC reaction clip followed by a short app or product demo.",
    "There is no voiceover, no spoken explanation, and no script. The overlay hook only needs to earn attention long enough for the viewer to watch the demo.",
    "Return only compact JSON with this exact shape:",
    '{"templateId":"stitchr-emotional-narrative","filledHook":"short visual overlay hook","variablesUsed":{"placeholder":"value"},"overlayText":"same short visual overlay hook","slides":["same short visual overlay hook"],"script":"","scenePlan":[]}',
    "Rules:",
    "- Generate one hook, not a script hook, caption set, carousel, CTA, lesson, or marketing argument.",
    "- filledHook and overlayText must be the same final human-readable hook.",
    "- slides must contain exactly one item, matching filledHook.",
    "- script must be an empty string and scenePlan must be an empty array.",
    "- Most hooks should be 3-9 words. Only go longer when the line still feels natural and readable on a vertical video.",
    "- Prioritize emotion over explanation. The hook should create curiosity, surprise, validation, attraction, doubt, humor, or suspense.",
    "- Do not explain the product, teach a lesson, list a benefit, or describe what the demo shows.",
    "- Avoid hooks that feel like SaaS ads, productivity advice, generic marketing copy, or direct feature explanations.",
    "- Do not mention the product name, product features, app screens, dashboards, plans, scans, uploads, exports, or onboarding steps.",
    "- Do not ask viewers to try, download, save, comment, follow, buy, book, subscribe, or sign up.",
    "- Do not make every hook contrarian. Use the emotional setup that feels most human for the audience and context.",
    "- Do not copy example-style lines mechanically. Create a fresh line that sounds like a real person reacting.",
    "- Never return unresolved placeholders, placeholder labels, snake_case keys, or database-style labels.",
    "- Silently reject any hook that reads like advice, a product value proposition, a tutorial title, or a generic ad claim.",
    `Use one Stitchr emotional angle: ${emotionalAngles.join("; ")}`,
    `Use one Stitchr framework: ${hookFrameworks.join(" | ")}`,
    `Avoid these marketing phrases and close variants: ${bannedMarketingPhrases.join("; ")}`,
    `Purpose: stitchr`,
    `Target stitched video duration: ${durationSeconds} seconds`,
    `Audience context: ${product.audienceDetails}`,
    `Audience problem context, for emotional stakes only: ${product.inferredProblem ?? ""}`,
    `Pain point context, for emotional stakes only: ${product.inferredPainPoints.join("; ")}`,
    `Product name, background only and not for the hook: ${product.name}`,
    `Product details, background only and not for the hook: ${product.productDetails}`,
    `Audience language hints: ${JSON.stringify(fillers)}`,
  ].join("\n");
}

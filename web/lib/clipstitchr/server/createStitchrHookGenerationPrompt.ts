import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import { formatStitchrTextGenerationClipContext } from "@/lib/clipstitchr/server/formatStitchrTextGenerationClipContext";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";

type CreateStitchrHookGenerationPromptOptions = {
  candidates: CliprHookTemplate[];
  product: ProductProfile;
  stitchrClipContexts?: StitchrTextGenerationClipContext[];
};

export function createStitchrHookGenerationPrompt({
  candidates,
  product,
  stitchrClipContexts = [],
}: CreateStitchrHookGenerationPromptOptions) {
  const sourceContext = stitchrClipContexts.length
    ? stitchrClipContexts.map(formatStitchrTextGenerationClipContext).join("\n")
    : "No clip details were supplied.";
  const assignedWinnerCandidate = candidates[0];

  return [
    "Write three native UGC discovery overlays and one feed caption for a vertical stitched video.",
    "The only video format is a silent Hook or UGC reaction clip followed immediately by a product Demo clip. There is no generated voiceover.",
    "The viewer should feel that a creator discovered something useful, not that a brand is advertising a feature.",
    "Creative progression: private thought or confession -> genuine reaction -> Demo reveals the discovery.",
    "The overlay must make sense without the feed caption. The caption may deepen the idea, but it cannot explain or repair the hook.",
    "Return compact JSON only. Do not show analysis, notes, scoring, drafts, or a checklist. The first character of the response must be { and the last character must be }.",
    "",
    "Product truth:",
    `- Name: ${product.name}`,
    `- Details: ${product.productDetails || "(unspecified)"}`,
    `- Audience: ${product.audienceDetails || "(unspecified)"}`,
    `- Problem: ${product.inferredProblem || "(unspecified)"}`,
    `- Pain points: ${product.inferredPainPoints.join("; ") || "(unspecified)"}`,
    `- Emotional context: ${product.emotionalNarrative || "(unspecified)"}`,
    "",
    "Selected clips:",
    sourceContext,
    "",
    "Relevant Hook Library candidates:",
    JSON.stringify(
      candidates.map((candidate) => ({
        bestFor: candidate.bestFor,
        emotionalTrigger: candidate.emotionalTrigger,
        riskLevel: candidate.riskLevel,
        styleKey: candidate.styleKey,
        template: candidate.template,
        templateId: candidate.id,
      })),
    ),
    `Assigned winner candidate: ${JSON.stringify(
      assignedWinnerCandidate
        ? {
            template: assignedWinnerCandidate.template,
            templateId: assignedWinnerCandidate.id,
          }
        : {},
    )}`,
    "",
    "Respond with only this JSON shape:",
    '{"templateId":"assigned winner candidate id","hookOptions":[{"templateId":"assigned winner candidate id","angle":"Assigned creator angle","text":"short creator thought","caption":"short feed caption for this option"},{"templateId":"different candidate id","angle":"Different creator angle","text":"short creator thought","caption":"short feed caption for this option"},{"templateId":"different candidate id","angle":"Third creator angle","text":"short creator thought","caption":"short feed caption for this option"}],"filledHook":"exactly hookOptions[0].text","overlayText":"exactly hookOptions[0].text","caption":"exactly hookOptions[0].caption","hashtags":["#tagone","#tagtwo","#tagthree"],"slides":["same text as filledHook"],"script":"","scenePlan":[],"variablesUsed":{}}',
    "",
    "Rules:",
    "- Ground the hook in the Hook or UGC clip's strongest visible emotion, expression, action, tension, or relatable behavior.",
    "- The exact visible Demo moment must answer the creator's reaction. Use that evidence as the discovery without turning it into a product headline.",
    "- Use the Hook Library candidates only as creative mechanisms. Select only candidate IDs from the supplied list, then write a new creator thought from the selected UGC tension and Demo proof. Never paste a template with its placeholders merely filled.",
    "- Return the strongest three distinct options for creator voice, viewer recognition, visual fit, Demo closure, sound-off clarity, specificity, and product truth. Never print the drafts or scoring process.",
    "- The assigned winner candidate is intentionally varied between Batch renders. hookOptions[0] and templateId must use that exact candidate ID. Start hookOptions[0].text with the candidate's exact conversational opener words, then write a new product-grounded discovery after them.",
    "- Do not default hookOptions[0] to a 'not me' self-callout unless the assigned winner candidate uses that opener.",
    "- hookOptions[0] is the winner. filledHook and overlayText must exactly match its text, and caption must exactly match its caption.",
    "- The three options must use meaningfully different creator angles chosen from Self-callout, Reluctant discovery, Expectation reversal, Excuse removed, Identity moment, and Discovery question.",
    "- Make the overlay feel like the creator's private thought, confession, realization, self-callout, or surprised question. Do not merely describe the visible action, repeat a clip title, paraphrase Product details, or paste an existing AI hook hint.",
    "- Treat an AI hook hint as weak creative evidence. Keep it only when it fits both selected clips and rewrite it instead of copying it.",
    "- Start in the creator's life, behavior, insecurity, assumption, excuse, or identity. Let the product become the answer in the Demo.",
    "- Prefer first-person, me, POV, conversational question, reluctant-admission, or self-callout framing when it fits the visible reaction.",
    "- Prefer not to name the product in the overlay. Let the Demo reveal it unless the name is essential to understanding the thought.",
    "- Do not write polished benefit statements, product headlines, feature summaries, tutorial introductions, or brand promises.",
    "- Reject phrases such as 'this is why,' 'here is why,' 'let me explain,' 'what nobody tells you,' and 'how to.' They promise spoken or long-form explanation this format does not contain.",
    "- Reject vague hooks such as 'wait for it,' 'you need to see this,' and 'this changes everything.'",
    "- A conversational fragment is welcome when the Demo completes it, but the meaning must still be clear.",
    "- Do not invent creator history. Never claim the creator downloaded, bought, used, recommended, or got results from the product unless the selected clip evidence explicitly supports that history.",
    "- Every product behavior, result, comparison, and proof point must be directly supported by Product details or by an observed selected-clip detail.",
    "- If clip details are limited, stay grounded in the supplied product and audience and make a smaller claim.",
    "- Keep every option natural, specific, and easy to read. Most should be 4-11 words and none may exceed 14 words.",
    "- Give every option its own caption. Each caption may add context or invite conversation, but the overlay and Demo must work when the caption is never read.",
    "- Only keep options whose private thought leaves one clear question that the visible Demo answers. Reject any option that requires voiceover or caption context.",
    "- Do not invent results, statistics, testimonials, or visual details.",
    "- Do not use a number, time saving, before-and-after result, superiority claim, or testimonial unless Product details explicitly support it.",
    "- hashtags must contain 3-5 lowercase hashtags without spaces.",
    "- slides must contain exactly one item matching filledHook.",
    "- script must be an empty string and scenePlan must be an empty array.",
    "- Never return placeholders or internal field labels.",
    ...getGeneratedWritingAntiSlopPromptRules(),
  ].join("\n");
}

import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";

export function getStitchrTextCompositionPromptLines(
  contexts: StitchrTextGenerationClipContext[],
) {
  const isPairedUgcThenDemo =
    contexts.length === 2 &&
    contexts[0]?.role === "ugc" &&
    contexts[1]?.role === "demo";

  if (isPairedUgcThenDemo) {
    return [
      "Composition: paired UGC then Demo.",
      "Creative progression: private thought or confession -> genuine reaction -> Demo reveals the discovery.",
      "The viewer should feel that a creator discovered something useful, not that a brand is advertising a feature.",
      "Ground the hook in the UGC clip's strongest visible emotion, expression, action, tension, or relatable behavior.",
      "The exact visible Demo moment must answer the creator's reaction. Use that evidence as the discovery without turning it into a product headline.",
      "Use the selected UGC tension and Demo proof together. Do not invent creator history.",
      "Only keep options whose private thought leaves one clear question that the visible Demo answers.",
    ];
  }

  if (contexts.length === 1 && contexts[0]?.role === "ugc") {
    return [
      "Composition: standalone UGC.",
      "Ground the overlay in the visible creator, action, expression, tension, or relatable behavior in the supplied UGC clip.",
      "Do not invent a Demo, product proof, product result, or off-screen payoff. Keep the claim as small as the visible UGC evidence supports.",
    ];
  }

  if (contexts.length === 1 && contexts[0]?.role === "demo") {
    return [
      "Composition: standalone Demo.",
      "Set up the visible proof, action, or payoff in the supplied Demo clip with a clear sound-off overlay.",
      "Do not invent a creator reaction, creator history, discovery story, or off-screen UGC moment. Keep the claim as small as the visible Demo evidence supports.",
    ];
  }

  if (contexts.length) {
    return [
      "Composition: ordered source sequence.",
      "Honor the supplied source order and ground the overlay in the visible moments it contains.",
      "Do not assume a UGC-to-Demo structure, a creator reaction, or a missing payoff. Keep the claim as small as the supplied sequence evidence supports.",
    ];
  }

  return [
    "Composition: source roles are unavailable.",
    "Keep the overlay grounded in the supplied product details and do not invent source-video events.",
  ];
}

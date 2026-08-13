import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { planClassicStudioStitchRecipe } from "@/lib/clipstitchr/studio/stitch/planClassicStudioStitchRecipe";
import { planTalkingStudioStitchRecipe } from "@/lib/clipstitchr/studio/stitch/planTalkingStudioStitchRecipe";
import { serializeStudioStitchRecipe } from "@/lib/clipstitchr/studio/stitch/serializeStudioStitchRecipe";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";
import { getStudioStitchProviderReadiness } from "./getStudioStitchProviderReadiness";
import type { StudioStitchRecipeRequest } from "./studioStitchRecipeRequestSchema";
import { toStudioStitchEngineProviderAvailability } from "./toStudioStitchEngineProviderAvailability";

export async function createStudioStitchRecipeRecord(
  request: StudioStitchRecipeRequest,
) {
  const convex = await getStudioStitchConvexClient();
  const productDocument = await convex.query(api.products.get, {
    id: request.productId,
  });
  if (!productDocument) {
    throw new Error("Choose an active saved Product first.");
  }
  const product = createProductProfileFromConvexDocument(productDocument);
  const providerAvailability = toStudioStitchEngineProviderAvailability(
    getStudioStitchProviderReadiness(),
  );
  const recipe =
    request.pipeline === "classicReel"
      ? planClassicStudioStitchRecipe({
          id: request.recipeId,
          product,
          creativeBrief: request.creativeBrief,
          hookFamily: request.hookFamily,
          hookText: request.hookText,
          supportingText: request.supportingText,
          ctaText: request.ctaText,
          targetDurationSeconds: request.targetDurationSeconds,
          reaction: request.reaction,
          demo: request.demo,
          cutaways: request.cutaways,
          musicSource: request.musicSource,
          musicVolume: request.musicVolume,
          providerAvailability,
        })
      : planTalkingStudioStitchRecipe({
          id: request.recipeId,
          product,
          creativeBrief: request.creativeBrief,
          hookFamily: request.hookFamily,
          hookText: request.hookText,
          voiceScript: request.voiceScript,
          ctaText: request.ctaText,
          targetDurationSeconds: request.targetDurationSeconds,
          reactionSources: request.reactionSources,
          demoSources: request.demoSources,
          voice: request.voice,
          emphasisWords: request.emphasisWords,
          musicSource: request.musicSource,
          musicVolume: request.musicVolume,
          providerAvailability,
        });

  return await convex.mutation(api.studioReelRecipes.create.create, {
    id: request.recipeId,
    productId: request.productId,
    pipeline: request.pipeline,
    recipeJson: serializeStudioStitchRecipe(recipe),
    idempotencyKey: request.idempotencyKey,
  });
}

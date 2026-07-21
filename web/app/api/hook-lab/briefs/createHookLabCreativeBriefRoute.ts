import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createHookLabCreativeBrief } from "@/lib/clipstitchr/server/hookLab/createHookLabCreativeBrief";
import { getRelatedHookLibraryTemplates } from "@/lib/clipstitchr/server/hookLab/getRelatedHookLibraryTemplates";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { readHookLabCreativeBriefRequest } from "./readHookLabCreativeBriefRequest";
import { assertHookLabCreativeBriefIsOriginal } from "@/lib/clipstitchr/server/hookLab/assertHookLabCreativeBriefIsOriginal";
import { assertHookLabCreativeBriefClaimsAreGrounded } from "@/lib/clipstitchr/server/hookLab/assertHookLabCreativeBriefClaimsAreGrounded";

export async function createHookLabCreativeBriefRoute(request: Request) {
  if (!(await getAuthenticatedUserId())) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const input = readHookLabCreativeBriefRequest(await request.json());
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeHookLabCreativeBrief, {
      secret,
    });

    const [post, productDocument] = await Promise.all([
      convex.query(api.hookLabPosts.get.get, { id: input.sourcePostId }),
      convex.query(api.products.get, { id: input.productId }),
    ]);

    if (!post?.analysis?.formatDna || post.status !== "ready") {
      throw new Error("This post needs a completed format analysis first.");
    }

    if (!productDocument) {
      throw new Error("Saved product not found.");
    }

    const relatedTemplates = getRelatedHookLibraryTemplates(
      post.analysis.formatDna,
      input.destinationTool,
    );
    const selectedTemplate = input.hookTemplateId
      ? relatedTemplates.find((template) => template.id === input.hookTemplateId)
      : relatedTemplates[0];
    const product = createProductProfileFromConvexDocument(productDocument);
    const generation = await createHookLabCreativeBrief({
      destinationTool: input.destinationTool,
      formatDna: post.analysis.formatDna,
      product,
      replicate: createReplicateClient(),
      template: selectedTemplate,
    });
    assertHookLabCreativeBriefIsOriginal({
      brief: generation.brief,
      sourcePhrases: [
        post.sourceText,
        post.analysis.caption,
        ...(post.analysis.onScreenText ?? []),
        ...post.analysis.formatDna.doNotCopy,
        ...post.analysis.timeline.flatMap((entry) => [
          entry.audio,
          entry.onScreenText,
        ]),
      ].filter((phrase): phrase is string => Boolean(phrase)),
    });
    assertHookLabCreativeBriefClaimsAreGrounded({
      brief: generation.brief,
      product,
    });
    const brief = await convex.mutation(api.hookLabCreativeBriefs.create.create, {
      brief: generation.brief,
      destinationTool: input.destinationTool,
      formatDnaVersion: post.analysis.formatDna.version,
      hookTemplateId: selectedTemplate?.id,
      id: createId(),
      productId: input.productId,
      sourcePostIds: [input.sourcePostId],
    });

    return Response.json({ brief, relatedTemplates });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to create this creative brief.",
      },
      { status: 400 },
    );
  }
}

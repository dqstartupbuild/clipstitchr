import type { CliDemoGuideGenerateRequest } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideGenerateRequest";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createCliDemoGuidePrompt({
  product,
  request,
}: {
  product: ProductProfile;
  request: CliDemoGuideGenerateRequest;
}) {
  return JSON.stringify(
    {
      task:
        "Create a manual recording checklist for a ClipStitchr demo guide.",
      outputShape: {
        goal: "Plain-language demo goal.",
        steps: [{ label: "Step label only." }],
        title: "Short guide title.",
      },
      rules: {
        stepCount: request.stepCount,
        stepLabelOnly: true,
        minSteps: 3,
        maxSteps: 8,
        noSelectors: true,
        noSecrets: true,
        noDestructiveActions: true,
      },
      product: {
        name: product.name,
        details: product.productDetails,
        audience: product.audienceDetails,
        websiteUrl: product.websiteUrl,
        inferredProblem: product.inferredProblem,
        inferredPainPoints: product.inferredPainPoints,
      },
      demo: {
        appType: request.appType,
        flowName: request.flowName,
        flowPath: request.flowPath,
        goal: request.goal,
        targetAudience: request.targetAudience,
      },
    },
    null,
    2,
  );
}

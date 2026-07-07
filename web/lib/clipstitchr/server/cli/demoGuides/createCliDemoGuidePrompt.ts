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
        "Create a browser-action checklist for a guarded ClipStitchr demo agent.",
      outputShape: {
        goal: "Plain-language demo goal.",
        steps: [{ label: "Step label only." }],
        title: "Short guide title.",
      },
      agentCapabilities: {
        can: [
          "open allowed local routes",
          "click visible links or buttons by their accessible name",
          "type only approved test values",
          "upload only approved local files",
          "wait for visible text",
          "take a screenshot",
          "finish a step when the requested screen is already visible",
        ],
        cannot: [
          "point at the screen",
          "highlight UI",
          "narrate or explain out loud",
          "use CSS selectors",
          "operate hidden controls",
          "invent screens, blank workspaces, projects, templates, or export presets",
        ],
      },
      rules: {
        stepCount: request.stepCount,
        stepLabelOnly: true,
        minSteps: 3,
        maxSteps: 8,
        agentRunnable: true,
        allowedStepVerbs:
          "Prefer Open, Click, Choose, Select, Upload, Wait for, Review, Use, or Finish on.",
        bannedStepVerbs: [
          "Point out",
          "Highlight",
          "Explain",
          "Describe",
          "Mention",
          "Talk through",
          "Show where",
          "Show how",
        ],
        noSelectors: true,
        noSecrets: true,
        noDestructiveActions: true,
        noInventedUi: true,
        useKnownRoutesWhenPossible: true,
      },
      examples: {
        good: [
          "Open the dashboard",
          "Click Upload",
          "Open the Library page",
          "Open Stitchr from the sidebar",
          "Review the saved clips on the dashboard",
        ],
        bad: [
          "Point out the main dashboard",
          "Highlight the template picker",
          "Show where a creator would upload a clip",
          "Click to start a new project",
          "Highlight export preset options",
        ],
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
        availableFlows: request.availableFlows,
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

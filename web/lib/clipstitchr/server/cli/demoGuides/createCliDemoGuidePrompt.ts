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
          "type safe demo text into visible fields",
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
        primaryGoal:
          "Treat demo.goal as the main thing to demonstrate. Do not replace a specific user request with a generic workspace tour.",
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
        routeChoice:
          "If demo.goal names a visible tool and a matching route exists in availableFlows, build the guide around that route.",
        missingSetup:
          "When the goal depends on existing media, connected accounts, saved clips, generated results, or product setup, make steps that open the relevant page and use visible assets. Do not claim unavailable setup exists.",
        typing:
          "When the goal asks to add safe demo text, write steps that type the actual demo text into the real matching field. Do not call it approved text unless the user provided approved values.",
        useAppContext:
          "Use appContext workflow hints to choose real routes, feature labels, field labels, and button names from the app. First choose the workflow hint that matches demo.goal, then use only controls from that workflow. If the user says to add something and appContext lists a matching input, write a step around that visible input and a real matching save/create button from the same workflow. Do not invent Add buttons.",
        addCreateSemantics:
          "For add, create, save, or update goals, prefer typing into matching inputs before using save/create buttons. Treat Accept, Reject, Copy, Save as winner, and similar history or feedback controls as actions for existing items only unless demo.goal explicitly asks to accept, reject, copy, or mark an existing item.",
        hookLabSemantics:
          "For Hook Lab goals that ask to add new hooks, save popular hooks, or add hooks to learn from, use the Hooks to learn from field and Save Hook Lab. Do not create steps that accept existing hook cards unless demo.goal explicitly asks to accept existing hooks.",
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
        appContext: request.appContext,
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

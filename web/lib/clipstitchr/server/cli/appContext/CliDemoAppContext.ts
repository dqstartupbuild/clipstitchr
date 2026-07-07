import type { CliDemoAppContextRoute } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppContextRoute";
import type { CliDemoAppWorkflowHint } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppWorkflowHint";

export type CliDemoAppContext = {
  projectDirectory?: string;
  projectType?: string;
  routes: CliDemoAppContextRoute[];
  workflowHints: CliDemoAppWorkflowHint[];
};

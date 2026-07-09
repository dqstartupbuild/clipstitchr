import { DEFAULT_CLI_DEMO_GUIDE_MODEL_ID } from "@/lib/clipstitchr/constants/defaultCliDemoGuideModelId";
import { readTextWritingModelEnvValue } from "@/lib/clipstitchr/server/readTextWritingModelEnvValue";

export function getCliDemoGuideModelId() {
  return (
    readTextWritingModelEnvValue(process.env.CLI_DEMO_GUIDE_MODEL_ID) ??
    DEFAULT_CLI_DEMO_GUIDE_MODEL_ID
  );
}

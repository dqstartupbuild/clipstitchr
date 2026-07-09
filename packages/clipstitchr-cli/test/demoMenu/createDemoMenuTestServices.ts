import type { DemoMenuServices } from "../../src/demoMenu/DemoMenuServices.js";

export function createDemoMenuTestServices(calls: string[]) {
  return {
    runAgent: async (options) => {
      calls.push(`agent:${options.guide ?? "new"}`);
    },
    runGuideCreate: async () => {
      calls.push("guide-create");
    },
    runGuideDelete: async (reference) => {
      calls.push(`guide-delete:${reference}`);
    },
    runGuideEdit: async (reference) => {
      calls.push(`guide-edit:${reference}`);
    },
    runGuideList: async () => {
      calls.push("guide-list");
    },
    runGuideShow: async (reference) => {
      calls.push(`guide-show:${reference}`);
    },
    runLogs: async (runId) => {
      calls.push(`logs:${runId}`);
    },
    runManual: async () => {
      calls.push("manual");
    },
    runNativeSetup: async () => {
      calls.push("native-setup");
    },
    runPolicyCheck: async () => {
      calls.push("policy-check");
    },
    runPolicyEdit: async () => {
      calls.push("policy-edit");
    },
    runPolicyInit: async () => {
      calls.push("policy-init");
    },
    runUpload: async (filePath) => {
      calls.push(`upload:${filePath}`);
    },
  } satisfies DemoMenuServices;
}

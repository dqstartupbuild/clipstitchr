import type { InteractiveShellServices } from "../../src/interactiveShell/InteractiveShellServices.js";
import { createDemoMenuTestServices } from "../demoMenu/createDemoMenuTestServices.js";
import { createProductsMenuTestServices } from "../productsMenu/createProductsMenuTestServices.js";
import { createQueueMenuTestServices } from "../queueMenu/createQueueMenuTestServices.js";

export function createInteractiveShellTestServices(calls: string[]) {
  return {
    demo: createDemoMenuTestServices(calls),
    products: createProductsMenuTestServices(calls),
    queue: createQueueMenuTestServices(calls),
    runDemoAgent: async (options) => {
      calls.push(`demo-agent:${options.guide ?? "new"}:${options.upload}`);
    },
    runDemoAuto: async () => {
      calls.push("demo-auto");
    },
    runDemoGuideSaveInstructions: async (reference, options) => {
      calls.push(`guide-save:${reference}:${options.output ?? "stdout"}`);
    },
    runDemoManual: async (options) => {
      calls.push(`demo-manual:${options.guide}:${options.upload}`);
    },
    runDemoUpload: async (filePath, options) => {
      calls.push(`demo-upload:${filePath}:${options.wait}`);
    },
    runDoctor: async () => {
      calls.push("doctor");
    },
    runLink: async () => {
      calls.push("link");
    },
    runLogin: async () => {
      calls.push("login");
    },
    runLogout: async () => {
      calls.push("logout");
    },
    runNativeCheck: async () => {
      calls.push("native-check");
    },
    runNativeInit: async (options) => {
      calls.push(`native-init:${options?.force}`);
    },
    runProductsCreate: async (options) => {
      calls.push(`products-create:${options.use}`);
    },
    runProductsList: async () => {
      calls.push("products-list");
    },
    runProductsUse: async (productId) => {
      calls.push(`products-use:${productId ?? "choose"}`);
    },
    runQueueAll: async (options) => {
      calls.push(`queue-all:${options.product ?? "all-products"}`);
    },
    runQueueList: async () => {
      calls.push("queue-list");
    },
    runQueueStitch: async (stitchId, options) => {
      calls.push(
        `queue-stitch:${stitchId ?? "latest"}:${options.all ?? false}`,
      );
    },
    runQueueSwipe: async (swipeId, options) => {
      calls.push(`queue-swipe:${swipeId ?? "latest"}:${options.all ?? false}`);
    },
    runStatus: async () => {
      calls.push("status");
    },
    runStitchrNew: async (options) => {
      calls.push(`stitchr-new:${options.product ?? ""}:${options.timeZone ?? ""}`);
    },
    runSwiprNew: async (options) => {
      calls.push(`swipr-new:${options.product ?? ""}`);
    },
    runUnlink: async () => {
      calls.push("unlink");
    },
    runUpdate: async () => {
      calls.push("update");
    },
  } satisfies InteractiveShellServices;
}

import { randomUUID } from "node:crypto";

export function createDemoWalkthroughGuideId() {
  return `guide_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`;
}

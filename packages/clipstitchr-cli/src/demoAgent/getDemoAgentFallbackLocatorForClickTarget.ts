import type { Page } from "playwright";
import type { DemoAgentClickTarget } from "./DemoAgentClickTarget.js";

export function getDemoAgentFallbackLocatorForClickTarget(
  page: Page,
  target: DemoAgentClickTarget,
) {
  const name = target.name ?? target.text ?? target.label;

  if (
    target.role === "button" &&
    name &&
    /^(select|deselect)\b/i.test(name)
  ) {
    return page.getByRole("checkbox", { name }).first();
  }

  return undefined;
}

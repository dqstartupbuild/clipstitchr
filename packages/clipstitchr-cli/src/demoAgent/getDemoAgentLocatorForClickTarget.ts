import type { Page } from "playwright";
import type { DemoAgentClickTarget } from "./DemoAgentClickTarget.js";

export function getDemoAgentLocatorForClickTarget(
  page: Page,
  target: DemoAgentClickTarget,
) {
  if (target.role) {
    return page
      .getByRole(target.role, {
        name: target.name ?? target.text ?? target.label,
      })
      .first();
  }

  if (target.label) {
    return page.getByLabel(target.label).first();
  }

  return page.getByText(target.text ?? target.name ?? "", { exact: true }).first();
}

import type { Page } from "playwright";
import { scrollDemoAgentLocatorIntoRecordedView } from "./scrollDemoAgentLocatorIntoRecordedView.js";

export async function setDemoAgentSliderValue(input: {
  label: string;
  page: Page;
  value: number;
}) {
  const slider = input.page.getByLabel(input.label).first();

  await scrollDemoAgentLocatorIntoRecordedView(slider);
  await slider.evaluate((element, value) => {
    if (!(element instanceof HTMLInputElement)) {
      element.setAttribute("aria-valuenow", String(value));
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));

      return;
    }

    element.value = String(value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, input.value);
}

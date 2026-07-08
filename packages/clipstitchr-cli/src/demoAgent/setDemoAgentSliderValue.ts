import type { Page } from "playwright";

export async function setDemoAgentSliderValue(input: {
  label: string;
  page: Page;
  value: number;
}) {
  await input.page
    .getByLabel(input.label)
    .first()
    .evaluate((element, value) => {
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

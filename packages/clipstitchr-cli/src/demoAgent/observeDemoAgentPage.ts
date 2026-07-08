import type { Page } from "playwright";
import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { truncateDemoAgentText } from "./truncateDemoAgentText.js";

type RawObservedElement = {
  label?: string;
  name: string;
  role: "button" | "heading" | "input" | "link" | "dialog";
};

function normalizeObservedElements(
  elements: RawObservedElement[],
  role: RawObservedElement["role"],
) {
  return elements
    .filter((element) => element.role === role && element.name)
    .map((element) => ({
      ...element,
      label: element.label ? truncateDemoAgentText(element.label) : undefined,
      name: truncateDemoAgentText(element.name),
    }))
    .slice(0, 50);
}

export async function observeDemoAgentPage(
  page: Page,
): Promise<DemoAgentPageObservation> {
  const [title, elements, scrollState] = await Promise.all([
    page.title(),
    page.evaluate(() => {
      const getText = (element: Element) =>
        [
          element.getAttribute("aria-label"),
          element.getAttribute("title"),
          element.textContent,
          element.getAttribute("placeholder"),
          element.getAttribute("name"),
        ]
          .find((value) => value?.trim())
          ?.trim() ?? "";
      const isVisible = (element: Element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0
        );
      };
      const getInputLabel = (element: Element) => {
        const id = element.getAttribute("id");
        const ariaLabel = element.getAttribute("aria-label");

        if (ariaLabel) {
          return ariaLabel;
        }

        if (id) {
          return (
            document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent ??
            undefined
          );
        }

        return element.closest("label")?.textContent ?? undefined;
      };
      const observed: RawObservedElement[] = [];

      document
        .querySelectorAll("h1,h2,h3,[role='heading']")
        .forEach((element) => {
          if (isVisible(element)) {
            observed.push({ name: getText(element), role: "heading" });
          }
        });
      document
        .querySelectorAll(
          "button,[role='button'],input[type='button'],input[type='submit']",
        )
        .forEach((element) => {
          if (isVisible(element)) {
            observed.push({ name: getText(element), role: "button" });
          }
        });
      document.querySelectorAll("a[href],[role='link']").forEach((element) => {
        if (isVisible(element)) {
          observed.push({ name: getText(element), role: "link" });
        }
      });
      document
        .querySelectorAll("input:not([type='hidden']),textarea,select")
        .forEach((element) => {
          if (isVisible(element)) {
            const label = getInputLabel(element);

            observed.push({
              label: label?.trim(),
              name: label?.trim() || getText(element),
              role: "input",
            });
          }
        });
      document.querySelectorAll("dialog,[role='dialog']").forEach((element) => {
        if (isVisible(element)) {
          observed.push({ name: getText(element), role: "dialog" });
        }
      });

      return observed;
    }),
    page.evaluate(() => ({
      canScrollDown:
        window.scrollY + window.innerHeight <
        document.documentElement.scrollHeight - 4,
      canScrollUp: window.scrollY > 4,
    })),
  ]);

  return {
    buttons: normalizeObservedElements(elements, "button"),
    canScrollDown: scrollState.canScrollDown,
    canScrollUp: scrollState.canScrollUp,
    dialogs: normalizeObservedElements(elements, "dialog"),
    headings: normalizeObservedElements(elements, "heading"),
    inputs: normalizeObservedElements(elements, "input"),
    links: normalizeObservedElements(elements, "link"),
    title: truncateDemoAgentText(title, 240),
    url: page.url(),
  };
}

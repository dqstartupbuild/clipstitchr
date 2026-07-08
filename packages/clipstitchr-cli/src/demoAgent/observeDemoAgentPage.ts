import type { Page } from "playwright";
import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { truncateDemoAgentText } from "./truncateDemoAgentText.js";

type RawObservedElement = {
  disabled?: boolean;
  label?: string;
  name: string;
  placeholder?: string;
  role: "button" | "heading" | "input" | "link" | "dialog";
  selected?: boolean;
  value?: string;
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
      placeholder: element.placeholder
        ? truncateDemoAgentText(element.placeholder)
        : undefined,
      value: element.value ? truncateDemoAgentText(element.value) : undefined,
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
      const getDisabled = (element: Element) =>
        element.getAttribute("aria-disabled") === "true" ||
        ((element instanceof HTMLButtonElement ||
          element instanceof HTMLInputElement ||
          element instanceof HTMLSelectElement ||
          element instanceof HTMLTextAreaElement) &&
          element.disabled);
      const getSelected = (element: Element) => {
        if (
          element.getAttribute("aria-selected") === "true" ||
          element.getAttribute("aria-checked") === "true"
        ) {
          return true;
        }

        if (
          element instanceof HTMLInputElement &&
          (element.type === "checkbox" || element.type === "radio")
        ) {
          return element.checked;
        }

        return undefined;
      };
      const getValue = (element: Element) => {
        if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLSelectElement ||
          element instanceof HTMLTextAreaElement
        ) {
          return element.value;
        }

        return undefined;
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
            observed.push({
              disabled: getDisabled(element),
              name: getText(element),
              role: "button",
              selected: getSelected(element),
            });
          }
        });
      document.querySelectorAll("a[href],[role='link']").forEach((element) => {
        if (isVisible(element)) {
          observed.push({
            disabled: getDisabled(element),
            name: getText(element),
            role: "link",
          });
        }
      });
      document
        .querySelectorAll("input:not([type='hidden']),textarea,select")
        .forEach((element) => {
          if (isVisible(element)) {
            const label = getInputLabel(element);

            observed.push({
              disabled: getDisabled(element),
              label: label?.trim(),
              name: label?.trim() || getText(element),
              placeholder: element.getAttribute("placeholder") ?? undefined,
              role: "input",
              selected: getSelected(element),
              value: getValue(element),
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

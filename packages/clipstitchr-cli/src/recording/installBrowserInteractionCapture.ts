import type { Page } from "playwright";

export async function installBrowserInteractionCapture(page: Page) {
  await page.addInitScript(() => {
    const events: Array<{
      type: "click" | "mousemove";
      timestampMs: number;
      x: number;
      y: number;
      viewportWidth: number;
      viewportHeight: number;
    }> = [];
    const startedAt = performance.now();
    let lastMouseMoveAt = 0;

    function rememberInteraction(
      type: "click" | "mousemove",
      event: MouseEvent,
    ) {
      events.push({
        type,
        timestampMs: Math.max(0, Math.round(performance.now() - startedAt)),
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });

      if (events.length > 5000) {
        events.shift();
      }
    }

    window.addEventListener(
      "click",
      (event) => rememberInteraction("click", event),
      true,
    );
    window.addEventListener(
      "mousemove",
      (event) => {
        const now = performance.now();

        if (now - lastMouseMoveAt < 250) {
          return;
        }

        lastMouseMoveAt = now;
        rememberInteraction("mousemove", event);
      },
      true,
    );

    Object.assign(globalThis, {
      __clipstitchrGetInteractionEvents: () => events,
    });
  });
}

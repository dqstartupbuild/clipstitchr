import type { Page } from "playwright";
import { clickFirstAvailable } from "./clickFirstAvailable.js";
import { waitForDemoAgentPageToSettleAfterClick } from "./waitForDemoAgentPageToSettleAfterClick.js";

export async function runDemoAgentMediaAction(input: {
  mediaAction: "pause" | "play";
  page: Page;
  targetLabel?: string;
}) {
  if (input.targetLabel) {
    await clickFirstAvailable([
      input.page.getByRole("button", { name: input.targetLabel }),
      input.page.getByLabel(input.targetLabel),
      input.page.getByText(input.targetLabel, { exact: false }),
    ]);

    await waitForDemoAgentPageToSettleAfterClick(input.page);

    return;
  }

  await clickFirstAvailable([
    input.page.getByRole("button", {
      name: input.mediaAction === "play" ? /play/i : /pause/i,
    }),
  ]).catch(async () => {
    await input.page
      .locator("video,audio")
      .first()
      .evaluate((element, mediaAction) => {
        const media = element as HTMLMediaElement;

        return mediaAction === "play" ? media.play() : media.pause();
      }, input.mediaAction);
  });
}

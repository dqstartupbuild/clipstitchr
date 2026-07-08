import type { Page } from "playwright";
import { chooseDemoAgentLibraryFile } from "./chooseDemoAgentLibraryFile.js";
import { clickDemoAgentCardAction } from "./clickDemoAgentCardAction.js";
import { clickDemoAgentTargetAndSettle } from "./clickDemoAgentTargetAndSettle.js";
import { clickFirstAvailable } from "./clickFirstAvailable.js";
import type { DemoAgentValidatedAction } from "./DemoAgentValidatedAction.js";
import { getDemoAgentLocatorForClickTarget } from "./getDemoAgentLocatorForClickTarget.js";
import { runDemoAgentMediaAction } from "./runDemoAgentMediaAction.js";
import { setDemoAgentSliderValue } from "./setDemoAgentSliderValue.js";
import { waitForDemoAgentPageToSettleAfterClick } from "./waitForDemoAgentPageToSettleAfterClick.js";

export async function executeDemoAgentAction(input: {
  action: DemoAgentValidatedAction;
  page: Page;
}) {
  switch (input.action.type) {
    case "click":
      await clickDemoAgentTargetAndSettle(input.page, input.action.target);
      break;
    case "chooseFileFromLibrary":
      await chooseDemoAgentLibraryFile({
        mediaType: input.action.mediaType,
        page: input.page,
        searchText: input.action.searchText,
      });
      break;
    case "chooseMenuItem":
      await clickFirstAvailable([
        input.page.getByRole("menuitem", { name: input.action.name }),
        input.page.getByRole("option", { name: input.action.name }),
        input.page.getByRole("button", { name: input.action.name }),
        input.page.getByText(input.action.name, { exact: true }),
      ]);
      await waitForDemoAgentPageToSettleAfterClick(input.page);
      break;
    case "clearField":
      await input.page.getByLabel(input.action.target.label).fill("");
      break;
    case "clickCardAction":
      await clickDemoAgentCardAction({
        actionName: input.action.actionName,
        cardText: input.action.cardText,
        page: input.page,
      });
      break;
    case "clickFirstMatching":
      await clickDemoAgentTargetAndSettle(input.page, input.action.target);
      break;
    case "closeDialog":
      await input.page.keyboard.press("Escape");
      await waitForDemoAgentPageToSettleAfterClick(input.page);
      break;
    case "copyToClipboard":
      await clickDemoAgentTargetAndSettle(input.page, input.action.target);
      break;
    case "downloadFile": {
      const downloadPromise = input.page
        .waitForEvent("download", { timeout: 15_000 })
        .catch(() => undefined);

      await getDemoAgentLocatorForClickTarget(
        input.page,
        input.action.target,
      ).click();
      await downloadPromise;
      await waitForDemoAgentPageToSettleAfterClick(input.page);
      break;
    }
    case "dragAndDrop":
      await input.page
        .getByText(input.action.sourceText, { exact: false })
        .first()
        .dragTo(
          input.page
            .getByText(input.action.targetText, { exact: false })
            .first(),
        );
      await waitForDemoAgentPageToSettleAfterClick(input.page);
      break;
    case "finishStep":
    case "screenshot":
    case "stop":
      break;
    case "openMenu":
      await clickDemoAgentTargetAndSettle(input.page, input.action.target);
      break;
    case "playPauseMedia":
      await runDemoAgentMediaAction({
        mediaAction: input.action.mediaAction,
        page: input.page,
        targetLabel: input.action.targetLabel,
      });
      break;
    case "pressKey":
      if (input.action.target?.label) {
        await input.page.getByLabel(input.action.target.label).focus();
      }

      await input.page.keyboard.press(input.action.key);
      break;
    case "scroll":
      await input.page.mouse.wheel(
        0,
        input.action.direction === "down" ? 700 : -700,
      );
      await input.page.waitForTimeout(300);
      break;
    case "scrollToControl":
      await getDemoAgentLocatorForClickTarget(input.page, input.action.target)
        .scrollIntoViewIfNeeded({ timeout: 5000 });
      break;
    case "scrollToText":
      await input.page
        .getByText(input.action.text, { exact: false })
        .first()
        .scrollIntoViewIfNeeded({ timeout: 5000 });
      break;
    case "seekMedia":
      await input.page
        .locator("video,audio")
        .first()
        .evaluate((element, seconds) => {
          (element as HTMLMediaElement).currentTime = seconds;
        }, input.action.seconds);
      break;
    case "selectOption": {
      const action = input.action;

      await input.page
        .getByLabel(action.target.label)
        .first()
        .selectOption({ label: action.optionLabel })
        .catch(async () => {
          await input.page.getByLabel(action.target.label).click();
          await input.page
            .getByRole("option", { name: action.optionLabel })
            .first()
            .click();
        });
      await waitForDemoAgentPageToSettleAfterClick(input.page);
      break;
    }
    case "setMode":
      await clickFirstAvailable([
        input.page.getByRole("tab", { name: input.action.mode }),
        input.page.getByRole("button", { name: input.action.mode }),
        input.page.getByText(input.action.mode, { exact: true }),
      ]);
      await waitForDemoAgentPageToSettleAfterClick(input.page);
      break;
    case "setSlider":
      await setDemoAgentSliderValue({
        label: input.action.target.label,
        page: input.page,
        value: input.action.value,
      });
      break;
    case "toggle": {
      const action = input.action;

      await input.page
        .getByLabel(action.target.label)
        .setChecked(action.checked)
        .catch(async () => {
          await input.page.getByLabel(action.target.label).click();
        });
      await waitForDemoAgentPageToSettleAfterClick(input.page);
      break;
    }
    case "navigate":
      await input.page.goto(input.action.resolvedUrl ?? input.action.path, {
        waitUntil: "domcontentloaded",
      });
      await input.page
        .waitForLoadState("networkidle", { timeout: 5000 })
        .catch(() => {});
      break;
    case "type":
      await input.page
        .getByLabel(input.action.target.label)
        .fill(input.action.resolvedValue ?? "");
      break;
    case "uploadFile":
      if (input.action.target.label) {
        await input.page
          .getByLabel(input.action.target.label)
          .setInputFiles(input.action.resolvedFilePath ?? "");
      } else {
        await input.page
          .locator("input[type='file']")
          .first()
          .setInputFiles(input.action.resolvedFilePath ?? "");
      }
      break;
    case "waitFor":
      if (input.action.visibleText) {
        await input.page
          .getByText(input.action.visibleText, { exact: false })
          .first()
          .waitFor({
            state: "visible",
            timeout: input.action.timeoutMs,
          });
      } else if (input.action.resolvedUrl) {
        await input.page.waitForURL(input.action.resolvedUrl, {
          timeout: input.action.timeoutMs,
        });
      } else {
        await input.page
          .waitForLoadState("networkidle", {
            timeout: input.action.timeoutMs,
          })
          .catch(() => {});
      }
      break;
    case "waitForElementEnabled":
      await getDemoAgentLocatorForClickTarget(input.page, input.action.target)
        .click({ timeout: input.action.timeoutMs, trial: true });
      break;
    case "waitForJob":
      if (input.action.visibleText) {
        await input.page
          .getByText(input.action.visibleText, { exact: false })
          .first()
          .waitFor({
            state: "visible",
            timeout: input.action.timeoutMs,
          });
      } else if (input.action.statusText) {
        await input.page
          .getByText(input.action.statusText, { exact: false })
          .first()
          .waitFor({
            state: "visible",
            timeout: input.action.timeoutMs,
          });
      } else {
        await input.page
          .waitForLoadState("networkidle", {
            timeout: input.action.timeoutMs,
          })
          .catch(() => {});
      }
      break;
  }
}

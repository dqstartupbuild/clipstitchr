import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dispatchSlashCommand } from "../../dist/interactiveShell/dispatchSlashCommand.js";
import { createInteractiveShellTestServices } from "./createInteractiveShellTestServices.js";

describe("dispatchSlashCommand", () => {
  it("dispatches demo agent commands with quoted guide names", async () => {
    const calls: string[] = [];

    await dispatchSlashCommand({
      commandLine: '/demo agent --guide "upload flow" --no-upload',
      currentMenu: "main",
      options: {},
      services: createInteractiveShellTestServices(calls),
    });

    assert.deepEqual(calls, ["demo-agent:upload flow:false"]);
  });

  it("dispatches queue, products, Stitchr, and guide commands", async () => {
    const calls: string[] = [];
    const services = createInteractiveShellTestServices(calls);

    await dispatchSlashCommand({
      commandLine: "/queue stitch --all",
      currentMenu: "main",
      options: {},
      services,
    });
    await dispatchSlashCommand({
      commandLine: "/queue --all --product product_123",
      currentMenu: "main",
      options: {},
      services,
    });
    await dispatchSlashCommand({
      commandLine: "/products use product_123",
      currentMenu: "main",
      options: {},
      services,
    });
    await dispatchSlashCommand({
      commandLine: "/stitchr new --product product_123 --time-zone America/Detroit",
      currentMenu: "main",
      options: {},
      services,
    });
    await dispatchSlashCommand({
      commandLine: "/demo guide save-instructions guide_123 --output guide.md",
      currentMenu: "main",
      options: {},
      services,
    });

    assert.deepEqual(calls, [
      "queue-stitch:latest:true",
      "queue-all:product_123",
      "products-use:product_123",
      "stitchr-new:product_123:America/Detroit",
      "guide-save:guide_123:guide.md",
    ]);
  });

  it("can navigate by slash command", async () => {
    const result = await dispatchSlashCommand({
      commandLine: "/products",
      currentMenu: "main",
      options: {},
      services: createInteractiveShellTestServices([]),
    });

    assert.deepEqual(result, { menu: "products" });
  });
});

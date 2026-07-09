import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runProductsMenuAction } from "../../dist/productsMenu/runProductsMenuAction.js";
import { createProductsMenuTestServices } from "./createProductsMenuTestServices.js";

describe("runProductsMenuAction", () => {
  it("routes list, create, and use actions", async () => {
    const calls: string[] = [];
    const services = createProductsMenuTestServices(calls);

    await runProductsMenuAction({
      action: "list",
      options: {},
      services,
    });
    await runProductsMenuAction({
      action: "create",
      options: {},
      services,
    });
    await runProductsMenuAction({
      action: "use",
      options: {},
      services,
    });

    assert.deepEqual(calls, ["list", "create", "use:choose"]);
  });
});

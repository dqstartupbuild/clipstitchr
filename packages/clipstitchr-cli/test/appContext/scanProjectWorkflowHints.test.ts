import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { scanProjectWorkflowHints } from "../../dist/project/scanProjectWorkflowHints.js";

describe("scanProjectWorkflowHints", () => {
  it("captures Hook Lab workflow labels from component source", async () => {
    const projectCwd = await mkdtemp(join(tmpdir(), "clipstitchr-context-"));
    const componentDirectory = join(projectCwd, "app/_components/hooks");

    await mkdir(componentDirectory, { recursive: true });
    await writeFile(
      join(componentDirectory, "ProductHookMemoryFields.tsx"),
      `
        export function ProductHookMemoryFields() {
          return (
            <section>
              <SelectInput label="Main goal" />
              <SelectInput label="Tone" />
              <label>
                <span>Hooks to learn from</span>
                <textarea placeholder={"One hook per line.\\nMake the first line count"} />
              </label>
              <label>
                <span>Hooks to avoid</span>
                <textarea />
              </label>
              <button>Save Hook Lab</button>
              <button title="Save as winner">Accept hook</button>
              <button title="Add to avoid list">Reject hook</button>
            </section>
          );
        }
      `,
      "utf8",
    );

    const hints = await scanProjectWorkflowHints(projectCwd);
    const hookHint = hints.find((hint) => hint.routePath === "/dashboard/hooks");

    assert.ok(hookHint);
    assert.ok(hookHint.inputs.includes("Hooks to learn from"));
    assert.ok(hookHint.inputs.includes("Hooks to avoid"));
    assert.ok(hookHint.buttons.includes("Save Hook Lab"));
    assert.ok(hookHint.buttons.includes("Accept hook"));
    assert.ok(hookHint.buttons.includes("Reject hook"));
  });
});

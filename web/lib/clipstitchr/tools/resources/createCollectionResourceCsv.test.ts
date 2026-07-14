import { describe, expect, it } from "vitest";
import { appDemoVideoHooksDefinition } from "@/lib/clipstitchr/tools/appDemoVideoHooks/appDemoVideoHooksDefinition";
import { createCollectionResourceCsv } from "@/lib/clipstitchr/tools/resources/createCollectionResourceCsv";

describe("createCollectionResourceCsv", () => {
  it("exports every collection row with stable spreadsheet columns", () => {
    const csv = createCollectionResourceCsv(appDemoVideoHooksDefinition);

    expect(csv).toContain(
      "id,title,category,label,body,copy_text,tags",
    );
    expect(csv.split("\r\n")).toHaveLength(
      appDemoVideoHooksDefinition.items.length + 1,
    );
    expect(csv).toContain('"');
  });
});

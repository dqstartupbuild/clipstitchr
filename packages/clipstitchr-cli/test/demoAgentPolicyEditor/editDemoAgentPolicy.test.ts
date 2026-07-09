import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemoAgentPolicy } from "../../dist/demoAgent/createDemoAgentPolicy.js";
import { editDemoAgentPolicy } from "../../dist/demoAgentPolicyEditor/editDemoAgentPolicy.js";
import { createDemoAgentPolicyEditorTestPrompts } from "./createDemoAgentPolicyEditorTestPrompts.js";

describe("editDemoAgentPolicy", () => {
  it("keeps every current setting with one default answer", async () => {
    const calls: string[] = [];
    const policy = createDemoAgentPolicy({
      allowLiveOrigins: true,
      allowedOrigin: "https://clipstitchr.com",
      flows: [{ id: "dashboard", name: "Dashboard", path: "/dashboard" }],
    });
    const result = await editDemoAgentPolicy(
      policy,
      createDemoAgentPolicyEditorTestPrompts({
        calls,
        confirmAnswers: [false],
      }),
    );

    assert.deepEqual(calls, [
      "confirm:Change these safety settings?:false",
    ]);
    assert.equal(result.allowLiveOrigins, true);
    assert.deepEqual(result.allowedOrigins, ["https://clipstitchr.com"]);
    assert.deepEqual(result.allowedRoutes, ["/", "/dashboard"]);
  });

  it("edits values only after the user chooses to change them", async () => {
    const calls: string[] = [];
    const policy = createDemoAgentPolicy({
      allowedOrigin: "http://localhost:3000",
      flows: [],
    });
    const result = await editDemoAgentPolicy(
      policy,
      createDemoAgentPolicyEditorTestPrompts({
        calls,
        confirmAnswers: [true, false],
        inputAnswers: [
          "http://localhost:3000",
          "/, /dashboard",
          "40",
          "120",
          "email=test@example.com",
          "delete account",
          "Use the demo account",
        ],
      }),
    );

    assert.equal(result.maxActions, 40);
    assert.equal(result.maxRecordingSeconds, 120);
    assert.deepEqual(result.allowedRoutes, ["/", "/dashboard"]);
    assert.equal(result.allowFileUploads, false);
    assert.equal(result.testAccountNotes, "Use the demo account");
  });
});

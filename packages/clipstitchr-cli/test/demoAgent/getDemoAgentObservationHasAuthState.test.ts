import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDemoAgentObservationHasAuthState } from "../../dist/demoAgent/getDemoAgentObservationHasAuthState.js";
import type { DemoAgentPageObservation } from "../../src/demoAgent/DemoAgentPageObservation.js";

const emptyObservation: DemoAgentPageObservation = {
  buttons: [],
  canScrollDown: false,
  canScrollUp: false,
  dialogs: [],
  headings: [],
  inputs: [],
  links: [],
  title: "",
  url: "http://localhost:3000",
};

describe("getDemoAgentObservationHasAuthState", () => {
  it("detects visible sign-in pages", () => {
    assert.equal(
      getDemoAgentObservationHasAuthState({
        ...emptyObservation,
        buttons: [{ name: "Continue with Google", role: "button" }],
        headings: [{ name: "Sign in to your account", role: "heading" }],
        inputs: [{ name: "Password", role: "input" }],
      }),
      true,
    );
  });

  it("allows public marketing pages", () => {
    assert.equal(
      getDemoAgentObservationHasAuthState({
        ...emptyObservation,
        buttons: [{ name: "Watch demo", role: "button" }],
        headings: [{ name: "Make product videos faster", role: "heading" }],
      }),
      false,
    );
  });

  it("does not stop for a normal public sign-in link", () => {
    assert.equal(
      getDemoAgentObservationHasAuthState({
        ...emptyObservation,
        buttons: [{ name: "Sign in", role: "button" }],
        headings: [{ name: "Make product videos faster", role: "heading" }],
        links: [{ name: "Sign in", role: "link" }],
      }),
      false,
    );
  });
});

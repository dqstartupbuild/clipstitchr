import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInteractiveShellContext } from "../../dist/interactiveShell/getInteractiveShellContext.js";

describe("getInteractiveShellContext", () => {
  it("derives account, repo, and product context from local state", () => {
    assert.deepEqual(
      getInteractiveShellContext({
        config: {
          apiBaseUrl: "https://api.example.com",
          product: { name: "Demo product" },
          productId: "product_123",
        },
        credentials: {
          accessToken: "token",
          apiBaseUrl: "https://api.example.com",
          expiresAt: "2100-01-01T00:00:00.000Z",
          savedAt: "2026-01-01T00:00:00.000Z",
          sessionId: "session_123",
        },
        hasProjectConfig: true,
      }),
      {
        isAccountConnected: true,
        isRepoLinked: true,
        productLabel: "Demo product",
      },
    );
  });

  it("does not treat an empty config file as a linked repo", () => {
    assert.deepEqual(
      getInteractiveShellContext({
        config: {},
        credentials: null,
        hasProjectConfig: true,
      }),
      {
        isAccountConnected: false,
        isRepoLinked: false,
        productLabel: undefined,
      },
    );
  });
});

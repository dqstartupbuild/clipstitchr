import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDemoAgentCommandDriver } from "../../dist/demoAgent/resolveDemoAgentCommandDriver.js";

describe("resolveDemoAgentCommandDriver", () => {
  it("uses OpenAI Computer Use by default when the API key is available", () => {
    const previousApiKey = process.env.OPENAI_API_KEY;

    process.env.OPENAI_API_KEY = "test-openai-key";

    try {
      const resolvedDriver = resolveDemoAgentCommandDriver({});

      assert.equal(resolvedDriver.driver, "openai-computer");
      assert.equal(resolvedDriver.openAiComputer?.apiKey, "test-openai-key");
      assert.equal(resolvedDriver.openAiComputer?.mode, "direct");
      assert.equal(resolvedDriver.fallbackReason, undefined);
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("falls back by default when the API key is missing", () => {
    const previousApiKey = process.env.OPENAI_API_KEY;

    delete process.env.OPENAI_API_KEY;

    try {
      const resolvedDriver = resolveDemoAgentCommandDriver({});

      assert.equal(resolvedDriver.driver, "structured-planner");
      assert.match(String(resolvedDriver.fallbackReason), /OPENAI_API_KEY/);
      assert.equal(resolvedDriver.openAiComputer, undefined);
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("falls back when OpenAI Computer Use is selected without an API key", () => {
    const previousApiKey = process.env.OPENAI_API_KEY;

    delete process.env.OPENAI_API_KEY;

    try {
      const resolvedDriver = resolveDemoAgentCommandDriver({
        optionDriver: "openai-computer",
      });

      assert.equal(resolvedDriver.driver, "structured-planner");
      assert.match(String(resolvedDriver.fallbackReason), /OPENAI_API_KEY/);
      assert.equal(resolvedDriver.openAiComputer, undefined);
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("uses OpenAI Computer Use when the API key is available", () => {
    const previousApiKey = process.env.OPENAI_API_KEY;

    process.env.OPENAI_API_KEY = "test-openai-key";

    try {
      const resolvedDriver = resolveDemoAgentCommandDriver({
        configOpenAiModel: "gpt-5.5",
        optionDriver: "openai-computer",
      });

      assert.equal(resolvedDriver.driver, "openai-computer");
      assert.equal(resolvedDriver.openAiComputer?.apiKey, "test-openai-key");
      assert.equal(resolvedDriver.openAiComputer?.mode, "direct");
      assert.equal(resolvedDriver.openAiComputer?.model, "gpt-5.5");
      assert.equal(resolvedDriver.fallbackReason, undefined);
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("rejects unsupported driver names", () => {
    assert.throws(
      () =>
        resolveDemoAgentCommandDriver({
          optionDriver: "anthropic-computer",
        }),
      /structured-planner or --driver openai-computer/,
    );
  });

  it("uses relay when ClipStitchr credentials exist and no local key is available", () => {
    const previousApiKey = process.env.OPENAI_API_KEY;

    delete process.env.OPENAI_API_KEY;

    try {
      const resolvedDriver = resolveDemoAgentCommandDriver({
        relayCredentials: {
          accessToken: "clipstitchr-token",
          apiBaseUrl: "https://clipstitchr.test",
          expiresAt: "2999-01-01T00:00:00.000Z",
          savedAt: "2026-07-09T00:00:00.000Z",
          sessionId: "session_123",
        },
      });

      assert.equal(resolvedDriver.driver, "openai-computer");
      assert.equal(resolvedDriver.openAiComputer?.mode, "relay");
      assert.equal(
        resolvedDriver.openAiComputer?.credentials?.accessToken,
        "clipstitchr-token",
      );
      assert.equal(resolvedDriver.openAiComputer?.apiKey, undefined);
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });
});

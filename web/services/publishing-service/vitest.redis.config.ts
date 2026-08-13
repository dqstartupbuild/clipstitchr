import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/integration/ioredisPublishingSecurity.integration.test.ts",
    ],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["vendor/opencut/rewrite_supplied_8eefd45a/verification/*.test.mjs"],
  },
});

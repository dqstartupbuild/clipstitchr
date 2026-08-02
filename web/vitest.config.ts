import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "content-collections": path.resolve(
        __dirname,
        ".content-collections/generated/index.js",
      ),
    },
  },
  test: {
    environment: "node",
    exclude: [
      "**/node_modules/**",
      "services/publishing-service/tests/integration/**",
    ],
    coverage: {
      include: [
        "app/**/*.{ts,tsx}",
        "convex/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        ".content-collections/**",
        ".next/**",
        "app/**/*.png",
        "convex/_generated/**",
        "coverage/**",
        "next-env.d.ts",
      ],
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});

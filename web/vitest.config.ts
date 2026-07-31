import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

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
      ...configDefaults.exclude,
      ".next-browser-tests/**",
      ".next-validation/**",
      "browser-tests/**",
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
        ".next-browser-tests/**",
        ".next-validation/**",
        "app/_components/browser-tests/**",
        "app/browser-tests/**",
        "app/**/*.png",
        "browser-tests/**",
        "convex/_generated/**",
        "coverage/**",
        "next-env.d.ts",
      ],
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});

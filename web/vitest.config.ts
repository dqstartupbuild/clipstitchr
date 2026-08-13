import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@clipstitchr/publishing-service/assertions/createServiceAssertionSigningKey":
        path.resolve(
          __dirname,
          "services/publishing-service/src/assertions/createServiceAssertionSigningKey.ts",
        ),
      "@clipstitchr/publishing-service/assertions/issueServiceAssertion":
        path.resolve(
          __dirname,
          "services/publishing-service/src/assertions/issueServiceAssertion.ts",
        ),
      "@clipstitchr/publishing-service/media-gateway/normalizePublishingMediaPublicOrigin":
        path.resolve(
          __dirname,
          "services/publishing-service/src/media-gateway/normalizePublishingMediaPublicOrigin.ts",
        ),
      "@clipstitchr/publishing-service/media-gateway/PublishingMediaGatewayTokenError":
        path.resolve(
          __dirname,
          "services/publishing-service/src/media-gateway/PublishingMediaGatewayTokenError.ts",
        ),
      "@clipstitchr/publishing-service/media-gateway/sealPublishingMediaGatewayToken":
        path.resolve(
          __dirname,
          "services/publishing-service/src/media-gateway/sealPublishingMediaGatewayToken.ts",
        ),
      "@clipstitchr/publishing-service/media-gateway/validatePublishingMediaGatewayTokenClaims":
        path.resolve(
          __dirname,
          "services/publishing-service/src/media-gateway/validatePublishingMediaGatewayTokenClaims.ts",
        ),
      "@clipstitchr/publishing-service/media-gateway/verifyPublishingMediaGatewayToken":
        path.resolve(
          __dirname,
          "services/publishing-service/src/media-gateway/verifyPublishingMediaGatewayToken.ts",
        ),
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
      "services/publishing-service/**",
      "vendor/**",
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
        "services/publishing-service/**",
        "vendor/**",
      ],
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});

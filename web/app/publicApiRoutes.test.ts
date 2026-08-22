import { describe, expect, it } from "vitest";
import { GET as getApiIndex } from "@/app/api/v1/route";
import {
  GET as getHooks,
  POST as postHooks,
} from "@/app/api/v1/hooks/route";
import { GET as getOpenApi } from "@/app/openapi.json/route";

describe("public agent API routes", () => {
  it("publishes a discoverable API index", async () => {
    const response = getApiIndex();
    await expect(response.json()).resolves.toMatchObject({
      name: "ClipStitchr Public API",
      openapi: "/openapi.json",
      endpoints: [{ path: "/api/v1/hooks" }],
    });
  });

  it("publishes a function-call-ready OpenAPI document", async () => {
    const response = getOpenApi();
    const body = await response.json();
    expect(body).toMatchObject({ openapi: "3.1.1", info: { title: "ClipStitchr Public API" } });
    expect(body.paths["/api/v1/hooks"].post.operationId).toBe("generateClipStitchrAppAdHooks");
    expect(body.components.schemas.HookRequest.required).toContain("appName");
    expect(body.components.schemas.Error.properties.error.required).toEqual(["code", "message", "resolution"]);

    const operations = Object.values(body.paths).flatMap((pathItem) =>
      Object.values(pathItem as Record<string, { description?: string; operationId?: string }>),
    );
    const operationIds = operations.map((operation) => operation.operationId);

    expect(operationIds).toHaveLength(new Set(operationIds).size);
    expect(operations.every((operation) => Boolean(operation.description))).toBe(true);
  });

  it("aliases the deterministic hook handler", () => {
    expect(postHooks).toBeTypeOf("function");
  });

  it("returns a structured JSON error for unsupported hook methods", async () => {
    const response = getHooks();

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "method_not_allowed",
        message: "This method is not available for this endpoint.",
        resolution: "Use the method documented in /openapi.json.",
      },
    });
  });
});

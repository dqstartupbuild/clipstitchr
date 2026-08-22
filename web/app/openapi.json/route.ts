const openApiDocument = {
  openapi: "3.1.1",
  info: {
    title: "ClipStitchr Public API",
    version: "1.0.0",
    description: "A small unauthenticated API for deterministic ClipStitchr app-ad hook generation. Dashboard and media APIs are not public.",
  },
  servers: [{ url: "https://clipstitchr.com", description: "Production" }],
  paths: {
    "/api/v1": {
      get: {
        operationId: "getClipStitchrPublicApiCapabilities",
        description: "Discover public ClipStitchr API capabilities, documentation, and error contract.",
        responses: {
          "200": { description: "Public API capabilities.", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiIndex" } } } },
        },
      },
    },
    "/api/v1/hooks": {
      post: {
        operationId: "generateClipStitchrAppAdHooks",
        description: "Generate eight deterministic short-form app-ad hook ideas from a concise product brief. This endpoint shares the App Hook Generator per-client rate limit.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/HookRequest" }, examples: { focusTimer: { value: { appName: "Focus Timer", audience: "busy students", desiredOutcome: "start a focused session", problem: "procrastination", edgeLevel: "punchy", variationIndex: 1 } } } } } },
        responses: {
          "200": { description: "Eight generated hook ideas.", content: { "application/json": { schema: { $ref: "#/components/schemas/HookResponse" } } } },
          "400": { $ref: "#/components/responses/InvalidRequest" },
          "403": { $ref: "#/components/responses/OriginNotAllowed" },
          "413": { $ref: "#/components/responses/BodyTooLarge" },
          "415": { $ref: "#/components/responses/UnsupportedMediaType" },
          "429": { $ref: "#/components/responses/RateLimited" },
          "405": { $ref: "#/components/responses/MethodNotAllowed" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
  },
  components: {
    schemas: {
      ApiIndex: { type: "object", additionalProperties: false, required: ["name", "version", "openapi", "endpoints", "authentication", "errors"], properties: { name: { type: "string", example: "ClipStitchr Public API" }, version: { type: "string", example: "v1" }, openapi: { type: "string", format: "uri-reference", example: "/openapi.json" }, endpoints: { type: "array", items: { type: "object", additionalProperties: false, required: ["method", "path", "description"], properties: { method: { type: "string", example: "POST" }, path: { type: "string", example: "/api/v1/hooks" }, description: { type: "string" } } } }, authentication: { type: "string" }, errors: { $ref: "#/components/schemas/ApiErrorContract" } } },
      ApiErrorContract: { type: "object", additionalProperties: false, required: ["shape"], properties: { shape: { $ref: "#/components/schemas/Error" } } },
      HookRequest: { type: "object", additionalProperties: false, required: ["appName", "audience", "desiredOutcome", "problem", "edgeLevel"], properties: { appName: { type: "string", minLength: 2, maxLength: 80, description: "The app or product name." }, audience: { type: "string", minLength: 2, maxLength: 160, description: "Who the hook is for." }, desiredOutcome: { type: "string", minLength: 2, maxLength: 180, description: "The outcome the audience wants." }, problem: { type: "string", minLength: 2, maxLength: 240, description: "The problem the product helps solve." }, edgeLevel: { type: "string", enum: ["safe", "punchy", "bold"], description: "Writing intensity." }, variationIndex: { type: "integer", minimum: 0, maximum: 100, default: 0, description: "An optional deterministic variation selector." } } },
      Hook: { type: "object", required: ["angle", "reason", "text"], properties: { angle: { type: "string" }, reason: { type: "string" }, text: { type: "string" } } },
      HookResponse: { type: "object", required: ["hooks", "variationIndex"], properties: { hooks: { type: "array", minItems: 8, maxItems: 8, items: { $ref: "#/components/schemas/Hook" } }, variationIndex: { type: "integer" } } },
      Error: { type: "object", required: ["error"], properties: { error: { type: "object", required: ["code", "message", "resolution"], properties: { code: { type: "string", example: "invalid_request" }, message: { type: "string" }, resolution: { type: "string" } } } } },
    },
    responses: {
      InvalidRequest: { description: "The JSON body did not satisfy the request schema.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      OriginNotAllowed: { description: "A cross-site browser request was rejected.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      BodyTooLarge: { description: "The request body exceeded the allowed size.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      UnsupportedMediaType: { description: "The request was not sent as JSON.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      RateLimited: { description: "Too many requests were made. Honor Retry-After before retrying.", headers: { "Retry-After": { description: "Seconds until retry.", schema: { type: "integer", minimum: 1 } } }, content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      MethodNotAllowed: { description: "The HTTP method is not supported by this endpoint.", headers: { Allow: { description: "The supported HTTP method.", schema: { type: "string", const: "POST" } } }, content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      InternalError: { description: "An unexpected error occurred.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
    },
  },
} as const;

export function GET() {
  return Response.json(openApiDocument, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

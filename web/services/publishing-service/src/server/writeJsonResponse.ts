import type { ServerResponse } from "node:http";

export const writeJsonResponse = (
  response: ServerResponse,
  statusCode: number,
  body: unknown,
  omitBody = false,
): void => {
  const encodedBody = Buffer.from(JSON.stringify(body), "utf8");
  response.statusCode = statusCode;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Content-Length", encodedBody.byteLength);
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(omitBody ? undefined : encodedBody);
};

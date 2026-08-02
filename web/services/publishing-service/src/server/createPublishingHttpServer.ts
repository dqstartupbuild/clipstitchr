import { createServer, type RequestListener, type Server } from "node:http";

export const createPublishingHttpServer = (
  listener: RequestListener,
): Server => {
  const server = createServer(listener);

  server.headersTimeout = 10_000;
  server.requestTimeout = 20_000;
  server.keepAliveTimeout = 5_000;
  server.maxHeadersCount = 100;

  return server;
};

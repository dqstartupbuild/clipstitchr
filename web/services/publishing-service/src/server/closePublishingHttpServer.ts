import { once } from "node:events";
import type { Server } from "node:http";

export const closePublishingHttpServer = async (
  server: Server,
): Promise<void> => {
  if (!server.listening) {
    return;
  }

  const closed = once(server, "close").then(() => undefined);
  server.close();
  server.closeIdleConnections();
  let forceClose: NodeJS.Timeout | undefined;

  await Promise.race([
    closed,
    new Promise<void>((resolve) => {
      forceClose = setTimeout(() => {
        server.closeAllConnections();
        resolve();
      }, 5_000);
      forceClose.unref();
    }),
  ]);

  if (forceClose !== undefined) {
    clearTimeout(forceClose);
  }
};

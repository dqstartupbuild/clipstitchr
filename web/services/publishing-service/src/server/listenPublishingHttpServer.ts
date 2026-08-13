import type { Server } from "node:http";
import { once } from "node:events";

export const listenPublishingHttpServer = async (
  server: Server,
  host: string,
  port: number,
): Promise<void> => {
  server.listen(port, host);
  await once(server, "listening");
};

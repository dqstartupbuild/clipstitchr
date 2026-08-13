import type { IncomingHttpHeaders } from "node:http";

export type BoundedJsonRequest = Readonly<{
  headers: IncomingHttpHeaders;
  body: AsyncIterable<Uint8Array | string>;
}>;

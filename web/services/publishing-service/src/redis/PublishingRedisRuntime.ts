import type { IoredisPublishingSecurityCommands } from "./IoredisPublishingSecurityCommands.js";

export interface PublishingRedisRuntime {
  readonly commands: IoredisPublishingSecurityCommands;
  connect(): Promise<void>;
  assertReady(): Promise<void>;
  close(): Promise<void>;
}

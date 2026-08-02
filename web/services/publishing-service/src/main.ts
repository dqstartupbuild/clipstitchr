import { runPublishingService } from "./runtime/runPublishingService.js";

void runPublishingService(process.env).catch(() => {
  process.exitCode = 1;
});

import type { PublishingServiceHealthReport } from "./PublishingServiceHealthReport.js";

export const createPublishingServiceHealthReport =
  (): PublishingServiceHealthReport =>
    Object.freeze({
      service: "clipstitchr-publishing-service",
      status: "ok",
      version: 1,
    });

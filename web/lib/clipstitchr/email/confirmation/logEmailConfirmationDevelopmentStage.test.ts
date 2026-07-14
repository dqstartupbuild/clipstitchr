import { afterEach, describe, expect, it, vi } from "vitest";
import { logEmailConfirmationDevelopmentStage } from "@/lib/clipstitchr/email/confirmation/logEmailConfirmationDevelopmentStage";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("logEmailConfirmationDevelopmentStage", () => {
  it("logs only a bounded stage in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    logEmailConfirmationDevelopmentStage("csrf-rejected");

    expect(info).toHaveBeenCalledWith("[email-confirmation] csrf-rejected");
  });

  it("does not log confirmation status outside development", () => {
    vi.stubEnv("NODE_ENV", "production");
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    logEmailConfirmationDevelopmentStage("confirmed");

    expect(info).not.toHaveBeenCalled();
  });
});

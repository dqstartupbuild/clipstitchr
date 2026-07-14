import { describe, expect, it } from "vitest";
import { getClipStitchrDeploymentEnvironment } from "./getClipStitchrDeploymentEnvironment";

describe("getClipStitchrDeploymentEnvironment", () => {
  it("accepts only the two explicit deployment values", () => {
    expect(getClipStitchrDeploymentEnvironment(" development ")).toBe(
      "development",
    );
    expect(getClipStitchrDeploymentEnvironment("production")).toBe(
      "production",
    );
    expect(getClipStitchrDeploymentEnvironment("preview")).toBeNull();
    expect(getClipStitchrDeploymentEnvironment(undefined)).toBeNull();
  });
});

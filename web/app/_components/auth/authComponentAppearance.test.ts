import { describe, expect, it } from "vitest";
import { authComponentAppearance } from "@/app/_components/auth/authComponentAppearance";

describe("authComponentAppearance", () => {
  it("sets an explicit readable Clerk surface and primary action", () => {
    expect(authComponentAppearance.variables.colorBackground).toBe("#f5f0e9");
    expect(authComponentAppearance.variables.colorForeground).toBe("#201510");
    expect(authComponentAppearance.variables.colorMutedForeground).toBe(
      "#725f53",
    );
    expect(authComponentAppearance.variables.colorPrimary).toBe("#7d4934");
    expect(authComponentAppearance.variables.colorPrimaryForeground).toBe(
      "#fff7f1",
    );
    expect(authComponentAppearance.variables).not.toHaveProperty("colorText");
    expect(authComponentAppearance.variables).not.toHaveProperty(
      "colorTextSecondary",
    );
    expect(authComponentAppearance.variables).not.toHaveProperty(
      "colorTextOnPrimaryBackground",
    );
    expect(authComponentAppearance.elements.card.backgroundColor).toBe(
      "#f5f0e9",
    );
    expect(authComponentAppearance.elements.headerTitle.color).toBe(
      "#201510",
    );
    expect(authComponentAppearance.elements.formButtonPrimary.color).toBe(
      "#fff7f1",
    );
  });
});

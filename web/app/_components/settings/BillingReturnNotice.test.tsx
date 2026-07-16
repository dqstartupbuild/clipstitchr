import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BillingReturnNotice } from "@/app/_components/settings/BillingReturnNotice";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useSyncExternalStore: () => "success",
  };
});

describe("BillingReturnNotice", () => {
  it("announces the Stripe return result as a polite status", () => {
    const markup = renderToStaticMarkup(<BillingReturnNotice />);

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Payment received");
  });
});

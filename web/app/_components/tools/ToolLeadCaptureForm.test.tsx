import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";

const mocks = vi.hoisted(() => ({
  useToolLeadCapture: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/tools/toolLeads/useToolLeadCapture", () => ({
  useToolLeadCapture: mocks.useToolLeadCapture,
}));

describe("ToolLeadCaptureForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useToolLeadCapture.mockReturnValue({
      email: "",
      errorMessage: "",
      isSubmitted: false,
      isSubmitting: false,
      name: "",
      setEmail: vi.fn(),
      setName: vi.fn(),
      submit: vi.fn(),
    });
  });

  it("renders the paid-product mailing-list contract", () => {
    const markup = renderToStaticMarkup(
      <ToolLeadCaptureForm source="ad-variant-calculator" />,
    );

    expect(markup).toContain("Get the next app-marketing tool.");
    expect(markup).toContain("Join the mailing list");
    expect(markup).toContain("ClipStitchr is a paid product");
    expect(markup).toContain('href="/privacy"');
    expect(markup).toContain('autoComplete="name"');
    expect(markup).toContain('type="email"');
    expect(mocks.useToolLeadCapture).toHaveBeenCalledWith(
      "ad-variant-calculator",
    );
  });

  it("renders submitted and submitting states", () => {
    mocks.useToolLeadCapture.mockReturnValueOnce({
      email: "ada@example.com",
      errorMessage: "",
      isSubmitted: false,
      isSubmitting: true,
      name: "Ada",
      setEmail: vi.fn(),
      setName: vi.fn(),
      submit: vi.fn(),
    });
    const submittingMarkup = renderToStaticMarkup(
      <ToolLeadCaptureForm source="app-hook-generator" />,
    );

    mocks.useToolLeadCapture.mockReturnValueOnce({
      email: "",
      errorMessage: "",
      isSubmitted: true,
      isSubmitting: false,
      name: "",
      setEmail: vi.fn(),
      setName: vi.fn(),
      submit: vi.fn(),
    });
    const submittedMarkup = renderToStaticMarkup(
      <ToolLeadCaptureForm source="app-hook-generator" />,
    );

    expect(submittingMarkup).toContain("Joining...");
    expect(submittingMarkup).toContain("disabled");
    expect(submittedMarkup).toContain("You are on the list.");
  });
});

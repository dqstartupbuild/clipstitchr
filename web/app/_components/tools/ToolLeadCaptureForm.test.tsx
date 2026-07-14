import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { PublicToolConfirmationReadinessProvider } from "@/app/_components/tools/gates/PublicToolConfirmationReadinessProvider";

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
    expect(markup).toContain("Join the ClipStitchr mailing list");
    expect(markup).not.toContain("previously opted-out email addresses");
    expect(markup).not.toContain("Email follow-up is not available yet");
    expect(markup).toContain("ClipStitchr is a paid product");
    expect(markup).toContain('href="/privacy"');
    expect(markup).not.toContain('href="/terms"');
    expect(markup).toContain('autoComplete="name"');
    expect(markup).toContain('type="email"');
    expect(markup.match(/required=""/g)).toHaveLength(2);
    expect(markup).toContain('data-ph-no-capture="true"');
    expect(mocks.useToolLeadCapture).toHaveBeenCalledWith(
      "ad-variant-calculator",
      { gateMode: "open-result", variant: "control" },
    );
  });

  it("uses the configured outcome and approved gate variant", () => {
    const markup = renderToStaticMarkup(
      <ToolLeadCaptureForm
        gateMode="useful-preview"
        isEmailProviderReady
        outcomeCta="Unlock all 8 hooks"
        source="app-hook-generator"
        unlockOutcome="all 8 hooks"
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("Unlock all 8 hooks.");
    expect(markup).toContain("Unlock all 8 hooks");
    expect(markup).toContain(
      "If your email needs confirming, we will ask before any marketing emails start.",
    );
    expect(markup).not.toContain("Email follow-up is not available yet");
    expect(mocks.useToolLeadCapture).toHaveBeenCalledWith(
      "app-hook-generator",
      { gateMode: "useful-preview", variant: "hybrid-v1" },
    );
  });

  it("uses server-provided confirmation readiness for gate copy", () => {
    const disabledMarkup = renderToStaticMarkup(
      <PublicToolConfirmationReadinessProvider isConfirmationReady={false}>
        <ToolLeadCaptureForm
          source="app-hook-generator"
          variant="hybrid-v1"
        />
      </PublicToolConfirmationReadinessProvider>,
    );
    const readyMarkup = renderToStaticMarkup(
      <PublicToolConfirmationReadinessProvider isConfirmationReady>
        <ToolLeadCaptureForm
          source="app-hook-generator"
          variant="hybrid-v1"
        />
      </PublicToolConfirmationReadinessProvider>,
    );

    expect(disabledMarkup).toContain(
      "Email follow-up is not available yet.",
    );
    expect(disabledMarkup).not.toContain("If your email needs confirming");
    expect(readyMarkup).toContain("If your email needs confirming");
    expect(readyMarkup).not.toContain(
      "Email follow-up is not available yet.",
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
    expect(submittedMarkup).toContain("Your details are saved.");
    expect(submittedMarkup).toContain(
      "Email updates will start only when delivery is available.",
    );
    expect(submittedMarkup).not.toMatch(/land in your inbox|sent|delivered/i);
  });

  it("does not promise delivery from the control path", () => {
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

    const markup = renderToStaticMarkup(
      <ToolLeadCaptureForm
        isEmailProviderReady
        source="app-hook-generator"
      />,
    );

    expect(markup).toContain("Your details are saved.");
    expect(markup).toContain(
      "Email updates will start only when delivery is available.",
    );
    expect(markup).not.toMatch(/land in your inbox|sent|delivered/i);
  });

  it("uses non-enumerating success copy when email is ready", () => {
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

    const markup = renderToStaticMarkup(
      <ToolLeadCaptureForm
        isEmailProviderReady
        source="app-hook-generator"
        variant="hybrid-v1"
      />,
    );

    expect(markup).toContain("If this email needs confirming");
    expect(markup).not.toContain("new contact");
    expect(markup).not.toContain("existing contact");
    expect(markup).not.toContain("You are on the list");
  });
});

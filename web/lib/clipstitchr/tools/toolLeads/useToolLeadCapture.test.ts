import type { FormEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useToolLeadCapture } from "@/lib/clipstitchr/tools/toolLeads/useToolLeadCapture";

const mocks = vi.hoisted(() => ({
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  setPublicToolBrowserUnlocked: vi.fn(),
  stateQueue: [] as unknown[],
  submitToolLead: vi.fn(),
  trackPublicToolAnalyticsEvent: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : initialValue;
      const setState = vi.fn();

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
  };
});

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/setPublicToolBrowserUnlocked",
  () => ({
    setPublicToolBrowserUnlocked: mocks.setPublicToolBrowserUnlocked,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/trackPublicToolAnalyticsEvent",
  () => ({
    trackPublicToolAnalyticsEvent: mocks.trackPublicToolAnalyticsEvent,
  }),
);

vi.mock("@/lib/clipstitchr/tools/toolLeads/submitToolLead", () => ({
  submitToolLead: mocks.submitToolLead,
}));

describe("useToolLeadCapture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setStateCalls = [];
    mocks.stateQueue = ["Ada Founder", "ada@example.com", "", false, false];
    mocks.submitToolLead.mockResolvedValue({ accepted: true });
  });

  it("submits through the fixed endpoint helper and tracks opaque acceptance", async () => {
    const leadCapture = useToolLeadCapture("app-hook-generator", {
      gateMode: "useful-preview",
      variant: "hybrid-v1",
    });
    const preventDefault = vi.fn();

    await leadCapture.submit({
      preventDefault,
    } as unknown as FormEvent<HTMLFormElement>);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(mocks.submitToolLead).toHaveBeenCalledWith({
      email: "ada@example.com",
      name: "Ada Founder",
      source: "app-hook-generator",
    });
    expect(mocks.setPublicToolBrowserUnlocked).toHaveBeenCalledOnce();
    expect(mocks.trackPublicToolAnalyticsEvent).toHaveBeenCalledWith(
      "tool_lead_accepted",
      {
        gateMode: "useful-preview",
        toolKey: "app-hook-generator",
        variant: "hybrid-v1",
      },
    );
    expect(
      JSON.stringify(mocks.trackPublicToolAnalyticsEvent.mock.calls),
    ).not.toMatch(/ada@example\.com|Ada Founder/);
    expect(mocks.setStateCalls[4]).toHaveBeenCalledWith(true);
  });

  it("shows one generic error without tracking acceptance", async () => {
    mocks.submitToolLead.mockRejectedValue(new Error("Private detail"));
    const leadCapture = useToolLeadCapture("ad-variant-calculator");

    await leadCapture.submit({
      preventDefault: vi.fn(),
    } as unknown as FormEvent<HTMLFormElement>);

    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith(
      "We could not save your spot right now. Please try again.",
    );
    expect(mocks.setPublicToolBrowserUnlocked).not.toHaveBeenCalled();
    expect(mocks.trackPublicToolAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("uses backward-compatible control defaults", async () => {
    const leadCapture = useToolLeadCapture("ad-variant-calculator");

    await leadCapture.submit({
      preventDefault: vi.fn(),
    } as unknown as FormEvent<HTMLFormElement>);

    expect(mocks.trackPublicToolAnalyticsEvent).toHaveBeenCalledWith(
      "tool_lead_accepted",
      {
        gateMode: "open-result",
        toolKey: "ad-variant-calculator",
        variant: "control",
      },
    );
    expect(mocks.setPublicToolBrowserUnlocked).not.toHaveBeenCalled();
  });
});

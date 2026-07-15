import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WaitlistForm } from "@/app/_components/auth/WaitlistForm";

const mocks = vi.hoisted(() => ({
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  submitWaitlistEntry: vi.fn(),
  trackPostHogEvent: vi.fn(),
  trackTikTokButtonClick: vi.fn(),
  trackWaitlistSignupConversion: vi.fn(),
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

vi.mock("convex/react", () => ({
  useMutation: () => mocks.submitWaitlistEntry,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    waitlist: {
      submit: "waitlist.submit",
    },
  },
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: mocks.trackTikTokButtonClick,
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

vi.mock("@/lib/clipstitchr/analytics/trackWaitlistSignupConversion", () => ({
  trackWaitlistSignupConversion: mocks.trackWaitlistSignupConversion,
}));

function findElements(
  value: unknown,
  predicate: (element: {
    props?: Record<string, unknown>;
    type?: unknown;
  }) => boolean,
): Array<{ props: Record<string, unknown>; type?: unknown }> {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child) => findElements(child, predicate));
  }

  const element = value as {
    props?: { children?: unknown };
    type?: unknown;
  };
  const matches = predicate(
    element as { props?: Record<string, unknown>; type?: unknown },
  )
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [...matches, ...findElements(element.props?.children, predicate)];
}

describe("WaitlistForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.submitWaitlistEntry.mockResolvedValue({ status: "created" });
  });

  it("renders the private beta waitlist form", () => {
    const markup = renderToStaticMarkup(<WaitlistForm />);

    expect(markup).toContain("Invite-only beta");
    expect(markup).toContain("Join the waitlist");
    expect(markup).toContain('autoComplete="name"');
    expect(markup).toContain('type="email"');
    expect(markup).toContain("Join waitlist");
    expect(markup).toContain('href="/sign-in"');
  });

  it("submits waitlist details and tracks successful joins", async () => {
    mocks.stateQueue = ["Ada Lovelace", "ada@example.com", "", false, false];
    const tree = WaitlistForm();
    const [form] = findElements(tree, (element) => element.type === "form");
    const preventDefault = vi.fn();

    await (
      form.props.onSubmit as (event: {
        preventDefault: () => void;
      }) => Promise<void>
    )({ preventDefault });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(mocks.submitWaitlistEntry).toHaveBeenCalledWith({
      email: "ada@example.com",
      name: "Ada Lovelace",
    });
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "waitlist_form_submitted",
      { location: "sign_up_page" },
    );
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith("waitlist_joined", {
      location: "sign_up_page",
      status: "created",
    });
    expect(mocks.trackTikTokButtonClick).toHaveBeenCalledWith({
      contentCategory: "Waitlist",
      contentId: "waitlist_submit_button",
      contentName: "Join waitlist",
    });
    expect(mocks.trackWaitlistSignupConversion).toHaveBeenCalledWith({
      email: "ada@example.com",
    });
    expect(mocks.setStateCalls[3]).toHaveBeenCalledWith(true);
    expect(mocks.setStateCalls[4]).toHaveBeenCalledWith(true);
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith("");
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith("");
    expect(mocks.setStateCalls[3]).toHaveBeenCalledWith(false);
  });

  it("maps server waitlist errors to user-facing messages", async () => {
    mocks.submitWaitlistEntry.mockRejectedValue(
      new Error("Too many waitlist submissions"),
    );
    mocks.stateQueue = ["Ada Lovelace", "ada@example.com", "", false, false];

    const tree = WaitlistForm();
    const [form] = findElements(tree, (element) => element.type === "form");

    await (
      form.props.onSubmit as (event: {
        preventDefault: () => void;
      }) => Promise<void>
    )({ preventDefault: vi.fn() });

    expect(mocks.setStateCalls[2]).toHaveBeenCalledWith(
      "Too many waitlist submissions. Try again later.",
    );
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "waitlist_join_failed",
      {
        error_category: "rate_limited",
        location: "sign_up_page",
      },
    );
    expect(mocks.setStateCalls[3]).toHaveBeenCalledWith(false);
  });

  it("maps validation and unknown waitlist errors to tracked categories", async () => {
    const cases = [
      {
        category: "invalid_name",
        message: "name between",
        userMessage: "Enter a name between 2 and 120 characters.",
      },
      {
        category: "invalid_email",
        message: "valid email address",
        userMessage: "Enter a valid email address.",
      },
      {
        category: "unknown",
        message: "unexpected failure",
        userMessage: "Unable to join the waitlist right now.",
      },
    ];

    for (const testCase of cases) {
      vi.clearAllMocks();
      mocks.setStateCalls = [];
      mocks.stateQueue = ["Ada Lovelace", "ada@example.com", "", false, false];
      mocks.submitWaitlistEntry.mockRejectedValueOnce(
        new Error(testCase.message),
      );

      const tree = WaitlistForm();
      const [form] = findElements(tree, (element) => element.type === "form");

      await (
        form.props.onSubmit as (event: {
          preventDefault: () => void;
        }) => Promise<void>
      )({ preventDefault: vi.fn() });

      expect(mocks.setStateCalls[2]).toHaveBeenCalledWith(testCase.userMessage);
      expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
        "waitlist_join_failed",
        {
          error_category: testCase.category,
          location: "sign_up_page",
        },
      );
    }
  });

  it("renders inline errors, updates fields, and skips conversion for existing entries", async () => {
    mocks.stateQueue = [
      "Ada Lovelace",
      "ada@example.com",
      "Existing error",
      false,
      false,
    ];
    mocks.submitWaitlistEntry.mockResolvedValueOnce({ status: "existing" });
    const tree = WaitlistForm();
    const markup = renderToStaticMarkup(tree);
    const inputs = findElements(tree, (element) => element.type === "input");
    const [form] = findElements(tree, (element) => element.type === "form");

    (
      inputs[0].props.onChange as (event: { target: { value: string } }) => void
    )({ target: { value: "Grace Hopper" } });
    (
      inputs[1].props.onChange as (event: { target: { value: string } }) => void
    )({ target: { value: "grace@example.com" } });
    await (
      form.props.onSubmit as (event: {
        preventDefault: () => void;
      }) => Promise<void>
    )({ preventDefault: vi.fn() });

    expect(markup).toContain("Existing error");
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith("Grace Hopper");
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith("grace@example.com");
    expect(mocks.trackWaitlistSignupConversion).not.toHaveBeenCalled();
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith("waitlist_joined", {
      location: "sign_up_page",
      status: "existing",
    });
  });

  it("renders submitted and submitting states", () => {
    mocks.stateQueue = ["Ada Lovelace", "ada@example.com", "", true, false];
    const submittingMarkup = renderToStaticMarkup(<WaitlistForm />);

    mocks.stateQueue = ["", "", "", false, true];
    const submittedMarkup = renderToStaticMarkup(<WaitlistForm />);

    expect(submittingMarkup).toContain("Joining...");
    expect(submittingMarkup).toContain("disabled");
    expect(submittedMarkup).toContain("You are on the list.");
  });
});

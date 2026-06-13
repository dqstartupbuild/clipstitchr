import { describe, expect, it, vi } from "vitest";
import { StitchSocialCaptionField } from "@/app/_components/stitches/StitchSocialCaptionField";

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

describe("StitchSocialCaptionField", () => {
  it("passes the caption and copy callbacks to the copy button", () => {
    const socialCaption = "Caption hook\n\n#ugc #demo #win";
    const onCopyError = vi.fn();
    const onCopySuccess = vi.fn();
    const tree = StitchSocialCaptionField({
      copyMessage: null,
      onChange: vi.fn(),
      onCopyError,
      onCopySuccess,
      socialCaption,
    });
    const copyButton = findElements(
      tree,
      (element) =>
        element.props?.socialCaption === socialCaption &&
        element.props?.onCopyError === onCopyError &&
        element.props?.onCopySuccess === onCopySuccess,
    )[0];

    expect(copyButton).toBeDefined();
  });
});

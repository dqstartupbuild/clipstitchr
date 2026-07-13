import { Children, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdVariantNumberField } from "@/app/_components/tools/ad-variant-calculator/AdVariantNumberField";

const mocks = vi.hoisted(() => ({
  setDraftValue: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useState: () => [null, mocks.setDraftValue],
  };
});

describe("AdVariantNumberField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets a visitor clear the field while editing without forcing zero", () => {
    const onChange = vi.fn();
    const field = AdVariantNumberField({
      description: "Example count",
      id: "example-count",
      label: "Examples",
      onChange,
      value: 8,
    }) as ReactElement<{ children: ReactElement[] }>;
    const input = Children.toArray(field.props.children).find(
      (child) =>
        typeof child === "object" &&
        child !== null &&
        "type" in child &&
        child.type === "input",
    ) as ReactElement<{
      onBlur: (event: {
        currentTarget: { value: string; valueAsNumber: number };
      }) => void;
      onChange: (event: {
        currentTarget: { value: string; valueAsNumber: number };
      }) => void;
    }>;

    input.props.onChange({
      currentTarget: { value: "", valueAsNumber: Number.NaN },
    });
    input.props.onBlur({
      currentTarget: { value: "", valueAsNumber: Number.NaN },
    });

    expect(mocks.setDraftValue).toHaveBeenNthCalledWith(1, "");
    expect(mocks.setDraftValue).toHaveBeenNthCalledWith(2, null);
    expect(onChange).not.toHaveBeenCalled();
  });
});

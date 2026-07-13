import { Children, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";

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

describe("ToolNumberField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows an empty editing draft without changing the calculation", () => {
    const onChange = vi.fn();
    const field = ToolNumberField({
      description: "Example amount",
      id: "example-amount",
      label: "Amount",
      max: 100,
      onChange,
      step: 0.01,
      value: 25,
    }) as ReactElement<{ children: ReactElement[] }>;
    const inputContainer = Children.toArray(field.props.children)[1] as
      | ReactElement<{ children: ReactElement[] }>
      | undefined;
    const input = Children.toArray(inputContainer?.props.children).find(
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

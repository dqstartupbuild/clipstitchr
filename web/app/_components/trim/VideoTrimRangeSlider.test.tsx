import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VideoTrimRangeSlider } from "@/app/_components/trim/VideoTrimRangeSlider";

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

describe("VideoTrimRangeSlider", () => {
  it("renders finite trim percentages and clamps start/end changes", () => {
    const onChange = vi.fn();
    const tree = VideoTrimRangeSlider({
      duration: 20,
      id: "clip",
      onChange,
      value: {
        end: 15,
        start: 5,
      },
    });
    const markup = renderToStaticMarkup(tree);
    const inputs = findElements(tree, (element) => element.type === "input");

    (inputs[0].props.onChange as (event: { target: { value: string } }) => void)(
      { target: { value: "12" } },
    );
    (inputs[1].props.onChange as (event: { target: { value: string } }) => void)(
      { target: { value: "19" } },
    );

    expect(markup).toContain('id="clip-start"');
    expect(markup).toContain('id="clip-end"');
    expect(markup).toContain("left:25%");
    expect(markup).toContain("right:25%");
    expect(inputs[0].props.disabled).toBe(false);
    expect(inputs[1].props.disabled).toBe(false);
    expect(onChange).toHaveBeenNthCalledWith(1, {
      end: 15,
      start: 12,
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      end: 19,
      start: 5,
    });
  });

  it("falls back to a disabled zero-duration range for non-finite durations", () => {
    const onChange = vi.fn();
    const tree = VideoTrimRangeSlider({
      duration: Number.NaN,
      id: "empty",
      onChange,
      value: {
        end: 10,
        start: 2,
      },
    });
    const markup = renderToStaticMarkup(tree);
    const inputs = findElements(tree, (element) => element.type === "input");

    (inputs[0].props.onChange as (event: { target: { value: string } }) => void)(
      { target: { value: "3" } },
    );

    expect(markup).toContain("left:0%");
    expect(markup).toContain("right:0%");
    expect(inputs[0].props.disabled).toBe(true);
    expect(inputs[1].props.disabled).toBe(true);
    expect(inputs[0].props.max).toBe(0);
    expect(inputs[1].props.max).toBe(0);
    expect(onChange).toHaveBeenCalledWith({
      end: 0,
      start: 0,
    });
  });
});

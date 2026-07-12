import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStartHookLabIdeaUseAction } from "@/lib/clipstitchr/hooks/useStartHookLabIdeaUseAction";

const mocks = vi.hoisted(() => ({
  setError: vi.fn(),
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  setStatusMessage: vi.fn(),
  startHookLabIdeaUse: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => {
    const setter = vi.fn();
    const value =
      typeof initialValue === "function"
        ? (initialValue as () => unknown)()
        : initialValue;

    mocks.setStateCalls.push(setter);

    return [value, setter];
  },
}));

vi.mock("@/lib/clipstitchr/client/startHookLabIdeaUse", () => ({
  startHookLabIdeaUse: mocks.startHookLabIdeaUse,
}));

describe("useStartHookLabIdeaUseAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setStateCalls = [];
    mocks.startHookLabIdeaUse.mockResolvedValue({
      useId: "use_1",
      variantIds: ["variant_1", "variant_2", "variant_3"],
    });
  });

  it("attaches a returned use without replacing sibling Ideas", async () => {
    const action = useStartHookLabIdeaUseAction({
      setError: mocks.setError,
      setStatusMessage: mocks.setStatusMessage,
    });

    await expect(action.useIdea("idea_1", "product_1", 3)).resolves.toEqual({
      useId: "use_1",
      variantIds: ["variant_1", "variant_2", "variant_3"],
    });

    const currentUseStateUpdate = mocks.setStateCalls
      .flatMap((setter) => setter.mock.calls.map(([value]) => value))
      .find((value) => typeof value === "function") as
      | ((current: Record<string, string>) => Record<string, string>)
      | undefined;

    expect(currentUseStateUpdate).toBeTypeOf("function");
    expect(currentUseStateUpdate?.({ idea_2: "use_2" })).toEqual({
      idea_1: "use_1",
      idea_2: "use_2",
    });
  });
});

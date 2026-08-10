import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocialPublishingBatchQueueDialog } from "@/app/_components/socialPublishing/SocialPublishingBatchQueueDialog";
import { fetchSocialPublishingAccountOptions } from "@/lib/clipstitchr/client/fetchSocialPublishingAccountOptions";
import { queueSocialPublishingBatchItems } from "@/lib/clipstitchr/client/queueSocialPublishingBatchItems";
import type { SocialPublishingBatchQueueItem } from "@/lib/clipstitchr/types/SocialPublishingBatchQueueItem";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

const mocks = vi.hoisted(() => ({
  effectDependencies: [] as unknown[][],
  previousEffectDependencies: undefined as unknown[] | undefined,
  queueLock: { current: false },
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  useEffect: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
    useMemo: (factory: () => unknown) => factory(),
    useRef: () => mocks.queueLock,
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : typeof initialValue === "function"
          ? (initialValue as () => unknown)()
          : initialValue;
      const setState = vi.fn();

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
  };
});

vi.mock("@/lib/clipstitchr/client/fetchSocialPublishingAccountOptions", () => ({
  fetchSocialPublishingAccountOptions: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/queueSocialPublishingBatchItems", () => ({
  queueSocialPublishingBatchItems: vi.fn(),
}));

const ACCOUNT: SocialPublishingSocialAccount = {
  displayName: "Creator",
  id: "account_12",
  isActive: true,
  needsReconnection: false,
  platform: "instagram",
  profileId: "profile_1",
  username: "creator",
};

function createItem(id: string): SocialPublishingBatchQueueItem {
  return {
    caption: `Caption ${id}`,
    id,
    productId: "product_1",
    renderMedia: vi.fn(),
    sourceType: "swipe",
    title: `Swipe ${id}`,
  };
}

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

function setDialogState({
  completedCount = 0,
  isAccountLoading = false,
  progress = 0,
  status = "idle",
}: {
  completedCount?: number;
  isAccountLoading?: boolean;
  progress?: number;
  status?: "idle" | "queueing" | "complete";
} = {}) {
  mocks.stateQueue = [
    [ACCOUNT],
    [ACCOUNT.id],
    ["Caption one", "Caption two"],
    0,
    null,
    "none",
    "brand_organic",
    false,
    "",
    completedCount,
    progress,
    status,
    isAccountLoading,
    null,
  ];
}

function getQueueButton(tree: unknown) {
  return findElements(
    tree,
    (element) =>
      typeof element.type === "function" &&
      element.type.name === "Button" &&
      element.props?.variant !== "secondary",
  )[0];
}

describe("SocialPublishingBatchQueueDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.effectDependencies = [];
    mocks.previousEffectDependencies = undefined;
    mocks.queueLock.current = false;
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.useEffect.mockImplementation(
      (
        effect: () => void | (() => void),
        dependencies: unknown[] = [],
      ) => {
        if (dependencies.length !== 1 || dependencies[0] !== "product_1") {
          return;
        }

        mocks.effectDependencies.push(dependencies);
        const previousDependencies = mocks.previousEffectDependencies;
        const didChange =
          !previousDependencies ||
          dependencies.some(
            (dependency, index) =>
              !Object.is(dependency, previousDependencies[index]),
          );

        mocks.previousEffectDependencies = dependencies;

        if (didChange) {
          effect();
        }
      },
    );
    vi.mocked(fetchSocialPublishingAccountOptions).mockResolvedValue({
      accounts: [ACCOUNT],
      defaultSocialAccountIds: [ACCOUNT.id],
    });
  });

  it("keeps active progress visible when a parent passes a fresh items array", async () => {
    const firstItems = [createItem("one"), createItem("two")];

    setDialogState({ completedCount: 1, progress: 0.6, status: "queueing" });
    SocialPublishingBatchQueueDialog({
      items: firstItems,
      onClose: vi.fn(),
    });
    const firstStatusSetter = mocks.setStateCalls[8];

    setDialogState({ completedCount: 1, progress: 0.6, status: "queueing" });
    const tree = SocialPublishingBatchQueueDialog({
      items: [...firstItems],
      onClose: vi.fn(),
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(fetchSocialPublishingAccountOptions).toHaveBeenCalledOnce();
    expect(fetchSocialPublishingAccountOptions).toHaveBeenCalledWith("product_1");
    expect(mocks.effectDependencies).toEqual([
      ["product_1"],
      ["product_1"],
    ]);
    expect(firstStatusSetter).not.toHaveBeenCalled();
    expect(
      findElements(tree, (element) => element.props?.role === "status"),
    ).toHaveLength(1);
    expect(getQueueButton(tree).props.isLoading).toBe(true);
  });

  it("starts only one batch when the queue button is pressed twice", async () => {
    let rejectQueue: ((reason?: unknown) => void) | undefined;
    const pendingQueue = new Promise<void>((_resolve, reject) => {
      rejectQueue = reject;
    });

    vi.mocked(queueSocialPublishingBatchItems).mockReturnValue(pendingQueue);
    setDialogState();
    const tree = SocialPublishingBatchQueueDialog({
      items: [createItem("one"), createItem("two")],
      onClose: vi.fn(),
    });
    const queueButton = getQueueButton(tree);
    const pressQueue = queueButton.props.onClick as () => void;

    pressQueue();
    pressQueue();

    expect(queueSocialPublishingBatchItems).toHaveBeenCalledOnce();
    expect(mocks.queueLock.current).toBe(true);

    rejectQueue?.(new Error("Try again."));
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.queueLock.current).toBe(false);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { materializeStudioStitchOutput } from "./materializeStudioStitchOutput";

const mocks = vi.hoisted(() => ({
  mutation: vi.fn(),
  query: vi.fn(),
  secret: vi.fn(() => "worker-secret-value-that-is-long-enough"),
  verify: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("./getStudioStitchConvexClient", () => ({
  getStudioStitchConvexClient: async () => ({
    mutation: mocks.mutation,
    query: mocks.query,
  }),
}));
vi.mock("./getStudioStitchMaterializationSecret", () => ({
  getStudioStitchMaterializationSecret: mocks.secret,
}));
vi.mock("./verifyStudioStitchOutputObject", () => ({
  verifyStudioStitchOutputObject: mocks.verify,
}));

describe("materializeStudioStitchOutput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutation
      .mockResolvedValueOnce({ reserved: true })
      .mockResolvedValueOnce({ created: true });
    mocks.query.mockResolvedValue({ id: "output_1" });
    mocks.verify.mockResolvedValue({ sha256: "a".repeat(64) });
  });

  it("reserves an authenticated Product read before the R2 proof request", async () => {
    await expect(
      materializeStudioStitchOutput("output_1", {
        idempotencyKey: "materialize_1",
        productId: "product_1",
      }),
    ).resolves.toEqual({ created: true });

    expect(mocks.mutation.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.query.mock.invocationCallOrder[0],
    );
    expect(mocks.query.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.verify.mock.invocationCallOrder[0],
    );
    expect(mocks.verify.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.mutation.mock.invocationCallOrder[1],
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCliprTextGeneration } from "@/lib/clipstitchr/server/createCliprTextGeneration";
import { getUgcDiscoveryHookOpener } from "@/lib/clipstitchr/server/getUgcDiscoveryHookOpener";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const mocks = vi.hoisted(() => ({
  getCompletedReplicatePredictionOutputText: vi.fn(),
  parseCliprTextGenerationOutput: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText",
  () => ({
    getCompletedReplicatePredictionOutputText:
      mocks.getCompletedReplicatePredictionOutputText,
  }),
);

vi.mock("@/lib/clipstitchr/server/parseCliprTextGenerationOutput", () => ({
  parseCliprTextGenerationOutput: mocks.parseCliprTextGenerationOutput,
}));

const product: ProductProfile = {
  audienceDetails: "People beginning calisthenics at home",
  cliprPlaceholderFillers: {
    habit: ["random workouts"],
    problem: ["unclear progress"],
    topic: ["calisthenics"],
    workflow: ["home training"],
  },
  createdAt: "2026-07-25T00:00:00.000Z",
  id: "guppy",
  inferredPainPoints: ["not knowing which exercise comes next"],
  inferredProblem: "calisthenics progress feels unclear",
  name: "Guppy",
  productDetails: "Guided calisthenics workouts and progress tracking.",
  updatedAt: "2026-07-25T00:00:00.000Z",
};

function createReplicate() {
  let predictionCount = 0;
  const create = vi.fn(async (request: unknown) => {
    void request;
    predictionCount += 1;

    return { id: `prediction_${predictionCount}` };
  });

  return {
    create,
    replicate: {
      predictions: { create },
    } as unknown as Parameters<
      typeof createCliprTextGeneration
    >[0]["replicate"],
  };
}

describe("createCliprTextGeneration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getCompletedReplicatePredictionOutputText.mockResolvedValue(
      "model output",
    );
  });

  it("retries malformed Stitchr JSON with a compact response instruction", async () => {
    const { create, replicate } = createReplicate();
    let expectedHook = "";

    mocks.parseCliprTextGenerationOutput
      .mockImplementationOnce(() => {
        throw new SyntaxError("Unexpected end of JSON input");
      })
      .mockImplementationOnce(({ candidates }) => {
        const assignedCandidate = candidates[0];

        expectedHook = `${getUgcDiscoveryHookOpener(
          assignedCandidate.id,
        )} home training can start this simply`;

        return {
          filledHook: expectedHook,
          hookTemplateId: assignedCandidate.id,
        };
      });

    const generation = await createCliprTextGeneration({
      durationSeconds: 30,
      product,
      purpose: "stitchr",
      replicate,
      slideCount: 1,
      stitchrHookVariationSeed: "stitchr-batch:run:2",
    });

    expect(generation).toEqual(
      expect.objectContaining({
        filledHook: expectedHook,
        providerPredictionId: "prediction_2",
      }),
    );
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        input: expect.objectContaining({
          max_tokens: 3200,
        }),
      }),
    );
    expect(create.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        input: expect.objectContaining({
          prompt: expect.stringContaining(
            "Your previous response was unusable",
          ),
        }),
      }),
    );
  });

  it("uses a grounded fallback after two malformed Stitchr responses", async () => {
    const { create, replicate } = createReplicate();

    mocks.parseCliprTextGenerationOutput
      .mockImplementationOnce(() => {
        throw new SyntaxError("Unexpected end of JSON input");
      })
      .mockImplementationOnce(() => {
        throw new SyntaxError("Unexpected end of JSON input");
      })
      .mockImplementationOnce(({ outputText }) => {
        const output = JSON.parse(outputText);

        return {
          filledHook: output.filledHook,
          hookTemplateId: output.templateId,
        };
      });

    const generation = await createCliprTextGeneration({
      durationSeconds: 30,
      product,
      purpose: "stitchr",
      replicate,
      slideCount: 1,
      stitchrHookVariationSeed: "stitchr-batch:run:5",
    });

    expect(create).toHaveBeenCalledTimes(2);
    expect(mocks.parseCliprTextGenerationOutput).toHaveBeenCalledTimes(3);
    expect(generation.providerPredictionId).toBe("prediction_2");
    expect(generation.filledHook).toEqual(expect.any(String));
    expect(generation.filledHook).not.toHaveLength(0);
  });

  it("retries valid JSON that ignores the assigned opener", async () => {
    const { create, replicate } = createReplicate();
    let expectedHook = "";

    mocks.parseCliprTextGenerationOutput
      .mockImplementationOnce(({ candidates }) => ({
        filledHook: "not me repeating the same opener again",
        hookTemplateId: candidates[0].id,
      }))
      .mockImplementationOnce(({ candidates }) => {
        const assignedCandidate = candidates[0];

        expectedHook = `${getUgcDiscoveryHookOpener(
          assignedCandidate.id,
        )} the next workout was already clear`;

        return {
          filledHook: expectedHook,
          hookTemplateId: assignedCandidate.id,
        };
      });

    const generation = await createCliprTextGeneration({
      durationSeconds: 30,
      product,
      purpose: "stitchr",
      replicate,
      slideCount: 1,
      stitchrHookVariationSeed: "stitchr-batch:run:2",
    });

    expect(create).toHaveBeenCalledTimes(2);
    expect(generation.filledHook).toBe(expectedHook);
    expect(generation.filledHook).not.toMatch(/^not me\b/i);
  });

  it("falls back when the repair provider attempt fails", async () => {
    const { create, replicate } = createReplicate();

    mocks.getCompletedReplicatePredictionOutputText
      .mockResolvedValueOnce("model output")
      .mockRejectedValueOnce(new Error("Provider timed out"));
    mocks.parseCliprTextGenerationOutput
      .mockImplementationOnce(() => {
        throw new SyntaxError("Unexpected end of JSON input");
      })
      .mockImplementationOnce(({ outputText }) => {
        const output = JSON.parse(outputText);

        return {
          filledHook: output.filledHook,
          hookTemplateId: output.templateId,
        };
      });

    const generation = await createCliprTextGeneration({
      durationSeconds: 30,
      product,
      purpose: "stitchr",
      replicate,
      slideCount: 1,
      stitchrHookVariationSeed: "stitchr-batch:run:4",
    });

    expect(create).toHaveBeenCalledTimes(2);
    expect(generation.filledHook).toEqual(expect.any(String));
    expect(generation.providerPredictionId).toBe("prediction_1");
  });

  it("returns ten varied Batch hooks when every model response is malformed", async () => {
    const { create, replicate } = createReplicate();

    mocks.parseCliprTextGenerationOutput.mockImplementation(
      ({ outputText }) => {
        if (outputText === "model output") {
          throw new SyntaxError("Unexpected end of JSON input");
        }

        const output = JSON.parse(outputText);

        return {
          filledHook: output.filledHook,
          hookTemplateId: output.templateId,
        };
      },
    );

    const generations = [];

    for (let index = 0; index < 10; index += 1) {
      generations.push(
        await createCliprTextGeneration({
          durationSeconds: 30,
          product,
          purpose: "stitchr",
          replicate,
          slideCount: 1,
          stitchrHookVariationSeed: `stitchr-batch:run:${index + 1}`,
        }),
      );
    }

    const hooks = generations.map((generation) => generation.filledHook);

    expect(create).toHaveBeenCalledTimes(20);
    expect(generations).toHaveLength(10);
    expect(hooks.every(Boolean)).toBe(true);
    expect(new Set(hooks).size, JSON.stringify(hooks)).toBe(10);
  });
});

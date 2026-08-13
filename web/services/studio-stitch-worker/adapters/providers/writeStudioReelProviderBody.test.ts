import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { writeStudioReelProviderBody } from "./writeStudioReelProviderBody";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  );
});

async function createOutputPath() {
  const directory = await mkdtemp(join(tmpdir(), "stitch-provider-test-"));
  directories.push(directory);
  return join(directory, "video.mp4");
}

function createResponse(
  chunks: readonly Uint8Array[],
  declared?: number,
  keepOpen = false,
) {
  const cancel = vi.fn();
  let index = 0;
  return {
    cancel,
    response: new Response(
      new ReadableStream<Uint8Array>({
        cancel,
        pull(controller) {
          const chunk = chunks[index++];
          if (chunk) controller.enqueue(chunk);
          else if (!keepOpen) controller.close();
        },
      }),
      {
        headers:
          declared === undefined
            ? undefined
            : { "content-length": String(declared) },
      },
    ),
  };
}

describe("writeStudioReelProviderBody", () => {
  it("streams a body without Content-Length to disk", async () => {
    const outputPath = await createOutputPath();
    const input = createResponse([
      new Uint8Array([1, 2]),
      new Uint8Array([3, 4]),
    ]);
    await expect(
      writeStudioReelProviderBody({
        maximumBytes: 4,
        outputPath,
        response: input.response,
      }),
    ).resolves.toBe(4);
    expect(await readFile(outputPath)).toEqual(Buffer.from([1, 2, 3, 4]));
  });

  it("cancels a body whose Content-Length understates the actual bytes", async () => {
    const outputPath = await createOutputPath();
    const input = createResponse(
      [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])],
      2,
      true,
    );
    await expect(
      writeStudioReelProviderBody({
        maximumBytes: 5,
        outputPath,
        response: input.response,
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_MEDIA_TOO_LARGE" });
    expect(input.cancel).toHaveBeenCalledOnce();
  });
});

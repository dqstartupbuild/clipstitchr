import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSlashCommandOptions } from "../../dist/interactiveShell/parseSlashCommandOptions.js";

describe("parseSlashCommandOptions", () => {
  it("parses values, booleans, and negative booleans", () => {
    assert.deepEqual(
      parseSlashCommandOptions({
        booleanOptions: ["upload"],
        tokens: ["--guide", "upload flow", "--no-upload", "clip.mp4"],
        valueOptions: ["guide"],
      }),
      {
        options: {
          guide: "upload flow",
          upload: false,
        },
        positionals: ["clip.mp4"],
      },
    );
  });

  it("allows value options to have negative boolean forms", () => {
    assert.deepEqual(
      parseSlashCommandOptions({
        tokens: ["--guide", "upload flow", "--no-guide"],
        valueOptions: ["guide"],
      }),
      {
        options: {
          guide: false,
        },
        positionals: [],
      },
    );
  });

  it("rejects unknown options", () => {
    assert.throws(
      () => parseSlashCommandOptions({ tokens: ["--wat"] }),
      /Unknown option --wat/,
    );
  });
});

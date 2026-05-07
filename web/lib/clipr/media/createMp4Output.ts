import { BufferTarget, Mp4OutputFormat, Output } from "mediabunny";

export function createMp4Output() {
  return new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });
}

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getNextInteractiveTuiResultStartIndex } from "../../dist/interactiveTui/getNextInteractiveTuiResultStartIndex.js";

describe("getNextInteractiveTuiResultStartIndex", () => {
  it("moves one line with up and down controls", () => {
    assert.equal(
      getNextInteractiveTuiResultStartIndex({
        currentIndex: 4,
        direction: "down",
        lineCount: 20,
        pageSize: 10,
      }),
      5,
    );
    assert.equal(
      getNextInteractiveTuiResultStartIndex({
        currentIndex: 4,
        direction: "up",
        lineCount: 20,
        pageSize: 10,
      }),
      3,
    );
  });

  it("moves a full page with page controls", () => {
    assert.equal(
      getNextInteractiveTuiResultStartIndex({
        currentIndex: 2,
        direction: "page-down",
        lineCount: 30,
        pageSize: 10,
      }),
      12,
    );
    assert.equal(
      getNextInteractiveTuiResultStartIndex({
        currentIndex: 12,
        direction: "page-up",
        lineCount: 30,
        pageSize: 10,
      }),
      2,
    );
  });

  it("jumps to the beginning and end", () => {
    assert.equal(
      getNextInteractiveTuiResultStartIndex({
        currentIndex: 7,
        direction: "home",
        lineCount: 30,
        pageSize: 10,
      }),
      0,
    );
    assert.equal(
      getNextInteractiveTuiResultStartIndex({
        currentIndex: 7,
        direction: "end",
        lineCount: 30,
        pageSize: 10,
      }),
      20,
    );
  });

  it("clamps movement to the available output", () => {
    assert.equal(
      getNextInteractiveTuiResultStartIndex({
        currentIndex: 0,
        direction: "up",
        lineCount: 5,
        pageSize: 10,
      }),
      0,
    );
    assert.equal(
      getNextInteractiveTuiResultStartIndex({
        currentIndex: 9,
        direction: "page-down",
        lineCount: 15,
        pageSize: 10,
      }),
      5,
    );
  });
});

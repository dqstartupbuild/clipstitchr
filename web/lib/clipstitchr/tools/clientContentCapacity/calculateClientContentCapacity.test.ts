import { describe, expect, it } from "vitest";
import { calculateClientContentCapacity } from "@/lib/clipstitchr/tools/clientContentCapacity/calculateClientContentCapacity";
import { defaultClientContentCapacityInput } from "@/lib/clipstitchr/tools/clientContentCapacity/defaultClientContentCapacityInput";

describe("calculateClientContentCapacity", () => {
  it("finds the limiting stage and weekly client capacity", () => {
    const result = calculateClientContentCapacity(
      defaultClientContentCapacityInput,
    );

    expect(result.weeklyDeliverableCapacity).toBe(12);
    expect(result.limitingStage?.key).toBe("editing");
    expect(result.clientCapacity).toBe(4);
    expect(result.utilizationPercent).toBe(100);
    expect(result.isOverCapacity).toBe(false);
  });

  it("does not fabricate capacity when a stage has no effort estimate", () => {
    const result = calculateClientContentCapacity({
      ...defaultClientContentCapacityInput,
      editing: { availableHoursPerWeek: 30, hoursPerDeliverable: 0 },
    });

    expect(result.weeklyDeliverableCapacity).toBeNull();
    expect(result.clientCapacity).toBeNull();
    expect(result.limitingStage).toBeNull();
  });

  it("flags commitments when entered productive capacity is zero", () => {
    const result = calculateClientContentCapacity({
      ...defaultClientContentCapacityInput,
      productiveTimePercent: 0,
    });

    expect(result.weeklyDeliverableCapacity).toBe(0);
    expect(result.utilizationPercent).toBeNull();
    expect(result.isOverCapacity).toBe(true);
  });
});

import type { LoopsClient } from "loops";
import { describe, expect, it, vi } from "vitest";
import { sendLoopsWorkflowEvent } from "@/lib/clipstitchr/email/loops/sendLoopsWorkflowEvent";

describe("sendLoopsWorkflowEvent", () => {
  it("sends one allowlisted event with the durable operation key", async () => {
    const sendEvent = vi.fn().mockResolvedValue({ success: true });

    await sendLoopsWorkflowEvent({
      client: { sendEvent } as Pick<LoopsClient, "sendEvent">,
      developmentRecipientList: "person@example.com",
      eventName: "tool_lead_captured",
      gateMode: "useful-preview",
      idempotencyKey: "email_operation_123",
      leadSegment: "hooks-and-messaging",
      providerContactKey: "provider_opaque_key",
      recipientEmail: "person@example.com",
      teamEnvironment: "development",
      toolKey: "app-hook-generator",
      workflowVersion: "v1",
    });

    expect(sendEvent).toHaveBeenCalledWith({
      userId: "provider_opaque_key",
      eventName: "tool_lead_captured",
      eventProperties: {
        gateMode: "useful-preview",
        leadSegment: "hooks-and-messaging",
        toolKey: "app-hook-generator",
        workflowVersion: "v1",
      },
      headers: { "Idempotency-Key": "email_operation_123" },
    });
  });

  it("rejects an arbitrary event before the SDK call", () => {
    const sendEvent = vi.fn();

    expect(() =>
      sendLoopsWorkflowEvent({
        client: { sendEvent } as unknown as Pick<LoopsClient, "sendEvent">,
        developmentRecipientList: "person@example.com",
        eventName: "visitor_supplied_event",
        gateMode: "open-result",
        idempotencyKey: "email_operation_123",
        leadSegment: "hooks-and-messaging",
        providerContactKey: "provider_opaque_key",
        recipientEmail: "person@example.com",
        teamEnvironment: "development",
        toolKey: "app-hook-generator",
        workflowVersion: "v1",
      }),
    ).toThrow("The Loops workflow event is not approved.");
    expect(sendEvent).not.toHaveBeenCalled();
  });
});

import type { LoopsClient } from "loops";
import { describe, expect, it, vi } from "vitest";
import { sendLoopsConfirmationEmail } from "@/lib/clipstitchr/email/loops/sendLoopsConfirmationEmail";

describe("sendLoopsConfirmationEmail", () => {
  it("sends only the confirmation URL without adding the address to the audience", async () => {
    const sendTransactionalEmail = vi.fn().mockResolvedValue({ success: true });

    await sendLoopsConfirmationEmail({
      client: { sendTransactionalEmail } as Pick<
        LoopsClient,
        "sendTransactionalEmail"
      >,
      confirmationUrl: "https://example.com/email/confirm?id=opaque&signature=signed",
      developmentRecipientList: "person@example.com",
      idempotencyKey: "email_operation_456",
      recipientEmail: "person@example.com",
      teamEnvironment: "development",
      transactionalId: "transactional_confirmation",
    });

    expect(sendTransactionalEmail).toHaveBeenCalledWith({
      transactionalId: "transactional_confirmation",
      email: "person@example.com",
      addToAudience: false,
      dataVariables: {
        confirmationUrl:
          "https://example.com/email/confirm?id=opaque&signature=signed",
      },
      headers: { "Idempotency-Key": "email_operation_456" },
    });
    expect(sendTransactionalEmail.mock.calls[0]?.[0]).not.toHaveProperty(
      "attachments",
    );
  });
});

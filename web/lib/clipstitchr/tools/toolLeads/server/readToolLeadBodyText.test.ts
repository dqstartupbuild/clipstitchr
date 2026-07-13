import { describe, expect, it, vi } from "vitest";
import { readToolLeadBodyText } from "@/lib/clipstitchr/tools/toolLeads/server/readToolLeadBodyText";
import { toolLeadMaxBodyBytes } from "@/lib/clipstitchr/tools/toolLeads/server/toolLeadMaxBodyBytes";

describe("readToolLeadBodyText", () => {
  it("rejects a declared oversized body before reading it", async () => {
    const request = new Request("https://clipstitchr.test/tool-lead", {
      body: "{}",
      headers: {
        "content-length": String(toolLeadMaxBodyBytes + 1),
      },
      method: "POST",
    });

    await expect(readToolLeadBodyText(request)).rejects.toMatchObject({
      status: 413,
    });
  });

  it("cancels a streamed body immediately after it crosses the byte cap", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      cancel,
      start(controller) {
        controller.enqueue(new Uint8Array(toolLeadMaxBodyBytes));
        controller.enqueue(new Uint8Array(1));
      },
    });
    const request = new Request("https://clipstitchr.test/tool-lead", {
      body: stream,
      method: "POST",
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    await expect(readToolLeadBodyText(request)).rejects.toMatchObject({
      status: 413,
    });
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("joins bounded chunks into one UTF-8 string", async () => {
    const request = new Request("https://clipstitchr.test/tool-lead", {
      body: "Hello, founder",
      method: "POST",
    });

    await expect(readToolLeadBodyText(request)).resolves.toBe("Hello, founder");
  });
});

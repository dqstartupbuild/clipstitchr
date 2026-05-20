import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";

describe("downloadBlob", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("downloads a blob through a temporary anchor and revokes the object URL", () => {
    vi.useFakeTimers();

    const click = vi.fn();
    const remove = vi.fn();
    const anchor = {
      click,
      download: "",
      href: "",
      remove,
      style: {
        display: "",
      },
    };
    const append = vi.fn();
    const createObjectURL = vi.fn(() => "blob:clip");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });
    vi.stubGlobal("document", {
      body: {
        append,
      },
      createElement: vi.fn(() => anchor),
    });
    vi.stubGlobal("window", {
      setTimeout,
    });

    downloadBlob(new Blob(["video"]), "clip.mp4");

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchor.href).toBe("blob:clip");
    expect(anchor.download).toBe("clip.mp4");
    expect(anchor.style.display).toBe("none");
    expect(append).toHaveBeenCalledWith(anchor);
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();

    vi.runAllTimers();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:clip");
  });
});

import { describe, expect, it } from "vitest";
import { getHookLabIpAddressIsPublic } from "@/lib/clipstitchr/server/hookLab/getHookLabIpAddressIsPublic";

describe("getHookLabIpAddressIsPublic", () => {
  it("allows public IPv4 and IPv6 addresses", () => {
    expect(getHookLabIpAddressIsPublic("93.184.216.34")).toBe(true);
    expect(getHookLabIpAddressIsPublic("2606:4700:4700::1111")).toBe(true);
  });

  it.each([
    "127.0.0.1",
    "10.0.0.2",
    "169.254.169.254",
    "192.168.1.4",
    "0.0.0.0",
    "::1",
    "fd00:ec2::254",
    "fe80::1",
    "::ffff:127.0.0.1",
    "2001:db8::1",
  ])("rejects non-public address %s", (address) => {
    expect(getHookLabIpAddressIsPublic(address)).toBe(false);
  });
});

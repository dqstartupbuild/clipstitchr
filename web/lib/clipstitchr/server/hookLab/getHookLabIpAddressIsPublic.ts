import { isIP } from "node:net";

export function getHookLabIpAddressIsPublic(input: string): boolean {
  const address = input.trim().toLowerCase().split("%")[0];
  const version = isIP(address);

  if (version === 4) {
    const octets = address.split(".").map(Number);

    if (octets.length !== 4 || octets.some((octet) => octet < 0 || octet > 255)) {
      return false;
    }

    const [first, second, third] = octets;

    return !(
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 0 && third === 0) ||
      (first === 192 && second === 0 && third === 2) ||
      (first === 192 && second === 88 && third === 99) ||
      (first === 192 && second === 168) ||
      (first === 198 && (second === 18 || second === 19)) ||
      (first === 198 && second === 51 && third === 100) ||
      (first === 203 && second === 0 && third === 113) ||
      first >= 224
    );
  }

  if (version !== 6) {
    return false;
  }

  const dottedTail = address.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  let normalizedAddress = address;

  if (dottedTail) {
    const octets = dottedTail[2].split(".").map(Number);

    if (
      octets.length !== 4 ||
      octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
    ) {
      return false;
    }

    normalizedAddress = `${dottedTail[1]}${((octets[0] << 8) | octets[1]).toString(16)}:${((octets[2] << 8) | octets[3]).toString(16)}`;
  }

  const halves = normalizedAddress.split("::");

  if (halves.length > 2) {
    return false;
  }

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const zeroCount = halves.length === 2 ? 8 - left.length - right.length : 0;
  const groups = [
    ...left,
    ...Array.from({ length: zeroCount }, () => "0"),
    ...right,
  ].map((group) => Number.parseInt(group || "0", 16));

  if (
    groups.length !== 8 ||
    groups.some((group) => !Number.isInteger(group) || group < 0 || group > 0xffff)
  ) {
    return false;
  }

  if (
    groups.slice(0, 5).every((group) => group === 0) &&
    groups[5] === 0xffff
  ) {
    const mappedAddress = [
      groups[6] >> 8,
      groups[6] & 0xff,
      groups[7] >> 8,
      groups[7] & 0xff,
    ].join(".");

    return getHookLabIpAddressIsPublic(mappedAddress);
  }

  const first = groups[0];
  const second = groups[1];

  return (
    (first & 0xe000) === 0x2000 &&
    !(first === 0x2001 && second === 0x0db8) &&
    !(first === 0x2001 && second === 0x0010) &&
    !(first === 0x2001 && (second & 0xfff0) === 0x0020) &&
    first !== 0x2002
  );
}

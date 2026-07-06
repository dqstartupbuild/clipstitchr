import { randomInt } from "node:crypto";

const cliUserCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createCliUserCode() {
  const firstGroup = Array.from({ length: 4 }, () =>
    cliUserCodeAlphabet[randomInt(cliUserCodeAlphabet.length)],
  ).join("");
  const secondGroup = Array.from({ length: 4 }, () =>
    cliUserCodeAlphabet[randomInt(cliUserCodeAlphabet.length)],
  ).join("");

  return `${firstGroup}-${secondGroup}`;
}

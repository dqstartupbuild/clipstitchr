import type { ClipNamingSystemInput } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingSystemInput";
import type { ClipNamingSystemResult } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingSystemResult";
import { clipNamingTokenLabels } from "@/lib/clipstitchr/tools/clipNamingSystem/clipNamingTokenLabels";
import { clipNamingTokens } from "@/lib/clipstitchr/tools/clipNamingSystem/clipNamingTokens";
import { sanitizeClipNameToken } from "@/lib/clipstitchr/tools/clipNamingSystem/sanitizeClipNameToken";

export function generateClipNamingSystem(
  input: ClipNamingSystemInput,
): ClipNamingSystemResult {
  const tokenOrder = [
    ...input.tokenOrder.filter(
      (token, index, order) =>
        clipNamingTokens.includes(token) && order.indexOf(token) === index,
    ),
    ...clipNamingTokens.filter((token) => !input.tokenOrder.includes(token)),
  ];
  const values = Object.fromEntries(
    clipNamingTokens.map((token) => [
      token,
      sanitizeClipNameToken(input[token], input.separator),
    ]),
  ) as Record<(typeof clipNamingTokens)[number], string>;
  const filename = `${tokenOrder.map((token) => values[token]).join(input.separator)}.mp4`;
  const convention = `${tokenOrder
    .map((token) => `[${token}]`)
    .join(input.separator)}.[extension]`;

  return {
    convention,
    examples: [
      filename,
      `${tokenOrder
        .map((token) =>
          token === "concept"
            ? `${values[token]}${input.separator}alt`
            : values[token],
        )
        .join(input.separator)}.mov`,
      `${tokenOrder
        .map((token) => (token === "version" ? "v02" : values[token]))
        .join(input.separator)}.webm`,
    ],
    filename,
    legend: tokenOrder.map((token) => ({
      label: clipNamingTokenLabels[token],
      token,
      value: values[token],
    })),
  };
}

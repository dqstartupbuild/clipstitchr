import type { ClipPublishingTokenKind } from "@prisma/client";

import type { ProviderTokenKind } from "../tokens/ProviderTokenKind.js";

export const mapProviderTokenKind = (
  tokenKind: ProviderTokenKind,
): ClipPublishingTokenKind => {
  switch (tokenKind) {
    case "access":
      return "ACCESS";
    case "refresh":
      return "REFRESH";
    case "long-lived-access":
      return "LONG_LIVED_ACCESS";
  }
};

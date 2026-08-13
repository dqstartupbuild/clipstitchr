import { anyApi } from "convex/server";
import { createStudioBetaOperatorClient } from "./createStudioBetaOperatorClient.mjs";
import { getStudioBetaOperatorSecret } from "./getStudioBetaOperatorSecret.mjs";
import { getStudioBetaOwnerIdArgument } from "./getStudioBetaOwnerIdArgument.mjs";

const client = createStudioBetaOperatorClient();
const result = await client.mutation(
  anyApi["studioBetaAccess/grantStudioBetaAccess"].grantStudioBetaAccess,
  {
    ownerId: getStudioBetaOwnerIdArgument(),
    secret: getStudioBetaOperatorSecret(),
  },
);

console.log(
  result.changed
    ? `Studio Beta access granted for ${result.ownerId}.`
    : `Studio Beta access was already active for ${result.ownerId}.`,
);

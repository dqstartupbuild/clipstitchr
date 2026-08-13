import { anyApi } from "convex/server";
import { createStudioBetaOperatorClient } from "./createStudioBetaOperatorClient.mjs";
import { getStudioBetaOperatorSecret } from "./getStudioBetaOperatorSecret.mjs";

const client = createStudioBetaOperatorClient();
const rows = await client.mutation(
  anyApi["studioBetaAccess/listStudioBetaAccess"].listStudioBetaAccess,
  { secret: getStudioBetaOperatorSecret() },
);

if (rows.length === 0) {
  console.log("No Studio Beta access grants found.");
} else {
  console.table(rows);
}

const defaultIndexNowSubmitEndpoint = "https://clipstitchr.com/api/indexnow";
const indexNowSubmitEndpoint =
  process.env.INDEXNOW_SUBMIT_ENDPOINT?.trim() || defaultIndexNowSubmitEndpoint;
const indexNowSubmitSecret = process.env.INDEXNOW_SUBMIT_SECRET?.trim();

if (!indexNowSubmitSecret) {
  console.error(
    "Missing INDEXNOW_SUBMIT_SECRET. Set it in your shell or web/.env.local before running npm run submit:indexnow.",
  );
  process.exit(1);
}

let response;

try {
  response = await fetch(indexNowSubmitEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${indexNowSubmitSecret}`,
    },
  });
} catch (error) {
  console.error(`Unable to reach ${indexNowSubmitEndpoint}.`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
const responseText = await response.text();
let responseBody = responseText;

try {
  responseBody = JSON.parse(responseText);
} catch {
  responseBody = responseText;
}

if (!response.ok) {
  console.error(`IndexNow submission failed with HTTP ${response.status}.`);
  console.error(responseBody);
  process.exit(1);
}

console.log("IndexNow submission request finished.");

if (typeof responseBody === "object" && responseBody !== null) {
  console.log(`Submitted URLs: ${responseBody.submittedUrlCount ?? "unknown"}`);
  console.log(
    `Provider status: ${responseBody.providerStatus ?? "unknown"} ${
      responseBody.providerStatusText ?? ""
    }`.trim(),
  );
}

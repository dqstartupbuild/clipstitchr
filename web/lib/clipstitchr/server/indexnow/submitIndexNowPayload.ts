import type { IndexNowPayload } from "@/lib/clipstitchr/server/indexnow/IndexNowPayload";
import { indexNowEndpoint } from "@/lib/clipstitchr/server/indexnow/indexNowEndpoint";

type IndexNowSubmitResult = {
  body: string;
  ok: boolean;
  status: number;
  statusText: string;
};

export async function submitIndexNowPayload(
  payload: IndexNowPayload,
): Promise<IndexNowSubmitResult> {
  const response = await fetch(indexNowEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = await response.text();

  return {
    body,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  };
}

import { getInstagramGraphApiVersion } from "@/lib/clipstitchr/social/getInstagramGraphApiVersion";
import { readSocialApiResponse } from "../../readSocialApiResponse";
import { readNullableSocialMetricCount } from "../readNullableSocialMetricCount";

export async function fetchInstagramInsightMetric(
  mediaId: string,
  metric: string,
  accessToken: string,
) {
  const url = new URL(
    `https://graph.instagram.com/${getInstagramGraphApiVersion()}/${encodeURIComponent(mediaId)}/insights`,
  );
  url.searchParams.set("metric", metric);
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url);
  const result = await readSocialApiResponse<{
    data?: Array<{
      name?: string;
      values?: Array<{ value?: unknown }>;
      total_value?: { value?: unknown };
    }>;
  }>(response, `Instagram ${metric} is unavailable for this post.`);
  const record = result.data?.find((candidate) => candidate.name === metric);

  return readNullableSocialMetricCount(
    record?.total_value?.value ?? record?.values?.at(-1)?.value,
  );
}

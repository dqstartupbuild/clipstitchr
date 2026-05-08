import type { SwaprPredictionResponse } from "@/lib/clipstitchr/types/SwaprPredictionResponse";

export async function readSwaprPredictionResponse(response: Response) {
  const body = (await response.json()) as SwaprPredictionResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to run Swapr generation.");
  }

  return body;
}

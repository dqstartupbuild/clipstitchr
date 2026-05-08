type R2DeleteObjectsRequest = {
  keys: string[];
};

export async function readR2DeleteObjectsRequest(
  request: Request,
): Promise<R2DeleteObjectsRequest> {
  const body = (await request.json()) as Partial<R2DeleteObjectsRequest>;

  if (!Array.isArray(body.keys)) {
    throw new Error("Missing R2 object keys.");
  }

  const keys = body.keys.filter((key) => typeof key === "string" && key);

  return {
    keys,
  };
}

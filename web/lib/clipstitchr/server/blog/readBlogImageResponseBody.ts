import { assertBlogImageByteLength } from "./assertBlogImageByteLength";

export async function readBlogImageResponseBody(response: Response) {
  if (!response.body) {
    return new ArrayBuffer(0);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    byteLength += value.byteLength;

    try {
      assertBlogImageByteLength(byteLength);
    } catch (error) {
      await reader.cancel();
      throw error;
    }

    chunks.push(value);
  }

  const body = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body.buffer;
}

export function toBlogImageResponseBody(body: Uint8Array) {
  const responseBody = new Uint8Array(body.byteLength);

  responseBody.set(body);

  return responseBody.buffer;
}

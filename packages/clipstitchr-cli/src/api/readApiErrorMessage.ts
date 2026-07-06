export async function readApiErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as {
      error?: string;
      message?: string;
      status?: string;
    };

    return body.message ?? body.error ?? body.status ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

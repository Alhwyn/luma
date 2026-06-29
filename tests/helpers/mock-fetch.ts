type FetchHandler = (
  url: string,
  init?: RequestInit,
) => Response | Promise<Response>;

export const createMockFetch = (handler: FetchHandler): typeof fetch => {
  return async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    return handler(url, init);
  };
};

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

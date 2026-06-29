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

export const captureConsole = () => {
  const logs: string[] = [];
  const errors: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };

  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  };

  return {
    logs,
    errors,
    restore() {
      console.log = originalLog;
      console.error = originalError;
    },
  };
};

export const trackFetch = (handler: FetchHandler) => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  const fetch = createMockFetch((url, init) => {
    calls.push({ url, init });
    return handler(url, init);
  });

  return { fetch, calls };
};

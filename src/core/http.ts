import { createError } from "./errors"; 
import type { ClientOptions, QueryParams } from "./types";

const DEFAULT_BASE_URL = "https://public-api.luma.com";

export const buildUrl = (baseUrl: string, path: string, query?: QueryParams): string => {

  const url = new URL(path, baseUrl);

  if (query) {

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export const createHeaders = (apiKey: string, method: "GET" | "POST"): Headers => {

  const headers = new Headers({
    'x-luma-api-key': apiKey,
  });

  if (method === "POST") {
    headers.set("Content-Type", "application/json");
  }
  
  return headers;
}

export const parseResponse = async <T>(response: Response): Promise<T> => {

  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message = 
      typeof body === "object" && body !== null && "message" in body
      ? String((body as { message: unknown }).message)
      : response.statusText || "Request failed";
    
    throw createError(response.status, message, body);
  }

  return body as T;
}

export interface HttpClientConfig {
  apiKey: string;
  options?: ClientOptions;
}

export const request = async <T>(
  config: HttpClientConfig,
  method: "GET" | "POST",
  path: string,
  opts?: { query?: QueryParams; body?: unknown },
): Promise<T> => {

  const baseUrl = config.options?.baseUrl ?? DEFAULT_BASE_URL;
  const fetchFn = config.options?.fetch ?? fetch;
  const url = buildUrl(baseUrl, path, opts?.query);
  const headers = createHeaders(config.apiKey, method);

  const response = await fetchFn(url, {
    method,
    headers,
    body: method === "POST" && opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  return parseResponse<T>(response);
}
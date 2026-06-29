export type QueryParams =  Record<string, string | number | boolean | undefined>;

export type ClientOptions = {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface RequestOptions {
  query?: QueryParams;
  body?: unknown;
}



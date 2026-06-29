export type QueryParamValue = string | number | boolean;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[] | undefined>;

export type ClientOptions = {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface RequestOptions {
  query?: QueryParams;
  body?: unknown;
}



export interface ListResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ApiListResponse<T> {
  entries: T[];
  has_more?: boolean;
  next_cursor?: string | null;
}

export const mapListResponse = <T>(apiResponse: ApiListResponse<T>): ListResponse<T> => {
  return {
    data: apiResponse.entries,
    hasMore: apiResponse.has_more ?? false,
    nextCursor: apiResponse.next_cursor ?? null,
  };
}
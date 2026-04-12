export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  requestId?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

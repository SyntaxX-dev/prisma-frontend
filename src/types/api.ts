export interface ApiError {
  message: string;
  status?: number;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}




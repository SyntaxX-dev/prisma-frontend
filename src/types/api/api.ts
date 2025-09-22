export interface ApiError {
  message: string;
  status?: number;
  response?: {
    data?: {
      message?: string;
    };
  };
}





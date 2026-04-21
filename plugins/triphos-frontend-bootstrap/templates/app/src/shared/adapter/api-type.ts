export type ApiArgs<P = object, Q = object, D = object> = {
  path?: P;
  params?: Q;
  data?: D;
};

export type AdapterResponseType<TData> = {
  code: number;
  data?: TData | null;
  message: string;
  success: boolean;
  error?: string | string[] | null;
  timestamp?: number;
};

export type SuccessApiResponse<TData> = {
  success: true;
  data?: TData | null;
  message?: string;
  timestamp: number;
};

export type ErrorApiResponse = {
  success: false;
  error: string | string[];
  statusCode: number;
  timestamp: number;
};

export type RawApiResponse<TData> = SuccessApiResponse<TData> | ErrorApiResponse;


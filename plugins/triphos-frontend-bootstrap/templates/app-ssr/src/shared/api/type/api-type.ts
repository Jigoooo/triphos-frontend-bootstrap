export type ApiArgs<P = object, Q = object, D = object> = {
  path?: P;
  params?: Q;
  data?: D;
};

export enum AuthErrorCode {
  UNKNOWN_ERROR = 'C0001',
  NETWORK_ERROR = 'C0002',
  REQUEST_CANCELED = 'C0003',
  SERVICE_UNAVAILABLE = 'C0004',
  INVALID_ACCESS_TOKEN = 'auth.error.token.access.expired',
  INVALID_REFRESH_TOKEN = 'auth.error.token.access.invalid',
  EXPIRED_REFRESH_TOKEN = 'auth.error.token.refresh.expired',
  INVALID_TOKEN = 'auth.error.auth.invalid',
}

export enum DataType {
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  NONE = 'NONE',
}

export type BaseResponseType<TData> = {
  code: number;
  dataType: DataType;
  data?: TData | null;
  message: string;
  success: boolean;
};

export type ApiResponseType<TData> = {
  message: string;
  dataType: DataType;
  errorCode?: AuthErrorCode;
  data?: TData | null;
  isSuccess: boolean;
};

export type AdapterResponseType<TData> = BaseResponseType<TData> & {
  errorCode?: AuthErrorCode;
};

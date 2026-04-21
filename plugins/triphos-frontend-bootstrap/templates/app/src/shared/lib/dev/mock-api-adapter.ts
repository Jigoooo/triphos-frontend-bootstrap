import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

type ErrorPayload = {
  success: false;
  error: string;
  statusCode: number;
  timestamp: number;
};

function createResponse(
  config: InternalAxiosRequestConfig,
  payload: ErrorPayload,
  status: number,
): AxiosResponse<ErrorPayload> {
  return {
    data: payload,
    status,
    statusText: 'Error',
    headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
    config,
    request: undefined,
  };
}

export const mockApiAdapter: AxiosAdapter = async (config) => {
  const payload = {
    success: false as const,
    error: 'VITE_USE_DEV_MOCKS=true but no project-specific mock adapter exists yet.',
    statusCode: 501,
    timestamp: Date.now(),
  };
  const response = createResponse(config as InternalAxiosRequestConfig, payload, 501);

  throw new AxiosError(payload.error, 'ERR_NOT_IMPLEMENTED', config, undefined, response);
};


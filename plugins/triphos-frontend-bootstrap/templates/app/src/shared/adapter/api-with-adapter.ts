import { Adapter } from './adapter';
import type { AdapterResponseType, RawApiResponse } from './api-type';
import { ResponseAdapter } from './response-adapter';

function getStatus(response: unknown): number {
  if (typeof response === 'object' && response !== null && 'status' in response) {
    const { status } = response;
    return typeof status === 'number' ? status : 0;
  }
  return 0;
}

export async function apiWithAdapter<T>(api: Promise<unknown>): Promise<AdapterResponseType<T>> {
  const response = await api;

  return Adapter.from(response).to((item: RawApiResponse<T>) =>
    new ResponseAdapter(item, getStatus(response)).adapt(),
  );
}


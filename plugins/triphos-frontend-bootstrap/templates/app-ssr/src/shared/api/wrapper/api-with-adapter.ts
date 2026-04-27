import { Adapter } from '../adapter/adapter';
import { ResponseAdapter } from '../adapter/response-adapter';
import type { AdapterResponseType, ApiResponseType } from '../type/api-type';

export async function apiWithAdapter<TData>(
  apiPromise: Promise<unknown>,
): Promise<AdapterResponseType<TData>> {
  const response = (await apiPromise) as { status: number } & ApiResponseType<TData>;

  return Adapter.from(response).to((item: ApiResponseType<TData>) =>
    new ResponseAdapter(item).adapt(response.status),
  );
}

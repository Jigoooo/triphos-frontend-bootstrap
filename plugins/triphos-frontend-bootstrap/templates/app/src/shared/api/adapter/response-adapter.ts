import type { AdapterResponseType, ApiResponseType } from '../type/api-type';

export class ResponseAdapter<TData> {
  private readonly value: ApiResponseType<TData>;

  constructor(value: ApiResponseType<TData>) {
    this.value = value;
  }

  adapt(code: number): AdapterResponseType<TData> {
    return {
      code,
      dataType: this.value.dataType,
      message: this.value.message,
      success: this.value.isSuccess,
      ...(this.value.errorCode !== undefined ? { errorCode: this.value.errorCode } : {}),
      ...(this.value.data !== undefined ? { data: this.value.data } : {}),
    };
  }
}

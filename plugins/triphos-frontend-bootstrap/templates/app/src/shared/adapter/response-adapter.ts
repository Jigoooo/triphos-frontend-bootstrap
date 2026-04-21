import type { AdapterResponseType, RawApiResponse } from './api-type';

export class ResponseAdapter<TData> {
  private readonly value: RawApiResponse<TData>;
  private readonly statusCode: number;

  constructor(obj: RawApiResponse<TData>, statusCode: number) {
    this.value = obj;
    this.statusCode = statusCode;
  }

  adapt(): AdapterResponseType<TData> {
    if (this.value.success === false) {
      const errors = Array.isArray(this.value.error) ? this.value.error : [this.value.error];

      return {
        code: this.statusCode,
        success: false,
        message: errors.join(', '),
        error: this.value.error,
        timestamp: this.value.timestamp,
      };
    }

    return {
      code: this.statusCode,
      success: true,
      message: this.value.message ?? 'Success',
      ...(this.value.data !== undefined ? { data: this.value.data } : {}),
      timestamp: this.value.timestamp,
    };
  }
}

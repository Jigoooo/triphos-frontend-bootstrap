import { queryOptions } from '@tanstack/react-query';

import { memberKeys } from './query-keys';
import { memberApi } from '../api/member-api';

export const memberQueryOptions = {
  me: () =>
    queryOptions({
      ...memberKeys.me,
      queryFn: async () => {
        const response = await memberApi.getMe();
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data ?? null;
      },
    }),
};

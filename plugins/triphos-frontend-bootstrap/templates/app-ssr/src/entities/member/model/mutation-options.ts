import { mutationOptions, type QueryClient } from '@tanstack/react-query';

import type { UpdateMeRequest } from './me-type';
import { memberKeys } from './query-keys';
import { memberApi } from '../api/member-api';

export const memberMutationOptions = {
  updateMe: (queryClient?: QueryClient) =>
    mutationOptions({
      mutationKey: ['member', 'update-me'],
      mutationFn: (data: UpdateMeRequest) => memberApi.updateMe(data),
      onSuccess: () => {
        if (!queryClient) return;
        void queryClient.invalidateQueries({ queryKey: memberKeys._def });
      },
    }),
};

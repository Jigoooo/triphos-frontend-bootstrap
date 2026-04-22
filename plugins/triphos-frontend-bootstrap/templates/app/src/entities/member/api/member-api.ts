import { api } from '@jigoooo/api-client';

import type { Me, UpdateMeRequest } from '../model/me-type';
import { apiWithAdapter } from '@/shared/api';

const MEMBER_PATH = '/member/me';

export const memberApi = {
  getMe: () => apiWithAdapter<Me>(api.get(MEMBER_PATH)),
  updateMe: (data: UpdateMeRequest) => apiWithAdapter<Me>(api.patch(MEMBER_PATH, data)),
};

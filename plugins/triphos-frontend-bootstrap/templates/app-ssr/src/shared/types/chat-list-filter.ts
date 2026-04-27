export enum ChatListFilter {
  All = 'all',
  Unread = 'unread',
  Group = 'group',
}

export const CHAT_LIST_FILTERS = [ChatListFilter.All, ChatListFilter.Unread, ChatListFilter.Group];

export const CHAT_LIST_FILTER_LABELS: Record<ChatListFilter, string> = {
  [ChatListFilter.All]: '전체',
  [ChatListFilter.Unread]: '읽지 않음',
  [ChatListFilter.Group]: '그룹',
};


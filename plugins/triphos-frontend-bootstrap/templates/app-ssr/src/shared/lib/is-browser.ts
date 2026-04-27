export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export const noopStorage: Storage = {
  length: 0,
  clear() {},
  getItem() {
    return null;
  },
  key() {
    return null;
  },
  removeItem() {},
  setItem() {},
};

export type Me = {
  id?: string;
  name?: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
};

export type UpdateMeRequest = Partial<Pick<Me, 'name' | 'email'>> & Record<string, unknown>;

export type MeState = {
  me: Me | null;
};

export type MeStore = MeState & {
  actions: {
    setMe: (me: Me) => void;
    getMe: () => Me | null;
    reset: () => void;
  };
};
